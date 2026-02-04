-- Fix Online Status Issues (RLS & Realtime)
-- Created: 2026-02-04

-- 1. Enable Realtime for profiles table
-- Check if table is already in publication, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END;
$$;

-- 2. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Fix Select Policy (Allow everyone to see last_seen)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

CREATE POLICY "Anyone can view profiles"
ON profiles FOR SELECT
USING (true);

-- 4. Fix Update Policy (Allow users to update their own last_seen)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 5. Force update data to ensure it's not NULL
UPDATE profiles 
SET last_seen = NOW() 
WHERE last_seen IS NULL;

-- 6. Grant permissions explicitly (just in case)
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;
