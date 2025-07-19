
-- Padronizar campo de experiência - migrar experience_points para experience
UPDATE public.profiles 
SET experience = COALESCE(experience_points, 0) 
WHERE experience IS NULL OR experience = 0;

-- Remover campo duplicado experience_points (opcional, manter comentado por segurança)
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS experience_points;

-- Garantir que campos de endereço e dados pessoais tenham valores padrão apropriados
UPDATE public.profiles 
SET 
  full_name = COALESCE(full_name, email),
  cpf = COALESCE(cpf, ''),
  zip_code = COALESCE(zip_code, ''),
  street = COALESCE(street, ''),
  number = COALESCE(number, ''),
  complement = COALESCE(complement, ''),
  neighborhood = COALESCE(neighborhood, ''),
  city = COALESCE(city, ''),
  state = COALESCE(state, '')
WHERE full_name IS NULL OR cpf IS NULL OR zip_code IS NULL;

-- Função melhorada para validação de CPF apenas quando necessário
CREATE OR REPLACE FUNCTION public.validate_cpf_for_withdrawal(cpf_input text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validação básica de CPF (11 dígitos numéricos)
  IF cpf_input IS NULL OR LENGTH(REPLACE(cpf_input, '-', '')) != 11 THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se não são todos os números iguais
  IF REPLACE(cpf_input, '-', '') ~ '^(.)\1{10}$' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;
