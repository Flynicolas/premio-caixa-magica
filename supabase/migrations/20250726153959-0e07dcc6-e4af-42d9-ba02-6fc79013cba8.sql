-- Criar tabela para logs de erros administrativos
CREATE TABLE public.admin_error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  user_id UUID,
  user_agent TEXT,
  url TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Criar índices para performance
CREATE INDEX idx_admin_error_logs_created_at ON public.admin_error_logs(created_at DESC);
CREATE INDEX idx_admin_error_logs_severity ON public.admin_error_logs(severity);
CREATE INDEX idx_admin_error_logs_resolved ON public.admin_error_logs(resolved);
CREATE INDEX idx_admin_error_logs_user_id ON public.admin_error_logs(user_id);

-- Enable RLS
ALTER TABLE public.admin_error_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage error logs" 
ON public.admin_error_logs 
FOR ALL 
USING (is_admin_user());

CREATE POLICY "System can insert error logs" 
ON public.admin_error_logs 
FOR INSERT 
WITH CHECK (true);