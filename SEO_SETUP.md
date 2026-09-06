# SEO Setup — Gabriel Gonzales / GabzDev

## Yang udah dikerjain di kode

| File | Isi |
| :--- | :--- |
| `index.html` | Title, meta description, keywords, canonical URL, Open Graph, Twitter Card, **JSON-LD Person schema** |
| `public/robots.txt` | Izinin semua bot crawl, kecuali `/dashboard` & `/login`, nunjuk ke sitemap |
| `public/sitemap.xml` | 1 entri (ini SPA, semua konten satu URL `/`) |
| `public/site.webmanifest` | Metadata PWA/branding |
| `vercel.json` | SPA rewrite + cache header buat assets |
| `src/hooks/useSeo.ts` | Sinkronin `<title>` & meta description ke data profile Supabase secara live |
| `src/sections/Hero.tsx` | Nama "Gabriel Gonzales" sekarang ada di dalam `<h1>` (sebelumnya cuma di `<p>` biasa) |

### Kenapa JSON-LD Person schema itu kunci

```json
{
  "@type": "Person",
  "name": "Gabriel Gonzales",
  "alternateName": ["GabzDev", "GabzStore", "Fardax"],
  "sameAs": ["github.com/GabHub7", "instagram.com/gabzstoreid", "tiktok.com/@gabzstore77"]
}
```

Ini yang bikin Google connect: *"Gabriel Gonzales" = "GabzDev" = akun GitHub/Instagram/TikTok yang sama*.
Tanpa ini, Google cuma liat teks biasa dan nggak yakin itu semua satu orang.

---

## Yang WAJIB lu lakuin manual (gak bisa dari kode)

### 1. Google Search Console — paling penting
1. Buka [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → **URL prefix** → masukin `https://gabzdev.my.id`
3. Verifikasi kepemilikan domain (paling gampang: **DNS TXT record** di panel domain `.my.id` lu, atau upload file HTML kalau hostingnya support)
4. Setelah verified: **Sitemaps** (menu kiri) → masukin `sitemap.xml` → Submit
5. **URL Inspection** → masukin `https://gabzdev.my.id/` → klik **Request Indexing**

Ini langkah yang paling nentuin cepat/lambatnya muncul di Google. Tanpa submit manual,
Google bisa aja nemu situs lu sendiri lewat crawl biasa, tapi bisa berminggu-minggu.

### 2. Set domain utama di Vercel
Project → Settings → Domains:
- `gabzdev.my.id` → set sebagai **Primary Domain**
- domain `.vercel.app` biarin nyala tapi otomatis **redirect ke primary** (Vercel yang urus ini sendiri kalau primary domain udah di-set)

Ini penting — kalau kedua domain sama-sama "hidup" tanpa redirect, Google bisa anggap itu
dua situs beda isinya sama (duplicate content), yang justru ngerusak ranking.

### 3. Ganti gambar Open Graph (opsional tapi disaranin)
`hero-photo.webp` sekarang dipakai sebagai gambar preview link (WA/Discord/Facebook), tapi
dimensinya persegi (1254×1254), bukan landscape 1200×630 yang ideal. Kalau mau preview link
kelihatan lebih rapi, bikin `public/images/og-cover.jpg` ukuran 1200×630 lalu ganti 2 baris
di `index.html`:
```html
<meta property="og:image" content="https://gabzdev.my.id/images/og-cover.jpg" />
<meta name="twitter:image" content="https://gabzdev.my.id/images/og-cover.jpg" />
```
dan balikin `og:image:width`/`height` ke 1200/630.

### 4. Tes hasilnya (setelah deploy)
- **Rich Results Test**: [search.google.com/test/rich-results](https://search.google.com/test/rich-results) — tempel URL, cek Person schema kebaca
- **Link preview**: kirim link `gabzdev.my.id` ke diri sendiri di WhatsApp — cek preview card-nya muncul benar
- Cari `site:gabzdev.my.id` di Google beberapa hari setelah submit — kalau muncul, artinya udah keindex

---

## Realita yang perlu dipahami

- Google butuh waktu — biasanya **beberapa hari sampai beberapa minggu** setelah submit sitemap, bukan instan.
- Ini SPA (React), jadi Google harus render JavaScript dulu buat baca kontennya. Googlebot modern
  sudah bisa lakuin ini, tapi prosesnya lebih lambat dibanding situs HTML statis.
- "Muncul di halaman 1 pas nama lu dicari" nggak cuma soal teknis SEO — juga soal berapa banyak
  situs lain yang nyebut nama lu, umur domain, dan seberapa unik nama itu di internet. Setup ini
  mastiin Google **bisa nemu dan ngerti** halamannya dengan benar; peringkatnya sendiri berkembang
  seiring waktu.
- Kalau nama Gabriel Gonzales lu ternyata cukup umum (banyak orang lain nama sama), differentiator
  terkuat lu adalah kombinasi `alternateName` (GabzDev/GabzStore) — makin sering orang nyebut/link
  ke `gabzdev.my.id` pakai nama itu di tempat lain (bio Instagram, GitHub profile, dll), makin kuat
  sinyalnya ke Google.
