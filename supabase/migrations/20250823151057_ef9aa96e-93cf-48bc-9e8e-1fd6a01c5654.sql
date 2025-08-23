-- CORREÇÃO DE SEGURANÇA: Habilitar RLS nas tabelas que estavam faltando (sem IF NOT EXISTS)

-- 1) user_achievements - usuários veem seus próprios achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user achievements" ON public.user_achievements
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

-- 2) user_inventory - usuários veem seu próprio inventário
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory" ON public.user_inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user inventory" ON public.user_inventory
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

-- 3) user_levels - visualização pública (informações de level)
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user levels" ON public.user_levels
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage user levels" ON public.user_levels
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

-- 4) wallet_transactions - usuários veem suas próprias transações
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create wallet transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage wallet transactions" ON public.wallet_transactions
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

-- 5) webhook_logs - apenas para admins (logs do sistema)
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage webhook logs" ON public.webhook_logs
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());