-- Atualizar presets para sistema 80/20 simplificado
TRUNCATE TABLE public.scratch_card_presets;

INSERT INTO public.scratch_card_presets (name, win_probability_global, pay_upto_percentage, description) VALUES
('Conservador', 8.0, 80.0, 'Sistema 80/20: 80% lucro, 20% prêmios. Poucas vitórias, prêmios menores.'),
('Balanceado', 15.0, 80.0, 'Sistema 80/20: 80% lucro, 20% prêmios. Equilíbrio entre vitórias e valores.'),
('Agressivo', 25.0, 80.0, 'Sistema 80/20: 80% lucro, 20% prêmios. Mais vitórias, valores menores.');

-- Atualizar configurações das raspadinhas para sistema 80/20
UPDATE public.scratch_card_settings 
SET win_probability_global = 20.0,
    updated_at = now()
WHERE is_active = true;

-- Atualizar orçamento diário para 20% (sistema 80/20)
UPDATE public.scratch_card_daily_budget 
SET budget_percentage = 0.20,
    remaining_budget = total_sales * 0.20,
    updated_at = now()
WHERE date >= CURRENT_DATE - INTERVAL '30 days';

-- Inicializar orçamento para hoje se não existir
INSERT INTO public.scratch_card_daily_budget (scratch_type, date, budget_percentage, remaining_budget)
SELECT DISTINCT s.scratch_type, CURRENT_DATE, 0.20, 0.0
FROM public.scratch_card_settings s
WHERE s.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.scratch_card_daily_budget b 
    WHERE b.scratch_type = s.scratch_type AND b.date = CURRENT_DATE
  );

-- Atualizar controles financeiros para sistema 80/20
UPDATE public.scratch_card_financial_control 
SET payout_mode = 'percentage',
    pay_upto_percentage = 80.0,
    updated_at = now()
WHERE date >= CURRENT_DATE - INTERVAL '7 days';

-- Aplicar pesos automáticos baseados no valor para evitar prêmios altos
UPDATE public.scratch_card_probabilities 
SET probability_weight = public.calculate_auto_weight_by_value(
  (SELECT base_value FROM public.items WHERE items.id = scratch_card_probabilities.item_id)
)
WHERE is_active = true
  AND EXISTS (SELECT 1 FROM public.items WHERE items.id = scratch_card_probabilities.item_id);

-- Log da correção
SELECT public.event_log_add(
  'SYSTEM_CORRECTION_80_20',
  NULL,
  NULL,
  gen_random_uuid(),
  jsonb_build_object(
    'action', 'Sistema corrigido para 80% lucro / 20% prêmios',
    'presets_updated', true,
    'budget_updated', true,
    'weights_applied', true
  )
);