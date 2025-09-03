-- Insert default prizes for RTP system using correct table structure
-- The scratch_prizes table uses game_type, value, weight columns

-- PIX scratch prizes
INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'pix', 'Prêmio R$ 1,00', 1.00, 100, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'pix' AND value = 1.00);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'pix', 'Prêmio R$ 2,50', 2.50, 40, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'pix' AND value = 2.50);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'pix', 'Prêmio R$ 5,00', 5.00, 10, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'pix' AND value = 5.00);

-- SORTE scratch prizes
INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'sorte', 'Prêmio R$ 2,00', 2.00, 100, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'sorte' AND value = 2.00);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'sorte', 'Prêmio R$ 5,00', 5.00, 50, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'sorte' AND value = 5.00);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'sorte', 'Prêmio R$ 10,00', 10.00, 20, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'sorte' AND value = 10.00);

-- DUPLA scratch prizes
INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'dupla', 'Prêmio R$ 5,00', 5.00, 80, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'dupla' AND value = 5.00);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'dupla', 'Prêmio R$ 12,50', 12.50, 30, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'dupla' AND value = 12.50);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'dupla', 'Prêmio R$ 25,00', 25.00, 10, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'dupla' AND value = 25.00);

-- OURO scratch prizes
INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'ouro', 'Prêmio R$ 10,00', 10.00, 70, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'ouro' AND value = 10.00);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'ouro', 'Prêmio R$ 25,00', 25.00, 25, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'ouro' AND value = 25.00);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'ouro', 'Prêmio R$ 50,00', 50.00, 5, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'ouro' AND value = 50.00);

-- DIAMANTE scratch prizes
INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'diamante', 'Prêmio R$ 20,00', 20.00, 60, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'diamante' AND value = 20.00);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'diamante', 'Prêmio R$ 50,00', 50.00, 20, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'diamante' AND value = 50.00);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'diamante', 'Prêmio R$ 100,00', 100.00, 5, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'diamante' AND value = 100.00);

-- PREMIUM scratch prizes
INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'premium', 'Prêmio R$ 50,00', 50.00, 50, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'premium' AND value = 50.00);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'premium', 'Prêmio R$ 125,00', 125.00, 15, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'premium' AND value = 125.00);

INSERT INTO public.scratch_prizes (game_type, name, value, weight, is_active, min_quantity, max_quantity)
SELECT 'premium', 'Prêmio R$ 250,00', 250.00, 3, true, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.scratch_prizes WHERE game_type = 'premium' AND value = 250.00);

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