-- Add court_info column to parties table for storing custom court details
ALTER TABLE parties ADD COLUMN IF NOT EXISTS court_info JSONB;

-- Comment
COMMENT ON COLUMN parties.court_info IS 'Stores custom court details (name, etc.) when court_id is not selected from database';
