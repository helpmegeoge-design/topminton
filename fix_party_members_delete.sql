-- Fix party_members DELETE policy
-- Allow authenticated users to delete party members (for kick functionality)

CREATE POLICY "party_members_delete_all" 
ON public.party_members 
FOR DELETE 
TO authenticated 
USING (true);
