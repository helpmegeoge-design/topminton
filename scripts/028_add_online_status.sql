-- Add online status tracking to profiles table
-- Created: 2026-02-04

-- Add last_seen column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster queries on last_seen
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen DESC);

-- Create a function to update last_seen automatically
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_seen on profile updates
DROP TRIGGER IF EXISTS trigger_update_last_seen ON profiles;
CREATE TRIGGER trigger_update_last_seen
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();
