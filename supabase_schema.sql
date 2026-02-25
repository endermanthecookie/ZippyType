-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Rooms table
create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references auth.users(id),
  status text default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  text text,
  created_at timestamp with time zone default now() not null,
  is_public boolean default true,
  region text default 'global'
);

-- Room Participants table
create table if not exists public.room_participants (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references auth.users(id),
  username text,
  avatar text,
  progress integer default 0,
  wpm integer default 0,
  errors integer default 0,
  is_ready boolean default false,
  joined_at timestamp with time zone default now() not null,
  constraint room_participants_room_user_unique unique(room_id, user_id)
);

-- User Credits Table
create table if not exists public.user_credits (
  user_id uuid references auth.users(id) primary key,
  credits integer default 10,
  updated_at timestamp with time zone default now()
);

-- RLS Policies
alter table public.rooms enable row level security;

-- Drop existing policies if they exist to avoid errors on re-run (optional but good practice)
drop policy if exists "Public rooms are viewable by everyone" on public.rooms;
create policy "Public rooms are viewable by everyone" on public.rooms for select using (true);

drop policy if exists "Users can create rooms" on public.rooms;
create policy "Users can create rooms" on public.rooms for insert with check ((select auth.uid()) = host_id);

drop policy if exists "Hosts can update their rooms" on public.rooms;
create policy "Hosts can update their rooms" on public.rooms for update using ((select auth.uid()) = host_id);

alter table public.room_participants enable row level security;

drop policy if exists "Participants are viewable by everyone" on public.room_participants;
create policy "Participants are viewable by everyone" on public.room_participants for select using (true);

drop policy if exists "Users can join rooms" on public.room_participants;
create policy "Users can join rooms" on public.room_participants for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own status" on public.room_participants;
create policy "Users can update their own status" on public.room_participants for update using ((select auth.uid()) = user_id);

alter table public.user_credits enable row level security;

drop policy if exists "Users can view their own credits" on public.user_credits;
create policy "Users can view their own credits" on public.user_credits for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own credits" on public.user_credits;
create policy "Users can update their own credits" on public.user_credits for update using ((select auth.uid()) = user_id);

-- Function to decrement credits safely
create or replace function public.decrement_credits(user_id_arg uuid)
returns void as $$
begin
  update public.user_credits
  set credits = credits - 1
  where user_id = user_id_arg and credits > 0;
end;
$$ language plpgsql security definer set search_path = public;

-- Enable Realtime
-- We use a do block to avoid errors if table is already in publication
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'rooms') then
    alter publication supabase_realtime add table public.rooms;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'room_participants') then
    alter publication supabase_realtime add table public.room_participants;
  end if;
end;
$$;
