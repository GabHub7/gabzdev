-- ============================================================
-- MIGRASI: Fitur Skills Carousel
-- Jalankan query ini SEKALI di Supabase SQL Editor project GabzDev kamu
-- (Dashboard Supabase → SQL Editor → New query → paste → Run)
-- ============================================================

create table if not exists public.skills (
  id bigint generated always as identity primary key,
  site text not null default 'gabzdev',
  name text not null,
  logo_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists skills_site_idx on public.skills (site);

-- Row Level Security: sama seperti tabel projects/testimonials lain di
-- project ini. Kalau tabel lain kamu pakai policy public-read +
-- authenticated-write, samakan polanya di sini. Contoh dasar:
alter table public.skills enable row level security;

create policy "Public can read skills" on public.skills
  for select using (true);

create policy "Authenticated can manage skills" on public.skills
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
