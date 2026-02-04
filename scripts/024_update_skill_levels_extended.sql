-- Update skill_level constraint to match the correct levels
-- Migration: 011_update_skill_level_constraint

-- Drop old constraint first
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_skill_level_check;

-- MIGRATION: Update existing rows to match new valid values
-- Map legacy values to new schema
UPDATE public.profiles SET skill_level = 'BG' WHERE skill_level = 'intermediate';
UPDATE public.profiles SET skill_level = 'N' WHERE skill_level = 'advanced';
UPDATE public.profiles SET skill_level = 'S' WHERE skill_level = 'strong';
UPDATE public.profiles SET skill_level = 'P' WHERE skill_level = 'pro';
UPDATE public.profiles SET skill_level = 'A' WHERE skill_level = 'champion';

-- Ensure any other invalid values are set to 'beginner' (safe fallback)
UPDATE public.profiles 
SET skill_level = 'beginner' 
WHERE skill_level NOT IN (
    'beginner', 
    'BG-', 'BG', 'BG+', 
    'N-', 'N', 'N+', 
    'S', 
    'P-', 'P', 'P+', 
    'B', 'A'
);

-- Now add new constraint with HIGHLY detailed levels
-- Ordered by skill approximately:
-- beginner (Beginner/Handless)
-- BG- (Beginner Minus)
-- BG  (Beginner)
-- BG+ (Beginner Plus)
-- N-  (Normal Minus)
-- N   (Normal)
-- N+  (Normal Plus)
-- S   (Strong)
-- P-  (Pro Minus)
-- P   (Pro)
-- P+  (Pro Plus)
-- B   (Semi-Pro/B)
-- A   (Pro A)
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_skill_level_check
CHECK (skill_level IN (
    'beginner', 
    'BG-', 'BG', 'BG+', 
    'N-', 'N', 'N+', 
    'S', 
    'P-', 'P', 'P+', 
    'B', 'A'
));

-- Add comment explanation
COMMENT ON COLUMN public.profiles.skill_level IS 'Skill levels: beginner, BG-, BG, BG+, N-, N, N+, S, P-, P, P+, B, A';
