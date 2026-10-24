'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export default function HomePage() {
  const { lang, t } = useLanguage();

  return (
    <div className="relative overflow-hidden pb-16 sm:pb-20">
      {/* Hero Section */}
      <section className="relative pt-10 pb-14 sm:pt-16 sm:pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-5 sm:space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-monad-900/60 border border-monad-500/40 text-monad-300 text-xs sm:text-sm font-medium">
            <span>{t('home.badge')}</span>
            <span className="text-gray-500 hidden sm:inline">•</span>
            <span className="text-cyber-emerald font-mono">Monad Testnet 10.000 TPS</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight sm:leading-none">
            <span className="text-white">{t('home.title1')}</span><br />
            <span className="text-gradient-monad">{t('home.title2')}</span><br />
            <span className="text-white">{t('home.title3')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed px-1 sm:px-0">
            {t('home.desc')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4 w-full max-w-md sm:max-w-none mx-auto">
            <Link
              href="/verify"
              className="w-full sm:w-auto text-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-monad-600 via-monad-500 to-cyber-cyan hover:brightness-110 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-monad-500/30 active:scale-95"
            >
              <span>{t('home.cta_verify')}</span>
            </Link>

            <Link
              href="/about"
              className="w-full sm:w-auto text-center px-6 py-3.5 rounded-xl bg-surface-card hover:bg-surface-card-hover border border-monad-500/30 text-white font-semibold text-sm tracking-wide transition-all active:scale-95"
            >
              <span>{t('home.cta_about')}</span>
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto text-center px-5 py-3.5 rounded-xl bg-surface-card/60 hover:bg-surface-card border border-white/10 text-gray-300 hover:text-white font-mono text-sm transition-all"
            >
              <span>{t('home.cta_organizer')}</span>
            </Link>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-8 sm:pt-12 max-w-4xl mx-auto">
            <div className="p-3.5 sm:p-4 rounded-xl glass-panel text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-cyber-cyan font-mono">{t('home.stat_tps')}</div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">{t('home.stat_tps_label')}</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl glass-panel text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-monad-300 font-mono">{t('home.stat_tx')}</div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">{t('home.stat_tx_label')}</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl glass-panel text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-cyber-emerald font-mono">{t('home.stat_gas')}</div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">{t('home.stat_gas_label')}</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl glass-panel text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-yellow-400 font-mono">{t('home.stat_tamper')}</div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">{t('home.stat_tamper_label')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Main Sections Breakdown */}
      <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t('home.pillars_title')}</h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
            {t('home.pillars_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Bagian 1 */}
          <div className="p-5 sm:p-7 rounded-2xl glass-panel border border-monad-500/30 flex flex-col justify-between space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <div className="inline-block px-2.5 py-1 rounded bg-monad-900/60 text-monad-300 text-[10px] font-mono">
                {t('home.p1_tag')}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">{t('home.p1_title')}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('home.p1_desc')}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="w-full text-center py-2.5 rounded-xl bg-monad-600 hover:bg-monad-500 text-white text-xs font-bold transition-all"
            >
              {t('home.p1_btn')}
            </Link>
          </div>

          {/* Bagian 2 */}
          <div className="p-5 sm:p-7 rounded-2xl glass-panel border border-cyber-cyan/30 flex flex-col justify-between space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <div className="inline-block px-2.5 py-1 rounded bg-cyber-cyan/10 text-cyber-cyan text-[10px] font-mono">
                {t('home.p2_tag')}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">{t('home.p2_title')}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('home.p2_desc')}
              </p>
            </div>

            <Link
              href="/verify"
              className="w-full text-center py-2.5 rounded-xl bg-cyber-cyan/20 hover:bg-cyber-cyan/30 border border-cyber-cyan/40 text-cyber-cyan text-xs font-bold transition-all"
            >
              {t('home.p2_btn')}
            </Link>
          </div>

          {/* Bagian 3 */}
          <div className="p-5 sm:p-7 rounded-2xl glass-panel border border-cyber-emerald/30 flex flex-col justify-between space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <div className="inline-block px-2.5 py-1 rounded bg-cyber-emerald/10 text-cyber-emerald text-[10px] font-mono">
                {t('home.p3_tag')}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">{t('home.p3_title')}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('home.p3_desc')}
              </p>
            </div>

            <Link
              href="/about"
              className="w-full text-center py-2.5 rounded-xl bg-monad-900/60 hover:bg-monad-800 border border-monad-500/40 text-monad-300 text-xs font-bold transition-all"
            >
              {t('home.p3_btn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Instant QA Sandbox for Hackathon */}
      <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="p-5 sm:p-8 rounded-2xl bg-gradient-to-br from-monad-950/70 via-surface to-[#0A0D18] border border-monad-500/30 space-y-5 sm:space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 uppercase">
              Uji Coba Cepat Sistem
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {lang === 'id' ? 'Uji Deteksi Pemalsuan Dokumen' : 'Instant Tamper Detection Testing'}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {lang === 'id'
                ? 'Unduh file sertifikat asli untuk status terverifikasi, atau unduh salinan yang telah diubah 1 byte untuk membuktikan deteksi pemalsuan.'
                : 'Download an authentic certificate to test verified status, or download a 1-byte modified copy to test tamper rejection.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <a
              href="/api/certificates/0x6a214a86b696c40e5250e7c2c923983405457e7daf1bb176e7a65711c1e8241c"
              className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-cyber-emerald/15 hover:bg-cyber-emerald/25 border border-cyber-emerald/40 text-cyber-emerald text-xs font-semibold transition-all font-mono"
            >
              Unduh Sertifikat Valid (Budi)
            </a>
            <a
              href="/api/certificates/0x6a214a86b696c40e5250e7c2c923983405457e7daf1bb176e7a65711c1e8241c/tampered"
              className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 text-xs font-semibold transition-all font-mono"
            >
              Unduh Salinan Rekayasa (Palsu)
            </a>
            <Link
              href="/verify"
              className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-monad-600 hover:bg-monad-500 text-white text-xs font-semibold transition-all font-mono"
            >
              Buka Halaman Verifikasi →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
