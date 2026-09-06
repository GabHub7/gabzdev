-- ============================================================
-- MIGRASI: Fitur Pinned Project
-- Jalankan query ini SEKALI di Supabase SQL Editor project GabzDev kamu
-- (Dashboard Supabase → SQL Editor → New query → paste → Run)
-- ============================================================

alter table public.projects
  add column if not exists is_pinned boolean not null default false;

-- (Opsional) index biar query filter pinned lebih cepat kalau proyeknya
-- banyak nantinya.
create index if not exists projects_is_pinned_idx on public.projects (is_pinned);
