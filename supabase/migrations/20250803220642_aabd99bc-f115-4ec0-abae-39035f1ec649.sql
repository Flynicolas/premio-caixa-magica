-- Verificar e corrigir tabelas de raspadinha
-- Atualizar tabela scratch_card_financial_control para ter RLS apropriada
ALTER TABLE public.scratch_card_financial_control DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage scratch financial control" ON public.scratch_card_financial_control;

-- Recriar com política correta
ALTER TABLE public.scratch_card_financial_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage scratch financial control" 
ON public.scratch_card_financial_control 
FOR ALL
USING (true)
WITH CHECK (true);

-- Adicionar colunas necessárias se não existirem
ALTER TABLE public.scratch_card_financial_control 
ADD COLUMN IF NOT EXISTS budget_percentage NUMERIC DEFAULT 0.15;

-- Criar tabela para histórico de jogadas de raspadinha
CREATE TABLE IF NOT EXISTS public.scratch_card_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scratch_type TEXT NOT NULL,
  amount_paid NUMERIC NOT NULL,
  symbols JSONB NOT NULL,
  has_win BOOLEAN NOT NULL DEFAULT false,
  winning_item_id UUID REFERENCES public.items(id),
  winning_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.scratch_card_games ENABLE ROW LEVEL SECURITY;

-- Políticas para scratch_card_games
CREATE POLICY "Users can view their own scratch games" 
ON public.scratch_card_games 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create scratch games" 
ON public.scratch_card_games 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update scratch games" 
ON public.scratch_card_games 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can view all scratch games" 
ON public.scratch_card_games 
FOR ALL
USING (is_admin_user());

-- Criar tabela para controle de orçamento diário de raspadinha
CREATE TABLE IF NOT EXISTS public.scratch_card_daily_budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scratch_type TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sales NUMERIC NOT NULL DEFAULT 0,
  total_prizes_given NUMERIC NOT NULL DEFAULT 0,
  remaining_budget NUMERIC NOT NULL DEFAULT 0,
  budget_percentage NUMERIC NOT NULL DEFAULT 0.15,
  games_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(scratch_type, date)
);

-- RLS para budget diário
ALTER TABLE public.scratch_card_daily_budget ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage daily budget" 
ON public.scratch_card_daily_budget 
FOR ALL
USING (true)
WITH CHECK (true);

-- Função para processar jogada de raspadinha
CREATE OR REPLACE FUNCTION public.process_scratch_card_game(
  p_user_id UUID,
  p_scratch_type TEXT,
  p_game_price NUMERIC,
  p_symbols JSONB,
  p_has_win BOOLEAN DEFAULT FALSE,
  p_winning_item_id UUID DEFAULT NULL,
  p_winning_amount NUMERIC DEFAULT 0
) RETURNS TABLE(
  game_id UUID,
  wallet_balance NUMERIC,
  success BOOLEAN,
  message TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_wallet_id UUID;
  current_balance NUMERIC;
  new_game_id UUID;
  daily_budget_remaining NUMERIC;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Verificar se usuário tem carteira e saldo suficiente
  SELECT id, balance INTO user_wallet_id, current_balance
  FROM public.user_wallets
  WHERE user_id = p_user_id;

  IF user_wallet_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, 0::NUMERIC, FALSE, 'Carteira não encontrada';
    RETURN;
  END IF;

  IF current_balance < p_game_price THEN
    RETURN QUERY SELECT NULL::UUID, current_balance, FALSE, 'Saldo insuficiente';
    RETURN;
  END IF;

  -- Verificar orçamento diário para prêmios
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

  -- Se é uma vitória mas não há orçamento, converter em não-vitória
  IF p_has_win AND p_winning_amount > daily_budget_remaining THEN
    p_has_win := FALSE;
    p_winning_item_id := NULL;
    p_winning_amount := 0;
  END IF;

  -- Debitar saldo da carteira
  UPDATE public.user_wallets
  SET 
    balance = balance - p_game_price,
    total_spent = total_spent + p_game_price,
    updated_at = now()
  WHERE id = user_wallet_id;

  -- Criar transação de compra
  INSERT INTO public.wallet_transactions (
    user_id, wallet_id, amount, type, description, metadata
  ) VALUES (
    p_user_id, user_wallet_id, -p_game_price, 'scratch_purchase',
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
    IF EXISTS (
      SELECT 1 FROM public.items 
      WHERE id = p_winning_item_id AND category = 'dinheiro'
    ) THEN
      UPDATE public.user_wallets
      SET 
        balance = balance + p_winning_amount,
        total_deposited = total_deposited + p_winning_amount,
        updated_at = now()
      WHERE id = user_wallet_id;

      -- Criar transação de prêmio
      INSERT INTO public.wallet_transactions (
        user_id, wallet_id, amount, type, description, metadata
      ) VALUES (
        p_user_id, user_wallet_id, p_winning_amount, 'scratch_prize',
        'Prêmio em dinheiro da raspadinha',
        jsonb_build_object(
          'scratch_type', p_scratch_type,
          'game_id', new_game_id,
          'item_id', p_winning_item_id
        )
      );
    END IF;
  END IF;

  -- Atualizar orçamento diário
  UPDATE public.scratch_card_daily_budget
  SET 
    total_sales = total_sales + p_game_price,
    total_prizes_given = total_prizes_given + COALESCE(p_winning_amount, 0),
    remaining_budget = remaining_budget + (p_game_price * budget_percentage) - COALESCE(p_winning_amount, 0),
    games_played = games_played + 1,
    updated_at = now()
  WHERE scratch_type = p_scratch_type AND date = today_date;

  -- Atualizar controle financeiro geral
  INSERT INTO public.scratch_card_financial_control (
    scratch_type, date, total_sales, total_prizes_given, 
    cards_played, net_profit, remaining_budget
  ) VALUES (
    p_scratch_type, today_date, p_game_price, COALESCE(p_winning_amount, 0),
    1, p_game_price - COALESCE(p_winning_amount, 0), daily_budget_remaining
  )
  ON CONFLICT (scratch_type, date) DO UPDATE SET
    total_sales = scratch_card_financial_control.total_sales + p_game_price,
    total_prizes_given = scratch_card_financial_control.total_prizes_given + COALESCE(p_winning_amount, 0),
    cards_played = scratch_card_financial_control.cards_played + 1,
    net_profit = scratch_card_financial_control.net_profit + (p_game_price - COALESCE(p_winning_amount, 0)),
    updated_at = now();

  -- Retornar resultado
  SELECT balance INTO current_balance FROM public.user_wallets WHERE id = user_wallet_id;
  RETURN QUERY SELECT new_game_id, current_balance, TRUE, 'Jogo processado com sucesso';
END;
$$;