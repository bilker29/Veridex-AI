'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';

interface ExtractedItem {
  id: string;
  name: string;
  email: string;
}

interface IssuedBatchResult {
  batch_id: string;
  tx_hash: string;
  merkle_root: string;
  block_number: number;
  gas_used: string;
  event_name: string;
  participants: Array<{
    name: string;
    email: string;
    pdf_hash: string;
    serial_number: string;
    status: string;
    download_url: string;
  }>;
}

export default function DashboardPage() {
  const { lang, t } = useLanguage();

  // Organizer Authentication State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard Data State
  const [eventName, setEventName] = useState('Monad Blitz Hackathon 2026');
  const [rawText, setRawText] = useState(
    'budi (budi@gmail.com) hadir bang, terus ada andi@mail.com namanya andi\nsiti.dev@monad.xyz (Siti Rahma) juga ikut'
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [participants, setParticipants] = useState<ExtractedItem[]>([
    { id: '1', name: 'Budi', email: 'budi@gmail.com' },
    { id: '2', name: 'Andi', email: 'andi@mail.com' },
    { id: '3', name: 'Siti Rahma', email: 'siti.dev@monad.xyz' },
  ]);

  // Issuance State & Progress
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueStep, setIssueStep] = useState(0);
  const [issueResult, setIssueResult] = useState<IssuedBatchResult | null>(null);

  // Past Issued Records
  const [issuedHistory, setIssuedHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [revokingHash, setRevokingHash] = useState<string | null>(null);

  // Check saved session on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('veridex_organizer_auth');
    if (savedAuth === 'authorized_101430') {
      setIsAuthorized(true);
      fetchHistory();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPin = loginPin.trim();

    // Verification check for registered organizer credentials
    if (
      (cleanEmail === 'panitia@veridex.id' || cleanEmail === 'admin@veridex.id' || cleanEmail === 'panitia') &&
      cleanPin === '101430'
    ) {
      sessionStorage.setItem('veridex_organizer_auth', 'authorized_101430');
      setIsAuthorized(true);
      fetchHistory();
    } else {
      setAuthError(
        lang === 'id'
          ? 'Email atau PIN keamanan salah. Hanya panitia terdaftar yang dapat masuk.'
          : 'Invalid Email or Security PIN. Only registered organizers may access.'
      );
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('veridex_organizer_auth');
    setIsAuthorized(false);
    setLoginEmail('');
    setLoginPin('');
    setAuthError('');
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success && data.participants) {
        setIssuedHistory(data.participants);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!rawText.trim()) return;
    try {
      setIsExtracting(true);
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const mapped = data.data.map((item: any, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          name: item.name,
          email: item.email,
        }));
        setParticipants(mapped);
      } else {
        alert(lang === 'id' ? 'Tidak ada peserta yang terdeteksi dari teks.' : 'No participants found in the text.');
      }
    } catch (err: any) {
      alert(`Error ekstraksi data: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddRow = () => {
    setParticipants([
      ...participants,
      { id: `${Date.now()}`, name: '', email: '' },
    ]);
  };

  const handleUpdateParticipant = (id: string, field: 'name' | 'email', value: string) => {
    setParticipants(
      participants.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleIssueCertificates = async () => {
    if (participants.length === 0) {
      alert(lang === 'id' ? 'Tambahkan minimal 1 peserta.' : 'Please add at least one participant.');
      return;
    }

    try {
      setIsIssuing(true);
      setIssueStep(1);

      await new Promise(r => setTimeout(r, 600));
      setIssueStep(2);
      await new Promise(r => setTimeout(r, 600));
      setIssueStep(3);

      const res = await fetch('/api/issue', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-organizer-key': 'MONAD-ORGANIZER-2026'
        },
        body: JSON.stringify({
          event_name: eventName,
          participants: participants.map(p => ({
            name: p.name || 'Participant',
            email: p.email || 'user@monad.xyz',
          })),
        }),
      });

      setIssueStep(4);
      await new Promise(r => setTimeout(r, 700));

      const data = await res.json();
      if (data.success) {
        setIssueStep(5);
        setIssueResult(data.data);
        fetchHistory();
      } else {
        alert(`Penerbitan gagal: ${data.message}`);
        setIsIssuing(false);
      }
    } catch (err: any) {
      alert(`Error penerbitan: ${err.message}`);
      setIsIssuing(false);
    }
  };

  const handleRevoke = async (pdfHash: string) => {
    const confirmMsg = lang === 'id'
      ? 'Apakah Anda yakin ingin mencabut (revoke) sertifikat ini di smart contract Monad? Tindakan ini permanen.'
      : 'Are you sure you want to revoke this certificate on Monad Testnet? This action is permanent.';
      
    if (!confirm(confirmMsg)) return;

    try {
      setRevokingHash(pdfHash);
      const res = await fetch('/api/revoke', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-organizer-key': 'MONAD-ORGANIZER-2026'
        },
        body: JSON.stringify({ cert_hash: pdfHash }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || (lang === 'id' ? 'Sertifikat berhasil dicabut.' : 'Certificate revoked successfully.'));
        fetchHistory();
      } else {
        alert(data.message || (lang === 'id' ? 'Gagal mencabut sertifikat.' : 'Failed to revoke certificate.'));
      }
    } catch (err: any) {
      alert(`Revoke error: ${err.message}`);
    } finally {
      setRevokingHash(null);
    }
  };

  // IF NOT LOGGED IN: Render Proper Organizer Login Form
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6">
        <div className="p-8 rounded-2xl glass-panel border border-monad-500/30 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-monad-400 bg-monad-900/50 px-2.5 py-1 rounded">
              {lang === 'id' ? 'Akses Khusus Panitia' : 'Restricted Committee Access'}
            </span>
            <h1 className="text-2xl font-bold text-white">
              {t('dash.auth_title')}
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t('dash.auth_desc')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-gray-300 block">
                {t('dash.email_label')}
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  setAuthError('');
                }}
                placeholder="panitia@veridex.id"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-cyber-cyan transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 block">
                {t('dash.pin_label')}
              </label>
              <input
                type="password"
                maxLength={6}
                value={loginPin}
                onChange={(e) => {
                  setLoginPin(e.target.value);
                  setAuthError('');
                }}
                placeholder="6-digit PIN"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyber-cyan transition-colors"
                required
              />
            </div>

            {authError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-sans">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-monad-600 to-monad-500 hover:from-monad-500 hover:to-cyber-cyan text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-monad-500/20 active:scale-98"
            >
              {t('dash.login_btn')}
            </button>
          </form>

          {/* Official Registered Committee Credentials Note */}
          <div className="pt-4 border-t border-white/5 text-center">
            <p className="text-[11px] text-gray-500 font-mono">
              {t('dash.cred_hint')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // IF AUTHORIZED: Full Organizer Studio
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner / Event Config + Security Status */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        {/* Organizer Verification Status & Logout Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyber-emerald" />
            <span className="text-cyber-emerald font-semibold">{t('dash.auth_badge')}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300">{t('dash.committee_name')}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs transition-colors"
          >
            {t('dash.logout_btn')}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('dash.title')}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('dash.subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-gray-400">{t('dash.event_label')}</span>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-black/50 border border-monad-500/40 text-white text-xs font-sans font-semibold focus:outline-none focus:border-cyber-cyan transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid: Component A (Raw Data Ingestion) & Component B (Structured Data Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Component A: Raw Text Ingestion */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl glass-panel space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">{t('dash.ingest_title')}</h3>
                <span className="text-[10px] font-mono text-monad-300 bg-monad-900/60 px-2 py-0.5 rounded border border-monad-500/20">
                  AI Extraction
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('dash.ingest_desc')}
              </p>

              {/* Sample Quick Fill */}
              <button
                type="button"
                onClick={() =>
                  setRawText(
                    'budi (budi@gmail.com) hadir bang, terus ada andi@mail.com namanya andi\nsiti.dev@monad.xyz (Siti Rahma) juga ikut\nDavid - david@gmail.com'
                  )
                }
                className="text-[11px] text-cyber-cyan hover:underline font-mono inline-block"
              >
                {t('dash.ingest_sample')}
              </button>

              <textarea
                rows={9}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste attendee text here..."
                className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-gray-200 text-xs font-mono focus:outline-none focus:border-monad-500 transition-colors resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting || !rawText.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-monad-600 to-monad-500 hover:from-monad-500 hover:to-cyber-cyan text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-monad-500/25 active:scale-98"
            >
              {isExtracting ? t('dash.extracting_btn') : t('dash.extract_btn')}
            </button>
          </div>
        </div>

        {/* Component B: Structured Data Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">{t('dash.preview_title')}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-monad-500/20 text-monad-300 font-mono">
                  {participants.length} {t('dash.preview_count')}
                </span>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors"
                >
                  {t('dash.add_row_btn')}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[290px] border border-white/5 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/40 text-gray-400 uppercase font-mono text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Nama Lengkap</th>
                    <th className="py-2.5 px-3">Alamat Email</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500 text-xs font-sans">
                        Belum ada peserta.
                      </td>
                    </tr>
                  ) : (
                    participants.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3 text-gray-500">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => handleUpdateParticipant(p.id, 'name', e.target.value)}
                            placeholder="Name"
                            className="w-full bg-transparent border-b border-transparent hover:border-gray-600 focus:border-cyber-cyan text-white focus:outline-none px-1 py-0.5 text-xs font-sans"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="email"
                            value={p.email}
                            onChange={(e) => handleUpdateParticipant(p.id, 'email', e.target.value)}
                            placeholder="Email"
                            className="w-full bg-transparent border-b border-transparent hover:border-gray-600 focus:border-cyber-cyan text-gray-300 focus:outline-none px-1 py-0.5 text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(p.id)}
                            className="p-1 hover:text-red-400 text-gray-500 transition-colors text-xs"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Batch Issuance Button */}
            <button
              type="button"
              onClick={handleIssueCertificates}
              disabled={isIssuing || participants.length === 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyber-emerald via-monad-500 to-cyber-cyan hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wide transition-all shadow-lg shadow-cyber-emerald/20 active:scale-98 disabled:opacity-50"
            >
              {isIssuing ? t('dash.issuing_btn') : t('dash.issue_btn')}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Modal with Multi-step Progress */}
      {isIssuing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl glass-panel border border-monad-500/50 space-y-6 glow-purple">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Memproses Batch ke Monad</h3>
              <p className="text-xs text-gray-400 font-mono">Eksekusi Kriptografi Kecepatan Tinggi</p>
            </div>

            {/* Steps Progress List */}
            <div className="space-y-3 font-mono text-xs">
              <div className={`p-3 rounded-lg border ${issueStep >= 1 ? 'border-cyber-cyan/40 bg-cyber-cyan/5 text-cyber-cyan' : 'border-white/5 text-gray-500'}`}>
                1. Pembuatan Dokumen PDF Sertifikat
              </div>
              <div className={`p-3 rounded-lg border ${issueStep >= 2 ? 'border-cyber-cyan/40 bg-cyber-cyan/5 text-cyber-cyan' : 'border-white/5 text-gray-500'}`}>
                2. Kalkulasi Sidik Jari Kriptografis (SHA-256)
              </div>
              <div className={`p-3 rounded-lg border ${issueStep >= 3 ? 'border-cyber-cyan/40 bg-cyber-cyan/5 text-cyber-cyan' : 'border-white/5 text-gray-500'}`}>
                3. Penyusunan Struktur Merkle Tree
              </div>
              <div className={`p-3 rounded-lg border ${issueStep >= 4 ? 'border-monad-400/40 bg-monad-900/30 text-monad-300' : 'border-white/5 text-gray-500'}`}>
                4. Pengiriman Merkle Root ke Smart Contract Monad
              </div>
              <div className={`p-3 rounded-lg border ${issueStep >= 5 ? 'border-cyber-emerald/40 bg-cyber-emerald/10 text-cyber-emerald' : 'border-white/5 text-gray-500'}`}>
                5. Batch Berhasil Di-Commit ke Monad Testnet!
              </div>
            </div>

            {issueStep === 5 && (
              <button
                type="button"
                onClick={() => setIsIssuing(false)}
                className="w-full py-2.5 rounded-xl bg-cyber-emerald text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all"
              >
                Tutup &amp; Lihat Hasil Batch
              </button>
            )}
          </div>
        </div>
      )}

      {/* Issuance Success Result Card */}
      {issueResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-monad-950/80 to-surface border border-cyber-emerald/40 space-y-4 glow-emerald">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-extrabold text-white text-lg">Batch Berhasil Di-Commit ke Monad!</h3>
            <span className="text-xs font-mono text-cyber-emerald bg-cyber-emerald/10 px-2.5 py-1 rounded-md border border-cyber-emerald/30">
              Batch ID: {issueResult.batch_id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-gray-500 block text-[10px]">TRANSAKSI MONAD</span>
              <a
                href={`https://testnet.monadexplorer.com/tx/${issueResult.tx_hash}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyber-cyan hover:underline truncate block"
              >
                {issueResult.tx_hash}
              </a>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-gray-500 block text-[10px]">MERKLE ROOT</span>
              <span className="text-monad-300 truncate block">{issueResult.merkle_root}</span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-gray-500 block text-[10px]">NOMOR BLOK</span>
              <span className="text-gray-200 block">#{issueResult.block_number}</span>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Registry Table & Revocation Center */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-white text-base">{t('dash.registry_title')}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('dash.registry_desc')}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchHistory}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono transition-colors self-start sm:self-auto"
          >
            {historyLoading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>

        <div className="overflow-x-auto border border-white/5 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/50 text-gray-400 text-[10px] uppercase">
              <tr>
                <th className="py-3 px-3">Serial</th>
                <th className="py-3 px-3">Nama &amp; Email</th>
                <th className="py-3 px-3">Sidik Jari SHA-256</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {issuedHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500 text-xs font-sans">
                    Belum ada sertifikat terbit.
                  </td>
                </tr>
              ) : (
                issuedHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 text-white font-semibold">{item.serial_number || 'VRX-0001'}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="text-xs text-white font-medium">{item.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{item.email}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-gray-400" title={item.pdf_hash}>
                      {item.pdf_hash.slice(0, 10)}...{item.pdf_hash.slice(-8)}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.status === 'VALID' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/30">
                          VALID
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                          REVOKED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Download Valid PDF */}
                        <a
                          href={`/api/certificates/${item.pdf_hash}`}
                          className="px-2.5 py-1 rounded bg-monad-600/30 hover:bg-monad-600/50 text-cyber-cyan border border-monad-500/30 text-[11px] transition-colors"
                        >
                          Unduh PDF
                        </a>

                        {/* Download Tampered PDF for Testing */}
                        <a
                          href={`/api/certificates/${item.pdf_hash}/tampered`}
                          className="px-2.5 py-1 rounded bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[11px] transition-colors"
                        >
                          Salinan Tes
                        </a>

                        {/* Revoke Action */}
                        {item.status === 'VALID' && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(item.pdf_hash)}
                            disabled={revokingHash === item.pdf_hash}
                            className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] transition-colors disabled:opacity-50"
                          >
                            Cabut
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
