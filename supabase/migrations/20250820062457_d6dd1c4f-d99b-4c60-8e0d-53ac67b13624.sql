-- Padronização do Sistema 90/10 para Raspadinhas
-- Standardizing 90/10 System for Scratch Cards

-- 1. Atualizar configurações globais das raspadinhas para probabilidades consistentes
UPDATE scratch_card_settings 
SET 
  win_probability_global = CASE 
    WHEN price <= 1.00 THEN 8.00  -- Raspadinhas baratas: 8% chance
    WHEN price <= 5.00 THEN 6.00  -- Raspadinhas médias: 6% chance  
    WHEN price <= 15.00 THEN 5.00 -- Raspadinhas caras: 5% chance
    ELSE 4.00                     -- Raspadinhas premium: 4% chance
  END,
  house_edge = 0.90,              -- 90% para casa
  updated_at = now()
WHERE is_active = true;

-- 2. Padronizar controle financeiro para sistema 90/10
UPDATE scratch_card_financial_control 
SET 
  pay_upto_percentage = 10.00,    -- Máximo 10% do banco por rodada
  percentage_profit = 0.90,       -- 90% de lucro
  percentage_prizes = 0.10,       -- 10% em prêmios
  -- Definir orçamento diário baseado no preço da raspadinha
  daily_budget_prizes = CASE 
    WHEN scratch_type = 'pix' THEN 50.00
    WHEN scratch_type = 'sorte' THEN 100.00
    WHEN scratch_type = 'dupla' THEN 250.00
    WHEN scratch_type = 'ouro' THEN 500.00
    WHEN scratch_type = 'diamante' THEN 1000.00
    WHEN scratch_type = 'premium' THEN 2500.00
    ELSE 100.00
  END,
  -- Ajustar saldo mínimo do banco (equivalente a 50 jogadas)
  min_bank_balance = CASE 
    WHEN scratch_type = 'pix' THEN 25.00      -- 50 x 0.50
    WHEN scratch_type = 'sorte' THEN 50.00    -- 50 x 1.00
    WHEN scratch_type = 'dupla' THEN 125.00   -- 50 x 2.50
    WHEN scratch_type = 'ouro' THEN 250.00    -- 50 x 5.00
    WHEN scratch_type = 'diamante' THEN 500.00 -- 50 x 10.00
    WHEN scratch_type = 'premium' THEN 1250.00 -- 50 x 25.00
    ELSE 100.00
  END,
  -- Definir saldo inicial do banco (equivalente a 1000 jogadas)
  bank_balance = CASE 
    WHEN scratch_type = 'pix' THEN 500.00
    WHEN scratch_type = 'sorte' THEN 1000.00
    WHEN scratch_type = 'dupla' THEN 2500.00
    WHEN scratch_type = 'ouro' THEN 5000.00
    WHEN scratch_type = 'diamante' THEN 10000.00
    WHEN scratch_type = 'premium' THEN 25000.00
    ELSE 1000.00
  END,
  updated_at = now()
WHERE date = CURRENT_DATE;

-- 3. Criar configurações para datas futuras se não existirem
INSERT INTO scratch_card_financial_control (
  scratch_type, date, pay_upto_percentage, percentage_profit, percentage_prizes,
  daily_budget_prizes, min_bank_balance, bank_balance, total_sales, total_prizes_given, 
  net_profit, cards_played, remaining_budget, goal_reached
)
SELECT 
  s.scratch_type,
  CURRENT_DATE,
  10.00, -- pay_upto_percentage padronizado
  0.90,  -- 90% lucro
  0.10,  -- 10% prêmios
  CASE 
    WHEN s.scratch_type = 'pix' THEN 50.00
    WHEN s.scratch_type = 'sorte' THEN 100.00
    WHEN s.scratch_type = 'dupla' THEN 250.00
    WHEN s.scratch_type = 'ouro' THEN 500.00
    WHEN s.scratch_type = 'diamante' THEN 1000.00
    WHEN s.scratch_type = 'premium' THEN 2500.00
    ELSE 100.00
  END as daily_budget_prizes,
  CASE 
    WHEN s.scratch_type = 'pix' THEN 25.00
    WHEN s.scratch_type = 'sorte' THEN 50.00
    WHEN s.scratch_type = 'dupla' THEN 125.00
    WHEN s.scratch_type = 'ouro' THEN 250.00
    WHEN s.scratch_type = 'diamante' THEN 500.00
    WHEN s.scratch_type = 'premium' THEN 1250.00
    ELSE 100.00
  END as min_bank_balance,
  CASE 
    WHEN s.scratch_type = 'pix' THEN 500.00
    WHEN s.scratch_type = 'sorte' THEN 1000.00
    WHEN s.scratch_type = 'dupla' THEN 2500.00
    WHEN s.scratch_type = 'ouro' THEN 5000.00
    WHEN s.scratch_type = 'diamante' THEN 10000.00
    WHEN s.scratch_type = 'premium' THEN 25000.00
    ELSE 1000.00
  END as bank_balance,
  0.00, 0.00, 0.00, 0, 0.00, false
FROM scratch_card_settings s
WHERE s.is_active = true
ON CONFLICT (scratch_type, date) DO NOTHING;

-- 4. Log da padronização do sistema
INSERT INTO event_log (event_type, admin_id, details)
VALUES (
  'SCRATCH_SYSTEM_STANDARDIZED',
  auth.uid(),
  jsonb_build_object(
    'action', 'Padronização Sistema 90/10',
    'changes', jsonb_build_object(
      'win_probabilities_updated', 'Ajustadas para 4-8% baseado no preço',
      'pay_upto_percentage', 'Padronizado para 10%',
      'bank_balances', 'Definidos baseados no preço da raspadinha',
      'profit_margin', '90% para casa, 10% em prêmios'
    ),
    'timestamp', now()
  )
);