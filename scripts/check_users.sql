-- Check if the user exists in profiles table
SELECT id, email, first_name, last_name, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- Note: We cannot query auth.users directly via standard client RLS, 
-- but profiles usually mirrors auth.users if triggers are working correctly.
