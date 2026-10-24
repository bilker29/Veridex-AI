VERIDEX 📜🛡️
Smart Assessment. High-Speed Issuance. Unforgeable Proof.

A Next-Gen Credentialing Platform Built for Monad Blitz Hackathon

Live Demo • Pitch Deck • Smart Contract Explorer

📌 Tentang Project
VERIDEX adalah platform penerbitan sertifikat digital yang mengatasi masalah lambatnya administrasi manual dan rentannya pemalsuan dokumen PDF.

Dengan menggabungkan Gemini AI untuk merapikan data kotor secara instan dan arsitektur kriptografi Merkle Tree di jaringan Monad Testnet, penyelenggara dapat menerbitkan ribuan sertifikat tamper-proof (anti-palsu) dengan biaya gas mendekati nol dan kecepatan tinggi.

Sertifikat yang diterbitkan dapat diverifikasi oleh siapa saja (HRD/Auditor) hanya dengan melakukan drag-and-drop file PDF ke portal publik. Modifikasi 1 piksel atau 1 karakter saja pada dokumen akan langsung terdeteksi sebagai dokumen palsu.

✨ Fitur Utama (Hackathon MVP)
🤖 AI Data Ingestion: Copy-paste teks acak dari Telegram/Zoom, dan biarkan AI mengekstraknya menjadi JSON terstruktur (Nama & Email) siap terbit.

⚡ High-Speed Batch Issuance: Menerbitkan ribuan sertifikat dengan 1 kali transaksi on-chain ke Monad menggunakan struktur Merkle Root.

🛡️ Cryptographic PDF Verification: Drag-and-drop file PDF ke portal web. Sistem akan mencocokkan hash lokal dokumen dengan bukti on-chain.

🚫 Revocation System: Penyelenggara dapat mencabut (revoke) sertifikat bermasalah, dan statusnya akan diperbarui menjadi Invalid/Revoked secara permanen di blockchain.

🏗️ Arsitektur Sistem & Tech Stack
Platform ini menggunakan pendekatan pemisahan service untuk memaksimalkan kecepatan selama pengembangan:

1. Frontend (Next.js & Tailwind CSS)
UI/UX Dasbor Organizer dan Portal Verifikasi Publik.

Membaca buffer PDF lokal (client-side) saat verifikasi tanpa perlu mengunggah file ke server.

2. Backend API (Node.js & Express)
PDF Engine (pdf-lib): Meng- generate sertifikat dan QR Code.

Crypto Engine (crypto & merkletreejs): Menghitung hash SHA-256 murni dari buffer PDF dan menyusunnya menjadi Merkle Tree.

AI Integration: Menjembatani prompt ke Gemini 1.5 Flash API dengan output JSON murni.

3. Blockchain Layer (Solidity & Monad Testnet)
Smart Contract VeridexRegistry.sol menyimpan pemetaan batchId ke merkleRoot.

Efisiensi maksimal: Ribuan data peserta tidak disimpan di dalam blok, melainkan hanya menyisakan jejak Merkle Root tunggal yang memvalidasi semuanya.

4. Database (PostgreSQL / Supabase)
Menyimpan relasi off-chain (Event, Data Peserta) dan Merkle Proof spesifik per pengguna untuk mempermudah pemanggilan fungsi verifikasi.

🔄 Alur Kerja Sistem (Data Flow)
Ingestion: Organizer mem- paste data mentah ➔ AI mengonversi menjadi tabel JSON.

Off-Chain Execution: Klik "Issue" ➔ BE generate PDF ➔ BE hitung Hash PDF ➔ BE bangun Merkle Tree.

On-Chain Committing: BE mengambil Merkle Root ➔ Kirim 1 tx ke Smart Contract Monad.

Verification: Publik drag & drop PDF ➔ Sistem hitung hash PDF tersebut ➔ Validasi hash + Proof melawan Root di Smart Contract.

💻 Panduan Instalasi (Local Development)
Prasyarat
Node.js (v18+)

Akun Supabase (Database)

API Key Gemini

Private Key RPC Monad Testnet

1. Clone Repository
Bash
git clone https://github.com/username/veridex.git
cd veridex
2. Setup Backend
Bash
cd backend
npm install
Buat file .env di folder backend:

Cuplikan kode
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
MONAD_RPC_URL=https://rpc.testnet.monad.xyz
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
Jalankan server backend:

