-- Enable required extensions
create extension if not exists "uuid-ossp";

-- User Profile table (extends Supabase auth.users)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_name text,
  experience_level text check (experience_level in ('Beginner', 'Intermediate', 'Expert')) default 'Intermediate',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policy: Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Policy: Users can insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile when user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on profiles
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();


