# 🎓 CampusQuest (JASTAP & JARVIS) — Web App On-Demand Kampus

> **Platform On-Demand Ekosistem Mahasiswa berbasis Peer-to-Peer Bounty (inDrive Model)**  
> Dibangun sesuai rancangan blueprint teknis: Next.js 16 (App Router), Tailwind CSS, Lucide Icons, Supabase Integration, dan PWA Support.

---

## 🌟 Fitur Utama yang Telah Diimplementasikan

### 1. Dual-Mode Persona Switcher (Customer & Runner)
- **Switcher Dinamis Instan**: Berganti peran kapan saja antara **Customer** (pemesan quest) dan **Runner** (eksekutor quest) melalui toggle di navbar.
- **Customer Mode**:
  - Dashboard pemesanan dengan kartu shortcut **JASTAP** & **JARVIS**.
  - Form pembuatan quest dengan **penentuan harga bounty sendiri ala inDrive**.
  - Timeline status progress interaktif (6 tahapan visual dinamis).
  - Pembayaran QRIS Statis & Bank Transfer dengan fitur upload bukti transfer otomatis.
  - Validasi OTP 6-digit untuk menyelesaikan transaksi.
  - Sistem Rating & Ulasan 1–5 bintang untuk runner.
- **Runner Mode**:
  - Quest Board real-time dengan filter kategori (*The Agent* vs *The Machinist*).
  - Aksi penugasan langsung: **Terima (Accept)** atau **Tolak (Decline)** tanpa sistem tawar-menawar (sesuai spesifikasi halaman 8).
  - Checkbox aksi progresif (OTW, Belanja/Servis, Pengantaran).
  - Input biaya aktual belanjaan/sparepart (`item_cost`) + unggah foto nota/struk belanja dengan kompresi otomatis.
  - Tampilan kode **OTP 6-digit** untuk diberikan ke pemesan saat serah terima.
  - Dashboard Saldo Dompet & simulasi pencairan ke e-wallet (GoPay, OVO, DANA, BCA).

### 2. Dua Kategori Layanan Utama
- **🎒 JASTAP ("The Agent")**:
  - Jasa Titip belanja makanan/minuman kantin, print dokumen skripsi/tugas, fotokopi buku, dan belanja kebutuhan kamar asrama.
  - Fitur counter kuantiti `[-] [qty] [+]`, pilihan satuan (*porsi, pcs, lembar, bungkus, cup, paket*), titik ambil dan titik antar.
- **⚙️ JARVIS ("The Machinist")**:
  - Jasa servis laptop/gadget mahasiswa (install Windows/Linux, bersihkan kipas & ganti pasta thermal, perbaikan port charger/tombol).
  - Input keluhan kerusakan spesifik, tipe perangkat, dan lokasi pengerjaan.

### 3. Keamanan Mahasiswa & Watermark Otomatis pada KTM
- **Canvas Watermark Otomatis (Page 8)**: Foto KTM yang diunggah akan otomatis dibubuhkan watermark diagonal tebal:  
  `"HANYA UNTUK VERIFIKASI AKUN CAMPUS QUEST"` beserta NIM dan tanggal untuk mencegah penyalahgunaan identitas mahasiswa.
- **Kompresi Gambar Sisi Klien (Client-Side Compression)**: Foto nota belanja, bukti transfer QRIS, dan foto KTM dikompres otomatis di canvas browser sebelum disimpan untuk menghemat kuota mahasiswa.

### 4. Live Chat Interaktif & Lampiran Gambar
- Obrolan langsung per-Quest antara pemesan dan runner.
- Dukungan kirim pesan teks + unggah foto nota belanja atau foto kondisi perangkat yang diservis.
- Efek suara notifikasi real-time menggunakan **Web Audio API**.

### 5. Radar Peta Kampus & Geolocation API
- Peta visual kawasan kampus terpadu dengan titik-titik kumpul: *Kantin Pusat/Vokasi, Perpustakaan Pusat, Gedung Rektorat, Lab Komputer Teknik, Asrama Mahasiswa Gedung A & B, Fotokopi Barokah, dan Gerbang Utama*.
- Deteksi koordinat GPS pengguna menggunakan browser Geolocation API.
- Animasi pergerakan runner di sepanjang rute saat status quest sedang *On The Way* atau *Delivering*.

