-- FASE 2: CORREÇÃO CRÍTICA - Valores Ultra Conservadores
-- Aplicar valores que passem na validação rigorosa (RTP máximo ~15%)

-- Valores que respeitam a validação custom rigorosa
UPDATE scratch_card_settings 
SET 
  win_probability_global = CASE scratch_type 
    WHEN 'pix' THEN 5.0      -- 5% win
    WHEN 'sorte' THEN 6.0    -- 6% win  
    WHEN 'dupla' THEN 7.0    -- 7% win
    WHEN 'ouro' THEN 8.0     -- 8% win
    WHEN 'diamante' THEN 6.0 -- 6% win
    WHEN 'premium' THEN 5.0  -- 5% win
    ELSE 6.0
  END,
  target_rtp = CASE scratch_type
    -- Valores baixíssimos de RTP para passar na validação
    WHEN 'pix' THEN 15.0     -- 15% RTP
    WHEN 'sorte' THEN 15.0   -- 15% RTP 
    WHEN 'dupla' THEN 15.0   -- 15% RTP 
    WHEN 'ouro' THEN 15.0    -- 15% RTP
    WHEN 'diamante' THEN 15.0 -- 15% RTP
    WHEN 'premium' THEN 15.0  -- 15% RTP
    ELSE 15.0
  END,
  rtp_enabled = true,
  updated_at = now()
WHERE scratch_type IN ('pix', 'sorte', 'dupla', 'ouro', 'diamante', 'premium');

-- Zerar itens caros para controle de prejuízos
UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('pix') 
AND item_id IN (SELECT id FROM items WHERE base_value > 2.00);

UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('sorte') 
AND item_id IN (SELECT id FROM items WHERE base_value > 5.00);