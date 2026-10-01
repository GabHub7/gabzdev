# Upgrade Notes — Loading Screen, Lanyard, React Query, Gallery, Trusted By

## Yang wajib dijalanin dulu

1. **Install dependency baru**
   ```bash
   npm install
   ```
   Dua paket baru: `@tanstack/react-query`, `react-photo-view`.

2. **Jalanin migrasi SQL** di Supabase → SQL Editor → New query → Run:
   ```
   MIGRATION_trusted_by.sql
   ```
   Kalau dilewatin, section "Dipercaya Oleh" nggak akan muncul (bukan error — komponennya
   `return null` kalau datanya kosong), dan panel adminnya bakal ngasih alert pas nyimpen.

3. **Isi datanya** lewat panel admin → GabzDev → **Dipercaya Oleh**.
   Logo bisa upload file atau tempel URL (mis. `cdn.simpleicons.org/react/2563EB`).

---

## Ringkasan perubahan

### File baru
| Path | Fungsi |
| :--- | :--- |
| `src/components/LoadingScreen.tsx` | Intro 3 baris (`gabzstore` / `gabzdev` / `gabzstore owner`) |
| `src/lib/intro.ts` | Helper sessionStorage buat intro (sekali per sesi) |
| `src/components/Lanyard.tsx` | Kartu ID gantung interaktif di Hero |
| `src/lib/queries.ts` | Hook React Query + query keys |
| `src/sections/TrustedBy.tsx` | Section "Dipercaya Oleh" (marquee logo) |
| `MIGRATION_trusted_by.sql` | Tabel `trusted_by` + RLS + seed |

### File yang diubah
- `src/main.tsx` — `QueryClientProvider` + import CSS `react-photo-view`
- `src/App.tsx` — intro via `AnimatePresence`, `<TrustedBy />`, Login & Dashboard di-`lazy()`
- `src/sections/Hero.tsx` — foto statis → `<Lanyard />`, fetch → React Query
- `src/sections/Testimonials.tsx` — kartu → modal detail (quote penuh + tombol WA)
- `src/components/ProjectShared.tsx` — zoom fullscreen + `ProjectGalleryProvider`
- `src/sections/Portfolio.tsx`, `SkillsCarousel.tsx`, `Footer.tsx`, `views/AllProjects.tsx` — React Query
- `src/views/Dashboard.tsx` — panel "Dipercaya Oleh" + invalidate cache pas balik ke portfolio
- `src/lib/storage.ts` — tipe `TrustedBrand` + CRUD
- `src/lib/supabaseClient.ts` — folder upload `'trusted'`
- `src/lib/i18n.ts` — key baru (EN + ID)

---

## Catatan teknis

**Cache React Query.** `staleTime` 5 menit, `refetchOnWindowFocus: false`, `refetchOnMount: false`.
Artinya pindah view (portfolio ↔ semua proyek) nggak nembak Supabase lagi. Setelah edit data di
panel admin, cache di-invalidate otomatis pas klik "Lihat Portfolio" atau logout — jadi
perubahannya langsung kelihatan tanpa hard refresh.

**Lanyard di layar sentuh.** Drag sengaja dimatiin kalau `pointer: coarse` supaya scroll halaman
nggak keganggu. Animasi ayunnya tetap jalan.

**Kalau ujung tali kelihatan kepisah dari kartu.** Class `animate-float` gw taruh di elemen anak
(`src/components/Lanyard.tsx` baris ~151) supaya CSS `transform`-nya nggak nabrak transform dari
framer-motion. Efek sampingnya, pas kartu lagi ngambang bisa ada celah ±8px dari ujung tali.
Kalau ganggu, tinggal hapus `animate-float` dari baris itu.

**Bundle.** 814 kB → 723 kB buat pengunjung biasa. Dashboard (86 kB) dan Login (6 kB) sekarang
chunk terpisah, cuma ke-download pas masuk admin.

**Lint.** `npx tsc -b` bersih. `npm run lint` masih ada 26 error, semuanya
`react-refresh/only-export-components` dari file lama (shadcn `ui/*`, `Dashboard.tsx`, hooks) —
udah ada sebelum perubahan ini, bukan bawaan dari kerjaan ini.
