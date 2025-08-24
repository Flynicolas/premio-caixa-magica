-- FASE 2: Criar funções RPC para o sistema 90/10 com controle RTP

-- Função principal para jogar raspadinha com RTP
CREATE OR REPLACE FUNCTION public.play_scratch_rtp(
    p_user_id uuid,
    p_scratch_type text,
    p_game_price numeric,
    p_symbols jsonb
) RETURNS TABLE(
    game_id uuid,
    wallet_balance numeric,
    success boolean,
    message text,
    has_win boolean,
    winning_item_id uuid,
    winning_amount numeric,
    rtp_controlled boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_wallet_id UUID;
    current_balance NUMERIC;
    new_game_id UUID;
    rtp_settings RECORD;
    pot_balance NUMERIC := 0;
    target_rtp NUMERIC := 0.90;
    current_rtp NUMERIC := 0;
    should_win BOOLEAN := false;
    selected_prize RECORD;
    is_rtp_enabled BOOLEAN := false;
BEGIN
    -- Verificar se RTP está habilitado para este tipo de raspadinha
    SELECT rtp_enabled INTO is_rtp_enabled
    FROM public.scratch_card_settings
    WHERE scratch_type = p_scratch_type;
    
    IF NOT FOUND THEN
        is_rtp_enabled := false;
    END IF;

    -- Se RTP não estiver habilitado, usar função original
    IF NOT is_rtp_enabled THEN
        -- Chamar função original process_scratch_card_game
        RETURN QUERY
        SELECT 
            pcg.game_id,
            pcg.wallet_balance,
            pcg.success,
            pcg.message,
            false as has_win,
            NULL::uuid as winning_item_id,
            0::numeric as winning_amount,
            false as rtp_controlled
        FROM public.process_scratch_card_game(
            p_user_id, p_scratch_type, p_game_price, p_symbols
        ) pcg;
        RETURN;
    END IF;

    -- Get user wallet with row lock
    SELECT id, balance INTO user_wallet_id, current_balance
    FROM public.user_wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF user_wallet_id IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, 0::NUMERIC, false, 'Carteira não encontrada', false, NULL::uuid, 0::numeric, true;
        RETURN;
    END IF;

    -- Check sufficient balance
    IF current_balance < p_game_price THEN
        RETURN QUERY SELECT NULL::UUID, current_balance, false, 'Saldo insuficiente', false, NULL::uuid, 0::numeric, true;
        RETURN;
    END IF;

    -- Obter/criar pot RTP para este tipo
    SELECT pot_balance, target_rtp INTO pot_balance, target_rtp
    FROM public.rtp_pots
    WHERE scratch_type = p_scratch_type;
    
    IF NOT FOUND THEN
        INSERT INTO public.rtp_pots (scratch_type, pot_balance, target_rtp)
        VALUES (p_scratch_type, 0, 0.90)
        RETURNING pot_balance, target_rtp INTO pot_balance, target_rtp;
    END IF;

    -- Calcular RTP atual
    SELECT 
        CASE 
            WHEN COALESCE(SUM(bet), 0) = 0 THEN 0
            ELSE COALESCE(SUM(prize), 0) / COALESCE(SUM(bet), 1)
        END
    INTO current_rtp
    FROM public.game_rounds
    WHERE game_type = p_scratch_type;

    -- Determinar se deve ganhar baseado no RTP
    should_win := (current_rtp < target_rtp) OR (pot_balance >= p_game_price * 2);

    -- Debitar saldo da carteira
    UPDATE public.user_wallets
    SET 
        balance = balance - p_game_price,
        total_spent = total_spent + p_game_price,
        updated_at = now()
    WHERE id = user_wallet_id;

    -- Get updated balance
    SELECT balance INTO current_balance FROM public.user_wallets WHERE id = user_wallet_id;

    -- Atualizar pot
    UPDATE public.rtp_pots
    SET 
        pot_balance = pot_balance + (p_game_price * 0.10), -- 10% vai para o pot
        total_bets = total_bets + p_game_price,
        updated_at = now()
    WHERE scratch_type = p_scratch_type;

    -- Selecionar prêmio se deve ganhar
    IF should_win THEN
        SELECT * INTO selected_prize
        FROM public.scratch_prizes
        WHERE scratch_type = p_scratch_type 
        AND is_active = true
        AND (max_daily_awards IS NULL OR daily_awards_given < max_daily_awards)
        ORDER BY RANDOM()
        LIMIT 1;
        
        IF FOUND THEN
            -- Atualizar contadores do prêmio
            UPDATE public.scratch_prizes
            SET 
                daily_awards_given = daily_awards_given + 1,
                total_awards_given = total_awards_given + 1,
                updated_at = now()
            WHERE id = selected_prize.id;

            -- Atualizar pot
            UPDATE public.rtp_pots
            SET 
                pot_balance = pot_balance - selected_prize.prize_value,
                total_prizes = total_prizes + selected_prize.prize_value
            WHERE scratch_type = p_scratch_type;

            -- Adicionar saldo se for prêmio em dinheiro
            IF selected_prize.prize_type = 'money' THEN
                UPDATE public.user_wallets
                SET 
                    balance = balance + selected_prize.prize_value,
                    total_deposited = total_deposited + selected_prize.prize_value,
                    updated_at = now()
                WHERE id = user_wallet_id;

                -- Get updated balance after prize
                SELECT balance INTO current_balance FROM public.user_wallets WHERE id = user_wallet_id;

                -- Criar transação de prêmio
                INSERT INTO public.wallet_transactions (
                    user_id, wallet_id, amount_cents, type, description, metadata
                ) VALUES (
                    p_user_id, user_wallet_id, ROUND(selected_prize.prize_value * 100), 'deposit',
                    'Prêmio RTP da raspadinha ' || p_scratch_type,
                    jsonb_build_object(
                        'scratch_type', p_scratch_type,
                        'prize_id', selected_prize.id,
                        'rtp_controlled', true
                    )
                );
            END IF;
        END IF;
    END IF;

    -- Registrar rodada no game_rounds
    INSERT INTO public.game_rounds (
        user_id, game_type, bet, prize, meta
    ) VALUES (
        p_user_id, 
        p_scratch_type, 
        p_game_price, 
        COALESCE(selected_prize.prize_value, 0),
        jsonb_build_object(
            'symbols', p_symbols,
            'rtp_controlled', true,
            'should_win', should_win,
            'current_rtp', current_rtp,
            'target_rtp', target_rtp,
            'prize_id', selected_prize.id
        )
    ) RETURNING id INTO new_game_id;

    -- Criar transação de compra
    INSERT INTO public.wallet_transactions (
        user_id, wallet_id, amount_cents, type, description, metadata
    ) VALUES (
        p_user_id, user_wallet_id, -ROUND(p_game_price * 100), 'purchase',
        'Compra RTP raspadinha ' || p_scratch_type,
        jsonb_build_object('scratch_type', p_scratch_type, 'rtp_controlled', true)
    );

    -- Retornar resultado
    RETURN QUERY SELECT 
        new_game_id,
        current_balance,
        true,
        'Jogo processado com sucesso (RTP)',
        (selected_prize.id IS NOT NULL),
        selected_prize.item_id,
        COALESCE(selected_prize.prize_value, 0),
        true;
END;
$function$;

-- Função para transação de cliente (integração futura)
CREATE OR REPLACE FUNCTION public.scratch_play_tx(
    p_user_id uuid,
    p_client_tx_id text,
    p_scratch_type text,
    p_game_price numeric,
    p_symbols jsonb
) RETURNS TABLE(
    success boolean,
    message text,
    client_tx_id text,
    server_result jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    game_result RECORD;
    result_data JSONB;
BEGIN
    -- Verificar se transação já foi processada
    IF EXISTS (
        SELECT 1 FROM public.client_transactions 
        WHERE client_tx_id = p_client_tx_id AND user_id = p_user_id
    ) THEN
        -- Retornar resultado existente
        SELECT result INTO result_data
        FROM public.client_transactions
        WHERE client_tx_id = p_client_tx_id AND user_id = p_user_id;
        
        RETURN QUERY SELECT true, 'Transação já processada', p_client_tx_id, result_data;
        RETURN;
    END IF;

    -- Processar jogo via RTP
    SELECT * INTO game_result
    FROM public.play_scratch_rtp(p_user_id, p_scratch_type, p_game_price, p_symbols);
    
    -- Compilar resultado
    result_data := jsonb_build_object(
        'game_id', game_result.game_id,
        'wallet_balance', game_result.wallet_balance,
        'has_win', game_result.has_win,
        'winning_item_id', game_result.winning_item_id,
        'winning_amount', game_result.winning_amount,
        'rtp_controlled', game_result.rtp_controlled,
        'processed_at', now()
    );

    -- Registrar transação do cliente
    INSERT INTO public.client_transactions (
        user_id, client_tx_id, game_type, status, result
    ) VALUES (
        p_user_id, p_client_tx_id, p_scratch_type, 'completed', result_data
    );

    -- Retornar resultado
    RETURN QUERY SELECT 
        game_result.success,
        game_result.message,
        p_client_tx_id,
        result_data;
END;
$function$;