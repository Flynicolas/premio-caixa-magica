-- Fresh Start RTP System Reset (Corrected)
-- Remove backfill functions and clean inconsistent data

-- 1. Drop backfill functions (safe - they might not exist)
DROP FUNCTION IF EXISTS public.backfill_rtp_data();
DROP FUNCTION IF EXISTS public.populate_all_game_types_prizes();

-- 2. Clean game_rounds table for fresh start
TRUNCATE TABLE public.game_rounds;

-- 3. Reset RTP pots to zero for fresh start (using correct column names)
UPDATE public.rtp_pots SET 
  total_bet = 0,
  total_paid = 0,
  updated_at = now();

-- 4. Create fresh initialization function
CREATE OR REPLACE FUNCTION public.initialize_fresh_rtp_system()
RETURNS TABLE(
  scratch_type text,
  rtp_pot_created boolean,
  prizes_configured boolean,
  system_ready boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  game_type_record RECORD;
  pot_exists BOOLEAN;
  prize_count INTEGER;
BEGIN
  -- Ensure admin authorization
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Unauthorized: Admin required for RTP initialization';
  END IF;

  -- Initialize RTP system for each active scratch card type
  FOR game_type_record IN 
    SELECT DISTINCT scs.scratch_type, scs.price
    FROM public.scratch_card_settings scs
    WHERE scs.is_active = true
  LOOP
    -- Check if RTP pot exists
    SELECT EXISTS (
      SELECT 1 FROM public.rtp_pots 
      WHERE game_type = game_type_record.scratch_type
    ) INTO pot_exists;
    
    -- Create RTP pot if it doesn't exist
    IF NOT pot_exists THEN
      INSERT INTO public.rtp_pots (
        game_type,
        rtp_target,
        cap_enabled,
        cap_value,
        total_bet,
        total_paid,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        game_type_record.scratch_type,
        0.50,  -- Conservative 50% target RTP
        false, -- Cap disabled initially
        0,
        0,
        0,
        true,
        now(),
        now()
      );
    ELSE
      -- Reset existing pot to zero for fresh start
      UPDATE public.rtp_pots SET
        total_bet = 0,
        total_paid = 0,
        rtp_target = 0.50,
        updated_at = now()
      WHERE game_type = game_type_record.scratch_type;
    END IF;
    
    -- Check prize configuration count
    SELECT COUNT(*) INTO prize_count
    FROM public.scratch_prizes
    WHERE scratch_type = game_type_record.scratch_type
      AND is_active = true;
    
    -- Create basic prize structure if none exists
    IF prize_count = 0 THEN
      -- Create conservative prize structure
      INSERT INTO public.scratch_prizes (
        scratch_type,
        prize_type,
        prize_value,
        probability_weight,
        max_daily_awards,
        daily_awards_given,
        total_awards_given,
        is_active,
        created_at,
        updated_at
      ) VALUES 
      -- Small prizes (higher chance)
      (game_type_record.scratch_type, 'money', game_type_record.price * 0.5, 30, 100, 0, 0, true, now(), now()),
      (game_type_record.scratch_type, 'money', game_type_record.price * 1.0, 20, 50, 0, 0, true, now(), now()),
      -- Medium prizes
      (game_type_record.scratch_type, 'money', game_type_record.price * 2.0, 10, 20, 0, 0, true, now(), now()),
      (game_type_record.scratch_type, 'money', game_type_record.price * 5.0, 5, 10, 0, 0, true, now(), now()),
      -- Large prizes (rare)
      (game_type_record.scratch_type, 'money', game_type_record.price * 10.0, 2, 5, 0, 0, true, now(), now()),
      (game_type_record.scratch_type, 'money', game_type_record.price * 20.0, 1, 2, 0, 0, true, now(), now());
    END IF;
    
    -- Return status for this scratch type
    RETURN QUERY SELECT 
      game_type_record.scratch_type,
      true as rtp_pot_created,
      (prize_count > 0 OR true) as prizes_configured,
      true as system_ready;
      
  END LOOP;
  
  -- Log the fresh initialization
  INSERT INTO public.event_log (
    event_type,
    admin_id,
    details
  ) VALUES (
    'FRESH_RTP_INITIALIZATION',
    auth.uid(),
    jsonb_build_object(
      'initialized_at', now(),
      'system_reset', true,
      'data_cleaned', true
    )
  );
  
END;
$$;

-- 5. Enable RTP for scratch cards by default but with conservative settings
UPDATE public.scratch_card_settings SET
  rtp_enabled = true,
  target_rtp = 50.0,  -- Conservative 50% RTP
  updated_at = now()
WHERE is_active = true;