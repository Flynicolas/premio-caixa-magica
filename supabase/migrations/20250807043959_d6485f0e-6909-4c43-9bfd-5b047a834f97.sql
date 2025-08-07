-- FASE 1: LIMPEZA E UNIFICAÇÃO DO SISTEMA DE CAIXA
-- Criação do sistema centralizado de controle financeiro

-- Tabela central de controle de caixa em tempo real
CREATE TABLE IF NOT EXISTS public.cash_control_system (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_system_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_deposits_real NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_withdrawals_real NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_prizes_given NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_scratch_sales NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  net_profit NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  last_reconciliation TIMESTAMP WITH TIME ZONE DEFAULT now(),
  alert_level TEXT DEFAULT 'normal',
  emergency_stop BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de auditoria para detectar inconsistências
CREATE TABLE IF NOT EXISTS public.financial_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL, -- 'balance_check', 'transaction_verify', 'emergency_alert'
  user_id UUID,
  transaction_id UUID,
  expected_value NUMERIC(10,2),
  actual_value NUMERIC(10,2),
  discrepancy NUMERIC(10,2),
  severity TEXT DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  description TEXT,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de alertas críticos em tempo real
CREATE TABLE IF NOT EXISTS public.critical_financial_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'negative_balance', 'high_withdrawal', 'system_inconsistency'
  alert_level TEXT NOT NULL, -- 'warning', 'critical', 'emergency'
  user_id UUID,
  amount NUMERIC(10,2),
  current_balance NUMERIC(10,2),
  description TEXT NOT NULL,
  action_taken TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela unificada de transações (para substituir as duplicadas)
CREATE TABLE IF NOT EXISTS public.unified_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'purchase', 'prize', 'conversion'
  amount NUMERIC(10,2) NOT NULL,
  original_table TEXT NOT NULL, -- 'transactions', 'wallet_transactions', 'money_redemptions'
  original_id UUID NOT NULL,
  status TEXT DEFAULT 'completed',
  description TEXT,
  affects_real_cash BOOLEAN DEFAULT true, -- false para transações demo
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(original_table, original_id)
);

-- Função para inicializar o sistema de controle de caixa
CREATE OR REPLACE FUNCTION public.initialize_cash_control_system()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_real_balance NUMERIC(10,2) := 0;
  total_real_deposits NUMERIC(10,2) := 0;
  total_real_withdrawals NUMERIC(10,2) := 0;
  total_prizes_given NUMERIC(10,2) := 0;
  total_scratch_sales NUMERIC(10,2) := 0;
BEGIN
  -- Calcular valores reais do sistema
  SELECT COALESCE(SUM(balance), 0) INTO total_real_balance
  FROM public.user_wallets;
  
  SELECT COALESCE(SUM(amount), 0) INTO total_real_deposits
  FROM public.transactions
  WHERE type = 'deposit' AND status = 'completed';
  
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO total_real_withdrawals
  FROM public.wallet_transactions
  WHERE type = 'money_redemption';
  
  SELECT COALESCE(SUM(total_prizes_given), 0) INTO total_prizes_given
  FROM public.scratch_card_financial_control;
  
  SELECT COALESCE(SUM(total_sales), 0) INTO total_scratch_sales
  FROM public.scratch_card_financial_control;
  
  -- Inserir ou atualizar controle central
  INSERT INTO public.cash_control_system (
    total_system_balance,
    total_deposits_real,
    total_withdrawals_real,
    total_prizes_given,
    total_scratch_sales,
    net_profit,
    last_reconciliation
  ) VALUES (
    total_real_balance,
    total_real_deposits,
    total_real_withdrawals,
    total_prizes_given,
    total_scratch_sales,
    total_real_deposits - total_real_withdrawals - total_prizes_given,
    now()
  ) ON CONFLICT (id) DO UPDATE SET
    total_system_balance = EXCLUDED.total_system_balance,
    total_deposits_real = EXCLUDED.total_deposits_real,
    total_withdrawals_real = EXCLUDED.total_withdrawals_real,
    total_prizes_given = EXCLUDED.total_prizes_given,
    total_scratch_sales = EXCLUDED.total_scratch_sales,
    net_profit = EXCLUDED.net_profit,
    last_reconciliation = EXCLUDED.last_reconciliation,
    updated_at = now();
    
  -- Log da inicialização
  INSERT INTO public.financial_audit_log (
    audit_type,
    description,
    metadata
  ) VALUES (
    'system_initialization',
    'Sistema de controle de caixa inicializado',
    jsonb_build_object(
      'total_balance', total_real_balance,
      'total_deposits', total_real_deposits,
      'total_withdrawals', total_real_withdrawals,
      'net_profit', total_real_deposits - total_real_withdrawals - total_prizes_given
    )
  );
