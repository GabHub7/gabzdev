-- ============================================================
-- MIGRASI: Perbaikan Bug Admin Panel (Testimoni & Paket GabzStore)
-- Jalankan SEKALI di Supabase SQL Editor
-- (Dashboard Supabase → SQL Editor → New query → paste → Run)
-- ============================================================

-- 1. Testimoni: foto profil custom + nomor WA custom (klik testimoni -> chat WA)
alter table public.testimonials
  add column if not exists photo_url text,
  add column if not exists whatsapp text;

-- 2. Paket GabzStore: pastikan semua kolom yang dipakai form admin sudah ada.
--    (Kalau sebelumnya kolom ini sudah ada, baris ini aman -- "if not exists"
--    bikin Postgres cuma skip, nggak akan menghapus/reset data yang sudah ada.)
alter table public.gabzstore_packages
  add column if not exists image_url text,
  add column if not exists features jsonb not null default '[]'::jsonb,
  add column if not exists includes jsonb not null default '[]'::jsonb,
  add column if not exists is_popular boolean not null default false,
  add column if not exists badge_class text not null default 'std';

-- 3. Pastikan row singleton (id = 1) ada di gabzstore_settings, profile, dan
--    social_links -- ini row yang kemarin gagal ke-update kalau belum pernah
--    di-insert sama sekali. ON CONFLICT DO NOTHING supaya aman dijalankan
--    berkali-kali dan nggak menimpa data yang sudah ada.
insert into public.gabzstore_settings (id, whatsapp, email, instagram, tiktok, github, jam_operasional)
values (1, '628811494688', 'gabzstoreid@gmail.com', 'gabzstoreid', 'gabzstoreid', 'GabHub7', 'Senin - Minggu: 08.00 - 22.00 WIB')
on conflict (id) do nothing;

-- 4. INI KEMUNGKINAN BESAR PENYEBAB "berubah di admin, ga muncul di web".
--    Situs statis GabzStore fetch data pakai anon key (bukan login).
--    Kalau RLS aktif tapi belum ada policy "boleh dibaca publik", fetch-nya
--    diam-diam gagal/kosong -> situs otomatis jatuh ke konten fallback
--    statis yang ada di index.html/script.js (makanya kelihatan "hardcode").
--    Bagian ini bikin semua tabel yang dipakai situs GabzStore boleh dibaca
--    siapa saja, tapi cuma bisa diubah lewat panel admin (login).
do $$
declare
  tbl text;
begin
  foreach tbl in array array['gabzstore_packages','projects','testimonials','skills','social_icons','gabzstore_settings','profile','social_links']
  loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('drop policy if exists "Public can read %1$s" on public.%1$I', tbl);
    execute format('create policy "Public can read %1$s" on public.%1$I for select using (true)', tbl);
    execute format('drop policy if exists "Authenticated can manage %1$s" on public.%1$I', tbl);
    execute format('create policy "Authenticated can manage %1$s" on public.%1$I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')', tbl);
  end loop;
end $$;

-- 5. Panel admin sekarang bisa nambah kategori proyek BEBAS (custom, bukan
--    cuma 4 kategori lama). Kalau kolom `category` di tabel `projects` masih
--    punya CHECK constraint dari setup awal yang cuma izinin 4 nilai lama
--    ('UI/UX','Website Design','App Design','Graphic Design'), simpan
--    kategori baru bakal DITOLAK database (ini kemungkinan besar penyebab
--    "proyek gagal ke-update" kalau kamu udah coba pakai kategori custom).
--    Baris ini otomatis cari & hapus constraint semacam itu kalau ada.
do $$
declare
  rec record;
begin
  for rec in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'projects'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%category%'
  loop
    execute format('alter table public.projects drop constraint %I', rec.conname);
    raise notice 'Dropped constraint: %', rec.conname;
  end loop;
end $$;

-- 6. Fitur multi-kategori proyek (maksimal 3 kategori per proyek, mis.
--    "School Project" + "Client Project"). Kolom `category` lama TETAP ada
--    (dipakai sebagai kategori utama/fallback), kolom baru `categories`
--    nyimpen semua kategori sebagai array.
alter table public.projects
  add column if not exists categories text[] not null default '{}';

-- Isi otomatis `categories` dari data `category` lama yang sudah ada,
-- supaya proyek lama nggak kelihatan kosong kategorinya.
update public.projects
set categories = array[category]
where (categories is null or categories = '{}') and category is not null and category <> '';
