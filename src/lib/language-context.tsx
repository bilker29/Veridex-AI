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
    'nav.organizer': 'Portal Panitia',
    'nav.verify_btn': 'Verifikasi Dokumen',
    'nav.network': 'Jaringan Monad',

    // Home
    'home.badge': 'Platform Kredensial Monad',
    'home.title1': 'Penilaian Cerdas.',
    'home.title2': 'Penerbitan Kecepatan Tinggi.',
    'home.title3': 'Bukti Anti-Pemalsuan.',
    'home.desc': 'Hentikan pemalsuan sertifikat dan administrasi manual. Gunakan kecerdasan buatan untuk merapikan data peserta secara instan dan struktur Merkle Tree pada blockchain Monad untuk menerbitkan ribuan sertifikat tahan manipulasi dengan biaya mendekati nol.',
    'home.cta_verify': 'Verifikasi Dokumen Publik',
    'home.cta_about': 'Pelajari Sistem',
    'home.cta_organizer': 'Portal Penyelenggara',
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
    'home.pillars_desc': 'Dirancang khusus untuk efisiensi penyelenggara dan verifikasi publik tanpa birokrasi.',
    'home.p1_tag': 'BAGIAN 1',
    'home.p1_title': 'Dasbor Penyelenggara Terdaftar',
    'home.p1_desc': 'Akses khusus bagi panitia berwenang untuk merapikan data mentah dan menerbitkan sertifikat massal ke blockchain.',
    'home.p1_btn': 'Buka Dasbor Panitia',
    'home.p2_tag': 'BAGIAN 2',
    'home.p2_title': 'Portal Verifikasi Publik',
    'home.p2_desc': 'Layanan publik bagi HRD, institusi, dan auditor untuk memeriksa keaslian file PDF langsung di browser.',
    'home.p2_btn': 'Buka Halaman Verifikasi',
    'home.p3_tag': 'BAGIAN 3',
    'home.p3_title': 'Mesin Otomatis Kriptografis',
    'home.p3_desc': 'Mesin otomatis yang menggabungkan ribuan sertifikat menjadi satu Merkle Root tunggal di Monad.',
    'home.p3_btn': 'Pelajari Arsitektur',

    // About
    'about.badge': 'Tentang Veridex',
    'about.title': 'Standar Baru Kredensial Digital Tanpa Pemalsuan',
    'about.desc': 'Solusi terintegrasi untuk mengatasi manipulasi file digital dan inefisiensi administrasi dokumen.',
    'about.problem_title': 'Masalah Utama Dokumen Konvensional',
    'about.problem_desc': 'Sertifikat digital dalam bentuk file PDF biasa sangat rentan diedit menggunakan aplikasi pengolah gambar. Pihak penerima kerja atau kampus kesulitan mengonfirmasi keaslian dokumen tanpa proses verifikasi manual yang lambat.',
    'about.solution_title': 'Solusi Kriptografi Monad',
    'about.solution_desc': 'Setiap dokumen dihitung nilai sidik jari SHA-256 murni dan dirangkum dalam struktur Merkle Tree. Bukti disimpan pada smart contract Monad sehingga manipulasi sekecil apapun akan langsung terdeteksi.',
    'about.security_title': 'Pemisahan Hak Akses dan Keamanan',
    'about.security_desc': 'Untuk mencegah penyalahgunaan, portal penerbitan dilindungi oleh sistem otentikasi panitia resmi. Publik hanya diberikan akses verifikasi tanpa kemampuan mencetak sertifikat.',
    'about.public_scope': 'Akses Publik: Hanya dapat memeriksa keaslian dokumen (read-only) dengan pembacaan lokal di perangkat masing-masing.',
    'about.organizer_scope': 'Akses Panitia: Wajib masuk dengan identitas resmi dan PIN keamanan untuk menginput data, menerbitkan, atau membatalkan dokumen.',

    // Verify
    'verify.badge': 'Verifikasi Publik',
    'verify.title': 'Pemeriksaan Keaslian Sertifikat',
    'verify.desc': 'Tarik dan lepaskan file PDF ke dalam kotak di bawah ini. Sistem memeriksa sidik jari dokumen secara lokal tanpa mengirimkan isi dokumen ke server.',
    'verify.dropzone_title': 'Letakkan File PDF Sertifikat Di Sini',
    'verify.dropzone_sub': 'atau klik untuk memilih file dari komputer Anda',
    'verify.privacy_notice': 'Jaminan Privasi: Dokumen diproses secara lokal di browser Anda. Hanya kode hash yang diverifikasi.',
    'verify.status_valid': 'Dokumen Asli dan Terverifikasi',
    'verify.status_valid_desc': 'Sertifikat ini sah dan identik dengan data terdaftar pada blockchain Monad.',
    'verify.status_forged': 'Dokumen Telah Dimodifikasi atau Palsu',
    'verify.status_forged_desc': 'Nilai hash dokumen tidak cocok dengan catatan resmi. Dokumen ini terindikasi hasil rekayasa.',
    'verify.status_revoked': 'Dokumen Telah Dicabut',
    'verify.status_revoked_desc': 'Sertifikat ini pernah diterbitkan namun telah dibatalkan secara resmi oleh panitia.',
    'verify.qa_title': 'Uji Coba Langsung:',
    'verify.qa_valid_btn': 'Uji Contoh Valid (Budi)',
    'verify.qa_forged_btn': 'Uji Contoh Palsu',

    // Dashboard / Organizer
    'dash.auth_title': 'Masuk Portal Penyelenggara',
    'dash.auth_desc': 'Halaman ini dilindungi. Hanya panitia resmi terdaftar yang berhak menerbitkan sertifikat.',
    'dash.email_label': 'Email / Identitas Panitia',
    'dash.pin_label': 'PIN Keamanan Panitia',
    'dash.login_btn': 'Masuk ke Dasbor',
    'dash.cred_hint': 'Kredensial Panitia Resmi: Email: panitia@veridex.id | PIN: 101430',
    'dash.auth_badge': 'Status: Penyelenggara Terdaftar',
    'dash.committee_name': 'Panitia Monad Blitz 2026',
    'dash.logout_btn': 'Kunci Portal / Keluar',
    'dash.title': 'Dasbor Pengelolaan Sertifikat',
    'dash.subtitle': 'Kelola ekstraksi data peserta dan penerbitan sertifikat massal ke Monad.',
    'dash.event_label': 'Nama Kegiatan / Acara:',
    'dash.ingest_title': 'Input Data Mentah Peserta',
    'dash.ingest_desc': 'Tempelkan teks daftar hadir dari Zoom, Telegram, atau formulir pendaftaran di sini.',
    'dash.ingest_sample': '+ Tempel Contoh Teks Percakapan',
    'dash.extract_btn': 'Jalankan Ekstraksi AI',
    'dash.extracting_btn': 'AI Sedang Merapikan Data...',
    'dash.preview_title': 'Tabel Pratinjau Peserta',
    'dash.preview_count': 'Peserta Terdaftar',
    'dash.add_row_btn': 'Tambah Baris',
    'dash.issue_btn': 'Terbitkan Sertifikat ke Monad',
    'dash.issuing_btn': 'Sedang Memproses ke Blockchain...',
    'dash.registry_title': 'Daftar Sertifikat Terbit & Pencabutan',
    'dash.registry_desc': 'Unduh sertifikat resmi atau cabut status dokumen jika diperlukan.',
  },
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.verify': 'Verify',
    'nav.organizer': 'Organizer Portal',
    'nav.verify_btn': 'Verify Document',
    'nav.network': 'Monad Network',

    // Home
    'home.badge': 'Monad Credential Platform',
    'home.title1': 'Smart Assessment.',
    'home.title2': 'High-Speed Issuance.',
    'home.title3': 'Unforgeable Proof.',
    'home.desc': 'Eliminate certificate forgery and manual administration. Use automated artificial intelligence to parse attendee data and Merkle Tree architecture on the Monad blockchain to issue thousands of tamper-proof credentials at near-zero cost.',
    'home.cta_verify': 'Verify Public Document',
    'home.cta_about': 'Learn More',
    'home.cta_organizer': 'Organizer Portal',
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
    'home.pillars_desc': 'Built specifically for organizer efficiency and bureaucracy-free public verification.',
    'home.p1_tag': 'PART 1',
    'home.p1_title': 'Registered Organizer Dashboard',
    'home.p1_desc': 'Restricted access for authorized committees to organize raw data and batch-issue credentials on-chain.',
    'home.p1_btn': 'Open Organizer Dashboard',
    'home.p2_tag': 'PART 2',
    'home.p2_title': 'Public Verification Portal',
    'home.p2_desc': 'Public portal for employers, universities, and auditors to verify PDF authenticity directly in the browser.',
    'home.p2_btn': 'Open Verification Page',
    'home.p3_tag': 'PART 3',
    'home.p3_title': 'Under-the-Hood Cryptographic Engine',
    'home.p3_desc': 'Automated engine merging thousands of certificates into a single Merkle Root on Monad.',
    'home.p3_btn': 'Learn Architecture',

    // About
    'about.badge': 'About Veridex',
    'about.title': 'The Next Standard for Tamper-Proof Digital Credentials',
    'about.desc': 'An integrated solution preventing digital document tampering and administrative inefficiency.',
    'about.problem_title': 'The Flaw in Traditional Documents',
    'about.problem_desc': 'Standard PDF certificates can be easily modified using graphic editors. Employers and institutions struggle to verify authenticity without slow manual follow-ups.',
    'about.solution_title': 'The Monad Cryptographic Solution',
    'about.solution_desc': 'Each document produces a pure SHA-256 fingerprint anchored into a Merkle Tree on Monad Testnet smart contracts. Any single-pixel modification is detected immediately.',
    'about.security_title': 'Separation of Access and Security',
    'about.security_desc': 'To prevent arbitrary issuance, the publishing studio is strictly locked behind official committee authentication. The public is granted verification rights only.',
    'about.public_scope': 'Public Access: Read-only verification executed locally on the client browser with zero data leaks.',
    'about.organizer_scope': 'Organizer Access: Authorized credentials and security PIN required to import data, publish batches, or revoke credentials.',

    // Verify
    'verify.badge': 'Public Verification',
    'verify.title': 'Certificate Authenticity Check',
    'verify.desc': 'Drag and drop any PDF certificate. The system checks document integrity locally without sending files to any server.',
    'verify.dropzone_title': 'Drag & Drop Certificate PDF Here',
    'verify.dropzone_sub': 'or click to browse from your computer',
    'verify.privacy_notice': 'Privacy Guarantee: Document is processed locally in your browser. Only the cryptographic hash is verified.',
    'verify.status_valid': 'Authentic and Verified Document',
    'verify.status_valid_desc': 'This certificate is genuine and matches the official on-chain record on Monad.',
    'verify.status_forged': 'Document Modified or Forged',
    'verify.status_forged_desc': 'Document hash does not match any registered certificate. Tampering has been detected.',
    'verify.status_revoked': 'Document Revoked',
    'verify.status_revoked_desc': 'This certificate was previously issued but has been officially cancelled by the issuer.',
    'verify.qa_title': 'Instant Testing:',
    'verify.qa_valid_btn': 'Test Valid Sample (Budi)',
    'verify.qa_forged_btn': 'Test Forged Sample',

    // Dashboard / Organizer
    'dash.auth_title': 'Organizer Portal Login',
    'dash.auth_desc': 'This page is restricted. Only authorized committee members may issue certificates.',
    'dash.email_label': 'Organizer Email / Username',
    'dash.pin_label': 'Security PIN',
    'dash.login_btn': 'Sign In to Dashboard',
    'dash.cred_hint': 'Official Committee Credentials: Email: panitia@veridex.id | PIN: 101430',
    'dash.auth_badge': 'Status: Verified Organizer',
    'dash.committee_name': 'Monad Blitz Committee 2026',
    'dash.logout_btn': 'Lock Portal / Sign Out',
    'dash.title': 'Certificate Management Dashboard',
    'dash.subtitle': 'Manage attendee data parsing and batch-issue credentials to Monad.',
    'dash.event_label': 'Event / Program Name:',
    'dash.ingest_title': 'Raw Attendee Data Ingestion',
    'dash.ingest_desc': 'Paste unformatted messages from Zoom, Telegram, or attendance sheets here.',
    'dash.ingest_sample': '+ Insert Sample Chat Text',
    'dash.extract_btn': 'Execute AI Extraction',
    'dash.extracting_btn': 'AI is Organizing Data...',
    'dash.preview_title': 'Attendee Preview Table',
    'dash.preview_count': 'Attendees Ready',
    'dash.add_row_btn': 'Add Row',
    'dash.issue_btn': 'Issue Certificates to Monad',
    'dash.issuing_btn': 'Processing to Blockchain...',
    'dash.registry_title': 'Issued Certificates & Revocation',
    'dash.registry_desc': 'Download official PDFs or revoke document validity when required.',
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
