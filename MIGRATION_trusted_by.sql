-- ============================================================
-- MIGRATION: tabel trusted_by (section "Dipercaya Oleh")
-- Jalankan di Supabase → SQL Editor → New query → Run.
-- Aman dijalankan berkali-kali (idempotent).
-- ============================================================

create table if not exists public.trusted_by (
  id          bigserial primary key,
  site        text        not null default 'gabzdev',
  name        text        not null,
  logo_url    text,
  url         text,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists trusted_by_site_sort_idx
  on public.trusted_by (site, sort_order, id);

alter table public.trusted_by enable row level security;

-- Semua orang boleh baca (halaman portofolio publik)
drop policy if exists "trusted_by public read" on public.trusted_by;
create policy "trusted_by public read"
  on public.trusted_by for select
  using (true);

-- Cuma admin yang sudah login (Supabase Auth) yang boleh tulis
drop policy if exists "trusted_by admin write" on public.trusted_by;
create policy "trusted_by admin write"
  on public.trusted_by for all
  to authenticated
  using (true)
  with check (true);

-- ------------------------------------------------------------
-- SEED contoh (opsional — hapus kalau mau isi manual dari dashboard)
-- ------------------------------------------------------------
insert into public.trusted_by (site, name, logo_url, url, sort_order)
select * from (values
  ('gabzdev', 'GabzStore',        'https://cdn.simpleicons.org/shopify/FFFFFF',   null::text, 0),
  ('gabzdev', 'SMKS Poncol',      'https://cdn.simpleicons.org/googleclassroom/FFFFFF', null::text, 1),
  ('gabzdev', 'Fardax Store',     'https://cdn.simpleicons.org/steam/FFFFFF',     null::text, 2),
  ('gabzdev', 'EMSDE SHOOP',      'https://cdn.simpleicons.org/etsy/FFFFFF',      null::text, 3)
) as seed(site, name, logo_url, url, sort_order)
where not exists (select 1 from public.trusted_by where site = 'gabzdev');
