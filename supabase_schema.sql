-- Enable Realtime for rooms and participants
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table room_participants;

-- Rooms table
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references auth.users(id),
  status text default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_public boolean default true,
  region text default 'global' -- For "local" filtering
);

-- Room Participants table
create table if not exists room_participants (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references auth.users(id),
  username text,
  avatar text,
  progress integer default 0,
  wpm integer default 0,
  errors integer default 0,
  is_ready boolean default false,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(room_id, user_id)
);

-- Policies (Simplified for demo, refine for production)
alter table rooms enable row level security;
create policy "Public rooms are viewable by everyone" on rooms for select using (true);
create policy "Users can create rooms" on rooms for insert with check (auth.uid() = host_id);
create policy "Hosts can update their rooms" on rooms for update using (auth.uid() = host_id);

alter table room_participants enable row level security;
create policy "Participants are viewable by everyone" on room_participants for select using (true);
create policy "Users can join rooms" on room_participants for insert with check (auth.uid() = user_id);
create policy "Users can update their own status" on room_participants for update using (auth.uid() = user_id);

-- User Credits (Simple implementation)
alter table auth.users add column if not exists credits integer default 10;
