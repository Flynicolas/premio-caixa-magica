-- FASE 1: Criação das tabelas básicas do sistema RTP por pote
-- (Sem afetar tabelas existentes - sistema paralelo)

-- 1) Adicionar feature flag ao sistema atual
ALTER TABLE public.scratch_card_settings 
ADD COLUMN IF NOT EXISTS rtp_enabled boolean DEFAULT false;

-- 2) Potes de RTP por tipo de jogo
CREATE TABLE IF NOT EXISTS public.rtp_pots (
  game_type text PRIMARY KEY,
  rtp_target numeric NOT NULL DEFAULT 0.50, -- 50% RTP alvo
  cap_enabled boolean NOT NULL DEFAULT false,
  cap_value numeric NOT NULL DEFAULT 0, -- prêmio único máximo (opcional)
  total_bet numeric NOT NULL DEFAULT 0,
  total_paid numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3) Controle "cap 1x por usuário"  
CREATE TABLE IF NOT EXISTS public.rtp_cap_awards (
  game_type text NOT NULL,
  user_id uuid NOT NULL,
  awarded boolean NOT NULL DEFAULT false,
  awarded_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (game_type, user_id)
);

-- 4) Tabela unificada de prêmios por tipo (inclui "perdeu")
CREATE TABLE IF NOT EXISTS public.scratch_prizes (
  id bigserial PRIMARY KEY,
  game_type text NOT NULL,
  name text NOT NULL,
  value numeric NOT NULL, -- R$ valor do prêmio
  weight numeric NOT NULL DEFAULT 1, -- peso para sorteio
  is_active boolean NOT NULL DEFAULT true,
  min_quantity integer DEFAULT 0, -- opcional
  max_quantity integer DEFAULT null, -- opcional
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scratch_prizes_game_type ON public.scratch_prizes(game_type);
CREATE INDEX IF NOT EXISTS idx_scratch_prizes_active ON public.scratch_prizes(game_type, is_active);

-- 5) Auditoria das jogadas do sistema RTP
CREATE TABLE IF NOT EXISTS public.game_rounds (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  game_type text NOT NULL,
  bet numeric NOT NULL,
  prize numeric NOT NULL,
  rtp_after numeric,
  decided_at timestamp with time zone NOT NULL DEFAULT now(),
  meta jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_game_rounds_game_type ON public.game_rounds(game_type);
CREATE INDEX IF NOT EXISTS idx_game_rounds_user ON public.game_rounds(user_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_decided_at ON public.game_rounds(decided_at);

-- 6) Idempotência de chamadas do cliente
CREATE TABLE IF NOT EXISTS public.client_transactions (
  client_tx_id text PRIMARY KEY,
  user_id uuid NOT NULL,
  game_type text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  result jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_tx_user ON public.client_transactions(user_id);

-- 7) Inserir configuração inicial para teste (PIX na Conta)
INSERT INTO public.rtp_pots (game_type, rtp_target, cap_enabled, cap_value) 
VALUES ('pix_na_conta', 0.50, false, 0)
ON CONFLICT (game_type) DO NOTHING;

-- 8) Inserir prêmios básicos para teste do PIX na Conta
INSERT INTO public.scratch_prizes (game_type, name, value, weight) VALUES
('pix_na_conta', 'Perdeu', 0, 60),
('pix_na_conta', 'R$ 1,00', 1, 28),
('pix_na_conta', 'R$ 2,00', 2, 9),
('pix_na_conta', 'R$ 5,00', 5, 2.5),
('pix_na_conta', 'R$ 10,00', 10, 0.5)
ON CONFLICT DO NOTHING;

-- 9) Habilitar RLS para as novas tabelas

-- RTP Pots - apenas admins podem gerenciar
ALTER TABLE public.rtp_pots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage RTP pots" ON public.rtp_pots
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

-- Cap Awards - usuários veem seus próprios, admins veem tudo  
ALTER TABLE public.rtp_cap_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cap awards" ON public.rtp_cap_awards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage cap awards" ON public.rtp_cap_awards
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

-- Scratch Prizes - visualização pública, gestão apenas para admins
ALTER TABLE public.scratch_prizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active prizes" ON public.scratch_prizes
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage prizes" ON public.scratch_prizes
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

-- Game Rounds - usuários veem suas próprias rodadas, admins veem tudo
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own game rounds" ON public.game_rounds
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage game rounds" ON public.game_rounds
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

-- Client Transactions - usuários veem suas próprias transações
ALTER TABLE public.client_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own client transactions" ON public.client_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage client transactions" ON public.client_transactions
  FOR ALL USING (true) WITH CHECK (true);

-- 10) Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_rtp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rtp_pots_updated_at
  BEFORE UPDATE ON public.rtp_pots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_rtp();

CREATE TRIGGER update_scratch_prizes_updated_at
  BEFORE UPDATE ON public.scratch_prizes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_rtp();