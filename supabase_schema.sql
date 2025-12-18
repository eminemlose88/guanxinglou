-- Users Table (renamed to app_users to avoid conflict with Supabase Auth)
create table app_users (
  id uuid default gen_random_uuid() primary key,
  username text not null,
  role text check (role in ('boss', 'guest', 'admin')) not null,
  rank text check (rank in ('S', 'A', 'B', 'C', 'None', 'VIP', 'Common')) not null,
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
  videos text[], -- Array of video URLs from Vercel Blob
  availability text check (availability in ('Available', 'On Mission', 'Resting')) default 'Available',
  is_deleted boolean default false,
  
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

-- Insert Mock Data (Profiles)
insert into profiles (
  name, rank, class_type, description, location, age, height, weight, cup, occupation,
  is_virgin, period_date, tattoo_smoke, limits, accept_sm, no_condom, creampie, oral,
  live_together, overnight, travel, monthly_budget, monthly_days, short_term_budget,
  payment_split, reason, start_time, bonus, stats, price, images, videos, availability
) values
(
  '塞拉菲娜', 'S', 'Mage', '深渊之星。以优雅和毁灭性的智慧闻名。', '安徽 合肥', 22, 172, 50, 'D', '平面模特',
  false, '15号', '无', '不接受多人', false, true, true, true,
  true, true, '可飞全球', '10W', '15天', '1.5W',
  '见人付半', '想买房', '随时', '皮肤超白，会跳芭蕾，声音好听', '{"charm": 98, "intelligence": 95, "agility": 80}', '100,000 RMB/月', ARRAY['/placeholders/seraphina.jpg'], ARRAY[]::text[], 'Available'
),
(
  '尤娜', 'A', 'Healer', '温柔的灵魂，拥有抚慰疲惫旅人的力量。', '上海', 20, 165, 48, 'C', '学生',
  true, '5号', '无', '不接受变态玩法', false, false, false, true,
  false, true, '仅限江浙沪', '5W', '8天', '8k',
  '全款', '学费', '周末', '极品清纯，听话懂事', '{"charm": 92, "intelligence": 85, "agility": 70}', '50,000 RMB/月', ARRAY['/placeholders/yuna.jpg'], ARRAY[]::text[], 'On Mission'
),
(
  '小雅', 'B', 'Healer', '成熟稳重，性格开朗，能够提供极佳的情绪价值。', '安徽 合肥巢湖', 32, 165, 75, 'C', '无业',
  false, '7号', '有小面积', '别太凶', false, true, true, true,
  true, true, '最好周边', '协商', '3-5天', '3k-5k',
  '2次', '穷', '都行', '事少 性格开朗乐观，胸大，活好，欲望强，上下粉嫩', '{"charm": 85, "intelligence": 80, "agility": 60}', '3,000 - 5,000 RMB/短期', ARRAY['/placeholders/xiaoya.jpg'], ARRAY[]::text[], 'Available'
);

-- Insert Mock Data (Users)
insert into app_users (username, role, rank, status, last_login, secret_key) values
('vip_boss', 'boss', 'VIP', 'active', now(), 'key-vip-boss'),
('common_user', 'boss', 'Common', 'active', now(), 'key-common-user'),
('boss_s_01', 'boss', 'S', 'active', now(), 'key-s-boss'),
('vip_a_02', 'boss', 'A', 'active', now(), 'key-a-vip');

-- Insert Mock Data (Admins)
insert into admins (username, password, secret_key) values
('admin', 'admin', 'star-key-2024');
