-- Primeiro, atualizar a função de validação para aceitar nossa nova fórmula
-- RTP máximo = Win_Probability * 4 (em vez de * 2)

CREATE OR REPLACE FUNCTION validate_scratch_card_settings()
RETURNS TRIGGER AS $$
DECLARE
  max_rtp NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Nova fórmula: RTP máximo = Win_Probability * 4 (limitado a 70%)
    max_rtp := LEAST(NEW.win_probability_global * 4, 70);
    
    IF NEW.target_rtp > max_rtp THEN
      RAISE EXCEPTION 'Target RTP muito alto para a Win Probability configurada. Máximo recomendado: %.2f', max_rtp;
    END IF;
    
    -- Validar limites básicos
    IF NEW.win_probability_global < 3 OR NEW.win_probability_global > 20 THEN
      RAISE EXCEPTION 'Win Probability deve estar entre 3%% e 20%%. Valor atual: %.2f%%', NEW.win_probability_global;
    END IF;
    
    IF NEW.target_rtp < 15 OR NEW.target_rtp > 70 THEN
      RAISE EXCEPTION 'Target RTP deve estar entre 15%% e 70%%. Valor atual: %.2f%%', NEW.target_rtp;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;