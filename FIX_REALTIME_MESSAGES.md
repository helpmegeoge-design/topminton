# แก้ปัญหาข้อความไม่ขึ้นที่ User อีกฝั่ง

## ปัญหา
- ส่งข้อความได้ และเห็นข้อความของตัวเอง
- แต่อีกฝั่งไม่เห็นข้อความ (ไม่มี realtime update)

## สาเหตุที่เป็นไปได้

### 1. Realtime ยังไม่ได้เปิดในตาราง messages (สาเหตุหลัก!)

**วิธีแก้:**
1. เปิด **Supabase Dashboard**
2. ไปที่ **Database** → **Replication**
3. หา table **messages**
4. คลิกเปิดสวิตช์ **Realtime** ให้เป็นสีเขียว
5. รอสักครู่ให้ระบบ apply

### 2. RLS Policies ไม่ถูกต้อง

**ตรวจสอบ:**
1. ไปที่ Supabase → **Authentication** → **Policies**
2. เลือกตาราง **messages**
3. ต้องมี policies 3 อัน:
   - "Users can view their own messages" (SELECT)
   - "Users can send messages" (INSERT)
   - "Users can update their received messages" (UPDATE)

**ถ้าไม่มี:** รัน script `/scripts/009_create_messages_table.sql` ใหม่

### 3. User ยังไม่ได้เปิดหน้าแชท

Realtime จะทำงานเฉพาะเมื่อ:
- **ทั้ง 2 ฝั่ง** ต้องเปิดหน้าแชทกันอยู่
- ถ้าอีกฝั่งปิดหน้าไป ต้อง**รีเฟรชหน้า**จึงจะเห็นข้อความใหม่

### 4. การทดสอบ

**ขั้นตอนทดสอบ:**
1. เปิด 2 browsers แยกกัน (หรือ 2 tabs แยก user)
   - Browser A: User A login
   - Browser B: User B login
2. เปิดหน้าแชทระหว่างกัน
   - User A เปิด `/messages/[user-b-id]`
   - User B เปิด `/messages/[user-a-id]`
3. ส่งข้อความจาก User A
4. User B **ต้อง**เห็นข้อความทันที (ไม่ต้องรีเฟรช)

**ถ้ายังไม่เห็น:**
- เปิด Console (F12) ทั้ง 2 ฝั่ง
- ดู logs ว่ามี "New message:" ขึ้นหรือไม่
- ถ้าไม่มี → Realtime ยังไม่เปิด

## วิธีแก้แบบชั่วคราว (Polling)

ถ้า Realtime ยังใช้ไม่ได้ สามารถใช้วิธี **auto-refresh** แทน:
1. เพิ่ม polling ทุก 3 วินาที
2. แต่จะกิน resources มาก ไม่แนะนำ

## สรุป

**สิ่งที่ต้องทำ:**
✅ เปิด Realtime ใน Supabase Dashboard (Database → Replication → messages)
✅ ตรวจสอบ RLS policies
✅ ทดสอบด้วย 2 users พร้อมกัน

หลังจากเปิด Realtime แล้ว ข้อความจะไปถึงแบบ realtime ภายใน 1-2 วินาที!
