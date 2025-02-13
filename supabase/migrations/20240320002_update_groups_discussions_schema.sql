-- Step 1: Drop existing foreign key constraints safely
ALTER TABLE IF EXISTS group_members 
  DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;

-- Step 2: Modify groups table to use UUID
ALTER TABLE groups 
  DROP COLUMN id CASCADE;

ALTER TABLE groups 
  ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();

-- Step 3: Update group_members to use UUID
ALTER TABLE group_members
  DROP COLUMN group_id CASCADE;

ALTER TABLE group_members
  ADD COLUMN group_id uuid REFERENCES groups(id) ON DELETE CASCADE;

-- Step 4: Create discussions tables
CREATE TABLE IF NOT EXISTS public.discussions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'active'::text
);

CREATE TABLE IF NOT EXISTS public.discussion_replies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    discussion_id uuid REFERENCES public.discussions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'active'::text
);

CREATE TABLE IF NOT EXISTS public.discussion_likes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    discussion_id uuid REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE(discussion_id, user_id)
);

-- Step 5: Enable RLS
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_likes ENABLE ROW LEVEL SECURITY;

-- Step 6: Grant access
GRANT ALL ON public.discussions TO authenticated;
GRANT ALL ON public.discussion_replies TO authenticated;
GRANT ALL ON public.discussion_likes TO authenticated;

-- Step 7: Create timestamp triggers
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_discussions_updated_at
    BEFORE UPDATE ON public.discussions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_discussion_replies_updated_at
    BEFORE UPDATE ON public.discussion_replies
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Step 8: Add RLS policies
CREATE POLICY "Users can view discussions in their groups"
    ON public.discussions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = discussions.group_id
            AND group_members.user_id = auth.uid()
            AND group_members.status = 'active'
        )
    );

CREATE POLICY "Users can create discussions in their groups"
    ON public.discussions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = discussions.group_id
            AND group_members.user_id = auth.uid()
            AND group_members.status = 'active'
        )
    );

CREATE POLICY "Users can update their own discussions"
    ON public.discussions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Add RLS policies for replies
CREATE POLICY "Users can view replies to discussions they can see"
    ON public.discussion_replies
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.discussions d
            JOIN public.group_members gm ON gm.group_id = d.group_id
            WHERE d.id = discussion_replies.discussion_id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

CREATE POLICY "Users can create replies to discussions they can see"
    ON public.discussion_replies
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.discussions d
            JOIN public.group_members gm ON gm.group_id = d.group_id
            WHERE d.id = discussion_replies.discussion_id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

CREATE POLICY "Users can update their own replies"
    ON public.discussion_replies
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Add RLS policies for likes
CREATE POLICY "Users can view likes on discussions they can see"
    ON public.discussion_likes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.discussions d
            JOIN public.group_members gm ON gm.group_id = d.group_id
            WHERE d.id = discussion_likes.discussion_id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

CREATE POLICY "Users can like discussions they can see"
    ON public.discussion_likes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.discussions d
            JOIN public.group_members gm ON gm.group_id = d.group_id
            WHERE d.id = discussion_likes.discussion_id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

CREATE POLICY "Users can unlike their own likes"
    ON public.discussion_likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Step 9: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_id ON groups(id);
CREATE INDEX IF NOT EXISTS idx_discussions_group_id ON public.discussions(group_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON public.discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON public.discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_likes_discussion_id ON public.discussion_likes(discussion_id);

-- Step 10: Create the discussions view
CREATE OR REPLACE VIEW public.discussions_with_users AS
SELECT 
    d.*,
    p.email,
    p.display_name,
    p.avatar_url,
    COALESCE(dl.likes_count, 0) as likes_count,
    COALESCE(dr.replies_count, 0) as replies_count
FROM public.discussions d
LEFT JOIN public.profiles p ON d.user_id = p.id
LEFT JOIN (
    SELECT discussion_id, COUNT(*) as likes_count 
    FROM public.discussion_likes 
    GROUP BY discussion_id
) dl ON d.id = dl.discussion_id
LEFT JOIN (
    SELECT discussion_id, COUNT(*) as replies_count 
    FROM public.discussion_replies 
    GROUP BY discussion_id
) dr ON d.id = dr.discussion_id;

-- Grant access to the view
GRANT SELECT ON public.discussions_with_users TO authenticated; 