-- Habilitar RLS nas tabelas que não têm RLS ativado
ALTER TABLE public.scratch_card_daily_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scratch_card_financial_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scratch_card_games ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para scratch_card_daily_budget
CREATE POLICY "Admins can manage daily budget" ON public.scratch_card_daily_budget
FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "System can manage daily budget" ON public.scratch_card_daily_budget
FOR ALL USING (true) WITH CHECK (true);

-- Criar políticas RLS para scratch_card_financial_control
CREATE POLICY "Admins can view financial control" ON public.scratch_card_financial_control
FOR SELECT USING (is_admin_user());

CREATE POLICY "System can manage financial control" ON public.scratch_card_financial_control
FOR ALL USING (true) WITH CHECK (true);

-- As políticas para scratch_card_games já existem, então não preciso criar novamente