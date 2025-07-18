-- Criar função para inserir carteira automaticamente quando um usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Inserir carteira apenas se ainda não existir
  INSERT INTO public.user_wallets (user_id, balance, total_deposited, total_withdrawn, total_spent)
  VALUES (NEW.id, 0.00, 0.00, 0.00, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função quando um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- Atualizar política RLS para permitir inserção de carteiras pelo trigger
DROP POLICY IF EXISTS "Allow system to create wallets" ON public.user_wallets;
CREATE POLICY "Allow system to create wallets"
  ON public.user_wallets
  FOR INSERT
  WITH CHECK (true);

-- Garantir que usuários existentes tenham carteiras
INSERT INTO public.user_wallets (user_id, balance, total_deposited, total_withdrawn, total_spent)
SELECT 
  id, 
  0.00, 
  0.00, 
  0.00, 
  0.00
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_wallets)
ON CONFLICT (user_id) DO NOTHING;