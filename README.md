# Video Streaming Platform (Astro SSR + Agent Panel + Docker + FFmpeg)

Platform website streaming video modern, cepat, ringan, dan portabel yang dibangun menggunakan **Astro 5 (SSR Node Adapter)**, **Tailwind CSS**, **Atomic JSON Database**, serta engine **FFmpeg Video Processing**.

Dilengkapi dengan antarmuka penonton (*Audience Facing*) bergaya dark modern dan **Agent Panel (`/admin`)** bergaya Enterprise SaaS bebas emoji untuk manajemen konten, iklan, branding, serta otomasi video.

---

## 🌟 Fitur Utama

### 1. Antarmuka Penonton (Frontend)
- **Desain Dark Minimalis & Elegan**: Mengadopsi estetika situs video modern, sepenuhnya responsif di perangkat mobile maupun desktop.
- **Pencarian Terpadu (Smooth Dropdown Search)**:
  - Kotak pencarian tidak fullscreen, meluncur halus (*smooth fade/slide down*) tepat di bawah barisan pencarian saat diklik.
  - **Trending Searches**: Daftar teks pencarian populer yang bersih dan interaktif.
  - **Recent Searches**: Riwayat pencarian terakhir tersimpan otomatis di `localStorage` dengan opsi hapus per item dan *Clear all*.
  - **Trending Models & Categories**: Tampilan kategori/model populer dengan avatar lingkaran (*circular thumbnail*).
- **Player Video Responsif HTML5**:
  - Tombol lompat mundur **-10 detik** dan lompat maju **+10 detik**.
  - Pengatur kecepatan putar: `0.75x`, `1.0x` (Normal), `1.25x`, `1.5x`, `2.0x`.
  - Tombol **Unduh MP4** langsung.
  - Shortcut keyboard: `Spasi` (Play/Pause), `J` (-10s), `L` (+10s), `F` (Fullscreen), `M` (Mute).
