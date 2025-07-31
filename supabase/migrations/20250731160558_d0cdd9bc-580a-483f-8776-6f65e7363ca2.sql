-- CORREÇÃO CRÍTICA: Resolver recursão infinita nas políticas de admin_users

-- Remover as políticas problemáticas que causam recursão
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view their own admin status" ON public.admin_users;

-- Criar políticas corretas sem recursão infinita
-- Política mais permissiva temporariamente para restaurar acesso
CREATE POLICY "Allow admin management"
ON public.admin_users
FOR ALL
USING (true)
WITH CHECK (true);

-- Recriar as funções de verificação admin de forma mais segura
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Usar auth.uid() diretamente sem consultar admin_users dentro da política
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN false
    ELSE true -- Temporário para restaurar acesso
  END;
$$;

-- Função específica para verificar admin sem recursão
CREATE OR REPLACE FUNCTION public.check_admin_direct(user_id_check uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_id_check 
    AND is_active = true
  );
$$;

-- Política mais restritiva que será aplicada depois
CREATE POLICY "Admins can manage admin users v2"
ON public.admin_users
FOR ALL
USING (
  -- Usar verificação direta sem causar recursão
  public.check_admin_direct(auth.uid())
);

-- Habilitar a política correta e desabilitar a temporária
DROP POLICY "Allow admin management" ON public.admin_users;

-- Restaurar função is_admin_user correta
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.check_admin_direct(auth.uid());
$$;

-- Restaurar função is_admin_role correta
CREATE OR REPLACE FUNCTION public.is_admin_role()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
$$;