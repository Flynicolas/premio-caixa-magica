-- Add kirvano_data column to test_payments table
ALTER TABLE public.test_payments 
ADD COLUMN kirvano_data JSONB;