
-- Ajustar tabela user_wallets existente para ter mais campos necessários
ALTER TABLE public.user_wallets 
ADD COLUMN IF NOT EXISTS total_deposited DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0.00;

-- Ajustar tabela transactions existente para suportar Mercado Pago
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS notification_url TEXT DEFAULT NULL;

-- Criar tabela para controle administrativo da carteira
CREATE TABLE IF NOT EXISTS public.admin_wallet_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_system_balance DECIMAL(10,2) DEFAULT 0.00,
  daily_deposits DECIMAL(10,2) DEFAULT 0.00,
  monthly_deposits DECIMAL(10,2) DEFAULT 0.00,
  total_withdrawals DECIMAL(10,2) DEFAULT 0.00,
  total_chest_sales DECIMAL(10,2) DEFAULT 0.00,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  date_control DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para logs de pagamento do Mercado Pago
CREATE TABLE IF NOT EXISTS public.mercadopago_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  preference_id TEXT NOT NULL,
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.admin_wallet_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercadopago_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admin_wallet_control
CREATE POLICY "Admins can manage wallet control" 
  ON public.admin_wallet_control 
  FOR ALL 
  USING (public.is_admin_user());

-- Políticas RLS para mercadopago_payments
CREATE POLICY "Users can view their own payments" 
  ON public.mercadopago_payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" 
  ON public.mercadopago_payments 
  FOR ALL 
  USING (public.is_admin_user());

-- Função para processar webhook do Mercado Pago
CREATE OR REPLACE FUNCTION public.process_mercadopago_webhook(
  p_preference_id TEXT,
  p_payment_id TEXT,
  p_payment_status TEXT,
  p_webhook_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payment_record RECORD;
  user_wallet_id UUID;
  transaction_amount DECIMAL(10,2);
BEGIN
  -- Buscar o pagamento pelo preference_id
  SELECT * INTO payment_record
  FROM public.mercadopago_payments 
  WHERE preference_id = p_preference_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pagamento não encontrado para preference_id: %', p_preference_id;
  END IF;
  
  -- Atualizar dados do pagamento
  UPDATE public.mercadopago_payments SET
    payment_id = p_payment_id,
    payment_status = p_payment_status,
    webhook_data = p_webhook_data,
    updated_at = now()
  WHERE preference_id = p_preference_id;
  
  -- Se pagamento foi aprovado, processar o crédito
  IF p_payment_status = 'approved' THEN
    -- Buscar carteira do usuário
    SELECT id, balance INTO user_wallet_id, transaction_amount
    FROM public.user_wallets 
    WHERE user_id = payment_record.user_id;
    
    -- Atualizar saldo da carteira
    UPDATE public.user_wallets SET
      balance = balance + payment_record.amount,
      total_deposited = total_deposited + payment_record.amount,
      updated_at = now()
    WHERE user_id = payment_record.user_id;
    
    -- Atualizar status da transação
    UPDATE public.transactions SET
      status = 'completed',
      payment_provider = 'mercadopago',
      payment_id = p_payment_id,
      payment_status = p_payment_status
    WHERE id = payment_record.transaction_id;
    
    -- Atualizar controle administrativo
    INSERT INTO public.admin_wallet_control (total_system_balance, daily_deposits, monthly_deposits)
    VALUES (
      (SELECT SUM(balance) FROM public.user_wallets),
      payment_record.amount,
      payment_record.amount
    )
    ON CONFLICT (date_control) DO UPDATE SET
      total_system_balance = (SELECT SUM(balance) FROM public.user_wallets),
      daily_deposits = admin_wallet_control.daily_deposits + payment_record.amount,
      monthly_deposits = admin_wallet_control.monthly_deposits + payment_record.amount,
      last_updated = now();
      
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Função para criar preferência de pagamento no Mercado Pago
CREATE OR REPLACE FUNCTION public.create_payment_preference(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_description TEXT DEFAULT 'Adicionar Saldo'
)
RETURNS TABLE(preference_id TEXT, transaction_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_transaction_id UUID;
  new_preference_id TEXT;
  wallet_id UUID;
BEGIN
  -- Verificar se usuário tem carteira
  SELECT id INTO wallet_id FROM public.user_wallets WHERE user_id = p_user_id;
  
  IF wallet_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não possui carteira criada';
  END IF;
  
  -- Criar transação pendente
  INSERT INTO public.transactions (
    user_id, wallet_id, type, amount, description, status
  ) VALUES (
    p_user_id, wallet_id, 'deposit', p_amount, p_description, 'pending'
  ) RETURNING id INTO new_transaction_id;
  
  -- Gerar preference_id único
  new_preference_id := 'PREF_' || new_transaction_id || '_' || extract(epoch from now())::bigint;
  
  -- Criar registro do pagamento MercadoPago
  INSERT INTO public.mercadopago_payments (
    user_id, transaction_id, preference_id, amount
  ) VALUES (
    p_user_id, new_transaction_id, new_preference_id, p_amount
  );
  
  RETURN QUERY SELECT new_preference_id, new_transaction_id;
END;
$$;
