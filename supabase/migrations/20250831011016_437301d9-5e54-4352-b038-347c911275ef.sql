-- Aplicar configurações seguras padrão para todas as raspadinhas existentes
-- Atualizar raspadinhas com valores seguros baseados no tipo

UPDATE public.scratch_card_settings 
SET 
  win_probability_global = CASE 
    WHEN scratch_type = 'pix' THEN 8.0
    WHEN scratch_type = 'sorte' THEN 10.0  
    WHEN scratch_type = 'dupla' THEN 12.0
    WHEN scratch_type = 'ouro' THEN 8.0
    WHEN scratch_type = 'diamante' THEN 6.0
    WHEN scratch_type = 'premium' THEN 5.0
    ELSE 8.0 -- default seguro
  END,
  house_edge = CASE 
    WHEN scratch_type = 'pix' THEN 75.0     -- RTP 25%
    WHEN scratch_type = 'sorte' THEN 70.0   -- RTP 30%  
    WHEN scratch_type = 'dupla' THEN 65.0   -- RTP 35%
    WHEN scratch_type = 'ouro' THEN 60.0    -- RTP 40%
    WHEN scratch_type = 'diamante' THEN 55.0 -- RTP 45%
    WHEN scratch_type = 'premium' THEN 50.0  -- RTP 50%
    ELSE 70.0 -- default seguro (RTP 30%)
  END,
  updated_at = now()
WHERE scratch_type IN ('pix', 'sorte', 'dupla', 'ouro', 'diamante', 'premium');

-- Adicionar campos target_rtp e rtp_enabled se não existirem
ALTER TABLE public.scratch_card_settings 
ADD COLUMN IF NOT EXISTS target_rtp NUMERIC(5,2) DEFAULT 30.0,
ADD COLUMN IF NOT EXISTS rtp_enabled BOOLEAN DEFAULT true;

-- Atualizar target_rtp com valores seguros
UPDATE public.scratch_card_settings 
SET 
  target_rtp = CASE 
    WHEN scratch_type = 'pix' THEN 25.0
    WHEN scratch_type = 'sorte' THEN 30.0  
    WHEN scratch_type = 'dupla' THEN 35.0
    WHEN scratch_type = 'ouro' THEN 40.0
    WHEN scratch_type = 'diamante' THEN 45.0
    WHEN scratch_type = 'premium' THEN 50.0
    ELSE 30.0 -- default seguro
  END,
  rtp_enabled = true
WHERE target_rtp IS NULL OR target_rtp = 0;