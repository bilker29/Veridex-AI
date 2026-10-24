'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  id: {
    // Nav
    'nav.home': 'Beranda',
    'nav.about': 'Tentang',
    'nav.verify': 'Verifikasi',
    'nav.registry': 'Portal Penerbit (BPN/Notaris)',
    'nav.verify_btn': 'Verifikasi Dokumen',
    'nav.network': 'Jaringan Monad',

    // Home
    'home.badge': 'Protokol RWA Sertifikat Tanah Anti-Mafia',
    'home.title1': 'Tokenisasi Tanah.',
    'home.title2': 'Sertifikat On-Chain.',
    'home.title3': 'Anti Mafia Tanah.',
    'home.desc': 'Hentikan pemalsuan sertifikat ganda, human error draf AJB, dan lamanya verifikasi KPR. Gunakan AI Legal Parser dan blockchain Monad 10.000 TPS untuk menerbitkan sertifikat hak atas tanah yang tamper-proof, transparan, dan dapat diverifikasi instan dalam 1 detik.',
    'home.cta_verify': 'Verifikasi Sertifikat Tanah',
    'home.cta_about': 'Pelajari Solusi & Target',
    'home.cta_organizer': 'Portal Penerbit',
    'home.stat_tps': '10.000 TPS',
    'home.stat_tps_label': 'Kecepatan Jaringan',
    'home.stat_tx': '1 Transaksi',
    'home.stat_tx_label': 'Per Batch Merkle Root',
    'home.stat_gas': '< Rp 2',
    'home.stat_gas_label': 'Estimasi Biaya Gas',
    'home.stat_tamper': '1-Huruf / 1-Piksel',
    'home.stat_tamper_label': 'Deteksi Manipulasi',

    // 3 Sections on Home
    'home.pillars_title': 'Tiga Solusi Utama VERIDEX',
    'home.pillars_desc': 'Menggabungkan kecerdasan AI dan ketahanan Web3 Monad untuk membasmi mafia tanah di Indonesia.',
    'home.p1_tag': 'BAGIAN 1: PENERBIT (ISSUER)',
    'home.p1_title': 'Portal Penerbit (Developer, Notaris & BPN)',
    'home.p1_desc': 'Dilengkapi AI Legal Parser untuk mengekstrak draf Akta Jual Beli (AJB) tanpa salah ketik, dan menerbitkan ratusan sertifikat kavling secara massal ke Monad.',
    'home.p1_btn': 'Buka Portal Penerbit',
    'home.p2_tag': 'BAGIAN 2: PEMERIKSA (CHECKER)',
    'home.p2_title': 'Verifikasi Publik Instan 1 Detik',
    'home.p2_desc': 'Bank (KPR/Agunan), Calon Pembeli Tanah, dan Pengadilan cukup drag-and-drop file PDF. Sistem langsung mencocokkan hash dengan blockchain Monad.',
    'home.p2_btn': 'Buka Halaman Verifikasi',
    'home.p3_tag': 'BAGIAN 3: KRIPTOGRAFI',
    'home.p3_title': 'Kriptografi Merkle Tree & Fitur Blokir',
    'home.p3_desc': 'Sertifikat diubah menjadi sidik jari digital (Hash). Jika tanah dalam sengketa pengadilan, status dapat diblokir (revoked) on-chain.',
    'home.p3_btn': 'Pelajari Arsitektur',

    // About - Problems
    'about.badge': 'Tentang VERIDEX RWA',
    'about.title': 'Standar Baru Sertifikat Tanah Digital Anti-Mafia Tanah',
    'about.desc': 'Di Indonesia, urusan tanah selalu penuh dengan drama pemalsuan dan sengketa kepemilikan. VERIDEX hadir menyelesaikan 3 masalah krusial dengan AI dan Web3 Monad.',
    'about.problem_title': '1. Masalah Utama Pertanahan di Indonesia',
    'about.problem_desc': 'Tiga masalah besar yang melatarbelakangi lahirnya VERIDEX:',
    'about.prob1_title': 'Pemalsuan Dokumen & "Mafia Tanah"',
    'about.prob1_desc': 'Dokumen PDF sertifikat digital atau fisik sangat mudah dipalsukan menggunakan software edit foto/PDF. Hal ini melahirkan kasus Sertifikat Ganda di mana satu tanah diklaim oleh dua orang berbeda.',
    'about.prob2_title': 'Human Error & Lambatnya Administrasi',
    'about.prob2_desc': 'Notaris atau petugas BPN harus mengetik ulang data dari Akta Jual Beli (AJB) yang berlembar-lembar ke dalam sistem. Ini sangat lambat dan rawan typo (salah ketik luas tanah atau nama).',
    'about.prob3_title': 'Sulitnya Verifikasi bagi Pihak Ketiga',
    'about.prob3_desc': 'Jika seseorang ingin membeli tanah atau Bank ingin memberikan KPR, mereka butuh waktu berhari-hari untuk mengecek keaslian sertifikat ke kantor pertanahan.',

    // About - Target Audience
    'about.target_title': '2. Target Pengguna (Dua Sisi Ekosistem)',
    'about.target_desc': 'Sistem ini dirancang khusus untuk dua sisi interaksi yang saling melengkapi:',
    'about.target_issuer_title': 'Penerbit (Issuer)',
    'about.target_issuer_desc': '• Developer Perumahan: Membutuhkan penerbitan ratusan sertifikat kavling/rumah secara bersamaan dalam 1 transaksi on-chain.\n• Notaris / PPAT: Pihak yang membuat draf legal Akta Jual Beli (AJB) tanah bebas typo.\n• (Visi Jangka Panjang) BPN: Institusi negara yang melegalkan sertifikat tanah nasional.',
    'about.target_checker_title': 'Pemeriksa / Verifikator (Checker)',
    'about.target_checker_desc': '• Bank / Lembaga Keuangan: Untuk mengecek keaslian sertifikat yang dijadikan agunan (jaminan) pinjaman/KPR dalam 1 detik.\n• Calon Pembeli Tanah: Masyarakat biasa yang takut tertipu sertifikat ganda oleh mafia tanah.\n• Pengadilan: Untuk mengecek status sengketa atau pemblokiran suatu bidang tanah.',

    // About - Solutions
    'about.solution_title': '3. Solusi yang Ditawarkan VERIDEX',
    'about.solution_desc': 'VERIDEX menggabungkan AI dan Web3 untuk membasmi masalah pertanahan:',
    'about.sol1_title': 'AI Legal Parser (Anti-Human Error)',
    'about.sol1_desc': 'AI Gemini membaca draf legal (AJB) yang panjang dan secara otomatis mengekstrak data penting (Nama Pemilik, NIK/NIB, Luas Tanah, Lokasi) tanpa perlu diketik ulang.',
    'about.sol2_title': 'Tanda Tangan Kriptografi (Anti-Mafia Tanah)',
    'about.sol2_desc': 'File PDF Sertifikat Tanah tidak disimpan di database biasa, melainkan diubah menjadi Hash (sidik jari digital) dan dikunci ke blockchain Monad.',
    'about.sol3_title': 'Verifikasi Publik Instan 1 Detik',
    'about.sol3_desc': 'Calon pembeli atau Bank cukup melakukan drag-and-drop file PDF ke website VERIDEX. Dalam 1 detik, sistem mencocokkan hash dengan blockchain. Jika mafia tanah mengedit 1 huruf saja, sistem langsung menolak (INVALID).',
    'about.sol4_title': 'Fitur Blokir / Status Sengketa (Dispute)',
    'about.sol4_desc': 'Jika tanah sedang dalam sengketa hukum di pengadilan, penerbit/BPN bisa mencabut (revoke) dan memblokir validitas dokumen secara on-chain.',

    'about.security_title': 'Pemisahan Hak Akses & Keamanan Sistem',
    'about.security_desc': 'Mencegah celah keamanan dengan memisahkan portal penerbit terproteksi dengan portal verifikasi publik.',
    'about.public_scope': 'Akses Publik: Hanya dapat memeriksa keaslian sertifikat tanah (read-only) dengan pembacaan lokal di browser tanpa risiko kebocoran data.',
    'about.organizer_scope': 'Akses Penerbit Terdaftar: Wajib masuk dengan identitas resmi dan PIN keamanan untuk mendaftarkan tanah, menerbitkan batch, atau memblokir sertifikat sengketa.',

    // Verify
    'verify.badge': 'Verifikasi Publik Instan 1 Detik',
    'verify.title': 'Pemeriksaan Keaslian Sertifikat Tanah',
    'verify.desc': 'Dirancang untuk Bank (Cek Agunan KPR), Calon Pembeli Tanah, dan Pengadilan. Drag-and-drop file PDF sertifikat tanah Anda. Dalam 1 detik sistem mencocokkan sidik jari digital dokumen dengan blockchain Monad. Jika mafia tanah mengedit 1 huruf saja, sistem otomatis menolaknya.',
    'verify.dropzone_title': 'Letakkan File PDF Sertifikat Tanah Di Sini',
    'verify.dropzone_sub': 'atau klik untuk memilih file dari komputer Anda',
    'verify.privacy_notice': 'Jaminan Privasi: Dokumen diproses secara lokal di browser Anda. Hanya kode hash biner yang diverifikasi ke Monad.',
    'verify.status_valid': 'Sertifikat Tanah Asli dan Terverifikasi',
    'verify.status_valid_desc': 'Sertifikat tanah ini sah dan identik dengan data terdaftar pada blockchain Monad.',
    'verify.status_forged': 'Sertifikat Tanah Dimodifikasi / Terindikasi Mafia Tanah',
    'verify.status_forged_desc': 'Nilai hash dokumen tidak cocok dengan catatan on-chain Monad. Modifikasi sekecil 1 huruf atau 1 piksel gambar langsung ditolak oleh sistem sebagai dokumen palsu.',
    'verify.status_revoked': 'Sertifikat Tanah Sedang Diblokir / Dalam Sengketa',
    'verify.status_revoked_desc': 'Sertifikat tanah ini sedang dalam status sengketa hukum atau telah dibatalkan secara resmi di smart contract Monad. Segala transaksi atau agunan perbankan harus ditangguhkan.',
    'verify.qa_title': 'Uji Coba Langsung:',
    'verify.qa_valid_btn': 'Uji Sertifikat Valid (Budi)',
    'verify.qa_forged_btn': 'Uji Sertifikat Palsu (1-Huruf Diedit)',

    // Dashboard / BPN Portal
    'dash.auth_title': 'Portal Penerbit Sertifikat Tanah',
    'dash.auth_desc': 'Halaman ini dilindungi. Akses terbatas untuk Developer Perumahan, Notaris / PPAT, dan Petugas BPN terdaftar.',
    'dash.email_label': 'Email / Identitas Penerbit',
    'dash.pin_label': 'PIN Keamanan',
    'dash.login_btn': 'Masuk ke Portal Penerbit',
    'dash.cred_hint': 'Kredensial Tester: Email: bpn@veridex.id | PIN: 101430 (Klik untuk isi otomatis)',
    'dash.auth_badge': 'Status: Penerbit Resmi Terverifikasi',
    'dash.committee_name': 'Kantor Pertanahan Jakarta Selatan',
    'dash.logout_btn': 'Kunci Portal / Keluar',
    'dash.title': 'Dasbor Pengelolaan & Tokenisasi Tanah RWA',
    'dash.subtitle': 'Ekstraksi draf legal AJB dengan AI dan penerbitan sertifikat massal ke Monad.',
    'dash.registry_label': 'Nama Registrasi / Developer / Notaris / Batch:',
    'dash.ingest_title': 'AI Legal Parser (Ekstraksi Draf AJB / Data Tanah)',
    'dash.ingest_desc': 'AI membaca draf Akta Jual Beli (AJB) yang panjang dan secara otomatis mengekstrak Nama Pemilik, NIK/NIB, Luas Tanah, Lokasi, dan Jenis Hak tanpa perlu diketik ulang.',
    'dash.ingest_sample': '+ Tempel Contoh Draf Akta Jual Beli (AJB)',
    'dash.extract_btn': 'Jalankan AI Legal Parser',
    'dash.extracting_btn': 'AI Sedang Mengekstrak Data AJB...',
    'dash.preview_title': 'Tabel Pratinjau Aset Tanah (Anti-Typo)',
    'dash.preview_count': 'Aset Siap Terbit',
    'dash.add_row_btn': 'Tambah Baris Manual',
    'dash.issue_btn': 'Terbitkan Sertifikat Tanah ke Monad',
    'dash.issuing_btn': 'Sedang Memproses ke Blockchain Monad...',
    'dash.history_title': 'Riwayat Sertifikat Terbit & Fitur Blokir Sengketa',
    'dash.history_desc': 'Unduh sertifikat resmi atau aktifkan status Blokir Sengketa (Revoke) on-chain jika tanah sedang berperkara di pengadilan.',
  },
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.verify': 'Verify',
    'nav.registry': 'Issuer Portal (BPN/Notary)',
    'nav.verify_btn': 'Verify Document',
    'nav.network': 'Monad Network',

    // Home
    'home.badge': 'Anti-Fraud Land RWA Protocol',
    'home.title1': 'Land Tokenization.',
    'home.title2': 'On-Chain Certificates.',
    'home.title3': 'Zero Land Fraud.',
    'home.desc': 'Stop duplicate certificate scams, AJB typing errors, and multi-day mortgage verification delays. Leverage AI Legal Parsing and Monad 10,000 TPS blockchain to issue tamper-proof, transparent land title certificates verifiable in 1 second.',
    'home.cta_verify': 'Verify Land Certificate',
    'home.cta_about': 'Learn Solution & Target',
    'home.cta_organizer': 'Issuer Portal',
    'home.stat_tps': '10,000 TPS',
    'home.stat_tps_label': 'Network Speed',
    'home.stat_tx': '1 Transaction',
    'home.stat_tx_label': 'Per Batch Merkle Root',
    'home.stat_gas': '< $0.0001',
    'home.stat_gas_label': 'Estimated Gas Cost',
    'home.stat_tamper': '1-Char / 1-Pixel',
    'home.stat_tamper_label': 'Tamper Detection',

    // 3 Sections on Home
    'home.pillars_title': 'Three Core Pillars of VERIDEX',
    'home.pillars_desc': 'Combining AI intelligence with Monad Web3 security to eliminate land certificate fraud.',
    'home.p1_tag': 'PART 1: ISSUER',
    'home.p1_title': 'Issuer Portal (Developers, Notaries & BPN)',
    'home.p1_desc': 'Equipped with AI Legal Parser to extract Sales & Purchase Deeds (AJB) without typos, batch-issuing hundreds of certificates to Monad in a single tx.',
    'home.p1_btn': 'Open Issuer Portal',
    'home.p2_tag': 'PART 2: CHECKER',
    'home.p2_title': 'Instant 1-Second Public Verification',
    'home.p2_desc': 'Mortgage Banks, Property Buyers, and Courts drag-and-drop any PDF file to instantly match cryptographic digests against Monad.',
    'home.p2_btn': 'Open Verification Page',
    'home.p3_tag': 'PART 3: CRYPTOGRAPHY',
    'home.p3_title': 'Merkle Tree Cryptography & Dispute Locking',
    'home.p3_desc': 'Certificates are anchored as cryptographic hashes. If a land parcel enters legal dispute, validity can be revoked on-chain.',
    'home.p3_btn': 'Learn Architecture',

    // About - Problems
    'about.badge': 'About VERIDEX RWA',
    'about.title': 'The Next Standard for Anti-Fraud Land Title Certificates',
    'about.desc': 'Land administration is plagued with fraud and double ownership disputes. VERIDEX solves 3 core problems using AI and Monad Web3 technology.',
    'about.problem_title': '1. The 3 Major Land Problems',
    'about.problem_desc': 'Three critical pain points driving the creation of VERIDEX:',
    'about.prob1_title': 'Document Forgery & "Land Mafia"',
    'about.prob1_desc': 'Physical or digital PDF certificates are easily modified using graphic editing tools, causing duplicate title claims where two parties claim the same land parcel.',
    'about.prob2_title': 'Human Error & Administrative Delays',
    'about.prob2_desc': 'Notaries and land officers manually retype long multi-page deed documents (AJB), leading to frequent typos in land area, NIK, or names.',
    'about.prob3_title': 'Tedious Third-Party Verification',
    'about.prob3_desc': 'When citizens want to buy land or banks issue mortgages, verifying certificate authenticity takes days of manual bureaucratic checks.',

    // About - Target Audience
    'about.target_title': '2. Target Audience (Two-Sided Ecosystem)',
    'about.target_desc': 'Engineered to connect authorized Issuers with independent Verifiers:',
    'about.target_issuer_title': 'Issuers',
    'about.target_issuer_desc': '• Housing Developers: Batch-issuing hundreds of plot certificates in a single on-chain transaction.\n• Notaries / PPAT: Creating legal deed drafts (AJB) free from typing mistakes.\n• (Long-Term Vision) BPN: The national land agency authenticating official land titles.',
    'about.target_checker_title': 'Checkers / Verifiers',
    'about.target_checker_desc': '• Mortgage Banks: Verifying collateral certificates in 1 second before approving loans.\n• Property Buyers: Everyday citizens ensuring they are not buying fraudulent land titles.\n• Courts: Validating dispute and revocation statuses of disputed properties.',

    // About - Solutions
    'about.solution_title': '3. The VERIDEX Solution',
    'about.solution_desc': 'VERIDEX integrates AI and Web3 to eliminate land disputes across 4 key pillars:',
    'about.sol1_title': 'AI Legal Parser (Anti-Human Error)',
    'about.sol1_desc': 'AI analyzes lengthy deed drafts (AJB) and automatically extracts Owner Name, NIK/NIB, Area, Location, and Title Type without manual retyping.',
    'about.sol2_title': 'Cryptographic Signatures (Anti-Fraud)',
    'about.sol2_desc': 'PDF certificates are not stored in vulnerable centralized databases, but anchored as SHA-256 hashes inside Monad Merkle Trees.',
    'about.sol3_title': 'Instant 1-Second Verification',
    'about.sol3_desc': 'Buyers or banks drag-and-drop the PDF. If fraudsters alter even a single character or pixel, the system immediately rejects it as INVALID.',
    'about.sol4_title': 'On-Chain Dispute Lock (Revocation)',
    'about.sol4_desc': 'If a land title is under legal dispute in court, issuers can revoke document validity on-chain to prevent fraudulent transfers or loans.',

    'about.security_title': 'Access Segregation & System Security',
    'about.security_desc': 'Separating restricted issuance workflows from open, privacy-preserving public verification.',
    'about.public_scope': 'Public Access: Read-only local browser verification with zero document data leakage to public servers.',
    'about.organizer_scope': 'Registered Issuer Access: Multi-factor authentication required to ingest deeds, batch-issue, or trigger dispute locks.',

    // Verify
    'verify.badge': 'Instant 1-Second Public Verification',
    'verify.title': 'Land Title Authenticity Verification',
    'verify.desc': 'Built for Mortgage Banks, Land Buyers, Notaries, and Courts. Drag and drop any land certificate PDF. In 1 second, the system checks its cryptographic hash against Monad. Any single-letter modification is rejected.',
    'verify.dropzone_title': 'Drag & Drop Land Certificate PDF Here',
    'verify.dropzone_sub': 'or click to browse from your computer',
    'verify.privacy_notice': 'Privacy Guarantee: Document is processed locally in your browser. Only the cryptographic hash is queried on Monad.',
    'verify.status_valid': 'Authentic and Verified Land Certificate',
    'verify.status_valid_desc': 'This land certificate is genuine and matches the official on-chain record on Monad.',
    'verify.status_forged': 'Modified Document / Fraud Detected',
    'verify.status_forged_desc': 'Document hash does not match Monad records. Even a 1-character or 1-pixel change is immediately rejected as forged.',
    'verify.status_revoked': 'Certificate Under Dispute / Revoked',
    'verify.status_revoked_desc': 'This certificate is flagged under active legal dispute or has been revoked on Monad. Any banking transactions must be halted.',
    'verify.qa_title': 'Instant Testing:',
    'verify.qa_valid_btn': 'Test Valid Certificate (Budi)',
    'verify.qa_forged_btn': 'Test Forged Certificate (1-Char Altered)',

    // Dashboard / BPN Portal
    'dash.auth_title': 'Land Title Issuer Portal',
    'dash.auth_desc': 'Restricted access for Housing Developers, Notaries / PPAT, and BPN Officers.',
    'dash.email_label': 'Issuer Email / Identity',
    'dash.pin_label': 'Security PIN',
    'dash.login_btn': 'Sign In to Issuer Portal',
    'dash.cred_hint': 'Tester Credentials: Email: bpn@veridex.id | PIN: 101430 (Click to auto-fill)',
    'dash.auth_badge': 'Status: Verified Authorized Issuer',
    'dash.committee_name': 'South Jakarta Land Registry Office',
    'dash.logout_btn': 'Lock Portal / Sign Out',
    'dash.title': 'RWA Land Title Management & Tokenization',
    'dash.subtitle': 'Extract AJB legal drafts with AI and batch-issue verifiable certificates to Monad.',
    'dash.registry_label': 'Registry Batch / Developer / Notary Name:',
    'dash.ingest_title': 'AI Legal Parser (AJB Legal Draft Ingestion)',
    'dash.ingest_desc': 'AI analyzes long deed drafts (AJB) and extracts Owner Name, NIK, Area, Location, and Title Type without manual retyping.',
    'dash.ingest_sample': '+ Insert Sample AJB Legal Draft',
    'dash.extract_btn': 'Run AI Legal Parser',
    'dash.extracting_btn': 'AI Extracting AJB Data...',
    'dash.preview_title': 'Land Asset Preview Table (Anti-Typo)',
    'dash.preview_count': 'Assets Ready',
    'dash.add_row_btn': 'Add Manual Row',
    'dash.issue_btn': 'Issue Land Certificates to Monad',
    'dash.issuing_btn': 'Processing to Monad Blockchain...',
    'dash.history_title': 'Issued Certificates & Dispute Lock',
    'dash.history_desc': 'Download official certificates or trigger On-Chain Dispute Locks if a parcel enters court litigation.',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'id',
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('id');

  useEffect(() => {
    const saved = localStorage.getItem('veridex_lang') as Language;
    if (saved === 'id' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('veridex_lang', newLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations.id[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
