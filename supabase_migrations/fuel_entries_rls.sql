-- Migration: Set up RLS policies for fuel_entries table
-- Run this in your Supabase SQL editor (https://supabase.com/dashboard > SQL Editor)

-- Enable RLS if not already enabled
alter table public.fuel_entries enable row level security;

-- Allow users to SELECT their own rows
create policy "Users can read own fuel entries"
  on public.fuel_entries
  for select
  using (auth.uid() = user_id);

-- Allow users to INSERT their own rows
create policy "Users can insert own fuel entries"
  on public.fuel_entries
  for insert
  with check (auth.uid() = user_id);

-- Allow users to UPDATE their own rows
create policy "Users can update own fuel entries"
  on public.fuel_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow users to DELETE their own rows
create policy "Users can delete own fuel entries"
  on public.fuel_entries
  for delete
  using (auth.uid() = user_id);
