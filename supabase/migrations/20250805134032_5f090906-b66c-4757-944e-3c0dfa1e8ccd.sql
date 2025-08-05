-- Reduzir probabilidade base de vitória de 30% para 5% para acumulação de lucro
UPDATE scratch_card_settings 
SET win_probability = 0.05, 
    house_edge = 0.95,
    updated_at = now()
WHERE is_active = true;

-- Ajustar controle financeiro para focar em acumulação
UPDATE scratch_card_financial_control 
SET percentage_profit = 0.95,
    percentage_prizes = 0.05,
    profit_goal = CASE 
        WHEN scratch_type = 'pix' THEN 100
        WHEN scratch_type = 'sorte' THEN 200  
        WHEN scratch_type = 'dupla' THEN 500
        WHEN scratch_type = 'ouro' THEN 1000
        WHEN scratch_type = 'diamante' THEN 2000
        WHEN scratch_type = 'premium' THEN 5000
        ELSE profit_goal
    END,
    daily_budget_prizes = CASE
        WHEN scratch_type = 'pix' THEN 10
        WHEN scratch_type = 'sorte' THEN 20
        WHEN scratch_type = 'dupla' THEN 50
        WHEN scratch_type = 'ouro' THEN 100
        WHEN scratch_type = 'diamante' THEN 200
        WHEN scratch_type = 'premium' THEN 500
        ELSE daily_budget_prizes
    END,
    remaining_budget = CASE
        WHEN scratch_type = 'pix' THEN 10
        WHEN scratch_type = 'sorte' THEN 20
        WHEN scratch_type = 'dupla' THEN 50
        WHEN scratch_type = 'ouro' THEN 100
        WHEN scratch_type = 'diamante' THEN 200
        WHEN scratch_type = 'premium' THEN 500
        ELSE remaining_budget
    END,
    updated_at = now()
WHERE date = CURRENT_DATE;