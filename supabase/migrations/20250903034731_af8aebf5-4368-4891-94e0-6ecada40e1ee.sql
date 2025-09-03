-- Fix play_scratch_rtp function - avoid RECORD[] issue
CREATE OR REPLACE FUNCTION public.play_scratch_rtp(p_user_id uuid, p_scratch_type text, p_game_price numeric, p_symbols jsonb)
 RETURNS TABLE(game_id uuid, wallet_balance numeric, success boolean, message text, has_win boolean, winning_item_id uuid, winning_amount numeric, rtp_controlled boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    user_wallet_id UUID;
    current_balance NUMERIC;
    new_game_id UUID;
    pot_balance NUMERIC := 0;
    target_rtp NUMERIC := 0;
    pot_deposit NUMERIC := 0;
    should_win BOOLEAN := false;
    selected_prize RECORD;
    is_rtp_enabled BOOLEAN := false;
BEGIN
    -- Check if RTP is enabled for this scratch type
    SELECT rtp_enabled, target_rtp INTO is_rtp_enabled, target_rtp
    FROM public.scratch_card_settings
    WHERE scratch_type = p_scratch_type;
    
    IF NOT FOUND THEN
        is_rtp_enabled := false;
        target_rtp := 0;
    END IF;

    -- If RTP disabled, no wins allowed
    IF NOT is_rtp_enabled OR target_rtp = 0 THEN
        -- Get user wallet
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

        -- Debit wallet
        UPDATE public.user_wallets
        SET balance = balance - p_game_price,
            total_spent = total_spent + p_game_price,
            updated_at = now()
        WHERE id = user_wallet_id;

        SELECT balance INTO current_balance FROM public.user_wallets WHERE id = user_wallet_id;

        -- Record game round (no win)
        INSERT INTO public.game_rounds (user_id, game_type, bet, prize, meta)
        VALUES (p_user_id, p_scratch_type, p_game_price, 0, 
                jsonb_build_object('rtp_controlled', true, 'rtp_enabled', false));

        -- Create purchase transaction
        INSERT INTO public.wallet_transactions (
            user_id, wallet_id, amount_cents, type, description, metadata
        ) VALUES (
            p_user_id, user_wallet_id, -ROUND(p_game_price * 100), 'purchase',
            'Compra raspadinha ' || p_scratch_type,
            jsonb_build_object('scratch_type', p_scratch_type, 'rtp_controlled', true)
        );

        RETURN QUERY SELECT NULL::UUID, current_balance, true, 'Jogo processado (RTP desabilitado)', false, NULL::uuid, 0::numeric, true;
        RETURN;
    END IF;

    -- Get user wallet with lock
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

    -- Get/create RTP pot
    SELECT pot_balance INTO pot_balance
    FROM public.rtp_pots
    WHERE scratch_type = p_scratch_type;
    
    IF NOT FOUND THEN
        INSERT INTO public.rtp_pots (scratch_type, pot_balance, target_rtp)
        VALUES (p_scratch_type, 0, target_rtp)
        RETURNING pot_balance INTO pot_balance;
    END IF;

    -- Calculate pot deposit based on target RTP
    pot_deposit := p_game_price * (target_rtp / 100.0);

    -- Debit wallet
    UPDATE public.user_wallets
    SET balance = balance - p_game_price,
        total_spent = total_spent + p_game_price,
        updated_at = now()
    WHERE id = user_wallet_id;

    SELECT balance INTO current_balance FROM public.user_wallets WHERE id = user_wallet_id;

    -- Update pot: add deposit from this bet
    UPDATE public.rtp_pots
    SET pot_balance = pot_balance + pot_deposit,
        total_bets = total_bets + p_game_price,
        updated_at = now()
    WHERE scratch_type = p_scratch_type;

    -- Get updated pot balance
    SELECT pot_balance INTO pot_balance FROM public.rtp_pots WHERE scratch_type = p_scratch_type;

    -- Determine if should win: only if pot has enough balance
    should_win := pot_balance >= 1.00; -- Minimum 1 real to allow wins

    IF should_win THEN
        -- Select a random prize that fits in pot
        SELECT * INTO selected_prize
        FROM public.scratch_prizes sp
        WHERE sp.scratch_type = p_scratch_type 
        AND sp.is_active = true
        AND sp.prize_value <= pot_balance
        AND (sp.max_daily_awards IS NULL OR sp.daily_awards_given < sp.max_daily_awards)
        ORDER BY RANDOM()
        LIMIT 1;
        
        IF FOUND THEN
            -- Update prize counters
            UPDATE public.scratch_prizes
            SET daily_awards_given = daily_awards_given + 1,
                total_awards_given = total_awards_given + 1,
                updated_at = now()
            WHERE id = selected_prize.id;

            -- Deduct from pot
            UPDATE public.rtp_pots
            SET pot_balance = pot_balance - selected_prize.prize_value,
                total_prizes = total_prizes + selected_prize.prize_value
            WHERE scratch_type = p_scratch_type;

            -- Add to wallet if money prize
            IF selected_prize.prize_type = 'money' THEN
                UPDATE public.user_wallets
                SET balance = balance + selected_prize.prize_value,
                    total_deposited = total_deposited + selected_prize.prize_value,
                    updated_at = now()
                WHERE id = user_wallet_id;

                SELECT balance INTO current_balance FROM public.user_wallets WHERE id = user_wallet_id;

                -- Create prize transaction
                INSERT INTO public.wallet_transactions (
                    user_id, wallet_id, amount_cents, type, description, metadata
                ) VALUES (
                    p_user_id, user_wallet_id, ROUND(selected_prize.prize_value * 100), 'deposit',
                    'Prêmio RTP raspadinha ' || p_scratch_type,
                    jsonb_build_object('scratch_type', p_scratch_type, 'prize_id', selected_prize.id, 'rtp_controlled', true)
                );
            END IF;
        ELSE
            should_win := false;
        END IF;
    END IF;

    -- Record game round
    INSERT INTO public.game_rounds (user_id, game_type, bet, prize, meta)
    VALUES (p_user_id, p_scratch_type, p_game_price, 
            COALESCE(selected_prize.prize_value, 0),
            jsonb_build_object(
                'symbols', p_symbols,
                'rtp_controlled', true,
                'should_win', should_win,
                'target_rtp', target_rtp,
                'pot_balance_before', pot_balance + COALESCE(selected_prize.prize_value, 0) - pot_deposit,
                'pot_balance_after', pot_balance,
                'prize_id', selected_prize.id
            ))
    RETURNING id INTO new_game_id;

    -- Create purchase transaction
    INSERT INTO public.wallet_transactions (
        user_id, wallet_id, amount_cents, type, description, metadata
    ) VALUES (
        p_user_id, user_wallet_id, -ROUND(p_game_price * 100), 'purchase',
        'Compra RTP raspadinha ' || p_scratch_type,
        jsonb_build_object('scratch_type', p_scratch_type, 'rtp_controlled', true)
    );

    -- Return result
    RETURN QUERY SELECT 
        new_game_id,
        current_balance,
        true,
        'Jogo processado com RTP',
        (selected_prize.id IS NOT NULL),
        selected_prize.item_id,
        COALESCE(selected_prize.prize_value, 0),
        true;
END;
$function$;