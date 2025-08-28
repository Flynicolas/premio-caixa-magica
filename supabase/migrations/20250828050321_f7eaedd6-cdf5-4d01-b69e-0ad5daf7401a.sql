-- SISTEMA COMPLETO DE AFILIADOS - MIGRAÇÃO INICIAL
-- Implementa sistema de 3 níveis com Revshare/CPA/NGR

-- Tabela principal de afiliados (1:1 com usuário)
CREATE TABLE IF NOT EXISTS affiliates (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ref_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'blocked')),
  upline1 uuid REFERENCES auth.users(id),  -- até 3 níveis de upline
  upline2 uuid REFERENCES auth.users(id),
  upline3 uuid REFERENCES auth.users(id),
  auto_payout_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_affiliates_ref_code ON affiliates(ref_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_upline1 ON affiliates(upline1);
CREATE INDEX IF NOT EXISTS idx_affiliates_upline2 ON affiliates(upline2);
CREATE INDEX IF NOT EXISTS idx_affiliates_upline3 ON affiliates(upline3);

-- Configurações globais do programa de afiliados
CREATE TABLE IF NOT EXISTS affiliate_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true), -- sempre 1 linha
  plan_type text NOT NULL DEFAULT 'hybrid' CHECK (plan_type IN ('revshare', 'cpa', 'ngr', 'hybrid')),
  
  -- Percentuais Revshare por nível
  revshare_l1 numeric(5,4) DEFAULT 0.0800, -- 8%
  revshare_l2 numeric(5,4) DEFAULT 0.0400, -- 4%
  revshare_l3 numeric(5,4) DEFAULT 0.0300, -- 3%
  
  -- Valores CPA fixos (centavos)
  cpa_l1_cents bigint DEFAULT 5000,  -- R$ 50,00
  cpa_l2_cents bigint DEFAULT 2000,  -- R$ 20,00
  cpa_l3_cents bigint DEFAULT 1000,  -- R$ 10,00
  
  -- Percentuais NGR por nível
  ngr_l1 numeric(5,4) DEFAULT 0.0500, -- 5%
  ngr_l2 numeric(5,4) DEFAULT 0.0200, -- 2%
  ngr_l3 numeric(5,4) DEFAULT 0.0100, -- 1%
  
  -- Configurações de trigger e pagamento
  cpa_trigger_min_deposit_cents bigint DEFAULT 5000, -- FTD mínimo R$ 50
  payout_min_cents bigint DEFAULT 5000,              -- saque mínimo R$ 50
  payout_day_of_week int DEFAULT 1,                  -- 1=segunda
  payout_hour int DEFAULT 2,                         -- 02:00
  require_manual_approval boolean DEFAULT true,      -- admin aprova antes do pagamento
  negative_carryover boolean DEFAULT true,           -- transportar saldo negativo
  
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO affiliate_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

-- Cliques e tracking UTM
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id bigserial PRIMARY KEY,
  ref_code text NOT NULL,
  affiliate_id uuid REFERENCES auth.users(id), -- derivado de ref_code
  ip inet,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  landing_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para tracking
CREATE INDEX IF NOT EXISTS idx_clicks_ref_code ON affiliate_clicks(ref_code);
CREATE INDEX IF NOT EXISTS idx_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON affiliate_clicks(created_at);

