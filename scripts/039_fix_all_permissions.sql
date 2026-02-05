-- Consolidated Fix for Permissions and RLS
-- Run this script in Supabase SQL Editor to fix:
-- 1. "Unknown" names (Profile visibility)
-- 2. "Link Guest" errors (Host permissions)
-- 3. "Remove Guest" errors (Host permissions)

-- =========================================================
-- 1. FIX PROFILES VISIBILITY (So everyone can see names)
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Allow everyone to read all profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);


-- =========================================================
-- 2. FIX PARTY MEMBERS PERMISSIONS (So Host can manage guests)
-- =========================================================
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;

-- Drop all old/conflicting policies
DROP POLICY IF EXISTS "Host can delete members" ON public.party_members;
DROP POLICY IF EXISTS "Users can leave (delete own)" ON public.party_members;
DROP POLICY IF EXISTS "Users can join parties" ON public.party_members;
DROP POLICY IF EXISTS "Users can leave parties" ON public.party_members;
DROP POLICY IF EXISTS "Users can update own status" ON public.party_members;
DROP POLICY IF EXISTS "Everyone can view party members" ON public.party_members;
DROP POLICY IF EXISTS "Host can manage party members" ON public.party_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.party_members;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.party_members;

-- A. Everyone can see who is in the party
CREATE POLICY "Everyone can view party members"
ON public.party_members FOR SELECT
USING (true);

-- B. Users can JOIN (Insert themselves)
CREATE POLICY "Users can join parties"
ON public.party_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- C. Users can LEAVE (Delete themselves)
CREATE POLICY "Users can leave parties"
ON public.party_members FOR DELETE
USING (auth.uid() = user_id);

-- D. Users can UPDATE themselves (e.g. changing status)
CREATE POLICY "Users can update own status"
ON public.party_members FOR UPDATE
USING (auth.uid() = user_id);

-- E. HOST PERMISSIONS (The most important one for your error)
-- Host allows to ALL (Select, Insert, Update, Delete) any member in their party
CREATE POLICY "Host can manage party members"
ON public.party_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.parties
    WHERE parties.id = party_members.party_id
    AND parties.host_id = auth.uid()
  )
);
