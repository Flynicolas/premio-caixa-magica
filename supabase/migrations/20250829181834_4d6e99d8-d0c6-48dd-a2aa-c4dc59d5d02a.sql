-- FASE 2: CORREÇÃO CRÍTICA DE PROBABILIDADES
-- Aplicar valores seguros recomendados imediatamente

-- Atualizar configurações de raspadinhas com valores seguros
UPDATE scratch_card_settings 
SET 
  win_probability_global = CASE scratch_type 
    WHEN 'pix' THEN 8.0
    WHEN 'sorte' THEN 10.0  
    WHEN 'dupla' THEN 12.0
    WHEN 'ouro' THEN 10.0
    WHEN 'diamante' THEN 8.0
    WHEN 'premium' THEN 6.0
    ELSE 10.0
  END,
  target_rtp = CASE scratch_type
    WHEN 'pix' THEN 25.0
    WHEN 'sorte' THEN 30.0
    WHEN 'dupla' THEN 35.0 
    WHEN 'ouro' THEN 40.0
    WHEN 'diamante' THEN 45.0
    WHEN 'premium' THEN 50.0
    ELSE 30.0
  END,
  rtp_enabled = true,
  updated_at = now()
WHERE scratch_type IN ('pix', 'sorte', 'dupla', 'ouro', 'diamante', 'premium');

-- Reduzir pesos de itens caros em raspadinhas baratas (PIX e SORTE)
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

-- Adicionar configurações de validação de segurança
INSERT INTO app_settings (setting_key, setting_value, description) VALUES 
('scratch_max_win_probability', '20.0', 'Probabilidade máxima de vitória permitida (%)'),
('scratch_max_rtp', '70.0', 'RTP máximo permitido (%)'),
('scratch_min_profit_margin', '30.0', 'Margem mínima de lucro exigida (%)'),
('scratch_security_enabled', 'true', 'Ativar validações de segurança')
ON CONFLICT (setting_key) DO UPDATE SET
setting_value = EXCLUDED.setting_value,
updated_at = now();