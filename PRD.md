# VERIDEX RWA 📜🛡️
**Tokenisasi Tanah. Sertifikat On-Chain. Anti Mafia Tanah.**

Platform Protokol Real World Assets (RWA) Pertanahan berbasis AI Legal Parser dan Kriptografi Merkle Tree di Jaringan Monad Testnet (10.000 TPS).

---

## 1. Masalah Utama (The Problems)
Di Indonesia, urusan pertanahan sarat dengan sengketa dan kerentanan administratif. VERIDEX memfokuskan solusi pada 3 masalah besar:

1. **Pemalsuan Dokumen & "Mafia Tanah"**:
   - Dokumen PDF sertifikat digital atau fisik sangat mudah dipalsukan menggunakan software edit foto/PDF.
   - Hal ini melahirkan kasus **Sertifikat Ganda**, di mana satu bidang tanah diklaim oleh dua pihak berbeda dengan dokumen yang tampak identik.
2. **Human Error & Lambatnya Administrasi**:
   - Notaris / PPAT atau petugas BPN harus mengetik ulang data dari Akta Jual Beli (AJB) yang berlembar-lembar ke dalam sistem.
   - Proses ini sangat lambat dan rawan typo (salah ketik luas tanah, NIK, NIB, atau nama pemilik).
3. **Sulitnya Verifikasi bagi Pihak Ketiga**:
   - Jika masyarakat ingin membeli tanah atau Bank ingin memberikan fasilitas KPR (Kredit Pemilikan Rumah), dibutuhkan waktu berhari-hari untuk mengecek keabsahan sertifikat ke kantor pertanahan secara manual.

---

## 2. Target Pengguna (Target Audience)
Sistem VERIDEX menghubungkan dua sisi ekosistem pertanahan:

### A. Penerbit (Issuer) — Portal Terdaftar
- **Developer Perumahan**: Membutuhkan penerbitan ratusan sertifikat kavling/rumah secara massal dalam 1 kali transaksi on-chain.
- **Notaris / PPAT**: Pihak yang membuat draf legal Akta Jual Beli (AJB) dan membutuhkan validasi instan bebas human error.
- **BPN (Badan Pertanahan Nasional)**: Visi jangka panjang sebagai otoritas negara penerbit hak atas tanah yang legal dan transparan.

### B. Pemeriksa / Verifikator (Checker) — Portal Publik Terbuka
- **Bank / Lembaga Keuangan**: Memverifikasi keaslian sertifikat tanah yang diajukan sebagai agunan pinjaman/KPR dalam hitungan detik.
- **Calon Pembeli Tanah**: Masyarakat biasa yang ingin memastikan tanah yang dibeli bebas sengketa dan bukan hasil manipulasi mafia tanah.
- **Pengadilan / Aparat Penegak Hukum**: Memeriksa status sengketa dan riwayat blokir on-chain suatu bidang tanah.

---

## 3. Solusi yang Ditawarkan VERIDEX (The Solutions)
VERIDEX menggabungkan kecerdasan AI dan ketahanan Web3 Monad:

1. **AI Legal Parser (Anti-Human Error)**:
   - AI secara cerdas membaca draf legal (Akta Jual Beli / AJB) yang panjang dan mengekstrak data penting (*Nama Pemilik, NIK/NIB, Luas Tanah, Lokasi, Jenis Hak*) tanpa perlu diketik ulang manual.
2. **Tanda Tangan Kriptografi (Anti-Mafia Tanah)**:
   - File PDF Sertifikat Tanah tidak disimpan di database terpusat yang rentan disusupi, melainkan dihitung nilai sidik jari SHA-256 biner dan dikunci ke blockchain Monad menggunakan struktur **Merkle Tree**.
3. **Verifikasi Publik Instan**:
   - Calon pembeli atau Bank cukup melakukan *drag-and-drop* file PDF ke website VERIDEX atau mencari nomor sertifikat.
   - Dalam 1 detik, sistem mencocokkan hash PDF dengan blockchain Monad. Jika mafia tanah mengedit 1 huruf atau piksel saja di dokumen tersebut, sistem langsung menolaknya (**INVALID / PALSU**).
4. **Fitur Blokir / Status Sengketa (Dispute / Revocation)**:
   - Jika suatu bidang tanah sedang dalam perkara sengketa hukum di pengadilan, penerbit/BPN dapat mengunci dan mencabut (*revoke*) validitas dokumen secara on-chain di smart contract Monad.

---

## 4. Keunggulan Arsitektur Monad & Merkle Tree
- **10.000 TPS Monad**: Mampu menangani pendaftaran tanah nasional tanpa bottleneck jaringan.
- **1 Transaksi untuk Ribuan Sertifikat**: Menggunakan Merkle Root, biaya gas per sertifikat tanah menjadi kurang dari Rp 2 per batch.
- **Zero Data Leak**: Verifikasi dokumen biner dilakukan 100% di browser pengguna tanpa mengunggah berkas rahasia ke server publik.