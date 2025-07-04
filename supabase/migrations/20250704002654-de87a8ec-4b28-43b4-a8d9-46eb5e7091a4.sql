
-- PARTE 1: TABELAS ESSENCIAIS DO SISTEMA DE GESTÃO

-- Tabela de itens completa com todos os campos necessários
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'product',
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  base_value DECIMAL(10,2) NOT NULL,
  delivery_type TEXT DEFAULT 'digital' CHECK (delivery_type IN ('digital', 'physical')),
  delivery_instructions TEXT,
  requires_address BOOLEAN DEFAULT false,
  requires_document BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_in_chest INTEGER DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 25.00,
  image_filename TEXT,
  chest_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de probabilidades dos itens nos baús
CREATE TABLE IF NOT EXISTS public.chest_item_probabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chest_type TEXT NOT NULL CHECK (chest_type IN ('silver', 'gold', 'delas', 'diamond', 'ruby', 'premium')),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  probability_weight INTEGER NOT NULL DEFAULT 1,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chest_type, item_id)
);

-- Tabela de controle financeiro detalhado por baú
CREATE TABLE IF NOT EXISTS public.chest_financial_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chest_type TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sales DECIMAL(10,2) DEFAULT 0.00,
  total_prizes_given DECIMAL(10,2) DEFAULT 0.00,
  net_profit DECIMAL(10,2) DEFAULT 0.00,
  chests_opened INTEGER DEFAULT 0,
  profit_goal DECIMAL(10,2) DEFAULT 100.00,
  goal_reached BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chest_type, date)
);

-- Tabela de alertas automáticos
CREATE TABLE IF NOT EXISTS public.profit_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chest_type TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('goal_reached', 'high_prize_ready', 'loss_alert')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB
);

-- Tabela de usuários administrativos
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'collaborator' CHECK (role IN ('admin', 'collaborator', 'viewer')),
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela de logs de ações administrativas
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.admin_users(user_id),
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_table TEXT,
  affected_record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados iniciais na tabela items (baseado na migração anterior)
INSERT INTO public.items (name, description, image_url, category, rarity, base_value, delivery_type, requires_address) VALUES
-- Itens comuns (70% de chance) - Para baú de prata
('R$ 2,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 2.00, 'digital', false),
('R$ 3,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 3.00, 'digital', false),
('R$ 4,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 4.00, 'digital', false),
('R$ 5,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 5.00, 'digital', false),
('R$ 6,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'common', 6.00, 'digital', false),
('Fone Bluetooth', 'Fone de ouvido sem fio básico', '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png', 'product', 'common', 50.00, 'physical', true),
('Carregador Portátil', 'Power bank 10000mAh', '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png', 'product', 'common', 45.00, 'physical', true),
('Cabo USB-C', 'Cabo USB-C de 1 metro', '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png', 'product', 'common', 25.00, 'physical', true),

-- Itens raros (25% de chance)
('R$ 15,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'rare', 15.00, 'digital', false),
('R$ 20,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'rare', 20.00, 'digital', false),
('Smartwatch', 'Relógio inteligente básico', '/lovable-uploads/e7b617c4-f45a-4596-994a-75c0e3553f78.png', 'product', 'rare', 150.00, 'physical', true),
('Caixa de Som', 'Speaker Bluetooth portátil', '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png', 'product', 'rare', 120.00, 'physical', true),

-- Item épico (5% de chance)
('R$ 50,00', 'Prêmio em dinheiro via PIX', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'money', 'epic', 50.00, 'digital', false),

-- Itens para outros baús
('iPhone 15', 'iPhone 15 128GB', '/lovable-uploads/70a08625-c438-4292-8356-821b05c265bc.png', 'product', 'legendary', 800.00, 'physical', true),
('PlayStation 5', 'Console PlayStation 5', '/lovable-uploads/68d2bf66-08db-4fad-8f22-0bbfbbd2f16d.png', 'product', 'legendary', 500.00, 'physical', true)
ON CONFLICT DO NOTHING;

-- Configurar probabilidades para baú de prata
INSERT INTO public.chest_item_probabilities (chest_type, item_id, probability_weight) 
SELECT 'silver', id, 
  CASE 
    WHEN rarity = 'common' THEN 5
    WHEN rarity = 'rare' THEN 3
    WHEN rarity = 'epic' THEN 1
  END
FROM public.items 
WHERE rarity IN ('common', 'rare', 'epic')
ON CONFLICT (chest_type, item_id) DO NOTHING;

-- Inicializar controle financeiro para todos os baús
INSERT INTO public.chest_financial_control (chest_type, profit_goal) VALUES
('silver', 50.00),
('gold', 150.00),
('delas', 250.00),
('diamond', 350.00),
('ruby', 750.00),
('premium', 1500.00)
ON CONFLICT (chest_type, date) DO NOTHING;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chest_item_probabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chest_financial_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (visualização pública para itens)
CREATE POLICY "Anyone can view active items" ON public.items
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view chest probabilities" ON public.chest_item_probabilities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage everything" ON public.chest_financial_control
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

CREATE POLICY "Admins can view alerts" ON public.profit_alerts
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

CREATE POLICY "Admins can manage admin users" ON public.admin_users
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE role = 'admin' AND is_active = true));

CREATE POLICY "Admins can view logs" ON public.admin_action_logs
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));
