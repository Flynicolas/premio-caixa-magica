-- Criar tabela para histórico de análise de usuário
CREATE TABLE public.user_behavior_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_games_played INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0.00,
  total_won NUMERIC NOT NULL DEFAULT 0.00,
  last_win_date TIMESTAMP WITH TIME ZONE,
  days_since_last_win INTEGER DEFAULT 0,
  avg_bet_amount NUMERIC NOT NULL DEFAULT 0.00,
  win_frequency NUMERIC NOT NULL DEFAULT 0.00,
  behavior_score INTEGER NOT NULL DEFAULT 50, -- Score de 0-100
  eligibility_tier TEXT NOT NULL DEFAULT 'normal', -- normal, priority, vip
  play_pattern TEXT NOT NULL DEFAULT 'casual', -- casual, frequent, whale
  engagement_level TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
  last_deposit_date TIMESTAMP WITH TIME ZONE,
  withdrawal_frequency INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_user_behavior_user_date ON public.user_behavior_analysis(user_id, analysis_date);
CREATE INDEX idx_user_behavior_score ON public.user_behavior_analysis(behavior_score);
CREATE INDEX idx_user_behavior_tier ON public.user_behavior_analysis(eligibility_tier);

-- Habilitar RLS
ALTER TABLE public.user_behavior_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage behavior analysis" 
ON public.user_behavior_analysis 
FOR ALL 
USING (is_admin_user());

-- Criar tabela para logs de decisões do sistema
CREATE TABLE public.scratch_decision_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scratch_type TEXT NOT NULL,
  decision_type TEXT NOT NULL, -- win, loss, manual_release, blackout
  decision_reason TEXT NOT NULL,
  probability_calculated NUMERIC NOT NULL DEFAULT 0.00,
  budget_available NUMERIC NOT NULL DEFAULT 0.00,
  user_score INTEGER NOT NULL DEFAULT 50,
  financial_context JSONB NOT NULL DEFAULT '{}',
  user_context JSONB NOT NULL DEFAULT '{}',
  result_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices
CREATE INDEX idx_scratch_decision_user ON public.scratch_decision_logs(user_id);
CREATE INDEX idx_scratch_decision_type ON public.scratch_decision_logs(scratch_type, decision_type);
CREATE INDEX idx_scratch_decision_date ON public.scratch_decision_logs(created_at);

-- Habilitar RLS
ALTER TABLE public.scratch_decision_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can view decision logs" 
ON public.scratch_decision_logs 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "System can create decision logs" 
ON public.scratch_decision_logs 
FOR INSERT 
WITH CHECK (true);

-- Criar tabela para fila de prêmios programados
CREATE TABLE public.programmed_prize_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scratch_type TEXT NOT NULL,
  item_id UUID NOT NULL REFERENCES public.items(id),
  priority INTEGER NOT NULL DEFAULT 1, -- 1 = maior prioridade
  target_user_id UUID, -- Usuário específico (opcional)
  target_behavior_criteria JSONB DEFAULT '{}', -- Critérios de comportamento
  scheduled_for TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, used, expired
  created_by UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices
CREATE INDEX idx_programmed_queue_type ON public.programmed_prize_queue(scratch_type, status);
CREATE INDEX idx_programmed_queue_priority ON public.programmed_prize_queue(priority, created_at);
CREATE INDEX idx_programmed_queue_user ON public.programmed_prize_queue(target_user_id);

-- Habilitar RLS
ALTER TABLE public.programmed_prize_queue ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage programmed prizes" 
ON public.programmed_prize_queue 
FOR ALL 
USING (is_admin_user());

