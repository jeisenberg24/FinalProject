-- Quotes table
create table public.quotes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  service_type text not null,
  market_rate numeric(10, 2) not null,
  market_demand text check (market_demand in ('High', 'Medium', 'Low')) not null,
  is_emergency boolean default false,
  location text not null,
  complexity text check (complexity in ('Simple', 'Moderate', 'Complex')) not null,
  materials_cost numeric(10, 2),
  time_of_day text,
  seasonal_factor text check (seasonal_factor in ('Peak', 'Normal', 'Off-peak')) not null,
  competitor_pricing numeric(10, 2),
  experience_level text check (experience_level in ('Beginner', 'Intermediate', 'Expert')) not null,
  equipment_requirements text check (equipment_requirements in ('Standard', 'Specialized', 'Heavy-duty')) not null,
  calculated_price numeric(10, 2) not null,
  price_range_min numeric(10, 2) not null,
  price_range_max numeric(10, 2) not null,
  price_breakdown jsonb not null,
  quote_validity_days integer not null default 30,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.quotes enable row level security;

-- Policy: Users can read their own quotes
create policy "Users can read own quotes"
  on public.quotes for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own quotes
create policy "Users can insert own quotes"
  on public.quotes for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own quotes
create policy "Users can update own quotes"
  on public.quotes for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own quotes
create policy "Users can delete own quotes"
  on public.quotes for delete
  using (auth.uid() = user_id);

-- Trigger to update updated_at on quotes
create trigger update_quotes_updated_at
  before update on public.quotes
  for each row execute procedure public.handle_updated_at();

-- Index for faster queries
create index quotes_user_id_idx on public.quotes(user_id);
create index quotes_created_at_idx on public.quotes(created_at desc);



