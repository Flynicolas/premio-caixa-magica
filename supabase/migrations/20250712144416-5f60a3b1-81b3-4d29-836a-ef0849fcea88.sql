-- 1. Criar triggers para automatizar criação de perfil e carteira
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- 2. Criar tabela de inventário de baús do usuário
CREATE TABLE public.user_chests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chest_type TEXT NOT NULL CHECK (chest_type IN ('silver', 'gold', 'delas', 'diamond', 'ruby', 'premium')),
  status TEXT NOT NULL DEFAULT 'closed' CHECK (status IN ('closed', 'opened')),
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE NULL,
  item_won_id UUID NULL REFERENCES items(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Criar tabela de inventário de itens do usuário
CREATE TABLE public.user_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  chest_type TEXT NOT NULL,
  rarity TEXT NOT NULL,
  won_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_redeemed BOOLEAN NOT NULL DEFAULT false,
  redeemed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Criar tabela de transações da carteira
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES user_wallets(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'purchase', 'refund', 'adjustment')),
  description TEXT NOT NULL,
  chest_type TEXT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Habilitar RLS nas novas tabelas
ALTER TABLE public.user_chests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para user_chests
CREATE POLICY "Users can view their own chests" ON public.user_chests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chests" ON public.user_chests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chests" ON public.user_chests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all chests" ON public.user_chests
  FOR ALL USING (is_admin_user());

-- 7. Criar políticas RLS para user_inventory
CREATE POLICY "Users can view their own inventory" ON public.user_inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all inventory" ON public.user_inventory
  FOR ALL USING (is_admin_user());

-- 8. Criar políticas RLS para wallet_transactions
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions" ON public.wallet_transactions
  FOR ALL USING (is_admin_user());

-- 9. Criar índices para performance
CREATE INDEX idx_user_chests_user_id ON public.user_chests(user_id);
CREATE INDEX idx_user_chests_status ON public.user_chests(status);
CREATE INDEX idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX idx_user_inventory_item_id ON public.user_inventory(item_id);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);

-- 10. Criar função para comprar baú
CREATE OR REPLACE FUNCTION public.purchase_chest(
  p_user_id UUID,
  p_chest_type TEXT,
  p_price DECIMAL(10,2)
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_wallet_id UUID;
  current_balance DECIMAL(10,2);
  new_chest_id UUID;
  transaction_id UUID;
BEGIN
  -- Verificar se usuário tem carteira e saldo suficiente
  SELECT id, balance INTO user_wallet_id, current_balance
  FROM public.user_wallets
  WHERE user_id = p_user_id;

  IF user_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não possui carteira';
  END IF;

  IF current_balance < p_price THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;

  -- Deduzir valor da carteira
  UPDATE public.user_wallets
  SET 
    balance = balance - p_price,
    total_spent = total_spent + p_price,
    updated_at = now()
  WHERE id = user_wallet_id;

  -- Criar registro de transação
  INSERT INTO public.wallet_transactions (
    user_id, wallet_id, amount, type, description, chest_type
  ) VALUES (
    p_user_id, user_wallet_id, -p_price, 'purchase', 
    'Compra de baú ' || p_chest_type, p_chest_type
  ) RETURNING id INTO transaction_id;

  -- Criar baú fechado no inventário
  INSERT INTO public.user_chests (user_id, chest_type)
  VALUES (p_user_id, p_chest_type)
  RETURNING id INTO new_chest_id;

  RETURN new_chest_id;
END;
$$;

-- 11. Criar função para abrir baú
CREATE OR REPLACE FUNCTION public.open_chest(
  p_user_id UUID,
  p_chest_id UUID,
  p_item_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  chest_record RECORD;
  item_record RECORD;
BEGIN
  -- Verificar se o baú pertence ao usuário e está fechado
  SELECT * INTO chest_record
  FROM public.user_chests
  WHERE id = p_chest_id AND user_id = p_user_id AND status = 'closed';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Baú não encontrado ou já foi aberto';
  END IF;

  -- Verificar se o item existe
  SELECT * INTO item_record
  FROM public.items
  WHERE id = p_item_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item não encontrado';
  END IF;

  -- Marcar baú como aberto
  UPDATE public.user_chests
  SET 
    status = 'opened',
    opened_at = now(),
    item_won_id = p_item_id
  WHERE id = p_chest_id;

  -- Adicionar item ao inventário do usuário
  INSERT INTO public.user_inventory (
    user_id, item_id, chest_type, rarity, won_at
  ) VALUES (
    p_user_id, p_item_id, chest_record.chest_type, item_record.rarity, now()
  );

  -- Atualizar estatísticas do usuário
  UPDATE public.profiles
  SET 
    chests_opened = chests_opened + 1,
    updated_at = now()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$;

-- 12. Criar função para adicionar saldo (para testes e admin)
CREATE OR REPLACE FUNCTION public.add_wallet_balance(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_description TEXT DEFAULT 'Depósito manual'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_wallet_id UUID;
BEGIN
  -- Verificar se usuário tem carteira
  SELECT id INTO user_wallet_id
  FROM public.user_wallets
  WHERE user_id = p_user_id;

  IF user_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não possui carteira';
  END IF;

  -- Adicionar saldo
  UPDATE public.user_wallets
  SET 
    balance = balance + p_amount,
    total_deposited = total_deposited + p_amount,
    updated_at = now()
  WHERE id = user_wallet_id;

  -- Criar registro de transação
  INSERT INTO public.wallet_transactions (
    user_id, wallet_id, amount, type, description
  ) VALUES (
    p_user_id, user_wallet_id, p_amount, 'deposit', p_description
  );

  RETURN TRUE;
END;
$$;