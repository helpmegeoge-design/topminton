-- Create a function to clean up old parties (older than 24 hours)
-- Run this in Supabase SQL Editor

-- 1. Create the cleanup function (Fixed column name: start_time)
CREATE OR REPLACE FUNCTION clean_old_parties()
RETURNS void AS $$
BEGIN
  -- Delete parties where (date + start_time) is older than 24 hours from now
  DELETE FROM public.parties
  WHERE 
    ((date || ' ' || start_time)::timestamp) < (now() AT TIME ZONE 'Asia/Bangkok' - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql;

-- 2. (Optional) If you have pg_cron extension enabled
-- SELECT cron.schedule(
--   'cleanup-parties', 
--   '0 * * * *', -- every hour
--   $$SELECT clean_old_parties()$$
-- );

-- 3. To run manually anytime:
-- SELECT clean_old_parties();
