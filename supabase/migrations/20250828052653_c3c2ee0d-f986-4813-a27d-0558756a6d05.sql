-- Função para calcular comissões baseadas em atividades dos usuários referenciados
CREATE OR REPLACE FUNCTION calculate_affiliate_commissions(p_period_start DATE, p_period_end DATE)
RETURNS TABLE(
  affiliate_id UUID,
  referred_user UUID,
  commission_type TEXT,
  base_amount_cents BIGINT,
  commission_rate NUMERIC,
  commission_amount_cents BIGINT,
  level INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  settings RECORD;
  attribution RECORD;
  user_activity RECORD;
BEGIN
  -- Buscar configurações do sistema de afiliados
  SELECT * INTO settings FROM affiliate_settings WHERE id = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Configurações de afiliados não encontradas';
  END IF;

  -- Calcular comissões para cada atribuição
  FOR attribution IN 
    SELECT * FROM affiliate_attributions 
    WHERE attributed_at >= p_period_start AND attributed_at <= p_period_end
  LOOP
    -- Buscar atividades do usuário referenciado no período
    SELECT 
      COALESCE(SUM(wt.amount_cents), 0) as total_deposits,
      COALESCE(SUM(CASE WHEN wt.type = 'purchase' THEN ABS(wt.amount_cents) ELSE 0 END), 0) as total_spent
    INTO user_activity
    FROM wallet_transactions wt
    WHERE wt.user_id = attribution.referred_user
      AND wt.created_at >= p_period_start
      AND wt.created_at <= p_period_end;

    -- CPA: Comissão por primeiro depósito (se houver)
    IF user_activity.total_deposits >= settings.cpa_trigger_min_deposit_cents THEN
      -- Nível 1 (afiliado direto)
      RETURN QUERY SELECT
        attribution.affiliate_id,
        attribution.referred_user,
        'cpa'::TEXT,
        user_activity.total_deposits,
        1.0::NUMERIC,
        settings.cpa_l1_cents,
        1;
      
      -- Nível 2 (upline)
      IF attribution.upline2 IS NOT NULL THEN
        RETURN QUERY SELECT
          attribution.upline2,
          attribution.referred_user,
          'cpa'::TEXT,
          user_activity.total_deposits,
          1.0::NUMERIC,
          settings.cpa_l2_cents,
          2;
      END IF;
      
      -- Nível 3 (upline do upline)
      IF attribution.upline3 IS NOT NULL THEN
        RETURN QUERY SELECT
          attribution.upline3,
          attribution.referred_user,
          'cpa'::TEXT,
          user_activity.total_deposits,
          1.0::NUMERIC,
          settings.cpa_l3_cents,
          3;
      END IF;
    END IF;

    -- Revenue Share: Comissão sobre gastos
    IF user_activity.total_spent > 0 THEN
      -- Nível 1
      RETURN QUERY SELECT
        attribution.affiliate_id,
        attribution.referred_user,
        'revshare'::TEXT,
        user_activity.total_spent,
        settings.revshare_l1,
        (user_activity.total_spent * settings.revshare_l1)::BIGINT,
        1;
      
      -- Nível 2
      IF attribution.upline2 IS NOT NULL THEN
        RETURN QUERY SELECT
          attribution.upline2,
          attribution.referred_user,
          'revshare'::TEXT,
          user_activity.total_spent,
          settings.revshare_l2,
          (user_activity.total_spent * settings.revshare_l2)::BIGINT,
          2;
      END IF;
      
      -- Nível 3
      IF attribution.upline3 IS NOT NULL THEN
        RETURN QUERY SELECT
          attribution.upline3,
          attribution.referred_user,
          'revshare'::TEXT,
          user_activity.total_spent,
          settings.revshare_l3,
          (user_activity.total_spent * settings.revshare_l3)::BIGINT,
          3;
      END IF;
    END IF;

    -- NGR: Net Gaming Revenue (se configurado)
    IF settings.plan_type = 'ngr' OR settings.plan_type = 'hybrid' THEN
      DECLARE
        net_gaming_revenue BIGINT;
      BEGIN
        -- Calcular NGR: gastos - ganhos
        SELECT 
          COALESCE(SUM(CASE WHEN wt.type = 'purchase' THEN ABS(wt.amount_cents) ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN wt.type = 'deposit' AND wt.description LIKE '%prêmio%' THEN wt.amount_cents ELSE 0 END), 0)
        INTO net_gaming_revenue
        FROM wallet_transactions wt
        WHERE wt.user_id = attribution.referred_user
          AND wt.created_at >= p_period_start
          AND wt.created_at <= p_period_end;

        IF net_gaming_revenue > 0 THEN
          -- Nível 1
          RETURN QUERY SELECT
            attribution.affiliate_id,
            attribution.referred_user,
            'ngr'::TEXT,
            net_gaming_revenue,
            settings.ngr_l1,
            (net_gaming_revenue * settings.ngr_l1)::BIGINT,
            1;
          
          -- Nível 2
          IF attribution.upline2 IS NOT NULL THEN
            RETURN QUERY SELECT
              attribution.upline2,
              attribution.referred_user,
              'ngr'::TEXT,
              net_gaming_revenue,
              settings.ngr_l2,
              (net_gaming_revenue * settings.ngr_l2)::BIGINT,
              2;
          END IF;
          
          -- Nível 3
          IF attribution.upline3 IS NOT NULL THEN
            RETURN QUERY SELECT
              attribution.upline3,
              attribution.referred_user,
              'ngr'::TEXT,
              net_gaming_revenue,
              settings.ngr_l3,
              (net_gaming_revenue * settings.ngr_l3)::BIGINT,
              3;
          END IF;
        END IF;
      END;
    END IF;
  END LOOP;
END;
$$;

-- Função para processar pagamento de comissões aprovadas
CREATE OR REPLACE FUNCTION process_affiliate_payouts()
RETURNS TABLE(
  affiliate_id UUID,
  total_amount_cents BIGINT,
  commission_count INTEGER,
  payout_success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  settings RECORD;
  affiliate_record RECORD;
  total_approved BIGINT;
  wallet_id UUID;
BEGIN
  -- Buscar configurações
  SELECT * INTO settings FROM affiliate_settings WHERE id = true;
  
  -- Processar pagamentos para cada afiliado
  FOR affiliate_record IN 
    SELECT 
      ac.affiliate_id,
      SUM(ac.amount_cents) as total_amount,
      COUNT(*) as commission_count
    FROM affiliate_commissions ac
    WHERE ac.status = 'approved' 
      AND ac.paid_at IS NULL
    GROUP BY ac.affiliate_id
    HAVING SUM(ac.amount_cents) >= settings.payout_min_cents
  LOOP
    -- Buscar carteira do afiliado
    SELECT id INTO wallet_id
    FROM user_wallets
    WHERE user_id = affiliate_record.affiliate_id;
    
    IF wallet_id IS NOT NULL THEN
      BEGIN
        -- Adicionar saldo à carteira
        UPDATE user_wallets
        SET 
          balance = balance + (affiliate_record.total_amount::NUMERIC / 100),
          total_deposited = total_deposited + (affiliate_record.total_amount::NUMERIC / 100),
          updated_at = now()
        WHERE id = wallet_id;

        -- Criar transação na carteira
        INSERT INTO wallet_transactions (
          user_id, wallet_id, amount_cents, type, description, metadata
        ) VALUES (
          affiliate_record.affiliate_id,
          wallet_id,
          affiliate_record.total_amount,
          'deposit',
          'Pagamento de comissões de afiliado',
          jsonb_build_object(
            'commission_count', affiliate_record.commission_count,
            'payout_type', 'affiliate_commission'
          )
        );

        -- Marcar comissões como pagas
        UPDATE affiliate_commissions
        SET 
          status = 'paid',
          paid_at = now()
        WHERE affiliate_id = affiliate_record.affiliate_id
          AND status = 'approved'
          AND paid_at IS NULL;

        RETURN QUERY SELECT
          affiliate_record.affiliate_id,
          affiliate_record.total_amount,
          affiliate_record.commission_count,
          true;

      EXCEPTION WHEN OTHERS THEN
        -- Log do erro e continuar
        INSERT INTO admin_error_logs (
          error_type,
          error_message,
          severity,
          metadata
        ) VALUES (
          'affiliate_payout_error',
          SQLERRM,
          'high',
          jsonb_build_object(
            'affiliate_id', affiliate_record.affiliate_id,
            'amount', affiliate_record.total_amount
          )
        );

        RETURN QUERY SELECT
          affiliate_record.affiliate_id,
          affiliate_record.total_amount,
          affiliate_record.commission_count,
          false;
      END;
    ELSE
      RETURN QUERY SELECT
        affiliate_record.affiliate_id,
        affiliate_record.total_amount,
        affiliate_record.commission_count,
        false;
    END IF;
  END LOOP;
END;
$$;

-- Função para executar job de cálculo de comissões
CREATE OR REPLACE FUNCTION run_affiliate_commission_job()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  settings RECORD;
  period_start DATE;
  period_end DATE;
  commission_record RECORD;
  total_processed INTEGER := 0;
  result JSONB;
BEGIN
  -- Buscar configurações
  SELECT * INTO settings FROM affiliate_settings WHERE id = true;
  
  -- Definir período (última semana)
  period_end := CURRENT_DATE - 1;
  period_start := period_end - 6;
  
  -- Calcular e inserir comissões
  FOR commission_record IN 
    SELECT * FROM calculate_affiliate_commissions(period_start, period_end)
  LOOP
    -- Verificar se a comissão já existe
    IF NOT EXISTS (
      SELECT 1 FROM affiliate_commissions
      WHERE affiliate_id = commission_record.affiliate_id
        AND referred_user = commission_record.referred_user
        AND kind = commission_record.commission_type
        AND period_start = period_start
        AND period_end = period_end
        AND level = commission_record.level
    ) THEN
      INSERT INTO affiliate_commissions (
        affiliate_id,
        referred_user,
        kind,
        level,
        base_amount_cents,
        rate,
        amount_cents,
        period_start,
        period_end,
        status
      ) VALUES (
        commission_record.affiliate_id,
        commission_record.referred_user,
        commission_record.commission_type,
        commission_record.level,
        commission_record.base_amount_cents,
        commission_record.commission_rate,
        commission_record.commission_amount_cents,
        period_start,
        period_end,
        CASE WHEN settings.require_manual_approval THEN 'accrued' ELSE 'approved' END
      );
      
      total_processed := total_processed + 1;
    END IF;
  END LOOP;

  result := jsonb_build_object(
    'period_start', period_start,
    'period_end', period_end,
    'commissions_processed', total_processed,
    'processed_at', now()
  );

  -- Log da execução
  INSERT INTO admin_action_logs (
    admin_user_id,
    action_type,
    description,
    metadata
  ) VALUES (
    NULL,
    'AFFILIATE_COMMISSION_JOB',
    'Job automático de cálculo de comissões executado',
    result
  );

  RETURN result;
END;
$$;