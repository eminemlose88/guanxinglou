-- SECURITY HARDENING SCRIPT
-- Run this in Supabase SQL Editor to lock down your database

-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop any insecure "Public Access" policies if they exist
DROP POLICY IF EXISTS "Public Access" ON app_users;
DROP POLICY IF EXISTS "Public Access" ON admins;
DROP POLICY IF EXISTS "Public Access" ON profiles;

-- 3. Create Safe Policies
-- Profiles: Public can READ, but NOT write (Write is handled via secure RPC)
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);

-- App Users & Admins: NO public access policies.
-- This means `supabase.from('app_users').select('*')` will now return 0 rows for hackers.
-- Access is only granted via the "Security Definer" functions below.

-- 4. Create Secure Functions (RPC)
-- These functions run with elevated privileges (SECURITY DEFINER) to bypass RLS checks
-- but they only return data if the specific logic (key check) passes.

-- RPC: User Login
CREATE OR REPLACE FUNCTION verify_user_key(input_key text)
RETURNS SETOF app_users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only return the user if the key matches exactly and is active
  RETURN QUERY SELECT * FROM app_users WHERE secret_key = input_key AND status = 'active';
END;
$$;

-- RPC: Admin Login
CREATE OR REPLACE FUNCTION verify_admin_login(input_secret_key text, input_password text)
RETURNS SETOF admins
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM admins WHERE secret_key = input_secret_key AND password = input_password;
END;
$$;

