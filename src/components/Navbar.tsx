'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/verify', label: t('nav.verify') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#080A11]/90 border-b border-monad-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Clean Typography Brand with RWA Land Badge */}
        <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
          <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white">VERIDEX</span>
          <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            RWA LAND
          </span>
        </Link>

        {/* Center Nav: Home, About, Verify (Desktop only) */}
        <nav className="hidden md:flex items-center space-x-1 bg-surface-card border border-white/5 p-1 rounded-xl">
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

        {/* Right Actions: Language Switcher, BPN Portal, Hamburger Button */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
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

          {/* BPN Land Registry Portal Access Button (Desktop) */}
          <Link
            href="/dashboard"
            className={`hidden md:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono border transition-all ${
              pathname === '/dashboard'
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border-emerald-500/40'
            }`}
          >
            <span>{t('nav.registry')}</span>
          </Link>

          {/* Hamburger Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-surface-card border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Buka Menu Navigasi"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-monad-500/20 bg-[#080A11]/98 px-4 pt-3 pb-5 space-y-2.5 backdrop-blur-2xl shadow-xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-monad-600/30 text-white border border-monad-500/40 font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-white/10">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-mono font-medium border transition-all ${
                pathname === '/dashboard'
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
              }`}
            >
              <span>{t('nav.registry')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
