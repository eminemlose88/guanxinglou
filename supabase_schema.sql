-- Users Table (renamed to app_users to avoid conflict with Supabase Auth)
create table app_users (
  id uuid default gen_random_uuid() primary key,
  username text not null,
  role text check (role in ('boss', 'guest', 'admin')) not null,
  rank text check (rank in ('S', 'A', 'B', 'C', 'None')) not null,
  status text check (status in ('active', 'banned')) default 'active',
  last_login timestamptz default now(),
  secret_key text unique not null,
  created_at timestamptz default now()
);

-- Profiles Table (Girls)
create table profiles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  rank text check (rank in ('S', 'A', 'B', 'C')) not null,
  class_type text,
  description text,
  location text,
  age int,
  height int,
  weight int,
  cup text,
  occupation text,
  
  -- Private Info
  is_virgin boolean default false,
  period_date text,
  tattoo_smoke text,
  
  -- Limits
  limits text,
  accept_sm boolean default false,
  no_condom boolean default false,
  creampie boolean default false,
  oral boolean default false,
  
  -- Service
  live_together boolean default false,
  overnight boolean default false,
  travel text,
  
  -- Financial
  monthly_budget text,
  monthly_days text,
  short_term_budget text,
  payment_split text,
  
  -- Other
  reason text,
  start_time text,
  bonus text,
  
  -- Stats (JSONB for flexibility)
  stats jsonb default '{"charm": 80, "intelligence": 80, "agility": 80}'::jsonb,
  
  price text,
  images text[], -- Array of image URLs from Vercel Blob
  availability text check (availability in ('Available', 'On Mission', 'Resting')) default 'Available',
  
  created_at timestamptz default now()
);

-- Admins Table (Simple custom auth for admin)
create table admins (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password text not null, -- In real app, this should be hashed
  secret_key text unique not null,
  created_at timestamptz default now()
);

-- RLS Policies (Row Level Security) - Optional but recommended
alter table app_users enable row level security;
alter table profiles enable row level security;
alter table admins enable row level security;

-- For this demo, we might allow public read/write to simplify, 
-- but normally you'd lock this down.
create policy "Public Access" on app_users for all using (true);
create policy "Public Access" on profiles for all using (true);
create policy "Public Access" on admins for all using (true);
