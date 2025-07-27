-- Corrigir problemas de RLS que estavam desabilitados

-- Habilitar RLS em tabelas que não tinham
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_wallet_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chest_financial_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chest_item_probabilities ENABLE ROW LEVEL SECURITY;