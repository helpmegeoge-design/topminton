-- Add bio and play_frequency columns to profiles table
-- Migration: 010_add_profile_fields

-- Add bio column (text, nullable)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add play_frequency column (text, nullable)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS play_frequency TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.bio IS 'User biography/self introduction, max 500 characters';
COMMENT ON COLUMN public.profiles.play_frequency IS 'How often the user plays badminton (e.g., "3-4 ครั้ง/สัปดาห์")';
