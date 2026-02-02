# วิธีแก้ปัญหาระบบแชท

## ปัญหา: หน้าแชทโหลดไม่หยุด

### สาเหตุ
ตาราง `messages` ยังไม่ได้ถูกสร้างในฐานข้อมูล Supabase

### วิธีแก้ไข

1. **เข้า Supabase Dashboard**
   - ไปที่ https://supabase.com/dashboard
   - เลือกโปรเจกต์ของคุณ

2. **เปิด SQL Editor**
   - คลิกที่ "SQL Editor" ในเมนูด้านซ้าย
   - กด "+ New Query"

3. **รัน SQL Script**
   - คัดลอกโค้ดทั้งหมดจากไฟล์ `/scripts/009_create_messages_table.sql`
   - วางลงใน SQL Editor
   - กดปุ่ม "Run" (หรือ Ctrl/Cmd + Enter)

4. **ตรวจสอบผลลัพธ์**
   - ถ้าสำเร็จ จะเห็นข้อความ "Success. No rows returned"
   - ตรวจสอบว่ามีตาราง `messages` ใน Database > Tables

5. **Enable Realtime (สำคัญ!)**
   - ไปที่ "Database" > "Replication"
   - หา table "messages"
   - เปิดสวิตช์ "Enable Realtime" ให้เป็นสีเขียว

### หลังจากนั้น
- รีเฟรชหน้าแชท
- กดปุ่มส่งข้อความอีกครั้ง
- จะสามารถใช้งานระบบแชทได้แล้ว!

### หาก Error ยังคงเกิดขึ้น
เปิด Browser Console (F12) และส่ง error message มาให้ดูครับ
