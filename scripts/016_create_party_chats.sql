-- Create party_chats table for group messaging
CREATE TABLE IF NOT EXISTS party_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_party_chats_party_id ON party_chats(party_id);
CREATE INDEX IF NOT EXISTS idx_party_chats_created_at ON party_chats(created_at DESC);

-- Enable Row Level Security
ALTER TABLE party_chats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read party chats" ON party_chats;
DROP POLICY IF EXISTS "Authenticated users can insert party chats" ON party_chats;
DROP POLICY IF EXISTS "Users can delete own messages" ON party_chats;

-- RLS Policies
-- Anyone can read party chat messages
CREATE POLICY "Anyone can read party chats"
    ON party_chats
    FOR SELECT
    USING (true);

-- Authenticated users can send messages to party chats
CREATE POLICY "Authenticated users can insert party chats"
    ON party_chats
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
    ON party_chats
    FOR DELETE
    USING (auth.uid() = user_id);

-- Enable realtime (only if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'party_chats'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE party_chats;
    END IF;
END $$;

COMMENT ON TABLE party_chats IS 'Group chat messages for each party';
