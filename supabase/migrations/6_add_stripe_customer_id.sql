-- Add stripe_customer_id column to profiles table
alter table public.profiles
add column if not exists stripe_customer_id text;

-- Create index for faster lookups
create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);


