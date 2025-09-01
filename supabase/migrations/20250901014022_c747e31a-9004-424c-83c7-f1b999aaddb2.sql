-- ================================================================================================
-- CORREÇÃO URGENTE: INICIALIZAR CONTROLES FINANCEIROS DIÁRIOS
-- ================================================================================================

-- 1. Criar função para inicializar controles financeiros diários com orçamentos adequados
CREATE OR REPLACE FUNCTION initialize_daily_financial_controls()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  scratch_type_record RECORD;
  today_date DATE := CURRENT_DATE;
  base_budget NUMERIC := 50.00; -- Orçamento base para começar
  initial_sales NUMERIC := 100.00; -- Vendas fictícias para calcular percentual
BEGIN
  -- Para cada tipo de raspadinha ativa
  FOR scratch_type_record IN 
    SELECT DISTINCT scratch_type 
    FROM scratch_card_settings 
    WHERE is_active = true
  LOOP
    -- Verificar se já existe controle financeiro para hoje
    IF NOT EXISTS (
      SELECT 1 FROM scratch_card_financial_control 
      WHERE scratch_type = scratch_type_record.scratch_type 
      AND date = today_date
    ) THEN
      -- Criar controle financeiro inicial para hoje
      INSERT INTO scratch_card_financial_control (
        scratch_type,
        date,
        total_sales,
        total_prizes_given,
        remaining_budget,
        percentage_prizes,
        payout_mode,
        pay_upto_percentage,
        min_bank_balance,
        created_at,
        updated_at
      ) VALUES (
        scratch_type_record.scratch_type,
        today_date,
        0.00, -- Sem vendas ainda
        0.00, -- Sem prêmios dados ainda
        base_budget, -- Orçamento inicial de R$ 50
        0.15, -- 15% para prêmios
        'percentage',
        35, -- Pagar até 35% do orçamento disponível
        10.00, -- Manter R$ 10 de reserva mínima
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Controle financeiro criado para % com orçamento inicial de R$ %', 
        scratch_type_record.scratch_type, base_budget;
    ELSE
      -- Se existe mas tem orçamento zero, restaurar orçamento mínimo
      UPDATE scratch_card_financial_control 
      SET 
        remaining_budget = GREATEST(remaining_budget, base_budget),
        percentage_prizes = COALESCE(percentage_prizes, 0.15),
        payout_mode = COALESCE(payout_mode, 'percentage'),
        pay_upto_percentage = COALESCE(pay_upto_percentage, 35),
        min_bank_balance = COALESCE(min_bank_balance, 10.00),
        updated_at = NOW()
      WHERE scratch_type = scratch_type_record.scratch_type 
      AND date = today_date
      AND remaining_budget < 10.00;
      
      RAISE NOTICE 'Orçamento restaurado para %', scratch_type_record.scratch_type;
    END IF;
  END LOOP;
  
  RETURN 'Controles financeiros inicializados com sucesso para ' || today_date::TEXT;
END;
$$;

-- 2. Executar a função para inicializar os controles de hoje
SELECT initialize_daily_financial_controls();

-- 3. Atualizar configurações das raspadinhas com probabilidades mais realistas
UPDATE scratch_card_settings 
SET 
  win_probability_global = CASE scratch_type
    WHEN 'pix' THEN 5.0      -- 5% para PIX (mais acessível)
    WHEN 'sorte' THEN 4.0    -- 4% para Sorte 
    WHEN 'dupla' THEN 3.5    -- 3.5% para Dupla
    WHEN 'ouro' THEN 3.0     -- 3% para Ouro
    WHEN 'diamante' THEN 2.0 -- 2% para Diamante
    WHEN 'premium' THEN 1.5  -- 1.5% para Premium
    ELSE 3.0
  END,
  target_rtp = CASE scratch_type
    WHEN 'pix' THEN 25.0     -- RTP 25%
    WHEN 'sorte' THEN 30.0   -- RTP 30%
    WHEN 'dupla' THEN 35.0   -- RTP 35%
    WHEN 'ouro' THEN 40.0    -- RTP 40%
    WHEN 'diamante' THEN 45.0 -- RTP 45%
    WHEN 'premium' THEN 50.0  -- RTP 50%
    ELSE 30.0
  END,
  rtp_enabled = true,
  updated_at = NOW()
WHERE is_active = true;

-- 4. Criar função para monitoramento em tempo real
CREATE OR REPLACE FUNCTION check_financial_health()
RETURNS TABLE (
  scratch_type TEXT,
  remaining_budget NUMERIC,
  profit_margin NUMERIC,
  status TEXT,
  recommended_action TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fc.scratch_type::TEXT,
    fc.remaining_budget,
    CASE 
      WHEN fc.total_sales > 0 THEN 
        ROUND(((fc.total_sales - fc.total_prizes_given) / fc.total_sales * 100), 2)
      ELSE 100.00 
    END as profit_margin,
    CASE 
      WHEN fc.remaining_budget < 5 THEN 'CRÍTICO'::TEXT
      WHEN fc.remaining_budget < 20 THEN 'BAIXO'::TEXT  
      WHEN fc.remaining_budget < 50 THEN 'MÉDIO'::TEXT
      ELSE 'BOM'::TEXT
    END as status,
    CASE 
      WHEN fc.remaining_budget < 5 THEN 'Adicionar orçamento urgente - sistema em blackout'::TEXT
      WHEN fc.remaining_budget < 20 THEN 'Monitorar de perto - reduzir probabilidades'::TEXT
      WHEN fc.remaining_budget < 50 THEN 'Situação controlada'::TEXT
      ELSE 'Sistema funcionando normalmente'::TEXT
    END as recommended_action
  FROM scratch_card_financial_control fc
  WHERE fc.date = CURRENT_DATE
  ORDER BY fc.remaining_budget ASC;
END;
$$;

-- 5. Verificar saúde financeira atual
SELECT * FROM check_financial_health();

-- 6. Criar alerta automático para orçamentos baixos
CREATE OR REPLACE FUNCTION alert_low_budget()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Se o orçamento ficar abaixo de R$ 10, criar alerta
  IF NEW.remaining_budget < 10 AND OLD.remaining_budget >= 10 THEN
    INSERT INTO critical_financial_alerts (
      alert_type,
      alert_level,
      description,
      amount,
      current_balance,
      metadata,
      created_at
    ) VALUES (
      'low_budget',
      'warning',
      'Orçamento baixo para ' || NEW.scratch_type,
      NEW.remaining_budget,
      NEW.remaining_budget,
      jsonb_build_object(
        'scratch_type', NEW.scratch_type,
        'total_sales', NEW.total_sales,
        'total_prizes', NEW.total_prizes_given,
        'date', NEW.date
      ),
      NOW()
    );
  END IF;
  
  -- Se o orçamento ficar abaixo de R$ 5, criar alerta crítico
  IF NEW.remaining_budget < 5 AND OLD.remaining_budget >= 5 THEN
    INSERT INTO critical_financial_alerts (
      alert_type,
      alert_level,
      description,
      amount,
      current_balance,
      metadata,
      created_at
    ) VALUES (
      'critical_budget',
      'critical',
      'ORÇAMENTO CRÍTICO para ' || NEW.scratch_type || ' - Sistema em blackout',
      NEW.remaining_budget,
      NEW.remaining_budget,
      jsonb_build_object(
        'scratch_type', NEW.scratch_type,
        'total_sales', NEW.total_sales,
        'total_prizes', NEW.total_prizes_given,
        'date', NEW.date,
        'action_required', 'Adicionar orçamento imediatamente'
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para alertas automáticos
DROP TRIGGER IF EXISTS trigger_alert_low_budget ON scratch_card_financial_control;
CREATE TRIGGER trigger_alert_low_budget
  AFTER UPDATE ON scratch_card_financial_control
  FOR EACH ROW
  EXECUTE FUNCTION alert_low_budget();