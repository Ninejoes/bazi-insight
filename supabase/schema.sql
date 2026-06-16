create table if not exists public.articles (
  slug text primary key,
  title text not null,
  excerpt text not null default '',
  category text not null default 'ปาจื้อ',
  author text not null default 'Admin',
  date date not null default current_date,
  read_min integer not null default 3,
  cover text not null default '',
  cover_alt text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  keywords text[] not null default '{}'::text[],
  canonical_url text not null default '',
  content jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.articles add column if not exists cover_alt text not null default '';
alter table public.articles add column if not exists seo_title text not null default '';
alter table public.articles add column if not exists seo_description text not null default '';
alter table public.articles add column if not exists keywords text[] not null default '{}'::text[];
alter table public.articles add column if not exists canonical_url text not null default '';
create index if not exists articles_date_idx on public.articles (date desc);

create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  name text not null default '',
  role text not null default 'User',
  status text not null default 'active',
  provider text not null default 'email',
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_role_check check (role in ('Admin', 'User')),
  constraint users_status_check check (status in ('active', 'disabled'))
);

create index if not exists users_email_idx on public.users (lower(email));
create index if not exists users_role_idx on public.users (role);

create table if not exists public.auth_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  email text not null default '',
  event_type text not null,
  role text not null default 'User',
  ip text not null default '',
  user_agent text not null default '',
  created_at timestamptz not null default now(),
  constraint auth_events_event_type_check check (
    event_type in (
      'admin_login',
      'admin_session',
      'user_register',
      'user_login',
      'user_session'
    )
  ),
  constraint auth_events_role_check check (role in ('Admin', 'User'))
);

create index if not exists auth_events_user_id_idx on public.auth_events (user_id);
create index if not exists auth_events_created_at_idx on public.auth_events (created_at desc);

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

create table if not exists public.reading_history (
  id text primary key,
  user_id uuid references public.users(id) on delete set null,
  email text not null default '',
  type text not null,
  title text not null,
  result text not null default '',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reading_history_type_check check (
    type in ('ไพ่ยิปซี', 'ปาจื้อ', 'ทำนายฝัน')
  )
);

create index if not exists reading_history_user_id_idx on public.reading_history (user_id);
create index if not exists reading_history_email_idx on public.reading_history (lower(email));
create index if not exists reading_history_created_at_idx on public.reading_history (created_at desc);

create or replace function public.sync_auth_user_to_public_users()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    name,
    role,
    status,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'displayName',
      new.email,
      ''
    ),
    case
      when new.raw_app_meta_data->>'role' = 'Admin'
        or new.raw_user_meta_data->>'role' = 'Admin'
      then 'Admin'
      else 'User'
    end,
    case when new.deleted_at is null then 'active' else 'disabled' end,
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    new.last_sign_in_at,
    new.created_at,
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    role = excluded.role,
    status = excluded.status,
    provider = excluded.provider,
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists sync_auth_user_to_public_users_insert on auth.users;
create trigger sync_auth_user_to_public_users_insert
after insert or update on auth.users
for each row execute function public.sync_auth_user_to_public_users();

