-- Sync party counts: Updates 'current_players' in public.parties
-- to match the ACTUAL number of rows in public.party_members

UPDATE public.parties p
SET current_players = (
    SELECT count(*)
    FROM public.party_members pm
    WHERE pm.party_id = p.id
);
