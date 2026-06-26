-- ============================================================
-- RLS FIX — Run this in Supabase SQL Editor
-- Fixes: "infinite recursion detected in policy for relation group_members"
-- Also adds: relics table, relics RLS
-- ============================================================

-- ── 1. DROP ALL RECURSIVE POLICIES ──────────────────────────

DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can view groups they are in or created" ON public.shared_groups;
DROP POLICY IF EXISTS "Users can view expenses of their groups" ON public.group_expenses;
DROP POLICY IF EXISTS "Users view own debt scrolls" ON public.debt_scrolls;
DROP POLICY IF EXISTS "Users create debt scrolls" ON public.debt_scrolls;
DROP POLICY IF EXISTS "Users settle debt scrolls" ON public.debt_scrolls;
DROP POLICY IF EXISTS "Users manage own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users view own activity" ON public.activity_log;

-- ── 2. NON-RECURSIVE REPLACEMENT POLICIES ───────────────────

-- Helper functions to check group membership/creation WITHOUT triggering RLS recursively
CREATE OR REPLACE FUNCTION public.is_group_member(check_group_id uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = check_group_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_group_creator(check_group_id uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shared_groups
    WHERE id = check_group_id AND created_by = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- shared_groups: user can see groups they created, OR groups where they are a member
CREATE POLICY "Users can view groups they are in or created"
  ON public.shared_groups FOR SELECT
  USING (
    created_by = auth.uid() OR public.is_group_member(id)
  );

-- group_members: user can see their OWN membership row,
-- OR any row in a group they CREATED, or ANY row in a group they are a member of
CREATE POLICY "Users can view members of their groups"
  ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() OR public.is_group_creator(group_id) OR public.is_group_member(group_id)
  );

-- group_expenses: user sees expenses from groups they own or belong to, or paid
CREATE POLICY "Users can view expenses of their groups"
  ON public.group_expenses FOR SELECT
  USING (
    paid_by = auth.uid() OR public.is_group_creator(group_id) OR public.is_group_member(group_id)
  );

-- ── 3. SCHEMA ADDITIONS (idempotent) ────────────────────────

-- Users table additions
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS explorer_name TEXT,
  ADD COLUMN IF NOT EXISTS chronicle_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT;

-- shared_groups additions
ALTER TABLE public.shared_groups
  ADD COLUMN IF NOT EXISTS destination TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS party_size INTEGER DEFAULT 6,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE;

-- group_members additions
ALTER TABLE public.group_members
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Member',
  ADD COLUMN IF NOT EXISTS member_name TEXT,
  ADD COLUMN IF NOT EXISTS member_email TEXT;

-- Add role check constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'group_members_role_check'
  ) THEN
    ALTER TABLE public.group_members
      ADD CONSTRAINT group_members_role_check
      CHECK (role IN ('Leader', 'Treasurer', 'Scout', 'Member'));
  END IF;
END $$;

-- ── 4. RELICS TABLE ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.relics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  expedition_id UUID REFERENCES public.shared_groups(id) ON DELETE SET NULL,
  expedition_name TEXT,
  estimated_value DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.relics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own relics" ON public.relics;
CREATE POLICY "Users manage own relics"
  ON public.relics FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 5. DEBT SCROLLS TABLE ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.debt_scrolls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.shared_groups(id) ON DELETE CASCADE,
  owed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  owed_to UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.debt_scrolls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own debt scrolls" ON public.debt_scrolls;
CREATE POLICY "Users view own debt scrolls"
  ON public.debt_scrolls FOR SELECT
  USING (auth.uid() = owed_by OR auth.uid() = owed_to);

DROP POLICY IF EXISTS "Users create debt scrolls" ON public.debt_scrolls;
CREATE POLICY "Users create debt scrolls"
  ON public.debt_scrolls FOR INSERT
  WITH CHECK (auth.uid() = owed_to OR auth.uid() = owed_by);

DROP POLICY IF EXISTS "Users settle debt scrolls" ON public.debt_scrolls;
CREATE POLICY "Users settle debt scrolls"
  ON public.debt_scrolls FOR UPDATE
  USING (auth.uid() = owed_by OR auth.uid() = owed_to);

-- ── 6. UPDATE HANDLE_NEW_USER TRIGGER ───────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, explorer_name, chronicle_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'explorer_name',
    new.raw_user_meta_data->>'chronicle_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    explorer_name = COALESCE(EXCLUDED.explorer_name, public.users.explorer_name),
    chronicle_name = COALESCE(EXCLUDED.chronicle_name, public.users.chronicle_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 7. CHRONICLES TABLE & MANUAL MUSTER FIX ─────────────────

CREATE TABLE IF NOT EXISTS public.chronicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'Adventure',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chronicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own chronicles" ON public.chronicles;
CREATE POLICY "Users manage own chronicles"
  ON public.chronicles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Make group_members.user_id nullable for manual travel companions
ALTER TABLE public.group_members ALTER COLUMN user_id DROP NOT NULL;

