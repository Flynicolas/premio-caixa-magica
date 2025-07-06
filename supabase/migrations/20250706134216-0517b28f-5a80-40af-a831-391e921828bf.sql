
-- Adicionar colunas necessárias na tabela chest_item_probabilities
ALTER TABLE public.chest_item_probabilities 
ADD COLUMN IF NOT EXISTS liberado_manual boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sorteado_em timestamp with time zone NULL;

-- Criar índices para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_chest_probabilities_chest_type ON public.chest_item_probabilities(chest_type);
CREATE INDEX IF NOT EXISTS idx_chest_probabilities_item_id ON public.chest_item_probabilities(item_id);
CREATE INDEX IF NOT EXISTS idx_chest_probabilities_active ON public.chest_item_probabilities(is_active);

-- Atualizar políticas RLS para chest_item_probabilities
DROP POLICY IF EXISTS "Admins can manage chest probabilities" ON public.chest_item_probabilities;

CREATE POLICY "Admins can manage chest probabilities" ON public.chest_item_probabilities
FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.admin_users 
    WHERE is_active = true
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.admin_users 
    WHERE is_active = true
  )
);

-- Habilitar realtime para chest_item_probabilities
ALTER TABLE public.chest_item_probabilities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chest_item_probabilities;
