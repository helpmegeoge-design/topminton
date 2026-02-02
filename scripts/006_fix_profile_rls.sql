-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Allow users to insert their own profile (crucial for registration)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 2. Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Allow public to view basic profile info (Optional, needed if other users want to see your profile)
-- We might restrict this to only 'display_name', 'avatar_url', etc. but for now let's keep it simple or restricted.
-- Let's stick to "Users can view own profile" first to solve the current issue.

-- If you want EVERYONE to see basic profiles (like in Party List), you might need:
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- DROP conflicting policies if they exist (to avoid errors on re-run)
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
