-- Habilitar RLS nas novas tabelas
ALTER TABLE rtp_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtp_alert_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para rtp_alerts
CREATE POLICY "Admins can manage all alerts" ON rtp_alerts
  FOR ALL USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "System can create alerts" ON rtp_alerts
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para rtp_alert_settings  
CREATE POLICY "Admins can manage alert settings" ON rtp_alert_settings
  FOR ALL USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "System can create alert settings" ON rtp_alert_settings
  FOR INSERT WITH CHECK (true);