-- Funções SQL para o Dashboard Admin de Conversões Monetárias

-- Função para obter estatísticas de conversões
CREATE OR REPLACE FUNCTION public.get_conversion_stats()
RETURNS TABLE(
    total_conversions BIGINT,
    total_amount NUMERIC,
    pending_approvals BIGINT,
    completed_today BIGINT,
    amount_today NUMERIC,
    avg_conversion_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.monetary_conversions WHERE conversion_status = 'completed') as total_conversions,
        (SELECT COALESCE(SUM(conversion_amount), 0) FROM public.monetary_conversions WHERE conversion_status = 'completed') as total_amount,
        (SELECT COUNT(*) FROM public.monetary_conversions WHERE approval_status = 'pending_approval') as pending_approvals,
        (SELECT COUNT(*) FROM public.monetary_conversions WHERE conversion_status = 'completed' AND DATE(processed_at) = CURRENT_DATE) as completed_today,
        (SELECT COALESCE(SUM(conversion_amount), 0) FROM public.monetary_conversions WHERE conversion_status = 'completed' AND DATE(processed_at) = CURRENT_DATE) as amount_today,
        (SELECT COALESCE(AVG(conversion_amount), 0) FROM public.monetary_conversions WHERE conversion_status = 'completed') as avg_conversion_amount;
END;
$$;

-- Função para obter dados diários de conversões
CREATE OR REPLACE FUNCTION public.get_daily_conversion_data(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
    date DATE,
    total_conversions BIGINT,
    total_amount NUMERIC,
    unique_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(mc.processed_at) as date,
        COUNT(*) as total_conversions,
        SUM(mc.conversion_amount) as total_amount,
        COUNT(DISTINCT mc.user_id) as unique_users
    FROM public.monetary_conversions mc
    WHERE mc.conversion_status = 'completed'
        AND mc.processed_at >= (CURRENT_DATE - INTERVAL '1 day' * days_back)
    GROUP BY DATE(mc.processed_at)
    ORDER BY DATE(mc.processed_at) DESC;
END;
$$;

-- Função para aprovar conversão manualmente
CREATE OR REPLACE FUNCTION public.approve_conversion(
    p_conversion_id UUID,
    p_admin_user_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    conversion_record RECORD;
    wallet_id UUID;
BEGIN
    -- Verificar se o usuário é admin
    IF NOT public.is_admin_user() THEN
        RETURN QUERY SELECT false, 'Acesso negado. Apenas administradores podem aprovar conversões.';
        RETURN;
    END IF;
    
    -- Buscar a conversão
    SELECT * INTO conversion_record
    FROM public.monetary_conversions
    WHERE id = p_conversion_id AND approval_status = 'pending_approval';
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Conversão não encontrada ou já foi processada.';
        RETURN;
    END IF;
    
    -- Verificar se o item ainda está no inventário
    IF NOT EXISTS (
        SELECT 1 FROM public.user_inventory 
        WHERE id = conversion_record.inventory_id 
        AND user_id = conversion_record.user_id 
        AND item_id = conversion_record.item_id 
        AND is_redeemed = false
    ) THEN
        RETURN QUERY SELECT false, 'Item não encontrado ou já foi resgatado.';
        RETURN;
    END IF;
    
    -- Buscar carteira do usuário
    SELECT id INTO wallet_id
    FROM public.user_wallets
    WHERE user_id = conversion_record.user_id;
    
    IF wallet_id IS NULL THEN
        RETURN QUERY SELECT false, 'Carteira do usuário não encontrada.';
        RETURN;
    END IF;
    
    -- Processar a conversão
    BEGIN
        -- Atualizar saldo da carteira
        UPDATE public.user_wallets
        SET 
            balance = balance + conversion_record.conversion_amount,
            total_deposited = total_deposited + conversion_record.conversion_amount,
            updated_at = now()
        WHERE id = wallet_id;
        
        -- Marcar item como resgatado
        UPDATE public.user_inventory
        SET 
            is_redeemed = true,
            redeemed_at = now()
        WHERE id = conversion_record.inventory_id;
        
        -- Criar transação na carteira
        INSERT INTO public.wallet_transactions (
            user_id,
            wallet_id,
            amount,
            type,
            description,
            metadata
        ) VALUES (
            conversion_record.user_id,
            wallet_id,
            conversion_record.conversion_amount,
            'prize_conversion',
            'Conversão de prêmio em dinheiro (aprovação manual)',
            jsonb_build_object(
                'conversion_id', p_conversion_id,
                'item_id', conversion_record.item_id,
                'inventory_id', conversion_record.inventory_id,
                'approved_by', p_admin_user_id
            )
        );
        
        -- Atualizar status da conversão
        UPDATE public.monetary_conversions
        SET 
            conversion_status = 'completed',
            approval_status = 'manually_approved',
            approved_by = p_admin_user_id,
            approved_at = now(),
            processed_at = now()
        WHERE id = p_conversion_id;
        
        -- Atualizar limites diários
        INSERT INTO public.daily_conversion_limits (
            user_id,
            date,
            total_converted,
            conversion_count,
            last_conversion_at
        ) VALUES (
            conversion_record.user_id,
            CURRENT_DATE,
            conversion_record.conversion_amount,
            1,
            now()
        ) ON CONFLICT (user_id, date) DO UPDATE SET
            total_converted = daily_conversion_limits.total_converted + conversion_record.conversion_amount,
            conversion_count = daily_conversion_limits.conversion_count + 1,
            last_conversion_at = now(),
            updated_at = now();
        
        RETURN QUERY SELECT true, 'Conversão aprovada e processada com sucesso.';
        
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT false, 'Erro ao processar aprovação: ' || SQLERRM;
    END;
END;
$$;

-- Função para rejeitar conversão
CREATE OR REPLACE FUNCTION public.reject_conversion(
    p_conversion_id UUID,
    p_admin_user_id UUID,
    p_rejection_reason TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar se o usuário é admin
    IF NOT public.is_admin_user() THEN
        RETURN QUERY SELECT false, 'Acesso negado. Apenas administradores podem rejeitar conversões.';
        RETURN;
    END IF;
    
    -- Verificar se a conversão existe e está pendente
    IF NOT EXISTS (
        SELECT 1 FROM public.monetary_conversions
        WHERE id = p_conversion_id AND approval_status = 'pending_approval'
    ) THEN
        RETURN QUERY SELECT false, 'Conversão não encontrada ou já foi processada.';
        RETURN;
    END IF;
    
    -- Atualizar status da conversão para rejeitada
    UPDATE public.monetary_conversions
    SET 
        conversion_status = 'cancelled',
        approval_status = 'rejected',
        approved_by = p_admin_user_id,
        approved_at = now(),
        metadata = metadata || jsonb_build_object(
            'rejection_reason', p_rejection_reason,
            'rejected_by', p_admin_user_id,
            'rejected_at', now()
        )
    WHERE id = p_conversion_id;
    
    RETURN QUERY SELECT true, 'Conversão rejeitada com sucesso.';
END;
$$;