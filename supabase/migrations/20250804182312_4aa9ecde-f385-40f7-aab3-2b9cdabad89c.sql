-- Criar tabela para configurações dinâmicas das raspadinhas
CREATE TABLE IF NOT EXISTS public.scratch_card_dynamic_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scratch_type TEXT NOT NULL UNIQUE,
  dynamic_probability_enabled BOOLEAN NOT NULL DEFAULT true,
  base_win_probability NUMERIC NOT NULL DEFAULT 0.30,
  max_win_probability NUMERIC NOT NULL DEFAULT 0.50,
  min_win_probability NUMERIC NOT NULL DEFAULT 0.05,
  budget_threshold_high NUMERIC NOT NULL DEFAULT 100.00,
  budget_threshold_low NUMERIC NOT NULL DEFAULT 10.00,
  time_based_adjustment BOOLEAN NOT NULL DEFAULT false,
  peak_hours_start INTEGER NOT NULL DEFAULT 18,
  peak_hours_end INTEGER NOT NULL DEFAULT 23,
  peak_hours_multiplier NUMERIC NOT NULL DEFAULT 1.2,
  security_limits_enabled BOOLEAN NOT NULL DEFAULT true,
  max_wins_per_hour INTEGER NOT NULL DEFAULT 10,
  max_value_per_win NUMERIC NOT NULL DEFAULT 500.00,
  cooldown_after_big_win INTEGER NOT NULL DEFAULT 300,
  blackout_periods JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de ajustes de probabilidade
CREATE TABLE IF NOT EXISTS public.scratch_card_probability_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scratch_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_probability NUMERIC NOT NULL,
  budget_remaining NUMERIC NOT NULL DEFAULT 0.00,
  trigger_reason TEXT NOT NULL,
  adjustment_factor NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para liberações manuais melhorada (baseada na existente)
CREATE TABLE IF NOT EXISTS public.manual_scratch_releases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scratch_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  released_by UUID NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  priority INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  winner_user_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  drawn_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para alertas de segurança
CREATE TABLE IF NOT EXISTS public.scratch_card_security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scratch_type TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  alert_level TEXT NOT NULL DEFAULT 'medium',
  user_id UUID,
  alert_data JSONB DEFAULT '{}',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scratch_card_dynamic_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scratch_card_probability_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_scratch_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scratch_card_security_alerts ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Admins can manage dynamic config" 
ON public.scratch_card_dynamic_config 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins can view probability history" 
ON public.scratch_card_probability_history 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "System can insert probability history" 
ON public.scratch_card_probability_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage manual releases" 
ON public.manual_scratch_releases 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins can manage security alerts" 
ON public.scratch_card_security_alerts 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_scratch_dynamic_config_type ON public.scratch_card_dynamic_config(scratch_type);
CREATE INDEX IF NOT EXISTS idx_probability_history_type_time ON public.scratch_card_probability_history(scratch_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_manual_releases_type_status ON public.manual_scratch_releases(scratch_type, status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_type_level ON public.scratch_card_security_alerts(scratch_type, alert_level, is_resolved);

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scratch_dynamic_config_updated_at
BEFORE UPDATE ON public.scratch_card_dynamic_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manual_scratch_releases_updated_at
BEFORE UPDATE ON public.manual_scratch_releases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Inserir configurações padrão para cada tipo de raspadinha
INSERT INTO public.scratch_card_dynamic_config (
  scratch_type, 
  base_win_probability, 
  budget_threshold_high, 
  budget_threshold_low,
  max_value_per_win
) VALUES 
('pix', 0.35, 50, 5, 100),
('sorte', 0.30, 100, 10, 250),
('dupla', 0.25, 200, 20, 500),
('ouro', 0.20, 500, 50, 1000),
('diamante', 0.15, 1000, 100, 2500),
('premium', 0.10, 2000, 200, 5000)
ON CONFLICT (scratch_type) DO NOTHING;