- **Rekomendasi Video Terkait**: Menampilkan video sejenis di bawah player untuk meningkatkan retensi penonton.
- **Sidebar Video Terpopuler**: Daftar video dengan jumlah penayangan terbanyak.
- **Halaman Khusus Video Trending (`/trending`)**: Peringkat video viral terpopuler lengkap dengan badge ranking (#1, #2, #3, dst).
- **Arsip Kategori Dinamis (`/category/[slug]`)**: Sinkronisasi taksonomi kategori secara otomatis dengan database.
- **Sitemap XML Otomatis (`/sitemap.xml`)**: Berstandar Google Search Console untuk seluruh URL video, kategori, dan beranda.

---

### 2. Panel Agen Profesional (`/admin`)
Antarmuka manajemen berstandar **Enterprise SaaS** tanpa emoji dengan ikon SVG presisi dan notifikasi toast:

1. **Ringkasan & Analitik**:
   - KPI metric card: Total Views, Rata-rata Views per Konten, Rasio Interaksi (Likes), Status Slot Iklan Aktif.
   - Grafik batang visual aktivitas penayangan 7 hari terakhir.
   - Distribusi persentase konten per kategori dan daftar Top 10 Video Performer.
2. **Koleksi Video**:
   - Filter tabel berdasarkan judul dan kategori.
   - **Auto-Frame Grabber**: Saat agen memilih file video lokal, sistem otomatis mengambil cuplikan frame detik ke-3 menggunakan HTML5 video canvas sebagai gambar thumbnail.
   - Input judul, estimasi durasi, kategori, dan deskripsi otomatis.
3. **Manajemen Kategori**:
   - Tambah dan kelola kategori konten dengan penghitung otomatis video yang terasosiasi.
4. **Jaringan Iklan & Monetisasi**:
   - **Iklan Popunder / Direct Link**: Pengaturan link sponsor dengan interval jeda menit/jam.
   - **Sticky Bottom Floating Banner**: Banner melayang di bawah layar dengan tombol tutup (*close X*).
   - Slot banner iklan: **Header**, **In-Grid (Tengah Video)**, **Watch Top**, dan **Watch Bottom**.
   - Mendukung format gambar + target URL maupun kode script HTML/JS jaringan iklan pihak ketiga.
5. **Branding & Visual Real-time**:
   - Nama situs, tagline, logo, dan favicon.
   - **Color Picker Real-time**: Mengubah warna tema primer sistem secara langsung (*live preview*) dengan input Hex maupun palet warna.
6. **SEO & Integrasi**:
   - Meta Title, Meta Description, Meta Keywords, Tautan Telegram Resmi, dan Script Pelacakan Eksternal (Google Analytics / Tag Manager / Yandex Metrika).
7. **Otomasi Video: Intro, Outro & Watermark (FFmpeg Engine)**:
   - **Opening Video/GIF (Intro)**: Otomatis ditempel di awal video saat agen mengunggah video.
   - **Closing Video/GIF (Outro)**: Otomatis ditempel di akhir video saat agen mengunggah video.
   - **Watermark di Tengah Video**: Logo PNG transparan atau teks yang otomatis ditempel di tengah layar sepanjang durasi video.
   - Pengatur opasitas watermark (10%–100%) dengan visual simulator langsung di panel.
   - Checkbox toggle pada modal upload untuk memilih render otomatis atau upload instan.

---

## 🛠️ Stack Teknologi

- **Framework**: [Astro 5](https://astro.build/) (Server-Side Rendering / SSR Mode)
- **Adapter**: `@astrojs/node` (Standalone Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan Dynamic CSS Variables
- **Database**: Atomic JSON Database (`data/db.json`) dengan operasi file lock aman
- **Video Engine**: [FFmpeg](https://ffmpeg.org/) (Concat filter, Overlay filter, H.264/AAC Web Optimization `+faststart`)
- **Containerization**: Docker & Docker Compose (Multi-stage build berbasis Alpine)

---

## 🚀 Panduan Instalasi & Menjalankan

### Persyaratan Sistem:
- **Node.js**: v20.x atau lebih baru
- **FFmpeg**: Terpasang di sistem (opsional untuk lokal jika tidak menggunakan fitur branding video, wajib di Docker)

### 1. Menjalankan secara Lokal

```bash
# 1. Masuk ke direktori project
cd asas-video-platform

# 2. Install dependensi
npm install

# 3. Jalankan server development
npm run dev

# 4. Build untuk mode produksi
npm run build

# 5. Jalankan server produksi lokal
npm run serve
```

Aplikasi dapat diakses di:
- **Website Publik**: [http://localhost:4321/](http://localhost:4321/)
- **Panel Pengelola (Terproteksi)**: [http://localhost:4321/admin](http://localhost:4321/admin) (otomatis dialihkan ke `/admin/login`)
  - **Username Default**: `adminkd`
  - **Autentikasi**: Hash Bcrypt + Secure HMAC Session Cookies

---

### 2. Menjalankan dengan Docker (Rekomendasi untuk VPS / Server)

Project ini telah dilengkapi dengan `Dockerfile`, `docker-compose.yml`, dan paket FFmpeg otomatis di Alpine:

```bash
# 1. Build image dan jalankan container di latar belakang
docker compose up -d --build

# 2. Melihat log aplikasi secara live
docker compose logs -f

# 3. Menghentikan container
docker compose down
```

#### Keamanan Data (Persistence Volume):
- `./data:/app/data`: Seluruh database JSON (`db.json`) tersimpan di host sehingga tidak akan pernah hilang saat container diperbarui.
- `./public/uploads:/app/public/uploads`: Berkas video, thumbnail, intro, outro, dan watermark yang diunggah agen tersimpan langsung di server host.

---

## 📁 Struktur Direktori

```text
├── data/
│   └── db.json               # Database JSON atomic (settings, videos, categories, ads)
├── public/
│   ├── uploads/              # Berkas media (videos, thumbs, logos, intros, outros, watermarks)
│   └── default-thumb.jpg     # Thumbnail fallback
├── src/
│   ├── components/           # Komponen Astro (Header, Footer, SearchBar, VideoCard, AdBanner, StickyBanner)
│   ├── layouts/              # Layout.astro (Master layout dengan dynamic theme color & Popunder)
│   ├── lib/
│   │   ├── db.ts             # Interface database dan utilitas CRUD
│   │   ├── color.ts          # Helper konversi Hex ke HSL
│   │   └── videoProcessor.ts # Modul FFmpeg (Intro, Outro, Watermark concatenation)
│   ├── pages/
│   │   ├── admin/index.astro # Panel Agen (Enterprise SaaS UI tanpa emoji)
│   │   ├── api/              # Endpoint REST API (videos, categories, ads, upload, settings)
│   │   ├── category/[slug].astro # Arsip per kategori
│   │   ├── view/[slug].astro # Halaman pemutar video dan rekomendasi
│   │   ├── index.astro       # Halaman beranda
│   │   ├── trending.astro    # Halaman video populer
│   │   ├── search.astro      # Halaman pencarian
│   │   └── sitemap.xml.ts    # Sitemap XML otomatis
├── Dockerfile                # Multi-stage production build + FFmpeg
├── docker-compose.yml        # Docker compose dengan volume persistence
├── astro.config.mjs          # Konfigurasi Astro standalone
├── tailwind.config.mjs       # Konfigurasi Tailwind CSS
└── package.json
```

---

## 🔐 Keamanan & Rekomendasi Produksi
- Pastikan direktori `./data` dan `./public/uploads` memiliki izin tulis (*write permission*) pada user server.
- Untuk deployment publik di VPS, pasangkan reverse proxy seperti **Nginx** atau **Caddy** dengan sertifikat SSL gratis (Let's Encrypt).
- Ganti PIN admin default pada database (`settings.adminPin`).

---

## 📄 Lisensi
Hak Cipta © 2026. Seluruh hak cipta dilindungi undang-undang.
