'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export default function AboutPage() {
  const { lang, t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-[11px] font-mono uppercase tracking-widest text-monad-400 bg-monad-900/60 border border-monad-500/30 px-3 py-1 rounded-full">
          {t('about.badge')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t('about.title')}
        </h1>
        <p className="text-base text-gray-300 leading-relaxed">
          {t('about.desc')}
        </p>
      </div>

      {/* The Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#180808] to-surface border border-red-500/30 space-y-4">
          <h2 className="text-xl font-bold text-white">
            {t('about.problem_title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {t('about.problem_desc')}
          </p>
          <div className="p-3.5 rounded-xl bg-black/40 border border-red-500/20 text-xs font-mono text-red-300 space-y-1">
            <div className="font-semibold text-white">
              {lang === 'id' ? 'Kelemahan Sistem Konvensional:' : 'Conventional Document Flaws:'}
            </div>
            <div>• {lang === 'id' ? 'File PDF mudah disunting nama & nilainya' : 'PDF files easily edited with design tools'}</div>
            <div>• {lang === 'id' ? 'Tanda tangan gambar dapat diduplikasi' : 'Graphic signatures can be copied effortlessly'}</div>
            <div>• {lang === 'id' ? 'Verifikasi manual lambat dan memakan waktu' : 'Manual verification is slow and inefficient'}</div>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#061812] to-surface border border-cyber-emerald/30 space-y-4">
          <h2 className="text-xl font-bold text-white">
            {t('about.solution_title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {t('about.solution_desc')}
          </p>
          <div className="p-3.5 rounded-xl bg-black/40 border border-cyber-emerald/20 text-xs font-mono text-cyber-emerald space-y-1">
            <div className="font-semibold text-white">
              {lang === 'id' ? 'Kelebihan Kriptografi Veridex:' : 'Veridex Cryptographic Advantages:'}
            </div>
            <div>• {lang === 'id' ? 'Deteksi Manipulasi 1-Piksel berbasis SHA-256' : '1-Pixel SHA-256 Tamper Detection'}</div>
            <div>• {lang === 'id' ? '1 Transaksi On-Chain untuk ribuan dokumen' : '1 Single On-Chain Tx for thousands of files'}</div>
            <div>• {lang === 'id' ? 'Didukung kecepatan tinggi jaringan Monad' : 'High speed network finality on Monad'}</div>
          </div>
        </div>
      </div>

      {/* Security Architecture & Separation of Concerns */}
      <div className="p-8 rounded-2xl glass-panel border border-monad-500/30 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {t('about.security_title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            {t('about.security_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          {/* Public Access */}
          <div className="p-6 rounded-xl bg-black/50 border border-white/5 space-y-3">
            <div className="text-cyber-cyan font-bold font-mono">
              {lang === 'id' ? '1. PORTAL PUBLIK (TERBUKA BEBAS)' : '1. PUBLIC PORTAL (OPEN ACCESS)'}
            </div>
            <p className="text-gray-300 leading-relaxed">
              {t('about.public_scope')}
            </p>
            <div className="pt-2">
              <Link
                href="/verify"
                className="text-cyber-cyan hover:underline font-mono text-xs"
              >
                {lang === 'id' ? 'Buka Halaman Verifikasi →' : 'Open Verification Page →'}
              </Link>
            </div>
          </div>

          {/* Protected Organizer */}
          <div className="p-6 rounded-xl bg-black/50 border border-monad-500/30 space-y-3">
            <div className="text-monad-300 font-bold font-mono">
              {lang === 'id' ? '2. DASBOR PENYELENGGARA (AKSES KHUSUS)' : '2. ORGANIZER DASHBOARD (RESTRICTED)'}
            </div>
            <p className="text-gray-300 leading-relaxed">
              {t('about.organizer_scope')}
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="text-monad-300 hover:underline font-mono text-xs"
              >
                {lang === 'id' ? 'Masuk ke Portal Penyelenggara →' : 'Sign In to Organizer Portal →'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-monad-900/40 via-surface to-cyber-cyan/10 border border-monad-500/30 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">
          {lang === 'id' ? 'Mulai Verifikasi Dokumen Sekarang' : 'Start Document Verification Now'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
          {lang === 'id'
            ? 'Coba langsung fitur pemeriksaan keaslian sertifikat pada portal publik tanpa perlu login.'
            : 'Test certificate authenticity checks directly on the public portal without requiring login.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/verify"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-monad-600 to-cyber-cyan hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-monad-500/25"
          >
            {t('nav.verify_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
