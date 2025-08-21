-- Habilitar RLS em tabelas que estão faltando
ALTER TABLE public.cashouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_charges ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.pix_in_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_intents ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para as tabelas que precisam
CREATE POLICY "cashouts_own_rows" ON public.cashouts 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "pix_charges_own_rows" ON public.pix_charges 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "pix_in_events_system_only" ON public.pix_in_events 
  FOR ALL USING (false);

CREATE POLICY "pix_intents_own_rows" ON public.pix_intents 
  FOR ALL USING (auth.uid() = user_id);