-- Atribuição (quem indicou quem)
CREATE TABLE IF NOT EXISTS affiliate_attributions (
  referred_user uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ref_code text NOT NULL,
  affiliate_id uuid NOT NULL REFERENCES auth.users(id), -- nível 1 (dono do ref)
  upline2 uuid REFERENCES auth.users(id),
  upline3 uuid REFERENCES auth.users(id),
  first_click_id bigint REFERENCES affiliate_clicks(id),
  last_click_id bigint REFERENCES affiliate_clicks(id),
  attributed_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para atribuições
CREATE INDEX IF NOT EXISTS idx_attributions_affiliate_id ON affiliate_attributions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_attributions_upline2 ON affiliate_attributions(upline2);
CREATE INDEX IF NOT EXISTS idx_attributions_upline3 ON affiliate_attributions(upline3);

-- Comissões computadas
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id bigserial PRIMARY KEY,
  affiliate_id uuid NOT NULL REFERENCES auth.users(id),
  referred_user uuid NOT NULL REFERENCES auth.users(id),
  level int NOT NULL CHECK (level BETWEEN 1 AND 3),
  kind text NOT NULL CHECK (kind IN ('revshare', 'cpa', 'ngr')),
  base_amount_cents bigint NOT NULL DEFAULT 0,  -- base do cálculo
  rate numeric(5,4) NOT NULL DEFAULT 0,         -- % para revshare/ngr
  amount_cents bigint NOT NULL DEFAULT 0,       -- valor para o afiliado
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'accrued' CHECK (status IN ('accrued', 'approved', 'paid', 'rejected')),
  source_ref text,                              -- referência (payment_id, job_id, etc.)
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  paid_at timestamptz
);

