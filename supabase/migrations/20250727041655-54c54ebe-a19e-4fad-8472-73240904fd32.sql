-- Criar tabela para testes de pagamento Kirvano
CREATE TABLE public.test_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_provider TEXT NOT NULL DEFAULT 'kirvano_test',
  payment_id TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.test_payments ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem ver seus próprios test payments" 
ON public.test_payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir test payments" 
ON public.test_payments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar test payments" 
ON public.test_payments 
FOR UPDATE 
USING (true);

-- Criar trigger para updated_at
CREATE TRIGGER update_test_payments_updated_at
BEFORE UPDATE ON public.test_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();