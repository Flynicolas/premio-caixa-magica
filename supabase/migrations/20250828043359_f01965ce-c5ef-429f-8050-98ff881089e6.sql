-- Fase 1 Complementar: Triggers e Validações Avançadas

-- 1. Criar trigger para validação de perfil
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

-- 2. Criar tabela para log de tentativas de login (tabela simples)
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

-- 3. Atualizar handle_new_user para incluir novos campos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    phone,
    cpf,
    birth_date,
    referral_code,
    device_fingerprint,
    remember_login
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'cpf',
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'birth_date')::date 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data->>'referral_code',
    NEW.raw_user_meta_data->>'device_fingerprint',
    COALESCE((NEW.raw_user_meta_data->>'remember_login')::boolean, false)
  );
  
  -- Criar carteira do usuário
  INSERT INTO public.user_wallets (user_id, balance, total_deposited, total_withdrawn, total_spent)
  VALUES (NEW.id, 0.00, 0.00, 0.00, 0.00);
  
  RETURN NEW;
END;
$$;

-- 4. Desabilitar confirmação de email por padrão (conforme solicitado)
-- Nota: Isso deve ser configurado no painel do Supabase, mas vamos documentar aqui
-- Auth > Settings > Email Templates > Confirm signup = OFF

-- 5. Criar função para processar código de indicação
CREATE OR REPLACE FUNCTION public.process_referral_signup(
  p_referred_user_id uuid, 
  p_referral_code text, 
  p_referral_source text DEFAULT 'direct'::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referrer_user_id UUID;
BEGIN
  -- Buscar o usuário que possui o código de referral
  SELECT user_id INTO referrer_user_id
  FROM public.user_referrals
  WHERE referral_code = p_referral_code AND is_active = true;
  
  IF referrer_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se não é auto-referência
  IF referrer_user_id = p_referred_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar profile do usuário referenciado
  UPDATE public.profiles
  SET 
    referred_by = referrer_user_id,
    referral_date = now(),
    referral_source = p_referral_source
  WHERE id = p_referred_user_id;
  
  -- Atualizar estatísticas do referenciador
  UPDATE public.user_referrals
  SET 
    total_invites = total_invites + 1,
    successful_referrals = successful_referrals + 1,
    last_referral_at = now(),
    updated_at = now()
  WHERE user_id = referrer_user_id;
  
  RETURN TRUE;
END;
$function$;