-- Índices para comissões
CREATE INDEX IF NOT EXISTS idx_comm_affiliate_period ON affiliate_commissions(affiliate_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_comm_status ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_comm_kind ON affiliate_commissions(kind);
CREATE INDEX IF NOT EXISTS idx_comm_level ON affiliate_commissions(level);

-- Materiais de marketing
CREATE TABLE IF NOT EXISTS affiliate_assets (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  url text NOT NULL,  -- link do arquivo/imagem/vídeo
  tags text[] DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Função para gerar ref_code único
CREATE OR REPLACE FUNCTION gen_ref_code(p_len int DEFAULT 6)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_code text;
  v_try int := 0;
BEGIN
  LOOP
    -- Gerar código usando Base36 (0-9, A-Z)
    v_code := upper(substr(replace(encode(digest(random()::text, 'sha1'), 'hex'), '0', 'Z'), 1, p_len));
    
    -- Verificar se já existe
    EXIT WHEN NOT EXISTS (SELECT 1 FROM affiliates WHERE ref_code = v_code);
    
    v_try := v_try + 1;
    IF v_try > 20 THEN 
      RAISE EXCEPTION 'Falha ao gerar ref_code após 20 tentativas';
    END IF;
  END LOOP;
  
  RETURN v_code;
END;$$;

-- Trigger para associar cliques ao affiliate_id
CREATE OR REPLACE FUNCTION aff_click_bind_affiliate()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Tentar associar o clique ao afiliado pelo ref_code
  UPDATE affiliate_clicks 
  SET affiliate_id = a.user_id
  FROM affiliates a
  WHERE affiliate_clicks.ref_code = a.ref_code 
    AND affiliate_clicks.id = NEW.id
    AND affiliate_clicks.affiliate_id IS NULL;
  
  RETURN NEW;
END;$$;

CREATE TRIGGER trg_click_bind 
  AFTER INSERT ON affiliate_clicks
  FOR EACH ROW 
  EXECUTE PROCEDURE aff_click_bind_affiliate();

-- Função para registrar atribuição
CREATE OR REPLACE FUNCTION aff_assign_user(
  p_referred_user uuid, 
  p_ref_code text, 
  p_first_click_id bigint DEFAULT NULL,
  p_last_click_id bigint DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_aff affiliates%ROWTYPE;
BEGIN
  -- Buscar afiliado pelo ref_code
  SELECT * INTO v_aff FROM affiliates WHERE ref_code = p_ref_code AND status = 'approved';
  
  IF NOT FOUND THEN 
    RETURN; -- Afiliado não encontrado ou não aprovado
  END IF;
  
  -- Inserir atribuição (apenas se não existir)
  INSERT INTO affiliate_attributions (
    referred_user, 
    ref_code, 
    affiliate_id, 
    upline2, 
    upline3, 
    first_click_id, 
    last_click_id
  )
  VALUES (
    p_referred_user, 
    p_ref_code, 
    v_aff.user_id, 
    v_aff.upline1, 
    v_aff.upline2, 
    p_first_click_id, 
    p_last_click_id
  )
  ON CONFLICT (referred_user) DO NOTHING;
END;$$;

-- Função para calcular comissões Revshare/NGR por período
CREATE OR REPLACE FUNCTION aff_calc_commissions(p_start date, p_end date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_settings affiliate_settings%ROWTYPE;
BEGIN
  -- Buscar configurações
  SELECT * INTO v_settings FROM affiliate_settings WHERE id = true;
  IF NOT FOUND THEN RETURN; END IF;
  
  -- Calcular GGR/NGR por usuário referido no período
  WITH gaming_data AS (
    SELECT 
      gr.user_id as referred_user,
      SUM(gr.bet) as total_bet,
      SUM(gr.prize) as total_prize,
      SUM(gr.bet) - SUM(gr.prize) as ggr_amount
    FROM game_rounds gr
    WHERE gr.decided_at >= p_start::timestamptz 
      AND gr.decided_at < (p_end + 1)::timestamptz
      AND gr.user_id IN (SELECT referred_user FROM affiliate_attributions)
    GROUP BY gr.user_id
    HAVING SUM(gr.bet) - SUM(gr.prize) > 0 -- Apenas GGR positivo
  )
  INSERT INTO affiliate_commissions (
    affiliate_id, 
    referred_user, 
    level, 
    kind, 
    base_amount_cents, 
    rate, 
    amount_cents, 
    period_start, 
    period_end, 
    status, 
    source_ref
  )
  -- Nível 1
  SELECT 
    a.affiliate_id,
    a.referred_user,
    1,
    CASE WHEN v_settings.plan_type IN ('ngr', 'hybrid') THEN 'ngr' ELSE 'revshare' END,
    (g.ggr_amount * 100)::bigint, -- converter para centavos
    CASE WHEN v_settings.plan_type IN ('ngr', 'hybrid') THEN v_settings.ngr_l1 ELSE v_settings.revshare_l1 END,
    ROUND((g.ggr_amount * 100) * CASE WHEN v_settings.plan_type IN ('ngr', 'hybrid') THEN v_settings.ngr_l1 ELSE v_settings.revshare_l1 END)::bigint,
    p_start,
    p_end,
    'accrued',
    'calc:' || p_start::text || '_' || p_end::text
  FROM affiliate_attributions a
  JOIN gaming_data g ON g.referred_user = a.referred_user
  
  UNION ALL
  
  -- Nível 2
  SELECT 
    a.upline2,
    a.referred_user,
    2,
    CASE WHEN v_settings.plan_type IN ('ngr', 'hybrid') THEN 'ngr' ELSE 'revshare' END,
    (g.ggr_amount * 100)::bigint,
    CASE WHEN v_settings.plan_type IN ('ngr', 'hybrid') THEN v_settings.ngr_l2 ELSE v_settings.revshare_l2 END,
    ROUND((g.ggr_amount * 100) * CASE WHEN v_settings.plan_type IN ('ngr', 'hybrid') THEN v_settings.ngr_l2 ELSE v_settings.revshare_l2 END)::bigint,
    p_start,
    p_end,
    'accrued',
    'calc:' || p_start::text || '_' || p_end::text
  FROM affiliate_attributions a
  JOIN gaming_data g ON g.referred_user = a.referred_user
  WHERE a.upline2 IS NOT NULL
  
  UNION ALL
  
  -- Nível 3
  SELECT 
    a.upline3,
    a.referred_user,
    3,
    CASE WHEN v_settings.plan_type IN ('ngr', 'hybrid') THEN 'ngr' ELSE 'revshare' END,
    (g.ggr_amount * 100)::bigint,
    CASE WHEN v_settings.plan_type IN ('ngr', 'hybrid') THEN v_settings.ngr_l3 ELSE v_settings.revshare_l3 END,
    ROUND((g.ggr_amount * 100) * CASE WHEN v_settings.plan_type IN ('ngr', 'hybrid') THEN v_settings.ngr_l3 ELSE v_settings.revshare_l3 END)::bigint,
    p_start,
    p_end,
    'accrued',
    'calc:' || p_start::text || '_' || p_end::text
  FROM affiliate_attributions a
  JOIN gaming_data g ON g.referred_user = a.referred_user
  WHERE a.upline3 IS NOT NULL;
  
END;$$;

-- Função para disparar CPA quando atingir FTD
CREATE OR REPLACE FUNCTION aff_try_cpa(
  p_user uuid, 
  p_payment_id text, 
  p_deposit_total_cents bigint
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
  v_settings affiliate_settings%ROWTYPE;
  v_attr affiliate_attributions%ROWTYPE;
BEGIN
  -- Buscar configurações
  SELECT * INTO v_settings FROM affiliate_settings WHERE id = true;
  IF NOT FOUND THEN RETURN; END IF;
  
  -- Verificar se atingiu o mínimo para CPA
  IF p_deposit_total_cents < v_settings.cpa_trigger_min_deposit_cents THEN 
    RETURN; 
  END IF;
  
  -- Buscar atribuição do usuário
  SELECT * INTO v_attr FROM affiliate_attributions WHERE referred_user = p_user;
  IF NOT FOUND THEN RETURN; END IF;
  
  -- Garantir CPA 1x por referido (idempotência por source_ref)
  -- Nível 1
  INSERT INTO affiliate_commissions (
    affiliate_id, referred_user, level, kind, base_amount_cents, rate, 
    amount_cents, period_start, period_end, status, source_ref
  )
  VALUES (
    v_attr.affiliate_id, p_user, 1, 'cpa', 0, 0, 
    v_settings.cpa_l1_cents, CURRENT_DATE, CURRENT_DATE, 'accrued', 'cpa:' || p_payment_id
  )
  ON CONFLICT DO NOTHING;
  
  -- Nível 2
  IF v_attr.upline2 IS NOT NULL THEN
    INSERT INTO affiliate_commissions (
      affiliate_id, referred_user, level, kind, base_amount_cents, rate,
      amount_cents, period_start, period_end, status, source_ref
    )
    VALUES (
      v_attr.upline2, p_user, 2, 'cpa', 0, 0,
      v_settings.cpa_l2_cents, CURRENT_DATE, CURRENT_DATE, 'accrued', 'cpa:' || p_payment_id
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Nível 3
  IF v_attr.upline3 IS NOT NULL THEN
    INSERT INTO affiliate_commissions (
      affiliate_id, referred_user, level, kind, base_amount_cents, rate,
      amount_cents, period_start, period_end, status, source_ref
    )
    VALUES (
      v_attr.upline3, p_user, 3, 'cpa', 0, 0,
      v_settings.cpa_l3_cents, CURRENT_DATE, CURRENT_DATE, 'accrued', 'cpa:' || p_payment_id
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
END;$$;

-- Views para painéis

-- Overview por afiliado
CREATE OR REPLACE VIEW v_affiliate_overview AS
SELECT 
  a.user_id as affiliate_id,
  a.ref_code,
  a.status,
  COALESCE(SUM(CASE WHEN c.status IN ('accrued','approved','paid') THEN c.amount_cents END), 0) as total_gerado_cents,
  COALESCE(SUM(CASE WHEN c.status = 'approved' THEN c.amount_cents END), 0) as aprovado_cents,
  COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.amount_cents END), 0) as pago_cents,
  COALESCE(SUM(CASE WHEN c.status = 'accrued' THEN c.amount_cents END), 0) as pendente_cents,
  COUNT(DISTINCT attr.referred_user) as total_indicados
FROM affiliates a
LEFT JOIN affiliate_commissions c ON c.affiliate_id = a.user_id
LEFT JOIN affiliate_attributions attr ON attr.affiliate_id = a.user_id
GROUP BY a.user_id, a.ref_code, a.status;

-- Métricas por afiliado
CREATE OR REPLACE VIEW v_affiliate_metrics AS
WITH clicks_data AS (
  SELECT affiliate_id, COUNT(*) as cliques
  FROM affiliate_clicks 
  WHERE affiliate_id IS NOT NULL 
  GROUP BY affiliate_id
),
registrations_data AS (
  SELECT affiliate_id, COUNT(*) as cadastros
  FROM affiliate_attributions 
  GROUP BY affiliate_id
),
deposits_data AS (
  SELECT 
    attr.affiliate_id,
    COUNT(DISTINCT CASE WHEN t.type = 'deposit' AND t.status = 'completed' THEN attr.referred_user END) as usuarios_depositaram,
    COALESCE(SUM(CASE WHEN t.type = 'deposit' AND t.status = 'completed' THEN t.amount END), 0) as total_depositos
  FROM affiliate_attributions attr
  LEFT JOIN transactions t ON t.user_id = attr.referred_user
  GROUP BY attr.affiliate_id
)
SELECT 
  a.user_id as affiliate_id,
  COALESCE(c.cliques, 0) as cliques,
  COALESCE(r.cadastros, 0) as cadastros,
  COALESCE(d.usuarios_depositaram, 0) as usuarios_depositaram,
  COALESCE(d.total_depositos, 0) as total_depositos,
  CASE 
    WHEN COALESCE(c.cliques, 0) = 0 THEN 0
    ELSE ROUND((COALESCE(r.cadastros, 0)::numeric / c.cliques) * 100, 2)
  END as taxa_conversao_cadastro,
  CASE 
    WHEN COALESCE(r.cadastros, 0) = 0 THEN 0
    ELSE ROUND((COALESCE(d.usuarios_depositaram, 0)::numeric / r.cadastros) * 100, 2)
  END as taxa_conversao_deposito
FROM affiliates a
LEFT JOIN clicks_data c ON c.affiliate_id = a.user_id
LEFT JOIN registrations_data r ON r.affiliate_id = a.user_id
LEFT JOIN deposits_data d ON d.affiliate_id = a.user_id;

-- RLS Policies

-- Affiliates: usuário vê apenas seu registro, admin vê todos
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate record" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affiliate record" ON affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate record" ON affiliates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all affiliates" ON affiliates
  FOR ALL USING (is_admin_user());

-- Affiliate Settings
ALTER TABLE affiliate_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage affiliate settings" ON affiliate_settings
  FOR ALL USING (is_admin_user());

CREATE POLICY "Anyone can view affiliate settings" ON affiliate_settings
  FOR SELECT USING (true);

-- Clicks: sistema pode inserir, afiliados veem seus cliques, admin vê todos
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can insert clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Affiliates can view own clicks" ON affiliate_clicks
  FOR SELECT USING (affiliate_id = auth.uid());

CREATE POLICY "Admins can view all clicks" ON affiliate_clicks
  FOR SELECT USING (is_admin_user());

-- Attributions: afiliados veem suas atribuições, admin vê todas
ALTER TABLE affiliate_attributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can insert attributions" ON affiliate_attributions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Affiliates can view own attributions" ON affiliate_attributions
  FOR SELECT USING (affiliate_id = auth.uid() OR upline2 = auth.uid() OR upline3 = auth.uid());

CREATE POLICY "Admins can manage all attributions" ON affiliate_attributions
  FOR ALL USING (is_admin_user());

-- Commissions: afiliados veem suas comissões, admin vê todas
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage commissions" ON affiliate_commissions
  FOR ALL USING (true); -- Para permitir cálculos automáticos

CREATE POLICY "Affiliates can view own commissions" ON affiliate_commissions
  FOR SELECT USING (affiliate_id = auth.uid());

CREATE POLICY "Admins can manage all commissions" ON affiliate_commissions
  FOR ALL USING (is_admin_user());

-- Assets: todos podem ver, admin gerencia
ALTER TABLE affiliate_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active assets" ON affiliate_assets
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage assets" ON affiliate_assets
  FOR ALL USING (is_admin_user());

-- Trigger para atualizar updated_at em affiliates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_affiliates_updated_at 
  BEFORE UPDATE ON affiliates
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_affiliate_settings_updated_at 
  BEFORE UPDATE ON affiliate_settings
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();