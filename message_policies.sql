-- Create Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread', -- 'unread', 'read', 'archived'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Public can INSERT messages (Anonymous Guestbook)
CREATE POLICY "Public Insert Messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- 2. Only Admins can SELECT (Read) messages
-- We'll use the existing "admins" table to verify, or reuse the secure RPC approach if we want to be strict.
-- However, for RLS simplicity, let's create a policy that checks if the user is an admin.
-- Wait, our auth is custom (secret key in local storage/store), not Supabase Auth.
-- So we CANNOT use `auth.uid()`.
-- We must use the **Secure RPC** approach for reading messages, similar to how we handled profiles/users.
-- So we will NOT add a SELECT policy for public.
-- We will creating a "Public Access" policy that is FALSE for SELECT (default is deny anyway).

-- 3. Secure RPCs for Admin Management

-- RPC: Admin Fetch Messages (with pagination)
CREATE OR REPLACE FUNCTION admin_get_messages(
    admin_secret text,
    page int DEFAULT 1,
    page_size int DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    contact_info TEXT,
    message TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin boolean;
    offset_val int;
    total_rows bigint;
BEGIN
    -- Verify Admin
    SELECT EXISTS(SELECT 1 FROM admins WHERE secret_key = admin_secret) INTO is_admin;
    IF NOT is_admin THEN RAISE EXCEPTION 'Access Denied'; END IF;

    offset_val := (page - 1) * page_size;
    
    -- Get Total Count (for pagination)
    SELECT COUNT(*) FROM contact_messages WHERE is_deleted = false INTO total_rows;

    RETURN QUERY 
    SELECT 
        m.id, m.name, m.contact_info, m.message, m.status, m.created_at, total_rows
    FROM contact_messages m
    WHERE m.is_deleted = false
    ORDER BY m.created_at DESC
    LIMIT page_size OFFSET offset_val;
END;
$$;

-- RPC: Admin Update Message Status / Delete
CREATE OR REPLACE FUNCTION admin_manage_message(
    admin_secret text,
    target_id uuid,
    action_type text -- 'MARK_READ', 'DELETE'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin boolean;
BEGIN
    SELECT EXISTS(SELECT 1 FROM admins WHERE secret_key = admin_secret) INTO is_admin;
    IF NOT is_admin THEN RAISE EXCEPTION 'Access Denied'; END IF;

    IF action_type = 'MARK_READ' THEN
        UPDATE contact_messages SET status = 'read' WHERE id = target_id;
    ELSIF action_type = 'DELETE' THEN
        UPDATE contact_messages SET is_deleted = true WHERE id = target_id;
    END IF;

    RETURN TRUE;
END;
$$;
