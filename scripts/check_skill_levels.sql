-- Check skill level distribution to debug missing badges
SELECT skill_level, COUNT(*) 
FROM profiles 
GROUP BY skill_level;
