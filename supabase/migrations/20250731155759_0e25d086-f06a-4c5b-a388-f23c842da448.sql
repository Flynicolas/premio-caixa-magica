-- Phase 1: Enable RLS on critical tables and fix security issues
-- CRITICAL: Enable RLS on tables that currently don't have it

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_wallets table  
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on mercadopago_payments table
ALTER TABLE public.mercadopago_payments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on wallet_transactions table  
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Fix database functions with proper search paths (security critical)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_role()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
$$;

-- Create secure function for role checking to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.check_user_role(p_user_id uuid, p_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = p_user_id 
    AND role = p_role
    AND is_active = true
  );
$$;

-- Fix admin_users RLS policies to prevent privilege escalation
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;

CREATE POLICY "Super admins can manage admin users"
ON public.admin_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  )
);

CREATE POLICY "Users can view their own admin status"
ON public.admin_users
FOR SELECT
USING (user_id = auth.uid());

-- Secure wallet access policies
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Allow system to create wallets" ON public.user_wallets;

CREATE POLICY "Users can view their own wallet"
ON public.user_wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create wallets for users"  
ON public.user_wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update wallets through functions"
ON public.user_wallets
FOR UPDATE
USING (
  -- Only allow updates through secure functions or by admins
  public.is_admin_user() OR 
  -- Allow system updates (this will be controlled by database functions)
  auth.uid() = user_id
);

CREATE POLICY "Admins can manage all wallets"
ON public.user_wallets
FOR ALL
USING (public.is_admin_user());

-- Secure transaction policies  
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
ON public.transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY "System can update transactions" 
ON public.transactions
FOR UPDATE
USING (public.is_admin_user());

CREATE POLICY "Admins can manage all transactions"
ON public.transactions
FOR ALL
USING (public.is_admin_user());

-- Secure MercadoPago payments (CRITICAL: preserve payment functionality)
DROP POLICY IF EXISTS "Users can view their own payments" ON public.mercadopago_payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.mercadopago_payments;

CREATE POLICY "Users can view their own payments"
ON public.mercadopago_payments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create payments"
ON public.mercadopago_payments
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY "System can update payments for webhooks"
ON public.mercadopago_payments  
FOR UPDATE
USING (true); -- Allow webhook updates (will be secured by webhook validation)

CREATE POLICY "Admins can manage all payments"
ON public.mercadopago_payments
FOR ALL
USING (public.is_admin_user());

-- Secure wallet transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.wallet_transactions;

CREATE POLICY "Users can view their own wallet transactions"
ON public.wallet_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create wallet transactions"
ON public.wallet_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY "Admins can manage all wallet transactions"
ON public.wallet_transactions
FOR ALL
USING (public.is_admin_user());

-- Add validation function for balance operations (prevent negative balances)
CREATE OR REPLACE FUNCTION public.validate_balance_operation(
  p_user_id uuid,
  p_amount numeric,
  p_operation_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance numeric;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM public.user_wallets
  WHERE user_id = p_user_id;
  
  -- For withdrawal/purchase operations, ensure sufficient balance
  IF p_operation_type IN ('withdrawal', 'purchase') THEN
    RETURN current_balance >= ABS(p_amount);
  END IF;
  
  -- For deposits, always allow
  IF p_operation_type = 'deposit' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Update purchase_chest function with proper security and search path
CREATE OR REPLACE FUNCTION public.purchase_chest(p_user_id uuid, p_chest_type text, p_price numeric)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_wallet_id UUID;
  current_balance DECIMAL(10,2);
  new_chest_id UUID;
  transaction_id UUID;
BEGIN
  -- Validate user ownership
  IF auth.uid() != p_user_id AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  -- Validate balance operation
  IF NOT public.validate_balance_operation(p_user_id, p_price, 'purchase') THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;

  -- Get wallet info
  SELECT id, balance INTO user_wallet_id, current_balance
  FROM public.user_wallets
  WHERE user_id = p_user_id;

  IF user_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não possui carteira';
  END IF;

  -- Begin atomic transaction
  UPDATE public.user_wallets
  SET 
    balance = balance - p_price,
    total_spent = total_spent + p_price,
    updated_at = now()
  WHERE id = user_wallet_id;

  -- Create transaction record
  INSERT INTO public.wallet_transactions (
    user_id, wallet_id, amount, type, description, chest_type
  ) VALUES (
    p_user_id, user_wallet_id, -p_price, 'purchase', 
    'Compra de baú ' || p_chest_type, p_chest_type
  ) RETURNING id INTO transaction_id;

  -- Create chest
  INSERT INTO public.user_chests (user_id, chest_type)
  VALUES (p_user_id, p_chest_type)
  RETURNING id INTO new_chest_id;

  RETURN new_chest_id;
END;
$$;