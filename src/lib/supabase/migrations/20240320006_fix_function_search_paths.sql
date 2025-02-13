-- Fix search paths for all functions by setting search_path explicitly

-- Profile related functions
ALTER FUNCTION public.get_profile_counts(_user_id uuid) SET search_path = public;
ALTER FUNCTION public.reset_profile_counts(user_id uuid) SET search_path = public;
ALTER FUNCTION public.reset_all_user_counts() SET search_path = public;
ALTER FUNCTION public.verify_profile_counts(profile_id uuid) SET search_path = public;
ALTER FUNCTION public.create_new_profile(user_id uuid, user_email text, user_full_name text) SET search_path = public;
ALTER FUNCTION public.ensure_username_format() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.is_username_available(username_to_check text) SET search_path = public;
ALTER FUNCTION public.sync_auth_users_to_profiles() SET search_path = public;

-- Group related functions
ALTER FUNCTION public.is_group_creator(group_id bigint) SET search_path = public;
ALTER FUNCTION public.is_public_group(group_id bigint) SET search_path = public;
ALTER FUNCTION public.is_group_admin(group_id bigint) SET search_path = public;
ALTER FUNCTION public.create_owner_member() SET search_path = public;
ALTER FUNCTION public.update_group_counts() SET search_path = public;
ALTER FUNCTION public.update_group_last_activity() SET search_path = public;
ALTER FUNCTION public.update_group_member_count() SET search_path = public;
ALTER FUNCTION public.handle_group_count_change() SET search_path = public;
ALTER FUNCTION public.get_groups_count(_user_id uuid) SET search_path = public;

-- Discussion related functions
ALTER FUNCTION public.update_discussion_counts() SET search_path = public;

-- Follower related functions
ALTER FUNCTION public.get_follower_count(_user_id uuid) SET search_path = public;
ALTER FUNCTION public.get_following_count(_user_id uuid) SET search_path = public;
ALTER FUNCTION public.update_follower_counts() SET search_path = public;

-- User count related functions
ALTER FUNCTION public.reset_user_counts(_user_id uuid) SET search_path = public;

-- Utility functions
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.update_component_timestamp() SET search_path = public;
ALTER FUNCTION public.set_current_timestamp_updated_at() SET search_path = public;
ALTER FUNCTION public.check_valid_categories() SET search_path = public;

-- Add SECURITY DEFINER to functions that need it
ALTER FUNCTION public.get_profile_counts(_user_id uuid) SECURITY DEFINER;
ALTER FUNCTION public.reset_profile_counts(user_id uuid) SECURITY DEFINER;
ALTER FUNCTION public.reset_all_user_counts() SECURITY DEFINER;
ALTER FUNCTION public.is_group_creator(group_id bigint) SECURITY DEFINER;
ALTER FUNCTION public.is_group_admin(group_id bigint) SECURITY DEFINER;
ALTER FUNCTION public.get_groups_count(_user_id uuid) SECURITY DEFINER;
ALTER FUNCTION public.get_follower_count(_user_id uuid) SECURITY DEFINER;
ALTER FUNCTION public.get_following_count(_user_id uuid) SECURITY DEFINER;
ALTER FUNCTION public.reset_user_counts(_user_id uuid) SECURITY DEFINER;
ALTER FUNCTION public.create_new_profile(user_id uuid, user_email text, user_full_name text) SECURITY DEFINER;
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
ALTER FUNCTION public.is_username_available(username_to_check text) SECURITY DEFINER;
ALTER FUNCTION public.sync_auth_users_to_profiles() SECURITY DEFINER;

COMMENT ON FUNCTION public.get_profile_counts IS 'Returns profile counts with fixed search_path for security';
COMMENT ON FUNCTION public.is_group_creator IS 'Checks if user is group creator with fixed search_path for security';
COMMENT ON FUNCTION public.update_discussion_counts IS 'Updates discussion counts with fixed search_path for security'; 