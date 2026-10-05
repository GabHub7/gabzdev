-- Jalankan SEKALI di Supabase SQL Editor.
-- Nambah kolom warna aksen per-testimoni (dipakai avatar & bintang di panel "What Clients Say").
-- Aman dijalankan ulang. Kalau belum dijalankan pun, testimoni tetap bisa disimpan
-- (cuma warnanya nggak ikut tersimpan sampai kolom ini ada).
alter table public.testimonials add column if not exists accent_color text;
