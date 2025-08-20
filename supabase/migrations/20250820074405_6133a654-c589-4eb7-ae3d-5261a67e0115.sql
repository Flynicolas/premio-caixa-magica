-- Função para atualizar monitoramento de lucro corretamente (somando valores)
CREATE OR REPLACE FUNCTION public.update_scratch_profit_monitoring(
  p_scratch_type text,
  p_sales_amount numeric,
  p_prizes_amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.scratch_card_profit_monitoring (
    scratch_type,
    date,
    total_sales,
    total_prizes_paid
  ) VALUES (
    p_scratch_type,
    CURRENT_DATE,
    p_sales_amount,
    p_prizes_amount
  )
  ON CONFLICT (scratch_type, date) DO UPDATE SET
    total_sales = scratch_card_profit_monitoring.total_sales + p_sales_amount,
    total_prizes_paid = scratch_card_profit_monitoring.total_prizes_paid + p_prizes_amount,
    updated_at = now();
END;
$$;