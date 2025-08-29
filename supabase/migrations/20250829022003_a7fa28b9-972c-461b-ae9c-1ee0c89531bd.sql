-- Sistema de Alertas RTP
CREATE TABLE IF NOT EXISTS rtp_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'rtp_deviation', 'cap_exhausted', 'low_balance', 'high_loss'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  current_value NUMERIC,
  threshold_value NUMERIC,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rtp_alerts_game_type ON rtp_alerts(game_type);
CREATE INDEX IF NOT EXISTS idx_rtp_alerts_severity ON rtp_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_rtp_alerts_resolved ON rtp_alerts(resolved);

-- Tabela de configurações de alertas
CREATE TABLE IF NOT EXISTS rtp_alert_settings (
  game_type TEXT PRIMARY KEY,
  rtp_deviation_threshold NUMERIC DEFAULT 0.05, -- 5% de desvio
  low_balance_threshold NUMERIC DEFAULT 100.00,
  high_loss_threshold NUMERIC DEFAULT 1000.00,
  cap_warning_threshold NUMERIC DEFAULT 0.80, -- 80% do CAP
  email_notifications BOOLEAN DEFAULT TRUE,
  slack_notifications BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função para verificar e criar alertas RTP
CREATE OR REPLACE FUNCTION check_rtp_alerts()
RETURNS TABLE(alerts_created INTEGER, alerts_updated INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r RECORD;
  alert_settings RECORD;
  current_rtp NUMERIC;
  rtp_deviation NUMERIC;
  alerts_created_count INTEGER := 0;
  alerts_updated_count INTEGER := 0;
  existing_alert_id UUID;
BEGIN
  -- Loop através de cada game_type no rtp_pots
  FOR r IN 
    SELECT * FROM rtp_pots
  LOOP
    -- Buscar configurações de alerta para este game_type
    SELECT * INTO alert_settings
    FROM rtp_alert_settings
    WHERE game_type = r.game_type;
    
    -- Se não existir configuração, criar uma padrão
    IF NOT FOUND THEN
      INSERT INTO rtp_alert_settings (game_type)
      VALUES (r.game_type);
      
      SELECT * INTO alert_settings
      FROM rtp_alert_settings
      WHERE game_type = r.game_type;
    END IF;
    
    -- Calcular RTP atual
    current_rtp := CASE 
      WHEN r.total_bet > 0 THEN r.total_paid / r.total_bet 
      ELSE 0 
    END;
    
    -- Verificar desvio de RTP
    rtp_deviation := ABS(current_rtp - r.rtp_target);
    
    IF rtp_deviation > alert_settings.rtp_deviation_threshold THEN
      -- Verificar se já existe alerta não resolvido
      SELECT id INTO existing_alert_id
      FROM rtp_alerts
      WHERE game_type = r.game_type
        AND alert_type = 'rtp_deviation'
        AND resolved = FALSE
      LIMIT 1;
      
      IF existing_alert_id IS NULL THEN
        -- Criar novo alerta
        INSERT INTO rtp_alerts (
          game_type,
          alert_type,
          severity,
          current_value,
          threshold_value,
          message,
          metadata
        ) VALUES (
          r.game_type,
          'rtp_deviation',
          CASE 
            WHEN rtp_deviation > 0.10 THEN 'critical'
            WHEN rtp_deviation > 0.07 THEN 'high'
            ELSE 'medium'
          END,
          current_rtp,
          r.rtp_target,
          format('RTP do tipo %s está com desvio de %.2f%% (atual: %.2f%%, alvo: %.2f%%)',
                 r.game_type, rtp_deviation * 100, current_rtp * 100, r.rtp_target * 100),
          jsonb_build_object(
            'total_bet', r.total_bet,
            'total_paid', r.total_paid,
            'deviation_percentage', rtp_deviation * 100
          )
        );
        alerts_created_count := alerts_created_count + 1;
      ELSE
        -- Atualizar alerta existente
        UPDATE rtp_alerts
        SET 
          current_value = current_rtp,
          message = format('RTP do tipo %s está com desvio de %.2f%% (atual: %.2f%%, alvo: %.2f%%)',
                          r.game_type, rtp_deviation * 100, current_rtp * 100, r.rtp_target * 100),
          metadata = jsonb_build_object(
            'total_bet', r.total_bet,
            'total_paid', r.total_paid,
            'deviation_percentage', rtp_deviation * 100
          ),
          updated_at = NOW()
        WHERE id = existing_alert_id;
        alerts_updated_count := alerts_updated_count + 1;
      END IF;
    ELSE
      -- Resolver alertas de desvio se RTP voltou ao normal
      UPDATE rtp_alerts
      SET 
        resolved = TRUE,
        resolved_at = NOW(),
        updated_at = NOW()
      WHERE game_type = r.game_type
        AND alert_type = 'rtp_deviation'
        AND resolved = FALSE;
    END IF;
    
    -- Verificar saldo baixo (lucro da casa muito baixo)
    IF (r.total_bet - r.total_paid) < alert_settings.low_balance_threshold THEN
      SELECT id INTO existing_alert_id
      FROM rtp_alerts
      WHERE game_type = r.game_type
        AND alert_type = 'low_balance'
        AND resolved = FALSE
      LIMIT 1;
      
      IF existing_alert_id IS NULL THEN
        INSERT INTO rtp_alerts (
          game_type,
          alert_type,
          severity,
          current_value,
          threshold_value,
          message,
          metadata
        ) VALUES (
          r.game_type,
          'low_balance',
          'high',
          r.total_bet - r.total_paid,
          alert_settings.low_balance_threshold,
          format('Lucro baixo para %s: R$ %.2f (limite: R$ %.2f)',
                 r.game_type, r.total_bet - r.total_paid, alert_settings.low_balance_threshold),
          jsonb_build_object(
            'total_bet', r.total_bet,
            'total_paid', r.total_paid,
            'profit', r.total_bet - r.total_paid
          )
        );
        alerts_created_count := alerts_created_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT alerts_created_count, alerts_updated_count;
END;
$$;

-- View para relatórios avançados
CREATE OR REPLACE VIEW v_rtp_advanced_reports AS
SELECT 
  rp.game_type,
  rp.rtp_target,
  rp.total_bet,
  rp.total_paid,
  CASE WHEN rp.total_bet > 0 THEN rp.total_paid / rp.total_bet ELSE 0 END as rtp_current,
  rp.total_bet - rp.total_paid as profit,
  
  -- Estatísticas dos últimos 7 dias
  COALESCE(recent.plays_7d, 0) as plays_last_7_days,
  COALESCE(recent.bet_7d, 0) as bet_last_7_days,
  COALESCE(recent.paid_7d, 0) as paid_last_7_days,
  CASE WHEN recent.bet_7d > 0 THEN recent.paid_7d / recent.bet_7d ELSE 0 END as rtp_last_7_days,
  
  -- Estatísticas dos últimos 30 dias
  COALESCE(monthly.plays_30d, 0) as plays_last_30_days,
  COALESCE(monthly.bet_30d, 0) as bet_last_30_days,
  COALESCE(monthly.paid_30d, 0) as paid_last_30_days,
  CASE WHEN monthly.bet_30d > 0 THEN monthly.paid_30d / monthly.bet_30d ELSE 0 END as rtp_last_30_days,
  
  -- Alertas ativos
  COALESCE(alerts.active_alerts, 0) as active_alerts,
  COALESCE(alerts.critical_alerts, 0) as critical_alerts,
  
  rp.updated_at
FROM rtp_pots rp
LEFT JOIN (
  SELECT 
    game_type,
    COUNT(*) as plays_7d,
    SUM(bet) as bet_7d,
    SUM(prize) as paid_7d
  FROM game_rounds 
  WHERE decided_at >= NOW() - INTERVAL '7 days'
  GROUP BY game_type
) recent ON rp.game_type = recent.game_type
LEFT JOIN (
  SELECT 
    game_type,
    COUNT(*) as plays_30d,
    SUM(bet) as bet_30d,
    SUM(prize) as paid_30d
  FROM game_rounds 
  WHERE decided_at >= NOW() - INTERVAL '30 days'
  GROUP BY game_type
) monthly ON rp.game_type = monthly.game_type
LEFT JOIN (
  SELECT 
    game_type,
    COUNT(*) as active_alerts,
    SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_alerts
  FROM rtp_alerts 
  WHERE resolved = FALSE
  GROUP BY game_type
) alerts ON rp.game_type = alerts.game_type
ORDER BY rp.game_type;