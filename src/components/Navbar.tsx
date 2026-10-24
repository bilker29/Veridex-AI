'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/verify', label: t('nav.verify') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#080A11]/90 border-b border-monad-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Clean Typography Brand with RWA Land Badge */}
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="font-extrabold text-xl tracking-wider text-white">VERIDEX</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            RWA LAND
          </span>
        </Link>

        {/* Center Nav: Home, About, Verify */}
        <nav className="flex items-center space-x-1 bg-surface-card border border-white/5 p-1 rounded-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-monad-600/30 text-white border border-monad-500/40 shadow-sm shadow-monad-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Language Switcher, BPN Portal, Verify CTA */}
        <div className="flex items-center space-x-2.5">
          {/* Language Switcher (ID / EN) */}
          <div className="flex items-center bg-black/60 border border-white/10 rounded-lg p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setLang('id')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'id'
                  ? 'bg-monad-600 text-white font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'en'
                  ? 'bg-monad-600 text-white font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* BPN Land Registry Portal Access Button */}
          <Link
            href="/dashboard"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono border transition-all ${
              pathname === '/dashboard'
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border-emerald-500/40'
            }`}
          >
            <span>{t('nav.registry')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
