-- Configurar probabilidades para a nova RASPADINHA DO PIX
INSERT INTO public.scratch_card_probabilities (scratch_type, item_id, probability_weight, min_quantity, max_quantity, is_active)
SELECT 
    'pix' as scratch_type,
    id as item_id,
    CASE 
        WHEN base_value = 1.00 THEN 50  -- R$ 1,00 - mais comum
        WHEN base_value = 2.00 THEN 30  -- R$ 2,00 - comum
        WHEN base_value = 5.00 THEN 15  -- R$ 5,00 - raro
        WHEN base_value = 10.00 THEN 5  -- R$ 10,00 - muito raro
    END as probability_weight,
    1 as min_quantity,
    1 as max_quantity,
    true as is_active
FROM public.items 
WHERE category = 'dinheiro' AND 'scratch_pix' = ANY(chest_types);

-- Limpar probabilidades antigas das raspadinhas existentes e criar novas
DELETE FROM public.scratch_card_probabilities WHERE scratch_type IN ('sorte', 'dupla', 'ouro', 'diamante', 'premium');

-- Configurar probabilidades para RASPADINHA DA SORTE (R$ 1,00)
INSERT INTO public.scratch_card_probabilities (scratch_type, item_id, probability_weight, min_quantity, max_quantity, is_active)
SELECT 
    'sorte' as scratch_type,
    id as item_id,
    CASE 
        WHEN base_value <= 25.00 THEN 40   -- Itens até R$ 25 - comuns
        WHEN base_value <= 50.00 THEN 20   -- Itens até R$ 50 - raros
        WHEN base_value <= 100.00 THEN 5   -- Itens até R$ 100 - muito raros
        ELSE 1                             -- Itens acima de R$ 100 - épicos
    END as probability_weight,
    1 as min_quantity,
    1 as max_quantity,
    true as is_active
FROM public.items 
WHERE 'scratch_sorte' = ANY(chest_types) AND is_active = true;

-- Configurar probabilidades para RASPADINHA DUPLA (R$ 2,50)
INSERT INTO public.scratch_card_probabilities (scratch_type, item_id, probability_weight, min_quantity, max_quantity, is_active)
SELECT 
    'dupla' as scratch_type,
    id as item_id,
    CASE 
        WHEN base_value <= 50.00 THEN 35   -- Itens até R$ 50 - comuns
        WHEN base_value <= 100.00 THEN 20  -- Itens até R$ 100 - raros
        WHEN base_value <= 250.00 THEN 10  -- Itens até R$ 250 - muito raros
        ELSE 2                             -- Itens acima de R$ 250 - épicos
    END as probability_weight,
    1 as min_quantity,
    1 as max_quantity,
    true as is_active
FROM public.items 
WHERE 'scratch_dupla' = ANY(chest_types) AND is_active = true;

-- Configurar probabilidades para RASPADINHA DE OURO (R$ 5,00)
INSERT INTO public.scratch_card_probabilities (scratch_type, item_id, probability_weight, min_quantity, max_quantity, is_active)
SELECT 
    'ouro' as scratch_type,
    id as item_id,
    CASE 
        WHEN base_value <= 100.00 THEN 30  -- Itens até R$ 100 - comuns
        WHEN base_value <= 250.00 THEN 20  -- Itens até R$ 250 - raros
        WHEN base_value <= 500.00 THEN 10  -- Itens até R$ 500 - muito raros
        ELSE 3                             -- Itens acima de R$ 500 - épicos
    END as probability_weight,
    1 as min_quantity,
    1 as max_quantity,
    true as is_active
FROM public.items 
WHERE 'scratch_ouro' = ANY(chest_types) AND is_active = true;

-- Configurar probabilidades para RASPADINHA DIAMANTE (R$ 10,00)
INSERT INTO public.scratch_card_probabilities (scratch_type, item_id, probability_weight, min_quantity, max_quantity, is_active)
SELECT 
    'diamante' as scratch_type,
    id as item_id,
    CASE 
        WHEN base_value <= 250.00 THEN 25  -- Itens até R$ 250 - comuns
        WHEN base_value <= 500.00 THEN 15  -- Itens até R$ 500 - raros
        WHEN base_value <= 1000.00 THEN 8  -- Itens até R$ 1000 - muito raros
        ELSE 4                             -- Itens acima de R$ 1000 - épicos
    END as probability_weight,
    1 as min_quantity,
    1 as max_quantity,
    true as is_active
FROM public.items 
WHERE 'scratch_diamante' = ANY(chest_types) AND is_active = true;

-- Configurar probabilidades para RASPADINHA PREMIUM (R$ 25,00)
INSERT INTO public.scratch_card_probabilities (scratch_type, item_id, probability_weight, min_quantity, max_quantity, is_active)
SELECT 
    'premium' as scratch_type,
    id as item_id,
    CASE 
        WHEN base_value <= 500.00 THEN 20  -- Itens até R$ 500 - comuns
        WHEN base_value <= 1000.00 THEN 12 -- Itens até R$ 1000 - raros
        WHEN base_value <= 2500.00 THEN 6  -- Itens até R$ 2500 - muito raros
        ELSE 5                             -- Itens acima de R$ 2500 - épicos
    END as probability_weight,
    1 as min_quantity,
    1 as max_quantity,
    true as is_active
FROM public.items 
WHERE 'scratch_premium' = ANY(chest_types) AND is_active = true;