-- Correção Sistema 90/10: Ajustar probabilidades para níveis sustentáveis
UPDATE public.scratch_card_settings 
SET 
  win_probability_global = CASE 
    WHEN scratch_type = 'pix' THEN 1.5
    WHEN scratch_type = 'sorte' THEN 3.0
    WHEN scratch_type = 'dupla' THEN 2.5
    WHEN scratch_type = 'ouro' THEN 2.0
    WHEN scratch_type = 'diamante' THEN 0.8
    WHEN scratch_type = 'premium' THEN 0.5
    ELSE win_probability_global
  END,
  updated_at = now()
WHERE scratch_type IN ('pix', 'sorte', 'dupla', 'ouro', 'diamante', 'premium');

-- Função para calcular peso automático baseado no valor do item
CREATE OR REPLACE FUNCTION public.calculate_auto_weight_by_value(item_value numeric)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  -- Peso inversamente proporcional ao valor para garantir 90% de lucro
  IF item_value <= 10 THEN
    RETURN 100; -- Itens baratos: peso máximo
  ELSIF item_value <= 25 THEN
    RETURN 50;  -- Itens baixo valor: peso alto
  ELSIF item_value <= 50 THEN
    RETURN 25;  -- Itens médio-baixo: peso médio-alto
  ELSIF item_value <= 100 THEN
    RETURN 10;  -- Itens médios: peso médio
  ELSIF item_value <= 200 THEN
    RETURN 5;   -- Itens médio-alto: peso baixo
  ELSIF item_value <= 500 THEN
    RETURN 2;   -- Itens caros: peso muito baixo
  ELSE
    RETURN 1;   -- Itens super caros: peso mínimo
  END IF;
END;
$$;

-- Aplicar pesos automáticos baseados no valor dos itens
UPDATE public.scratch_card_probabilities scp
SET probability_weight = public.calculate_auto_weight_by_value(i.base_value)
FROM public.items i
WHERE scp.item_id = i.id 
  AND scp.is_active = true
  AND i.is_active = true;

-- Atualizar também chest_item_probabilities com o mesmo sistema
UPDATE public.chest_item_probabilities cip
SET probability_weight = public.calculate_auto_weight_by_value(i.base_value)
FROM public.items i
WHERE cip.item_id = i.id 
  AND cip.is_active = true
  AND i.is_active = true;

-- Criar tabela de monitoramento financeiro das raspadinhas
CREATE TABLE IF NOT EXISTS public.scratch_card_profit_monitoring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scratch_type text NOT NULL,
  date date DEFAULT CURRENT_DATE,
  total_sales numeric DEFAULT 0,
  total_prizes_paid numeric DEFAULT 0,
  profit_margin_percentage numeric GENERATED ALWAYS AS (
    CASE 
      WHEN total_sales > 0 THEN ((total_sales - total_prizes_paid) / total_sales) * 100
      ELSE 0
    END
  ) STORED,
  target_margin_percentage numeric DEFAULT 90,
  is_healthy boolean GENERATED ALWAYS AS (
    CASE 
      WHEN total_sales > 0 THEN ((total_sales - total_prizes_paid) / total_sales) * 100 >= 85
      ELSE true
    END
  ) STORED,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(scratch_type, date)
);

-- Habilitar RLS
ALTER TABLE public.scratch_card_profit_monitoring ENABLE ROW LEVEL SECURITY;

-- Política para admins
CREATE POLICY "Admins can manage profit monitoring"
ON public.scratch_card_profit_monitoring
FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Trigger para atualizar timestamp
CREATE TRIGGER update_scratch_profit_monitoring_updated_at
  BEFORE UPDATE ON public.scratch_card_profit_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inicializar dados de monitoramento para hoje
INSERT INTO public.scratch_card_profit_monitoring (scratch_type, date)
SELECT DISTINCT scratch_type, CURRENT_DATE
FROM public.scratch_card_settings
WHERE is_active = true
ON CONFLICT (scratch_type, date) DO NOTHING;