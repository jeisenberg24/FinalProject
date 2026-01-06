-- Quote History table (for analytics)
create table public.quote_history (
  id uuid default gen_random_uuid() primary key,
  quote_id uuid references public.quotes(id) on delete cascade not null,
  action text check (action in ('created', 'updated', 'deleted', 'sent')) not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.quote_history enable row level security;

-- Policy: Users can read history for their own quotes
create policy "Users can read own quote history"
  on public.quote_history for select
  using (
    exists (
      select 1 from public.quotes
      where quotes.id = quote_history.quote_id
      and quotes.user_id = auth.uid()
    )
  );

-- Policy: Users can insert history for their own quotes
create policy "Users can insert own quote history"
  on public.quote_history for insert
  with check (
    exists (
      select 1 from public.quotes
      where quotes.id = quote_history.quote_id
      and quotes.user_id = auth.uid()
    )
  );

-- Index for faster queries
create index quote_history_quote_id_idx on public.quote_history(quote_id);
create index quote_history_created_at_idx on public.quote_history(created_at desc);

