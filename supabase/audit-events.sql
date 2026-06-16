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

alter table public.content_audit_events enable row level security;

drop policy if exists "service role manages content audit events" on public.content_audit_events;
create policy "service role manages content audit events"
  on public.content_audit_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
