-- Create a function to send a system notification to all users
-- This script sends a notification about the V 2.0 Close Beta update

DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM profiles LOOP
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            is_read,
            created_at
        ) VALUES (
            user_record.id,
            'system',
            '📢 อัปเดตแอปเวอร์ชันใหม่!',
            'แอปเปิดให้ทดสอบเวอร์ชัน CLOSE BETA V 2.0 เรียบร้อยแล้ว! พบกับดีไซน์ใหม่และระบบที่เสถียรกว่าเดิม',
            false,
            now()
        );
    END LOOP;
END $$;
