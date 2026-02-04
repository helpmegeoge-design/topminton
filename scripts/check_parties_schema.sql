-- Check columns in parties table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'parties'
ORDER BY ordinal_position;
