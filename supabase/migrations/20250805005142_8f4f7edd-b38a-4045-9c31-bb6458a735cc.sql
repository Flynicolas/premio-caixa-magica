-- Criar tabela para links únicos e estatísticas de afiliados
CREATE TABLE public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  referral_link TEXT NOT NULL,
  total_invites INTEGER NOT NULL DEFAULT 0,
  successful_referrals INTEGER NOT NULL DEFAULT 0,
  active_referrals INTEGER NOT NULL DEFAULT 0,
  total_commission_earned NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  commission_pending NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  last_referral_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para estatísticas detalhadas
CREATE TABLE public.referral_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  clicks INTEGER NOT NULL DEFAULT 0,
  registrations INTEGER NOT NULL DEFAULT 0,
  first_deposits INTEGER NOT NULL DEFAULT 0,
  total_deposit_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_spent_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  conversion_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, date)
);

-- Criar tabela para histórico de atividades
CREATE TABLE public.referral_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'click', 'registration', 'first_deposit', 'purchase'
  activity_data JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  referral_source TEXT, -- 'whatsapp', 'telegram', 'direct', etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo de referenciador na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN referred_by UUID REFERENCES auth.users(id),
ADD COLUMN referral_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN referral_source TEXT;

-- Criar índices para performance
CREATE INDEX idx_user_referrals_user_id ON public.user_referrals(user_id);
CREATE INDEX idx_user_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX idx_referral_stats_referrer_date ON public.referral_stats(referrer_id, date);
CREATE INDEX idx_referral_activities_referrer ON public.referral_activities(referrer_id);
CREATE INDEX idx_referral_activities_referred ON public.referral_activities(referred_user_id);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);

-- Habilitar RLS
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_referrals
CREATE POLICY "Users can view their own referral data"
ON public.user_referrals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral data"
ON public.user_referrals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can manage referral data"
ON public.user_referrals FOR ALL
USING (true);

CREATE POLICY "Admins can manage all referral data"
ON public.user_referrals FOR ALL
USING (is_admin_user());

-- Políticas RLS para referral_stats
CREATE POLICY "Users can view their own stats"
ON public.referral_stats FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "System can manage stats"
ON public.referral_stats FOR ALL
USING (true);

CREATE POLICY "Admins can manage all stats"
ON public.referral_stats FOR ALL
USING (is_admin_user());

-- Políticas RLS para referral_activities
CREATE POLICY "Users can view their own activities"
ON public.referral_activities FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can create activities"
ON public.referral_activities FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all activities"
ON public.referral_activities FOR ALL
USING (is_admin_user());

-- Função para gerar código único de afiliado
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    -- Gerar código formato BAU-XXXXX
    code := 'BAU-' || upper(substring(md5(random()::text) from 1 for 5));
    
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM public.user_referrals WHERE referral_code = code) INTO exists_code;
    
    -- Se não existe, retornar o código
    IF NOT exists_code THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Função para criar referral automático quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.create_user_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  referral_url TEXT;
BEGIN
  -- Gerar código único
  new_code := public.generate_referral_code();
  
  -- Criar URL de referral
  referral_url := '/convite/' || new_code;
  
  -- Inserir dados de referral
  INSERT INTO public.user_referrals (
    user_id, 
    referral_code, 
    referral_link
  ) VALUES (
    NEW.id,
    new_code,
    referral_url
  );
  
  RETURN NEW;
END;
$$;

-- Trigger para criar referral quando perfil é criado
CREATE TRIGGER create_user_referral_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_referral();

-- Função para processar referral quando usuário se cadastra via link
CREATE OR REPLACE FUNCTION public.process_referral_signup(
  p_referred_user_id UUID,
  p_referral_code TEXT,
  p_referral_source TEXT DEFAULT 'direct',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  
  -- Registrar atividade
  INSERT INTO public.referral_activities (
    referrer_id,
    referred_user_id,
    activity_type,
    activity_data,
    ip_address,
    user_agent,
    referral_source
  ) VALUES (
    referrer_user_id,
    p_referred_user_id,
    'registration',
    jsonb_build_object('referral_code', p_referral_code),
    p_ip_address,
    p_user_agent,
    p_referral_source
  );
  
  -- Atualizar estatísticas diárias
  INSERT INTO public.referral_stats (
    referrer_id,
    registrations
  ) VALUES (
    referrer_user_id,
    1
  ) ON CONFLICT (referrer_id, date) DO UPDATE SET
    registrations = referral_stats.registrations + 1,
    updated_at = now();
  
  RETURN TRUE;
END;
$$;