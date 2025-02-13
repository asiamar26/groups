/*
 * Migration: Member Relationships
 * Description: Adds support for member relationships including followers, education, skills, and group membership tracking
 */

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view followers" ON followers;
DROP POLICY IF EXISTS "Users can follow others" ON followers;
DROP POLICY IF EXISTS "Users can unfollow" ON followers;

-- Add education and skills to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- Create followers table for following relationships if it doesn't exist
CREATE TABLE IF NOT EXISTS followers (
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Add stats columns to profiles for tracking counts
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS groups_count INT DEFAULT 0;

/*
 * Trigger Function: update_follower_counts
 * Description: Automatically updates follower and following counts when relationships change
 */
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment counts
        UPDATE profiles 
        SET followers_count = followers_count + 1
        WHERE id = NEW.following_id;
        
        UPDATE profiles 
        SET following_count = following_count + 1
        WHERE id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement counts
        UPDATE profiles 
        SET followers_count = followers_count - 1
        WHERE id = OLD.following_id;
        
        UPDATE profiles 
        SET following_count = following_count - 1
        WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

/*
 * Trigger Function: update_group_counts
 * Description: Automatically updates group membership count when a user joins or leaves a group
 */
CREATE OR REPLACE FUNCTION update_group_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment count
        UPDATE profiles 
        SET groups_count = groups_count + 1
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement count
        UPDATE profiles 
        SET groups_count = groups_count - 1
        WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Set up triggers for automatic count updates
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

-- Reset all counts to ensure accuracy with existing data
UPDATE profiles p
SET 
    followers_count = (SELECT COUNT(*) FROM followers WHERE following_id = p.id),
    following_count = (SELECT COUNT(*) FROM followers WHERE follower_id = p.id),
    groups_count = (SELECT COUNT(*) FROM group_members WHERE user_id = p.id);

-- Enable Row Level Security
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for followers table
CREATE POLICY "Anyone can view followers"
    ON followers FOR SELECT
    USING (true);

CREATE POLICY "Users can follow others"
    ON followers FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
    ON followers FOR DELETE
    USING (auth.uid() = follower_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS followers_follower_id_idx ON followers(follower_id);
CREATE INDEX IF NOT EXISTS followers_following_id_idx ON followers(following_id);
CREATE INDEX IF NOT EXISTS profiles_skills_idx ON profiles USING GIN (skills); 