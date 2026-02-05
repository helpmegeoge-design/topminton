-- Add skill_level column to party_members for per-party rating
ALTER TABLE public.party_members 
ADD COLUMN skill_level TEXT DEFAULT 'medium' CHECK (skill_level IN ('light', 'medium', 'heavy'));
