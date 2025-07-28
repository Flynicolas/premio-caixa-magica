-- Criar tabela para probabilidades das raspadinhas
CREATE TABLE public.scratch_card_probabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scratch_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  probability_weight INTEGER NOT NULL DEFAULT 1,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para controle financeiro das raspadinhas
CREATE TABLE public.scratch_card_financial_control (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scratch_type TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sales NUMERIC DEFAULT 0.00,
  total_prizes_given NUMERIC DEFAULT 0.00,
  net_profit NUMERIC DEFAULT 0.00,
  cards_played INTEGER DEFAULT 0,
  profit_goal NUMERIC DEFAULT 100.00,
  goal_reached BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para configurações das raspadinhas
CREATE TABLE public.scratch_card_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scratch_type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  background_image TEXT,
  is_active BOOLEAN DEFAULT true,
  win_probability NUMERIC DEFAULT 0.30,
  house_edge NUMERIC DEFAULT 0.20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir configurações padrão das raspadinhas
INSERT INTO public.scratch_card_settings (scratch_type, name, price, win_probability) VALUES
('sorte', 'Raspadinha da Sorte', 1.00, 0.25),
('dupla', 'Raspadinha Dupla', 2.50, 0.28),
('ouro', 'Raspadinha de Ouro', 5.00, 0.30),
('diamante', 'Raspadinha Diamante', 10.00, 0.32),
('premium', 'Raspadinha Premium', 25.00, 0.35);

-- Habilitar RLS
ALTER TABLE public.scratch_card_probabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scratch_card_financial_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scratch_card_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para scratch_card_probabilities
CREATE POLICY "Admins can manage scratch probabilities" 
ON public.scratch_card_probabilities 
FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true))
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true));

CREATE POLICY "Anyone can view active scratch probabilities" 
ON public.scratch_card_probabilities 
FOR SELECT 
USING (is_active = true);

-- Políticas para scratch_card_financial_control
CREATE POLICY "Admins can manage scratch financial control" 
ON public.scratch_card_financial_control 
FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true));

-- Políticas para scratch_card_settings
CREATE POLICY "Admins can manage scratch settings" 
ON public.scratch_card_settings 
FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true));

CREATE POLICY "Anyone can view active scratch settings" 
ON public.scratch_card_settings 
FOR SELECT 
USING (is_active = true);

-- Função para atualizar timestamp
CREATE TRIGGER update_scratch_card_financial_control_updated_at
BEFORE UPDATE ON public.scratch_card_financial_control
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scratch_card_settings_updated_at
BEFORE UPDATE ON public.scratch_card_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();