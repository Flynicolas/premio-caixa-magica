-- Fase 1: Preparação do Banco de Dados (Correção) - Sistema de Autenticação Avançado

-- 1. Limpar dados duplicados antes de aplicar constraints
-- Remover CPFs vazios ou nulos duplicados
UPDATE public.profiles 
SET cpf = NULL 
WHERE cpf = '' OR cpf IS NULL;

-- 2. Adicionar função robusta de validação de CPF
CREATE OR REPLACE FUNCTION public.validate_cpf_digits(cpf_input text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cpf_clean text;
  sum1 integer := 0;
  sum2 integer := 0;
  i integer;
  digit1 integer;
  digit2 integer;
BEGIN
  -- Limpar CPF (remover caracteres não numéricos)
  cpf_clean := regexp_replace(cpf_input, '[^0-9]', '', 'g');
  
  -- Validações básicas
  IF cpf_clean IS NULL OR length(cpf_clean) != 11 THEN
    RETURN false;
  END IF;
  
  -- Verificar se não são todos os números iguais
  IF cpf_clean ~ '^(.)\1{10}$' THEN
    RETURN false;
  END IF;
  
  -- Cálculo do primeiro dígito verificador
  FOR i IN 1..9 LOOP
    sum1 := sum1 + (substring(cpf_clean, i, 1)::integer * (11 - i));
  END LOOP;
  
  digit1 := 11 - (sum1 % 11);
  IF digit1 >= 10 THEN
    digit1 := 0;
  END IF;
  
  -- Cálculo do segundo dígito verificador
  FOR i IN 1..10 LOOP
    sum2 := sum2 + (substring(cpf_clean, i, 1)::integer * (12 - i));
  END LOOP;
  
  digit2 := 11 - (sum2 % 11);
  IF digit2 >= 10 THEN
    digit2 := 0;
  END IF;
  
  -- Verificar se os dígitos calculados conferem
  RETURN (substring(cpf_clean, 10, 1)::integer = digit1) AND 
         (substring(cpf_clean, 11, 1)::integer = digit2);
END;
$function$;

-- 3. Adicionar função para detectar duplicatas
CREATE OR REPLACE FUNCTION public.check_user_duplicates(p_email text, p_cpf text DEFAULT NULL, p_user_id uuid DEFAULT NULL)
RETURNS TABLE(has_duplicate boolean, duplicate_type text, duplicate_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  email_exists boolean := false;
  cpf_exists boolean := false;
BEGIN
  -- Verificar email duplicado
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = p_email 
    AND (p_user_id IS NULL OR id != p_user_id)
  ) INTO email_exists;
  
  -- Verificar CPF duplicado (se fornecido e não nulo)
  IF p_cpf IS NOT NULL AND p_cpf != '' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE cpf = p_cpf 
      AND (p_user_id IS NULL OR id != p_user_id)
    ) INTO cpf_exists;
  END IF;
  
  -- Retornar resultado
  IF email_exists THEN
    RETURN QUERY SELECT true, 'email', 'Este email já está cadastrado no sistema';
  ELSIF cpf_exists THEN
    RETURN QUERY SELECT true, 'cpf', 'Este CPF já está cadastrado no sistema';
  ELSE
    RETURN QUERY SELECT false, '', '';
  END IF;
END;
$function$;

-- 4. Adicionar função para normalizar telefone
CREATE OR REPLACE FUNCTION public.normalize_phone(phone_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
  -- Remover caracteres não numéricos e normalizar formato
  RETURN regexp_replace(phone_input, '[^0-9]', '', 'g');
END;
$function$;

-- 5. Atualizar tabela profiles com novos campos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code text,
ADD COLUMN IF NOT EXISTS device_fingerprint text,
ADD COLUMN IF NOT EXISTS remember_login boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_device_info jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

-- 6. Adicionar constraint único para CPF (apenas para valores não nulos)
DROP INDEX IF EXISTS idx_profiles_cpf_unique;
CREATE UNIQUE INDEX idx_profiles_cpf_unique ON public.profiles(cpf) 
WHERE cpf IS NOT NULL AND cpf != '';

-- 7. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_device_fingerprint ON public.profiles(device_fingerprint) WHERE device_fingerprint IS NOT NULL;