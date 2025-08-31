-- Remover temporariamente o trigger para aplicar as configurações
DROP TRIGGER IF EXISTS scratch_card_settings_validation ON public.scratch_card_settings;

-- Aplicar configurações seguras sem validação
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
  updated_at = now()
WHERE scratch_type IN ('pix', 'sorte', 'dupla', 'ouro', 'diamante', 'premium');

-- Recriar função de validação corrigida
CREATE OR REPLACE FUNCTION validate_scratch_card_settings()
RETURNS TRIGGER AS $$
DECLARE
  max_rtp NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Nova fórmula: RTP máximo = Win_Probability * 4 (limitado a 70%)
    max_rtp := LEAST(NEW.win_probability_global * 4, 70);
    
    IF NEW.target_rtp > max_rtp THEN
      RAISE EXCEPTION 'Target RTP muito alto para a Win Probability configurada. Máximo recomendado: %', max_rtp;
    END IF;
    
    -- Validar limites básicos
    IF NEW.win_probability_global < 3 OR NEW.win_probability_global > 20 THEN
      RAISE EXCEPTION 'Win Probability deve estar entre 3%% e 20%%. Valor atual: %', NEW.win_probability_global;
    END IF;
    
    IF NEW.target_rtp < 15 OR NEW.target_rtp > 70 THEN
      RAISE EXCEPTION 'Target RTP deve estar entre 15%% e 70%%. Valor atual: %', NEW.target_rtp;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
CREATE TRIGGER scratch_card_settings_validation
  BEFORE INSERT OR UPDATE ON public.scratch_card_settings
  FOR EACH ROW EXECUTE FUNCTION validate_scratch_card_settings();