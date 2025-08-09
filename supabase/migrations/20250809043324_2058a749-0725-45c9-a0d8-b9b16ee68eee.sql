-- Update the RPC function to ensure atomic balance operations and fix money category detection
CREATE OR REPLACE FUNCTION public.process_scratch_card_game(
  p_user_id uuid, 
  p_scratch_type text, 
  p_game_price numeric, 
  p_symbols jsonb, 
  p_has_win boolean DEFAULT false, 
  p_winning_item_id uuid DEFAULT NULL::uuid, 
  p_winning_amount numeric DEFAULT 0
)
RETURNS TABLE(game_id uuid, wallet_balance numeric, success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_wallet_id UUID;
  current_balance NUMERIC;
  new_game_id UUID;
  daily_budget_remaining NUMERIC;
  today_date DATE := CURRENT_DATE;
  is_money_item BOOLEAN := FALSE;
BEGIN
  -- Get user wallet with row lock to prevent concurrent modifications
  SELECT id, balance INTO user_wallet_id, current_balance
  FROM public.user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF user_wallet_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, 0::NUMERIC, FALSE, 'Carteira não encontrada';
    RETURN;
  END IF;

  -- Check sufficient balance ATOMICALLY
  IF current_balance < p_game_price THEN
    RETURN QUERY SELECT NULL::UUID, current_balance, FALSE, 'Saldo insuficiente';
    RETURN;
  END IF;

  -- Check if winning item is money category (both 'dinheiro' and 'money')
  IF p_has_win AND p_winning_item_id IS NOT NULL THEN
    SELECT (category = 'dinheiro' OR category = 'money') INTO is_money_item
    FROM public.items
    WHERE id = p_winning_item_id;
  END IF;

  -- Verificar orçamento diário para prêmios em dinheiro
  SELECT remaining_budget INTO daily_budget_remaining
  FROM public.scratch_card_daily_budget
  WHERE scratch_type = p_scratch_type AND date = today_date;

  -- Se não existe registro do dia, criar
  IF daily_budget_remaining IS NULL THEN
    INSERT INTO public.scratch_card_daily_budget (
      scratch_type, date, remaining_budget, budget_percentage
    ) VALUES (
      p_scratch_type, today_date, p_game_price * 0.15, 0.15
    );
    daily_budget_remaining := p_game_price * 0.15;
  END IF;

  -- Se é uma vitória de dinheiro mas não há orçamento, converter em não-vitória
  IF p_has_win AND is_money_item AND p_winning_amount > daily_budget_remaining THEN
    p_has_win := FALSE;
    p_winning_item_id := NULL;
    p_winning_amount := 0;
    is_money_item := FALSE;
  END IF;

  -- Debitar saldo da carteira ATOMICALLY
  UPDATE public.user_wallets
  SET 
    balance = balance - p_game_price,
    total_spent = total_spent + p_game_price,
    updated_at = now()
  WHERE id = user_wallet_id;

  -- Get updated balance
  SELECT balance INTO current_balance FROM public.user_wallets WHERE id = user_wallet_id;

  -- Criar transação de compra
  INSERT INTO public.wallet_transactions (
    user_id, wallet_id, amount, type, description, metadata
  ) VALUES (
    p_user_id, user_wallet_id, -p_game_price, 'purchase',
    'Compra de raspadinha ' || p_scratch_type,
    jsonb_build_object('scratch_type', p_scratch_type)
  );

  -- Registrar jogo
  INSERT INTO public.scratch_card_games (
    user_id, scratch_type, amount_paid, symbols, has_win, 
    winning_item_id, winning_amount, processed_at
  ) VALUES (
    p_user_id, p_scratch_type, p_game_price, p_symbols, p_has_win,
    p_winning_item_id, p_winning_amount, now()
  ) RETURNING id INTO new_game_id;

  -- Se ganhou, processar prêmio
  IF p_has_win AND p_winning_item_id IS NOT NULL THEN
    -- Adicionar ao inventário
    INSERT INTO public.user_inventory (
      user_id, item_id, chest_type, rarity, won_at
    ) 
    SELECT 
      p_user_id, p_winning_item_id, 'scratch_' || p_scratch_type, 
      i.rarity, now()
    FROM public.items i 
    WHERE i.id = p_winning_item_id;

    -- Se é item de dinheiro, adicionar à carteira
    IF is_money_item AND p_winning_amount > 0 THEN
      UPDATE public.user_wallets
      SET 
        balance = balance + p_winning_amount,
        total_deposited = total_deposited + p_winning_amount,
        updated_at = now()
      WHERE id = user_wallet_id;

      -- Get updated balance after prize
      SELECT balance INTO current_balance FROM public.user_wallets WHERE id = user_wallet_id;

      -- Criar transação de prêmio
      INSERT INTO public.wallet_transactions (
        user_id, wallet_id, amount, type, description, metadata
      ) VALUES (
        p_user_id, user_wallet_id, p_winning_amount, 'deposit',
        'Prêmio em dinheiro da raspadinha',
        jsonb_build_object(
          'scratch_type', p_scratch_type,
          'game_id', new_game_id,
          'item_id', p_winning_item_id
        )
      );
    END IF;
  END IF;

  -- Atualizar orçamento diário (only debit for money prizes)
  UPDATE public.scratch_card_daily_budget
  SET 
    total_sales = total_sales + p_game_price,
    total_prizes_given = total_prizes_given + (CASE WHEN is_money_item THEN COALESCE(p_winning_amount, 0) ELSE 0 END),
    remaining_budget = remaining_budget + (p_game_price * budget_percentage) - (CASE WHEN is_money_item THEN COALESCE(p_winning_amount, 0) ELSE 0 END),
    games_played = games_played + 1,
    updated_at = now()
  WHERE scratch_type = p_scratch_type AND date = today_date;

  -- Atualizar controle financeiro geral
  INSERT INTO public.scratch_card_financial_control (
    scratch_type, date, total_sales, total_prizes_given, 
    cards_played, net_profit, remaining_budget
  ) VALUES (
    p_scratch_type, today_date, p_game_price, (CASE WHEN is_money_item THEN COALESCE(p_winning_amount, 0) ELSE 0 END),
    1, p_game_price - (CASE WHEN is_money_item THEN COALESCE(p_winning_amount, 0) ELSE 0 END), daily_budget_remaining
  )
  ON CONFLICT (scratch_type, date) DO UPDATE SET
    total_sales = scratch_card_financial_control.total_sales + p_game_price,
    total_prizes_given = scratch_card_financial_control.total_prizes_given + (CASE WHEN is_money_item THEN COALESCE(p_winning_amount, 0) ELSE 0 END),
    cards_played = scratch_card_financial_control.cards_played + 1,
    net_profit = scratch_card_financial_control.net_profit + (p_game_price - (CASE WHEN is_money_item THEN COALESCE(p_winning_amount, 0) ELSE 0 END)),
    updated_at = now();

  -- Retornar resultado
  RETURN QUERY SELECT new_game_id, current_balance, TRUE, 'Jogo processado com sucesso';
END;
$function$;