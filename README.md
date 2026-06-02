# BaZi Insight

เว็บดูดวงจีนส่วนบุคคลสำหรับทดลองโปรโมทและเก็บ lead โดยไม่ต้องล็อกอิน

## Run local

```bash
npm run dev
```

เปิด `http://127.0.0.1:4173`

## Supabase setup

สร้าง table ใน Supabase SQL editor:

```sql
create table if not exists public.leads (
  id text primary key,
  name text,
  gender text,
  birth_date text,
  birth_time text,
  source text,
  reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

ตั้ง Environment Variables ใน Vercel:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

หมายเหตุ: ใช้ `service_role` เฉพาะฝั่ง server/API เท่านั้น ห้ามใส่ใน frontend

## Vercel

โปรเจกต์นี้มี `vercel.json` แล้ว:

- หน้าเว็บ static อยู่ใน `outputs/`
- API เก็บ lead อยู่ที่ `api/leads.js`
- endpoint: `/api/leads`

## Current limitation

การคำนวณปาจื้อในเวอร์ชันนี้เป็น deterministic prototype สำหรับทดสอบ UX และ lead capture ยังไม่ใช่ปฏิทินสุริยคติจีนระดับซินแสมืออาชีพ ถ้าต้องการ production จริงควรเชื่อม library ปฏิทินจีน/solar term ที่ validated แล้ว
