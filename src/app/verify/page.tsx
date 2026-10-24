'use client';

import React, { useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import confetti from 'canvas-confetti';
import { useLanguage } from '@/lib/language-context';

interface VerificationResult {
  success: boolean;
  status: 'VERIFIED' | 'FORGED' | 'REVOKED';
  owner_name?: string;
  owner_id?: string;
  land_location?: string;
  land_area?: string;
  land_type?: string;
  certificate_number?: string;
  registry_name?: string;
  batch_id?: string;
  merkle_root?: string;
  merkle_proof?: string[];
  tx_hash?: string;
  block_number?: number;
  issued_at?: string;
  serial_number?: string;
  pdf_hash?: string;
  download_url?: string;
  tampered_download_url?: string;
  message?: string;
  participant_name?: string;
  participant_email?: string;
  event_name?: string;
}

const SAMPLE_VALID_HASH = '0x6a214a86b696c40e5250e7c2c923983405457e7daf1bb176e7a65711c1e8241c';
const SAMPLE_FORGED_HASH = '0xfa15e00000000000000000000000000000000000000000000000000000000000';

export default function VerifyPage() {
  const { lang, t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const computeHashFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const wordArray = CryptoJS.lib.WordArray.create(buffer as any);
          const hashHex = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
          resolve(`0x${hashHex}`);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleProcessFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert(lang === 'id' ? 'Silakan unggah file berformat PDF sertifikat tanah.' : 'Please upload a PDF land certificate file.');
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const hash = await computeHashFromFile(file);
      setComputedHash(hash);

      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_hash: hash }),
      });

      const data: VerificationResult = await res.json();
      setResult(data);

      if (data.status === 'VERIFIED') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F5A0', '#00F0FF', '#836EF9'],
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        status: 'FORGED',
        message: err.message || (lang === 'id' ? 'Gagal memverifikasi hash' : 'Failed to verify hash'),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsVerifying(true);
    setResult(null);
    setComputedHash(query.startsWith('0x') ? query : null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          pdf_hash: query.startsWith('0x') ? query : undefined,
        }),
      });

      const data: VerificationResult = await res.json();
      setResult(data);

      if (data.status === 'VERIFIED') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F5A0', '#00F0FF', '#836EF9'],
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        status: 'FORGED',
        message: err.message || 'Gagal memverifikasi pencarian',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTestHash = async (presetHashOrQuery: string) => {
    setSearchQuery(presetHashOrQuery);
    setComputedHash(presetHashOrQuery.startsWith('0x') ? presetHashOrQuery : null);
    setIsVerifying(true);
    setResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: presetHashOrQuery,
          pdf_hash: presetHashOrQuery.startsWith('0x') ? presetHashOrQuery : undefined,
        }),
      });
      const data = await res.json();
      setResult(data);

      if (data.status === 'VERIFIED') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F5A0', '#00F0FF', '#836EF9'],
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        status: 'FORGED',
        message: err.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
          {t('verify.badge')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          {t('verify.title')}
        </h1>
        <p className="text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {t('verify.desc')}
        </p>

        {/* 3 Status Summary */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
            STATUS 1: ASLI / TERVERIFIKASI
          </span>
          <span className="px-2.5 py-1 rounded bg-red-500/15 text-red-400 border border-red-500/30 font-semibold">
            STATUS 2: PALSU / TERINDIKASI MAFIA TANAH
          </span>
          <span className="px-2.5 py-1 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 font-semibold">
            STATUS 3: DIBLOKIR / DALAM SENGKETA (DISPUTE)
          </span>
        </div>
      </div>

      {/* Verification Inputs: 1) File Dropzone + 2) Text Search Input */}
      <div className="space-y-6">
        {/* Dropzone Container */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative p-10 sm:p-12 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            dragActive
              ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
              : 'border-emerald-500/30 hover:border-emerald-500/60 bg-surface-card hover:bg-surface-card-hover'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold mb-3">
            📄
          </div>

          <h3 className="text-lg font-bold text-white">
            {t('verify.dropzone_title')}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {t('verify.dropzone_sub')}
          </p>

          <div className="mt-5 text-[11px] text-gray-400 font-mono bg-black/40 px-3.5 py-1.5 rounded-lg border border-white/5">
            {t('verify.privacy_notice')}
          </div>
        </div>

        {/* Or Search by Certificate Number / Hash / NIK */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
          <label className="text-xs font-semibold text-gray-300 block">
            {lang === 'id' ? 'Atau Verifikasi via Nomor Sertifikat / NIK / Hash Dokumen:' : 'Or Verify via Certificate Number / NIK / Document Hash:'}
          </label>
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Contoh: SHM-01234/KB atau 3201010101900001 atau 0x6a214a..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isVerifying || !searchQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-all disabled:opacity-50"
            >
              {lang === 'id' ? 'Cek Keaslian' : 'Check Authenticity'}
            </button>
          </form>
        </div>

        {/* Quick Testing Bar */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-gray-400 font-semibold font-mono">
            {t('verify.qa_title')}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleTestHash(SAMPLE_VALID_HASH)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] transition-colors"
            >
              {t('verify.qa_valid_btn')}
            </button>
            <button
              type="button"
              onClick={() => handleTestHash('SHM-01234/KB')}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] transition-colors"
            >
              Uji No. Sertifikat (SHM)
            </button>
            <button
              type="button"
              onClick={() => handleTestHash(SAMPLE_FORGED_HASH)}
              className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-mono text-[11px] transition-colors"
            >
              {t('verify.qa_forged_btn')}
            </button>
          </div>
        </div>
      </div>

      {/* Verification Loading State */}
      {isVerifying && (
        <div className="p-6 rounded-2xl glass-panel border border-emerald-500/40 text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto mb-2"></div>
          <h4 className="font-bold text-white text-sm">
            {lang === 'id' ? 'Menghitung Nilai Hash & Memeriksa Monad Testnet...' : 'Computing Hash & Querying Monad...'}
          </h4>
          <p className="text-xs text-gray-400 font-mono">
            {lang === 'id' ? 'Memvalidasi bukti jalur Merkle terhadap Root on-chain' : 'Validating Merkle proof path against on-chain Root'}
          </p>
        </div>
      )}

      {/* RESULT 1: VALID */}
      {result && result.status === 'VERIFIED' && (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#061812] via-surface to-[#04120D] border border-emerald-500/60 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-500/20">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                STATUS: TERVERIFIKASI ASLI
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5">
                {t('verify.status_valid')}
              </h2>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/40 self-start sm:self-auto">
              ON-CHAIN MONAD
            </span>
          </div>

          {/* Land Certificate Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Nama Pemilik Tanah:</span>
              <div className="text-base font-bold text-white">{result.owner_name || result.participant_name}</div>
              <div className="text-gray-400 font-mono">NIK: {result.owner_id || result.participant_email || '-'}</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Jenis &amp; No. Sertifikat:</span>
              <div className="text-base font-bold text-emerald-400 font-mono">
                {result.land_type || 'SHM'} — {result.certificate_number || 'SHM-01234/KB'}
              </div>
              <div className="text-gray-400 font-mono">Serial: {result.serial_number || 'VRX-LAND-0001'}</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Luas Tanah:</span>
              <div className="text-base font-bold text-cyber-cyan font-mono">{result.land_area || '500 m²'}</div>
              <div className="text-gray-400 text-[11px]">Terdaftar pada: {result.registry_name || result.event_name || 'Kantor Pertanahan BPN'}</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Lokasi / Alamat Lahan:</span>
              <div className="text-gray-200 text-xs font-medium leading-snug">{result.land_location || 'DKI Jakarta'}</div>
              <div className="text-gray-500 font-mono text-[11px]">Batch ID: {result.batch_id || 'BPN-MONAD-01'}</div>
            </div>
          </div>

          {/* Cryptographic Proof Details */}
          <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/20 space-y-2 font-mono text-xs">
            <div className="text-emerald-300 font-semibold">Bukti Kriptografis Blockchain:</div>
            <div className="space-y-1 text-[11px] text-gray-300">
              <div>
                <span className="text-gray-500 block">Hash SHA-256 Dokumen:</span>
                <span className="text-white break-all">{computedHash || result.pdf_hash}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Merkle Root Monad:</span>
                <span className="text-cyber-cyan break-all">{result.merkle_root}</span>
              </div>
              <div className="pt-1">
                <span className="text-gray-500 block">ID Transaksi Monad:</span>
                <a
                  href={`https://testnet.monadexplorer.com/tx/${result.tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline break-all"
                >
                  {result.tx_hash}
                </a>
              </div>
            </div>
          </div>

          {/* Download & Tamper Test Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={result.download_url || `/api/certificates/${result.pdf_hash}`}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-all shadow-md shadow-emerald-500/20"
            >
              Unduh Sertifikat PDF Resmi
            </a>
            <a
              href={result.tampered_download_url || `/api/certificates/${result.pdf_hash}/tampered`}
              className="px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 text-xs font-semibold font-mono transition-all"
            >
              Uji Deteksi: Unduh Versi Rekayasa
            </a>
          </div>
        </div>
      )}

      {/* RESULT 2: FORGED */}
      {result && result.status === 'FORGED' && (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1c0808] to-surface border border-red-500/60 space-y-6">
          <div className="pb-5 border-b border-red-500/20">
            <span className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-wider block">
              STATUS: GAGAL / TERINDIKASI PALSU
            </span>
            <h2 className="text-2xl font-bold text-white mt-0.5">
              {t('verify.status_forged')}
            </h2>
          </div>

          <p className="text-sm text-gray-200 leading-relaxed">
            {t('verify.status_forged_desc')}
          </p>

          <div className="p-4 rounded-xl bg-black/60 border border-red-500/30 space-y-2 text-xs font-mono">
            <div className="text-red-400 font-semibold">Keterangan Deteksi Pemalsuan:</div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              {lang === 'id'
                ? 'Sistem memeriksa integritas berkas biner secara menyeluruh. Perubahan sekecil 1 karakter nama, nomor sertifikat, atau piksel gambar otomatis menghasilkan sidik jari yang berbeda dan menggagalkan bukti jalur Merkle di blockchain Monad.'
                : 'The system computes the entire binary document digest. Even a 1-pixel or 1-character modification invalidates the cryptographic Merkle root on the Monad network.'}
            </p>
            {(computedHash || result.pdf_hash) && (
              <div className="pt-1 text-[11px]">
                <span className="text-gray-500 block">Nilai Hash Terbaca (Tidak Terdaftar di Monad):</span>
                <span className="text-red-300 break-all">{computedHash || result.pdf_hash}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESULT 3: REVOKED */}
      {result && result.status === 'REVOKED' && (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#241304] to-surface border border-yellow-500/60 space-y-4">
          <div className="pb-4 border-b border-yellow-500/20">
            <span className="text-[11px] font-mono text-yellow-400 font-bold uppercase tracking-wider block">
              STATUS: DIBLOKIR / DALAM SENGKETA (DISPUTE)
            </span>
            <h2 className="text-2xl font-bold text-white mt-0.5">
              {t('verify.status_revoked')}
            </h2>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            {t('verify.status_revoked_desc')}
          </p>

          <div className="p-4 rounded-xl bg-black/50 border border-yellow-500/30 text-xs font-mono space-y-1">
            <div className="text-yellow-300 font-semibold">Detail Sertifikat yang Diblokir:</div>
            <div className="text-gray-300">Pemilik: {result.owner_name || result.participant_name}</div>
            <div className="text-gray-300">Nomor: {result.certificate_number || '-'}</div>
            <div className="text-gray-400 break-all text-[11px]">Hash: {result.pdf_hash}</div>
          </div>
        </div>
      )}
    </div>
  );
}
