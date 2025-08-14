-- Remover o constraint que impede valores negativos
ALTER TABLE public.wallet_transactions 
DROP CONSTRAINT IF EXISTS wallet_transactions_amount_cents_check;

-- Adicionar novo constraint que permite valores negativos e positivos
-- (valores negativos = débitos, valores positivos = créditos)
ALTER TABLE public.wallet_transactions 
ADD CONSTRAINT wallet_transactions_amount_cents_valid 
CHECK (amount_cents IS NOT NULL AND amount_cents != 0);