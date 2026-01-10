-- Supabase schema for VibeCodeCustomers
-- Generated to match the PRD data model.

-- Projects belong to authenticated users.
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  product_description text not null,
  keywords text[] not null default array[]::text[],
  subreddits text[] not null default array[]::text[],
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id on projects (user_id);

create or replace function projects_updated_at_trigger()
  returns trigger language plpgsql as $$
  begin
    new.updated_at := now();
    return new;
  end;
$$;

create trigger projects_updated_at
  before update on projects
  for each row execute function projects_updated_at_trigger();

-- Conversations discovered via Reddit.
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  platform text not null default 'REDDIT',
  external_id text not null,
  url text not null,
  title text not null,
  author text not null,
  subreddit text not null,
  platform_created_at timestamptz not null,
  score int not null default 0,
  num_comments int not null default 0,
  excerpt text,
  relevance_score int not null default 0,
  ai_summary text,
  ai_pain_points text[],
  ai_why_matched text,
  last_analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_project on conversations (project_id, relevance_score desc);
create unique index if not exists uniq_conversation_project_external on conversations (project_id, external_id);

create or replace function conversations_updated_at_trigger()
  returns trigger language plpgsql as $$
  begin
    new.updated_at := now();
    return new;
  end;
$$;

create trigger conversations_updated_at
  before update on conversations
  for each row execute function conversations_updated_at_trigger();

-- Drafts produced for conversations.
create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  tone text not null,
  length text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_drafts_user on drafts (user_id);
create index if not exists idx_drafts_conv on drafts (conversation_id);

-- Subscription metadata.
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  status text not null,
  current_period_end timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_subscriptions_user on subscriptions (user_id);

-- Usage tracking for limits.
create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  count int not null default 1,
  period_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_usage_user_period on usage_events (user_id, period_key, type);

-- Helper function to enforce monthly limits.
create or replace function current_period_key()
  returns text language sql as $$
    to_char(now() at time zone 'UTC', 'YYYY-MM')
  $$;

create or replace function increment_usage(_user uuid, _type text)
  returns void language plpgsql as $$
  begin
    perform usage_events(user_id, type, count, period_key, created_at)
      where false;
    insert into usage_events (user_id, type, period_key)
    values (_user, _type, current_period_key());
  end;
$$;
