-- Limpar dados existentes de teste
DELETE FROM scratch_card_financial_control;
DELETE FROM scratch_card_probabilities;
DELETE FROM scratch_card_settings;

-- Inserir tipos corretos de raspadinha do sistema atual
INSERT INTO scratch_card_settings (scratch_type, name, price, house_edge, win_probability, is_active) 
VALUES 
  ('sorte', 'Raspadinha da Sorte', 5.00, 0.90, 0.10, true),
  ('dupla', 'Raspadinha Dupla', 10.00, 0.90, 0.10, true),
  ('ouro', 'Raspadinha de Ouro', 25.00, 0.90, 0.10, true),
  ('diamante', 'Raspadinha Diamante', 50.00, 0.90, 0.10, true),
  ('premium', 'Raspadinha Premium', 100.00, 0.90, 0.10, true);

-- Atualizar controle financeiro para usar percentual 90/10
-- house_edge = 0.90 (90% lucro), win_probability = 0.10 (10% para prêmios)
ALTER TABLE scratch_card_financial_control 
ADD COLUMN IF NOT EXISTS percentage_profit NUMERIC DEFAULT 0.90,
ADD COLUMN IF NOT EXISTS percentage_prizes NUMERIC DEFAULT 0.10,
ADD COLUMN IF NOT EXISTS daily_budget_prizes NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS remaining_budget NUMERIC DEFAULT 0.00;

-- Inicializar controle financeiro para cada tipo correto
INSERT INTO scratch_card_financial_control (
  scratch_type, 
  date, 
  profit_goal, 
  percentage_profit,
  percentage_prizes,
  daily_budget_prizes,
  remaining_budget,
  total_sales, 
  total_prizes_given, 
  net_profit, 
  cards_played, 
  goal_reached
) VALUES 
  ('sorte', CURRENT_DATE, 100.00, 0.90, 0.10, 0.00, 0.00, 0.00, 0.00, 0.00, 0, false),
  ('dupla', CURRENT_DATE, 200.00, 0.90, 0.10, 0.00, 0.00, 0.00, 0.00, 0.00, 0, false),
  ('ouro', CURRENT_DATE, 500.00, 0.90, 0.10, 0.00, 0.00, 0.00, 0.00, 0.00, 0, false),
  ('diamante', CURRENT_DATE, 1000.00, 0.90, 0.10, 0.00, 0.00, 0.00, 0.00, 0.00, 0, false),
  ('premium', CURRENT_DATE, 2000.00, 0.90, 0.10, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, false)
ON CONFLICT (scratch_type, date) DO UPDATE SET
  percentage_profit = EXCLUDED.percentage_profit,
  percentage_prizes = EXCLUDED.percentage_prizes,
  daily_budget_prizes = EXCLUDED.daily_budget_prizes,
  remaining_budget = EXCLUDED.remaining_budget;