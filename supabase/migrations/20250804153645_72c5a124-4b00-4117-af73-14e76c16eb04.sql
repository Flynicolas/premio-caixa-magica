-- Criar novos itens de dinheiro para as raspadinhas
INSERT INTO public.items (name, category, rarity, base_value, image_url, delivery_type, requires_address, requires_document, is_active, chest_types) VALUES
-- Itens de dinheiro para PIX (valores pequenos)
('R$ 1,00 PIX', 'dinheiro', 'common', 1.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/money-1-real.png', 'digital', false, false, true, ARRAY['scratch_pix']),
('R$ 2,00 PIX', 'dinheiro', 'common', 2.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/money-2-real.png', 'digital', false, false, true, ARRAY['scratch_pix']),
('R$ 5,00 PIX', 'dinheiro', 'rare', 5.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/money-5-real.png', 'digital', false, false, true, ARRAY['scratch_pix']),
('R$ 10,00 PIX', 'dinheiro', 'epic', 10.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/money-10-real.png', 'digital', false, false, true, ARRAY['scratch_pix']),

-- Itens de dinheiro para outras raspadinhas (valores médios)
('R$ 25,00 PIX', 'dinheiro', 'rare', 25.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/money-25-real.png', 'digital', false, false, true, ARRAY['scratch_sorte', 'scratch_dupla']),
('R$ 50,00 PIX', 'dinheiro', 'epic', 50.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/money-50-real.png', 'digital', false, false, true, ARRAY['scratch_sorte', 'scratch_dupla', 'scratch_ouro']),
('R$ 100,00 PIX', 'dinheiro', 'legendary', 100.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/money-100-real.png', 'digital', false, false, true, ARRAY['scratch_ouro', 'scratch_diamante']),
('R$ 250,00 PIX', 'dinheiro', 'legendary', 250.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/money-250-real.png', 'digital', false, false, true, ARRAY['scratch_diamante', 'scratch_premium']),
('R$ 500,00 PIX', 'dinheiro', 'special', 500.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/money-500-real.png', 'digital', false, false, true, ARRAY['scratch_premium']),

-- Itens físicos pequenos (para raspadinhas básicas)
('Fone de Ouvido Bluetooth', 'eletronicos', 'common', 45.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/fone-bluetooth.png', 'physical', true, true, true, ARRAY['scratch_sorte', 'scratch_dupla']),
('Power Bank 5000mAh', 'eletronicos', 'rare', 65.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/power-bank.png', 'physical', true, true, true, ARRAY['scratch_sorte', 'scratch_dupla']),
('Mouse Gamer RGB', 'eletronicos', 'rare', 85.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/mouse-gamer.png', 'physical', true, true, true, ARRAY['scratch_dupla', 'scratch_ouro']),
('Teclado Mecânico', 'eletronicos', 'epic', 120.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/teclado-mecanico.png', 'physical', true, true, true, ARRAY['scratch_ouro', 'scratch_diamante']),

-- Itens físicos médios/grandes (para raspadinhas premium)
('Smartphone Android', 'eletronicos', 'legendary', 800.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/smartphone.png', 'physical', true, true, true, ARRAY['scratch_diamante', 'scratch_premium']),
('Notebook Gamer', 'eletronicos', 'special', 2500.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/notebook-gamer.png', 'physical', true, true, true, ARRAY['scratch_premium']),
('Console PlayStation 5', 'eletronicos', 'special', 3200.00, 'https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images/playstation5.png', 'physical', true, true, true, ARRAY['scratch_premium']);

-- Criar configuração da nova RASPADINHA DO PIX
INSERT INTO public.scratch_card_settings (scratch_type, name, price, house_edge, win_probability, is_active) VALUES
('pix', 'Raspadinha do PIX', 0.50, 0.10, 0.30, true);

-- Configurar controle financeiro para PIX
INSERT INTO public.scratch_card_financial_control (scratch_type, date, profit_goal, percentage_profit, percentage_prizes) VALUES
('pix', CURRENT_DATE, 50.00, 0.90, 0.10);

-- Atualizar configurações das raspadinhas existentes com novo sistema 90/10
UPDATE public.scratch_card_settings SET 
  house_edge = 0.10, 
  win_probability = 0.30 
WHERE scratch_type IN ('sorte', 'dupla', 'ouro', 'diamante', 'premium');

-- Atualizar controle financeiro das raspadinhas existentes
INSERT INTO public.scratch_card_financial_control (scratch_type, date, profit_goal, percentage_profit, percentage_prizes) VALUES
('sorte', CURRENT_DATE, 100.00, 0.90, 0.10),
('dupla', CURRENT_DATE, 200.00, 0.90, 0.10),
('ouro', CURRENT_DATE, 400.00, 0.95, 0.05),
('diamante', CURRENT_DATE, 800.00, 0.95, 0.05),
('premium', CURRENT_DATE, 2000.00, 0.95, 0.05)
ON CONFLICT (scratch_type, date) DO UPDATE SET
  profit_goal = EXCLUDED.profit_goal,
  percentage_profit = EXCLUDED.percentage_profit,
  percentage_prizes = EXCLUDED.percentage_prizes;