Bash
npm run dev
3. Setup Frontend
Bash
cd frontend
npm install
Buat file .env.local di folder frontend:

Cuplikan kode
NEXT_PUBLIC_API_URL=http://localhost:3001
Jalankan client frontend:

Bash
npm run dev
4. Smart Contract Deployment (Opsional)
Bash
cd smart-contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network monadTestnet
🧪 Skenario Pengujian (QA Checklist)
Bagi juri yang ingin menguji keandalan sistem:

Validasi Modifikasi: Unduh PDF sertifikat yang valid dari dasbor. Verifikasi di halaman publik ➔ 🟩 VERIFIED.

Tamper Test: Buka PDF tersebut di PDF Editor atau ganti namanya sedikit saja. Verifikasi ulang di halaman publik ➔ 🟥 FORGED / HASH MISMATCH.

AI Test: Masukkan teks berantakan (contoh: "abdul hadir ya min abdul@mail.com. oh iya si budi juga budi@x.com"). AI akan otomatis merapikannya ke dalam tabel tanpa error.

📜 Lisensi & Keterangan
Proyek ini dibangun secara khusus untuk [Nama Hackathon - Monad Blitz Jogja / ETHJKT 2026].Out of scope for MVP: Login otentikasi peserta dan custom PDF builder (menggunakan desain PDF hardcoded).


Technical PRD & Implementation Guide: VERIDEX
Document Type: Developer Specification
Phase: Hackathon Execution (48 Hours)
Stack: Next.js (FE), Node.js (BE), Gemini API (AI), Supabase (DB), Solidity (Monad)

Dokumen ini adalah acuan teknis untuk tim developer. Semua penamaan endpoint, struktur database, dan alur logika harus mengacu pada dokumen ini agar Frontend, Backend, dan Smart Contract developer dapat bekerja secara paralel tanpa blocking.

1. Database Schema (Supabase / PostgreSQL)
Buat dua tabel utama di Supabase.

Tabel: events
Menyimpan data acara dan root dari batch sertifikat.

id (uuid, primary key)

name (varchar) - Contoh: "Monad Blitz Hackathon 2026"

batch_id (varchar, unique) - Identifier unik untuk smart contract.

merkle_root (varchar) - Disimpan setelah batch diproses.

tx_hash (varchar) - Bukti transaksi di explorer Monad.

created_at (timestamp)

Tabel: participants
Menyimpan data penerima dan bukti spesifik (Merkle Proof) untuk verifikasi.

id (uuid, primary key)

event_id (uuid, foreign key ke events)

name (varchar)

email (varchar)

pdf_hash (varchar, unique) - Hash SHA-256 dari dokumen PDF.

merkle_proof (jsonb) - Array of strings yang berisi proof untuk leaf ini.

status (varchar) - Default: VALID. Jika dicabut: REVOKED.

2. API Endpoints Specification (Node.js / Express)
Gunakan format JSON untuk semua request/response. Base URL: http://localhost:3001/api

A. Ekstraksi Data via AI
Endpoint: POST /extract

Fungsi: Mengirim raw text ke Gemini 1.5 Flash dan mengembalikan array JSON.

Request Body:

JSON
{ "raw_text": "budi (budi@gmail.com) hadir bang, terus ada andi@mail.com namanya andi" }
Response (200 OK):

JSON
{
  "success": true,
  "data": [
    { "name": "Budi", "email": "budi@gmail.com" },
    { "name": "Andi", "email": "andi@mail.com" }
  ]
}
(Wajib gunakan konfigurasi responseMimeType: "application/json" pada Gemini SDK).

B. Proses Batch & Minting
Endpoint: POST /issue

Fungsi: Generate PDF, hitung hash, buat Merkle Tree, simpan ke DB, dan tembak transaksi ke Monad Testnet.

Request Body:

JSON
{
  "event_name": "Monad Blitz 2026",
  "participants": [
    { "name": "Budi", "email": "budi@gmail.com" }
  ]
}
Response (200 OK):

JSON
{
  "success": true,
  "message": "Batch processed and committed to Monad",
  "data": {
    "batch_id": "EVT-12345",
    "tx_hash": "0xabc123...",
    "merkle_root": "0xdef456..."
  }
}
C. Verifikasi Dokumen
Endpoint: POST /verify

Fungsi: Memeriksa apakah hash valid secara off-chain (DB) dan on-chain (Smart Contract).

