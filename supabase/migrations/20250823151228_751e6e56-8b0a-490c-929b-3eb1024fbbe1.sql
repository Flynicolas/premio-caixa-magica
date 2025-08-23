-- CORREÇÃO DE SEGURANÇA: Criar apenas as políticas que faltam

-- Verificar se webhook_logs existe e habilitar RLS se necessário
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'webhook_logs') THEN
        ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
        
        -- Criar política para webhook_logs se não existir
        IF NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'webhook_logs' AND policyname = 'Admins can manage webhook logs') THEN
            EXECUTE 'CREATE POLICY "Admins can manage webhook logs" ON public.webhook_logs FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user())';
        END IF;
    END IF;
END $$;