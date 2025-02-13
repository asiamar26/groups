-- Create profiles table if it doesn't exist
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    first_name text,
    last_name text,
    avatar_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create policy to allow users to view any profile
create policy "Profiles are viewable by everyone" on public.profiles
    for select using (true);

-- Drop existing policies first
drop policy if exists "Users can update their own profile" on public.profiles;

-- Create policy to allow users to update their own profile
create policy "Users can update their own profile"
    on public.profiles
    for update using (auth.uid() = id);

-- Grant necessary permissions
grant usage on schema auth to authenticated;
grant select on auth.users to authenticated;

-- Update group_members to use profiles foreign key
alter table public.group_members drop constraint if exists group_members_user_id_fkey;

alter table public.group_members
    add constraint group_members_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade; 