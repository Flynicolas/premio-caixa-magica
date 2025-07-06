
-- Adicionar políticas para permitir que administradores gerenciem itens
CREATE POLICY "Admins can insert items" ON public.items
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.admin_users 
    WHERE is_active = true
  )
);

CREATE POLICY "Admins can update items" ON public.items
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.admin_users 
    WHERE is_active = true
  )
);

CREATE POLICY "Admins can delete items" ON public.items
FOR DELETE 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.admin_users 
    WHERE is_active = true
  )
);
