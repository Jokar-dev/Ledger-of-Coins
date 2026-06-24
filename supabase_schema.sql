-- =====================================================================================
-- LEDGER OF LOST KINGDOMS - COMPLETE UNIFIED DATABASE SCHEMA
-- This file contains the single, absolute source of truth for the database schema.
-- It eliminates all duplicates, circular dependencies, and old recursive policies.
-- =====================================================================================

-- ── 1. CLEANUP (DROP EXISTING TABLES TO AVOID CONFLICTS) ─────────
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.debt_scrolls CASCADE;
DROP TABLE IF EXISTS public.relics CASCADE;
DROP TABLE IF EXISTS public.group_expenses CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.shared_groups CASCADE;
DROP TABLE IF EXISTS public.personal_expenses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 2. TABLE CREATION ──────────────────────────────────────────

-- Table: public.users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  explorer_name TEXT,
  chronicle_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: public.personal_expenses
CREATE TABLE public.personal_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) CHECK (amount > 0),
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: public.shared_groups (Expeditions)
CREATE TABLE public.shared_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_name TEXT NOT NULL,
  destination TEXT,
  description TEXT,
  party_size INTEGER DEFAULT 6,
  start_date DATE,
  end_date DATE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: public.group_members
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.shared_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member' CHECK (role IN ('Leader', 'Treasurer', 'Scout', 'Member')),
  member_name TEXT,
  member_email TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Table: public.group_expenses
CREATE TABLE public.group_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.shared_groups(id) ON DELETE CASCADE,
  paid_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) CHECK (amount > 0),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: public.relics
CREATE TABLE public.relics (
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

-- Table: public.debt_scrolls
CREATE TABLE public.debt_scrolls (
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

-- Table: public.achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);


-- ── 3. ENABLE RLS ON ALL TABLES ────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_scrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;


-- ── 4. SECURITY DEFINER FUNCTIONS (BREAKS RECURSION LOOPS) ─────

CREATE OR REPLACE FUNCTION public.check_is_member(gid uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = gid AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.check_is_creator(gid uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shared_groups WHERE id = gid AND created_by = auth.uid()
  );
$$;


-- ── 5. NON-RECURSIVE RLS POLICIES ──────────────────────────────

-- Users
CREATE POLICY "Users can select own row" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own row" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own row" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Personal Expenses
CREATE POLICY "Manage personal expenses" ON public.personal_expenses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Shared Groups (Expeditions)
CREATE POLICY "Select shared_groups" ON public.shared_groups FOR SELECT USING (created_by = auth.uid() OR public.check_is_member(id));
CREATE POLICY "Insert shared_groups" ON public.shared_groups FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Update shared_groups" ON public.shared_groups FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Delete shared_groups" ON public.shared_groups FOR DELETE USING (created_by = auth.uid());

-- Group Members
CREATE POLICY "Select group_members" ON public.group_members FOR SELECT USING (user_id = auth.uid() OR public.check_is_creator(group_id) OR public.check_is_member(group_id));
CREATE POLICY "Insert group_members" ON public.group_members FOR INSERT WITH CHECK (user_id = auth.uid() OR public.check_is_creator(group_id));
CREATE POLICY "Update group_members" ON public.group_members FOR UPDATE USING (user_id = auth.uid() OR public.check_is_creator(group_id));
CREATE POLICY "Delete group_members" ON public.group_members FOR DELETE USING (user_id = auth.uid() OR public.check_is_creator(group_id));

-- Group Expenses
CREATE POLICY "Select group_expenses" ON public.group_expenses FOR SELECT USING (public.check_is_member(group_id) OR public.check_is_creator(group_id));
CREATE POLICY "Insert group_expenses" ON public.group_expenses FOR INSERT WITH CHECK (paid_by = auth.uid() AND (public.check_is_member(group_id) OR public.check_is_creator(group_id)));

-- Relics
CREATE POLICY "Manage own relics" ON public.relics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Debt Scrolls
CREATE POLICY "View own debt scrolls" ON public.debt_scrolls FOR SELECT USING (auth.uid() = owed_by OR auth.uid() = owed_to);
CREATE POLICY "Create debt scrolls" ON public.debt_scrolls FOR INSERT WITH CHECK (auth.uid() = owed_to OR auth.uid() = owed_by);
CREATE POLICY "Settle debt scrolls" ON public.debt_scrolls FOR UPDATE USING (auth.uid() = owed_by OR auth.uid() = owed_to);

-- Achievements
CREATE POLICY "Manage own achievements" ON public.achievements FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── 6. AUTHENTICATION TRIGGER ──────────────────────────────────

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
