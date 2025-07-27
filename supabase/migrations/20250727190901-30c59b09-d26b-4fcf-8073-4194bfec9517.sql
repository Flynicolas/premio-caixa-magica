-- Adicionar colunas para modo demo
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credito_demo NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS ultimo_reset_demo TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Atualizar usuários demo existentes com crédito inicial
UPDATE public.profiles 
SET credito_demo = 1000.00 
WHERE is_demo = true AND credito_demo = 0.00;

-- Função para resetar créditos demo após 24h
CREATE OR REPLACE FUNCTION public.reset_demo_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    credito_demo = 1000.00,
    ultimo_reset_demo = now()
  WHERE 
    is_demo = true 
    AND ultimo_reset_demo < (now() - interval '24 hours');
END;
$$;