Request Body: (Frontend yang menghitung hash dari PDF)

JSON
{ "pdf_hash": "0x789ghi..." }
Response (200 OK - Valid):

JSON
{
  "success": true,
  "status": "VERIFIED",
  "participant_name": "Budi",
  "event_name": "Monad Blitz 2026",
  "tx_hash": "0xabc123..."
}
Response (400 Bad Request - Invalid/Tampered):

JSON
{ "success": false, "status": "FORGED", "message": "Hash mismatch or document forged" }
3. Frontend Architecture (Next.js)
Struktur halaman dan state management untuk klien.

Pages / Routes:
/ (Landing Page): UI statis sederhana untuk presentasi (Hero section, Tech Stack).

/dashboard (Organizer Area):

Component A: <TextArea> untuk menempelkan raw data.

Action: Tombol "AI Extract" ➔ panggil POST /extract.

Component B: <DataTable> menampilkan hasil dari AI. Bisa diedit manual jika perlu.

Action: Tombol "Issue Certificates" ➔ panggil POST /issue. Tampilkan loading modal dengan spinner saat BE sedang memproses blockchain.

/verify (Public Portal):

Component: <Dropzone> (gunakan library react-dropzone).

Logic:

User drop file PDF.

Klien membaca file sebagai ArrayBuffer.

Klien menghitung hash SHA-256 menggunakan crypto-js.

Mengirim hash (bukan file) ke POST /verify.

Menampilkan UI Hijau (Valid) atau Merah (Palsu).

4. Smart Contract Interface (VeridexRegistry.sol)
Spesifikasi Solidity untuk Monad Testnet. Gunakan Hardhat atau Foundry.

Solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract VeridexRegistry {
    address public owner;
    
    // Mapping: batchId => merkleRoot
    mapping(string => bytes32) public batchRoots;
    // Mapping: certificateHash => isRevoked
    mapping(bytes32 => bool) public revokedCertificates;

    event BatchPublished(string batchId, bytes32 merkleRoot, uint256 timestamp);
    event CertificateRevoked(bytes32 certHash, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function publishBatchRoot(string memory batchId, bytes32 merkleRoot) external onlyOwner {
        batchRoots[batchId] = merkleRoot;
        emit BatchPublished(batchId, merkleRoot, block.timestamp);
    }

    function verifyCertificate(string memory batchId, bytes32 certHash, bytes32[] calldata proof) external view returns (bool) {
        if (revokedCertificates[certHash]) {
            return false;
        }
        bytes32 root = batchRoots[batchId];
        return MerkleProof.verify(proof, root, certHash);
    }

    function revokeCertificate(bytes32 certHash) external onlyOwner {
        revokedCertificates[certHash] = true;
        emit CertificateRevoked(certHash, block.timestamp);
    }
}
5. Environment Variables Configuration
Buat standardisasi .env agar tidak ada error saat disatukan.

Frontend (.env.local):

Cuplikan kode
NEXT_PUBLIC_API_URL=http://localhost:3001/api
Backend (.env):

Cuplikan kode
PORT=3001
# Supabase
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...

# AI Layer
GEMINI_API_KEY=AIzaSy...

# Web3 / Monad
MONAD_RPC_URL=https://rpc.testnet.monad.xyz
WALLET_PRIVATE_KEY=0x123abc...
CONTRACT_ADDRESS=0x456def...
6. Execution Timeline (48h Hackathon Plan)
Jam 1-4 (Setup & Contract): Deploy VeridexRegistry.sol ke Monad Testnet. Setup proyek FE & BE. Inisialisasi Supabase.

Jam 5-12 (AI & Data Flow): Selesaikan POST /extract dengan Gemini. Buat UI Dasbor di FE untuk menampilkan tabel.

Jam 13-24 (Core Engine - Backend Heavy): Tulis logika generate PDF (pdf-lib), proses hashing, pembuatan Merkle Tree, dan koneksi ethers.js untuk eksekusi fungsi publishBatchRoot.

Jam 25-36 (Verifikasi & Publik): Integrasikan logika kalkulasi hash lokal di Next.js saat drop PDF, hubungkan ke POST /verify, dan kerjakan animasi UI Berhasil/Gagal.

Jam 37-48 (Polishing & Pitch Prep): Siapkan skenario dummy data, uji coba skenario dokumen palsu (edit nama di PDF), dan siapkan presentasi.