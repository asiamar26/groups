-- Step 1: Drop existing tables and types if they exist
DROP TABLE IF EXISTS public.discussion_likes CASCADE;
DROP TABLE IF EXISTS public.discussion_replies CASCADE;
DROP TABLE IF EXISTS public.discussions CASCADE;

-- Step 2: Create the discussions table with UUID and all required columns
CREATE TABLE IF NOT EXISTS public.discussions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'active'::text,
    attachments jsonb DEFAULT '[]',
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0
);

-- Step 3: Create related tables
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

-- Step 4: Create the storage bucket for attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Enable RLS
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_likes ENABLE ROW LEVEL SECURITY;

-- Step 6: Create timestamp trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create triggers
DROP TRIGGER IF EXISTS set_discussions_updated_at ON public.discussions;
CREATE TRIGGER set_discussions_updated_at
    BEFORE UPDATE ON public.discussions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_discussion_replies_updated_at ON public.discussion_replies;
CREATE TRIGGER set_discussion_replies_updated_at
    BEFORE UPDATE ON public.discussion_replies
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Step 8: Create function to update discussion counts
CREATE OR REPLACE FUNCTION update_discussion_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'discussion_replies' THEN
      UPDATE public.discussions
      SET replies_count = replies_count + 1
      WHERE id = NEW.discussion_id;
    ELSIF TG_TABLE_NAME = 'discussion_likes' THEN
      UPDATE public.discussions
      SET likes_count = likes_count + 1
      WHERE id = NEW.discussion_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'discussion_replies' THEN
      UPDATE public.discussions
      SET replies_count = replies_count - 1
      WHERE id = OLD.discussion_id;
    ELSIF TG_TABLE_NAME = 'discussion_likes' THEN
      UPDATE public.discussions
      SET likes_count = likes_count - 1
      WHERE id = OLD.discussion_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create triggers for discussion counts
DROP TRIGGER IF EXISTS update_discussion_reply_count ON public.discussion_replies;
CREATE TRIGGER update_discussion_reply_count
    AFTER INSERT OR DELETE ON public.discussion_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_discussion_counts();

DROP TRIGGER IF EXISTS update_discussion_like_count ON public.discussion_likes;
CREATE TRIGGER update_discussion_like_count
    AFTER INSERT OR DELETE ON public.discussion_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_discussion_counts();

-- Step 10: Drop existing policies before creating new ones
DROP POLICY IF EXISTS "Users can view discussions in their groups" ON public.discussions;
DROP POLICY IF EXISTS "Users can create discussions in their groups" ON public.discussions;
DROP POLICY IF EXISTS "Users can update their own discussions" ON public.discussions;
DROP POLICY IF EXISTS "Users can view replies to discussions they can see" ON public.discussion_replies;
DROP POLICY IF EXISTS "Users can create replies to discussions they can see" ON public.discussion_replies;
DROP POLICY IF EXISTS "Users can update their own replies" ON public.discussion_replies;
DROP POLICY IF EXISTS "Users can view likes on discussions they can see" ON public.discussion_likes;
DROP POLICY IF EXISTS "Users can like discussions they can see" ON public.discussion_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.discussion_likes;
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments in their groups" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON storage.objects;

-- Step 11: Create RLS policies for discussions
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

-- Step 12: Create RLS policies for replies
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

-- Step 13: Create RLS policies for likes
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

-- Step 14: Create RLS policies for attachments
CREATE POLICY "Authenticated users can upload attachments"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'attachments' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view attachments in their groups"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'attachments' AND
        EXISTS (
            SELECT 1 FROM public.discussions d
            JOIN public.group_members gm ON gm.group_id = d.group_id
            WHERE gm.user_id = auth.uid()
            AND gm.status = 'active'
            AND d.attachments @> format('[{"path": "%s"}]', name)::jsonb
        )
    );

CREATE POLICY "Users can delete their own attachments"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'attachments' AND
        auth.uid() = (
            SELECT d.user_id 
            FROM public.discussions d
            WHERE d.attachments @> format('[{"path": "%s"}]', name)::jsonb
            LIMIT 1
        )
    );

-- Step 15: Create the discussions view
DROP VIEW IF EXISTS public.discussions_with_users;
CREATE VIEW public.discussions_with_users AS
SELECT 
    d.id,
    d.group_id,
    d.user_id,
    d.title,
    d.content,
    d.status,
    COALESCE(d.attachments, '[]'::jsonb) as attachments,
    d.created_at,
    d.updated_at,
    p.email,
    p.display_name as display_name,
    p.avatar_url as avatar_url,
    COALESCE(dl.likes_count, 0) as likes_count,
    COALESCE(dr.replies_count, 0) as replies_count,
    EXISTS (
        SELECT 1 FROM public.discussion_likes dl
        WHERE dl.discussion_id = d.id
        AND dl.user_id = auth.uid()
    ) as is_liked
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

-- Step 16: Create indexes for better performance
DROP INDEX IF EXISTS idx_discussions_group_id;
DROP INDEX IF EXISTS idx_discussions_user_id;
DROP INDEX IF EXISTS idx_discussions_group_user;
DROP INDEX IF EXISTS idx_discussions_attachments;
DROP INDEX IF EXISTS idx_discussion_replies_discussion_id;
DROP INDEX IF EXISTS idx_discussion_likes_discussion_id;

CREATE INDEX idx_discussions_group_id ON public.discussions(group_id);
CREATE INDEX idx_discussions_user_id ON public.discussions(user_id);
CREATE INDEX idx_discussions_group_user ON public.discussions(group_id, user_id);
CREATE INDEX idx_discussions_attachments ON public.discussions USING gin(attachments);
CREATE INDEX idx_discussion_replies_discussion_id ON public.discussion_replies(discussion_id);
CREATE INDEX idx_discussion_likes_discussion_id ON public.discussion_likes(discussion_id);

-- Step 17: Grant access to authenticated users
GRANT ALL ON public.discussions TO authenticated;
GRANT ALL ON public.discussion_replies TO authenticated;
GRANT ALL ON public.discussion_likes TO authenticated;
GRANT SELECT ON public.discussions_with_users TO authenticated; 