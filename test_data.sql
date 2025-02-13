

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."component_type" AS ENUM (
    'page',
    'layout',
    'feature',
    'ui',
    'form',
    'modal',
    'card',
    'button',
    'input'
);


ALTER TYPE "public"."component_type" OWNER TO "postgres";


CREATE TYPE "public"."group_privacy" AS ENUM (
    'public',
    'private',
    'invite'
);


ALTER TYPE "public"."group_privacy" OWNER TO "postgres";


CREATE TYPE "public"."member_role" AS ENUM (
    'admin',
    'moderator',
    'member'
);


ALTER TYPE "public"."member_role" OWNER TO "postgres";


CREATE TYPE "public"."member_status" AS ENUM (
    'active',
    'pending',
    'blocked'
);


ALTER TYPE "public"."member_status" OWNER TO "postgres";


CREATE TYPE "public"."post_type" AS ENUM (
    'text',
    'image',
    'link',
    'video'
);


ALTER TYPE "public"."post_type" OWNER TO "postgres";


CREATE TYPE "public"."post_visibility" AS ENUM (
    'public',
    'private',
    'group'
);


ALTER TYPE "public"."post_visibility" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_email_exists"("email_to_check" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Check if email exists in auth.users table
    SELECT EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE LOWER(email) = LOWER(email_to_check)
    ) INTO user_exists;

    -- Return result as jsonb
    RETURN jsonb_build_object(
        'exists', user_exists,
        'email', LOWER(email_to_check)
    );
EXCEPTION WHEN OTHERS THEN
    -- Log error and return error response
    RAISE LOG 'Error in check_email_exists: %', SQLERRM;
    RETURN jsonb_build_object(
        'error', SQLERRM,
        'email', email_to_check
    );
END;
$$;


ALTER FUNCTION "public"."check_email_exists"("email_to_check" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_username_availability"("username_to_check" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM usernames
        WHERE username = username_to_check
    );
END;
$$;


