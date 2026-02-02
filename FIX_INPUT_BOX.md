# วิธีแก้ปัญหากล่องข้อความไม่แสดง

## ขั้นตอนที่ 1: Hard Refresh Browser
1. กด **Cmd + Shift + R** (Mac) หรือ **Ctrl + Shift + R** (Windows)
2. หรือเปิด DevTools (F12) → คลิกขวาที่ปุ่ม Reload → เลือก "Empty Cache and Hard Reload"

## ขั้นตอนที่ 2: ตรวจสอบ Console
1. เปิด Browser Console (F12)
2. ดู error messages สีแดง
3. ส่ง screenshot console มาให้ดู

## ขั้นตอนที่ 3: Restart Dev Server
หากยังไม่ได้ ให้:
1. กด Ctrl+C ใน terminal ที่รัน dev server
2. รันคำสั่งนี้ใหม่:
```bash
npm run dev
```
3. รอจน build เสร็จ
4. เปิด http://localhost:3000/messages/[user-id] ใหม่

## ขั้นตอนที่ 4: ตรวจสอบว่า chatId ถูกต้อง
URL ต้องเป็น:
- `/messages/system` → แสดง "ไม่สามารถตอบกลับได้"
- `/messages/[uuid]` → แสดงกล่องข้อความ

ตรวจสอบว่า URL ที่เปิดคือ `/messages/0a04493e-1055-4a87-bbf9-0f2508c49d69` ไม่ใช่ `/messages/system`

## ขั้นตอนที่ 5: ตรวจสอบว่าไฟล์ถูก save
เปิดไฟล์ `/app/messages/[id]/page.tsx` 
ตรวจสอบบรรทัดประมาณ 384 ต้องเป็น:
```tsx
{chatId === 'system' ? (
  // แสดงข้อความระบบ
) : (
  // แสดงกล่องข้อความ
)}
```

ถ้าทำทุกอย่างแล้วยังไม่ได้ → ส่ง screenshot console error มาให้ดูครับ
