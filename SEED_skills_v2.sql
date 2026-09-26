-- ============================================================
-- SEED v2: Skills Carousel — daftar tech ala referensi astralune.cv
-- Jalankan SETELAH MIGRATION_skills.sql, di Supabase SQL Editor
-- project GabzDev kamu (Dashboard → SQL Editor → New query → Run).
--
-- PENTING: kalau kamu sudah pernah run SEED_skills.sql sebelumnya,
-- baris di bawah ini akan MENAMBAH data baru (bukan mengganti).
-- Kalau mau ganti total, kosongkan dulu tabelnya:
--   delete from public.skills where site = 'gabzdev';
-- baru jalankan insert di bawah ini.
--
-- Catatan logo: TypeScript, JavaScript, Go, Rust, Next.js, Vite,
-- dan Fastify punya logo resmi di simpleicons.org. Elysia, Gin,
-- Echo, Rocket, dan Leptos sengaja TIDAK diisi logo_url (NULL) —
-- di referensi astralune.cv pun cuma tampil bullet + nama teks,
-- bukan logo, karena framework-framework ini memang belum punya
-- entry resmi di simpleicons.org. Komponennya sudah otomatis
-- fallback ke ikon generik saat logo_url kosong.
-- ============================================================

insert into public.skills (site, name, logo_url, sort_order) values
  ('gabzdev', 'TypeScript', 'https://cdn.simpleicons.org/typescript', 1),
  ('gabzdev', 'JavaScript', 'https://cdn.simpleicons.org/javascript', 2),
  ('gabzdev', 'Go',         'https://cdn.simpleicons.org/go', 3),
  ('gabzdev', 'Rust',       'https://cdn.simpleicons.org/rust', 4),
  ('gabzdev', 'Next.js',    'https://cdn.simpleicons.org/nextdotjs', 5),
  ('gabzdev', 'Vite',       'https://cdn.simpleicons.org/vite', 6),
  ('gabzdev', 'Fastify',    'https://cdn.simpleicons.org/fastify', 7),
  ('gabzdev', 'Elysia',     null, 8),
  ('gabzdev', 'Gin',        null, 9),
  ('gabzdev', 'Echo',       null, 10),
  ('gabzdev', 'Rocket',     null, 11),
  ('gabzdev', 'Leptos',     null, 12);
