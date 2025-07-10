-- Criar perfil para o administrador que está faltando na tabela profiles
-- Isso permitirá que o saldo de teste apareça na carteira

INSERT INTO public.profiles (
  id, 
  email, 
  full_name, 
  simulate_actions, 
  is_active,
  created_at,
  updated_at
)
SELECT 
  au.user_id,
  au.email,
  au.email, -- usando email como full_name temporário
  true, -- simulate_actions = true para usar test_balance
  true, -- is_active = true
  now(),
  now()
FROM public.admin_users au
WHERE au.is_active = true 
  AND au.user_id NOT IN (SELECT id FROM public.profiles);