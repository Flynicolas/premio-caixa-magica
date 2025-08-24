-- Adicionar campos para RTP individual ajustável na tabela scratch_card_settings
ALTER TABLE scratch_card_settings 
ADD COLUMN IF NOT EXISTS target_rtp DECIMAL(5,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS rtp_enabled BOOLEAN DEFAULT true;

-- Atualizar todas as configurações existentes para ter RTP padrão de 50%
UPDATE scratch_card_settings 
SET target_rtp = 50.00, rtp_enabled = true 
WHERE target_rtp IS NULL OR rtp_enabled IS NULL;

-- Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN scratch_card_settings.target_rtp IS 'RTP target individual para cada tipo de raspadinha (padrão 50%)';
COMMENT ON COLUMN scratch_card_settings.rtp_enabled IS 'Se o controle RTP está habilitado para este tipo de raspadinha';

-- Atualizar a tabela rtp_pots para usar target_rtp da scratch_card_settings
UPDATE rtp_pots SET target_rtp = 0.50 WHERE target_rtp != 0.50;