'use client';

import React, { useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import confetti from 'canvas-confetti';
import { useLanguage } from '@/lib/language-context';

interface VerificationResult {
  success: boolean;
  status: 'VERIFIED' | 'FORGED' | 'REVOKED';
  participant_name?: string;
  participant_email?: string;
  event_name?: string;
  batch_id?: string;
  merkle_root?: string;
  merkle_proof?: string[];
  tx_hash?: string;
  block_number?: number;
  issued_at?: string;
  serial_number?: string;
  pdf_hash?: string;
  message?: string;
}

export default function VerifyPage() {
  const { lang, t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [computedHash, setComputedHash] = useState<string | null>(null);
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
      alert(lang === 'id' ? 'Silakan unggah file berformat PDF.' : 'Please upload a PDF file.');
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
          colors: ['#00F0FF', '#836EF9', '#00F5A0'],
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

  const handleTestHash = async (presetHash: string) => {
    setComputedHash(presetHash);
    setIsVerifying(true);
    setResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_hash: presetHash }),
      });
      const data = await res.json();
      setResult(data);

      if (data.status === 'VERIFIED') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#836EF9', '#00F5A0'],
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
        <span className="text-[11px] font-mono text-monad-400 uppercase tracking-widest bg-monad-900/60 border border-monad-500/30 px-3 py-1 rounded-full">
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
          <span className="px-2.5 py-1 rounded bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/30 font-semibold">
            STATUS 1: VALID
          </span>
          <span className="px-2.5 py-1 rounded bg-red-500/15 text-red-400 border border-red-500/30 font-semibold">
            STATUS 2: PALSU / HASH MISMATCH
          </span>
          <span className="px-2.5 py-1 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 font-semibold">
            STATUS 3: DICABUT (REVOKED)
          </span>
        </div>
      </div>

      {/* Dropzone Container */}
      <div className="space-y-4">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative p-10 sm:p-14 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            dragActive
              ? 'border-cyber-cyan bg-cyber-cyan/10 scale-[1.01]'
              : 'border-monad-500/30 hover:border-monad-500/60 bg-surface-card hover:bg-surface-card-hover'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <h3 className="text-lg font-bold text-white">
            {t('verify.dropzone_title')}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {t('verify.dropzone_sub')}
          </p>

          <div className="mt-6 text-[11px] text-gray-400 font-mono bg-black/40 px-3.5 py-1.5 rounded-lg border border-white/5">
            {t('verify.privacy_notice')}
          </div>
        </div>

        {/* Quick Testing Bar */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-gray-400 font-semibold">
            {t('verify.qa_title')}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleTestHash('0x7e5c9b2b5120a1c6a287955ad0e2168f44ff530372df0d9f48512140d046c823')
              }
              className="px-3 py-1.5 rounded bg-cyber-emerald/15 hover:bg-cyber-emerald/25 text-cyber-emerald border border-cyber-emerald/30 font-mono text-[11px] transition-colors"
            >
              {t('verify.qa_valid_btn')}
            </button>
            <button
              type="button"
              onClick={() =>
                handleTestHash('0xfa15e00000000000000000000000000000000000000000000000000000000000')
              }
              className="px-3 py-1.5 rounded bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-mono text-[11px] transition-colors"
            >
              {t('verify.qa_forged_btn')}
            </button>
          </div>
        </div>
      </div>

      {/* Verification Loading State */}
      {isVerifying && (
        <div className="p-6 rounded-2xl glass-panel border border-cyber-cyan/40 text-center space-y-2">
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
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#061812] to-surface border border-cyber-emerald/60 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-cyber-emerald/20">
            <div>
              <span className="text-[11px] font-mono text-cyber-emerald font-bold uppercase tracking-wider block">
                STATUS: TERVERIFIKASI
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5">
                {t('verify.status_valid')}
              </h2>
            </div>
            <span className="px-3 py-1 rounded bg-cyber-emerald/20 text-cyber-emerald text-xs font-mono font-bold border border-cyber-emerald/40 self-start sm:self-auto">
              ON-CHAIN MONAD
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Nama Peserta:</span>
              <div className="text-base font-bold text-white">{result.participant_name}</div>
              <div className="text-gray-400">{result.participant_email}</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Kegiatan / Program:</span>
              <div className="text-base font-bold text-cyber-cyan">{result.event_name}</div>
              <div className="text-gray-400 font-mono">Serial: {result.serial_number || 'VRX-2026-0001'}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-monad-500/20 space-y-2 font-mono text-xs">
            <div className="text-monad-300 font-semibold">Bukti Kriptografis:</div>
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
                  className="text-monad-400 hover:underline break-all"
                >
                  {result.tx_hash}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESULT 2: FORGED */}
      {result && result.status === 'FORGED' && (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1c0808] to-surface border border-red-500/60 space-y-6">
          <div className="pb-5 border-b border-red-500/20">
            <span className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-wider block">
              STATUS: GAGAL / PALSU
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
                ? 'Sistem memeriksa integritas berkas biner secara menyeluruh. Perubahan sekecil 1 karakter nama, nilai, atau gambar otomatis menghasilkan sidik jari yang berbeda dan menggagalkan bukti Merkle di blockchain Monad.'
                : 'The system computes the entire binary document digest. Even a 1-pixel or 1-character modification invalidates the cryptographic Merkle root on the Monad network.'}
            </p>
            {computedHash && (
              <div className="pt-1 text-[11px]">
                <span className="text-gray-500 block">Nilai Hash Terbaca (Tidak Terdaftar):</span>
                <span className="text-red-300 break-all">{computedHash}</span>
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
              STATUS: DIBATALKAN
            </span>
            <h2 className="text-2xl font-bold text-white mt-0.5">
              {t('verify.status_revoked')}
            </h2>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            {t('verify.status_revoked_desc')}
          </p>
        </div>
      )}
    </div>
  );
}
