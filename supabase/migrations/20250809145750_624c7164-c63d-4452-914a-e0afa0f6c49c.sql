-- Ajustes de saldos e admin conforme plano
DO $$
DECLARE
  v_user_id_gringo uuid;
  v_wallet_id_gringo uuid;
  v_user_id_admin uuid;
  v_wallet_id_admin uuid;
BEGIN
  -- Obter IDs dos usuários pelos e-mails
  SELECT id INTO v_user_id_gringo FROM public.profiles WHERE email = 'gringoal846@gmail.com' LIMIT 1;
  SELECT id INTO v_user_id_admin FROM public.profiles WHERE email = 'mcguaguim@gmail.com' LIMIT 1;

  -- Garantir carteira e aplicar crédito de R$ 3.000 para gringoal846@gmail.com
  IF v_user_id_gringo IS NOT NULL THEN
    -- Garantir carteira
    INSERT INTO public.user_wallets (user_id)
    SELECT v_user_id_gringo
    WHERE NOT EXISTS (SELECT 1 FROM public.user_wallets WHERE user_id = v_user_id_gringo);

    SELECT id INTO v_wallet_id_gringo FROM public.user_wallets WHERE user_id = v_user_id_gringo;

    -- Atualizar saldo e totais
    UPDATE public.user_wallets
    SET 
      balance = balance + 3000.00,
      total_deposited = total_deposited + 3000.00,
      updated_at = now()
    WHERE id = v_wallet_id_gringo;

    -- Registrar transação de depósito (para auditoria/relatórios)
    INSERT INTO public.transactions (user_id, wallet_id, type, amount, description, status)
    VALUES (v_user_id_gringo, v_wallet_id_gringo, 'deposit', 3000.00, 'Ajuste administrativo: crédito R$ 3.000', 'completed');
  END IF;

  -- Garantir carteira, reset e saldo R$ 10.000 para mcguaguim@gmail.com
  IF v_user_id_admin IS NOT NULL THEN
    -- Garantir carteira
    INSERT INTO public.user_wallets (user_id)
    SELECT v_user_id_admin
    WHERE NOT EXISTS (SELECT 1 FROM public.user_wallets WHERE user_id = v_user_id_admin);

    SELECT id INTO v_wallet_id_admin FROM public.user_wallets WHERE user_id = v_user_id_admin;

    -- Resetar totais e definir saldo
    UPDATE public.user_wallets
    SET 
      balance = 10000.00,
      total_deposited = 10000.00,
      total_spent = 0.00,
      total_withdrawn = 0.00,
      updated_at = now()
    WHERE id = v_wallet_id_admin;

    -- Zerar test_balance, se a coluna existir
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'user_wallets' AND column_name = 'test_balance'
    ) THEN
      EXECUTE format('UPDATE public.user_wallets SET test_balance = 0 WHERE id = %L', v_wallet_id_admin);
    END IF;

    -- Registrar transação de depósito (para auditoria/relatórios)
    INSERT INTO public.transactions (user_id, wallet_id, type, amount, description, status)
    VALUES (v_user_id_admin, v_wallet_id_admin, 'deposit', 10000.00, 'Ajuste administrativo: saldo inicial R$ 10.000', 'completed');

    -- Garantir que é admin ativo
    INSERT INTO public.admin_users (user_id, email, role, is_active, created_at)
    SELECT v_user_id_admin, 'mcguaguim@gmail.com', 'admin', true, now()
    WHERE NOT EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = v_user_id_admin AND is_active = true
    );
  END IF;
END $$;

-- Rodar auditoria para atualizar controles e logs
SELECT public.audit_financial_consistency();