-- Sistema de Conversão de Itens para Saldo Real
-- FASE 1: Foundation Secure

-- Tabela para controle de conversões monetárias
CREATE TABLE public.monetary_conversions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    inventory_id UUID NOT NULL,
    conversion_amount DECIMAL(10,2) NOT NULL,
    conversion_status TEXT NOT NULL DEFAULT 'pending',
    approval_status TEXT NOT NULL DEFAULT 'auto_approved',
    approved_by UUID NULL,
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    conversion_type TEXT NOT NULL DEFAULT 'item_to_balance',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT valid_conversion_status CHECK (conversion_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    CONSTRAINT valid_approval_status CHECK (approval_status IN ('pending_approval', 'auto_approved', 'manually_approved', 'rejected')),
    CONSTRAINT positive_amount CHECK (conversion_amount > 0)
);

-- Tabela para controle de limites diários
CREATE TABLE public.daily_conversion_limits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_converted DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    conversion_count INTEGER NOT NULL DEFAULT 0,
    last_conversion_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Tabela para alertas de segurança
CREATE TABLE public.conversion_security_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    alert_type TEXT NOT NULL,
    alert_level TEXT NOT NULL DEFAULT 'medium',
    conversion_id UUID NULL,
    alert_data JSONB DEFAULT '{}',
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID NULL,
    resolved_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_alert_type CHECK (alert_type IN ('high_value_conversion', 'daily_limit_reached', 'suspicious_pattern', 'rapid_conversions', 'duplicate_conversion')),
    CONSTRAINT valid_alert_level CHECK (alert_level IN ('low', 'medium', 'high', 'critical'))
);

-- Habilitar RLS
ALTER TABLE public.monetary_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_conversion_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_security_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para monetary_conversions
CREATE POLICY "Users can view their own conversions"
ON public.monetary_conversions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create conversions"
ON public.monetary_conversions
FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_admin_user());

CREATE POLICY "Admins can manage all conversions"
ON public.monetary_conversions
FOR ALL
USING (is_admin_user());

-- Políticas RLS para daily_conversion_limits
CREATE POLICY "Users can view their own limits"
ON public.daily_conversion_limits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage limits"
ON public.daily_conversion_limits
FOR ALL
USING (auth.uid() = user_id OR is_admin_user());

-- Políticas RLS para conversion_security_alerts
CREATE POLICY "Admins can manage security alerts"
ON public.conversion_security_alerts
FOR ALL
USING (is_admin_user());

