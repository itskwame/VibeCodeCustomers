-- Generated migration for VibeCodeCustomers backend schema with RLS and indexes.
create extension if not exists "pgcrypto";

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  keywords text[] not null default array[]::text[],
  subreddits text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user_created on projects (user_id, created_at);
create index if not exists idx_projects_id on projects (id);

alter table projects enable row level security;
create policy projects_owner_policy on projects
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create function projects_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger projects_updated_at
  before update on projects
  for each row execute function projects_updated_at();

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  kind text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table sources enable row level security;
create policy sources_owner on sources
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists idx_sources_user_created on sources (user_id, created_at);
create index if not exists idx_sources_project on sources (project_id);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  source_id uuid references sources(id),
  url text not null,
  title text not null,
  excerpt text,
  author text,
  subreddit text,
  score int default 0,
  num_comments int default 0,
  relevance_score int not null default 0,
  platform_created_at timestamptz,
  ai_summary text,
  ai_pain_points text[],
  ai_why_matched text,
  last_analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table conversations enable row level security;
create policy conversations_owner on conversations
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists idx_convos_user_created on conversations (user_id, created_at);
create index if not exists idx_convos_project on conversations (project_id);

create function conversations_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger conversations_updated_at
  before update on conversations
  for each row execute function conversations_updated_at();

create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  tone text not null,
  length text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table drafts enable row level security;
create policy drafts_owner on drafts
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists idx_drafts_user_created on drafts (user_id, created_at);
create index if not exists idx_drafts_project on drafts (project_id);

create table if not exists outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  status text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table outcomes enable row level security;
create policy outcomes_owner on outcomes
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists idx_outcomes_user_created on outcomes (user_id, created_at);
create index if not exists idx_outcomes_project on outcomes (project_id);

create table if not exists daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  discovery_count int not null default 0,
  draft_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table daily_usage enable row level security;
create policy daily_usage_owner on daily_usage
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists idx_daily_usage_user_created on daily_usage (user_id, created_at);
