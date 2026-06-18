create extension if not exists pgcrypto;

create table if not exists public.api_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_id text not null,
  provider_label text not null,
  api_slug text,
  display_name text not null,
  environment text not null check (environment in ('sandbox', 'live')),
  auth_type text not null,
  connection_status text not null default 'needs_setup' check (
    connection_status in ('connected', 'needs_setup', 'rotate_soon', 'sync_error', 'verification_failed')
  ),
  sync_status text not null default 'idle' check (sync_status in ('idle', 'synced', 'limited', 'failed')),
  verification_message text,
  official_url text,
  base_url text,
  encrypted_credentials text not null,
  credential_hint text,
  account_label text,
  account_ref text,
  supports_usage_sync boolean not null default false,
  connected_at timestamptz,
  last_verified_at timestamptz,
  last_sync_at timestamptz,
  last_sync_error text,
  last_used_at timestamptz,
  total_requests integer,
  success_rate numeric(5,2),
  average_latency_ms integer,
  error_count integer,
  usage_quantity numeric(14,2),
  usage_unit text,
  estimated_spend numeric(14,2),
  currency text,
  connection_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists api_connections_user_provider_slug_env_idx
  on public.api_connections(user_id, provider_id, coalesce(api_slug, ''), environment);

create table if not exists public.api_usage_snapshots (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.api_connections(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sync_status text not null default 'idle' check (sync_status in ('idle', 'synced', 'limited', 'failed')),
  sync_message text not null,
  total_requests integer,
  success_rate numeric(5,2),
  average_latency_ms integer,
  error_count integer,
  usage_quantity numeric(14,2),
  usage_unit text,
  estimated_spend numeric(14,2),
  currency text,
  last_used_at timestamptz,
  raw_payload jsonb,
  snapshot_at timestamptz not null default timezone('utc', now())
);

create index if not exists api_connections_user_id_idx on public.api_connections(user_id);
create index if not exists api_connections_user_status_idx on public.api_connections(user_id, connection_status);
create index if not exists api_usage_snapshots_connection_idx on public.api_usage_snapshots(connection_id, snapshot_at desc);
create index if not exists api_usage_snapshots_user_idx on public.api_usage_snapshots(user_id, snapshot_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_api_connections_updated_at on public.api_connections;
create trigger set_api_connections_updated_at
before update on public.api_connections
for each row execute procedure public.set_updated_at();

alter table public.api_connections enable row level security;
alter table public.api_usage_snapshots enable row level security;

drop policy if exists "Users can view their own api connections" on public.api_connections;
create policy "Users can view their own api connections"
on public.api_connections for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own api connections" on public.api_connections;
create policy "Users can insert their own api connections"
on public.api_connections for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own api connections" on public.api_connections;
create policy "Users can update their own api connections"
on public.api_connections for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own api connections" on public.api_connections;
create policy "Users can delete their own api connections"
on public.api_connections for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their own usage snapshots" on public.api_usage_snapshots;
create policy "Users can view their own usage snapshots"
on public.api_usage_snapshots for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own usage snapshots" on public.api_usage_snapshots;
create policy "Users can insert their own usage snapshots"
on public.api_usage_snapshots for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own usage snapshots" on public.api_usage_snapshots;
create policy "Users can delete their own usage snapshots"
on public.api_usage_snapshots for delete
using (auth.uid() = user_id);
