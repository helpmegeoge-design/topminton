-- Check if there are any parties in the database
SELECT 
    COUNT(*) as total_parties,
    COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming_parties,
    COUNT(CASE WHEN date = CURRENT_DATE THEN 1 END) as today_parties
FROM parties;

-- Show recent parties
SELECT 
    id,
    title,
    date,
    start_time,
    current_players,
    max_participants,
    created_at
FROM parties
ORDER BY created_at DESC
LIMIT 10;

-- Check RLS policies on parties table
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'parties';
