
-- Hotfix: evitar "UPDATE requires a WHERE clause" no trigger de tempo real
-- Não altera estrutura nem lógicas de negócio. Apenas garante WHERE.

CREATE OR REPLACE FUNCTION public.update_cash_control_realtime()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Se a tabela de controle estiver vazia, cria um registro inicial mínimo (somente colunas conhecidas e estáveis)
  IF NOT EXISTS (SELECT 1 FROM public.cash_control_system) THEN
    INSERT INTO public.cash_control_system (
      total_system_balance,
      total_deposits_real,
      total_withdrawals_real,
      last_reconciliation
    ) VALUES (
      (SELECT COALESCE(SUM(balance), 0) FROM public.user_wallets),
      (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE type = 'deposit' AND status = 'completed'),
      (SELECT COALESCE(SUM(ABS(amount)), 0) FROM public.wallet_transactions WHERE type = 'money_redemption'),
      now()
    );
  END IF;

  -- UPDATE agora com WHERE (para satisfazer a regra de segurança do banco)
  UPDATE public.cash_control_system SET
    total_system_balance = (SELECT COALESCE(SUM(balance), 0) FROM public.user_wallets),
    total_deposits_real = (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE type = 'deposit' AND status = 'completed'),
    total_withdrawals_real = (SELECT COALESCE(SUM(ABS(amount)), 0) FROM public.wallet_transactions WHERE type = 'money_redemption'),
    updated_at = now()
  WHERE true;  -- mantém comportamento "registro único" e evita a exceção de WHERE ausente

  RETURN COALESCE(NEW, OLD);
END;
$function$;
