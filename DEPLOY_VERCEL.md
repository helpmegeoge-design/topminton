# 🚀 คู่มือ Deploy แอป T-Bad ขึ้น Vercel

## ✅ สิ่งที่ต้องเตรียม

1. **GitHub Account** - สำหรับเก็บโค้ด
2. **Vercel Account** - https://vercel.com (ใช้ GitHub login ได้)
3. **Supabase Project** - Database และ API keys
4. **Environment Variables** - ข้อมูลเชื่อมต่อ Supabase

---

## 📋 ขั้นตอนการ Deploy

### 1️⃣ Push โค้ดขึ้น GitHub

```bash
# เริ่มต้น Git repository (ถ้ายังไม่มี)
cd /Users/top/Downloads/t-bad-app-development
git init

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Initial commit - T-Bad App"

# สร้าง repository ใหม่บน GitHub แล้ว push
# 1. ไปที่ https://github.com/new
# 2. สร้าง repository ชื่อ "t-bad-app" (หรือชื่ือที่ต้องการ)
# 3. ไม่ต้องเลือก README, .gitignore, license
# 4. คัดลอกคำสั่งที่ GitHub แสดง:

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/t-bad-app.git
git push -u origin main
```

### 2️⃣ Deploy ด้วย Vercel

#### วิธีที่ 1: ผ่าน Vercel Dashboard (แนะนำ)

1. ไปที่ https://vercel.com
2. คลิก **"Add New Project"**
3. เลือก **"Import Git Repository"**
4. เลือก repository **"t-bad-app"**
5. คลิก **"Import"**

#### การตั้งค่า Project:

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build (ปล่อยว่างไว้ ใช้ default)
Output Directory: .next (ปล่อยว่างไว้ ใช้ default)
Install Command: npm install (ปล่อยว่างไว้ ใช้ default)
```

### 3️⃣ ตั้งค่า Environment Variables

ใน Vercel Dashboard → Settings → Environment Variables

เพิ่ม variables ต่อไปนี้:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: ถ้ามีการใช้ server-side
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**วิธีหา Supabase Keys:**
1. ไปที่ Supabase Dashboard
2. เลือก Project
3. Settings → API
4. คัดลอก:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4️⃣ Deploy

1. กด **"Deploy"**
2. รอ 2-3 นาที
3. เมื่อเสร็จจะได้ URL: `https://your-app.vercel.app`

---

## 🔄 การอัปเดตแอป (Re-deploy)

### วิธีที่ 1: Git Push (อัตโนมัติ)
```bash
# แก้ไขโค้ด
git add .
git commit -m "Update features"
git push

# Vercel จะ deploy อัตโนมัติ!
```

### วิธีที่ 2: ผ่าน Vercel Dashboard
1. Vercel Dashboard → Deployments
2. คลิก **"Redeploy"**

---

## ⚙️ ไฟล์ที่ต้องเพิ่ม

### `.gitignore`
สร้างไฟล์ `.gitignore` ในโฟลเดอร์ project:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### `vercel.json` (Optional)
สร้างไฟล์ `vercel.json` สำหรับการตั้งค่าเพิ่มเติม:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

---

## 🐛 การแก้ปัญหา

### ❌ Build Error: Module not found

```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
git add .
git commit -m "Fix dependencies"
git push
```

### ❌ Environment Variables ไม่ทำงาน

1. ตรวจสอบว่า variables ขึ้นต้นด้วย `NEXT_PUBLIC_`
2. กด **"Redeploy"** หลังเพิ่ม env vars
3. ใช้ `process.env.NEXT_PUBLIC_VARIABLE_NAME`

### ❌ 404 Error

ตรวจสอบ `next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ถ้าใช้
  images: {
    domains: ['YOUR_PROJECT_ID.supabase.co'],
  },
}

module.exports = nextConfig
```

---

## 📊 การตรวจสอบ Deployment

### Vercel Dashboard:
- **Deployments** - ดูประวัติการ deploy
- **Logs** - ดู runtime logs
- **Analytics** - ดูสถิติการใช้งาน
- **Settings** - ตั้งค่า domain, env vars

### ตรวจสอบ Build Logs:
```
1. Vercel Dashboard → Deployments
2. คลิกที่ deployment ล่าสุด
3. ดู "Build Logs" เพื่อหา errors
```

---

## 🌐 Custom Domain (Optional)

### เพิ่ม Domain ของคุณเอง:

1. Vercel Dashboard → Settings → Domains
2. กด **"Add Domain"**
3. ใส่ domain (เช่น `tbad.app`)
4. ทำตามคำแนะนำเพื่อตั้งค่า DNS

---

## ✅ Checklist ก่อน Deploy

- [ ] ลบ mock data ทั้งหมด
- [ ] ตรวจสอบ `.env.local` ไม่ถูก commit (อยู่ใน .gitignore)
- [ ] ทดสอบ build locally: `npm run build`
- [ ] ตรวจสอบ Supabase RLS policies ทั้งหมด
- [ ] ตรวจสอบ Storage buckets และ policies
- [ ] เพิ่ม Environment Variables ใน Vercel
- [ ] ตั้งค่า allowed domains ใน Supabase Auth

---

## 🚀 เสร็จแล้ว!

หลังจาก deploy สำเร็จ:
- URL: `https://your-app.vercel.app`
- ทุก commit → auto deploy
- SSL certificate → automatic
- Global CDN → automatic

**Happy Deploying! 🏸✨**