-- Função para validar conversão monetária
CREATE OR REPLACE FUNCTION public.validate_monetary_conversion(
    p_user_id UUID,
    p_item_id UUID,
    p_conversion_amount DECIMAL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    requires_approval BOOLEAN,
    error_message TEXT,
    daily_total DECIMAL,
    conversion_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    item_category TEXT;
    user_daily_total DECIMAL := 0;
    user_conversion_count INTEGER := 0;
    last_conversion TIMESTAMP WITH TIME ZONE;
    cooldown_minutes INTEGER := 5; -- Cooldown de 5 minutos entre conversões
    max_daily_amount DECIMAL := 5000.00;
    approval_threshold DECIMAL := 2000.00;
BEGIN
    -- Verificar se o item é categoria 'dinheiro'
    SELECT category INTO item_category
    FROM public.items
    WHERE id = p_item_id AND is_active = true;
    
    IF item_category != 'dinheiro' THEN
        RETURN QUERY SELECT false, false, 'Item não é da categoria dinheiro', 0.00::DECIMAL, 0;
        RETURN;
    END IF;
    
    -- Buscar limites diários atuais
    SELECT 
        COALESCE(total_converted, 0),
        COALESCE(conversion_count, 0),
        last_conversion_at
    INTO user_daily_total, user_conversion_count, last_conversion
    FROM public.daily_conversion_limits
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
    
    -- Verificar limite diário
    IF (user_daily_total + p_conversion_amount) > max_daily_amount THEN
        RETURN QUERY SELECT false, false, 'Limite diário excedido (R$ 5.000)', user_daily_total, user_conversion_count;
        RETURN;
    END IF;
    
    -- Verificar cooldown
    IF last_conversion IS NOT NULL AND 
       last_conversion > (now() - interval '5 minutes') THEN
        RETURN QUERY SELECT false, false, 'Aguarde 5 minutos entre conversões', user_daily_total, user_conversion_count;
        RETURN;
    END IF;
    
    -- Verificar se precisa de aprovação manual
    IF p_conversion_amount >= approval_threshold THEN
        RETURN QUERY SELECT true, true, 'Conversão válida - requer aprovação manual', user_daily_total, user_conversion_count;
        RETURN;
    END IF;
    
    -- Conversão válida e aprovada automaticamente
    RETURN QUERY SELECT true, false, 'Conversão válida', user_daily_total, user_conversion_count;
END;
$$;

-- Função para processar conversão monetária
CREATE OR REPLACE FUNCTION public.process_monetary_conversion(
    p_user_id UUID,
    p_item_id UUID,
    p_inventory_id UUID,
    p_conversion_amount DECIMAL
)
RETURNS TABLE(
    conversion_id UUID,
    status TEXT,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    validation_result RECORD;
    new_conversion_id UUID;
    wallet_id UUID;
    requires_approval BOOLEAN := false;
BEGIN
    -- Validar conversão
    SELECT * INTO validation_result
    FROM public.validate_monetary_conversion(p_user_id, p_item_id, p_conversion_amount);
    
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
    
    -- Criar registro de conversão
    INSERT INTO public.monetary_conversions (
        user_id,
        item_id,
        inventory_id,
        conversion_amount,
        conversion_status,
        approval_status,
        metadata
    ) VALUES (
        p_user_id,
        p_item_id,
        p_inventory_id,
        p_conversion_amount,
        CASE WHEN requires_approval THEN 'pending' ELSE 'processing' END,
        CASE WHEN requires_approval THEN 'pending_approval' ELSE 'auto_approved' END,
        jsonb_build_object(
            'daily_total_before', validation_result.daily_total,
            'conversion_count_before', validation_result.conversion_count,
            'auto_approved', NOT requires_approval
        )
    ) RETURNING id INTO new_conversion_id;
    
    -- Se não precisa aprovação, processar imediatamente
    IF NOT requires_approval THEN
        -- Atualizar saldo da carteira
        UPDATE public.user_wallets
        SET 
            balance = balance + p_conversion_amount,
            total_deposited = total_deposited + p_conversion_amount,
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
            p_conversion_amount,
            'prize_conversion',
            'Conversão de prêmio em dinheiro',
            jsonb_build_object(
                'conversion_id', new_conversion_id,
                'item_id', p_item_id,
                'inventory_id', p_inventory_id
            )
        );
        
        -- Atualizar status da conversão
        UPDATE public.monetary_conversions
        SET 
            conversion_status = 'completed',
            processed_at = now()
        WHERE id = new_conversion_id;
        
        RETURN QUERY SELECT new_conversion_id, 'completed', 'Conversão realizada com sucesso';
    ELSE
        -- Gerar alerta para aprovação manual
        INSERT INTO public.conversion_security_alerts (
            user_id,
            alert_type,
            alert_level,
            conversion_id,
            alert_data
        ) VALUES (
            p_user_id,
            'high_value_conversion',
            'high',
            new_conversion_id,
            jsonb_build_object(
                'amount', p_conversion_amount,
                'requires_manual_approval', true
            )
        );
        
        RETURN QUERY SELECT new_conversion_id, 'pending_approval', 'Conversão aguardando aprovação manual';
    END IF;
    
    -- Atualizar limites diários
    INSERT INTO public.daily_conversion_limits (
        user_id,
        date,
        total_converted,
        conversion_count,
        last_conversion_at
    ) VALUES (
        p_user_id,
        CURRENT_DATE,
        p_conversion_amount,
        1,
        now()
    ) ON CONFLICT (user_id, date) DO UPDATE SET
        total_converted = daily_conversion_limits.total_converted + p_conversion_amount,
        conversion_count = daily_conversion_limits.conversion_count + 1,
        last_conversion_at = now(),
        updated_at = now();
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_daily_conversion_limits_updated_at
    BEFORE UPDATE ON public.daily_conversion_limits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();