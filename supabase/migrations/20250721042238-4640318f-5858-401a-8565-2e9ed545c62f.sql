
-- Adicionar 100.000 ao test_balance do usuário admin
UPDATE user_wallets 
SET test_balance = test_balance + 100000.00,
    updated_at = now()
WHERE user_id = 'f38537a3-de96-41c9-8314-1ae5b3b3ff61';

-- Registrar transação de teste no histórico
INSERT INTO wallet_transactions (user_id, wallet_id, amount, type, description, metadata)
VALUES (
  'f38537a3-de96-41c9-8314-1ae5b3b3ff61',
  (SELECT id FROM user_wallets WHERE user_id = 'f38537a3-de96-41c9-8314-1ae5b3b3ff61'),
  100000.00,
  'deposit',
  'Saldo de teste adicionado para admin - R$ 100.000',
  '{"test_mode": true, "admin_action": true, "amount": 100000}'
);
