alter table conversations
  add column if not exists source text;

alter table conversations
  add column if not exists found_at timestamptz not null default now();

create unique index if not exists idx_conversations_user_project_url on conversations (user_id, project_id, url);

create table if not exists lead_search_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  query_hash text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table lead_search_cache enable row level security;
create policy lead_search_cache_owner on lead_search_cache
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create unique index if not exists idx_lead_search_cache_user_project_hash on lead_search_cache (user_id, project_id, query_hash);
