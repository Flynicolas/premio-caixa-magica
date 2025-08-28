-- Dropar função existente e recriar
DROP FUNCTION IF EXISTS public.monitor_rtp_health();

-- Recriar função corrigida
CREATE OR REPLACE FUNCTION public.monitor_rtp_health()
RETURNS TABLE(
  scratch_type text,
  current_rtp numeric,
  target_rtp numeric,
  deviation numeric,
  total_sales numeric,
  total_prizes numeric,
  health_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    scs.scratch_type,
    CASE 
      WHEN COALESCE(SUM(gr.bet), 0) = 0 THEN 0
      ELSE ROUND((COALESCE(SUM(gr.prize), 0) / COALESCE(SUM(gr.bet), 1)) * 100, 2)
    END as current_rtp,
    COALESCE(scs.target_rtp, 50.0) as target_rtp,
    CASE 
      WHEN COALESCE(SUM(gr.bet), 0) = 0 THEN 0
      ELSE ROUND((COALESCE(SUM(gr.prize), 0) / COALESCE(SUM(gr.bet), 1)) * 100, 2) - COALESCE(scs.target_rtp, 50.0)
    END as deviation,
    COALESCE(SUM(gr.bet), 0) as total_sales,
    COALESCE(SUM(gr.prize), 0) as total_prizes,
    CASE 
      WHEN COALESCE(SUM(gr.bet), 0) = 0 THEN 'INSUFFICIENT_DATA'
      WHEN ABS((COALESCE(SUM(gr.prize), 0) / COALESCE(SUM(gr.bet), 1)) * 100 - COALESCE(scs.target_rtp, 50.0)) > 15 THEN 'CRITICAL'
      WHEN ABS((COALESCE(SUM(gr.prize), 0) / COALESCE(SUM(gr.bet), 1)) * 100 - COALESCE(scs.target_rtp, 50.0)) > 5 THEN 'WARNING'
      ELSE 'HEALTHY'
    END as health_status
  FROM public.scratch_card_settings scs
  LEFT JOIN public.game_rounds gr ON gr.game_type = scs.scratch_type
    AND gr.decided_at >= (now() - interval '7 days')
  WHERE scs.rtp_enabled = true
  GROUP BY scs.scratch_type, scs.target_rtp
  ORDER BY scs.scratch_type;
END;
$function$