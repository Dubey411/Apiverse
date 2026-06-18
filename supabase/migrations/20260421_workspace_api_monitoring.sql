create extension if not exists pgcrypto;

create table if not exists public.workspace_monitored_apis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  base_url text not null,
  health_path text not null default '/',
  docs_url text,
  environment text not null check (environment in ('sandbox', 'live')),
  auth_mode text not null check (auth_mode in ('none', 'bearer', 'api_key')),
  auth_header_name text,
  encrypted_auth_value text,
  quota_limit integer,
  quota_remaining integer,
  quota_remaining_header text,
  quota_limit_header text,
  quota_reset_header text,
  quota_renews_at timestamptz,
  expiry_at timestamptz,
  alert_email text,
  ownership_confirmed boolean not null default false,
  monitoring_consent boolean not null default false,
  security_scan_enabled boolean not null default true,
  latest_status text not null default 'warning' check (latest_status in ('healthy', 'warning', 'critical', 'paused')),
  last_checked_at timestamptz,
  last_status_code integer,
  last_latency_ms integer,
  last_error text,
  vulnerability_status text not null default 'warning' check (vulnerability_status in ('healthy', 'warning', 'critical', 'paused')),
  vulnerability_summary text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_api_monitor_checks (
  id uuid primary key default gen_random_uuid(),
  api_id uuid not null references public.workspace_monitored_apis(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  api_name text not null,
  check_type text not null check (check_type in ('uptime', 'quota', 'expiry', 'security')),
  severity text not null check (severity in ('info', 'warning', 'critical')),
  status_code integer,
  latency_ms integer,
  requests_remaining integer,
  findings text[] not null default '{}',
  checked_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_api_alerts (
  id uuid primary key default gen_random_uuid(),
  api_id uuid not null references public.workspace_monitored_apis(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  api_name text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  title text not null,
  body text not null,
  channel text not null default 'in_app',
  acknowledged boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists workspace_monitored_apis_user_idx
  on public.workspace_monitored_apis(user_id, created_at desc);

create unique index if not exists workspace_monitored_apis_user_slug_idx
  on public.workspace_monitored_apis(user_id, slug);

create index if not exists workspace_api_monitor_checks_user_idx
  on public.workspace_api_monitor_checks(user_id, checked_at desc);

create index if not exists workspace_api_monitor_checks_api_idx
  on public.workspace_api_monitor_checks(api_id, checked_at desc);

create index if not exists workspace_api_alerts_user_idx
  on public.workspace_api_alerts(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_workspace_monitored_apis_updated_at on public.workspace_monitored_apis;
create trigger set_workspace_monitored_apis_updated_at
before update on public.workspace_monitored_apis
for each row execute procedure public.set_updated_at();

alter table public.workspace_monitored_apis enable row level security;
alter table public.workspace_api_monitor_checks enable row level security;
alter table public.workspace_api_alerts enable row level security;

drop policy if exists "Users can view their monitored apis" on public.workspace_monitored_apis;
create policy "Users can view their monitored apis"
on public.workspace_monitored_apis for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their monitored apis" on public.workspace_monitored_apis;
create policy "Users can insert their monitored apis"
on public.workspace_monitored_apis for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their monitored apis" on public.workspace_monitored_apis;
create policy "Users can update their monitored apis"
on public.workspace_monitored_apis for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their monitored apis" on public.workspace_monitored_apis;
create policy "Users can delete their monitored apis"
on public.workspace_monitored_apis for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their monitor checks" on public.workspace_api_monitor_checks;
create policy "Users can view their monitor checks"
on public.workspace_api_monitor_checks for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their monitor checks" on public.workspace_api_monitor_checks;
create policy "Users can insert their monitor checks"
on public.workspace_api_monitor_checks for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can view their monitor alerts" on public.workspace_api_alerts;
create policy "Users can view their monitor alerts"
on public.workspace_api_alerts for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their monitor alerts" on public.workspace_api_alerts;
create policy "Users can insert their monitor alerts"
on public.workspace_api_alerts for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their monitor alerts" on public.workspace_api_alerts;
create policy "Users can update their monitor alerts"
on public.workspace_api_alerts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
