-- CORREÇÃO CRÍTICA: Ajustar orçamentos das raspadinhas para operação sustentável

-- 1. Atualizar orçamentos diários baseados no preço das raspadinhas
UPDATE scratch_card_financial_control 
SET 
  daily_budget_prizes = CASE 
    WHEN scratch_type = 'pix' THEN 50.00
    WHEN scratch_type = 'sorte' THEN 100.00
    WHEN scratch_type = 'dupla' THEN 200.00
    WHEN scratch_type = 'ouro' THEN 400.00
    WHEN scratch_type = 'diamante' THEN 800.00
    WHEN scratch_type = 'premium' THEN 2000.00
    ELSE daily_budget_prizes
  END,
  remaining_budget = CASE 
    WHEN scratch_type = 'pix' THEN 50.00
    WHEN scratch_type = 'sorte' THEN 100.00
    WHEN scratch_type = 'dupla' THEN 200.00
    WHEN scratch_type = 'ouro' THEN 400.00
    WHEN scratch_type = 'diamante' THEN 800.00
    WHEN scratch_type = 'premium' THEN 2000.00
    ELSE remaining_budget
  END,
  updated_at = now()
WHERE date = CURRENT_DATE;

-- 2. Inserir registros para tipos que não existem hoje
INSERT INTO scratch_card_financial_control (
  scratch_type, date, daily_budget_prizes, remaining_budget, budget_percentage
) VALUES 
  ('sorte', CURRENT_DATE, 100.00, 100.00, 0.50),
  ('dupla', CURRENT_DATE, 200.00, 200.00, 0.50)
ON CONFLICT (scratch_type, date) DO UPDATE SET
  daily_budget_prizes = EXCLUDED.daily_budget_prizes,
  remaining_budget = EXCLUDED.remaining_budget,
  updated_at = now();

-- 3. Criar função para recarga automática de orçamento
CREATE OR REPLACE FUNCTION auto_refill_scratch_budgets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rec RECORD;
  min_budget NUMERIC;
  target_budget NUMERIC;
BEGIN
  -- Para cada tipo de raspadinha
  FOR rec IN 
    SELECT DISTINCT scratch_type FROM scratch_card_settings WHERE rtp_enabled = true
  LOOP
    -- Definir orçamento mínimo baseado no tipo
    min_budget := CASE 
      WHEN rec.scratch_type = 'pix' THEN 5.00
      WHEN rec.scratch_type = 'sorte' THEN 10.00
      WHEN rec.scratch_type = 'dupla' THEN 20.00
      WHEN rec.scratch_type = 'ouro' THEN 40.00
      WHEN rec.scratch_type = 'diamante' THEN 80.00
      WHEN rec.scratch_type = 'premium' THEN 200.00
      ELSE 5.00
    END;
    
    -- Definir orçamento alvo
    target_budget := CASE 
      WHEN rec.scratch_type = 'pix' THEN 50.00
      WHEN rec.scratch_type = 'sorte' THEN 100.00
      WHEN rec.scratch_type = 'dupla' THEN 200.00
      WHEN rec.scratch_type = 'ouro' THEN 400.00
      WHEN rec.scratch_type = 'diamante' THEN 800.00
      WHEN rec.scratch_type = 'premium' THEN 2000.00
      ELSE 50.00
    END;
    
    -- Verificar se precisa recarregar
    UPDATE scratch_card_financial_control 
    SET 
      remaining_budget = target_budget,
      daily_budget_prizes = target_budget,
      updated_at = now()
    WHERE scratch_type = rec.scratch_type 
      AND date = CURRENT_DATE
      AND remaining_budget < min_budget;
      
    -- Criar registro se não existe
    INSERT INTO scratch_card_financial_control (
      scratch_type, date, daily_budget_prizes, remaining_budget, budget_percentage
    ) VALUES (
      rec.scratch_type, CURRENT_DATE, target_budget, target_budget, 0.50
    ) ON CONFLICT (scratch_type, date) DO NOTHING;
  END LOOP;
END;
$function$;

-- 4. Executar a recarga inicial
SELECT auto_refill_scratch_budgets();

-- 5. Criar função para monitoramento de RTP em tempo real
CREATE OR REPLACE FUNCTION monitor_rtp_health()
RETURNS TABLE(
  scratch_type text,
  current_rtp numeric,
  target_rtp numeric,
  rtp_deviation numeric,
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
      ELSE (COALESCE(SUM(gr.prize), 0) / COALESCE(SUM(gr.bet), 1)) * 100
    END as current_rtp,
    scs.target_rtp,
    ABS((CASE 
      WHEN COALESCE(SUM(gr.bet), 0) = 0 THEN 0
      ELSE (COALESCE(SUM(gr.prize), 0) / COALESCE(SUM(gr.bet), 1)) * 100
    END) - scs.target_rtp) as rtp_deviation,
    COALESCE(SUM(gr.bet), 0) as total_sales,
    COALESCE(SUM(gr.prize), 0) as total_prizes,
    CASE 
      WHEN COALESCE(SUM(gr.bet), 0) < 100 THEN 'INSUFFICIENT_DATA'
      WHEN ABS((CASE 
        WHEN COALESCE(SUM(gr.bet), 0) = 0 THEN 0
        ELSE (COALESCE(SUM(gr.prize), 0) / COALESCE(SUM(gr.bet), 1)) * 100
      END) - scs.target_rtp) <= 5 THEN 'HEALTHY'
      WHEN ABS((CASE 
        WHEN COALESCE(SUM(gr.bet), 0) = 0 THEN 0
        ELSE (COALESCE(SUM(gr.prize), 0) / COALESCE(SUM(gr.bet), 1)) * 100
      END) - scs.target_rtp) <= 15 THEN 'WARNING'
      ELSE 'CRITICAL'
    END as health_status
  FROM scratch_card_settings scs
  LEFT JOIN game_rounds gr ON gr.game_type = scs.scratch_type 
    AND gr.decided_at >= CURRENT_DATE
  WHERE scs.rtp_enabled = true
  GROUP BY scs.scratch_type, scs.target_rtp
  ORDER BY scs.price;
END;
$function$;