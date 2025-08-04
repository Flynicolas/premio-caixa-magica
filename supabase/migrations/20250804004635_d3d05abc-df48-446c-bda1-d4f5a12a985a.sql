-- Add unique constraint for scratch_card_financial_control ON CONFLICT to work
ALTER TABLE public.scratch_card_financial_control 
ADD CONSTRAINT scratch_card_financial_control_scratch_type_date_key 
UNIQUE (scratch_type, date);