-- FASE 2: CORREÇÃO CRÍTICA - Valores Ultra Conservadores
-- Aplicar valores que respeitam a validação rigorosa do sistema

-- Aplicar valores extremamente conservadores
UPDATE scratch_card_settings 
SET 
  win_probability_global = CASE scratch_type 
    WHEN 'pix' THEN 3.0      -- 3% win
    WHEN 'sorte' THEN 4.0    -- 4% win  
    WHEN 'dupla' THEN 4.0    -- 4% win
    WHEN 'ouro' THEN 5.0     -- 5% win
    WHEN 'diamante' THEN 4.0 -- 4% win
    WHEN 'premium' THEN 3.0  -- 3% win
    ELSE 4.0
  END,
  target_rtp = CASE scratch_type
    WHEN 'pix' THEN 12.0     -- 12% RTP (4x win prob)
    WHEN 'sorte' THEN 15.0   -- 15% RTP 
    WHEN 'dupla' THEN 15.0   -- 15% RTP 
    WHEN 'ouro' THEN 15.0    -- 15% RTP
    WHEN 'diamante' THEN 15.0 -- 15% RTP
    WHEN 'premium' THEN 12.0  -- 12% RTP
    ELSE 15.0
  END,
  rtp_enabled = true,
  updated_at = now()
WHERE scratch_type IN ('pix', 'sorte', 'dupla', 'ouro', 'diamante', 'premium');

-- Zerar itens caros conforme planejado
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