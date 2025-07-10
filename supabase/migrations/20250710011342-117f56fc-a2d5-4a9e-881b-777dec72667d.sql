-- Deletar usuários demo criados anteriormente (buscar por email para evitar erro de UUID)
DELETE FROM public.user_wallets WHERE user_id IN (
  SELECT id FROM public.profiles WHERE email LIKE 'demo%@demo.local'
);

DELETE FROM public.profiles WHERE email LIKE 'demo%@demo.local';

-- Adicionar campo test_balance na tabela user_wallets para saldo fictício de administradores
ALTER TABLE public.user_wallets 
ADD COLUMN test_balance numeric DEFAULT 0.00;

-- Configurar administradores com simulate_actions = true e saldo de teste de 2000 reais
UPDATE public.profiles 
SET simulate_actions = true 
WHERE id IN (
  SELECT user_id FROM public.admin_users WHERE is_active = true
);

-- Adicionar saldo de teste de 2000 reais para administradores
UPDATE public.user_wallets 
SET test_balance = 2000.00 
WHERE user_id IN (
  SELECT user_id FROM public.admin_users WHERE is_active = true
);