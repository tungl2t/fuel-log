-- Migration: Create user_settings table
-- Run this in your Supabase SQL editor

create table if not exists public.user_settings (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  lang      text not null default 'en',
  currency  text not null default 'usd',
  distance  text not null default 'mile',
  volume    text not null default 'gallon',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.user_settings enable row level security;

-- Users can only read and write their own row
create policy "Users manage own settings"
  on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
