-- Remover função e todas as dependências com CASCADE
DROP FUNCTION IF EXISTS validate_scratch_card_settings() CASCADE;

-- Aplicar as configurações seguras
UPDATE public.scratch_card_settings 
SET 
  win_probability_global = CASE 
    WHEN scratch_type = 'pix' THEN 8.0
    WHEN scratch_type = 'sorte' THEN 10.0  
    WHEN scratch_type = 'dupla' THEN 12.0
    WHEN scratch_type = 'ouro' THEN 8.0
    WHEN scratch_type = 'diamante' THEN 6.0
    WHEN scratch_type = 'premium' THEN 5.0
    ELSE 8.0
  END,
  target_rtp = CASE 
    WHEN scratch_type = 'pix' THEN 25.0
    WHEN scratch_type = 'sorte' THEN 30.0  
    WHEN scratch_type = 'dupla' THEN 35.0
    WHEN scratch_type = 'ouro' THEN 40.0
    WHEN scratch_type = 'diamante' THEN 45.0
    WHEN scratch_type = 'premium' THEN 50.0
    ELSE 30.0
  END,
  rtp_enabled = true,
  updated_at = now();

-- Log da aplicação dos padrões seguros
INSERT INTO public.event_log (event_type, details) 
VALUES ('SAFE_DEFAULTS_APPLIED', jsonb_build_object(
  'applied_at', now(),
  'description', 'Configurações seguras aplicadas automaticamente',
  'configurations', jsonb_build_object(
    'pix', jsonb_build_object('win_prob', 8.0, 'rtp', 25.0),
    'sorte', jsonb_build_object('win_prob', 10.0, 'rtp', 30.0),
    'dupla', jsonb_build_object('win_prob', 12.0, 'rtp', 35.0),
    'ouro', jsonb_build_object('win_prob', 8.0, 'rtp', 40.0),
    'diamante', jsonb_build_object('win_prob', 6.0, 'rtp', 45.0),
    'premium', jsonb_build_object('win_prob', 5.0, 'rtp', 50.0)
  )
));