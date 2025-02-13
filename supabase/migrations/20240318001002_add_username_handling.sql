-- Drop existing functions and triggers first
DROP TRIGGER IF EXISTS ensure_username_format_trigger ON profiles;
DROP FUNCTION IF EXISTS public.ensure_username_format();
DROP FUNCTION IF EXISTS public.claim_username(text, uuid);
DROP FUNCTION IF EXISTS public.is_username_available(text);

-- Add username column and constraints to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Create an index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Function to check if a username is available
CREATE FUNCTION public.is_username_available(username_to_check TEXT)
RETURNS TABLE (available BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if username is valid (alphanumeric, dots, and underscores only)
  IF username_to_check !~ '^[a-zA-Z0-9._]+$' THEN
    RETURN QUERY SELECT false;
    RETURN;
  END IF;

  -- Check if username is too short or too long
  IF length(username_to_check) < 3 OR length(username_to_check) > 30 THEN
    RETURN QUERY SELECT false;
    RETURN;
  END IF;

  -- Check if username is available
  RETURN QUERY
    SELECT NOT EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE username = username_to_check
    );
END;
$$;

-- Function to claim a username
CREATE FUNCTION public.claim_username(username_to_claim TEXT, user_id_to_set UUID)
RETURNS TABLE (success BOOLEAN, error TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_available BOOLEAN;
BEGIN
  -- First check if username is available using our existing function
  SELECT available INTO is_available FROM public.is_username_available(username_to_claim);
  
  IF NOT is_available THEN
    RETURN QUERY SELECT false, 'Username is not available'::TEXT;
    RETURN;
  END IF;

  -- Try to update the profile
  BEGIN
    UPDATE profiles 
    SET username = username_to_claim,
        updated_at = NOW()
    WHERE id = user_id_to_set
    AND (username IS NULL OR username != username_to_claim);

    IF FOUND THEN
      RETURN QUERY SELECT true, NULL::TEXT;
    ELSE
      RETURN QUERY SELECT false, 'Failed to update username'::TEXT;
    END IF;
  EXCEPTION 
    WHEN unique_violation THEN
      RETURN QUERY SELECT false, 'Username was claimed by another user'::TEXT;
    WHEN OTHERS THEN
      RETURN QUERY SELECT false, SQLERRM;
  END;
END;
$$;

-- Create a trigger to ensure username format consistency
CREATE FUNCTION public.ensure_username_format()
RETURNS TRIGGER AS $$
BEGIN
  -- Convert username to lowercase
  NEW.username := LOWER(NEW.username);
  
  -- Ensure username matches our requirements
  IF NEW.username !~ '^[a-z0-9._]+$' THEN
    RAISE EXCEPTION 'Username can only contain letters, numbers, dots, and underscores';
  END IF;
  
  IF length(NEW.username) < 3 THEN
    RAISE EXCEPTION 'Username must be at least 3 characters long';
  END IF;
  
  IF length(NEW.username) > 30 THEN
    RAISE EXCEPTION 'Username cannot be longer than 30 characters';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_username_format_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_username_format();

-- Add RLS policies for username functions
ALTER FUNCTION public.is_username_available SECURITY DEFINER;
ALTER FUNCTION public.claim_username SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.is_username_available TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_username TO authenticated; 