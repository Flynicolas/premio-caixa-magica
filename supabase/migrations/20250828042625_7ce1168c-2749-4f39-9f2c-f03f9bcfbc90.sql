-- Fase 1: Preparação do Banco de Dados para Sistema de Autenticação Avançado

-- 1. Adicionar função robusta de validação de CPF
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

-- 2. Adicionar função para detectar duplicatas
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
  
  -- Verificar CPF duplicado (se fornecido)
  IF p_cpf IS NOT NULL THEN
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

-- 3. Adicionar função para normalizar telefone
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

-- 4. Atualizar tabela profiles com novos campos e constraints
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code text,
ADD COLUMN IF NOT EXISTS device_fingerprint text,
ADD COLUMN IF NOT EXISTS remember_login boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_device_info jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

-- 5. Tornar CPF e birth_date obrigatórios para novos usuários (não retroativo)
-- Nota: Não vamos alterar colunas existentes para não quebrar dados atuais

-- 6. Adicionar constraints únicos
-- Constraint para email (se não existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_unique') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
  END IF;
END $$;

-- Constraint para CPF (se não existe)  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_cpf_unique') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_cpf_unique UNIQUE (cpf);
  END IF;
END $$;

-- 7. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_device_fingerprint ON public.profiles(device_fingerprint) WHERE device_fingerprint IS NOT NULL;

-- 8. Criar trigger para validação de CPF
CREATE OR REPLACE FUNCTION public.validate_profile_before_save()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validar CPF se fornecido
  IF NEW.cpf IS NOT NULL AND NEW.cpf != '' THEN
    IF NOT public.validate_cpf_digits(NEW.cpf) THEN
      RAISE EXCEPTION 'CPF inválido: %', NEW.cpf;
    END IF;
    -- Normalizar CPF (remover caracteres especiais)
    NEW.cpf := regexp_replace(NEW.cpf, '[^0-9]', '', 'g');
  END IF;
  
  -- Normalizar telefone se fornecido
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    NEW.phone := public.normalize_phone(NEW.phone);
    -- Validar telefone brasileiro (10 ou 11 dígitos)
    IF length(NEW.phone) NOT IN (10, 11) THEN
      RAISE EXCEPTION 'Telefone inválido. Deve ter 10 ou 11 dígitos.';
    END IF;
  END IF;
  
  -- Validar email
  IF NEW.email IS NOT NULL AND NOT public.is_valid_email(NEW.email) THEN
    RAISE EXCEPTION 'Email inválido: %', NEW.email;
  END IF;
  
  -- Validar data de nascimento (deve ter pelo menos 18 anos)
  IF NEW.birth_date IS NOT NULL THEN
    IF NEW.birth_date > (CURRENT_DATE - INTERVAL '18 years') THEN
      RAISE EXCEPTION 'Usuário deve ter pelo menos 18 anos';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Aplicar trigger na tabela profiles
DROP TRIGGER IF EXISTS validate_profile_trigger ON public.profiles;
CREATE TRIGGER validate_profile_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_before_save();

-- 9. Atualizar RLS policies para novos campos
-- Política para permitir usuários atualizarem seus próprios dados
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 10. Criar tabela para log de tentativas de login
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT false,
  failure_reason text,
  device_fingerprint text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS para login attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver logs de login
CREATE POLICY "Admins can manage login attempts"
ON public.login_attempts FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Índices para login attempts
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON public.login_attempts(created_at);

-- 11. Função para registrar tentativas de login
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_email text,
  p_success boolean,
  p_failure_reason text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_device_fingerprint text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.login_attempts (
    email, 
    success, 
    failure_reason, 
    ip_address, 
    user_agent, 
    device_fingerprint
  ) VALUES (
    p_email, 
    p_success, 
    p_failure_reason, 
    p_ip_address::inet, 
    p_user_agent, 
    p_device_fingerprint
  );
END;
$function$;