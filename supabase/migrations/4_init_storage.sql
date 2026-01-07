-- Create storage bucket for quote PDFs
insert into storage.buckets (id, name, public)
values ('quote-pdfs', 'quote-pdfs', false)
on conflict (id) do nothing;

-- Storage policy: Users can upload their own PDFs
create policy "Users can upload own PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'quote-pdfs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: Users can read their own PDFs
create policy "Users can read own PDFs"
  on storage.objects for select
  using (
    bucket_id = 'quote-pdfs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: Users can delete their own PDFs
create policy "Users can delete own PDFs"
  on storage.objects for delete
  using (
    bucket_id = 'quote-pdfs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );


