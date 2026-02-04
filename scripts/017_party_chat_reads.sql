-- Create table to track when users last read party chat
CREATE TABLE IF NOT EXISTS party_chat_reads (
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (party_id, user_id)
);

-- Enable RLS
ALTER TABLE party_chat_reads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own read status" ON party_chat_reads;
DROP POLICY IF EXISTS "Users can update their own read status" ON party_chat_reads;
DROP POLICY IF EXISTS "Users can update their own read status 2" ON party_chat_reads;

-- RLS Policies
CREATE POLICY "Users can view their own read status"
    ON party_chat_reads
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own read status"
    ON party_chat_reads
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own read status 2"
    ON party_chat_reads
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to get unread count for a party
CREATE OR REPLACE FUNCTION get_party_unread_count(p_party_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_last_read TIMESTAMPTZ;
    v_unread_count INTEGER;
BEGIN
    -- Get last read time
    SELECT last_read_at INTO v_last_read
    FROM party_chat_reads
    WHERE party_id = p_party_id AND user_id = p_user_id;
    
    -- Count unread messages logic:
    -- 1. Must match party_id
    -- 2. Must NOT be own message
    -- 3. If v_last_read exists, must be newer than that. If null, count everything.
    
    SELECT COUNT(*) INTO v_unread_count
    FROM party_chats
    WHERE party_id = p_party_id 
      AND user_id != p_user_id
      AND (v_last_read IS NULL OR created_at > v_last_read);
    
    RETURN COALESCE(v_unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE party_chat_reads IS 'Track when users last read party group chat';
