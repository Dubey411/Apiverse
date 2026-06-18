create extension if not exists pgcrypto;

create table if not exists public.workspace_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_project_apis (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.workspace_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  monitored_api_id uuid references public.workspace_monitored_apis(id) on delete set null,
  api_name text not null,
  api_slug text,
  usage_description text not null,
  criticality text not null default 'medium' check (criticality in ('low', 'medium', 'high')),
  expiry_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists workspace_projects_user_idx
  on public.workspace_projects(user_id, created_at desc);

create index if not exists workspace_project_apis_project_idx
  on public.workspace_project_apis(project_id, created_at desc);

create index if not exists workspace_project_apis_user_idx
  on public.workspace_project_apis(user_id, created_at desc);

drop trigger if exists set_workspace_projects_updated_at on public.workspace_projects;
create trigger set_workspace_projects_updated_at
before update on public.workspace_projects
for each row execute procedure public.set_updated_at();

drop trigger if exists set_workspace_project_apis_updated_at on public.workspace_project_apis;
create trigger set_workspace_project_apis_updated_at
before update on public.workspace_project_apis
for each row execute procedure public.set_updated_at();

alter table public.workspace_projects enable row level security;
alter table public.workspace_project_apis enable row level security;

drop policy if exists "Users can view their projects" on public.workspace_projects;
create policy "Users can view their projects"
on public.workspace_projects for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their projects" on public.workspace_projects;
create policy "Users can insert their projects"
on public.workspace_projects for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their projects" on public.workspace_projects;
create policy "Users can update their projects"
on public.workspace_projects for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their projects" on public.workspace_projects;
create policy "Users can delete their projects"
on public.workspace_projects for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their project apis" on public.workspace_project_apis;
create policy "Users can view their project apis"
on public.workspace_project_apis for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their project apis" on public.workspace_project_apis;
create policy "Users can insert their project apis"
on public.workspace_project_apis for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their project apis" on public.workspace_project_apis;
create policy "Users can update their project apis"
on public.workspace_project_apis for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their project apis" on public.workspace_project_apis;
create policy "Users can delete their project apis"
on public.workspace_project_apis for delete
using (auth.uid() = user_id);
