-- ====================================================================
-- RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR TO FIX MUSTER PARTY ERRORS
-- ====================================================================

-- 1. Fix: "null value in column user_id of relation group_members violates not-null constraint"
-- Allows adding travel companions who do not yet have registered app accounts.
ALTER TABLE public.group_members ALTER COLUMN user_id DROP NOT NULL;

-- 2. Fix: "it still shows this even if i put email which is already registered"
-- Creates a secure lookup function so authenticated explorers can find registered companions by email.
CREATE OR REPLACE FUNCTION public.lookup_user_by_email(lookup_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.users WHERE lower(email) = lower(trim(lookup_email)) LIMIT 1;
$$;

-- 3. Update RLS on users table so explorers can see companion names and emails in party rosters
DROP POLICY IF EXISTS "Users can select own row" ON public.users;
CREATE POLICY "Explorers can view all registered users" ON public.users 
  FOR SELECT USING (auth.role() = 'authenticated');
