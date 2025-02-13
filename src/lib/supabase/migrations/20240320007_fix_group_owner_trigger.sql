-- Fix the create_owner_member trigger function to use SECURITY DEFINER and set search path
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

-- Drop and recreate the trigger to ensure it's using the updated function
DROP TRIGGER IF EXISTS group_creator_as_owner ON groups;
CREATE TRIGGER group_creator_as_owner
    AFTER INSERT ON groups
    FOR EACH ROW
    EXECUTE FUNCTION create_owner_member();

-- Add comment explaining the security settings
COMMENT ON FUNCTION public.create_owner_member IS 'Automatically makes the group creator an admin member with active status. Uses SECURITY DEFINER and fixed search path for security.'; 