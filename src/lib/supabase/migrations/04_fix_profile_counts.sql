/*
 * Migration: Fix Profile Counts
 * Description: Fixes and maintains accurate counts for followers, following, and groups
 */

-- First, ensure all counts start at 0
UPDATE profiles
SET 
    followers_count = 0,
    following_count = 0,
    groups_count = 0;

-- Reset all counts to ensure accuracy
WITH profile_counts AS (
  SELECT 
    p.id,
    (SELECT COUNT(*) FROM followers WHERE following_id = p.id) as followers,
    (SELECT COUNT(*) FROM followers WHERE follower_id = p.id) as following
  FROM profiles p
)
UPDATE profiles p
SET 
    followers_count = pc.followers,
    following_count = pc.following,
    updated_at = NOW() + (id::text::int % 1000000) * interval '1 microsecond'
FROM profile_counts pc
WHERE p.id = pc.id;

-- Update groups count based on actual memberships
UPDATE profiles p
SET 
    groups_count = (
        SELECT COUNT(*)
        FROM group_members
        WHERE user_id = p.id
    );

-- Create a function to reset counts for a specific user
CREATE OR REPLACE FUNCTION reset_profile_counts(user_id UUID)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Create a function to reset all profile counts
CREATE OR REPLACE FUNCTION reset_all_profile_counts()
RETURNS void AS $$
BEGIN
    UPDATE profiles p
    SET 
        followers_count = (
            SELECT COUNT(*)
            FROM followers
            WHERE following_id = p.id
        ),
        following_count = (
            SELECT COUNT(*)
            FROM followers
            WHERE follower_id = p.id
        ),
        groups_count = (
            SELECT COUNT(*)
            FROM group_members
            WHERE user_id = p.id
        );
END;
$$ LANGUAGE plpgsql;

-- Verify triggers are properly set up
DROP TRIGGER IF EXISTS update_follower_counts ON followers;
CREATE TRIGGER update_follower_counts
    AFTER INSERT OR DELETE ON followers
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

DROP TRIGGER IF EXISTS update_group_counts ON group_members;
CREATE TRIGGER update_group_counts
    AFTER INSERT OR DELETE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION update_group_counts(); 