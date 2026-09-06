-- ============================================================
-- MIGRASI: Field tambahan untuk Portfolio bergaya flaid.my.id
-- Jalankan query ini SEKALI di Supabase SQL Editor project GabzDev kamu
-- (Dashboard Supabase → SQL Editor → New query → paste → Run)
--
-- Field baru:
--   tags       — stack teknologi, mis. ['Next.js', 'TypeScript', 'PostgreSQL']
--                ditampilkan sebagai pill kecil di bawah deskripsi.
--   highlights — angka/statistik singkat, mis. ['39 endpoint', '3 role'],
--                ditampilkan sebagai pill hitam solid (kayak "39 endpoint"
--                di referensi flaid).
--   repo_url   — link ke repository (GitHub/GitLab). Kosongkan kalau
--                private/nggak ada — tombol "Repository" otomatis
--                nggak muncul.
--   demo_url   — link ke live demo. Kosongkan kalau nggak ada — tombol
--                "Live Demo" otomatis nggak muncul.
--
-- Kolom `link` yang udah ada TETAP dipakai sebagai tombol utama
-- "Case Study" (nggak berubah/nggak perlu migrasi data lama).
-- ============================================================

alter table public.projects
  add column if not exists tags text[] not null default '{}',
  add column if not exists highlights text[] not null default '{}',
  add column if not exists repo_url text,
  add column if not exists demo_url text;
