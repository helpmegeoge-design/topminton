-- Fix Profile RLS: Allow everyone to view profiles (needed for seeing party members)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Create Open Read Policy
CREATE POLICY "Enable read access for all users" 
ON public.profiles FOR SELECT 
USING (true);
