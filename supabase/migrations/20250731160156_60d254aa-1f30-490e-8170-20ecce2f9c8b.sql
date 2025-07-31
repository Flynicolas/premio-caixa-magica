-- Final security fixes: Enable RLS on remaining tables

-- These are the last tables that need RLS enabled
ALTER TABLE public.chest_financial_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scratch_card_financial_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_baus ENABLE ROW LEVEL SECURITY;

-- Fix remaining functions with search paths
CREATE OR REPLACE FUNCTION public.clear_items_table()
RETURNS TABLE(deleted_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  count_deleted INTEGER;
BEGIN
  -- Verificar se o usuário é admin
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem limpar a tabela.';
  END IF;
  
  -- Contar itens antes de deletar
  SELECT COUNT(*) INTO count_deleted FROM public.items;
  
  -- Deletar todos os itens
  DELETE FROM public.items;
  
  -- Deletar probabilidades relacionadas
  DELETE FROM public.chest_item_probabilities;
  
  RETURN QUERY SELECT count_deleted;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_ranking_top10()
RETURNS TABLE(id uuid, full_name text, total_spent numeric, total_prizes_won integer, level integer, level_title text)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    p.id,
    p.full_name,
    coalesce(t.total_spent, 0) as total_spent,
    coalesce(i.total_prizes_won, 0) as total_prizes_won,
    l.level,
    l.name as level_title
  FROM profiles p
  LEFT JOIN (
    SELECT user_id, sum(amount) as total_spent
    FROM transactions
    WHERE type = 'deposit' AND status = 'completed'
    GROUP BY user_id
  ) t ON t.user_id = p.id
  LEFT JOIN (
    SELECT user_id, count(*) as total_prizes_won
    FROM user_inventory
    GROUP BY user_id
  ) i ON i.user_id = p.id
  LEFT JOIN user_levels l ON l.level = p.level
  WHERE p.is_active = true
  ORDER BY total_spent DESC, total_prizes_won DESC
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION public.add_experience_and_level(user_id_input uuid, xp_to_add integer)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_xp integer;
  new_total_xp integer;
  new_level integer;
BEGIN
  -- Buscar XP atual do usuário
  SELECT experience INTO current_xp
  FROM profiles
  WHERE id = user_id_input;

  IF current_xp IS NULL THEN
    current_xp := 0;
  END IF;

  -- Somar XP
  new_total_xp := current_xp + xp_to_add;

  -- Descobrir o novo nível com base no total de XP usando a tabela user_levels
  SELECT level INTO new_level
  FROM user_levels
  WHERE min_experience <= new_total_xp
    AND (max_experience IS NULL OR max_experience >= new_total_xp)
  ORDER BY level DESC
  LIMIT 1;

  -- Atualizar perfil
  UPDATE profiles
  SET experience = new_total_xp,
      level = new_level,
      updated_at = now()
  WHERE id = user_id_input;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_ranking_position(user_id_input uuid)
RETURNS TABLE(id uuid, full_name text, total_spent numeric, total_prizes_won integer, level integer, level_title text, "position" integer)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH ranked AS (
    SELECT
      p.id,
      p.full_name,
      coalesce(t.total_spent, 0) as total_spent,
      coalesce(i.total_prizes_won, 0) as total_prizes_won,
      l.level,
      l.name as level_title,
      row_number() OVER (
        ORDER BY coalesce(t.total_spent, 0) DESC, coalesce(i.total_prizes_won, 0) DESC
      ) as "position"
    FROM profiles p
    LEFT JOIN (
      SELECT user_id, sum(amount) as total_spent
      FROM transactions
      WHERE type = 'deposit' AND status = 'completed'
      GROUP BY user_id
    ) t ON t.user_id = p.id
    LEFT JOIN (
      SELECT user_id, count(*) as total_prizes_won
      FROM user_inventory
      GROUP BY user_id
    ) i ON i.user_id = p.id
    LEFT JOIN user_levels l ON l.level = p.level
    WHERE p.is_active = true
  )
  SELECT *
  FROM ranked
  WHERE id = get_user_ranking_position.user_id_input;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.collaborator_invites 
  WHERE expires_at < now() AND NOT is_used;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_admin_action(p_admin_user_id uuid, p_action_type text, p_description text, p_affected_table text DEFAULT NULL::text, p_affected_record_id uuid DEFAULT NULL::uuid, p_old_data jsonb DEFAULT NULL::jsonb, p_new_data jsonb DEFAULT NULL::jsonb, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_action_logs (
    admin_user_id,
    action_type,
    description,
    affected_table,
    affected_record_id,
    old_data,
    new_data,
    metadata
  ) VALUES (
    p_admin_user_id,
    p_action_type,
    p_description,
    p_affected_table,
    p_affected_record_id,
    p_old_data,
    p_new_data,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.calculate_user_level(experience integer)
RETURNS TABLE(level integer, name text, icon text, color text, benefits jsonb)
LANGUAGE plpgsql
STABLE
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.log_user_activity(p_user_id uuid, p_activity_type text, p_description text, p_metadata jsonb DEFAULT '{}'::jsonb, p_experience_gained integer DEFAULT 0)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir carteira apenas se ainda não existir
  INSERT INTO public.user_wallets (user_id, balance, total_deposited, total_withdrawn, total_spent)
  VALUES (NEW.id, 0.00, 0.00, 0.00, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;