
-- Corrigir o problema de recursão infinita nas políticas RLS da tabela admin_users
-- Primeiro, remover as políticas problemáticas
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;

-- Criar função security definer para verificar se usuário é admin sem recursão
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
$$;

-- Criar função para verificar se usuário é admin específico
CREATE OR REPLACE FUNCTION public.is_admin_role()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
$$;

-- Recriar políticas RLS usando as funções security definer
CREATE POLICY "Admins can manage admin users" 
  ON public.admin_users 
  FOR ALL 
  USING (public.is_admin_role());

-- Criar tabelas ausentes de carteira
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.user_wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'prize', 'purchase')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_id UUID,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_wallets
CREATE POLICY "Users can view their own wallet" 
  ON public.user_wallets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" 
  ON public.user_wallets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" 
  ON public.user_wallets 
  FOR ALL 
  USING (public.is_admin_user());

-- Políticas RLS para transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
  ON public.transactions 
  FOR ALL 
  USING (public.is_admin_user());

-- Função para criar carteira automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id, balance)
  VALUES (NEW.id, 0.00);
  RETURN NEW;
END;
$$;

-- Trigger para criar carteira automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- Garantir que o usuário atual seja admin (substitua pelo seu email)
DO $$
DECLARE
  current_user_id UUID;
  current_email TEXT;
BEGIN
  -- Pegar dados do usuário atual
  SELECT id, email INTO current_user_id, current_email
  FROM auth.users 
  WHERE email = 'mcguaguim@gmail.com' -- Substitua pelo seu email
  LIMIT 1;
  
  -- Se encontrou usuário, garantir que seja admin
  IF current_user_id IS NOT NULL THEN
    INSERT INTO public.admin_users (user_id, email, role, is_active, created_by)
    VALUES (current_user_id, current_email, 'admin', true, current_user_id)
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      is_active = true,
      email = EXCLUDED.email;
  END IF;
END $$;
