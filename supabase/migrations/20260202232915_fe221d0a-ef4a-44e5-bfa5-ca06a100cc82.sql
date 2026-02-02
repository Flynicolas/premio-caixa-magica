-- Fix admin_users access: Only super-admins can view other admin accounts
-- Regular admins should only see their own admin record

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Admins can manage admin users v2" ON admin_users;

-- Create a function to check if user is super-admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true 
    AND role = 'super_admin'
  )
$$;

-- Create separate policies for different operations

-- Super-admins can view all admin users
CREATE POLICY "Super admins can view all admin users"
ON admin_users
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Regular admins can only view their own admin record
CREATE POLICY "Admins can view own record"
ON admin_users
FOR SELECT
USING (auth.uid() = user_id AND is_active = true);

-- Only super-admins can insert new admin users
CREATE POLICY "Super admins can create admin users"
ON admin_users
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

-- Only super-admins can update admin users
CREATE POLICY "Super admins can update admin users"
ON admin_users
FOR UPDATE
USING (is_super_admin(auth.uid()));

-- Only super-admins can delete admin users
CREATE POLICY "Super admins can delete admin users"
ON admin_users
FOR DELETE
USING (is_super_admin(auth.uid()));