-- Fix remaining critical RLS issues and complete security hardening

-- Enable RLS on remaining tables that don't have it
ALTER TABLE public.test_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_withdrawal_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas ENABLE ROW LEVEL SECURITY;

-- Fix remaining functions with proper search paths (critical security)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_cpf_for_withdrawal(cpf_input text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validação básica de CPF (11 dígitos numéricos)
  IF cpf_input IS NULL OR LENGTH(REPLACE(cpf_input, '-', '')) != 11 THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se não são todos os números iguais
  IF REPLACE(cpf_input, '-', '') ~ '^(.)\1{10}$' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_old_manual_releases()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.manual_item_releases
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'pending' 
    AND expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_demo_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    credito_demo = 1000.00,
    ultimo_reset_demo = now()
  WHERE 
    is_demo = true 
    AND ultimo_reset_demo < (now() - interval '24 hours');
END;
$$;

-- Critical: Secure the MercadoPago webhook processing function while preserving functionality
CREATE OR REPLACE FUNCTION public.process_mercadopago_webhook(p_preference_id text, p_payment_id text, p_payment_status text, p_webhook_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payment_record RECORD;
  user_wallet_id UUID;
  transaction_amount DECIMAL(10,2);
BEGIN
  -- Input validation
  IF p_preference_id IS NULL OR p_payment_id IS NULL OR p_payment_status IS NULL THEN
    RAISE EXCEPTION 'Invalid webhook parameters';
  END IF;

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
    SELECT id INTO user_wallet_id
    FROM public.user_wallets 
    WHERE user_id = payment_record.user_id;
    
    -- Atualizar saldo da carteira com validação
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

-- Secure the payment preference creation function
CREATE OR REPLACE FUNCTION public.create_payment_preference(p_user_id uuid, p_amount numeric, p_description text DEFAULT 'Adicionar Saldo'::text)
RETURNS TABLE(preference_id text, transaction_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_transaction_id UUID;
  new_preference_id TEXT;
  wallet_id UUID;
BEGIN
  -- Validate user authorization
  IF auth.uid() != p_user_id AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  -- Input validation
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

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

-- Secure remaining critical functions
CREATE OR REPLACE FUNCTION public.open_chest(p_user_id uuid, p_chest_id uuid, p_item_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chest_record RECORD;
  item_record RECORD;
BEGIN
  -- Validate user authorization
  IF auth.uid() != p_user_id AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

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

CREATE OR REPLACE FUNCTION public.add_wallet_balance(p_user_id uuid, p_amount numeric, p_description text DEFAULT 'Depósito manual'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_wallet_id UUID;
BEGIN
  -- Validate admin authorization for manual balance additions
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can manually add balance';
  END IF;

  -- Input validation
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

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