-- CORREÇÃO FINAL DE SEGURANÇA: Habilitar RLS nas tabelas que têm políticas mas não têm RLS habilitado

-- Habilitar RLS nas tabelas que têm políticas mas RLS desabilitado
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;