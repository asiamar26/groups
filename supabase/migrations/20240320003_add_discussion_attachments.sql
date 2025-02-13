-- First create the storage bucket for attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments in their groups" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON storage.objects;

-- Add RLS policy for the bucket
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'attachments' AND
    auth.role() = 'authenticated'
);

-- Add attachments column to discussions table
ALTER TABLE IF EXISTS public.discussions
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]';

-- Update the discussions view to include attachments
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

-- Grant access to the view
GRANT SELECT ON public.discussions_with_users TO authenticated;

-- Add index for attachments if needed
CREATE INDEX IF NOT EXISTS idx_discussions_attachments ON public.discussions USING gin(attachments);

-- Update RLS policy for discussions to include attachment access
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

-- Add policy for deleting attachments
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