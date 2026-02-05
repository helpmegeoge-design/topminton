-- Add missing columns to competition_rooms
ALTER TABLE competition_rooms ADD COLUMN IF NOT EXISTS party_id UUID REFERENCES parties(id) ON DELETE CASCADE;
ALTER TABLE competition_rooms ADD COLUMN IF NOT EXISTS state JSONB DEFAULT '{}'::JSONB;

-- Ensure status column exists (it should from 034, but just in case)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'competition_rooms' AND column_name = 'status') THEN
        ALTER TABLE competition_rooms ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- Update Policies for open access/sync
DROP POLICY IF EXISTS "Public read access" ON competition_rooms;
CREATE POLICY "Public read access" ON competition_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own rooms" ON competition_rooms;
CREATE POLICY "Users can update their own rooms" ON competition_rooms FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can insert their own rooms" ON competition_rooms;
CREATE POLICY "Users can insert their own rooms" ON competition_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE competition_rooms;
