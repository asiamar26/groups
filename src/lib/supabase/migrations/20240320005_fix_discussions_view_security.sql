-- Drop the existing view
DROP VIEW IF EXISTS public.discussions_with_users;

-- Recreate the view with SECURITY INVOKER explicitly specified
CREATE VIEW public.discussions_with_users
WITH (security_invoker = on)
AS
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

-- Grant access to authenticated users
GRANT SELECT ON public.discussions_with_users TO authenticated; 