-- Verificar se existem configurações de raspadinha básicas
INSERT INTO scratch_card_settings (scratch_type, name, price, house_edge, win_probability, is_active) 
VALUES 
  ('classic', 'Raspadinha Clássica', 5.00, 0.20, 0.30, true),
  ('premium', 'Raspadinha Premium', 10.00, 0.18, 0.35, true),
  ('mega', 'Raspadinha Mega', 25.00, 0.15, 0.40, true),
  ('supreme', 'Raspadinha Supreme', 50.00, 0.12, 0.45, true);

-- Inicializar controle financeiro para cada tipo  
INSERT INTO scratch_card_financial_control (scratch_type, date, profit_goal, total_sales, total_prizes_given, net_profit, cards_played, goal_reached)
SELECT 
  unnest(ARRAY['classic', 'premium', 'mega', 'supreme']) as scratch_type,
  CURRENT_DATE as date,
  unnest(ARRAY[100.00, 200.00, 500.00, 1000.00]) as profit_goal,
  0.00 as total_sales,
  0.00 as total_prizes_given,
  0.00 as net_profit,
  0 as cards_played,
  false as goal_reached
WHERE NOT EXISTS (
  SELECT 1 FROM scratch_card_financial_control 
  WHERE date = CURRENT_DATE
);