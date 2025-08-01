-- Refatorar sistema para resgate direto de itens tipo dinheiro
-- Remover tabelas de conversão monetária (não mais necessárias)
DROP TABLE IF EXISTS public.monetary_conversions CASCADE;
DROP TABLE IF EXISTS public.conversion_security_alerts CASCADE;
DROP TABLE IF EXISTS public.daily_conversion_limits CASCADE;

-- Criar tabela para monitoramento de resgates de dinheiro
CREATE TABLE public.money_item_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  inventory_id UUID NOT NULL,
  item_id UUID NOT NULL,
  redemption_amount DECIMAL(10,2) NOT NULL,
  redemption_status TEXT NOT NULL DEFAULT 'completed',
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID NULL,
  approved_at TIMESTAMP WITH TIME ZONE NULL,
  security_score INTEGER NOT NULL DEFAULT 0, -- Score de 0-100 para suspeita
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para alertas de segurança de resgates
CREATE TABLE public.money_redemption_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  redemption_id UUID NULL,
  alert_type TEXT NOT NULL, -- 'high_value', 'frequent_redemptions', 'suspicious_pattern'
  alert_level TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  alert_data JSONB DEFAULT '{}',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID NULL,
  resolved_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para limites diários de resgates
CREATE TABLE public.daily_redemption_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_redeemed DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  redemption_count INTEGER NOT NULL DEFAULT 0,
  last_redemption_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.money_item_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_redemption_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_redemption_limits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para resgates
CREATE POLICY "Users can view their own redemptions" ON public.money_item_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create redemptions" ON public.money_item_redemptions
  FOR INSERT WITH CHECK ((auth.uid() = user_id) OR is_admin_user());

CREATE POLICY "Admins can manage all redemptions" ON public.money_item_redemptions
  FOR ALL USING (is_admin_user());

-- Políticas RLS para alertas
CREATE POLICY "Admins can manage redemption alerts" ON public.money_redemption_alerts
  FOR ALL USING (is_admin_user());

-- Políticas RLS para limites diários
CREATE POLICY "Users can view their own limits" ON public.daily_redemption_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage limits" ON public.daily_redemption_limits
  FOR ALL USING ((auth.uid() = user_id) OR is_admin_user());

