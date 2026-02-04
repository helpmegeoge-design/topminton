-- Fix parties table RLS policies to allow everyone to read
-- This fixes the issue where users cannot see any parties

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view parties" ON parties;
DROP POLICY IF EXISTS "Authenticated users can view parties" ON parties;
DROP POLICY IF EXISTS "Public parties are viewable by everyone" ON parties;

-- Create new policy allowing everyone to read parties
CREATE POLICY "Anyone can view parties"
    ON parties
    FOR SELECT
    USING (true);

-- Ensure RLS is enabled
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'parties';