### 6. PWA (Progressive Web App) Siap Pasang
- `manifest.json` lengkap dengan konfigurasi *standalone* dan tema `#0ea5e9`.
- Service Worker (`public/sw.js`) untuk caching aset offline dan fondasi Web Push Notification.
- Banner promosi pemasangan aplikasi (*In-App Install Prompt*) dengan panduan khusus pengguna Safari iOS.

---

## 🗄️ Skema Database Supabase (PostgreSQL)

File DDL lengkap tersedia di: [`supabase_schema.sql`](file:///c:/Users/USER/Documents/techno/supabase_schema.sql).

Tabel yang dibuat:
1. `profiles`: Profil mahasiswa, NIM unik, status verifikasi KTM, mode aktif, rating, dan saldo dompet.
2. `quests`: Data pesanan, kategori JASTAP/JARVIS, bounty jasa, item cost nota, OTP, status transaksi, dan metode bayar.
3. `chat_messages`: Pesan obrolan per quest beserta lampiran foto.
4. `reviews`: Rating 1-5 bintang dan ulasan performa runner.
5. Row Level Security (RLS) policies untuk keamanan data antar mahasiswa.

---

## 🚀 Cara Menjalankan Aplikasi

1. **Jalankan Development Server**:
   ```powershell
   npm run dev
   ```
2. Buka browser di: [http://localhost:3000](http://localhost:3000)

3. **(Opsional) Menghubungkan Supabase Cloud**:
   Salin file `.env.example` menjadi `.env.local` lalu isi kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   *Catatan: Tanpa Supabase pun aplikasi langsung berjalan 100% menggunakan reactive local persistence dengan data mock kampus realistis!*

---

## 📁 Struktur Berkas

```
techno/
├── public/
│   ├── manifest.json            # Konfigurasi PWA Web App Manifest
│   ├── sw.js                    # Service Worker caching & push handler
│   ├── icon-192.png             # Ikon PWA 192x192
│   └── icon-512.png             # Ikon PWA 512x512
├── src/
│   ├── app/
│   │   ├── globals.css          # Styling global & scrollbar modern
│   │   ├── layout.tsx           # Layout root dengan metadata PWA
│   │   └── page.tsx             # Halaman utama CampusQuest
│   ├── components/
│   │   ├── Navbar.tsx           # Header dengan switcher Customer/Runner & saldo
│   │   ├── BottomNav.tsx        # Navigasi bawah untuk perangkat mobile
│   │   ├── CustomerDashboard.tsx# Dashboard pemesan (JASTAP & JARVIS)
│   │   ├── RunnerDashboard.tsx  # Dashboard runner (Quest Board & eksekusi)
│   │   ├── CreateQuestModal.tsx # Modal form quest + inDrive bounty slider
│   │   ├── QuestDetailModal.tsx # Detail quest, stepper aksi, nota, bayar & OTP
│   │   ├── LiveChatDrawer.tsx   # Live chat per-quest dengan kirim foto
│   │   ├── CampusMap.tsx        # Radar peta kampus interaktif & Geolocation
│   │   ├── KtmVerificationModal.tsx # Upload KTM + Canvas Auto-Watermark
│   │   ├── WalletModal.tsx      # Dompet saldo & penarikan e-wallet
│   │   └── PwaInstallBanner.tsx # Banner panduan install PWA (Android & iOS)
│   ├── context/
│   │   └── CampusQuestContext.tsx # Central state manager & reactive store
│   ├── lib/
│   │   ├── audio.ts             # Web Audio API synthesizer efek suara
│   │   ├── watermark.ts         # Otomatisasi watermark canvas foto KTM
│   │   ├── image-compressor.ts  # Kompresi gambar browser sisi klien
│   │   ├── supabase.ts          # Supabase client helper
│   │   └── mock-data.ts         # Data awal quest, landmark, dan chat
│   └── types/
│       └── campus-quest.ts      # Definisi TypeScript model
└── supabase_schema.sql          # DDL Script Supabase PostgreSQL
```
