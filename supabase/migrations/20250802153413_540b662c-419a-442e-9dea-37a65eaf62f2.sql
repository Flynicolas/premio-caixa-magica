-- Verificar se existem configurações de raspadinha básicas
INSERT INTO scratch_card_settings (scratch_type, name, price, house_edge, win_probability, is_active) 
VALUES 
  ('classic', 'Raspadinha Clássica', 5.00, 0.20, 0.30, true),
  ('premium', 'Raspadinha Premium', 10.00, 0.18, 0.35, true),
  ('mega', 'Raspadinha Mega', 25.00, 0.15, 0.40, true),
  ('supreme', 'Raspadinha Supreme', 50.00, 0.12, 0.45, true)
ON CONFLICT (scratch_type) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  house_edge = EXCLUDED.house_edge,
  win_probability = EXCLUDED.win_probability,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Inicializar controle financeiro para cada tipo
INSERT INTO scratch_card_financial_control (scratch_type, date, profit_goal, total_sales, total_prizes_given, net_profit, cards_played, goal_reached)
VALUES 
  ('classic', CURRENT_DATE, 100.00, 0.00, 0.00, 0.00, 0, false),
  ('premium', CURRENT_DATE, 200.00, 0.00, 0.00, 0.00, 0, false),
  ('mega', CURRENT_DATE, 500.00, 0.00, 0.00, 0.00, 0, false),
  ('supreme', CURRENT_DATE, 1000.00, 0.00, 0.00, 0.00, 0, false)
ON CONFLICT (scratch_type, date) DO NOTHING;

-- Comentário: Os itens serão associados posteriormente através da interface admin