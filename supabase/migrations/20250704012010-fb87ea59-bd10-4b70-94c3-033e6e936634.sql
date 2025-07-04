
-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  total_spent DECIMAL DEFAULT 0,
  total_prizes_won INTEGER DEFAULT 0,
  chests_opened INTEGER DEFAULT 0,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}',
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem seus próprios perfis
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Política para usuários atualizarem seus próprios perfis
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política para admins visualizarem todos os perfis
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR ALL 
  USING (auth.uid() IN (
    SELECT user_id FROM admin_users WHERE is_active = true
  ));

-- Criar tabela de níveis de usuário
CREATE TABLE public.user_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  min_experience INTEGER NOT NULL,
  max_experience INTEGER,
  benefits JSONB DEFAULT '[]',
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir níveis padrão
INSERT INTO public.user_levels (level, name, min_experience, max_experience, benefits, icon, color) VALUES
(1, 'Iniciante', 0, 99, '["Acesso básico aos baús", "Suporte da comunidade"]', '🌱', '#22c55e'),
(2, 'Aventureiro', 100, 299, '["Acesso a mais baús", "Bônus de experiência", "Recompensas mensais"]', '🚀', '#06b6d4'),
(3, 'Veterano', 300, 599, '["Desconto em baús", "Bônus de 10%", "Recompensas semanais"]', '🎯', '#f97316'),
(4, 'Experiente', 600, 999, '["Baús aprimorados", "Bônus de 20%", "Recompensas extras"]', '⭐', '#3b82f6'),
(5, 'Mestre', 1000, 1999, '["Suporte prioritário", "Baús especiais", "Bônus de 30%", "Cashback melhorado"]', '🏆', '#a855f7'),
(6, 'Lendário', 2000, NULL, '["Acesso VIP", "Suporte prioritário", "Baús exclusivos", "Bônus de 50%", "Cashback premium"]', '👑', '#eab308');

-- Habilitar RLS na tabela user_levels
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

-- Política para todos visualizarem os níveis
CREATE POLICY "Anyone can view user levels" 
  ON public.user_levels 
  FOR SELECT 
  TO public;

-- Criar tabela de conquistas
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  rarity TEXT DEFAULT 'common',
  condition_type TEXT NOT NULL, -- 'chests_opened', 'total_spent', 'login_streak', etc
  condition_value INTEGER NOT NULL,
  reward_experience INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir conquistas padrão
INSERT INTO public.achievements (name, description, icon, rarity, condition_type, condition_value, reward_experience) VALUES
('Primeiro Baú', 'Abriu seu primeiro baú', '📦', 'common', 'chests_opened', 1, 10),
('Colecionador', 'Abriu 10 baús', '🎁', 'common', 'chests_opened', 10, 50),
('Viciado em Baús', 'Abriu 50 baús', '🏆', 'rare', 'chests_opened', 50, 200),
('Investidor', 'Gastou R$ 100', '💰', 'common', 'total_spent', 100, 25),
('High Roller', 'Gastou R$ 1000', '💎', 'epic', 'total_spent', 1000, 500),
('Fiel', 'Fez login por 7 dias seguidos', '⭐', 'rare', 'login_streak', 7, 100);

-- Habilitar RLS na tabela achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Política para todos visualizarem as conquistas
CREATE POLICY "Anyone can view achievements" 
  ON public.achievements 
  FOR SELECT 
  TO public;

-- Criar tabela de conquistas dos usuários
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Habilitar RLS na tabela user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem suas próprias conquistas
CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Política para admins visualizarem todas as conquistas
CREATE POLICY "Admins can view all user achievements" 
  ON public.user_achievements 
  FOR ALL 
  USING (auth.uid() IN (
    SELECT user_id FROM admin_users WHERE is_active = true
  ));

-- Criar tabela de atividades do usuário
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- 'chest_opened', 'deposit', 'achievement_unlocked', etc
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  experience_gained INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem suas próprias atividades
CREATE POLICY "Users can view their own activities" 
  ON public.user_activities 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Política para admins visualizarem todas as atividades
CREATE POLICY "Admins can view all user activities" 
  ON public.user_activities 
  FOR ALL 
  USING (auth.uid() IN (
    SELECT user_id FROM admin_users WHERE is_active = true
  ));

-- Função para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para calcular nível baseado na experiência
CREATE OR REPLACE FUNCTION public.calculate_user_level(experience INTEGER)
RETURNS TABLE(level INTEGER, name TEXT, icon TEXT, color TEXT, benefits JSONB)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT ul.level, ul.name, ul.icon, ul.color, ul.benefits
  FROM public.user_levels ul
  WHERE experience >= ul.min_experience 
    AND (ul.max_experience IS NULL OR experience <= ul.max_experience)
  ORDER BY ul.level DESC
  LIMIT 1;
END;
$$;

-- Função para registrar atividade do usuário
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_experience_gained INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
  current_exp INTEGER;
  new_exp INTEGER;
BEGIN
  -- Inserir atividade
  INSERT INTO public.user_activities (
    user_id, activity_type, description, metadata, experience_gained
  ) VALUES (
    p_user_id, p_activity_type, p_description, p_metadata, p_experience_gained
  ) RETURNING id INTO activity_id;
  
  -- Atualizar experiência do usuário se necessário
  IF p_experience_gained > 0 THEN
    SELECT experience_points INTO current_exp
    FROM public.profiles
    WHERE id = p_user_id;
    
    new_exp := COALESCE(current_exp, 0) + p_experience_gained;
    
    UPDATE public.profiles
    SET 
      experience_points = new_exp,
      level = (SELECT level FROM public.calculate_user_level(new_exp) LIMIT 1),
      updated_at = now()
    WHERE id = p_user_id;
  END IF;
  
  RETURN activity_id;
END;
$$;

-- Inserir usuário admin inicial (usando email do usuário logado)
DO $$
DECLARE
  current_user_id UUID;
  current_email TEXT;
BEGIN
  -- Pegar dados do usuário atual se existir
  SELECT id, email INTO current_user_id, current_email
  FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se encontrou usuário, torná-lo admin
  IF current_user_id IS NOT NULL THEN
    INSERT INTO public.admin_users (user_id, email, role, is_active, created_by)
    VALUES (current_user_id, current_email, 'admin', true, current_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;
