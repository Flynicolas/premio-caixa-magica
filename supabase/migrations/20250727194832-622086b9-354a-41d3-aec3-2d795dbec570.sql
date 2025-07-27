-- Criar tabela para configurações demo
CREATE TABLE public.demo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  saldo_inicial NUMERIC NOT NULL DEFAULT 1000.00,
  tempo_reset_horas INTEGER NOT NULL DEFAULT 24,
  probabilidades_chest JSONB NOT NULL DEFAULT '{}',
  itens_demo JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO public.demo_settings (
  saldo_inicial,
  probabilidades_chest,
  itens_demo
) VALUES (
  1000.00,
  '{
    "basic": {"win_rate": 0.8, "rare_rate": 0.3},
    "silver": {"win_rate": 0.85, "rare_rate": 0.4},
    "gold": {"win_rate": 0.9, "rare_rate": 0.5},
    "diamond": {"win_rate": 0.95, "rare_rate": 0.6}
  }',
  '["demo_prize_1", "demo_prize_2", "demo_prize_3"]'
);

-- Tabela para inventário demo (separado do real)
CREATE TABLE public.demo_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID,
  item_name TEXT NOT NULL,
  item_image TEXT,
  chest_type TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  won_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_redeemed BOOLEAN NOT NULL DEFAULT false,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para demo_settings
ALTER TABLE public.demo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage demo settings" 
ON public.demo_settings 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Anyone can view demo settings" 
ON public.demo_settings 
FOR SELECT 
USING (true);

-- RLS para demo_inventory
ALTER TABLE public.demo_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own demo inventory" 
ON public.demo_inventory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage demo inventory" 
ON public.demo_inventory 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_demo_settings_updated_at
  BEFORE UPDATE ON public.demo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();