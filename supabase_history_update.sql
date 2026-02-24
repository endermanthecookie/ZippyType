-- Create History Table
create table if not exists public.history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  wpm integer not null,
  accuracy numeric not null,
  time integer not null,
  errors integer not null,
  difficulty text not null,
  mode text not null,
  text_length integer not null,
  created_at timestamp with time zone default now() not null
);

-- RLS Policies for History
alter table public.history enable row level security;

drop policy if exists "Users can view their own history" on public.history;
create policy "Users can view their own history" on public.history for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own history" on public.history;
create policy "Users can insert their own history" on public.history for insert with check ((select auth.uid()) = user_id);
