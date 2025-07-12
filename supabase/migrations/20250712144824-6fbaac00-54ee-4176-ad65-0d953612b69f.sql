-- Inserir itens de exemplo para teste
DO $$
BEGIN
  -- Inserir itens apenas se não existirem
  IF NOT EXISTS (SELECT 1 FROM public.items WHERE name = 'Moeda de Ouro') THEN
    INSERT INTO public.items (name, description, rarity, base_value, category, delivery_type, requires_address, is_active)
    VALUES 
      ('Moeda de Ouro', 'Uma valiosa moeda de ouro', 'common', 5.00, 'currency', 'digital', false, true),
      ('Gema Azul', 'Uma gema azul brilhante', 'rare', 25.00, 'gem', 'digital', false, true),
      ('Cristal Épico', 'Um cristal com poderes épicos', 'epic', 50.00, 'crystal', 'digital', false, true),
      ('Espada Lendária', 'Uma espada de poder lendário', 'legendary', 150.00, 'weapon', 'physical', true, true),
      ('Poção de Cura', 'Restaura sua energia vital', 'common', 10.00, 'potion', 'digital', false, true),
      ('Anel Mágico', 'Um anel com poderes místicos', 'epic', 75.00, 'accessory', 'physical', true, true),
      ('Scroll Antigo', 'Conhecimento ancestral', 'rare', 30.00, 'knowledge', 'digital', false, true),
      ('Orbe do Destino', 'Controla o destino', 'legendary', 200.00, 'artifact', 'physical', true, true);
  END IF;
END $$;

-- Configurar probabilidades para baús (deletar existentes primeiro para evitar duplicatas)
DELETE FROM public.chest_item_probabilities WHERE chest_type IN ('silver', 'gold', 'diamond', 'premium');

-- Configurar probabilidades para baú Silver
INSERT INTO public.chest_item_probabilities (chest_type, item_id, probability_weight, is_active)
SELECT 'silver', i.id, 
  CASE 
    WHEN i.rarity = 'common' THEN 70
    WHEN i.rarity = 'rare' THEN 25
    WHEN i.rarity = 'epic' THEN 4
    WHEN i.rarity = 'legendary' THEN 1
  END,
  true
FROM public.items i
WHERE i.name IN ('Moeda de Ouro', 'Poção de Cura', 'Gema Azul', 'Cristal Épico');

-- Configurar probabilidades para baú Gold
INSERT INTO public.chest_item_probabilities (chest_type, item_id, probability_weight, is_active)
SELECT 'gold', i.id, 
  CASE 
    WHEN i.rarity = 'common' THEN 50
    WHEN i.rarity = 'rare' THEN 35
    WHEN i.rarity = 'epic' THEN 12
    WHEN i.rarity = 'legendary' THEN 3
  END,
  true
FROM public.items i
WHERE i.name IN ('Poção de Cura', 'Gema Azul', 'Scroll Antigo', 'Cristal Épico', 'Anel Mágico');

-- Configurar probabilidades para baú Diamond
INSERT INTO public.chest_item_probabilities (chest_type, item_id, probability_weight, is_active)
SELECT 'diamond', i.id, 
  CASE 
    WHEN i.rarity = 'common' THEN 30
    WHEN i.rarity = 'rare' THEN 40
    WHEN i.rarity = 'epic' THEN 25
    WHEN i.rarity = 'legendary' THEN 5
  END,
  true
FROM public.items i
WHERE i.name IN ('Gema Azul', 'Scroll Antigo', 'Cristal Épico', 'Anel Mágico', 'Espada Lendária');

-- Configurar probabilidades para baú Premium
INSERT INTO public.chest_item_probabilities (chest_type, item_id, probability_weight, is_active)
SELECT 'premium', i.id, 
  CASE 
    WHEN i.rarity = 'common' THEN 10
    WHEN i.rarity = 'rare' THEN 30
    WHEN i.rarity = 'epic' THEN 40
    WHEN i.rarity = 'legendary' THEN 20
  END,
  true
FROM public.items i
WHERE i.name IN ('Scroll Antigo', 'Cristal Épico', 'Anel Mágico', 'Espada Lendária', 'Orbe do Destino');

-- Inserir níveis de usuário básicos se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_levels WHERE level = 1) THEN
    INSERT INTO public.user_levels (level, name, min_experience, max_experience, icon, color, benefits)
    VALUES 
      (1, 'Novato', 0, 99, '🌱', '#22c55e', '["Acesso básico"]'),
      (2, 'Explorador', 100, 299, '🗺️', '#3b82f6', '["Desconto 5%"]'),
      (3, 'Aventureiro', 300, 599, '⚔️', '#8b5cf6', '["Desconto 10%"]'),
      (4, 'Herói', 600, 999, '🛡️', '#f59e0b', '["Desconto 15%"]'),
      (5, 'Lenda', 1000, NULL, '👑', '#ef4444', '["Desconto 20%", "Acesso VIP"]');
  END IF;
END $$;

-- Inserir conquistas básicas se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Primeiro Baú') THEN
    INSERT INTO public.achievements (name, description, condition_type, condition_value, icon, rarity, reward_experience)
    VALUES 
      ('Primeiro Baú', 'Abra seu primeiro baú', 'chests_opened', 1, '📦', 'common', 10),
      ('Colecionador', 'Abra 10 baús', 'chests_opened', 10, '🎁', 'rare', 50),
      ('Mestre dos Baús', 'Abra 50 baús', 'chests_opened', 50, '👑', 'epic', 100),
      ('Primeira Compra', 'Faça sua primeira compra', 'total_spent', 1, '💰', 'common', 5),
      ('Grande Gastador', 'Gaste R$ 100', 'total_spent', 100, '💸', 'rare', 25);
  END IF;
END $$;