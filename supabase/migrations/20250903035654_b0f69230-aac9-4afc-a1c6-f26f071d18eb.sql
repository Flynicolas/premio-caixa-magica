-- Fix RTP system to work with actual table structures
-- First, let's update the RTP function to work with actual table columns

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
    rtp_target NUMERIC := 0;
    pot_deposit NUMERIC := 0;
    should_win BOOLEAN := false;
    selected_prize RECORD;
    is_rtp_enabled BOOLEAN := false;
    pot_available NUMERIC := 0;
BEGIN
    -- Check if RTP is enabled and get target
    SELECT rtp_enabled, target_rtp INTO is_rtp_enabled, rtp_target
    FROM public.scratch_card_settings
    WHERE scratch_type = p_scratch_type;
    
    IF NOT FOUND THEN
        is_rtp_enabled := false;
        rtp_target := 0;
    END IF;

    -- If RTP disabled, no wins allowed
    IF NOT is_rtp_enabled OR rtp_target = 0 THEN
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

    -- Calculate pot deposit based on target RTP
    pot_deposit := p_game_price * (rtp_target / 100.0);

    -- Get current pot available (total_bet * rtp_target - total_paid)
    SELECT GREATEST(0, (total_bet * rtp_target / 100.0) - total_paid) INTO pot_available
    FROM public.rtp_pots
    WHERE game_type = p_scratch_type;
    
    -- If no record, create one
    IF NOT FOUND THEN
        INSERT INTO public.rtp_pots (game_type, rtp_target, cap_enabled, cap_value, total_bet, total_paid, is_active)
        VALUES (p_scratch_type, rtp_target, true, 1000.00, 0, 0, true);
        pot_available := 0;
    END IF;

    -- Debit wallet
    UPDATE public.user_wallets
    SET balance = balance - p_game_price,
        total_spent = total_spent + p_game_price,
        updated_at = now()
    WHERE id = user_wallet_id;

    SELECT balance INTO current_balance FROM public.user_wallets WHERE id = user_wallet_id;

    -- Update pot: add new bet
    UPDATE public.rtp_pots
    SET total_bet = total_bet + p_game_price,
        updated_at = now()
    WHERE game_type = p_scratch_type;

    -- Recalculate pot available after bet
    pot_available := pot_available + pot_deposit;

    -- Determine if should win: only if pot has enough balance
    should_win := pot_available >= 1.00; -- Minimum 1 real to allow wins

    IF should_win THEN
        -- Select a random prize that fits in pot using scratch_prizes table structure
        SELECT * INTO selected_prize
        FROM public.scratch_prizes sp
        WHERE sp.game_type = p_scratch_type 
        AND sp.is_active = true
        AND sp.value <= pot_available
        ORDER BY RANDOM()
        LIMIT 1;
        
        IF FOUND THEN
            -- Update RTP pot: add prize paid
            UPDATE public.rtp_pots
            SET total_paid = total_paid + selected_prize.value
            WHERE game_type = p_scratch_type;

            -- Add to wallet (money prize)
            UPDATE public.user_wallets
            SET balance = balance + selected_prize.value,
                total_deposited = total_deposited + selected_prize.value,
                updated_at = now()
            WHERE id = user_wallet_id;

            SELECT balance INTO current_balance FROM public.user_wallets WHERE id = user_wallet_id;

            -- Create prize transaction
            INSERT INTO public.wallet_transactions (
                user_id, wallet_id, amount_cents, type, description, metadata
            ) VALUES (
                p_user_id, user_wallet_id, ROUND(selected_prize.value * 100), 'deposit',
                'Prêmio RTP raspadinha ' || p_scratch_type,
                jsonb_build_object('scratch_type', p_scratch_type, 'prize_name', selected_prize.name, 'rtp_controlled', true)
            );
        ELSE
            should_win := false;
        END IF;
    END IF;

    -- Record game round
    INSERT INTO public.game_rounds (user_id, game_type, bet, prize, meta)
    VALUES (p_user_id, p_scratch_type, p_game_price, 
            COALESCE(selected_prize.value, 0),
            jsonb_build_object(
                'symbols', p_symbols,
                'rtp_controlled', true,
                'should_win', should_win,
                'target_rtp', rtp_target,
                'pot_available', pot_available,
                'prize_name', selected_prize.name
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
        NULL::uuid, -- No item_id for money prizes
        COALESCE(selected_prize.value, 0),
        true;
END;
$function$;

-- Ensure RTP pots exist for all scratch types with correct column names
INSERT INTO public.rtp_pots (game_type, rtp_target, cap_enabled, cap_value, total_bet, total_paid, is_active)
VALUES 
  ('pix', 0, true, 1000.00, 0, 0, true),
  ('sorte', 0, true, 1000.00, 0, 0, true),
  ('dupla', 0, true, 1000.00, 0, 0, true),
  ('ouro', 0, true, 1000.00, 0, 0, true),
  ('diamante', 0, true, 1000.00, 0, 0, true),
  ('premium', 0, true, 1000.00, 0, 0, true)
ON CONFLICT (game_type) DO NOTHING;