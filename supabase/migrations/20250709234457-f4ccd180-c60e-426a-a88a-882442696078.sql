
-- Add missing columns to profiles table for demo user functionality
ALTER TABLE profiles 
ADD COLUMN is_demo boolean DEFAULT false,
ADD COLUMN simulate_actions boolean DEFAULT false;
