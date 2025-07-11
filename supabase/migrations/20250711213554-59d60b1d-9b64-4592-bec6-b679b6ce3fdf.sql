-- 1. Atualizar probabilidades de 1 para 0 na tabela items
UPDATE public.items 
SET probability_weight = 0 
WHERE probability_weight = 1;

-- 3. Criar nova tabela metas_baus
CREATE TABLE public.metas_baus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_bau TEXT NOT NULL UNIQUE,
  meta_valor NUMERIC NOT NULL DEFAULT 100.00,
  valor_atual NUMERIC NOT NULL DEFAULT 0.00,
  notificacao_enviada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metas_baus ENABLE ROW LEVEL SECURITY;

-- Policies para metas_baus
CREATE POLICY "Admins can manage chest goals" 
ON public.metas_baus 
FOR ALL 
USING (is_admin_user());

-- Inserir dados iniciais para os tipos de baús
INSERT INTO public.metas_baus (nome_bau, meta_valor) VALUES
('prata', 100.00),
('ouro', 500.00),
('rubi', 1000.00),
('diamante', 2000.00);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_metas_baus_updated_at
  BEFORE UPDATE ON public.metas_baus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();