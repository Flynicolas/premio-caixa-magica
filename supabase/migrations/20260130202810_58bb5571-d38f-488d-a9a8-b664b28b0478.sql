-- Fix Overly Permissive RLS Policies
-- Replace USING(true) and WITH CHECK(true) with proper authorization checks

-- =============================================
-- 1. FIX: referral_stats - Remove "System can manage stats" with USING(true)
-- =============================================
DROP POLICY IF EXISTS "System can manage stats" ON public.referral_stats;
-- The admin policy already covers management needs

-- =============================================
-- 2. FIX: user_referrals - Remove "System can manage referral data" with USING(true)
-- =============================================
DROP POLICY IF EXISTS "System can manage referral data" ON public.user_referrals;
-- The admin policy already covers management needs

-- =============================================
-- 3. FIX: referral_activities - Replace "System can create activities" WITH CHECK(true)
-- =============================================
DROP POLICY IF EXISTS "System can create activities" ON public.referral_activities;
-- Replace with policy that validates the referrer is the current user
CREATE POLICY "Users can create referral activities"
ON public.referral_activities
FOR INSERT
TO public
WITH CHECK (auth.uid() = referrer_id OR is_admin_user());

-- =============================================
-- 4. FIX: scratch_card_financial_control - Replace USING(true) with admin-only
-- =============================================
DROP POLICY IF EXISTS "System can manage scratch financial control" ON public.scratch_card_financial_control;
-- Only admins should manage financial control tables
CREATE POLICY "Admins can manage scratch financial control"
ON public.scratch_card_financial_control
FOR ALL
TO public
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- =============================================
-- 5. FIX: scratch_card_daily_budget - Replace USING(true) with admin-only
-- =============================================
DROP POLICY IF EXISTS "System can manage daily budget" ON public.scratch_card_daily_budget;
-- Only admins should manage budget control tables
CREATE POLICY "Admins can manage daily budget"
ON public.scratch_card_daily_budget
FOR ALL
TO public
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- =============================================
-- 6. FIX: scratch_card_games - Replace INSERT/UPDATE with proper checks
-- =============================================
DROP POLICY IF EXISTS "System can create scratch games" ON public.scratch_card_games;
DROP POLICY IF EXISTS "System can update scratch games" ON public.scratch_card_games;

-- Users can only create games for themselves
CREATE POLICY "Users can create their own scratch games"
ON public.scratch_card_games
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own games, admins can update any
CREATE POLICY "Users can update their own scratch games"
ON public.scratch_card_games
FOR UPDATE
TO public
USING (auth.uid() = user_id OR is_admin_user());

-- =============================================
-- 7. FIX: mercadopago_payments - Replace UPDATE USING(true) 
-- =============================================
DROP POLICY IF EXISTS "System can update payments for webhooks" ON public.mercadopago_payments;
-- Webhooks are handled by service role which bypasses RLS
-- For regular users, they can only update their own payments or admins can update
CREATE POLICY "Users or admins can update payments"
ON public.mercadopago_payments
FOR UPDATE
TO public
USING (auth.uid() = user_id OR is_admin_user());

-- =============================================
-- 8. FIX: unified_transactions - Check if policy exists and fix
-- =============================================
-- First, let's see what policies exist on unified_transactions
DO $$
BEGIN
    -- Drop overly permissive policy if it exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'unified_transactions'
        AND policyname = 'System can manage'
    ) THEN
        DROP POLICY "System can manage" ON public.unified_transactions;
    END IF;
    
    -- Create proper policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'unified_transactions'
        AND policyname = 'Admins can manage unified transactions'
    ) THEN
        -- Check if table exists first
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'unified_transactions') THEN
            EXECUTE 'CREATE POLICY "Admins can manage unified transactions" ON public.unified_transactions FOR ALL TO public USING (is_admin_user()) WITH CHECK (is_admin_user())';
        END IF;
    END IF;
END $$;