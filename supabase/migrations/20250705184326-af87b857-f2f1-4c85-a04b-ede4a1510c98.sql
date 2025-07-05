
-- Adicionar políticas RLS para permitir que administradores gerenciem itens
CREATE POLICY "Admins can insert items" ON public.items
  FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

CREATE POLICY "Admins can update items" ON public.items
  FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

CREATE POLICY "Admins can delete items" ON public.items
  FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

-- Habilitar realtime na tabela items
ALTER TABLE public.items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;

-- Adicionar políticas RLS para a tabela chest_item_probabilities (para administradores)
CREATE POLICY "Admins can insert chest probabilities" ON public.chest_item_probabilities
  FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

CREATE POLICY "Admins can update chest probabilities" ON public.chest_item_probabilities
  FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

CREATE POLICY "Admins can delete chest probabilities" ON public.chest_item_probabilities
  FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

-- Garantir que o bucket de imagens tem as políticas corretas
CREATE POLICY "Anyone can view item images" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-images');

CREATE POLICY "Admins can upload item images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'item-images' AND 
    auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true)
  );

CREATE POLICY "Admins can update item images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'item-images' AND 
    auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true)
  );

CREATE POLICY "Admins can delete item images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'item-images' AND 
    auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true)
  );
