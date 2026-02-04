-- Final Fix for Online Status
-- This script safely checks for column existence and adds it if missing
-- It also re-applies all policies and permissions

-- 1. Add last_seen column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_seen') THEN
        ALTER TABLE profiles ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Force Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Reset Policies (Clean start)
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 4. Create Correct Policies
-- View: Everyone can see everyone
CREATE POLICY "Anyone can view profiles"
ON profiles FOR SELECT
USING (true);

-- Update: Users can ONLY update themselves
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Insert: Users can insert themselves
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 5. Enable Realtime
-- Remove first to avoid duplicates/errors then add
ALTER PUBLICATION supabase_realtime DROP TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- 6. Initialize Data
UPDATE profiles SET last_seen = NOW() WHERE last_seen IS NULL;

-- 7. Grant Permissions
GRANT SELECT, UPDATE, INSERT ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;
