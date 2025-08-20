-- ETAPA 0: Feature flag para controle seguro
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage app settings" ON public.app_settings
  FOR ALL USING (is_admin_user());

-- Inserir feature flag inicial (desabilitado por segurança)
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES ('enable_new_scratch_ui', 'false', 'Feature flag para novo painel de raspadinha')
ON CONFLICT (setting_key) DO NOTHING;

-- ETAPA 1: Migrações aditivas (sem quebrar nada)

-- 1.1 Expandir scratch_card_settings
ALTER TABLE public.scratch_card_settings
  ADD COLUMN IF NOT EXISTS price_display numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS backend_cost numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'money',
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS win_probability_global numeric(5,2) NOT NULL DEFAULT 12.50,
  ADD COLUMN IF NOT EXISTS win_probability_influencer numeric(5,2),
  ADD COLUMN IF NOT EXISTS win_probability_normal numeric(5,2);

-- 1.2 Melhorar scratch_card_probabilities
ALTER TABLE public.scratch_card_probabilities
  ADD COLUMN IF NOT EXISTS probability_weight numeric(7,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_quantity integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_quantity integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- 1.3 Controle da banca em scratch_card_financial_control
ALTER TABLE public.scratch_card_financial_control
  ADD COLUMN IF NOT EXISTS payout_mode text DEFAULT 'percentage'
    CHECK (payout_mode IN ('percentage','balance_min')),
  ADD COLUMN IF NOT EXISTS pay_upto_percentage numeric(5,2) DEFAULT 35.00,
  ADD COLUMN IF NOT EXISTS min_bank_balance numeric(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bank_balance numeric(14,2) DEFAULT 0;

-- 1.4 Log unificado de eventos
CREATE TABLE IF NOT EXISTS public.event_log (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid,
  admin_id uuid,
  ref_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_log_read_admin" ON public.event_log
  FOR SELECT USING (is_admin_user());

CREATE POLICY "event_log_insert" ON public.event_log
  FOR INSERT WITH CHECK (true);

-- ETAPA 2: Presets de operação
CREATE TABLE IF NOT EXISTS public.scratch_card_presets (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  win_probability_global numeric(5,2) NOT NULL,
  pay_upto_percentage numeric(5,2) NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.scratch_card_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage presets" ON public.scratch_card_presets
  FOR ALL USING (is_admin_user());

CREATE POLICY "Anyone can view presets" ON public.scratch_card_presets
  FOR SELECT USING (true);

-- Inserir presets padrão
INSERT INTO public.scratch_card_presets (name, win_probability_global, pay_upto_percentage, description) VALUES
 ('95/05', 5.0, 95.0, 'Alta margem, vitórias raras'),
 ('90/10', 10.0, 90.0, 'Balanceado padrão'),
 ('85/15', 15.0, 85.0, 'Mais agressivo'),
 ('80/20', 20.0, 80.0, 'Bem agressivo, mais vitórias')
ON CONFLICT DO NOTHING;

-- ETAPA 3: Funções utilitárias

-- Probabilidade efetiva por perfil
CREATE OR REPLACE FUNCTION public.scratch_effective_probability(
  p_global numeric, 
  p_influencer numeric, 
  p_normal numeric, 
  p_is_influencer boolean
) RETURNS numeric 
LANGUAGE plpgsql AS $$
DECLARE 
  p numeric;
BEGIN
  IF p_is_influencer IS TRUE AND p_influencer IS NOT NULL THEN 
    p := p_influencer;
  ELSIF p_is_influencer IS FALSE AND p_normal IS NOT NULL THEN 
    p := p_normal;
  ELSE 
    p := p_global; 
  END IF;
  
  RETURN LEAST(GREATEST(p, 0), 100);
END; 
$$;

-- Validação de payout conforme modo da banca
CREATE OR REPLACE FUNCTION public.scratch_validate_payout(
  p_requested numeric, 
  p_bank_balance numeric,
  p_payout_mode text, 
  p_pay_upto_percentage numeric, 
  p_min_bank_balance numeric
) RETURNS boolean 
LANGUAGE plpgsql AS $$
DECLARE 
  max_allowed numeric;
BEGIN
  IF p_payout_mode = 'percentage' THEN
    max_allowed := GREATEST(0, p_bank_balance * (COALESCE(p_pay_upto_percentage, 0) / 100.0));
    RETURN p_requested <= max_allowed;
  ELSIF p_payout_mode = 'balance_min' THEN
    RETURN (p_bank_balance - p_requested) >= COALESCE(p_min_bank_balance, 0);
  ELSE
    RETURN p_requested <= (p_bank_balance * 0.35);
  END IF;
END; 
$$;

-- Logger unificado
CREATE OR REPLACE FUNCTION public.event_log_add(
  p_event_type text, 
  p_user_id uuid, 
  p_admin_id uuid, 
  p_ref_id uuid, 
  p_details jsonb
) RETURNS void 
LANGUAGE sql AS $$
  INSERT INTO public.event_log(event_type, user_id, admin_id, ref_id, details)
  VALUES (p_event_type, p_user_id, p_admin_id, p_ref_id, COALESCE(p_details, '{}'::jsonb));
$$;

-- Aplicar preset numa raspadinha
CREATE OR REPLACE FUNCTION public.apply_preset_to_scratch(
  p_scratch_type text,
  p_preset_id bigint
) RETURNS void
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  preset_record record;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem aplicar presets.';
  END IF;

  SELECT * INTO preset_record FROM public.scratch_card_presets WHERE id = p_preset_id;
  IF NOT FOUND THEN 
    RAISE EXCEPTION 'Preset não encontrado'; 
  END IF;

  -- Atualizar configurações da raspadinha
  UPDATE public.scratch_card_settings
    SET win_probability_global = preset_record.win_probability_global,
        updated_at = now()
  WHERE scratch_type = p_scratch_type;

  -- Atualizar controle financeiro
  UPDATE public.scratch_card_financial_control
    SET payout_mode = 'percentage',
        pay_upto_percentage = preset_record.pay_upto_percentage,
        updated_at = now()
  WHERE scratch_type = p_scratch_type AND date = CURRENT_DATE;

  -- Log da ação
  PERFORM public.event_log_add(
    'SCRATCH_PRESET_APPLIED', 
    NULL, 
    auth.uid(), 
    gen_random_uuid(), 
    jsonb_build_object(
      'preset_name', preset_record.name,
      'scratch_type', p_scratch_type,
      'win_probability', preset_record.win_probability_global,
      'payout_percentage', preset_record.pay_upto_percentage
    )
  );
END;
$$;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas que precisam
DROP TRIGGER IF EXISTS update_scratch_settings_updated_at ON public.scratch_card_settings;
CREATE TRIGGER update_scratch_settings_updated_at
  BEFORE UPDATE ON public.scratch_card_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();