'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Presentation, 
  ShieldCheck, 
  Flame, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badge: 'MONAD BLITZ HACKATHON 2026',
      title: 'VERIDEX 📜🛡️',
      subtitle: 'Smart Assessment. High-Speed Issuance. Unforgeable Proof.',
      content: (
        <div className="space-y-6 text-center max-w-2xl mx-auto py-8">
          <p className="text-lg text-gray-300 leading-relaxed">
            The next-generation verifiable credential protocol connecting Gemini AI data extraction to the 10,000 TPS Monad blockchain.
          </p>
          <div className="flex flex-wrap justify-center gap-3 font-mono text-xs text-cyber-cyan">
            <span className="px-3 py-1.5 rounded-lg bg-monad-900/60 border border-monad-500/30">
              ⚡ 10,000 TPS Throughput
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-monad-900/60 border border-monad-500/30">
              🤖 Gemini 1.5 Flash Ingestion
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-monad-900/60 border border-monad-500/30">
              🛡️ 1-Pixel Tamper Proof
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      badge: 'THE PROBLEM',
      title: 'The Dual Friction of Credentials',
      subtitle: 'Administrative Overhead & Vulnerable PDF Forgery',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="p-6 rounded-2xl bg-black/40 border border-red-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-red-400 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <h4>1. Messy Administrative Ingestion</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Hackathon organizers, universities, and webinars struggle with raw unstructured attendee lists (Zoom chats, Telegram dumps, messy spreadsheets), taking hours of manual copy-pasting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-black/40 border border-red-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-red-400 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <h4>2. Rampant PDF Forgery</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Standard digital PDF certificates can be forged in 30 seconds using Adobe Illustrator or Canva. HR teams have zero reliable cryptographic tools to verify authenticity.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      badge: 'THE SOLUTION',
      title: 'VERIDEX Architecture',
      subtitle: 'From Raw Chat to Monad Merkle Tree in Seconds',
      content: (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-black/50 border border-cyber-cyan/30 space-y-2">
              <div className="text-cyber-cyan font-bold font-mono">1. AI INGESTION</div>
              <p className="text-gray-400 leading-relaxed">
                Gemini 1.5 Flash cleans and structures messy human chats into verified participant lists instantly.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/50 border border-monad-500/30 space-y-2">
              <div className="text-monad-300 font-bold font-mono">2. MERKLE COMPILATION</div>
              <p className="text-gray-400 leading-relaxed">
                pdf-lib generates certificates. Binary SHA-256 hashes are combined into an immutable Merkle Tree.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/50 border border-cyber-emerald/30 space-y-2">
              <div className="text-cyber-emerald font-bold font-mono">3. MONAD TESTNET COMMIT</div>
              <p className="text-gray-400 leading-relaxed">
                1 single on-chain transaction anchors the root for thousands of participants at near-zero gas.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      badge: 'WHY MONAD?',
      title: 'The Perfect Infrastructure',
      subtitle: 'Why Monad Beats Traditional Chains for Credentials',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 text-center">
          <div className="p-6 rounded-2xl bg-black/40 border border-monad-500/30 space-y-2">
            <div className="text-3xl font-extrabold text-cyber-cyan font-mono">10,000</div>
            <div className="text-xs font-bold text-white uppercase">TPS Throughput</div>
            <p className="text-[11px] text-gray-400">Enables high-frequency, massive university batch issuance without congestion.</p>
          </div>
          <div className="p-6 rounded-2xl bg-black/40 border border-monad-500/30 space-y-2">
            <div className="text-3xl font-extrabold text-monad-300 font-mono">&lt; 1 Sec</div>
            <div className="text-xs font-bold text-white uppercase">Instant Finality</div>
            <p className="text-[11px] text-gray-400">Verifications resolve instantaneously during live hiring or auditing.</p>
          </div>
          <div className="p-6 rounded-2xl bg-black/40 border border-monad-500/30 space-y-2">
            <div className="text-3xl font-extrabold text-cyber-emerald font-mono">&lt; $0.0001</div>
            <div className="text-xs font-bold text-white uppercase">Near-Zero Gas</div>
            <p className="text-[11px] text-gray-400">Organizers spend pennies to credential entire stadium events.</p>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      badge: 'CLIENT-SIDE PRIVACY',
      title: 'Zero-Knowledge Proof Model',
      subtitle: 'Zero PDF Uploads. Pure Client-Side Hashing.',
      content: (
        <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs">
            <Lock className="w-4 h-4" />
            <span>ENTERPRISE PRIVACY COMPLIANT</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Unlike legacy verification platforms that require uploading private documents to a central cloud server, VERIDEX computes the SHA-256 hash completely within client browser memory. Only the 32-byte cryptographic digest is queried against the Monad Merkle Tree.
          </p>
          <div className="p-3 rounded-xl bg-black/60 font-mono text-xs text-cyber-emerald flex items-center justify-between">
            <span>Client PDF ➔ Local SHA-256 ➔ Monad MerkleProof.verify()</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      ),
    },
    {
      id: 6,
      badge: 'REVOCATION PROTOCOL',
      title: 'Dynamic On-Chain Revocation',
      subtitle: 'When Credentials Need To Be Invalidated',
      content: (
        <div className="p-6 rounded-2xl bg-black/40 border border-yellow-500/30 space-y-4">
          <h4 className="text-white font-bold text-sm">Real-World Case: Academic Dishonesty or Disqualification</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            In traditional systems, once a PDF is sent, it can never be recalled. On VERIDEX, an organizer triggers <code className="text-cyber-cyan font-mono">revokeCertificate(certHash)</code> in <code className="text-monad-300 font-mono">VeridexRegistry.sol</code>. Even though the root remains immutable, the certificate is immediately rejected globally upon drag-and-drop verification.
          </p>
        </div>
      ),
    },
    {
      id: 7,
      badge: 'MARKET OPPORTUNITY',
      title: 'Target Market & Growth',
      subtitle: '$28B Global Digital Credentialing Market',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2 text-xs">
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <Award className="w-5 h-5 text-cyber-cyan" />
            <h5 className="font-bold text-white">Hackathons & Bootcamps</h5>
            <p className="text-gray-400">Immediate initial market: ETHGlobal, Monad Blitz, dev schools issuing proof-of-completion.</p>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <TrendingUp className="w-5 h-5 text-monad-300" />
            <h5 className="font-bold text-white">Universities & MOOCs</h5>
            <p className="text-gray-400">High volume diploma issuance with zero manual verification workload for registrar offices.</p>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <ShieldCheck className="w-5 h-5 text-cyber-emerald" />
            <h5 className="font-bold text-white">Web3 & DAOs</h5>
            <p className="text-gray-400">Proof-of-Contribution and governance credentials natively anchored on Monad.</p>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      badge: 'ROADMAP & DEMO',
      title: 'Ready for Monad Ecosystem',
      subtitle: 'MVP Complete • 48-Hour Hackathon Delivery',
      content: (
        <div className="space-y-6 text-center py-6">
          <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            VERIDEX is live and fully functional today: AI Data Ingestion, High-Speed Merkle Batching, 1-Tx Monad Commits, and 1-Pixel Drag-and-Drop Verification.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-monad-600 to-cyber-cyan text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-monad-500/30"
            >
              Test Organizer Studio
            </Link>
            <Link
              href="/verify"
              className="px-6 py-3 rounded-xl bg-surface-card hover:bg-surface-card-hover border border-monad-500/40 text-white font-bold text-xs uppercase tracking-wider"
            >
              Test Verifier
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const current = slides[currentSlide];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Slide Navigation Header */}
      <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-b border-white/5 pb-4">
        <div className="flex items-center space-x-2">
          <Presentation className="w-4 h-4 text-cyber-cyan" />
          <span className="text-white font-bold">VERIDEX PITCH DECK</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>SLIDE {currentSlide + 1} OF {slides.length}</span>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="min-h-[460px] p-8 sm:p-12 rounded-3xl glass-panel border border-monad-500/30 flex flex-col justify-between glow-purple relative overflow-hidden">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-monad-900/60 border border-monad-500/30 text-cyber-cyan text-xs font-mono mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>{current.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {current.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-1 font-mono">
            {current.subtitle}
          </p>

          <div className="mt-8">{current.content}</div>
        </div>

        {/* Slide Progress Dots */}
        <div className="pt-8 flex items-center justify-between border-t border-white/5 text-xs text-gray-500">
          <span className="font-mono text-[11px]">Use ← / → keys to navigate</span>
          <div className="flex items-center space-x-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'w-6 bg-cyber-cyan'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
