-- RATE LIMITING & SECURITY LOGS
-- Prevents brute-force and malicious registration

-- 1. Create Security Logs Table
CREATE TABLE IF NOT EXISTS auth_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT,
    event_type TEXT, -- 'LOGIN_ATTEMPT', 'REGISTER_ATTEMPT', 'ADMIN_LOGIN'
    identifier TEXT, -- Username or Key tried
    status TEXT, -- 'SUCCESS', 'FAILURE'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Admins only)
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- 2. Helper Function to Get Client IP
-- Extracts IP from Supabase request headers
CREATE OR REPLACE FUNCTION get_request_ip()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    -- Try to get CF-Connecting-IP (Cloudflare) first, then X-Forwarded-For
    RETURN COALESCE(
        current_setting('request.headers', true)::json->>'cf-connecting-ip',
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        'unknown'
    );
END;
$$;

-- 3. Rate Limit Check Function
-- Returns TRUE if allowed, FALSE if blocked
CREATE OR REPLACE FUNCTION check_rate_limit(
    check_ip TEXT,
    check_type TEXT,
    max_attempts INT,
    window_minutes INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    recent_failures INT;
BEGIN
    SELECT COUNT(*)
    INTO recent_failures
    FROM auth_logs
    WHERE 
        ip_address = check_ip 
        AND event_type = check_type 
        AND status = 'FAILURE'
        AND created_at > (NOW() - (window_minutes || ' minutes')::INTERVAL);
        
    RETURN recent_failures < max_attempts;
END;
$$;

-- 4. Update Verify User Key (Login) with Rate Limiting
CREATE OR REPLACE FUNCTION verify_user_key(input_key text)
RETURNS SETOF app_users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    client_ip TEXT;
    found_user app_users%ROWTYPE;
BEGIN
    client_ip := get_request_ip();

    -- Check Rate Limit (e.g., 5 failures in 15 mins)
    IF NOT check_rate_limit(client_ip, 'LOGIN_ATTEMPT', 5, 15) THEN
        RAISE EXCEPTION 'Too many login attempts. Please try again later.';
    END IF;

    -- Attempt Login
    SELECT * INTO found_user FROM app_users WHERE secret_key = input_key AND status = 'active';

    IF found_user.id IS NOT NULL THEN
        -- Log Success (Optional: Can skip to save space, or log for audit)
        INSERT INTO auth_logs (ip_address, event_type, identifier, status)
        VALUES (client_ip, 'LOGIN_ATTEMPT', 'HIDDEN_KEY', 'SUCCESS');
        
        RETURN NEXT found_user;
    ELSE
        -- Log Failure
        INSERT INTO auth_logs (ip_address, event_type, identifier, status)
        VALUES (client_ip, 'LOGIN_ATTEMPT', 'HIDDEN_KEY', 'FAILURE');
        
        -- Return Empty (Default behavior of SETOF when no rows returned)
        RETURN; 
    END IF;
END;
$$;

-- 5. Update Admin Login with Rate Limiting
CREATE OR REPLACE FUNCTION verify_admin_login(input_secret_key text, input_password text)
RETURNS SETOF admins
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    client_ip TEXT;
    found_admin admins%ROWTYPE;
BEGIN
    client_ip := get_request_ip();

    -- Stricter Limit for Admin: 3 failures in 30 mins
    IF NOT check_rate_limit(client_ip, 'ADMIN_LOGIN', 3, 30) THEN
        RAISE EXCEPTION 'Access Locked. Too many failed attempts.';
    END IF;

    SELECT * INTO found_admin FROM admins WHERE secret_key = input_secret_key AND password = input_password;

    IF found_admin.id IS NOT NULL THEN
        INSERT INTO auth_logs (ip_address, event_type, identifier, status)
        VALUES (client_ip, 'ADMIN_LOGIN', 'ADMIN', 'SUCCESS');
        RETURN NEXT found_admin;
    ELSE
        INSERT INTO auth_logs (ip_address, event_type, identifier, status)
        VALUES (client_ip, 'ADMIN_LOGIN', 'ADMIN', 'FAILURE');
        RETURN;
    END IF;
END;
$$;

-- 6. Secure Registration (Prevent Spam)
-- Note: This replaces the direct INSERT permission for public.
-- We should REVOKE public insert on app_users if we use this.
CREATE OR REPLACE FUNCTION secure_register_user(
    input_username text,
    input_secret_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    client_ip TEXT;
    new_user_record jsonb;
BEGIN
    client_ip := get_request_ip();

    -- Rate Limit Registration: Max 2 registrations per IP per 24 hours
    -- We check 'SUCCESS' logs here because successful registrations are the concern for spam
    IF (SELECT COUNT(*) FROM auth_logs 
        WHERE ip_address = client_ip 
        AND event_type = 'REGISTER_ATTEMPT' 
        AND status = 'SUCCESS' 
        AND created_at > (NOW() - INTERVAL '24 hours')) >= 2 THEN
        
        RAISE EXCEPTION 'Registration limit reached for this IP.';
    END IF;

    -- Perform Registration
    INSERT INTO app_users (username, secret_key, role, rank, status, last_login)
    VALUES (input_username, input_secret_key, 'boss', 'Common', 'active', NOW())
    RETURNING to_jsonb(app_users.*) INTO new_user_record;

    -- Log Success
    INSERT INTO auth_logs (ip_address, event_type, identifier, status)
    VALUES (client_ip, 'REGISTER_ATTEMPT', input_username, 'SUCCESS');

    RETURN new_user_record;
EXCEPTION WHEN OTHERS THEN
    -- Log Failure (e.g. unique constraint violation)
    INSERT INTO auth_logs (ip_address, event_type, identifier, status)
    VALUES (client_ip, 'REGISTER_ATTEMPT', input_username, 'FAILURE');
    RAISE;
END;
$$;

-- 7. Revoke Public Insert on app_users (Force use of secure_register_user)
REVOKE INSERT ON app_users FROM public;
REVOKE INSERT ON app_users FROM anon;
REVOKE INSERT ON app_users FROM authenticated;
