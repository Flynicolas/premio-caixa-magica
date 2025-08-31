-- Agora aplicar as configurações seguras padrão com a validação corrigida
-- Adicionar campos necessários primeiro
ALTER TABLE public.scratch_card_settings 
ADD COLUMN IF NOT EXISTS target_rtp NUMERIC(5,2) DEFAULT 30.0,
ADD COLUMN IF NOT EXISTS rtp_enabled BOOLEAN DEFAULT true;

-- Atualizar raspadinhas com valores seguros baseados no tipo
UPDATE public.scratch_card_settings 
SET 
  win_probability_global = CASE 
    WHEN scratch_type = 'pix' THEN 8.0
    WHEN scratch_type = 'sorte' THEN 10.0  
    WHEN scratch_type = 'dupla' THEN 12.0
    WHEN scratch_type = 'ouro' THEN 8.0
    WHEN scratch_type = 'diamante' THEN 6.0
    WHEN scratch_type = 'premium' THEN 5.0
    ELSE 8.0 -- default seguro
  END,
  target_rtp = CASE 
    WHEN scratch_type = 'pix' THEN 25.0
    WHEN scratch_type = 'sorte' THEN 30.0  
    WHEN scratch_type = 'dupla' THEN 35.0
    WHEN scratch_type = 'ouro' THEN 40.0
    WHEN scratch_type = 'diamante' THEN 45.0
    WHEN scratch_type = 'premium' THEN 50.0
    ELSE 30.0 -- default seguro
  END,
  rtp_enabled = true,
  updated_at = now()
WHERE scratch_type IN ('pix', 'sorte', 'dupla', 'ouro', 'diamante', 'premium');

-- Criar trigger de validação se não existir
DROP TRIGGER IF EXISTS scratch_card_settings_validation ON public.scratch_card_settings;
CREATE TRIGGER scratch_card_settings_validation
  BEFORE INSERT OR UPDATE ON public.scratch_card_settings
  FOR EACH ROW EXECUTE FUNCTION validate_scratch_card_settings();