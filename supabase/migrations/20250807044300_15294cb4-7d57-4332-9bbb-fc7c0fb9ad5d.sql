-- CORREÇÃO DOS PROBLEMAS DE SEGURANÇA

-- Corrigir RLS nas tabelas que foram criadas mas não habilitadas
ALTER TABLE IF EXISTS public.user_behavior_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scratch_card_intelligent_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversion_security_alerts ENABLE ROW LEVEL SECURITY;

-- Corrigir funções com search_path mutable (SET search_path TO 'public')
CREATE OR REPLACE FUNCTION public.initialize_cash_control_system()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  calc_total_balance NUMERIC(10,2) := 0;
  calc_deposits NUMERIC(10,2) := 0;
  calc_withdrawals NUMERIC(10,2) := 0;
  calc_prizes NUMERIC(10,2) := 0;
  calc_sales NUMERIC(10,2) := 0;
BEGIN
  -- Calcular valores reais do sistema
  SELECT COALESCE(SUM(balance), 0) INTO calc_total_balance
  FROM public.user_wallets;
  
  SELECT COALESCE(SUM(amount), 0) INTO calc_deposits
  FROM public.transactions
  WHERE type = 'deposit' AND status = 'completed';
  
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO calc_withdrawals
  FROM public.wallet_transactions
  WHERE type = 'money_redemption';
  
  SELECT COALESCE(SUM(scfc.total_prizes_given), 0) INTO calc_prizes
  FROM public.scratch_card_financial_control scfc;
  
  SELECT COALESCE(SUM(scfc.total_sales), 0) INTO calc_sales
  FROM public.scratch_card_financial_control scfc;
  
  -- Inserir controle central (sempre um único registro)
  INSERT INTO public.cash_control_system (
    total_system_balance,
    total_deposits_real,
    total_withdrawals_real,
    total_prizes_given,
    total_scratch_sales,
    net_profit,
    last_reconciliation
  ) VALUES (
    calc_total_balance,
    calc_deposits,
    calc_withdrawals,
    calc_prizes,
    calc_sales,
    calc_deposits - calc_withdrawals - calc_prizes,
    now()
  ) ON CONFLICT DO NOTHING;
    
  -- Log da inicialização
  INSERT INTO public.financial_audit_log (
    audit_type,
    description,
    metadata
  ) VALUES (
    'system_initialization',
    'Sistema de controle de caixa inicializado',
    jsonb_build_object(
      'total_balance', calc_total_balance,
      'total_deposits', calc_deposits,
      'total_withdrawals', calc_withdrawals,
      'net_profit', calc_deposits - calc_withdrawals - calc_prizes
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_financial_consistency()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  calculated_balance NUMERIC(10,2);
  stored_balance NUMERIC(10,2);
  discrepancy NUMERIC(10,2);
  critical_threshold NUMERIC(10,2) := 100.00;
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

CREATE OR REPLACE FUNCTION public.update_cash_control_realtime()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Recalcular totais em tempo real
  UPDATE public.cash_control_system SET
    total_system_balance = (SELECT COALESCE(SUM(balance), 0) FROM public.user_wallets),
    total_deposits_real = (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE type = 'deposit' AND status = 'completed'),
    total_withdrawals_real = (SELECT COALESCE(SUM(ABS(amount)), 0) FROM public.wallet_transactions WHERE type = 'money_redemption'),
    updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$;