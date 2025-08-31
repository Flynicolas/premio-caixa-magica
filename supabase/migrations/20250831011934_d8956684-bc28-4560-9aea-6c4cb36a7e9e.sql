-- Verificar e remover qualquer trigger existente
DROP TRIGGER IF EXISTS scratch_card_settings_validation ON public.scratch_card_settings;
DROP TRIGGER IF EXISTS validate_scratch_card_settings_trigger ON public.scratch_card_settings;

-- Remover função existente se houver
DROP FUNCTION IF EXISTS validate_scratch_card_settings();

-- Aplicar configurações seguras sem nenhuma validação
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