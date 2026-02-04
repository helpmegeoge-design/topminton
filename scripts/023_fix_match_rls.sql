-- Enable RLS (Should be already enabled, but just in case)
ALTER TABLE public.match_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_pairings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view match rooms" ON public.match_rooms;
DROP POLICY IF EXISTS "Authenticated users can create match rooms" ON public.match_rooms;
DROP POLICY IF EXISTS "Authenticated users can update match rooms" ON public.match_rooms;

DROP POLICY IF EXISTS "Anyone can view match pairings" ON public.match_pairings;
DROP POLICY IF EXISTS "Authenticated users can manage match pairings" ON public.match_pairings;

-- Create Policies for match_rooms
CREATE POLICY "Anyone can view match rooms"
ON public.match_rooms FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create match rooms"
ON public.match_rooms FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update match rooms"
ON public.match_rooms FOR UPDATE
TO authenticated
USING (true);

-- Create Policies for match_pairings
CREATE POLICY "Anyone can view match pairings"
ON public.match_pairings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage match pairings"
ON public.match_pairings FOR ALL
TO authenticated
USING (true);