-- Função para validar resgate de item dinheiro
CREATE OR REPLACE FUNCTION public.validate_money_item_redemption(
  p_user_id UUID,
  p_item_id UUID,
  p_redemption_amount DECIMAL
)
RETURNS TABLE(
  is_valid BOOLEAN,
  requires_approval BOOLEAN,
  error_message TEXT,
  daily_total DECIMAL,
  redemption_count INTEGER,
  security_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  item_category TEXT;
  user_daily_total DECIMAL := 0;
  user_redemption_count INTEGER := 0;
  last_redemption TIMESTAMP WITH TIME ZONE;
  cooldown_minutes INTEGER := 1; -- Cooldown de 1 minuto entre resgates
  max_daily_amount DECIMAL := 10000.00; -- Limite diário de R$ 10.000
  approval_threshold DECIMAL := 1000.00; -- Aprovação manual acima de R$ 1.000
  calculated_security_score INTEGER := 0;
BEGIN
  -- Verificar se o item é categoria 'dinheiro'
  SELECT category INTO item_category
  FROM public.items
  WHERE id = p_item_id AND is_active = true;
  
  IF item_category != 'dinheiro' THEN
    RETURN QUERY SELECT false, false, 'Item não é da categoria dinheiro', 0.00::DECIMAL, 0, 0;
    RETURN;
  END IF;
  
  -- Buscar limites diários atuais
  SELECT 
    COALESCE(total_redeemed, 0),
    COALESCE(redemption_count, 0),
    last_redemption_at
  INTO user_daily_total, user_redemption_count, last_redemption
  FROM public.daily_redemption_limits
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  -- Verificar limite diário
  IF (user_daily_total + p_redemption_amount) > max_daily_amount THEN
    RETURN QUERY SELECT false, false, 'Limite diário excedido (R$ 10.000)', user_daily_total, user_redemption_count, 0;
    RETURN;
  END IF;
  
  -- Verificar cooldown
  IF last_redemption IS NOT NULL AND 
     last_redemption > (now() - interval '1 minute') THEN
    RETURN QUERY SELECT false, false, 'Aguarde 1 minuto entre resgates', user_daily_total, user_redemption_count, 0;
    RETURN;
  END IF;
  
  -- Calcular score de segurança (0-100)
  calculated_security_score := 0;
  
  -- Valor alto
  IF p_redemption_amount >= 1000 THEN
    calculated_security_score := calculated_security_score + 40;
  ELSIF p_redemption_amount >= 500 THEN
    calculated_security_score := calculated_security_score + 20;
  END IF;
  
  -- Muitos resgates no dia
  IF user_redemption_count >= 10 THEN
    calculated_security_score := calculated_security_score + 30;
  ELSIF user_redemption_count >= 5 THEN
    calculated_security_score := calculated_security_score + 15;
  END IF;
  
  -- Resgate muito rápido após o anterior
  IF last_redemption IS NOT NULL AND 
     last_redemption > (now() - interval '2 minutes') THEN
    calculated_security_score := calculated_security_score + 25;
  END IF;
  
  -- Verificar se precisa de aprovação manual
  IF p_redemption_amount >= approval_threshold OR calculated_security_score >= 70 THEN
    RETURN QUERY SELECT true, true, 'Resgate válido - requer aprovação manual', user_daily_total, user_redemption_count, calculated_security_score;
    RETURN;
  END IF;
  
  -- Resgate válido e aprovado automaticamente
  RETURN QUERY SELECT true, false, 'Resgate válido', user_daily_total, user_redemption_count, calculated_security_score;
END;
$$;

-- Função para processar resgate de item dinheiro
CREATE OR REPLACE FUNCTION public.process_money_item_redemption(
  p_user_id UUID,
  p_item_id UUID,
  p_inventory_id UUID,
  p_redemption_amount DECIMAL
)
RETURNS TABLE(
  redemption_id UUID,
  status TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  validation_result RECORD;
  new_redemption_id UUID;
  wallet_id UUID;
  requires_approval BOOLEAN := false;
BEGIN
  -- Validar resgate
  SELECT * INTO validation_result
  FROM public.validate_money_item_redemption(p_user_id, p_item_id, p_redemption_amount);
  
  IF NOT validation_result.is_valid THEN
    RETURN QUERY SELECT NULL::UUID, 'error', validation_result.error_message;
    RETURN;
  END IF;
  
  requires_approval := validation_result.requires_approval;
  
  -- Verificar se o item ainda está no inventário e não foi resgatado
  IF NOT EXISTS (
    SELECT 1 FROM public.user_inventory 
    WHERE id = p_inventory_id 
    AND user_id = p_user_id 
    AND item_id = p_item_id 
    AND is_redeemed = false
  ) THEN
    RETURN QUERY SELECT NULL::UUID, 'error', 'Item não encontrado ou já foi resgatado';
    RETURN;
  END IF;
  
  -- Buscar carteira do usuário
  SELECT id INTO wallet_id
  FROM public.user_wallets
  WHERE user_id = p_user_id;
  
  IF wallet_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, 'error', 'Carteira não encontrada';
    RETURN;
  END IF;
  
  -- Criar registro de resgate
  INSERT INTO public.money_item_redemptions (
    user_id,
    inventory_id,
    item_id,
    redemption_amount,
    redemption_status,
    requires_approval,
    security_score,
    metadata
  ) VALUES (
    p_user_id,
    p_inventory_id,
    p_item_id,
    p_redemption_amount,
    CASE WHEN requires_approval THEN 'pending_approval' ELSE 'completed' END,
    requires_approval,
    validation_result.security_score,
    jsonb_build_object(
      'daily_total_before', validation_result.daily_total,
      'redemption_count_before', validation_result.redemption_count,
      'auto_approved', NOT requires_approval
    )
  ) RETURNING id INTO new_redemption_id;
  
  -- Se não precisa aprovação, processar imediatamente
  IF NOT requires_approval THEN
    -- Atualizar saldo da carteira
    UPDATE public.user_wallets
    SET 
      balance = balance + p_redemption_amount,
      total_deposited = total_deposited + p_redemption_amount,
      updated_at = now()
    WHERE id = wallet_id;
    
    -- Marcar item como resgatado
    UPDATE public.user_inventory
    SET 
      is_redeemed = true,
      redeemed_at = now()
    WHERE id = p_inventory_id;
    
    -- Criar transação na carteira
    INSERT INTO public.wallet_transactions (
      user_id,
      wallet_id,
      amount,
      type,
      description,
      metadata
    ) VALUES (
      p_user_id,
      wallet_id,
      p_redemption_amount,
      'money_redemption',
      'Resgate de prêmio em dinheiro',
      jsonb_build_object(
        'redemption_id', new_redemption_id,
        'item_id', p_item_id,
        'inventory_id', p_inventory_id
      )
    );
    
    RETURN QUERY SELECT new_redemption_id, 'completed', 'Resgate realizado com sucesso';
  ELSE
    -- Gerar alerta para aprovação manual
    INSERT INTO public.money_redemption_alerts (
      user_id,
      redemption_id,
      alert_type,
      alert_level,
      alert_data
    ) VALUES (
      p_user_id,
      new_redemption_id,
      CASE 
        WHEN validation_result.security_score >= 90 THEN 'suspicious_pattern'
        WHEN p_redemption_amount >= 1000 THEN 'high_value'
        ELSE 'frequent_redemptions'
      END,
      CASE 
        WHEN validation_result.security_score >= 90 THEN 'critical'
        WHEN validation_result.security_score >= 70 THEN 'high'
        ELSE 'medium'
      END,
      jsonb_build_object(
        'amount', p_redemption_amount,
        'security_score', validation_result.security_score,
        'requires_manual_approval', true
      )
    );
    
    RETURN QUERY SELECT new_redemption_id, 'pending_approval', 'Resgate aguardando aprovação manual';
  END IF;
  
  -- Atualizar limites diários
  INSERT INTO public.daily_redemption_limits (
    user_id,
    date,
    total_redeemed,
    redemption_count,
    last_redemption_at
  ) VALUES (
    p_user_id,
    CURRENT_DATE,
    p_redemption_amount,
    1,
    now()
  ) ON CONFLICT (user_id, date) DO UPDATE SET
    total_redeemed = daily_redemption_limits.total_redeemed + p_redemption_amount,
    redemption_count = daily_redemption_limits.redemption_count + 1,
    last_redemption_at = now(),
    updated_at = now();
END;
$$;