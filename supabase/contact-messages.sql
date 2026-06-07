create table if not exists public.contact_messages (
  id text primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
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

alter table public.contact_messages enable row level security;

drop policy if exists "service role manages contact messages" on public.contact_messages;
create policy "service role manages contact messages"
  on public.contact_messages
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
