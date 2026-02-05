-- Allow guest members in party_members
ALTER TABLE public.party_members 
    ALTER COLUMN user_id DROP NOT NULL,
    ADD COLUMN guest_name TEXT;

-- Add constraint to ensure either user_id or guest_name is present
ALTER TABLE public.party_members 
    ADD CONSTRAINT party_members_user_or_guest_check 
    CHECK (user_id IS NOT NULL OR guest_name IS NOT NULL);

-- Update match_pairings to allow guests? 
-- This is complicated because match_pairings references profiles(id).
-- For now, we will leave match_pairings restricts to real users, 
-- or we need to update it to reference party_members(id) instead/in addition.
-- Keeping it out of scope for this specific 'import members' task unless requested.
