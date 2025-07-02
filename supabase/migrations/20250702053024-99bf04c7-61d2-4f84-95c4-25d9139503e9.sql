
-- Criar enum para tipos de transação
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'chest_purchase', 'prize_win', 'refund');

-- Criar enum para status de transação
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Criar enum para raridade dos prêmios
CREATE TYPE prize_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- Criar enum para tipos de baú
CREATE TYPE chest_type AS ENUM ('silver', 'gold', 'diamond', 'ruby', 'premium');

-- Tabela de perfis de usuário (complementa auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de carteira dos usuários
CREATE TABLE public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_deposited DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_withdrawn DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela de transações
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configuração dos baús
CREATE TABLE public.chest_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chest_type chest_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  min_prize_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  max_prize_value DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de prêmios disponíveis
CREATE TABLE public.prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  rarity prize_rarity NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  chest_types chest_type[] NOT NULL,
  probability_weight INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de prêmios ganhos pelos usuários
CREATE TABLE public.user_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prize_id UUID NOT NULL REFERENCES public.prizes(id),
  chest_type chest_type NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id),
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de aberturas de baús
CREATE TABLE public.chest_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chest_type chest_type NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  prize_id UUID REFERENCES public.prizes(id),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do sistema (painel admin)
CREATE TABLE public.system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão dos baús
INSERT INTO public.chest_configs (chest_type, name, price, image_url, min_prize_value, max_prize_value) VALUES
('silver', 'Baú de Prata', 5.00, '/lovable-uploads/8f503764-12ee-4e00-8148-76b279be343f.png', 1.00, 25.00),
('gold', 'Baú de Ouro', 15.00, '/lovable-uploads/8c5dedca-ad61-4b14-a649-8b854950a875.png', 5.00, 75.00),
('diamond', 'Baú de Diamante', 35.00, '/lovable-uploads/0ec6f6c5-203f-4fca-855d-59171f78adf3.png', 15.00, 200.00),
('ruby', 'Baú de Rubi', 75.00, '/lovable-uploads/a7b012cc-0fae-4b69-b2f4-690740a0ba92.png', 35.00, 500.00),
('premium', 'Baú Premium', 150.00, '/lovable-uploads/d43f06a5-1532-42ba-8362-5aefb160b408.png', 75.00, 1500.00);

-- Inserir prêmios de exemplo
INSERT INTO public.prizes (name, description, image_url, rarity, value, quantity_available, chest_types, probability_weight) VALUES
('R$ 2,00', 'Prêmio em dinheiro', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'common', 2.00, 1000, ARRAY['silver'::chest_type], 40),
('R$ 5,00', 'Prêmio em dinheiro', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'common', 5.00, 500, ARRAY['silver', 'gold'], 25),
('R$ 10,00', 'Prêmio em dinheiro', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'rare', 10.00, 300, ARRAY['gold', 'diamond'], 15),
('R$ 25,00', 'Prêmio em dinheiro', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'rare', 25.00, 200, ARRAY['diamond', 'ruby'], 10),
('R$ 50,00', 'Prêmio em dinheiro', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'epic', 50.00, 100, ARRAY['ruby', 'premium'], 8),
('R$ 100,00', 'Prêmio em dinheiro', '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png', 'epic', 100.00, 50, ARRAY['premium'], 5),
('iPhone 15', 'iPhone 15 128GB', '/lovable-uploads/70a08625-c438-4292-8356-821b05c265bc.png', 'legendary', 800.00, 10, ARRAY['premium'], 1),
('PlayStation 5', 'Console PlayStation 5', '/lovable-uploads/68d2bf66-08db-4fad-8f22-0bbfbbd2f16d.png', 'legendary', 500.00, 15, ARRAY['premium'], 1);

-- Inserir configurações do sistema
INSERT INTO public.system_configs (key, value, description) VALUES
('house_edge_percentage', '{"value": 15}', 'Porcentagem da casa sobre os prêmios'),
('daily_withdrawal_limit', '{"value": 1000}', 'Limite diário de saque por usuário'),
('min_chest_opening_interval', '{"value": 1}', 'Intervalo mínimo entre aberturas (segundos)'),
('prize_distribution_weights', '{"common": 60, "rare": 25, "epic": 12, "legendary": 3}', 'Pesos de distribuição dos prêmios'),
('maintenance_mode', '{"enabled": false}', 'Modo de manutenção do sistema');

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chest_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chest_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para user_wallets
CREATE POLICY "Users can view their own wallet" ON public.user_wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas RLS para transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas RLS para chest_configs (público para leitura)
CREATE POLICY "Anyone can view active chest configs" ON public.chest_configs
  FOR SELECT USING (is_active = true);

-- Políticas RLS para prizes (público para leitura)
CREATE POLICY "Anyone can view active prizes" ON public.prizes
  FOR SELECT USING (is_active = true);

-- Políticas RLS para user_prizes
CREATE POLICY "Users can view their own prizes" ON public.user_prizes
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas RLS para chest_openings
CREATE POLICY "Users can view their own chest openings" ON public.chest_openings
  FOR SELECT USING (auth.uid() = user_id);

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar saldo da carteira
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    CASE NEW.type
      WHEN 'deposit' THEN
        UPDATE public.user_wallets 
        SET balance = balance + NEW.amount,
            total_deposited = total_deposited + NEW.amount,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
      WHEN 'withdrawal' THEN
        UPDATE public.user_wallets 
        SET balance = balance - NEW.amount,
            total_withdrawn = total_withdrawn + NEW.amount,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
      WHEN 'chest_purchase' THEN
        UPDATE public.user_wallets 
        SET balance = balance - NEW.amount,
            total_spent = total_spent + NEW.amount,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
      WHEN 'prize_win' THEN
        UPDATE public.user_wallets 
        SET balance = balance + NEW.amount,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_wallet_on_transaction
  AFTER UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();
