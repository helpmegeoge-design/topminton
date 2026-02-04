-- Fix parties UPDATE policy
-- Allow hosts to update their own parties

-- Drop existing update policies
DROP POLICY IF EXISTS "Hosts can update their own parties" ON parties;
DROP POLICY IF EXISTS "Users can update own parties" ON parties;

-- Create new update policy
CREATE POLICY "Hosts can update their own parties"
    ON parties
    FOR UPDATE
    USING (auth.uid() = host_id)
    WITH CHECK (auth.uid() = host_id);


-- Fix party_members DELETE policy (for kicking members)
DROP POLICY IF EXISTS "Hosts can remove members" ON party_members;
DROP POLICY IF EXISTS "Users can leave parties" ON party_members;

-- Allow hosts to remove anyone, and users to remove themselves
CREATE POLICY "Hosts can remove members and users can leave"
    ON party_members
    FOR DELETE
    USING (
        auth.uid() = user_id -- Leave
        OR 
        EXISTS ( -- Host kick
            SELECT 1 FROM parties 
            WHERE id = party_members.party_id 
            AND host_id = auth.uid()
        )
    );

-- Verify policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('parties', 'party_members');
