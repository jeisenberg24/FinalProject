-- Add saved_market_rate to profiles table
alter table public.profiles 
add column if not exists saved_market_rate numeric(10, 2);


