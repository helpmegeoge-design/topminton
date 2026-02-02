# วิธีตรวจสอบว่าระบบแชททำงานหรือไม่

## ขั้นตอนการ Debug

### 1. เปิด Browser Console
- กด F12 (Windows/Linux) หรือ Cmd+Option+I (Mac)
- เลือกแท็บ "Console"

### 2. ตรวจสอบ Error Messages
ดูว่ามี error ข้อความอะไรปรากฏ เช่น:
- "relation messages does not exist" → ตาราง messages ยังไม่ได้สร้าง
- "permission denied" → RLS policy มีปัญหา
- "Failed to fetch" → ปัญหาการเชื่อมต่อ

### 3. ตรวจสอบ Console Logs
ควรเห็น logs แบบนี้:
```
Fetching contact for chatId: [uuid]
Contact found: {id: ..., display_name: ..., }
Fetching messages...
Messages loaded: 0
```

### 4. ถ้าไม่มีกล่องข้อความ
แสดงว่า:
- `isLoading` ยังเป็น `true` (หมุนโหลดไม่หยุด)
- หรือ `contact` เป็น `null`
- หรือระบบตรวจว่าเป็น `system` chat

### 5. วิธีแก้ปัญหา

#### ถ้าตาราง messages ยังไม่มี:
1. เปิด Supabase Dashboard
2. SQL Editor → New Query
3. คัดลอก `/scripts/009_create_messages_table.sql` ทั้งหมด
4. Run
5. ไปที่ Database → Replication → เปิด Realtime สำหรับ `messages`

#### ถ้ามี permission error:
- ตรวจสอบว่า RLS policies ถูกสร้างครบ 3 อัน
- ลอง Sign out แล้ว Sign in ใหม่

#### ถ้ายังไม่ได้:
- ส่ง screenshot ของ Console error มาให้ดู
- หรือส่ง Console logs ทั้งหมด
