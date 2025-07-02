
-- ==============================================
-- AJUSTES NO SISTEMA DE ITENS E INVENTÁRIO
-- ==============================================

-- Atualizar tabela de itens para incluir campos de entrega
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS 
  delivery_type TEXT DEFAULT 'digital', -- 'digital' (PIX/saldo), 'physical' (precisa endereço)
  delivery_instructions TEXT, -- Instruções específicas de entrega
  requires_address BOOLEAN DEFAULT false, -- Se precisa de endereço
  requires_document BOOLEAN DEFAULT false; -- Se precisa de CPF/documento

-- Criar tabela para endereços de entrega dos usuários
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Nome do destinatário
  street TEXT NOT NULL, -- Rua e número
  complement TEXT, -- Complemento
  neighborhood TEXT NOT NULL, -- Bairro
  city TEXT NOT NULL, -- Cidade
  state TEXT NOT NULL, -- Estado
  zip_code TEXT NOT NULL, -- CEP
  phone TEXT, -- Telefone para contato
  is_default BOOLEAN DEFAULT false, -- Endereço padrão
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para solicitações de resgate
CREATE TABLE IF NOT EXISTS public.item_redemption_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_item_id UUID NOT NULL REFERENCES public.user_item_inventory(id) ON DELETE CASCADE,
  delivery_address_id UUID REFERENCES public.user_addresses(id), -- Endereço de entrega (se necessário)
  additional_info JSONB, -- Informações adicionais (CPF, etc.)
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  tracking_code TEXT, -- Código de rastreamento
  admin_notes TEXT, -- Observações do admin
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Deletar dados antigos de configuração dos baús para inserir novos
DELETE FROM public.chest_item_probabilities;
DELETE FROM public.items;

-- Inserir 20 itens para cada tipo de baú com probabilidades realistas
-- BAÚS DE PRATA (preço: R$ 5,00)
INSERT INTO public.items (name, description, image_url, category, rarity, base_value, delivery_type, requires_address) VALUES
-- Itens comuns (70% de chance) - 14 itens
('R$ 2,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 2.00, 'digital', false),
('R$ 3,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 3.00, 'digital', false),
('R$ 4,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 4.00, 'digital', false),
('R$ 5,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 5.00, 'digital', false),
('R$ 6,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 6.00, 'digital', false),
('R$ 7,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 7.00, 'digital', false),
('R$ 8,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 8.00, 'digital', false),
('Fone Bluetooth', 'Fone de ouvido sem fio básico', '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png', 'product', 'common', 50.00, 'physical', true),
('Carregador Portátil', 'Power bank 10000mAh', '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png', 'product', 'common', 45.00, 'physical', true),
('Cabo USB-C', 'Cabo USB-C de 1 metro', '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png', 'product', 'common', 25.00, 'physical', true),
('Película Celular', 'Película de vidro temperado', '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png', 'product', 'common', 15.00, 'physical', true),
('Capa Celular', 'Capa protetora para smartphone', '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png', 'product', 'common', 30.00, 'physical', true),
('Mouse Pad', 'Mouse pad gamer RGB', '/lovable-uploads/68d2bf66-08db-4fad-8f22-0bbfbbd2f16d.png', 'product', 'common', 35.00, 'physical', true),
('Suporte Celular', 'Suporte veicular para celular', '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png', 'product', 'common', 20.00, 'physical', true),

-- Itens raros (25% de chance) - 5 itens
('R$ 15,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'rare', 15.00, 'digital', false),
('R$ 20,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'rare', 20.00, 'digital', false),
('Smartwatch', 'Relógio inteligente básico', '/lovable-uploads/e7b617c4-f45a-4596-994a-75c0e3553f78.png', 'product', 'rare', 150.00, 'physical', true),
('Caixa de Som', 'Speaker Bluetooth portátil', '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png', 'product', 'rare', 120.00, 'physical', true),
('Webcam HD', 'Webcam Full HD 1080p', '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png', 'product', 'rare', 180.00, 'physical', true),

-- Item épico (5% de chance) - 1 item
('R$ 50,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'epic', 50.00, 'digital', false);

-- Configurar probabilidades para baú de prata (20 itens)
INSERT INTO public.chest_item_probabilities (chest_type, item_id, probability_weight) 
SELECT 'silver', id, 
  CASE 
    WHEN rarity = 'common' THEN 5  -- 70% total (14 itens × 5 cada = 70)
    WHEN rarity = 'rare' THEN 5    -- 25% total (5 itens × 5 cada = 25)
    WHEN rarity = 'epic' THEN 5    -- 5% total (1 item × 5 = 5)
  END
FROM public.items;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_redemption_requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para endereços
CREATE POLICY "Users can manage their own addresses" ON public.user_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para solicitações de resgate
CREATE POLICY "Users can manage their own redemption requests" ON public.item_redemption_requests
  FOR ALL USING (auth.uid() = user_id);

-- Função para sortear item de um baú
CREATE OR REPLACE FUNCTION public.draw_item_from_chest(chest_type_param chest_type)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  total_weight INTEGER;
  random_number INTEGER;
  current_weight INTEGER := 0;
  selected_item_id UUID;
  prob_record RECORD;
BEGIN
  -- Calcular peso total
  SELECT SUM(probability_weight) INTO total_weight
  FROM public.chest_item_probabilities cip
  WHERE cip.chest_type = chest_type_param AND cip.is_active = true;
  
  -- Gerar número aleatório
  random_number := floor(random() * total_weight) + 1;
  
  -- Encontrar item baseado no peso
  FOR prob_record IN 
    SELECT cip.item_id, cip.probability_weight
    FROM public.chest_item_probabilities cip
    WHERE cip.chest_type = chest_type_param AND cip.is_active = true
    ORDER BY random() -- Adiciona aleatoriedade extra
  LOOP
    current_weight := current_weight + prob_record.probability_weight;
    IF random_number <= current_weight THEN
      selected_item_id := prob_record.item_id;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN selected_item_id;
END;
$$;
