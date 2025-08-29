-- FASE 2: CORREÇÃO CRÍTICA - Valores Ajustados para Validação
-- Aplicar valores que passem na validação existente

-- Primeiro, vamos aplicar valores seguros que respeitam a validação
-- Win Probability baixa com RTP proporcional
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
    WHEN 'pix' THEN 20.0     -- 20% RTP (4x win prob)
    WHEN 'sorte' THEN 22.0   -- 22% RTP 
    WHEN 'dupla' THEN 24.0   -- 24% RTP 
    WHEN 'ouro' THEN 26.0    -- 26% RTP
    WHEN 'diamante' THEN 22.0 -- 22% RTP
    WHEN 'premium' THEN 20.0  -- 20% RTP
    ELSE 22.0
  END,
  rtp_enabled = true,
  updated_at = now()
WHERE scratch_type IN ('pix', 'sorte', 'dupla', 'ouro', 'diamante', 'premium');

-- Reduzir pesos de itens caros (mesmo código anterior)
-- PIX: Máximo R$2,00
UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('pix') 
AND item_id IN (
  SELECT id FROM items WHERE base_value > 2.00
);

-- SORTE: Máximo R$5,00  
UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('sorte') 
AND item_id IN (
  SELECT id FROM items WHERE base_value > 5.00
);

-- DUPLA: Máximo R$10,00
UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('dupla') 
AND item_id IN (
  SELECT id FROM items WHERE base_value > 10.00
);

-- OURO: Máximo R$25,00
UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('ouro') 
AND item_id IN (
  SELECT id FROM items WHERE base_value > 25.00
);

-- DIAMANTE: Máximo R$50,00
UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('diamante') 
AND item_id IN (
  SELECT id FROM items WHERE base_value > 50.00
);

-- PREMIUM: Máximo R$100,00
UPDATE scratch_card_item_probabilities 
SET probability_weight = 0, updated_at = now()
WHERE scratch_type IN ('premium') 
AND item_id IN (
  SELECT id FROM items WHERE base_value > 100.00
);