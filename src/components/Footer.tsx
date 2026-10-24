import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-monad-500/15 bg-[#06080D] py-12 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <span className="font-bold text-white tracking-wide text-base">VERIDEX</span>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tokenisasi Tanah RWA. Penerbitan Kecepatan Tinggi. Bukti Anti-Pemalsuan. Protokol sertifikat tanah berbasis Merkle Tree di Monad Testnet.
            </p>
            <div className="inline-block text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
              10.000 TPS • 1-Tx Merkle Batch
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Navigasi</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/" className="hover:text-cyber-cyan transition-colors">Beranda</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cyber-cyan transition-colors">Tentang &amp; Keamanan</Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-cyber-cyan transition-colors">Verifikasi Sertifikat</Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-emerald-400 hover:text-white transition-colors">
                  Portal Pertanahan BPN
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Jaringan Monad</h4>
            <ul className="space-y-1.5 text-xs font-mono">
              <li>
                <a
                  href="https://testnet.monadexplorer.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyber-cyan transition-colors"
                >
                  Monad Testnet Explorer
                </a>
              </li>
              <li>
                <span className="text-gray-500">Chain ID: 10143</span>
              </li>
              <li>
                <span className="text-gray-500">Gas: &lt; Rp 2 per batch</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Arsitektur Kriptografis</h4>
            <div className="p-3 rounded-xl bg-surface-card border border-white/5 space-y-1 text-xs">
              <span className="font-mono text-[11px] text-monad-300">VeridexRegistry.sol</span>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Struktur Merkle Tree memvalidasi integritas dokumen secara client-side tanpa mengirimkan berkas rahasia ke server.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© 2026 VERIDEX Protocol. Hak Cipta Dilindungi.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">
            SHA-256 Merkle Proof • Monad EVM
          </p>
        </div>
      </div>
    </footer>
  );
}
