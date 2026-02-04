-- Update all existing profiles to have a recent last_seen timestamp
-- This is a one-time script to initialize the last_seen field

UPDATE profiles 
SET last_seen = NOW() 
WHERE last_seen IS NULL;
