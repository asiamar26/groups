-- Drop existing policies and triggers if table exists
do $$ 
begin
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'profiles') then
        drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
        drop policy if exists "Users can insert their own profile" on public.profiles;
        drop policy if exists "Users can update their own profile" on public.profiles;
        drop trigger if exists handle_updated_at on public.profiles;
    end if;
end $$;

-- Create profiles table first
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    first_name text,
    last_name text,
    username text unique,
    avatar_url text,
    website text,
    bio text,
    location text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    date_of_birth date
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create profiles policies
create policy "Public profiles are viewable by everyone"
    on profiles for select
    using ( true );

create policy "Users can insert their own profile"
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update their own profile"
    on profiles for update
    using ( auth.uid() = id );

-- Create function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();
