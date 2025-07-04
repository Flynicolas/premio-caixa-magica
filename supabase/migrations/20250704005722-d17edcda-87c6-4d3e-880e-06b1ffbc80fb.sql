
-- Criar tabela para convites de colaboradores
CREATE TABLE public.collaborator_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'collaborator',
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE NULL,
  accepted_by UUID REFERENCES auth.users(id) NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de convites
ALTER TABLE public.collaborator_invites ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem convites
CREATE POLICY "Admins can view invites" 
  ON public.collaborator_invites 
  FOR SELECT 
  USING (auth.uid() IN (
    SELECT user_id FROM admin_users WHERE is_active = true
  ));

-- Política para admins criarem convites
CREATE POLICY "Admins can create invites" 
  ON public.collaborator_invites 
  FOR INSERT 
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM admin_users WHERE is_active = true
  ));

-- Política para atualizar convites (aceitar)
CREATE POLICY "Anyone can accept valid invites" 
  ON public.collaborator_invites 
  FOR UPDATE 
  USING (token IS NOT NULL AND expires_at > now() AND NOT is_used);

-- Função para limpar convites expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.collaborator_invites 
  WHERE expires_at < now() AND NOT is_used;
END;
$$;

-- Atualizar tabela admin_action_logs para melhor estrutura
ALTER TABLE public.admin_action_logs 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Função para registrar ações administrativas
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_user_id UUID,
  p_action_type TEXT,
  p_description TEXT,
  p_affected_table TEXT DEFAULT NULL,
  p_affected_record_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_action_logs (
    admin_user_id,
    action_type,
    description,
    affected_table,
    affected_record_id,
    old_data,
    new_data,
    metadata
  ) VALUES (
    p_admin_user_id,
    p_action_type,
    p_description,
    p_affected_table,
    p_affected_record_id,
    p_old_data,
    p_new_data,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;
