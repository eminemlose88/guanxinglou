-- Enable extension for gen_random_uuid on Postgres
create extension if not exists pgcrypto;

-- Profiles table (girls)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  age int,
  tags text[] default '{}',
  bio text default '',
  published boolean default false,
  owner uuid default auth.uid(),
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- RLS: allow read of published profiles to all authenticated users
drop policy if exists "read_published_profiles" on public.profiles;
create policy "read_published_profiles"
on public.profiles for select
to authenticated
using (published = true);

-- RLS: allow owners to read their own profiles
drop policy if exists "read_own_profiles" on public.profiles;
create policy "read_own_profiles"
on public.profiles for select
to authenticated
using (owner = auth.uid());

-- RLS: allow owners to insert their own profiles
drop policy if exists "insert_own_profiles" on public.profiles;
create policy "insert_own_profiles"
on public.profiles for insert
to authenticated
with check (owner = auth.uid());

-- RLS: allow owners to update their own profiles
drop policy if exists "update_own_profiles" on public.profiles;
create policy "update_own_profiles"
on public.profiles for update
to authenticated
using (owner = auth.uid())
with check (owner = auth.uid());

-- Users table (app accounts)
create table if not exists public.users (
  user_id bigserial primary key,
  supabase_uid uuid unique,
  username text unique not null,
  email text unique not null,
  password_hash text not null,
  status text default 'active',
  register_ip text,
  device_info jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.users enable row level security;
drop policy if exists "users_read_self" on public.users;
create policy "users_read_self"
on public.users for select
to authenticated
using (supabase_uid = auth.uid());

-- Boss info
create table if not exists public.business_owners (
  owner_id bigint primary key references public.users(user_id) on delete cascade,
  company_name text,
  contact_number text,
  business_license text,
  verification_status text default 'pending',
  additional_profile_data jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default now()
);
alter table public.business_owners enable row level security;
drop policy if exists "owners_read_self" on public.business_owners;
create policy "owners_read_self"
on public.business_owners for select
to authenticated
using (
  (select supabase_uid from public.users where public.users.user_id = public.business_owners.owner_id) = auth.uid()
);

-- Female info
create table if not exists public.female_users (
  user_id bigint primary key references public.users(user_id) on delete cascade,
  real_name text,
  age int,
  location text,
  profile_picture text,
  additional_details jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default now()
);
alter table public.female_users enable row level security;
drop policy if exists "female_read_self" on public.female_users;
create policy "female_read_self"
on public.female_users for select
to authenticated
using (
  (select supabase_uid from public.users where public.users.user_id = public.female_users.user_id) = auth.uid()
);
