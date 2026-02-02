-- Reverter as políticas restritivas de admin_users para o estado anterior funcional

-- Remover as políticas restritivas criadas
DROP POLICY IF EXISTS "Super admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can view own record" ON admin_users;
DROP POLICY IF EXISTS "Super admins can create admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin users" ON admin_users;

-- Restaurar a política original que permite aos admins gerenciar usuários admin
CREATE POLICY "Admins can manage admin users v2"
ON admin_users
FOR ALL
USING (check_admin_direct(auth.uid()));

-- A função is_super_admin pode permanecer pois não afeta funcionalidade existente