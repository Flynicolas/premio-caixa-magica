-- CORREÇÃO EMERGENCIAL: Aumentar orçamentos diários para sistema 90/10
-- Atualizar orçamentos diários para permitir funcionamento adequado

UPDATE scratch_card_financial_control 
SET 
  remaining_budget = CASE 
    WHEN scratch_type = 'pix' THEN 50.00  -- Aumentar de 5 para 50
    WHEN scratch_type = 'sorte' THEN 100.00  -- Aumentar de 25 para 100
    ELSE remaining_budget 
  END,
  daily_budget_prizes = CASE 
    WHEN scratch_type = 'pix' THEN 50.00
    WHEN scratch_type = 'sorte' THEN 100.00  
    ELSE daily_budget_prizes
  END,
  updated_at = now()
WHERE date = CURRENT_DATE 
  AND scratch_type IN ('pix', 'sorte');

-- Criar registros para hoje se não existirem
INSERT INTO scratch_card_financial_control (
  scratch_type,
  date,
  remaining_budget,
  daily_budget_prizes,
  percentage_prizes,
  percentage_profit
) VALUES
  ('pix', CURRENT_DATE, 50.00, 50.00, 0.10, 0.90),
  ('sorte', CURRENT_DATE, 100.00, 100.00, 0.10, 0.90)
ON CONFLICT (scratch_type, date) DO UPDATE SET
  remaining_budget = EXCLUDED.remaining_budget,
  daily_budget_prizes = EXCLUDED.daily_budget_prizes,
  updated_at = now();

-- Atualizar configurações base das raspadinhas
UPDATE scratch_card_settings 
SET 
  base_win_probability = CASE 
    WHEN scratch_type = 'pix' THEN 0.02  -- 2% base
    WHEN scratch_type = 'sorte' THEN 0.03  -- 3% base
    ELSE base_win_probability
  END,
  updated_at = now()
WHERE scratch_type IN ('pix', 'sorte');