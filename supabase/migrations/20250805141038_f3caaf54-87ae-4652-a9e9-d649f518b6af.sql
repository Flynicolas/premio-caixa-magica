-- Fazer campo telefone obrigatório e adicionar validações
ALTER TABLE profiles 
ALTER COLUMN phone SET NOT NULL,
ALTER COLUMN phone SET DEFAULT '';

-- Atualizar usuários existentes que não têm telefone
UPDATE profiles 
SET phone = '' 
WHERE phone IS NULL;

-- Criar função para detectar se input é email ou telefone
CREATE OR REPLACE FUNCTION public.is_valid_email(input_text text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN input_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Criar função para detectar se input é telefone brasileiro
CREATE OR REPLACE FUNCTION public.is_valid_phone(input_text text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Remove caracteres não numéricos
  input_text := regexp_replace(input_text, '[^0-9]', '', 'g');
  
  -- Verifica se tem 10 ou 11 dígitos (formato brasileiro)
  RETURN length(input_text) IN (10, 11) AND input_text ~ '^[0-9]+$';
END;
$$;