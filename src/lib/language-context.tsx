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
    'nav.registry': 'Portal BPN',
    'nav.verify_btn': 'Verifikasi Dokumen',
    'nav.network': 'Jaringan Monad',

    // Home
    'home.badge': 'Protokol RWA Sertifikat Tanah',
    'home.title1': 'Tokenisasi Tanah.',
    'home.title2': 'Sertifikat On-Chain.',
    'home.title3': 'Anti Mafia Tanah.',
    'home.desc': 'Hentikan pemalsuan sertifikat tanah dan sengketa kepemilikan. Gunakan teknologi blockchain Monad untuk menerbitkan sertifikat hak atas tanah yang tahan manipulasi, transparan, dan dapat diverifikasi secara publik dengan biaya mendekati nol.',
    'home.cta_verify': 'Verifikasi Sertifikat Tanah',
    'home.cta_about': 'Pelajari Sistem',
    'home.cta_organizer': 'Portal Pertanahan',
    'home.stat_tps': '10.000 TPS',
    'home.stat_tps_label': 'Kecepatan Jaringan',
    'home.stat_tx': '1 Transaksi',
    'home.stat_tx_label': 'Per Batch Merkle Root',
    'home.stat_gas': '< Rp 2',
    'home.stat_gas_label': 'Estimasi Biaya Gas',
    'home.stat_tamper': '1-Piksel',
    'home.stat_tamper_label': 'Deteksi Manipulasi',

    // 3 Sections on Home
    'home.pillars_title': 'Tiga Pilar Utama Sistem',
    'home.pillars_desc': 'Dirancang khusus untuk digitalisasi pertanahan dan verifikasi publik tanpa birokrasi.',
    'home.p1_tag': 'BAGIAN 1',
    'home.p1_title': 'Portal Kantor Pertanahan',
    'home.p1_desc': 'Akses khusus bagi petugas BPN resmi untuk mendaftarkan data kepemilikan tanah dan menerbitkan sertifikat ke blockchain.',
    'home.p1_btn': 'Buka Portal BPN',
    'home.p2_tag': 'BAGIAN 2',
    'home.p2_title': 'Portal Verifikasi Publik',
    'home.p2_desc': 'Layanan publik bagi notaris, bank, dan masyarakat untuk memeriksa keaslian sertifikat tanah langsung di browser.',
    'home.p2_btn': 'Buka Halaman Verifikasi',
    'home.p3_tag': 'BAGIAN 3',
    'home.p3_title': 'Mesin Kriptografis RWA',
    'home.p3_desc': 'Mesin otomatis yang menggabungkan ribuan sertifikat tanah menjadi satu Merkle Root tunggal di Monad.',
    'home.p3_btn': 'Pelajari Arsitektur',

    // About
    'about.badge': 'Tentang Veridex RWA',
    'about.title': 'Standar Baru Sertifikat Tanah Digital Anti-Pemalsuan',
    'about.desc': 'Solusi terintegrasi untuk mengatasi mafia tanah, pemalsuan sertifikat, dan sengketa kepemilikan lahan melalui teknologi blockchain.',
    'about.problem_title': 'Masalah Pertanahan di Indonesia',
    'about.problem_desc': 'Sertifikat tanah dalam bentuk file PDF atau bahkan dokumen fisik sangat rentan dipalsukan. Kasus sertifikat ganda, mafia tanah, dan sengketa kepemilikan merugikan jutaan masyarakat setiap tahun.',
    'about.solution_title': 'Solusi Kriptografi Monad',
    'about.solution_desc': 'Setiap sertifikat tanah dihitung nilai sidik jari SHA-256 murni dan dirangkum dalam struktur Merkle Tree. Bukti disimpan pada smart contract Monad sehingga manipulasi sekecil apapun akan langsung terdeteksi.',
    'about.security_title': 'Pemisahan Hak Akses dan Keamanan',
    'about.security_desc': 'Untuk mencegah penyalahgunaan, portal penerbitan sertifikat tanah dilindungi oleh sistem otentikasi petugas BPN resmi. Publik hanya diberikan akses verifikasi tanpa kemampuan menerbitkan sertifikat.',
    'about.public_scope': 'Akses Publik: Hanya dapat memeriksa keaslian sertifikat tanah (read-only) dengan pembacaan lokal di perangkat masing-masing.',
    'about.organizer_scope': 'Akses Petugas BPN: Wajib masuk dengan identitas resmi dan PIN keamanan untuk mendaftarkan tanah, menerbitkan, atau membatalkan sertifikat.',

    // Verify
    'verify.badge': 'Verifikasi Publik',
    'verify.title': 'Pemeriksaan Keaslian Sertifikat Tanah',
    'verify.desc': 'Tarik dan lepaskan file PDF sertifikat tanah ke dalam kotak di bawah ini. Sistem memeriksa sidik jari dokumen secara lokal tanpa mengirimkan isi dokumen ke server.',
    'verify.dropzone_title': 'Letakkan File PDF Sertifikat Tanah Di Sini',
    'verify.dropzone_sub': 'atau klik untuk memilih file dari komputer Anda',
    'verify.privacy_notice': 'Jaminan Privasi: Dokumen diproses secara lokal di browser Anda. Hanya kode hash yang diverifikasi.',
    'verify.status_valid': 'Sertifikat Tanah Asli dan Terverifikasi',
    'verify.status_valid_desc': 'Sertifikat tanah ini sah dan identik dengan data terdaftar pada blockchain Monad.',
    'verify.status_forged': 'Sertifikat Tanah Telah Dimodifikasi atau Palsu',
    'verify.status_forged_desc': 'Nilai hash dokumen tidak cocok dengan catatan resmi. Sertifikat tanah ini terindikasi hasil rekayasa atau pemalsuan.',
    'verify.status_revoked': 'Sertifikat Tanah Telah Dicabut',
    'verify.status_revoked_desc': 'Sertifikat tanah ini pernah diterbitkan namun telah dibatalkan secara resmi oleh Kantor Pertanahan.',
    'verify.qa_title': 'Uji Coba Langsung:',
    'verify.qa_valid_btn': 'Uji Sertifikat Valid (Budi)',
    'verify.qa_forged_btn': 'Uji Sertifikat Palsu',

    // Dashboard / BPN Portal
    'dash.auth_title': 'Masuk Portal Kantor Pertanahan',
    'dash.auth_desc': 'Halaman ini dilindungi. Hanya petugas BPN terdaftar yang berhak menerbitkan sertifikat tanah.',
    'dash.email_label': 'Email / Identitas Petugas BPN',
    'dash.pin_label': 'PIN Keamanan',
    'dash.login_btn': 'Masuk ke Portal',
    'dash.cred_hint': 'Kredensial Petugas: Email: bpn@veridex.id | PIN: 101430',
    'dash.auth_badge': 'Status: Petugas BPN Terverifikasi',
    'dash.committee_name': 'Kantor Pertanahan Jakarta Selatan',
    'dash.logout_btn': 'Kunci Portal / Keluar',
    'dash.title': 'Dasbor Pengelolaan Sertifikat Tanah',
    'dash.subtitle': 'Kelola pendaftaran data tanah dan penerbitan sertifikat massal ke Monad.',
    'dash.registry_label': 'Nama Registrasi / Batch Kantor:',
    'dash.ingest_title': 'Input Data Kepemilikan Tanah',
    'dash.ingest_desc': 'Tempelkan data pemilik tanah dari formulir pendaftaran, arsip BPN, atau sumber lain di sini.',
    'dash.ingest_sample': '+ Tempel Contoh Data Tanah',
    'dash.extract_btn': 'Jalankan Ekstraksi AI',
    'dash.extracting_btn': 'AI Sedang Merapikan Data...',
    'dash.preview_title': 'Tabel Pratinjau Aset Tanah',
    'dash.preview_count': 'Aset Terdaftar',
    'dash.add_row_btn': 'Tambah Baris',
    'dash.issue_btn': 'Terbitkan Sertifikat Tanah ke Monad',
    'dash.issuing_btn': 'Sedang Memproses ke Blockchain...',
    'dash.history_title': 'Riwayat Sertifikat Tanah Terbit',
    'dash.history_desc': 'Unduh sertifikat tanah resmi atau cabut status dokumen jika diperlukan.',
  },
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.verify': 'Verify',
    'nav.registry': 'BPN Portal',
    'nav.verify_btn': 'Verify Document',
    'nav.network': 'Monad Network',

    // Home
    'home.badge': 'RWA Land Certificate Protocol',
    'home.title1': 'Land Tokenization.',
    'home.title2': 'On-Chain Certificates.',
    'home.title3': 'Anti Land Fraud.',
    'home.desc': 'Eliminate land certificate forgery and ownership disputes. Use Monad blockchain technology to issue tamper-proof, transparent, and publicly verifiable land title certificates at near-zero cost.',
    'home.cta_verify': 'Verify Land Certificate',
    'home.cta_about': 'Learn More',
    'home.cta_organizer': 'Land Registry Portal',
    'home.stat_tps': '10,000 TPS',
    'home.stat_tps_label': 'Network Speed',
    'home.stat_tx': '1 Transaction',
    'home.stat_tx_label': 'Per Batch Merkle Root',
    'home.stat_gas': '< $0.0001',
    'home.stat_gas_label': 'Estimated Gas Cost',
    'home.stat_tamper': '1-Pixel',
    'home.stat_tamper_label': 'Tamper Detection',

    // 3 Sections on Home
    'home.pillars_title': 'Three System Pillars',
    'home.pillars_desc': 'Built specifically for land registry digitalization and bureaucracy-free public verification.',
    'home.p1_tag': 'PART 1',
    'home.p1_title': 'Land Registry Office Portal',
    'home.p1_desc': 'Restricted access for authorized BPN officials to register land ownership data and issue certificates on-chain.',
    'home.p1_btn': 'Open BPN Portal',
    'home.p2_tag': 'PART 2',
    'home.p2_title': 'Public Verification Portal',
    'home.p2_desc': 'Public portal for notaries, banks, and citizens to verify land certificate authenticity directly in the browser.',
    'home.p2_btn': 'Open Verification Page',
    'home.p3_tag': 'PART 3',
    'home.p3_title': 'RWA Cryptographic Engine',
    'home.p3_desc': 'Automated engine merging thousands of land certificates into a single Merkle Root on Monad.',
    'home.p3_btn': 'Learn Architecture',

    // About
    'about.badge': 'About Veridex RWA',
    'about.title': 'The New Standard for Tamper-Proof Digital Land Certificates',
    'about.desc': 'An integrated solution preventing land certificate fraud, double ownership, and title disputes through blockchain technology.',
    'about.problem_title': 'Land Title Problems in Indonesia',
    'about.problem_desc': 'Land certificates in PDF or physical form are easily forged. Cases of duplicate certificates, land mafia, and ownership disputes harm millions of people every year.',
    'about.solution_title': 'The Monad Cryptographic Solution',
    'about.solution_desc': 'Each land certificate produces a pure SHA-256 fingerprint anchored into a Merkle Tree on Monad Testnet smart contracts. Any single-pixel modification is detected immediately.',
    'about.security_title': 'Separation of Access and Security',
    'about.security_desc': 'To prevent misuse, the land certificate issuance portal is strictly protected by official BPN officer authentication. The public is granted verification rights only.',
    'about.public_scope': 'Public Access: Read-only land certificate verification executed locally on the client browser with zero data leaks.',
    'about.organizer_scope': 'BPN Officer Access: Authorized credentials and security PIN required to register land data, publish batches, or revoke certificates.',

    // Verify
    'verify.badge': 'Public Verification',
    'verify.title': 'Land Certificate Authenticity Check',
    'verify.desc': 'Drag and drop any land certificate PDF. The system checks document integrity locally without sending files to any server.',
    'verify.dropzone_title': 'Drag & Drop Land Certificate PDF Here',
    'verify.dropzone_sub': 'or click to browse from your computer',
    'verify.privacy_notice': 'Privacy Guarantee: Document is processed locally in your browser. Only the cryptographic hash is verified.',
    'verify.status_valid': 'Authentic and Verified Land Certificate',
    'verify.status_valid_desc': 'This land certificate is genuine and matches the official on-chain record on Monad.',
    'verify.status_forged': 'Land Certificate Modified or Forged',
    'verify.status_forged_desc': 'Document hash does not match any registered certificate. Tampering or forgery has been detected.',
    'verify.status_revoked': 'Land Certificate Revoked',
    'verify.status_revoked_desc': 'This land certificate was previously issued but has been officially cancelled by the Land Registry Office.',
    'verify.qa_title': 'Instant Testing:',
    'verify.qa_valid_btn': 'Test Valid Certificate (Budi)',
    'verify.qa_forged_btn': 'Test Forged Certificate',

    // Dashboard / BPN Portal
    'dash.auth_title': 'Land Registry Portal Login',
    'dash.auth_desc': 'This page is restricted. Only authorized BPN officers may issue land certificates.',
    'dash.email_label': 'BPN Officer Email / Username',
    'dash.pin_label': 'Security PIN',
    'dash.login_btn': 'Sign In to Portal',
    'dash.cred_hint': 'Officer Credentials: Email: bpn@veridex.id | PIN: 101430',
    'dash.auth_badge': 'Status: Verified BPN Officer',
    'dash.committee_name': 'South Jakarta Land Registry Office',
    'dash.logout_btn': 'Lock Portal / Sign Out',
    'dash.title': 'Land Certificate Management Dashboard',
    'dash.subtitle': 'Manage land ownership data registration and batch-issue certificates to Monad.',
    'dash.registry_label': 'Registry Batch / Office Name:',
    'dash.ingest_title': 'Land Ownership Data Input',
    'dash.ingest_desc': 'Paste land owner data from registration forms, BPN archives, or other sources here.',
    'dash.ingest_sample': '+ Insert Sample Land Data',
    'dash.extract_btn': 'Execute AI Extraction',
    'dash.extracting_btn': 'AI is Organizing Data...',
    'dash.preview_title': 'Land Asset Preview Table',
    'dash.preview_count': 'Assets Ready',
    'dash.add_row_btn': 'Add Row',
    'dash.issue_btn': 'Issue Land Certificates to Monad',
    'dash.issuing_btn': 'Processing to Blockchain...',
    'dash.history_title': 'Issued Land Certificates History',
    'dash.history_desc': 'Download official land certificate PDFs or revoke document validity when required.',
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
