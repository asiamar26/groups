-- Grant access to auth schema and users table for joins
grant usage on schema auth to authenticated;
grant select on auth.users to authenticated;

-- Create policy to allow authenticated users to read user data
create policy "Allow authenticated users to read user data"
    on auth.users
    for select
    using (
        auth.role() = 'authenticated'
    );

-- Update group_members view to include user data
create or replace view public.group_members_with_users as
select 
    gm.*,
    au.email,
    au.raw_user_meta_data->>'first_name' as first_name,
    au.raw_user_meta_data->>'last_name' as last_name,
    au.raw_user_meta_data->>'avatar_url' as avatar_url
from public.group_members gm
join auth.users au on gm.user_id = au.id;

-- Grant access to the view
grant select on public.group_members_with_users to authenticated; 