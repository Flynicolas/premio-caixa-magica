-- FASE 2: CORREÇÃO CRÍTICA - Valores Seguros e Válidos
-- Win Probability: 5-30% | Target RTP: 20-80%

-- Aplicar valores seguros que respeitam todas as validações
UPDATE scratch_card_settings 
SET 
  win_probability_global = CASE scratch_type 
    WHEN 'pix' THEN 5.0      -- 5% win (mínimo permitido)
    WHEN 'sorte' THEN 6.0    -- 6% win  
    WHEN 'dupla' THEN 7.0    -- 7% win
    WHEN 'ouro' THEN 8.0     -- 8% win
    WHEN 'diamante' THEN 6.0 -- 6% win
    WHEN 'premium' THEN 5.0  -- 5% win (mínimo permitido)
    ELSE 6.0
  END,
  target_rtp = CASE scratch_type
    WHEN 'pix' THEN 20.0     -- 20% RTP (mínimo permitido)
    WHEN 'sorte' THEN 25.0   -- 25% RTP 
    WHEN 'dupla' THEN 30.0   -- 30% RTP 
    WHEN 'ouro' THEN 35.0    -- 35% RTP
    WHEN 'diamante' THEN 30.0 -- 30% RTP
    WHEN 'premium' THEN 25.0  -- 25% RTP
    ELSE 25.0
  END,
  rtp_enabled = true,
  updated_at = now()
WHERE scratch_type IN ('pix', 'sorte', 'dupla', 'ouro', 'diamante', 'premium');

-- Zerar itens caros para evitar prejuízos massivos
UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('pix') 
AND item_id IN (SELECT id FROM items WHERE base_value > 2.00);

UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('sorte') 
AND item_id IN (SELECT id FROM items WHERE base_value > 5.00);

UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('dupla') 
AND item_id IN (SELECT id FROM items WHERE base_value > 10.00);

UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('ouro') 
AND item_id IN (SELECT id FROM items WHERE base_value > 25.00);

UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('diamante') 
AND item_id IN (SELECT id FROM items WHERE base_value > 50.00);

UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('premium') 
AND item_id IN (SELECT id FROM items WHERE base_value > 100.00);