-- Add status column to group_members table
ALTER TABLE public.group_members
ADD COLUMN IF NOT EXISTS status member_status DEFAULT 'pending';

-- Update existing records to have 'active' status
UPDATE public.group_members
SET status = 'active'
WHERE status IS NULL OR status = 'pending';

-- Create materialized view for active memberships
CREATE MATERIALIZED VIEW IF NOT EXISTS active_group_memberships AS
SELECT DISTINCT group_id, user_id
FROM group_members
WHERE status = 'active';

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_active_memberships 
ON active_group_memberships(group_id, user_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_active_memberships()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY active_group_memberships;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh materialized view
DROP TRIGGER IF EXISTS refresh_active_memberships_trigger ON group_members;
CREATE TRIGGER refresh_active_memberships_trigger
    AFTER INSERT OR UPDATE OR DELETE ON group_members
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_active_memberships();

-- Update the create_owner_member trigger function
CREATE OR REPLACE FUNCTION public.create_owner_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO group_members (group_id, user_id, role, status)
    VALUES (NEW.id, NEW.created_by, 'admin', 'active');
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS group_creator_as_owner ON groups;
CREATE TRIGGER group_creator_as_owner
    AFTER INSERT ON groups
    FOR EACH ROW
    EXECUTE FUNCTION create_owner_member();

-- Drop all existing policies
DROP POLICY IF EXISTS "read_group_members" ON group_members;
DROP POLICY IF EXISTS "insert_group_members" ON group_members;
DROP POLICY IF EXISTS "update_group_members" ON group_members;
DROP POLICY IF EXISTS "delete_group_members" ON group_members;

-- Enable RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Create simplified policies using materialized view
CREATE POLICY "read_group_members"
    ON group_members FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR
        (group_id, auth.uid()) IN (
            SELECT group_id, user_id 
            FROM active_group_memberships
        )
        OR
        group_id IN (
            SELECT id 
            FROM groups 
            WHERE privacy = 'public'
        )
    );

CREATE POLICY "insert_group_members"
    ON group_members FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 
            FROM group_members 
            WHERE group_id = group_members.group_id 
            AND user_id = auth.uid()
        )
        AND group_id IN (
            SELECT id 
            FROM groups 
            WHERE privacy = 'public'
        )
    );

CREATE POLICY "update_group_members"
    ON group_members FOR UPDATE
    TO authenticated
    USING (
        (group_id, auth.uid()) IN (
            SELECT group_id, user_id 
            FROM active_group_memberships
            WHERE user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 
            FROM group_members 
            WHERE group_id = group_members.group_id
            AND user_id = auth.uid()
            AND role = 'admin'
            AND status = 'active'
        )
    );

CREATE POLICY "delete_group_members"
    ON group_members FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid()
        OR
        (group_id, auth.uid()) IN (
            SELECT group_id, user_id 
            FROM active_group_memberships
            WHERE user_id = auth.uid()
            AND EXISTS (
                SELECT 1 
                FROM group_members 
                WHERE group_id = group_members.group_id
                AND user_id = auth.uid()
                AND role = 'admin'
                AND status = 'active'
            )
        )
    );

-- Ensure profiles table has appropriate policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Add comments
COMMENT ON TABLE group_members IS 'Stores group membership information with status tracking';
COMMENT ON COLUMN group_members.status IS 'Member status: pending, active, or blocked';
COMMENT ON MATERIALIZED VIEW active_group_memberships IS 'Cached view of active group memberships to avoid recursion in policies';