END;
$$;

-- Função para auditoria automática de inconsistências
CREATE OR REPLACE FUNCTION public.audit_financial_consistency()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calculated_balance NUMERIC(10,2);
  stored_balance NUMERIC(10,2);
  discrepancy NUMERIC(10,2);
  critical_threshold NUMERIC(10,2) := 100.00; -- R$ 100 de diferença é crítico
BEGIN
  -- Calcular saldo esperado baseado nas transações
  SELECT 
    COALESCE(SUM(CASE 
      WHEN t.type = 'deposit' THEN t.amount 
      WHEN t.type = 'withdrawal' THEN -t.amount 
      WHEN t.type = 'purchase' THEN -t.amount 
      ELSE 0 
    END), 0)
  INTO calculated_balance
  FROM public.transactions t
  WHERE t.status = 'completed';
  
  -- Buscar saldo armazenado
  SELECT COALESCE(SUM(balance), 0) INTO stored_balance
  FROM public.user_wallets;
  
  discrepancy := ABS(calculated_balance - stored_balance);
  
  IF discrepancy > critical_threshold THEN
    -- Alerta crítico
    INSERT INTO public.critical_financial_alerts (
      alert_type,
      alert_level,
      amount,
      current_balance,
      description,
      metadata
    ) VALUES (
      'system_inconsistency',
      'critical',
      discrepancy,
      stored_balance,
      'Inconsistência detectada entre saldo calculado e armazenado',
      jsonb_build_object(
        'calculated_balance', calculated_balance,
        'stored_balance', stored_balance,
        'discrepancy', discrepancy
      )
    );
    
    -- Ativar modo de emergência se discrepância for muito alta
    IF discrepancy > 1000.00 THEN
      UPDATE public.cash_control_system 
      SET 
        emergency_stop = true,
        alert_level = 'emergency',
        updated_at = now();
    END IF;
  END IF;
  
  -- Log da auditoria
  INSERT INTO public.financial_audit_log (
    audit_type,
    expected_value,
    actual_value,
    discrepancy,
    severity,
    description
  ) VALUES (
    'balance_check',
    calculated_balance,
    stored_balance,
    discrepancy,
    CASE 
      WHEN discrepancy > 1000 THEN 'critical'
      WHEN discrepancy > 100 THEN 'high'
      WHEN discrepancy > 10 THEN 'medium'
      ELSE 'low'
    END,
    'Auditoria automática de consistência financeira'
  );
END;
$$;

-- Função para atualizar controle de caixa em tempo real
CREATE OR REPLACE FUNCTION public.update_cash_control_realtime()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Recalcular totais em tempo real
  UPDATE public.cash_control_system SET
    total_system_balance = (SELECT COALESCE(SUM(balance), 0) FROM public.user_wallets),
    total_deposits_real = (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE type = 'deposit' AND status = 'completed'),
    total_withdrawals_real = (SELECT COALESCE(SUM(ABS(amount)), 0) FROM public.wallet_transactions WHERE type = 'money_redemption'),
    updated_at = now()
  WHERE id = (SELECT id FROM public.cash_control_system LIMIT 1);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers para atualização em tempo real
DROP TRIGGER IF EXISTS trigger_update_cash_control_wallets ON public.user_wallets;
CREATE TRIGGER trigger_update_cash_control_wallets
  AFTER INSERT OR UPDATE OR DELETE ON public.user_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_cash_control_realtime();

DROP TRIGGER IF EXISTS trigger_update_cash_control_transactions ON public.transactions;
CREATE TRIGGER trigger_update_cash_control_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_cash_control_realtime();

DROP TRIGGER IF EXISTS trigger_update_cash_control_wallet_transactions ON public.wallet_transactions;
CREATE TRIGGER trigger_update_cash_control_wallet_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_cash_control_realtime();

-- Habilitar Row Level Security
ALTER TABLE public.cash_control_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.critical_financial_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage cash control system" ON public.cash_control_system
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "Admins can manage audit logs" ON public.financial_audit_log
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "Admins can manage critical alerts" ON public.critical_financial_alerts
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "System can manage unified transactions" ON public.unified_transactions
  FOR ALL USING (true) WITH CHECK (true);

-- Inicializar o sistema
SELECT public.initialize_cash_control_system();