-- Adicionar campos para RTP individual ajustável na tabela scratch_card_settings
ALTER TABLE scratch_card_settings 
ADD COLUMN IF NOT EXISTS target_rtp DECIMAL(5,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS rtp_enabled BOOLEAN DEFAULT true;

-- Atualizar todas as configurações existentes para ter RTP padrão de 50%
UPDATE scratch_card_settings 
SET target_rtp = 50.00, rtp_enabled = true 
WHERE target_rtp IS NULL OR rtp_enabled IS NULL;