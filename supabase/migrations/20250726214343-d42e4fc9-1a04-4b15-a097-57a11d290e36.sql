-- Criar tabela para controlar liberações manuais de itens
CREATE TABLE public.manual_item_releases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  probability_id UUID NOT NULL REFERENCES public.chest_item_probabilities(id),
  item_id UUID NOT NULL REFERENCES public.items(id),
  chest_type TEXT NOT NULL,
  released_by UUID NOT NULL REFERENCES public.admin_users(user_id),
  released_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'drawn', 'expired')),
  winner_user_id UUID NULL,
  drawn_at TIMESTAMP WITH TIME ZONE NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.manual_item_releases ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Admins podem gerenciar liberações manuais" 
ON public.manual_item_releases 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Índices para performance
CREATE INDEX idx_manual_releases_status ON public.manual_item_releases(status);
CREATE INDEX idx_manual_releases_chest_type ON public.manual_item_releases(chest_type);
CREATE INDEX idx_manual_releases_expires_at ON public.manual_item_releases(expires_at);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_manual_item_releases_updated_at
BEFORE UPDATE ON public.manual_item_releases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para expirar liberações antigas automaticamente
CREATE OR REPLACE FUNCTION public.expire_old_manual_releases()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.manual_item_releases
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'pending' 
    AND expires_at < now();
END;
$$;