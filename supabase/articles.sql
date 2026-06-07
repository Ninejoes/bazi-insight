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
