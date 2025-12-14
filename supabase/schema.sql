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
create policy if not exists "read_published_profiles"
on public.profiles for select
to authenticated
using (published = true);

-- RLS: allow owners to read their own profiles
create policy if not exists "read_own_profiles"
on public.profiles for select
to authenticated
using (owner = auth.uid());

-- RLS: allow owners to insert their own profiles
create policy if not exists "insert_own_profiles"
on public.profiles for insert
to authenticated
with check (owner = auth.uid());

-- RLS: allow owners to update their own profiles
create policy if not exists "update_own_profiles"
on public.profiles for update
to authenticated
using (owner = auth.uid())
with check (owner = auth.uid());
