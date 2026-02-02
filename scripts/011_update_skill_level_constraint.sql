-- Update skill_level constraint to match the correct levels
-- Migration: 011_update_skill_level_constraint

-- Drop old constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_skill_level_check;

-- Add new constraint with correct levels
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_skill_level_check
CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'strong', 'pro', 'champion'));

-- Add comment
COMMENT ON COLUMN public.profiles.skill_level IS 'Skill level: beginner (หน้าบ้าน), intermediate (BG), advanced (N), strong (S), pro (P), champion (B-A)';