-- Criar função para análise de comportamento do usuário
CREATE OR REPLACE FUNCTION public.analyze_user_behavior(p_user_id UUID)
RETURNS TABLE(
  behavior_score INTEGER,
  eligibility_tier TEXT,
  play_pattern TEXT,
  engagement_level TEXT,
  days_since_last_win INTEGER,
  win_frequency NUMERIC,
  analysis_data JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  games_last_30_days INTEGER := 0;
  total_spent_30_days NUMERIC := 0;
  total_won_30_days NUMERIC := 0;
  last_win TIMESTAMP WITH TIME ZONE;
  days_no_win INTEGER := 0;
  calculated_score INTEGER := 50;
  tier TEXT := 'normal';
  pattern TEXT := 'casual';
  engagement TEXT := 'medium';
  frequency NUMERIC := 0;
  analysis JSONB;
BEGIN
  -- Buscar dados dos últimos 30 dias
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount_paid), 0),
    COALESCE(SUM(CASE WHEN has_win THEN winning_amount ELSE 0 END), 0),
    MAX(CASE WHEN has_win THEN processed_at END)
  INTO games_last_30_days, total_spent_30_days, total_won_30_days, last_win
  FROM public.scratch_card_games
  WHERE user_id = p_user_id 
    AND processed_at >= (now() - interval '30 days');

  -- Calcular dias desde última vitória
  IF last_win IS NOT NULL THEN
    days_no_win := EXTRACT(DAY FROM (now() - last_win));
  ELSE
    days_no_win := 999; -- Nunca ganhou
  END IF;

  -- Calcular frequência de vitórias
  IF games_last_30_days > 0 THEN
    SELECT 
      (COUNT(CASE WHEN has_win THEN 1 END)::NUMERIC / games_last_30_days) * 100
    INTO frequency
    FROM public.scratch_card_games
    WHERE user_id = p_user_id 
      AND processed_at >= (now() - interval '30 days');
  END IF;

  -- Calcular score de comportamento (0-100)
  calculated_score := 50; -- Base

  -- Fator fidelidade: +20 se joga frequentemente
  IF games_last_30_days >= 50 THEN
    calculated_score := calculated_score + 20;
  ELSIF games_last_30_days >= 20 THEN
    calculated_score := calculated_score + 10;
  END IF;

  -- Fator gastos: +15 se gasta muito
  IF total_spent_30_days >= 500 THEN
    calculated_score := calculated_score + 15;
  ELSIF total_spent_30_days >= 100 THEN
    calculated_score := calculated_score + 8;
  END IF;

  -- Fator tempo sem ganhar: +25 se está há muito tempo sem ganhar
  IF days_no_win >= 15 THEN
    calculated_score := calculated_score + 25;
  ELSIF days_no_win >= 7 THEN
    calculated_score := calculated_score + 15;
  ELSIF days_no_win >= 3 THEN
    calculated_score := calculated_score + 5;
  END IF;

  -- Fator frequência de vitórias: -10 se ganha muito
  IF frequency > 25 THEN
    calculated_score := calculated_score - 10;
  ELSIF frequency > 15 THEN
    calculated_score := calculated_score - 5;
  END IF;

  -- Limitar score entre 0-100
  calculated_score := GREATEST(0, LEAST(100, calculated_score));

  -- Determinar tier de elegibilidade
  IF calculated_score >= 80 THEN
    tier := 'vip';
  ELSIF calculated_score >= 65 THEN
    tier := 'priority';
  ELSE
    tier := 'normal';
  END IF;

  -- Determinar padrão de jogo
  IF games_last_30_days >= 100 THEN
    pattern := 'whale';
  ELSIF games_last_30_days >= 30 THEN
    pattern := 'frequent';
  ELSE
    pattern := 'casual';
  END IF;

  -- Determinar nível de engajamento
  IF total_spent_30_days >= 200 AND games_last_30_days >= 20 THEN
    engagement := 'high';
  ELSIF total_spent_30_days >= 50 AND games_last_30_days >= 5 THEN
    engagement := 'medium';
  ELSE
    engagement := 'low';
  END IF;

  -- Compilar dados de análise
  analysis := jsonb_build_object(
    'games_last_30_days', games_last_30_days,
    'total_spent_30_days', total_spent_30_days,
    'total_won_30_days', total_won_30_days,
    'loss_streak_days', days_no_win,
    'win_frequency_pct', frequency,
    'avg_bet_amount', CASE WHEN games_last_30_days > 0 THEN total_spent_30_days / games_last_30_days ELSE 0 END,
    'net_result_30_days', total_won_30_days - total_spent_30_days,
    'calculated_at', now()
  );

  -- Inserir/atualizar análise
  INSERT INTO public.user_behavior_analysis (
    user_id,
    total_games_played,
    total_spent,
    total_won,
    last_win_date,
    days_since_last_win,
    avg_bet_amount,
    win_frequency,
    behavior_score,
    eligibility_tier,
    play_pattern,
    engagement_level,
    metadata,
    updated_at
  ) VALUES (
    p_user_id,
    games_last_30_days,
    total_spent_30_days,
    total_won_30_days,
    last_win,
    days_no_win,
    CASE WHEN games_last_30_days > 0 THEN total_spent_30_days / games_last_30_days ELSE 0 END,
    frequency,
    calculated_score,
    tier,
    pattern,
    engagement,
    analysis,
    now()
  )
  ON CONFLICT (user_id, analysis_date) DO UPDATE SET
    total_games_played = EXCLUDED.total_games_played,
    total_spent = EXCLUDED.total_spent,
    total_won = EXCLUDED.total_won,
    last_win_date = EXCLUDED.last_win_date,
    days_since_last_win = EXCLUDED.days_since_last_win,
    avg_bet_amount = EXCLUDED.avg_bet_amount,
    win_frequency = EXCLUDED.win_frequency,
    behavior_score = EXCLUDED.behavior_score,
    eligibility_tier = EXCLUDED.eligibility_tier,
    play_pattern = EXCLUDED.play_pattern,
    engagement_level = EXCLUDED.engagement_level,
    metadata = EXCLUDED.metadata,
    updated_at = EXCLUDED.updated_at;

  -- Retornar resultados
  RETURN QUERY SELECT 
    calculated_score,
    tier,
    pattern,
    engagement,
    days_no_win,
    frequency,
    analysis;
END;
$$;

-- Criar função para buscar próximo prêmio programado
CREATE OR REPLACE FUNCTION public.get_next_programmed_prize(
  p_scratch_type TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  prize_id UUID,
  item_id UUID,
  priority INTEGER,
  target_criteria JSONB,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ppq.id,
    ppq.item_id,
    ppq.priority,
    ppq.target_behavior_criteria,
    ppq.metadata
  FROM public.programmed_prize_queue ppq
  WHERE ppq.scratch_type = p_scratch_type
    AND ppq.status = 'pending'
    AND ppq.expires_at > now()
    AND ppq.current_uses < ppq.max_uses
    AND (
      ppq.target_user_id IS NULL 
      OR ppq.target_user_id = p_user_id
    )
    AND (
      ppq.scheduled_for IS NULL 
      OR ppq.scheduled_for <= now()
    )
  ORDER BY ppq.priority ASC, ppq.created_at ASC
  LIMIT 1;
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_behavior_analysis_updated_at
  BEFORE UPDATE ON public.user_behavior_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programmed_prize_queue_updated_at
  BEFORE UPDATE ON public.programmed_prize_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();