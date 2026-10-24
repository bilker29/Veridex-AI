'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export default function AboutPage() {
  const { lang, t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
          {t('about.badge')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t('about.title')}
        </h1>
        <p className="text-base text-gray-300 leading-relaxed">
          {t('about.desc')}
        </p>
      </div>

      {/* 1. Masalah Utama (The Problems) */}
      <div className="space-y-6">
        <div className="space-y-1 border-b border-white/10 pb-3">
          <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
            BAGIAN 1
          </span>
          <h2 className="text-2xl font-bold text-white">
            {t('about.problem_title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            {t('about.problem_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Problem 1 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1c0808] to-surface border border-red-500/30 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center font-bold text-xs font-mono">
              01
            </div>
            <h3 className="text-base font-bold text-white">
              {t('about.prob1_title')}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('about.prob1_desc')}
            </p>
          </div>

          {/* Problem 2 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1c0808] to-surface border border-red-500/30 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center font-bold text-xs font-mono">
              02
            </div>
            <h3 className="text-base font-bold text-white">
              {t('about.prob2_title')}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('about.prob2_desc')}
            </p>
          </div>

          {/* Problem 3 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1c0808] to-surface border border-red-500/30 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center font-bold text-xs font-mono">
              03
            </div>
            <h3 className="text-base font-bold text-white">
              {t('about.prob3_title')}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('about.prob3_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Target Pengguna (Target Audience - 2 Sisi) */}
      <div className="space-y-6">
        <div className="space-y-1 border-b border-white/10 pb-3">
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            BAGIAN 2
          </span>
          <h2 className="text-2xl font-bold text-white">
            {t('about.target_title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            {t('about.target_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sisi Penerbit */}
          <div className="p-7 rounded-2xl glass-panel border border-emerald-500/40 space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
              {t('about.target_issuer_title')}
            </div>
            <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-line leading-relaxed">
              {t('about.target_issuer_desc')}
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-block text-xs font-mono text-emerald-400 hover:text-emerald-300 underline"
              >
                {lang === 'id' ? 'Buka Portal Penerbit →' : 'Open Issuer Portal →'}
              </Link>
            </div>
          </div>

          {/* Sisi Verifikator */}
          <div className="p-7 rounded-2xl glass-panel border border-cyan-500/40 space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-mono text-xs font-bold">
              {t('about.target_checker_title')}
            </div>
            <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-line leading-relaxed">
              {t('about.target_checker_desc')}
            </p>
            <div className="pt-2">
              <Link
                href="/verify"
                className="inline-block text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
              >
                {lang === 'id' ? 'Buka Halaman Verifikasi Instan →' : 'Open Instant Verification →'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Solusi yang Ditawarkan VERIDEX (The 4 Solutions) */}
      <div className="space-y-6">
        <div className="space-y-1 border-b border-white/10 pb-3">
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            BAGIAN 3
          </span>
          <h2 className="text-2xl font-bold text-white">
            {t('about.solution_title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            {t('about.solution_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Solution 1: AI Legal Parser */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#061812] to-surface border border-emerald-500/40 space-y-3">
            <div className="text-xs font-mono font-bold text-emerald-400">
              SOLUSI 1 • ANTI-HUMAN ERROR
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('about.sol1_title')}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('about.sol1_desc')}
            </p>
          </div>

          {/* Solution 2: Tanda Tangan Kriptografi */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#061812] to-surface border border-emerald-500/40 space-y-3">
            <div className="text-xs font-mono font-bold text-emerald-400">
              SOLUSI 2 • ANTI-MAFIA TANAH
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('about.sol2_title')}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('about.sol2_desc')}
            </p>
          </div>

          {/* Solution 3: Verifikasi Publik Instan */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#061812] to-surface border border-emerald-500/40 space-y-3">
            <div className="text-xs font-mono font-bold text-emerald-400">
              SOLUSI 3 • INSTAN 1 DETIK
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('about.sol3_title')}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('about.sol3_desc')}
            </p>
          </div>

          {/* Solution 4: Fitur Blokir Sengketa */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#061812] to-surface border border-emerald-500/40 space-y-3">
            <div className="text-xs font-mono font-bold text-emerald-400">
              SOLUSI 4 • STATUS SENGKETA ON-CHAIN
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('about.sol4_title')}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('about.sol4_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Security Architecture & Separation of Concerns */}
      <div className="p-8 rounded-2xl glass-panel border border-white/10 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl font-bold text-white">
            {t('about.security_title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            {t('about.security_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          {/* Public Access */}
          <div className="p-5 rounded-xl bg-black/50 border border-white/5 space-y-2">
            <div className="text-cyan-400 font-bold font-mono">
              {lang === 'id' ? '1. PORTAL PUBLIK (TERBUKA BEBAS)' : '1. PUBLIC PORTAL (OPEN ACCESS)'}
            </div>
            <p className="text-gray-300 leading-relaxed text-xs">
              {t('about.public_scope')}
            </p>
          </div>

          {/* Protected Issuer */}
          <div className="p-5 rounded-xl bg-black/50 border border-emerald-500/30 space-y-2">
            <div className="text-emerald-400 font-bold font-mono">
              {lang === 'id' ? '2. PORTAL PENERBIT RESMI (AKSES KHUSUS)' : '2. ISSUER PORTAL (RESTRICTED)'}
            </div>
            <p className="text-gray-300 leading-relaxed text-xs">
              {t('about.organizer_scope')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-surface to-cyan-950/30 border border-emerald-500/40 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">
          {lang === 'id' ? 'Coba Verifikasi Sertifikat Tanah Sekarang' : 'Test Land Certificate Verification Now'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
          {lang === 'id'
            ? 'Coba langsung fitur pemeriksaan keaslian sertifikat tanah bebas manipulasi dalam 1 detik tanpa perlu login.'
            : 'Test tamper-proof land certificate authenticity in 1 second without logging in.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/verify"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/25"
          >
            {t('nav.verify_btn')}
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-mono text-xs transition-colors"
          >
            {t('home.cta_organizer')}
          </Link>
        </div>
      </div>
    </div>
  );
}
