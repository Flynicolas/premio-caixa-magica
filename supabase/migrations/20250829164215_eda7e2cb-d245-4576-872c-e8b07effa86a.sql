-- Adicionar coluna win_probability separada de target_rtp
ALTER TABLE public.scratch_card_settings 
ADD COLUMN IF NOT EXISTS win_probability_global NUMERIC(5,2) DEFAULT 10.00;

-- Atualizar valores iniciais baseados nos valores seguros recomendados
UPDATE public.scratch_card_settings 
SET win_probability_global = CASE 
  WHEN scratch_type = 'pix' THEN 12.00
  WHEN scratch_type = 'sorte' THEN 15.00
  WHEN scratch_type = 'dupla' THEN 18.00
  WHEN scratch_type = 'ouro' THEN 12.00
  WHEN scratch_type = 'diamante' THEN 10.00
  WHEN scratch_type = 'premium' THEN 8.00
  ELSE 12.00
END;

-- Corrigir valores de target_rtp para valores realistas
UPDATE public.scratch_card_settings 
SET target_rtp = CASE 
  WHEN scratch_type = 'pix' THEN 30.00
  WHEN scratch_type = 'sorte' THEN 35.00
  WHEN scratch_type = 'dupla' THEN 40.00
  WHEN scratch_type = 'ouro' THEN 45.00
  WHEN scratch_type = 'diamante' THEN 50.00
  WHEN scratch_type = 'premium' THEN 55.00
  ELSE 35.00
END;

-- Criar trigger para validação dos valores
CREATE OR REPLACE FUNCTION validate_scratch_card_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar win_probability entre 5% e 30%
  IF NEW.win_probability_global < 5.00 OR NEW.win_probability_global > 30.00 THEN
    RAISE EXCEPTION 'Win Probability deve estar entre 5%% e 30%%';
  END IF;
  
  -- Validar target_rtp entre 20% e 80%
  IF NEW.target_rtp < 20.00 OR NEW.target_rtp > 80.00 THEN
    RAISE EXCEPTION 'Target RTP deve estar entre 20%% e 80%%';
  END IF;
  
  -- Validar que RTP não seja maior que win_probability (isso seria matematicamente impossível de manter)
  IF NEW.target_rtp > (NEW.win_probability_global * 3) THEN
    RAISE EXCEPTION 'Target RTP muito alto para a Win Probability configurada. Máximo recomendado: %', (NEW.win_probability_global * 3);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_scratch_settings_trigger
  BEFORE UPDATE OR INSERT ON public.scratch_card_settings
  FOR EACH ROW EXECUTE FUNCTION validate_scratch_card_settings();

-- Comentário para documentação
COMMENT ON COLUMN public.scratch_card_settings.win_probability_global IS 'Probabilidade de vitória (5-30%) - determina frequência de ganhos';
COMMENT ON COLUMN public.scratch_card_settings.target_rtp IS 'Return to Player (20-80%) - valor médio retornado aos jogadores';