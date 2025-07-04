
-- Restaurar acesso de administrador
-- Substitua 'seu-email@exemplo.com' pelo seu email real
DO $$
DECLARE
  current_user_id UUID;
  current_email TEXT;
BEGIN
  -- Pegar dados do usuário atual pelo email
  SELECT id, email INTO current_user_id, current_email
  FROM auth.users 
  WHERE email = 'mcguaguim@gmail.com' -- Substitua pelo seu email
  LIMIT 1;
  
  -- Se encontrou usuário, garantir que seja admin
  IF current_user_id IS NOT NULL THEN
    INSERT INTO public.admin_users (user_id, email, role, is_active, created_by)
    VALUES (current_user_id, current_email, 'admin', true, current_user_id)
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      is_active = true,
      email = EXCLUDED.email;
      
    RAISE NOTICE 'Usuário % restaurado como admin', current_email;
  ELSE
    RAISE NOTICE 'Usuário não encontrado com email: mcguaguim@gmail.com';
  END IF;
END $$;
