-- Views de observabilidade para RTP
CREATE OR REPLACE VIEW v_rtp_overview AS
SELECT 
  game_type, 
  rtp_target, 
  cap_enabled,
  cap_value,
  total_bet, 
  total_paid,
  CASE WHEN total_bet > 0 THEN total_paid / total_bet ELSE 0 END as rtp_current,
  updated_at
FROM rtp_pots
ORDER BY game_type;

CREATE OR REPLACE VIEW v_rounds_daily AS
SELECT 
  game_type, 
  DATE(decided_at) as d,
  COUNT(*) as plays, 
  SUM(bet) as total_bet, 
  SUM(prize) as total_paid,
  CASE WHEN SUM(bet) > 0 THEN SUM(prize) / SUM(bet) ELSE 0 END as rtp
FROM game_rounds
GROUP BY game_type, DATE(decided_at)
ORDER BY d DESC, game_type;

-- Função para popular prêmios padrão
CREATE OR REPLACE FUNCTION populate_default_prizes(p_game_type text, p_rtp_target numeric DEFAULT 0.50)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Limpar prêmios existentes
  DELETE FROM scratch_prizes WHERE game_type = p_game_type;
  
  -- RTP 50%
  IF p_rtp_target = 0.50 THEN
    INSERT INTO scratch_prizes(game_type, name, value, weight, active) VALUES
    (p_game_type, 'Perdeu', 0, 60, true),
    (p_game_type, 'Moeda 1', 1, 28, true),
    (p_game_type, 'Moeda 2', 2, 9, true),
    (p_game_type, 'Nota 5', 5, 2.5, true),
    (p_game_type, 'Nota 10', 10, 0.5, true);
  -- RTP 60%
  ELSIF p_rtp_target = 0.60 THEN
    INSERT INTO scratch_prizes(game_type, name, value, weight, active) VALUES
    (p_game_type, 'Perdeu', 0, 50, true),
    (p_game_type, 'Moeda 1', 1, 30, true),
    (p_game_type, 'Moeda 2', 2, 13, true),
    (p_game_type, 'Nota 5', 5, 5, true),
    (p_game_type, 'Nota 10', 10, 2, true);
  -- RTP 70%
  ELSIF p_rtp_target = 0.70 THEN
    INSERT INTO scratch_prizes(game_type, name, value, weight, active) VALUES
    (p_game_type, 'Perdeu', 0, 40, true),
    (p_game_type, 'Moeda 1', 1, 35, true),
    (p_game_type, 'Moeda 2', 2, 15, true),
    (p_game_type, 'Nota 5', 5, 7, true),
    (p_game_type, 'Nota 10', 10, 3, true);
  END IF;
END;
$$;