insert into public.users (
  id,
  email,
  name,
  role,
  status,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  au.id,
  coalesce(au.email, ''),
  coalesce(
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'displayName',
    au.email,
    ''
  ),
  case
    when au.raw_app_meta_data->>'role' = 'Admin'
      or au.raw_user_meta_data->>'role' = 'Admin'
    then 'Admin'
    else 'User'
  end,
  case when au.deleted_at is null then 'active' else 'disabled' end,
  coalesce(au.raw_app_meta_data->>'provider', 'email'),
  au.last_sign_in_at,
  au.created_at,
  now()
from auth.users au
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  role = excluded.role,
  status = excluded.status,
  provider = excluded.provider,
  last_sign_in_at = excluded.last_sign_in_at,
  updated_at = now();

insert into public.articles (
  slug,
  title,
  excerpt,
  category,
  author,
  date,
  read_min,
  cover,
  cover_alt,
  seo_title,
  seo_description,
  keywords,
  canonical_url,
  content
)
values
  (
    'bazi-101',
    'ปาจื้อเบื้องต้น เข้าใจ 4 เสาแห่งชะตา',
    'ปาจื้อ (八字) คือศาสตร์การคำนวณดวงชะตาจากวันเดือนปีและเวลาเกิด มาทำความเข้าใจ 4 เสาในแบบเข้าใจง่าย',
    'ปาจื้อ',
    'อ.ฟ้าลิขิต',
    '2025-09-12',
    6,
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&q=80',
    'ปาจื้อและศาสตร์ดวงจีน',
    'ปาจื้อเบื้องต้น เข้าใจ 4 เสาแห่งชะตา',
    'เรียนรู้พื้นฐานปาจื้อ 八字 และ 4 เสาแห่งชะตาในแบบเข้าใจง่าย',
    array['ปาจื้อ','八字','4 เสา','ดวงจีน'],
    '',
    '[
      "ปาจื้อแปลตามตัวอักษรว่า ‘แปดอักษร’ คืออักษรสวรรค์ 4 ตัว และอักษรดิน 4 ตัว ที่ได้จากปี เดือน วัน และยามที่เกิด",
      "การอ่านปาจื้อเริ่มจากการแยกธาตุของแต่ละเสา แล้วดูความสัมพันธ์ของธาตุที่เกื้อหนุนและขัดแย้งกัน",
      "เสาแรกคือเสาวันซึ่งหมายถึงตัวเจ้าชะตา เสานี้สำคัญที่สุดในการวิเคราะห์",
      "เมื่อเข้าใจพื้นฐานเหล่านี้แล้ว เราจึงสามารถมองเห็นจังหวะของชีวิตในแต่ละช่วงวัยจรได้ชัดเจนยิ่งขึ้น"
    ]'::jsonb
  ),
  (
    'tarot-spread-beginner',
    'เริ่มเปิดไพ่ทาโรต์ใบแรก สำหรับมือใหม่',
    'ก่อนเปิดไพ่ใบแรก สิ่งสำคัญคือการตั้งคำถามให้ชัดเจน บทความนี้รวม 5 ขั้นตอนเริ่มต้นที่มือใหม่ควรรู้',
    'ไพ่ยิปซี',
    'อ.จันทร์เพ็ญ',
    '2025-10-02',
    5,
    'https://images.unsplash.com/photo-1577897665977-3a3f25c8a85a?w=1200&q=80',
    'ไพ่ทาโรต์สำหรับมือใหม่',
    'เริ่มเปิดไพ่ทาโรต์ใบแรก สำหรับมือใหม่',
    'คู่มือเริ่มต้นเปิดไพ่ทาโรต์ ตั้งคำถาม และอ่านไพ่ใบแรกอย่างมีสติ',
    array['ไพ่ทาโรต์','ไพ่ยิปซี','มือใหม่','ดูดวงความรัก'],
    '',
    '[
      "การเปิดไพ่ทาโรต์ไม่ใช่เรื่องของการทำนายอนาคต แต่คือกระบวนการทบทวนความคิด ความรู้สึก และมุมมองที่อยู่ในใจเราเอง",
      "ก่อนสับไพ่ ให้นั่งสบาย หายใจเข้าออกช้าๆ แล้วถามคำถามที่ ‘เปิด’ มากกว่าคำถามใช่/ไม่ใช่",
      "เลือกการวางไพ่ที่ตรงกับคำถาม เช่น 3 ใบ (อดีต-ปัจจุบัน-อนาคต) สำหรับคำถามทั่วไป",
      "เมื่อเปิดไพ่แล้ว ให้สังเกตทั้งภาพและความรู้สึกแรกที่ขึ้นมาในใจก่อนจะอ่านความหมาย"
    ]'::jsonb
  ),
  (
    'dream-numbers',
    'ฝันเห็นอะไรได้เลขอะไร รวมความเชื่อยอดนิยม',
    'รวมคำฝันยอดฮิตและเลขเด็ดที่คนไทยนิยมตีความ พร้อมข้อแนะนำในการใช้เลขอย่างมีสติ',
    'ทำนายฝัน',
    'ทีม Likhitfa',
    '2025-10-20',
    4,
    'https://images.unsplash.com/photo-1532635241-17e820acc59f?w=1200&q=80',
    'ความฝันและเลขนำโชค',
    'ฝันเห็นอะไรได้เลขอะไร รวมความเชื่อยอดนิยม',
    'รวมความหมายฝันยอดนิยม เลขนำโชค และคำแนะนำในการใช้เลขจากความฝันอย่างมีสติ',
    array['ทำนายฝัน','เลขเด็ด','ฝันเห็นงู','ฝันเห็นพระ'],
    '',
    '[
      "ฝันเห็นงู มักตีความว่ามีคนรักหรือเนื้อคู่เข้ามาในชีวิต เลขที่นิยมคือ 06, 56, 89",
      "ฝันเห็นพระสงฆ์ หมายถึงสิ่งศักดิ์สิทธิ์คุ้มครอง มักได้เลขชุด 9 หรือเลข 09",
      "ฝันเห็นน้ำใส โดยทั่วไปสื่อถึงโชคลาภและความสำเร็จที่กำลังจะมาถึง",
      "การตีฝันเป็นความเชื่อ ควรใช้สติและไม่นำไปสู่การพนันเกินตัว"
    ]'::jsonb
  ),
  (
    'monthly-energy-guide',
    'พลังประจำเดือน วิธีอ่านแนวโน้มเดือนนี้ของคุณ',
    'เรียนรู้วิธีอ่านพลังของเดือนผ่านไพ่ทาโรต์ 10 ใบ พร้อมเทคนิคนำมาปรับใช้ในชีวิตจริง',
    'ไพ่ยิปซี',
    'อ.จันทร์เพ็ญ',
    '2025-11-01',
    7,
    'https://images.unsplash.com/photo-1518932945647-7a1c969f8be2?w=1200&q=80',
    'พลังประจำเดือนจากไพ่ทาโรต์',
    'พลังประจำเดือน วิธีอ่านแนวโน้มเดือนนี้ของคุณ',
    'เรียนรู้วิธีอ่านพลังประจำเดือนผ่านไพ่ทาโรต์ 10 ใบ พร้อมแนวทางใช้งานจริง',
    array['พลังประจำเดือน','ไพ่ทาโรต์','ดูดวงรายเดือน'],
    '',
    '[
      "สเปรด 10 ใบให้ภาพรวมที่ครอบคลุมทั้งสถานะ ปัญหา และแนวทางในเดือนนั้น",
      "เริ่มจากการดูใบที่ 1 ซึ่งสะท้อน ‘ตัวเรา’ ก่อนเสมอ",
      "อย่ารีบสรุปจากใบเดียว ต้องดูองค์รวมและความสัมพันธ์ระหว่างไพ่"
    ]'::jsonb
  ),
  (
    'luck-rituals',
    'พิธีกรรมเสริมโชคแบบจีนที่ทำได้ง่ายที่บ้าน',
    'รวมพิธีกรรมโบราณที่ปรับให้เข้ากับยุคสมัย ทำได้ง่ายและให้พลังบวกแก่ผู้ทำ',
    'ปาจื้อ',
    'อ.ฟ้าลิขิต',
    '2025-11-14',
    5,
    'https://images.unsplash.com/photo-1583244532610-2a234c8b81b6?w=1200&q=80',
    'พิธีกรรมเสริมโชคแบบจีน',
    'พิธีกรรมเสริมโชคแบบจีนที่ทำได้ง่ายที่บ้าน',
    'รวมพิธีกรรมจีนเสริมโชคที่ทำได้ง่ายในบ้าน พร้อมแนวคิดเรื่องพลังธาตุ',
    array['เสริมโชค','พิธีกรรมจีน','ปาจื้อ','ฮวงจุ้ย'],
    '',
    '[
      "การจุดเทียนแดงในวันเกิดเพื่อเสริมพลังธาตุไฟ",
      "การวางเหรียญทองแดงร้อยเชือกแดงไว้ใกล้กระเป๋าเงินเสริมการเงิน",
      "การกวาดบ้านด้วยใจสงบในเช้าวันที่ 1 ของเดือน"
    ]'::jsonb
  ),
  (
    'love-tarot-guide',
    'อ่านไพ่ความรักให้ตรงใจ ไม่ลำเอียง',
    'วิธีตั้งคำถามและตีความไพ่ความรักโดยไม่เอาความหวังของตัวเองไปบดบังคำตอบของไพ่',
    'ไพ่ยิปซี',
    'อ.จันทร์เพ็ญ',
    '2025-11-25',
    6,
    'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=1200&q=80',
    'อ่านไพ่ความรักให้ตรงใจ',
    'อ่านไพ่ความรักให้ตรงใจ ไม่ลำเอียง',
    'วิธีตั้งคำถามและตีความไพ่ความรักอย่างไม่ลำเอียง เพื่อใช้ทบทวนความสัมพันธ์',
    array['ไพ่ความรัก','ไพ่ยิปซี','ทาโรต์ความรัก'],
    '',
    '[
      "เริ่มจากการแยก ‘สิ่งที่อยากให้เกิด’ ออกจาก ‘สิ่งที่กำลังเกิด’",
      "ไพ่ที่ได้คือกระจกสะท้อน ไม่ใช่คำสั่ง ใช้เป็นแนวทางตัดสินใจ"
    ]'::jsonb
  )
