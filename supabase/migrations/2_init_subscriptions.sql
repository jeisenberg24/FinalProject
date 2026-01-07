-- Subscriptions table
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text check (status in ('active', 'canceled', 'past_due', 'trialing')) default 'active',
  tier text check (tier in ('free', 'premium', 'pro')) default 'free',
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.subscriptions enable row level security;

-- Policy: Users can read their own subscription
create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Policy: Service role can manage all subscriptions (for webhooks)
create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (true)
  with check (true);

-- Trigger to update updated_at on subscriptions
create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- Index for faster queries
create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_stripe_subscription_id_idx on public.subscriptions(stripe_subscription_id);



