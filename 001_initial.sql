-- Sarkari Update Hub initial schema
-- Run in Supabase SQL Editor. This enables strict row-level security by default.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user','editor','admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  department text not null check (char_length(department) between 2 and 160),
  category text not null check (category in ('Latest Jobs','Admit Card','Results','Answer Key','Exam Date','Scheme','Notice')),
  state_name text,
  qualification text,
  vacancies integer check (vacancies is null or vacancies >= 0),
  start_date date,
  last_date date,
  official_url text not null,
  notification_url text,
  youtube_url text,
  source_notes text not null default '',
  status text not null default 'draft' check (status in ('draft','in_review','published','archived')),
  verified_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dates_in_order check (start_date is null or last_date is null or start_date <= last_date)
);
create index if not exists notices_status_created_idx on public.notices(status, created_at desc);
create index if not exists notices_category_idx on public.notices(category);
create index if not exists notices_state_idx on public.notices(state_name);
create index if not exists notices_last_date_idx on public.notices(last_date);

alter table public.notices enable row level security;

drop policy if exists "Public can read published notices" on public.notices;
create policy "Public can read published notices"
on public.notices for select to anon, authenticated
using (status = 'published' or public.is_admin());

drop policy if exists "Admins can insert notices" on public.notices;
create policy "Admins can insert notices"
on public.notices for insert to authenticated
with check (public.is_admin() and created_by = auth.uid());

drop policy if exists "Admins can update notices" on public.notices;
create policy "Admins can update notices"
on public.notices for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete notices" on public.notices;
create policy "Admins can delete notices"
on public.notices for delete to authenticated
using (public.is_admin());

drop policy if exists "Users can read own profile, admins can read all" on public.profiles;
create policy "Users can read own profile, admins can read all"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

-- No client may self-promote to admin. Provision admin roles only through the SQL Editor
-- after confirming the correct auth.users id/email.
drop policy if exists "No client profile writes" on public.profiles;
create policy "No client profile writes" on public.profiles for insert to authenticated
with check (id = auth.uid() and role = 'user');
drop policy if exists "No client profile updates" on public.profiles;
create policy "No client profile updates" on public.profiles for update to authenticated
using (false) with check (false);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists notices_updated_at on public.notices;
create trigger notices_updated_at before update on public.notices
for each row execute function public.set_updated_at();

-- Create an auth user in Supabase Dashboard first, then replace the email below
-- with your own login email and run this query once:
-- insert into public.profiles (id, display_name, role)
-- select id, 'Site Admin', 'admin' from auth.users where email = 'YOUR_ADMIN_EMAIL'
-- on conflict (id) do update set role = 'admin';