-- RPC: Admin Profile Operations (Create/Update/Delete)
CREATE OR REPLACE FUNCTION admin_cud_profile(
    admin_secret text,
    operation_type text, -- 'INSERT', 'UPDATE', 'DELETE', 'RESTORE', 'HARD_DELETE'
    profile_data jsonb DEFAULT '{}'::jsonb,
    target_id uuid DEFAULT null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin boolean;
    result_record jsonb;
    new_id uuid;
BEGIN
    -- 1. Verify Admin Key
    SELECT EXISTS(SELECT 1 FROM admins WHERE secret_key = admin_secret) INTO is_admin;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Access Denied: Invalid Admin Key';
    END IF;

    -- 2. Perform Operation
    IF operation_type = 'INSERT' THEN
        INSERT INTO profiles (
            name, rank, class_type, description, location, age, height, weight, cup, occupation,
            is_virgin, period_date, tattoo_smoke, limits, accept_sm, no_condom, creampie, oral,
            live_together, overnight, travel, monthly_budget, monthly_days, short_term_budget,
            payment_split, reason, start_time, bonus, stats, price, images, videos, availability, is_deleted
        ) VALUES (
            profile_data->>'name',
            profile_data->>'rank',
            profile_data->>'classType',
            profile_data->>'description',
            profile_data->>'location',
            (profile_data->>'age')::int,
            (profile_data->>'height')::int,
            (profile_data->>'weight')::int,
            profile_data->>'cup',
            profile_data->>'occupation',
            (profile_data->>'isVirgin')::boolean,
            profile_data->>'periodDate',
            profile_data->>'tattooSmoke',
            profile_data->>'limits',
            (profile_data->>'acceptSM')::boolean,
            (profile_data->>'noCondom')::boolean,
            (profile_data->>'creampie')::boolean,
            (profile_data->>'oral')::boolean,
            (profile_data->>'liveTogether')::boolean,
            (profile_data->>'overnight')::boolean,
            profile_data->>'travel',
            profile_data->>'monthlyBudget',
            profile_data->>'monthlyDays',
            profile_data->>'shortTermBudget',
            profile_data->>'paymentSplit',
            profile_data->>'reason',
            profile_data->>'startTime',
            profile_data->>'bonus',
            (profile_data->>'stats')::jsonb,
            profile_data->>'price',
            (SELECT array_agg(x) FROM jsonb_array_elements_text(profile_data->'images') t(x)),
            (SELECT array_agg(x) FROM jsonb_array_elements_text(profile_data->'videos') t(x)),
            profile_data->>'availability',
            false
        ) RETURNING id INTO new_id;
        
        SELECT to_jsonb(p.*) FROM profiles p WHERE id = new_id INTO result_record;
        
    ELSIF operation_type = 'UPDATE' THEN
        UPDATE profiles SET
            name = COALESCE(profile_data->>'name', name),
            rank = COALESCE(profile_data->>'rank', rank),
            class_type = COALESCE(profile_data->>'classType', class_type),
            description = COALESCE(profile_data->>'description', description),
            location = COALESCE(profile_data->>'location', location),
            age = COALESCE((profile_data->>'age')::int, age),
            height = COALESCE((profile_data->>'height')::int, height),
            weight = COALESCE((profile_data->>'weight')::int, weight),
            cup = COALESCE(profile_data->>'cup', cup),
            occupation = COALESCE(profile_data->>'occupation', occupation),
            is_virgin = COALESCE((profile_data->>'isVirgin')::boolean, is_virgin),
            period_date = COALESCE(profile_data->>'periodDate', period_date),
            tattoo_smoke = COALESCE(profile_data->>'tattooSmoke', tattoo_smoke),
            limits = COALESCE(profile_data->>'limits', limits),
            accept_sm = COALESCE((profile_data->>'acceptSM')::boolean, accept_sm),
            no_condom = COALESCE((profile_data->>'noCondom')::boolean, no_condom),
            creampie = COALESCE((profile_data->>'creampie')::boolean, creampie),
            oral = COALESCE((profile_data->>'oral')::boolean, oral),
            live_together = COALESCE((profile_data->>'liveTogether')::boolean, live_together),
            overnight = COALESCE((profile_data->>'overnight')::boolean, overnight),
            travel = COALESCE(profile_data->>'travel', travel),
            monthly_budget = COALESCE(profile_data->>'monthlyBudget', monthly_budget),
            monthly_days = COALESCE(profile_data->>'monthlyDays', monthly_days),
            short_term_budget = COALESCE(profile_data->>'shortTermBudget', short_term_budget),
            payment_split = COALESCE(profile_data->>'paymentSplit', payment_split),
            reason = COALESCE(profile_data->>'reason', reason),
            start_time = COALESCE(profile_data->>'startTime', start_time),
            bonus = COALESCE(profile_data->>'bonus', bonus),
            stats = COALESCE((profile_data->>'stats')::jsonb, stats),
            price = COALESCE(profile_data->>'price', price),
            images = CASE WHEN profile_data ? 'images' THEN (SELECT array_agg(x) FROM jsonb_array_elements_text(profile_data->'images') t(x)) ELSE images END,
            videos = CASE WHEN profile_data ? 'videos' THEN (SELECT array_agg(x) FROM jsonb_array_elements_text(profile_data->'videos') t(x)) ELSE videos END,
            availability = COALESCE(profile_data->>'availability', availability)
        WHERE id = target_id
        RETURNING to_jsonb(profiles.*) INTO result_record;

    ELSIF operation_type = 'DELETE' THEN
        UPDATE profiles SET is_deleted = true WHERE id = target_id
        RETURNING to_jsonb(profiles.*) INTO result_record;

    ELSIF operation_type = 'RESTORE' THEN
        UPDATE profiles SET is_deleted = false WHERE id = target_id
        RETURNING to_jsonb(profiles.*) INTO result_record;

    ELSIF operation_type = 'HARD_DELETE' THEN
        DELETE FROM profiles WHERE id = target_id
        RETURNING jsonb_build_object('id', target_id, 'status', 'deleted') INTO result_record;
        
    END IF;

    RETURN result_record;
END;
$$;

-- RPC: Admin Manage User (Rank/Status)
CREATE OR REPLACE FUNCTION admin_manage_user(
    admin_secret text,
    target_user_id uuid,
    new_rank text DEFAULT null,
    new_status text DEFAULT null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin boolean;
    result_record jsonb;
BEGIN
    -- Verify Admin
    SELECT EXISTS(SELECT 1 FROM admins WHERE secret_key = admin_secret) INTO is_admin;
    IF NOT is_admin THEN RAISE EXCEPTION 'Access Denied'; END IF;

    UPDATE app_users SET
        rank = COALESCE(new_rank, rank),
        status = COALESCE(new_status, status)
    WHERE id = target_user_id
    RETURNING to_jsonb(app_users.*) INTO result_record;
    
    RETURN result_record;
END;
$$;

-- RPC: Admin List Users
CREATE OR REPLACE FUNCTION admin_list_users(admin_secret text)
RETURNS SETOF app_users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin boolean;
BEGIN
    SELECT EXISTS(SELECT 1 FROM admins WHERE secret_key = admin_secret) INTO is_admin;
    IF NOT is_admin THEN RAISE EXCEPTION 'Access Denied'; END IF;

    RETURN QUERY SELECT * FROM app_users ORDER BY created_at DESC;
END;
$$;
