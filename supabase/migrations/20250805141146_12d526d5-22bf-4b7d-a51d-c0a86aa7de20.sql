-- Corrigir as funções com search_path adequado
DROP FUNCTION IF EXISTS public.is_valid_email(text);
DROP FUNCTION IF EXISTS public.is_valid_phone(text);

-- Recriar funções com configurações de segurança apropriadas
CREATE OR REPLACE FUNCTION public.is_valid_email(input_text text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN input_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

CREATE OR REPLACE FUNCTION public.is_valid_phone(input_text text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Remove caracteres não numéricos
  input_text := regexp_replace(input_text, '[^0-9]', '', 'g');
  
  -- Verifica se tem 10 ou 11 dígitos (formato brasileiro)
  RETURN length(input_text) IN (10, 11) AND input_text ~ '^[0-9]+$';
END;
$$;