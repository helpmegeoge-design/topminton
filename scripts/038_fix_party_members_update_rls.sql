-- Fix Party Members RLS: Allow Host to fully manage members (Update/Delete/Insert)
-- This is critical for "Link Guest to User" (UPDATE) and "Remove Guest" (DELETE)

ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;

-- 1. DROP Existing Policies to avoid conflicts
DROP POLICY IF EXISTS "Host can delete members" ON public.party_members;
DROP POLICY IF EXISTS "Users can leave (delete own)" ON public.party_members;
DROP POLICY IF EXISTS "Users can join parties" ON public.party_members;
DROP POLICY IF EXISTS "Users can leave parties" ON public.party_members;
DROP POLICY IF EXISTS "Users can update own status" ON public.party_members;
DROP POLICY IF EXISTS "Everyone can view party members" ON public.party_members;
DROP POLICY IF EXISTS "Host can manage party members" ON public.party_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.party_members;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.party_members;

-- 2. CREATE New Robust Policies

-- Policy: Everyone can view members
CREATE POLICY "Everyone can view party members"
ON public.party_members
FOR SELECT
USING (true);

-- Policy: Users can JOIN (Insert themselves)
CREATE POLICY "Users can join parties"
ON public.party_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can LEAVE (Delete themselves)
CREATE POLICY "Users can leave parties"
ON public.party_members
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Users can UPDATE themselves (e.g. status)
CREATE POLICY "Users can update own status"
ON public.party_members
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: HOST can MANAGE ALL (Update/Delete/Insert any member in their party)
CREATE POLICY "Host can manage party members"
ON public.party_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.parties
    WHERE parties.id = party_members.party_id
    AND parties.host_id = auth.uid()
  )
);
