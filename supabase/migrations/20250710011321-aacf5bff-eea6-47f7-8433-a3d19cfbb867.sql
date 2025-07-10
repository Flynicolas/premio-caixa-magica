-- Deletar usuários demo criados anteriormente
DELETE FROM public.user_wallets WHERE user_id IN (
  'demo-user-01', 'demo-user-02', 'demo-user-03', 'demo-user-04', 'demo-user-05',
  'demo-user-06', 'demo-user-07', 'demo-user-08', 'demo-user-09', 'demo-user-10',
  'demo-user-11', 'demo-user-12', 'demo-user-13', 'demo-user-14', 'demo-user-15',
  'demo-user-16', 'demo-user-17', 'demo-user-18', 'demo-user-19', 'demo-user-20'
);

DELETE FROM public.profiles WHERE id IN (
  'demo-user-01', 'demo-user-02', 'demo-user-03', 'demo-user-04', 'demo-user-05',
  'demo-user-06', 'demo-user-07', 'demo-user-08', 'demo-user-09', 'demo-user-10',
  'demo-user-11', 'demo-user-12', 'demo-user-13', 'demo-user-14', 'demo-user-15',
  'demo-user-16', 'demo-user-17', 'demo-user-18', 'demo-user-19', 'demo-user-20'
);

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