create extension if not exists pgcrypto;

create table if not exists public.workspace_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  api_slug text not null,
  api_name text not null,
  display_name text not null,
  environment text not null check (environment in ('sandbox', 'live')),
  status text not null default 'active' check (status in ('active', 'revoked')),
  key_prefix text not null,
  key_hash text not null unique,
  last_four text not null,
  total_requests integer not null default 0,
  success_count integer not null default 0,
  error_count integer not null default 0,
  average_latency_ms integer,
  last_used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_api_usage_events (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid not null references public.workspace_api_keys(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  api_slug text not null,
  api_name text not null,
  environment text not null check (environment in ('sandbox', 'live')),
  request_method text not null,
  status_code integer not null,
  latency_ms integer not null,
  request_path text not null,
  request_id text not null,
  usage_quantity integer not null default 1,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists workspace_api_keys_user_idx
  on public.workspace_api_keys(user_id, created_at desc);

create index if not exists workspace_api_keys_slug_idx
  on public.workspace_api_keys(user_id, api_slug, status);

create index if not exists workspace_api_usage_events_user_idx
  on public.workspace_api_usage_events(user_id, created_at desc);

create index if not exists workspace_api_usage_events_key_idx
  on public.workspace_api_usage_events(api_key_id, created_at desc);

create index if not exists workspace_api_usage_events_slug_idx
  on public.workspace_api_usage_events(user_id, api_slug, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_workspace_api_keys_updated_at on public.workspace_api_keys;
create trigger set_workspace_api_keys_updated_at
before update on public.workspace_api_keys
for each row execute procedure public.set_updated_at();

alter table public.workspace_api_keys enable row level security;
alter table public.workspace_api_usage_events enable row level security;

drop policy if exists "Users can view their own workspace api keys" on public.workspace_api_keys;
create policy "Users can view their own workspace api keys"
on public.workspace_api_keys for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own workspace api keys" on public.workspace_api_keys;
create policy "Users can insert their own workspace api keys"
on public.workspace_api_keys for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own workspace api keys" on public.workspace_api_keys;
create policy "Users can update their own workspace api keys"
on public.workspace_api_keys for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own workspace api keys" on public.workspace_api_keys;
create policy "Users can delete their own workspace api keys"
on public.workspace_api_keys for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their own workspace api usage events" on public.workspace_api_usage_events;
create policy "Users can view their own workspace api usage events"
on public.workspace_api_usage_events for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own workspace api usage events" on public.workspace_api_usage_events;
create policy "Users can insert their own workspace api usage events"
on public.workspace_api_usage_events for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own workspace api usage events" on public.workspace_api_usage_events;
create policy "Users can delete their own workspace api usage events"
on public.workspace_api_usage_events for delete
using (auth.uid() = user_id);
