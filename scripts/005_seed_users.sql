-- Seed data for Mock Users (Profiles) to allow party creation without full auth flow
-- Adjusted to match actual schema (display_name instead of username/full_name)

INSERT INTO public.profiles (id, display_name, first_name, last_name, avatar_url, skill_level)
VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 
  'Dev User', 
  'Dev', 
  'User',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
  'intermediate'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 
  'Pro Player', 
  'Pro',
  'Player', 
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
  'pro'
)
ON CONFLICT (id) DO UPDATE 
SET display_name = EXCLUDED.display_name, 
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    avatar_url = EXCLUDED.avatar_url;
