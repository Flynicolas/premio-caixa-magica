
-- Criar bucket de storage para imagens dos itens
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true);

-- Política para permitir que qualquer um visualize as imagens
CREATE POLICY "Anyone can view item images" ON storage.objects
FOR SELECT USING (bucket_id = 'item-images');

-- Política para permitir que admins façam upload de imagens
CREATE POLICY "Admins can upload item images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'item-images' 
  AND auth.uid() IN (
    SELECT user_id FROM public.admin_users WHERE is_active = true
  )
);

-- Política para permitir que admins atualizem/deletem imagens
CREATE POLICY "Admins can manage item images" ON storage.objects
FOR ALL USING (
  bucket_id = 'item-images' 
  AND auth.uid() IN (
    SELECT user_id FROM public.admin_users WHERE is_active = true
  )
);

-- Função para limpar tabela de itens
CREATE OR REPLACE FUNCTION public.clear_items_table()
RETURNS TABLE(deleted_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_deleted INTEGER;
BEGIN
  -- Verificar se o usuário é admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem limpar a tabela.';
  END IF;
  
  -- Contar itens antes de deletar
  SELECT COUNT(*) INTO count_deleted FROM public.items;
  
  -- Deletar todos os itens
  DELETE FROM public.items;
  
  -- Deletar probabilidades relacionadas
  DELETE FROM public.chest_item_probabilities;
  
  RETURN QUERY SELECT count_deleted;
END;
$$;