ALTER FUNCTION "public"."check_username_availability"("username_to_check" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_valid_categories"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NOT (SELECT ARRAY(
    SELECT UNNEST(NEW.categories) INTERSECT
    SELECT UNNEST(ARRAY[
      'professional_networking', 'work_team', 'career_development', 'job_opportunities',
      'study_group', 'school_class', 'alumni', 'research', 'skill_development',
      'local_community', 'neighborhood', 'events_meetups', 'sports_recreation',
      'gaming', 'entertainment', 'arts_culture', 'food_cooking', 'travel',
      'support_group', 'mental_health', 'parenting', 'health_wellness',
      'buy_sell', 'marketplace', 'small_business', 'startups',
      'tech_general', 'programming', 'digital_creation', 'crypto_blockchain',
      'other', 'general'
    ])
  ) = NEW.categories) THEN
    RAISE EXCEPTION 'Invalid category found in categories array';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_valid_categories"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_username"("username_to_claim" "text", "user_id_to_set" "uuid") RETURNS TABLE("success" boolean, "error" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."claim_username"("username_to_claim" "text", "user_id_to_set" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_profile"("user_id" "uuid", "user_email" "text", "user_full_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (user_id, user_email, user_full_name)
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
END;
$$;


ALTER FUNCTION "public"."create_new_profile"("user_id" "uuid", "user_email" "text", "user_full_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_username_format"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
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
$_$;


ALTER FUNCTION "public"."ensure_username_format"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."follow_user"("_follower_id" "uuid", "_following_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    _following_count INTEGER;
    _followers_count INTEGER;
BEGIN
    -- Validate input
    IF _follower_id = _following_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot follow yourself');
    END IF;

    -- Check if already following
    IF EXISTS (
        SELECT 1 FROM public.followers
        WHERE follower_id = _follower_id AND following_id = _following_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Already following this user');
    END IF;

    -- Create follow relationship
    INSERT INTO public.followers (follower_id, following_id)
    VALUES (_follower_id, _following_id);

    -- Update counts atomically
    WITH updated_counts AS (
        UPDATE public.follow_counts
        SET 
            following_count = following_count + 1,
            updated_at = NOW()
        WHERE user_id = _follower_id
        RETURNING following_count
    ),
    target_counts AS (
        UPDATE public.follow_counts
        SET 
            followers_count = followers_count + 1,
            updated_at = NOW()
        WHERE user_id = _following_id
        RETURNING followers_count
    )
    SELECT 
        updated_counts.following_count,
        target_counts.followers_count
    INTO _following_count, _followers_count
    FROM updated_counts, target_counts;

    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'following_count', _following_count,
            'followers_count', _followers_count
        )
    );
END;
$$;


ALTER FUNCTION "public"."follow_user"("_follower_id" "uuid", "_following_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_follow_counts"("_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    _counts follow_counts%ROWTYPE;
BEGIN
    -- Get or create follow counts
    INSERT INTO public.follow_counts (user_id)
    VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT * INTO _counts
    FROM public.follow_counts
    WHERE user_id = _user_id;

    RETURN jsonb_build_object(
        'success', true,
        'counts', jsonb_build_object(
            'followers', COALESCE(_counts.followers_count, 0),
            'following', COALESCE(_counts.following_count, 0)
        )
    );
END;
$$;


ALTER FUNCTION "public"."get_follow_counts"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_follow_status"("_user_id" "uuid", "_target_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN jsonb_build_object(
        'success', true,
        'is_following', EXISTS (
            SELECT 1 FROM public.followers
            WHERE follower_id = _user_id 
            AND following_id = _target_id
        )
    );
END;
$$;


ALTER FUNCTION "public"."get_follow_status"("_user_id" "uuid", "_target_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_follower_count"("_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM followers WHERE following_id = _user_id);
END;
$$;


ALTER FUNCTION "public"."get_follower_count"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_following_count"("_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM followers WHERE follower_id = _user_id);
END;
$$;


ALTER FUNCTION "public"."get_following_count"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_groups_count"("_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM group_members gm WHERE gm.user_id = _user_id);
END;
$$;


ALTER FUNCTION "public"."get_groups_count"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_counts"("_user_id" "uuid") RETURNS TABLE("followers_count" integer, "following_count" integer, "groups_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _followers INTEGER;
  _following INTEGER;
  _groups INTEGER;
BEGIN
  -- Get follower count
  SELECT COUNT(*) INTO _followers
  FROM followers
  WHERE following_id = _user_id;

  -- Get following count
  SELECT COUNT(*) INTO _following
  FROM followers
  WHERE follower_id = _user_id;

  -- Get groups count
  SELECT COUNT(*) INTO _groups
  FROM group_members
  WHERE user_id = _user_id;

  -- Return the counts
  RETURN QUERY SELECT 
    COALESCE(_followers, 0)::INTEGER as followers_count,
    COALESCE(_following, 0)::INTEGER as following_count,
    COALESCE(_groups, 0)::INTEGER as groups_count;
END;
$$;


ALTER FUNCTION "public"."get_profile_counts"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_group_count_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if (TG_OP = 'INSERT') then
    -- Increment groups_count for the user
    update public.profiles
    set groups_count = groups_count + 1
    where id = NEW.user_id;
    
  elsif (TG_OP = 'DELETE') then
    -- Decrement groups_count for the user
    update public.profiles
    set groups_count = groups_count - 1
    where id = OLD.user_id;
  end if;
  return null;
end;
$$;


ALTER FUNCTION "public"."handle_group_count_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    first_name,
    last_name,
    email,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    LOWER(SPLIT_PART(NEW.email, '@', 1)), -- Generate username from email
    '', -- Empty first name
    '', -- Empty last name
    LOWER(NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_username_available"("username_to_check" "text") RETURNS TABLE("available" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
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
$_$;


ALTER FUNCTION "public"."is_username_available"("username_to_check" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_all_user_counts"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE profiles p
  SET 
    followers_count = get_follower_count(p.id),
    following_count = get_following_count(p.id),
    groups_count = get_groups_count(p.id);
END;
$$;


ALTER FUNCTION "public"."reset_all_user_counts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_profile_counts"("user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE profiles
    SET 
        followers_count = (
            SELECT COUNT(*)
            FROM followers
            WHERE following_id = user_id
        ),
        following_count = (
            SELECT COUNT(*)
            FROM followers
            WHERE follower_id = user_id
        ),
        groups_count = (
            SELECT COUNT(*)
            FROM group_members
            WHERE user_id = user_id
        )
    WHERE id = user_id;
END;
$$;


ALTER FUNCTION "public"."reset_profile_counts"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_user_counts"("_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE profiles p
  SET 
    followers_count = get_follower_count(_user_id),
    following_count = get_following_count(_user_id),
    groups_count = get_groups_count(_user_id)
  WHERE p.id = _user_id;
END;
$$;


ALTER FUNCTION "public"."reset_user_counts"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_follow_counts"("_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    _followers INTEGER;
    _following INTEGER;
BEGIN
    -- Count actual followers and following
    SELECT 
        COUNT(*) FILTER (WHERE following_id = _user_id),
        COUNT(*) FILTER (WHERE follower_id = _user_id)
    INTO _followers, _following
    FROM public.followers;

    -- Update counts
    INSERT INTO public.follow_counts (user_id, followers_count, following_count, updated_at)
    VALUES (_user_id, _followers, _following, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET 
        followers_count = _followers,
        following_count = _following,
        updated_at = NOW();

    RETURN jsonb_build_object(
        'success', true,
        'counts', jsonb_build_object(
            'followers', _followers,
            'following', _following
        )
    );
END;
$$;


ALTER FUNCTION "public"."sync_follow_counts"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."unfollow_user"("_follower_id" "uuid", "_following_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    _following_count INTEGER;
    _followers_count INTEGER;
BEGIN
    -- Validate input
    IF _follower_id = _following_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot unfollow yourself');
    END IF;

    -- Check if following
    IF NOT EXISTS (
        SELECT 1 FROM public.followers
        WHERE follower_id = _follower_id AND following_id = _following_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not following this user');
    END IF;

    -- Remove follow relationship
    DELETE FROM public.followers
    WHERE follower_id = _follower_id AND following_id = _following_id;

    -- Update counts atomically
    WITH updated_counts AS (
        UPDATE public.follow_counts
        SET 
            following_count = GREATEST(0, following_count - 1),
            updated_at = NOW()
        WHERE user_id = _follower_id
        RETURNING following_count
    ),
    target_counts AS (
        UPDATE public.follow_counts
        SET 
            followers_count = GREATEST(0, followers_count - 1),
            updated_at = NOW()
        WHERE user_id = _following_id
        RETURNING followers_count
    )
    SELECT 
        updated_counts.following_count,
        target_counts.followers_count
    INTO _following_count, _followers_count
    FROM updated_counts, target_counts;

    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'following_count', _following_count,
            'followers_count', _followers_count
        )
    );
END;
$$;


ALTER FUNCTION "public"."unfollow_user"("_follower_id" "uuid", "_following_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_component_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_component_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_follower_counts"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM reset_user_counts(NEW.following_id);
    PERFORM reset_user_counts(NEW.follower_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM reset_user_counts(OLD.following_id);
    PERFORM reset_user_counts(OLD.follower_id);
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_follower_counts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_group_counts"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM reset_user_counts(NEW.user_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM reset_user_counts(OLD.user_id);
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_group_counts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_profile_counts"("profile_id" "uuid") RETURNS TABLE("field_name" "text", "stored_count" integer, "actual_count" integer, "was_fixed" boolean)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    stored_followers INT;
    stored_following INT;
    actual_followers INT;
    actual_following INT;
    fixed_followers BOOLEAN := false;
    fixed_following BOOLEAN := false;
BEGIN
    -- Get stored counts
    SELECT followers_count, following_count 
    INTO stored_followers, stored_following 
    FROM profiles 
    WHERE id = profile_id;

    -- Get actual counts
    SELECT COUNT(*) INTO actual_followers FROM followers WHERE following_id = profile_id;
    SELECT COUNT(*) INTO actual_following FROM followers WHERE follower_id = profile_id;

    -- Fix followers count if needed
    IF stored_followers != actual_followers THEN
        UPDATE profiles 
        SET 
            followers_count = actual_followers,
            updated_at = NOW() + interval '1 microsecond' -- Ensure unique timestamp
        WHERE id = profile_id;
        fixed_followers := true;
    END IF;

    -- Fix following count if needed
    IF stored_following != actual_following THEN
        UPDATE profiles 
        SET 
            following_count = actual_following,
            updated_at = NOW() + interval '1 microsecond' -- Ensure unique timestamp
        WHERE id = profile_id;
        fixed_following := true;
    END IF;

    -- Return results
    RETURN QUERY
    SELECT 'followers'::TEXT, stored_followers, actual_followers, fixed_followers
    UNION ALL
    SELECT 'following'::TEXT, stored_following, actual_following, fixed_following;
END;
$$;


ALTER FUNCTION "public"."verify_profile_counts"("profile_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."components" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "public"."component_type" NOT NULL,
    "file_path" "text" NOT NULL,
    "description" "text" NOT NULL,
    "purpose" "text" NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "is_active" boolean DEFAULT true,
    "version" "text" DEFAULT '1.0.0'::"text",
    "dependencies" "jsonb" DEFAULT '[]'::"jsonb",
    "props_schema" "jsonb" DEFAULT '{}'::"jsonb",
    "usage_examples" "jsonb" DEFAULT '[]'::"jsonb",
    "accessibility" "jsonb" DEFAULT '{}'::"jsonb",
    "accessibility_testing" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."components" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."follow_counts" (
    "user_id" "uuid" NOT NULL,
    "followers_count" integer DEFAULT 0,
    "following_count" integer DEFAULT 0,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."follow_counts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."followers" (
    "follower_id" "uuid" NOT NULL,
    "following_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."followers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_members" (
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."member_role" DEFAULT 'member'::"public"."member_role" NOT NULL,
    "status" "public"."member_status" DEFAULT 'pending'::"public"."member_status" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_roles" (
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."group_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "privacy" "public"."group_privacy" DEFAULT 'public'::"public"."group_privacy" NOT NULL,
    "categories" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "cover_image" "text",
    CONSTRAINT "groups_categories_limit" CHECK (("array_length"("categories", 1) <= 3)),
    CONSTRAINT "groups_description_length" CHECK (("char_length"("description") <= 1000)),
    CONSTRAINT "groups_name_length" CHECK ((("char_length"("name") >= 3) AND ("char_length"("name") <= 100)))
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid",
    "user_id" "uuid",
    "reaction_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "content" "text",
    "post_type" "public"."post_type" DEFAULT 'text'::"public"."post_type",
    "visibility" "public"."post_visibility" DEFAULT 'public'::"public"."post_visibility",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "group_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "edited_at" timestamp with time zone,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "avatar_url" "text",
    "website" "text",
    "bio" "text",
    "followers_count" integer DEFAULT 0,
    "following_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "location" "text",
    "occupation" "text",
    "interests" "text"[],
    "last_seen" timestamp with time zone DEFAULT "now"(),
    "first_name" "text" DEFAULT ''::"text" NOT NULL,
    "last_name" "text" DEFAULT ''::"text" NOT NULL,
    "email" "text",
    "groups_count" integer DEFAULT 0,
    "city" "text" DEFAULT ''::"text",
    "state" "text" DEFAULT ''::"text",
    "country" "text" DEFAULT ''::"text",
    "company" "text" DEFAULT ''::"text",
    "position" "text" DEFAULT ''::"text",
    "phone" "text" DEFAULT ''::"text",
    "skills" "text"[] DEFAULT ARRAY[]::"text"[],
    "education" "jsonb" DEFAULT '[]'::"jsonb",
    "work_experience" "jsonb" DEFAULT '[]'::"jsonb",
    "social_links" "jsonb" DEFAULT '{}'::"jsonb",
    "timezone" "text" DEFAULT ''::"text",
    "languages" "text"[] DEFAULT ARRAY[]::"text"[],
    "date_of_birth" "date"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usernames" (
    "username" "text" NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."usernames" OWNER TO "postgres";


ALTER TABLE ONLY "public"."components"
    ADD CONSTRAINT "components_name_version_key" UNIQUE ("name", "version");



ALTER TABLE ONLY "public"."components"
    ADD CONSTRAINT "components_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."follow_counts"
    ADD CONSTRAINT "follow_counts_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "followers_pkey" PRIMARY KEY ("follower_id", "following_id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("group_id", "user_id");



ALTER TABLE ONLY "public"."group_roles"
    ADD CONSTRAINT "group_roles_pkey" PRIMARY KEY ("group_id", "user_id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_post_id_user_id_reaction_type_key" UNIQUE ("post_id", "user_id", "reaction_type");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."usernames"
    ADD CONSTRAINT "usernames_pkey" PRIMARY KEY ("username");



ALTER TABLE ONLY "public"."usernames"
    ADD CONSTRAINT "usernames_user_id_key" UNIQUE ("user_id");



CREATE INDEX "idx_components_accessibility" ON "public"."components" USING "gin" ("accessibility");



CREATE INDEX "idx_components_created_by" ON "public"."components" USING "btree" ("created_by");



CREATE INDEX "idx_components_dependencies" ON "public"."components" USING "gin" ("dependencies");



CREATE INDEX "idx_components_file_path" ON "public"."components" USING "btree" ("file_path");



CREATE INDEX "idx_components_is_active" ON "public"."components" USING "btree" ("is_active");



CREATE INDEX "idx_components_name" ON "public"."components" USING "btree" ("name");



CREATE INDEX "idx_components_props_schema" ON "public"."components" USING "gin" ("props_schema");



CREATE INDEX "idx_components_type" ON "public"."components" USING "btree" ("type");



CREATE INDEX "idx_followers_composite" ON "public"."followers" USING "btree" ("follower_id", "following_id");



CREATE INDEX "idx_followers_follower" ON "public"."followers" USING "btree" ("follower_id");



CREATE INDEX "idx_followers_following" ON "public"."followers" USING "btree" ("following_id");



CREATE INDEX "idx_group_members_role" ON "public"."group_members" USING "btree" ("role");



CREATE INDEX "idx_group_members_status" ON "public"."group_members" USING "btree" ("status");



CREATE INDEX "idx_group_members_user_id" ON "public"."group_members" USING "btree" ("user_id");



CREATE INDEX "idx_group_roles_user" ON "public"."group_roles" USING "btree" ("user_id");



CREATE INDEX "idx_groups_categories" ON "public"."groups" USING "gin" ("categories");



CREATE INDEX "idx_groups_created_by" ON "public"."groups" USING "btree" ("created_by");



CREATE INDEX "idx_groups_privacy" ON "public"."groups" USING "btree" ("privacy");



CREATE INDEX "idx_post_reactions_post" ON "public"."post_reactions" USING "btree" ("post_id");



CREATE INDEX "idx_post_reactions_user" ON "public"."post_reactions" USING "btree" ("user_id");



CREATE INDEX "idx_posts_author" ON "public"."posts" USING "btree" ("author_id");



CREATE INDEX "idx_posts_created_at" ON "public"."posts" USING "btree" ("created_at");



CREATE INDEX "idx_posts_group" ON "public"."posts" USING "btree" ("group_id");



CREATE INDEX "idx_posts_visibility" ON "public"."posts" USING "btree" ("visibility");



CREATE INDEX "idx_profiles_interests" ON "public"."profiles" USING "gin" ("interests");



CREATE INDEX "idx_profiles_last_seen" ON "public"."profiles" USING "btree" ("last_seen");



CREATE INDEX "idx_profiles_location" ON "public"."profiles" USING "btree" ("location");



CREATE INDEX "idx_profiles_occupation" ON "public"."profiles" USING "btree" ("occupation");



CREATE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "idx_usernames_user_id" ON "public"."usernames" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "ensure_username_format_trigger" BEFORE INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_username_format"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_components_timestamp" BEFORE UPDATE ON "public"."components" FOR EACH ROW EXECUTE FUNCTION "public"."update_component_timestamp"();



CREATE OR REPLACE TRIGGER "update_follower_counts" AFTER INSERT OR DELETE ON "public"."followers" FOR EACH ROW EXECUTE FUNCTION "public"."update_follower_counts"();



CREATE OR REPLACE TRIGGER "update_groups_updated_at" BEFORE UPDATE ON "public"."groups" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."components"
    ADD CONSTRAINT "components_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."components"
    ADD CONSTRAINT "components_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."follow_counts"
    ADD CONSTRAINT "follow_counts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "followers_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "followers_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_roles"
    ADD CONSTRAINT "group_roles_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."group_roles"
    ADD CONSTRAINT "group_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usernames"
    ADD CONSTRAINT "usernames_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can check username existence" ON "public"."usernames" FOR SELECT USING (true);



CREATE POLICY "Anyone can view follow counts" ON "public"."follow_counts" FOR SELECT USING (true);



CREATE POLICY "Anyone can view group roles" ON "public"."group_roles" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create groups" ON "public"."groups" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() IS NOT NULL) AND ("created_by" = "auth"."uid"())));



CREATE POLICY "Authenticated users can insert components" ON "public"."components" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Components are viewable by everyone" ON "public"."components" FOR SELECT USING (true);



CREATE POLICY "Creators can update their components" ON "public"."components" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "created_by") OR (EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."raw_user_meta_data" ->> 'role'::"text") = 'admin'::"text"))))));



CREATE POLICY "Group admins can manage members" ON "public"."group_members" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."group_members" "gm"
  WHERE (("gm"."group_id" = "group_members"."group_id") AND ("gm"."user_id" = "auth"."uid"()) AND ("gm"."role" = 'admin'::"public"."member_role") AND ("gm"."status" = 'active'::"public"."member_status"))))));



CREATE POLICY "Group admins can remove members" ON "public"."group_members" FOR DELETE USING ((("auth"."role"() = 'authenticated'::"text") AND ((EXISTS ( SELECT 1
   FROM "public"."group_members" "gm"
  WHERE (("gm"."group_id" = "group_members"."group_id") AND ("gm"."user_id" = "auth"."uid"()) AND ("gm"."role" = 'admin'::"public"."member_role") AND ("gm"."status" = 'active'::"public"."member_status")))) OR ("user_id" = "auth"."uid"()))));



CREATE POLICY "Group creators and admins can delete groups" ON "public"."groups" FOR DELETE USING ((("auth"."role"() = 'authenticated'::"text") AND (("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."group_id" = "groups"."id") AND ("group_members"."user_id" = "auth"."uid"()) AND ("group_members"."role" = 'admin'::"public"."member_role") AND ("group_members"."status" = 'active'::"public"."member_status")))))));



CREATE POLICY "Group creators and admins can update groups" ON "public"."groups" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND (("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."group_id" = "groups"."id") AND ("group_members"."user_id" = "auth"."uid"()) AND ("group_members"."role" = 'admin'::"public"."member_role") AND ("group_members"."status" = 'active'::"public"."member_status")))))));



CREATE POLICY "Group members are viewable by anyone" ON "public"."group_members" FOR SELECT USING (true);



CREATE POLICY "Groups are viewable by anyone" ON "public"."groups" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can create posts" ON "public"."posts" FOR INSERT WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can create their own profile" ON "public"."profiles" FOR INSERT WITH CHECK ((("auth"."uid"() = "id") OR (EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE ("users"."id" = "profiles"."id")))));



CREATE POLICY "Users can delete own posts" ON "public"."posts" FOR DELETE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can follow others" ON "public"."followers" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can react to posts" ON "public"."post_reactions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can remove their reactions" ON "public"."post_reactions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can request to join groups" ON "public"."group_members" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() IS NOT NULL) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Users can set their own username once" ON "public"."usernames" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (NOT (EXISTS ( SELECT 1
   FROM "public"."usernames" "usernames_1"
  WHERE ("usernames_1"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can unfollow others" ON "public"."followers" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can update own posts" ON "public"."posts" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view all follow relationships" ON "public"."followers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view follow relationships" ON "public"."followers" FOR SELECT USING ((("auth"."uid"() = "follower_id") OR ("auth"."uid"() = "following_id")));



CREATE POLICY "Users can view reactions" ON "public"."post_reactions" FOR SELECT USING (true);



ALTER TABLE "public"."components" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."follow_counts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."followers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "manage_own_follows" ON "public"."followers" USING (("auth"."uid"() = "follower_id")) WITH CHECK (("auth"."uid"() = "follower_id"));



ALTER TABLE "public"."post_reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read_all_followers" ON "public"."followers" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "read_all_profiles" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "update_own_profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."usernames" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


CREATE PUBLICATION "supabase_realtime_messages_publication" WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION "supabase_realtime_messages_publication" OWNER TO "supabase_admin";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."follow_counts";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."followers";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."group_roles";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."post_reactions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."posts";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profiles";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."check_email_exists"("email_to_check" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_email_exists"("email_to_check" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_email_exists"("email_to_check" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_username_availability"("username_to_check" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_username_availability"("username_to_check" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_username_availability"("username_to_check" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_valid_categories"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_valid_categories"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_valid_categories"() TO "service_role";



GRANT ALL ON FUNCTION "public"."claim_username"("username_to_claim" "text", "user_id_to_set" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."claim_username"("username_to_claim" "text", "user_id_to_set" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_username"("username_to_claim" "text", "user_id_to_set" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_profile"("user_id" "uuid", "user_email" "text", "user_full_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_profile"("user_id" "uuid", "user_email" "text", "user_full_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_profile"("user_id" "uuid", "user_email" "text", "user_full_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_username_format"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_username_format"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_username_format"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."follow_user"("_follower_id" "uuid", "_following_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."follow_user"("_follower_id" "uuid", "_following_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."follow_user"("_follower_id" "uuid", "_following_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."follow_user"("_follower_id" "uuid", "_following_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_follow_counts"("_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_follow_counts"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_follow_counts"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_follow_counts"("_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_follow_status"("_user_id" "uuid", "_target_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_follow_status"("_user_id" "uuid", "_target_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_follow_status"("_user_id" "uuid", "_target_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_follow_status"("_user_id" "uuid", "_target_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_follower_count"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_follower_count"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_follower_count"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_following_count"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_following_count"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_following_count"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_groups_count"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_groups_count"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_groups_count"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_counts"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_counts"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_counts"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_group_count_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_group_count_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_group_count_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_username_available"("username_to_check" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_username_available"("username_to_check" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_username_available"("username_to_check" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_all_user_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."reset_all_user_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_all_user_counts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_profile_counts"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reset_profile_counts"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_profile_counts"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_user_counts"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reset_user_counts"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_user_counts"("_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."sync_follow_counts"("_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."sync_follow_counts"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."sync_follow_counts"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_follow_counts"("_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."unfollow_user"("_follower_id" "uuid", "_following_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."unfollow_user"("_follower_id" "uuid", "_following_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."unfollow_user"("_follower_id" "uuid", "_following_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unfollow_user"("_follower_id" "uuid", "_following_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_component_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_component_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_component_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_follower_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_follower_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_follower_counts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_group_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_group_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_group_counts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_profile_counts"("profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_profile_counts"("profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_profile_counts"("profile_id" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."components" TO "anon";
GRANT ALL ON TABLE "public"."components" TO "authenticated";
GRANT ALL ON TABLE "public"."components" TO "service_role";



GRANT ALL ON TABLE "public"."follow_counts" TO "anon";
GRANT ALL ON TABLE "public"."follow_counts" TO "authenticated";
GRANT ALL ON TABLE "public"."follow_counts" TO "service_role";



GRANT ALL ON TABLE "public"."followers" TO "anon";
GRANT ALL ON TABLE "public"."followers" TO "authenticated";
GRANT ALL ON TABLE "public"."followers" TO "service_role";



GRANT ALL ON TABLE "public"."group_members" TO "anon";
GRANT ALL ON TABLE "public"."group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."group_members" TO "service_role";



GRANT ALL ON TABLE "public"."group_roles" TO "anon";
GRANT ALL ON TABLE "public"."group_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."group_roles" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."post_reactions" TO "anon";
GRANT ALL ON TABLE "public"."post_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."post_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."usernames" TO "anon";
GRANT ALL ON TABLE "public"."usernames" TO "authenticated";
GRANT ALL ON TABLE "public"."usernames" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
