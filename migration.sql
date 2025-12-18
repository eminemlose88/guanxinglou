-- Migration Script: Align Database with New "No Rank" / "VIP System"
-- Run this in your Supabase SQL Editor

-- 1. Update Profiles (Girls)
-- Remove the strict S/A/B/C constraint first
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_rank_check;

-- Set all existing profiles to a generic 'Common' rank (or 'Default') since we don't distinguish them anymore
UPDATE profiles SET rank = 'Common';

-- Optionally add a new constraint if you want to enforce specific values, or just leave it as text
-- ALTER TABLE profiles ADD CONSTRAINT profiles_rank_check CHECK (rank IN ('Common', 'Featured'));


-- 2. Update Users (App Users)
-- Remove the old constraint
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_rank_check;

-- Migrate old ranks to new VIP/Common system
-- S and A become VIP
UPDATE app_users SET rank = 'VIP' WHERE rank IN ('S', 'A');

-- B, C, and others become Common
UPDATE app_users SET rank = 'Common' WHERE rank IN ('B', 'C', 'None');

-- Add new strict constraint
ALTER TABLE app_users ADD CONSTRAINT app_users_rank_check CHECK (rank IN ('VIP', 'Common'));

-- 3. Cleanup (Optional)
-- If you want to remove the 'class_type' or other legacy RPG fields from profiles, you can do it here,
-- but keeping them doesn't hurt.
