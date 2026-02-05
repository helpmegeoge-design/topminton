-- Add party_id and state to competition_rooms
ALTER TABLE competition_rooms ADD COLUMN IF NOT EXISTS party_id UUID REFERENCES parties(id) ON DELETE CASCADE;
ALTER TABLE competition_rooms ADD COLUMN IF NOT EXISTS state JSONB DEFAULT '{}'::JSONB;

-- Update RLS for public read to allow anyone to see the state
DROP POLICY IF EXISTS "Public read access" ON competition_rooms;
CREATE POLICY "Public read access" ON competition_rooms FOR SELECT USING (true);

-- Allow anyone joined in the party to update if we want decentralized control, 
-- but for now let's stick to the creator (HOST) or any party member for realtime sync
DROP POLICY IF EXISTS "Users can update their own rooms" ON competition_rooms;
CREATE POLICY "Users can update their own rooms" ON competition_rooms FOR UPDATE USING (true); -- Simplified for now to allow sync

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE competition_rooms;
