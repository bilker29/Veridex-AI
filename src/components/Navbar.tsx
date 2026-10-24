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
        {/* Clean Typography Brand - No Logo Icon as requested */}
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="font-extrabold text-xl tracking-wider text-white">VERIDEX</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-monad-500/20 text-monad-300 border border-monad-500/30">
            PROTOCOL
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
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
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

        {/* Right Actions: Language Switcher, Organizer Portal, Verify */}
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

          {/* Organizer Access Button */}
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono border transition-all ${
              pathname === '/dashboard'
                ? 'bg-monad-600/40 text-cyber-cyan border-cyber-cyan/50'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10'
            }`}
          >
            <span>{t('nav.organizer')}</span>
          </Link>

          {/* Public Verify CTA Button */}
          <Link
            href="/verify"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-monad-600 to-monad-500 hover:from-monad-500 hover:to-cyber-cyan text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md shadow-monad-500/25 active:scale-95"
          >
            <span>{t('nav.verify_btn')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
