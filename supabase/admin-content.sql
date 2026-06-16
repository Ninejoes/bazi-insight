create table if not exists public.dreams (
  id text primary key,
  keyword text not null,
  letter text not null default '',
  category text not null default 'สิ่งของ',
  meaning text not null default '',
  numbers text not null default '',
  time text not null default 'ไม่ระบุ',
  advice text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dreams_keyword_idx on public.dreams (keyword);
create index if not exists dreams_letter_idx on public.dreams (letter);

create table if not exists public.faqs (
  id text primary key,
  q text not null,
  a text not null default '',
  sort_order integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_sort_order_idx on public.faqs (sort_order);

create table if not exists public.site_content (
  id text primary key,
  about jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id) on delete set null,
  actor_email text not null default '',
  actor_role text not null default 'Admin',
  action text not null,
  table_name text not null,
  record_id text not null default '',
  summary text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  ip text not null default '',
  user_agent text not null default '',
  created_at timestamptz not null default now(),
  constraint content_audit_events_actor_role_check check (actor_role in ('Admin', 'User')),
  constraint content_audit_events_action_check check (action in ('create', 'update', 'delete')),
  constraint content_audit_events_table_name_check check (
    table_name in ('articles', 'dreams', 'faqs', 'site_content')
  )
);

create index if not exists content_audit_events_created_at_idx
  on public.content_audit_events (created_at desc);
create index if not exists content_audit_events_table_record_idx
  on public.content_audit_events (table_name, record_id);
create index if not exists content_audit_events_actor_email_idx
  on public.content_audit_events (lower(actor_email));

create table if not exists public.contact_messages (
  id text primary key,
  name text not null default '',
  email text not null default '',
  subject text not null default '',
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_status_idx on public.contact_messages (status);

insert into public.dreams (id, keyword, letter, category, meaning, numbers, time, advice)
values
  (
    'dream-snake',
    'งู',
    'ง',
    'สัตว์',
    'ฝันเห็นงูใหญ่เลื้อยเข้าหา หมายถึงเนื้อคู่หรือผู้สนับสนุนใหม่กำลังเข้ามาในชีวิต',
    '7, 14, 47, 71',
    'เช้ามืด',
    'ทำบุญ ปล่อยปลา หรือถวายผลไม้สีเหลือง'
  ),
  (
    'dream-clear-water',
    'น้ำใส',
    'น',
    'ธรรมชาติ',
    'แสดงถึงโชคลาภและสุขภาพดี ความสะอาดของจิตใจ',
    '2, 9, 25, 92',
    'กลางคืน',
    'ดื่มน้ำสะอาดถวายพระ'
  ),
  (
    'dream-monk',
    'พระสงฆ์',
    'พ',
    'คน',
    'ได้รับการคุ้มครอง สิริมงคล และมีผู้ใหญ่ช่วยเหลือ',
    '09, 99',
    'เช้า',
    'สวดมนต์หรือทำบุญถวายสังฆทาน'
  ),
  (
    'dream-broken-tooth',
    'ฟันหัก',
    'ฟ',
    'ร่างกาย',
    'ควรระวังการสูญเสียหรือความขัดแย้งในครอบครัว',
    '13, 31',
    'กลางคืน',
    'ทำบุญอุทิศส่วนกุศลและพูดจาอย่างระมัดระวัง'
  ),
  (
    'dream-gold',
    'ทอง',
    'ท',
    'สิ่งของ',
    'การเงินดีขึ้น มีโชคลาภหรือโอกาสใหม่ด้านทรัพย์สิน',
    '27, 72',
    'เช้ามืด',
    'จัดกระเป๋าเงินให้สะอาดและบริจาคตามกำลัง'
  )
on conflict (id) do nothing;

insert into public.faqs (id, q, a, sort_order)
values
  (
    'faq-free',
    'การดูดวงในเว็บไซต์มีค่าใช้จ่ายหรือไม่?',
    'ฟีเจอร์หลักทั้งหมดเปิดให้ใช้ฟรี ฟีเจอร์พรีเมียมบางส่วนจะมีการแจ้งราคาก่อนใช้งาน',
    1
  ),
  (
    'faq-privacy',
    'ข้อมูลส่วนตัวของฉันปลอดภัยหรือไม่?',
    'เราเก็บข้อมูลทั้งหมดด้วยการเข้ารหัสตามมาตรฐาน และปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)',
    2
  ),
  (
    'faq-delete',
    'ฉันสามารถลบบัญชีของฉันได้หรือไม่?',
    'ได้ สามารถลบบัญชีและข้อมูลส่วนตัวทั้งหมดได้ที่หน้า โปรไฟล์ → ตั้งค่าและความเป็นส่วนตัว',
    3
  ),
  (
    'faq-accuracy',
    'ผลทำนายแม่นยำแค่ไหน?',
    'ผลทำนายเป็นแนวทางเพื่อช่วยทบทวนตนเอง ไม่ควรใช้แทนคำแนะนำด้านการแพทย์ การเงิน หรือกฎหมาย',
    4
  )
on conflict (id) do nothing;

insert into public.site_content (id, about, contact)
values (
  'main',
  '{
    "title": "ลิขิตฟ้า · ศาสตร์โบราณในมือคุณ",
    "description": "Likhitfa เกิดจากความตั้งใจที่จะนำศาสตร์ดูดวงตะวันออกอันลึกซึ้ง — ปาจื้อ ไพ่ทาโรต์ และทำนายฝัน — มาถ่ายทอดในรูปแบบที่เข้าใจง่ายและสวยงามสำหรับคนยุคใหม่",
    "story": [
      "จุดเริ่มต้นของลิขิตฟ้ามาจากบทสนทนาเล็กๆ ระหว่างนักออกแบบ นักพัฒนา และอาจารย์ดูดวงจีนรุ่นใหม่ ที่เชื่อว่าศาสตร์การดูดวงไม่ควรน่ากลัวหรือยากเกินไป",
      "เราจึงสร้างประสบการณ์ที่ผสานความสวยงาม ความแม่นยำ และการเข้าถึงได้ของยุคดิจิทัล เพื่อให้ทุกคนสามารถทำความรู้จักตัวเองผ่านสายตาของศาสตร์ที่สืบทอดมานานหลายพันปี"
    ],
    "vision": "ทำให้ศาสตร์การดูดวงเป็นเครื่องมือที่ใช้ทบทวนตัวเองได้ทุกวัน เข้าถึงง่ายและใช้งานสนุก",
    "mission": "ส่งมอบประสบการณ์ดูดวงที่งดงาม น่าเชื่อถือ และมีจริยธรรมในทุกการตีความ"
  }'::jsonb,
  '{
    "email": "hello@likhitfa.com",
    "phone": "02-123-4567",
    "line": "@likhitfa",
    "facebook": "facebook.com/likhitfa",
    "address": "ชั้น 12 อาคารฟ้าลิขิต ถ.สุขุมวิท กรุงเทพฯ 10110",
    "hoursWeekday": "จันทร์ - ศุกร์ · 09:00 - 18:00",
    "hoursSaturday": "เสาร์ · 10:00 - 16:00"
  }'::jsonb
)
on conflict (id) do nothing;
