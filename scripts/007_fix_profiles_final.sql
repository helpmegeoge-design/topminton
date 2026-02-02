-- 1. Reset RLS Policies to be absolutely sure
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Re-create Policies
-- Allow INSERT: Users can create a profile for themselves
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow SELECT: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);


-- 2. Emergency Fix: Create missing profiles for existing Auth Users
-- This fixes users who signed up when RLS was blocking INSERTs
INSERT INTO public.profiles (id, email, display_name, first_name, last_name, created_at, updated_at, skill_level)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'User'), -- Try to get name from metadata
  COALESCE(split_part(raw_user_meta_data->>'full_name', ' ', 1), 'User'), 
  COALESCE(split_part(raw_user_meta_data->>'full_name', ' ', 2), ''),
  created_at, 
  created_at,
  'beginner' -- Default skill level
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
