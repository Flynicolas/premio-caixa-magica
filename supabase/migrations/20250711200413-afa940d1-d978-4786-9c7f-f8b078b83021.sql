-- Criar tabela para entregas de prêmios físicos
CREATE TABLE public.entregas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id),
  item_nome TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  cep TEXT NOT NULL,
  rua TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  codigo_rastreio TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.entregas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver suas próprias entregas" 
ON public.entregas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar entregas" 
ON public.entregas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todas as entregas" 
ON public.entregas 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.admin_users WHERE is_active = true
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_entregas_updated_at
BEFORE UPDATE ON public.entregas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_entregas_user_id ON public.entregas(user_id);
CREATE INDEX idx_entregas_status ON public.entregas(status);
CREATE INDEX idx_entregas_created_at ON public.entregas(created_at DESC);