-- Drop existing tables (in correct order due to dependencies)
DROP TABLE IF EXISTS discussion_likes CASCADE;
DROP TABLE IF EXISTS discussion_replies CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop and recreate types
DROP TYPE IF EXISTS group_privacy CASCADE;
DROP TYPE IF EXISTS member_role CASCADE;
DROP TYPE IF EXISTS member_status CASCADE;

-- Common Types and Enums
CREATE TYPE group_privacy AS ENUM ('public', 'private', 'secret');
CREATE TYPE member_role AS ENUM ('member', 'moderator', 'admin');
CREATE TYPE member_status AS ENUM ('pending', 'active', 'blocked');

-- Create profiles table first
CREATE TABLE profiles (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    username text UNIQUE,
    email text,
    display_name text,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Base Tables
CREATE TABLE groups (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    description text,
    privacy group_privacy NOT NULL DEFAULT 'public',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar_url text,
    categories text[] DEFAULT '{}',
    cover_image text,
    last_activity_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(name)
);

CREATE TABLE group_members (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    group_id bigint REFERENCES groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'member',
    status member_status NOT NULL DEFAULT 'pending',
    joined_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- Helper Functions
CREATE OR REPLACE FUNCTION is_group_creator(group_id bigint) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM groups
        WHERE id = group_id
        AND created_by = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_public_group(group_id bigint) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM groups
        WHERE id = group_id
        AND privacy = 'public'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_group_admin(group_id bigint) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM group_members
        WHERE group_id = group_id
        AND user_id = auth.uid()
        AND role IN ('moderator', 'admin')
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check multiple usernames availability at once
CREATE OR REPLACE FUNCTION check_usernames_availability(usernames text[])
RETURNS TABLE (username text, available boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.username,
    NOT EXISTS (
      SELECT 1 
      FROM profiles p 
      WHERE p.username = u.username
    ) AND u.username ~ '^[a-zA-Z0-9._]+$'
    AND length(u.username) BETWEEN 3 AND 30
  FROM unnest(usernames) AS u(username);
END;
$$;

-- Optimized Indexes
CREATE INDEX IF NOT EXISTS idx_group_members_composite 
ON group_members(group_id, user_id, role, status);
CREATE INDEX IF NOT EXISTS idx_groups_composite 
ON groups(privacy, created_by);

-- Unified Policies
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Drop existing policies
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
DROP POLICY IF EXISTS "groups_modify_policy" ON groups;
DROP POLICY IF EXISTS "members_select_policy" ON group_members;
DROP POLICY IF EXISTS "members_insert_policy" ON group_members;
DROP POLICY IF EXISTS "members_modify_policy" ON group_members;

-- Groups select policy
CREATE POLICY "groups_select_policy" ON groups
FOR SELECT USING (
    privacy = 'public'
    OR created_by = auth.uid()
);

-- Groups modify policy
CREATE POLICY "groups_modify_policy" ON groups
FOR ALL USING (
    created_by = auth.uid()
);

-- Members select policy
CREATE POLICY "members_select_policy" ON group_members
FOR SELECT USING (true);

-- Members insert policy
CREATE POLICY "members_insert_policy" ON group_members
FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

-- Members modify policy
CREATE POLICY "members_modify_policy" ON group_members
FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('moderator', 'admin')
        AND gm.status = 'active'
    )
);

-- Triggers for Updated At
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger to make group creator an owner
CREATE OR REPLACE FUNCTION create_owner_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO group_members (group_id, user_id, role, status)
    VALUES (NEW.id, NEW.created_by, 'admin', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER group_creator_as_owner
    AFTER INSERT ON groups
    FOR EACH ROW
    EXECUTE FUNCTION create_owner_member();

-- Permissions
GRANT ALL ON groups TO authenticated;
GRANT ALL ON group_members TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 