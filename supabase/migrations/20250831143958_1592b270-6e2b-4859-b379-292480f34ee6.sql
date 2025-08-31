-- Criar tabelas do sistema de configurações

-- Tabela para limites do sistema (saques, depósitos, etc.)
CREATE TABLE public.system_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  limit_type TEXT NOT NULL, -- 'daily_withdrawal', 'weekly_withdrawal', 'monthly_withdrawal', 'min_deposit', 'max_deposit', etc.
  limit_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  user_type TEXT NOT NULL DEFAULT 'normal', -- 'normal', 'vip', 'admin'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configuração de gateways de pagamento  
CREATE TABLE public.payment_gateways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway_name TEXT NOT NULL, -- 'suitpay', 'mercadopago', 'pix_direct'
  gateway_type TEXT NOT NULL, -- 'pix', 'card', 'bank_transfer'
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0,
  configuration JSONB NOT NULL DEFAULT '{}',
  api_credentials JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações específicas de pagamento
CREATE TABLE public.payment_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  config_type TEXT NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  category TEXT NOT NULL, -- 'deposit', 'withdrawal', 'bonus', 'commission'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_system_limits_type_user ON public.system_limits(limit_type, user_type);
CREATE INDEX idx_payment_gateways_active ON public.payment_gateways(is_active, priority);
CREATE INDEX idx_payment_config_category ON public.payment_configurations(category, is_active);

-- RLS Policies
ALTER TABLE public.system_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_configurations ENABLE ROW LEVEL SECURITY;

-- Policies para system_limits
CREATE POLICY "Admins can manage system limits" ON public.system_limits
  FOR ALL USING (is_admin_user());

CREATE POLICY "Users can view active limits" ON public.system_limits
  FOR SELECT USING (is_active = true);

-- Policies para payment_gateways
CREATE POLICY "Admins can manage payment gateways" ON public.payment_gateways
  FOR ALL USING (is_admin_user());

CREATE POLICY "Users can view active gateways" ON public.payment_gateways
  FOR SELECT USING (is_active = true);

-- Policies para payment_configurations
CREATE POLICY "Admins can manage payment configurations" ON public.payment_configurations
  FOR ALL USING (is_admin_user());

CREATE POLICY "Users can view active payment configurations" ON public.payment_configurations
  FOR SELECT USING (is_active = true);

-- Inserir configurações iniciais preservando sistema atual
INSERT INTO public.payment_gateways (gateway_name, gateway_type, is_active, is_primary, priority, configuration) VALUES
('suitpay', 'pix', true, true, 1, '{"description": "Gateway PIX principal via SUITPAY", "supports_qrcode": true}'),
('mercadopago', 'card', false, false, 2, '{"description": "Gateway de emergência MercadoPago", "supports_credit": true, "supports_debit": true}');

-- Inserir limites padrão
INSERT INTO public.system_limits (limit_type, limit_value, user_type) VALUES
('daily_withdrawal', 1000.00, 'normal'),
('daily_withdrawal', 5000.00, 'vip'),
('weekly_withdrawal', 5000.00, 'normal'),
('weekly_withdrawal', 20000.00, 'vip'),
('monthly_withdrawal', 15000.00, 'normal'),
('monthly_withdrawal', 50000.00, 'vip'),
('min_deposit', 10.00, 'normal'),
('max_deposit', 5000.00, 'normal'),
('max_deposit', 20000.00, 'vip');

-- Inserir configurações padrão de pagamento
INSERT INTO public.payment_configurations (config_key, config_value, config_type, category, description) VALUES
('min_deposit_amount', '10.00', 'number', 'deposit', 'Valor mínimo para depósitos'),
('max_deposit_amount', '5000.00', 'number', 'deposit', 'Valor máximo para depósitos'),
('min_withdrawal_amount', '25.00', 'number', 'withdrawal', 'Valor mínimo para saques'),
('withdrawal_fee_percentage', '0.00', 'number', 'withdrawal', 'Taxa percentual sobre saques'),
('affiliate_commission_l1', '0.05', 'number', 'commission', 'Comissão nível 1 (5%)'),
('affiliate_commission_l2', '0.02', 'number', 'commission', 'Comissão nível 2 (2%)'),
('affiliate_commission_l3', '0.01', 'number', 'commission', 'Comissão nível 3 (1%)');

-- Triggers para updated_at
CREATE TRIGGER update_system_limits_updated_at
  BEFORE UPDATE ON public.system_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_payment_configurations_updated_at
  BEFORE UPDATE ON public.payment_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();