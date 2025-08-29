-- Sistema de backfill e migração de dados históricos
CREATE OR REPLACE FUNCTION backfill_rtp_data()
RETURNS TABLE(
  game_type text, 
  games_processed integer, 
  total_bet numeric, 
  total_paid numeric,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r record;
  processed_count integer;
  bet_sum numeric;
  paid_sum numeric;
BEGIN
  -- Loop através de cada game_type existente
  FOR r IN 
    SELECT DISTINCT scratch_type as gt
    FROM scratch_card_games 
    WHERE processed_at IS NOT NULL
  LOOP
    -- Calcular totais do histórico
    SELECT 
      COUNT(*),
      COALESCE(SUM(amount_paid), 0),
      COALESCE(SUM(CASE WHEN has_win THEN winning_amount ELSE 0 END), 0)
    INTO processed_count, bet_sum, paid_sum
    FROM scratch_card_games 
    WHERE scratch_type = r.gt AND processed_at IS NOT NULL;

    -- Criar/atualizar entrada no rtp_pots
    INSERT INTO rtp_pots (game_type, rtp_target, total_bet, total_paid)
    VALUES (r.gt, 0.50, bet_sum, paid_sum)
    ON CONFLICT (game_type) DO UPDATE SET
      total_bet = rtp_pots.total_bet + bet_sum,
      total_paid = rtp_pots.total_paid + paid_sum,
      updated_at = now();

    -- Migrar dados para game_rounds se não existirem
    INSERT INTO game_rounds (user_id, game_type, bet, prize, decided_at, meta)
    SELECT 
      user_id,
      scratch_type,
      amount_paid,
      CASE WHEN has_win THEN winning_amount ELSE 0 END,
      processed_at,
      jsonb_build_object(
        'migrated_from_scratch_card_games', true,
        'original_game_id', id,
        'has_win', has_win,
        'winning_item_id', winning_item_id
      )
    FROM scratch_card_games 
    WHERE scratch_type = r.gt 
      AND processed_at IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM game_rounds 
        WHERE meta->>'original_game_id' = scratch_card_games.id::text
      );

    RETURN QUERY SELECT r.gt, processed_count, bet_sum, paid_sum, 'migrated'::text;
  END LOOP;
END;
$$;

-- Função para popular prêmios em todos os tipos existentes
CREATE OR REPLACE FUNCTION populate_all_game_types_prizes()
RETURNS TABLE(game_type text, prizes_created integer, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r record;
  prize_count integer;
BEGIN
  -- Loop através de cada game_type no rtp_pots
  FOR r IN SELECT DISTINCT rtp_pots.game_type as gt FROM rtp_pots LOOP
    -- Verificar se já tem prêmios
    SELECT COUNT(*) INTO prize_count
    FROM scratch_prizes 
    WHERE game_type = r.gt;

    -- Se não tem prêmios, criar padrão RTP 50%
    IF prize_count = 0 THEN
      PERFORM populate_default_prizes(r.gt, 0.50);
      prize_count := 5; -- Número padrão de prêmios criados
      RETURN QUERY SELECT r.gt, prize_count, 'created'::text;
    ELSE
      RETURN QUERY SELECT r.gt, prize_count, 'exists'::text;
    END IF;
  END LOOP;
END;
$$;

-- Função para ativar/desativar RTP por tipo
CREATE OR REPLACE FUNCTION toggle_rtp_enabled(p_game_type text, p_enabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar flag RTP no rtp_pots
  UPDATE rtp_pots 
  SET 
    cap_enabled = p_enabled,
    updated_at = now()
  WHERE game_type = p_game_type;

  -- Se não existe, criar entrada
  IF NOT FOUND THEN
    INSERT INTO rtp_pots (game_type, rtp_target, cap_enabled)
    VALUES (p_game_type, 0.50, p_enabled);
  END IF;

  -- Log da ação
  INSERT INTO event_log (event_type, details, created_at)
  VALUES (
    'RTP_TOGGLE',
    jsonb_build_object(
      'game_type', p_game_type,
      'enabled', p_enabled,
      'timestamp', now()
    ),
    now()
  );
END;
$$;