on conflict (slug) do nothing;

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

create table if not exists public.contact_messages (
  id text primary key,
  name text not null default '',
  email text not null default '',
  subject text not null default '',
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_messages_status_check
    check (status in ('new', 'read', 'replied', 'archived'))
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
create index if not exists contact_messages_status_idx
  on public.contact_messages (status);

create table if not exists public.leads (
  id text primary key,
  name text not null default '',
  gender text not null default '',
  birth_date text not null default '',
  birth_time text not null default '',
  source text not null default 'bazi-insight',
  reason text not null default 'submit',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_source_idx on public.leads (source);

alter table public.articles enable row level security;
alter table public.users enable row level security;
alter table public.auth_events enable row level security;
alter table public.content_audit_events enable row level security;
alter table public.reading_history enable row level security;
alter table public.dreams enable row level security;
alter table public.faqs enable row level security;
alter table public.site_content enable row level security;
alter table public.contact_messages enable row level security;
alter table public.leads enable row level security;

drop policy if exists "service role manages articles" on public.articles;
create policy "service role manages articles"
  on public.articles
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service role manages users" on public.users;
create policy "service role manages users"
  on public.users
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service role manages auth events" on public.auth_events;
create policy "service role manages auth events"
  on public.auth_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service role manages content audit events" on public.content_audit_events;
create policy "service role manages content audit events"
  on public.content_audit_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service role manages reading history" on public.reading_history;
create policy "service role manages reading history"
  on public.reading_history
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service role manages dreams" on public.dreams;
create policy "service role manages dreams"
  on public.dreams
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service role manages faqs" on public.faqs;
create policy "service role manages faqs"
  on public.faqs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service role manages site content" on public.site_content;
create policy "service role manages site content"
  on public.site_content
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service role manages contact messages" on public.contact_messages;
create policy "service role manages contact messages"
  on public.contact_messages
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service role manages leads" on public.leads;
create policy "service role manages leads"
  on public.leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

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
    'เราเก็บข้อมูลทั้งหมดด้วยการเข้าสู่ระบบตามมาตรฐาน และปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)',
    2
  ),
  (
    'faq-delete',
    'ฉันสามารถลบบัญชีของฉันได้หรือไม่?',
    'ได้ สามารถลบบัญชีและข้อมูลส่วนตัวทั้งหมดได้ที่หน้า โปรไฟล์ > ตั้งค่าและความเป็นส่วนตัว',
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
