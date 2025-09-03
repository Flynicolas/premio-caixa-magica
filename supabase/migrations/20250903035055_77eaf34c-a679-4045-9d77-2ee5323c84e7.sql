-- Ensure scratch_prizes table has proper weighted items for RTP system
-- Insert default prizes for each scratch type if they don't exist

-- PIX scratch prizes
INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'pix', 'money', 1.00, NULL, true, 50
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'pix' AND prize_value = 1.00);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'pix', 'money', 2.50, NULL, true, 20
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'pix' AND prize_value = 2.50);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'pix', 'money', 5.00, NULL, true, 10
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'pix' AND prize_value = 5.00);

-- SORTE scratch prizes
INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'sorte', 'money', 2.00, NULL, true, 50
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'sorte' AND prize_value = 2.00);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'sorte', 'money', 5.00, NULL, true, 20
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'sorte' AND prize_value = 5.00);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'sorte', 'money', 10.00, NULL, true, 5
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'sorte' AND prize_value = 10.00);

-- DUPLA scratch prizes
INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'dupla', 'money', 5.00, NULL, true, 30
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'dupla' AND prize_value = 5.00);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'dupla', 'money', 12.50, NULL, true, 15
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'dupla' AND prize_value = 12.50);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'dupla', 'money', 25.00, NULL, true, 5
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'dupla' AND prize_value = 25.00);

-- OURO scratch prizes
INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'ouro', 'money', 10.00, NULL, true, 25
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'ouro' AND prize_value = 10.00);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'ouro', 'money', 25.00, NULL, true, 10
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'ouro' AND prize_value = 25.00);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'ouro', 'money', 50.00, NULL, true, 3
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'ouro' AND prize_value = 50.00);

-- DIAMANTE scratch prizes
INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'diamante', 'money', 20.00, NULL, true, 20
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'diamante' AND prize_value = 20.00);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'diamante', 'money', 50.00, NULL, true, 8
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'diamante' AND prize_value = 50.00);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'diamante', 'money', 100.00, NULL, true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'diamante' AND prize_value = 100.00);

-- PREMIUM scratch prizes
INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'premium', 'money', 50.00, NULL, true, 15
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'premium' AND prize_value = 50.00);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'premium', 'money', 125.00, NULL, true, 5
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'premium' AND prize_value = 125.00);

INSERT INTO public.scratch_prizes (scratch_type, prize_type, prize_value, item_id, is_active, max_daily_awards)
SELECT 'premium', 'money', 250.00, NULL, true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE scratch_type = 'premium' AND prize_value = 250.00);

-- Update RTP pots to ensure they exist with 0 balance
INSERT INTO public.rtp_pots (scratch_type, pot_balance, target_rtp, total_bets, total_prizes)
VALUES 
  ('pix', 0, 0, 0, 0),
  ('sorte', 0, 0, 0, 0),
  ('dupla', 0, 0, 0, 0),
  ('ouro', 0, 0, 0, 0),
  ('diamante', 0, 0, 0, 0),
  ('premium', 0, 0, 0, 0)
ON CONFLICT (scratch_type) DO NOTHING;