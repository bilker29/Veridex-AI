'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';

interface LandAssetItem {
  id: string;
  owner_name: string;
  owner_id: string;
  land_location: string;
  land_area: string;
  land_type: string;
}

interface IssuedBatchResult {
  batch_id: string;
  tx_hash: string;
  merkle_root: string;
  block_number: number;
  gas_used: string;
  registry_name: string;
  assets: Array<{
    owner_name: string;
    owner_id: string;
    land_location: string;
    land_area: string;
    land_type: string;
    certificate_number: string;
    pdf_hash: string;
    serial_number: string;
    status: string;
    download_url: string;
  }>;
}

// Preset Issuer Profiles for Quick Demo Access
interface IssuerProfile {
  id: string;
  role: string;
  name: string;
  institution: string;
  email: string;
  pin: string;
  tag: string;
  desc: string;
}

const ISSUER_PROFILES: IssuerProfile[] = [
  {
    id: 'bpn',
    role: 'BPN (Badan Pertanahan Nasional)',
    name: 'Ir. Hadi Kusuma, M.Si',
    institution: 'Kantor Pertanahan Jakarta Selatan',
    email: 'bpn@veridex.id',
    pin: '101430',
    tag: 'Otoritas Negara',
    desc: 'Legalisasi penerbitan sertifikat tanah digital resmi dan pengelolaan blokir sengketa on-chain.',
  },
  {
    id: 'notaris',
    role: 'Notaris / PPAT',
    name: 'Siti Rahmawati, S.H., M.Kn',
    institution: 'Kantor Notaris & PPAT Jakarta Selatan',
    email: 'notaris@veridex.id',
    pin: '101430',
    tag: 'Draf Legal AJB',
    desc: 'Pembuatan draf Akta Jual Beli (AJB) dan validasi otomatis data tanah tanpa risiko salah ketik.',
  },
  {
    id: 'developer',
    role: 'Developer Perumahan',
    name: 'PT Bumi Sejahtera Propertindo',
    institution: 'Divisi Perizinan & Kavling Residensial',
    email: 'developer@veridex.id',
    pin: '101430',
    tag: 'Batch Kavling Massal',
    desc: 'Penerbitan ratusan sertifikat kavling perumahan secara serentak dalam satu transaksi Monad.',
  },
];

export default function DashboardPage() {
  const { lang, t } = useLanguage();

  // Authentication State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<IssuerProfile>(ISSUER_PROFILES[0]);
  const [loginEmail, setLoginEmail] = useState(ISSUER_PROFILES[0].email);
  const [loginPin, setLoginPin] = useState(ISSUER_PROFILES[0].pin);
  const [authError, setAuthError] = useState('');

  // Active Tab: 'parser' | 'preview' | 'history'
  const [activeTab, setActiveTab] = useState<'parser' | 'preview' | 'history'>('parser');

  // Registry Batch Data State
  const [registryName, setRegistryName] = useState('Kantor Pertanahan & PPAT Jakarta Selatan - Batch 2026');
  const [rawText, setRawText] = useState(
    'DRAF AKTA JUAL BELI (AJB) No. 04/PPAT/2026\n' +
    '1. Pembeli: Budi Santoso | NIK: 3201010101900001 | Objek: Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan | Luas: 500 m² | Status Hak: SHM\n' +
    '2. Pembeli: Siti Aminah | NIK: 3201020202880003 | Objek: Jl. TB Simatupang No. 88, Cilandak, Jakarta Selatan | Luas: 720 m² | Status Hak: SHGB\n' +
    '3. Pembeli: Hendra Wijaya | NIK: 3171030303920005 | Objek: Jl. Senopati No. 19, Kebayoran Baru, Jakarta Selatan | Luas: 350 m² | Status Hak: SHM\n' +
    '4. Pembeli: Maya Safitri | NIK: 3201030404950007 | Objek: Jl. Rasuna Said Kav. 8, Setiabudi, Jakarta Selatan | Luas: 420 m² | Status Hak: SHM'
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [assets, setAssets] = useState<LandAssetItem[]>([
    {
      id: '1',
      owner_name: 'Budi Santoso',
      owner_id: '3201010101900001',
      land_location: 'Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan',
      land_area: '500 m²',
      land_type: 'SHM',
    },
    {
      id: '2',
      owner_name: 'Siti Aminah',
      owner_id: '3201020202880003',
      land_location: 'Jl. TB Simatupang No. 88, Cilandak, Jakarta Selatan',
      land_area: '720 m²',
      land_type: 'SHGB',
    },
    {
      id: '3',
      owner_name: 'Hendra Wijaya',
      owner_id: '3171030303920005',
      land_location: 'Jl. Senopati No. 19, Kebayoran Baru, Jakarta Selatan',
      land_area: '350 m²',
      land_type: 'SHM',
    },
    {
      id: '4',
      owner_name: 'Maya Safitri',
      owner_id: '3201030404950007',
      land_location: 'Jl. Rasuna Said Kav. 8, Setiabudi, Jakarta Selatan',
      land_area: '420 m²',
      land_type: 'SHM',
    },
  ]);

  // Issuance State & Progress
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueStep, setIssueStep] = useState(0);
  const [issueResult, setIssueResult] = useState<IssuedBatchResult | null>(null);

  // Past Issued Records & Dispute Management
  const [issuedHistory, setIssuedHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [revokingHash, setRevokingHash] = useState<string | null>(null);

  // Check saved session on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('veridex_organizer_auth');
    if (savedAuth === 'authorized_101430') {
      setIsAuthorized(true);
      fetchHistory();
    }
  }, []);

  const handleSelectProfile = (p: IssuerProfile) => {
    setSelectedProfile(p);
    setLoginEmail(p.email);
    setLoginPin(p.pin);
    setRegistryName(`${p.institution} - Batch 2026`);
    setAuthError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPin = loginPin.trim();

    // Check credentials for registered land registry officer / notary / developer
    if (
      (cleanEmail === 'bpn@veridex.id' ||
        cleanEmail === 'notaris@veridex.id' ||
        cleanEmail === 'developer@veridex.id' ||
        cleanEmail === 'admin@veridex.id' ||
        cleanEmail === 'petugas@bpn.go.id' ||
        cleanEmail === 'bpn' ||
        cleanEmail === 'admin' ||
        cleanEmail.includes('bpn') ||
        cleanEmail.includes('veridex') ||
        cleanEmail.includes('notaris')) &&
      (cleanPin === '101430' || cleanPin === '123456')
    ) {
      sessionStorage.setItem('veridex_organizer_auth', 'authorized_101430');
      setIsAuthorized(true);
      fetchHistory();
    } else {
      setAuthError(
        lang === 'id'
          ? 'Email atau PIN keamanan salah. Gunakan bpn@veridex.id dan PIN: 101430.'
          : 'Invalid Email or Security PIN. Use bpn@veridex.id and PIN: 101430.'
      );
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('veridex_organizer_auth');
    setIsAuthorized(false);
    setAuthError('');
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success && (data.assets || data.participants)) {
        setIssuedHistory(data.assets || data.participants);
      }
    } catch (err) {
      console.error('Failed to load land assets history:', err);
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
          owner_name: item.owner_name || 'Pemilik',
          owner_id: item.owner_id || '',
          land_location: item.land_location || '',
          land_area: item.land_area || '',
          land_type: item.land_type || 'SHM',
        }));
        setAssets(mapped);
        setActiveTab('preview');
      } else {
        alert(
          lang === 'id'
            ? 'Tidak ada data aset tanah yang terdeteksi dari teks draf.'
            : 'No land asset data detected in the draft text.'
        );
      }
    } catch (err: any) {
      alert(`Error ekstraksi AI: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddRow = () => {
    setAssets([
      ...assets,
      {
        id: `${Date.now()}`,
        owner_name: '',
        owner_id: '',
        land_location: '',
        land_area: '',
        land_type: 'SHM',
      },
    ]);
  };

  const handleUpdateAsset = (id: string, field: keyof LandAssetItem, value: string) => {
    setAssets(assets.map(a => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleIssueCertificates = async () => {
    if (assets.length === 0) {
      alert(lang === 'id' ? 'Tambahkan minimal 1 data aset tanah.' : 'Please add at least one land asset.');
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
          'x-organizer-key': 'MONAD-ORGANIZER-2026',
        },
        body: JSON.stringify({
          registry_name: registryName,
          assets: assets.map(a => ({
            owner_name: a.owner_name || 'Pemilik Tanah',
            owner_id: a.owner_id || '3201010101900001',
            land_location: a.land_location || 'DKI Jakarta',
            land_area: a.land_area || '500 m²',
            land_type: a.land_type || 'SHM',
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
    const confirmMsg =
      lang === 'id'
        ? 'Apakah Anda yakin ingin mengaktifkan Blokir Sengketa (Revoke) sertifikat tanah ini di smart contract Monad? Dokumen ini akan ditandai SENGKETA/BATAL secara permanen pada verifikasi publik.'
        : 'Are you sure you want to trigger an on-chain Dispute Lock / Revoke on Monad Testnet? This action is permanent and flags the certificate as DISPUTED / REVOKED on public verify.';

    if (!confirm(confirmMsg)) return;

    try {
      setRevokingHash(pdfHash);
      const res = await fetch('/api/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organizer-key': 'MONAD-ORGANIZER-2026',
        },
        body: JSON.stringify({ cert_hash: pdfHash }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || (lang === 'id' ? 'Status sengketa berhasil diblokir on-chain.' : 'Dispute lock activated on Monad.'));
        fetchHistory();
      } else {
        alert(data.message || (lang === 'id' ? 'Gagal memblokir sertifikat tanah.' : 'Failed to trigger dispute lock.'));
      }
    } catch (err: any) {
      alert(`Dispute error: ${err.message}`);
    } finally {
      setRevokingHash(null);
    }
  };

  // Filter history by search keyword
  const filteredHistory = issuedHistory.filter(item => {
    const q = historySearch.toLowerCase();
    if (!q) return true;
    return (
      (item.owner_name || item.name || '').toLowerCase().includes(q) ||
      (item.owner_id || item.email || '').toLowerCase().includes(q) ||
      (item.certificate_number || '').toLowerCase().includes(q) ||
      (item.land_location || '').toLowerCase().includes(q) ||
      (item.pdf_hash || '').toLowerCase().includes(q)
    );
  });

  // =========================================================================
  // VIEW 1: EXECUTIVE AUTH GATE (When Not Logged In)
  // =========================================================================
  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <span>PORTAL RESMI PENERBIT HAK ATAS TANAH (RWA ISSUER)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('dash.auth_title')}
          </h1>
          <p className="text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('dash.auth_desc')}
          </p>
        </div>

        {/* Quick Role Selection Cards (Developer, Notaris, BPN) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>PILIH PROFIL PENERBIT RESMI (KLIK UNTUK DEMO):</span>
            <span className="text-emerald-400">OTENTIKASI TERENKRIPSI MONAD</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ISSUER_PROFILES.map(p => {
              const isSelected = selectedProfile.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProfile(p)}
                  className={`p-5 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-gradient-to-b from-emerald-950/60 to-surface border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : 'bg-surface-card hover:bg-surface-card-hover border-white/10 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                        {p.tag}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-sm">{p.role}</h3>
                    <div className="text-xs text-emerald-300/90 font-mono font-medium">{p.institution}</div>
                    <p className="text-[11px] text-gray-400 leading-relaxed pt-1">{p.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-gray-400">
                    ID: <span className="text-white">{p.email}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Login Card */}
        <div className="max-w-md mx-auto p-7 rounded-2xl glass-panel border border-emerald-500/40 space-y-6 shadow-2xl">
          <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
              🔐
            </div>
            <div>
              <div className="text-sm font-bold text-white">{selectedProfile.institution}</div>
              <div className="text-[11px] text-gray-400 font-mono">Akses Petugas: {selectedProfile.name}</div>
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center font-mono">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-xs">
              <label className="text-gray-300 font-semibold block font-mono">
                {t('dash.email_label')}
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="bpn@veridex.id"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-gray-300 font-semibold block font-mono">
                {t('dash.pin_label')}
              </label>
              <input
                type="password"
                value={loginPin}
                onChange={e => setLoginPin(e.target.value)}
                placeholder="••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors font-mono tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md shadow-emerald-500/25 active:scale-95 cursor-pointer"
            >
              {t('dash.login_btn')}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setLoginEmail('bpn@veridex.id');
              setLoginPin('101430');
            }}
            className="w-full p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/20 text-[11px] text-emerald-300/80 font-mono text-center transition-colors cursor-pointer"
          >
            {t('dash.cred_hint')}
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED COMMAND CENTER (When Logged In)
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Operations Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-emerald-500/30">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              {selectedProfile.role} • TERVERIFIKASI
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-xs font-mono text-cyber-cyan bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded">
              Monad Testnet 10.000 TPS
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {registryName}
          </h1>
          <p className="text-xs text-gray-400">
            Penanggung Jawab: <span className="text-white font-medium">{selectedProfile.name}</span> ({selectedProfile.institution})
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start lg:self-auto">
          <button
            type="button"
            onClick={fetchHistory}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-mono text-xs transition-colors"
            title="Refresh Data"
          >
            ↻ Sinkronkan
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-semibold transition-colors"
          >
            {t('dash.logout_btn')}
          </button>
        </div>
      </div>

      {/* 4 Executive Stats / KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-gray-400 uppercase">Sertifikat Terdaftar</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{issuedHistory.length || 2} Unit</div>
          <div className="text-[10px] text-gray-500 font-mono">100% On-Chain Monad</div>
        </div>
        <div className="p-4 rounded-xl glass-panel border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-gray-400 uppercase">Total Luas Lahan</div>
          <div className="text-2xl font-bold font-mono text-cyber-cyan">850 m²</div>
          <div className="text-[10px] text-gray-500 font-mono">Wilayah Terproteksi</div>
        </div>
        <div className="p-4 rounded-xl glass-panel border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-gray-400 uppercase">Estimasi Biaya Gas</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">&lt; Rp 2</div>
          <div className="text-[10px] text-gray-500 font-mono">1 Tx Per Batch Merkle</div>
        </div>
        <div className="p-4 rounded-xl glass-panel border border-white/10 space-y-1">
          <div className="text-[10px] font-mono text-gray-400 uppercase">Sengketa / Diblokir</div>
          <div className="text-2xl font-bold font-mono text-yellow-400">
            {issuedHistory.filter(h => h.status === 'REVOKED').length} Unit
          </div>
          <div className="text-[10px] text-gray-500 font-mono">On-Chain Dispute Lock</div>
        </div>
      </div>

      {/* Main 3 Navigation Tabs */}
      <div className="flex border-b border-white/10 space-x-2 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('parser')}
          className={`pb-3 px-4 font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'parser'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <span>1. AI Legal Parser (Draf AJB)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`pb-3 px-4 font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'preview'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <span>2. Tabel Pratinjau &amp; Terbitkan ({assets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'history'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <span>3. Riwayat &amp; Blokir Sengketa ({issuedHistory.length})</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: AI LEGAL PARSER (INGESTION OF AJB LEGAL DRAFTS) */}
      {/* =================================================================== */}
      {activeTab === 'parser' && (
        <div className="p-8 rounded-2xl glass-panel border border-emerald-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                STEP 1: ANTI-HUMAN ERROR
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {t('dash.ingest_title')}
              </h2>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                {t('dash.ingest_desc')}
              </p>
            </div>

            {/* Quick Template Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setRawText(
                    'DRAF AKTA JUAL BELI (AJB) No. 04/PPAT/2026\n' +
                    '1. Pembeli: Budi Santoso | NIK: 3201010101900001 | Objek: Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan | Luas: 500 m² | Status Hak: SHM\n' +
                    '2. Pembeli: Siti Aminah | NIK: 3201020202880003 | Objek: Jl. TB Simatupang No. 88, Cilandak, Jakarta Selatan | Luas: 720 m² | Status Hak: SHGB\n' +
                    '3. Pembeli: Hendra Wijaya | NIK: 3171030303920005 | Objek: Jl. Senopati No. 19, Kebayoran Baru, Jakarta Selatan | Luas: 350 m² | Status Hak: SHM\n' +
                    '4. Pembeli: Maya Safitri | NIK: 3201030404950007 | Objek: Jl. Rasuna Said Kav. 8, Setiabudi, Jakarta Selatan | Luas: 420 m² | Status Hak: SHM'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono transition-colors"
              >
                + Template AJB Notaris
              </button>

              <button
                type="button"
                onClick={() =>
                  setRawText(
                    'DAFTAR KAVLING PERUMAHAN BUMI INDAH (DEVELOPER)\n' +
                    'Kavling A-01 | Pemilik: Ahmad Fauzi | NIK: 3273010101950002 | Jl. Raya Cilandak Kav. 01 | Luas: 250 m² | Hak: SHGB\n' +
                    'Kavling A-02 | Pemilik: Ratna Dewi | NIK: 3273020202940004 | Jl. Raya Cilandak Kav. 02 | Luas: 300 m² | Hak: SHGB\n' +
                    'Kavling A-03 | Pemilik: Bambang Prakoso | NIK: 3273030303890006 | Jl. Raya Cilandak Kav. 03 | Luas: 450 m² | Hak: SHM'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition-colors"
              >
                + Template Kavling Developer
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 block font-mono">
              Tempelkan Teks Draf AJB / Notulensi Tanah Di Sini:
            </label>
            <textarea
              rows={6}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Ketik atau tempel draf Akta Jual Beli (AJB)..."
              className="w-full p-4 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-gray-400 font-mono">
              AI akan otomatis memisahkan Nama, NIK, Lokasi, Luas m², dan Jenis Hak tanpa perlu pengetikan ulang manual.
            </div>

            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting || !rawText.trim()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer self-end sm:self-auto"
            >
              {isExtracting ? t('dash.extracting_btn') : t('dash.extract_btn')}
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: DATA PREVIEW & BATCH ISSUANCE TO MONAD */}
      {/* =================================================================== */}
      {activeTab === 'preview' && (
        <div className="p-8 rounded-2xl glass-panel border border-emerald-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                STEP 2: VALIDASI &amp; PENERBITAN MASSAL
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {t('dash.preview_title')}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Periksa data hasil ekstraksi sebelum ditokenisasi dan dikunci ke blockchain Monad.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-mono text-xs border border-white/10 transition-colors"
              >
                + {t('dash.add_row_btn')}
              </button>
              <button
                type="button"
                onClick={handleIssueCertificates}
                disabled={isIssuing || assets.length === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md shadow-emerald-500/25 disabled:opacity-50 cursor-pointer"
              >
                {isIssuing ? t('dash.issuing_btn') : t('dash.issue_btn')}
              </button>
            </div>
          </div>

          {/* Land Assets Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-gray-400 font-mono uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-3.5">Nama Pemilik Tanah</th>
                  <th className="py-3 px-3.5">NIK / Identitas</th>
                  <th className="py-3 px-3.5">Jenis Hak</th>
                  <th className="py-3 px-3.5">Luas Tanah</th>
                  <th className="py-3 px-3.5">Alamat / Lokasi Lahan</th>
                  <th className="py-3 px-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3.5">
                      <input
                        type="text"
                        value={asset.owner_name}
                        onChange={e => handleUpdateAsset(asset.id, 'owner_name', e.target.value)}
                        placeholder="Nama Pemilik"
                        className="w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 text-white py-1 outline-none font-medium text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3.5">
                      <input
                        type="text"
                        value={asset.owner_id}
                        onChange={e => handleUpdateAsset(asset.id, 'owner_id', e.target.value)}
                        placeholder="16 Digit NIK"
                        className="w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 text-gray-300 py-1 outline-none font-mono text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3.5">
                      <select
                        value={asset.land_type}
                        onChange={e => handleUpdateAsset(asset.id, 'land_type', e.target.value)}
                        className="bg-black/80 border border-white/10 text-emerald-300 font-mono text-xs rounded px-2.5 py-1 outline-none"
                      >
                        <option value="SHM">SHM (Hak Milik)</option>
                        <option value="SHGB">SHGB (Guna Bangunan)</option>
                        <option value="AJB">AJB (Akta Jual Beli)</option>
                        <option value="HP">HP (Hak Pakai)</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <input
                        type="text"
                        value={asset.land_area}
                        onChange={e => handleUpdateAsset(asset.id, 'land_area', e.target.value)}
                        placeholder="500 m²"
                        className="w-28 bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 text-cyber-cyan py-1 outline-none font-mono text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3.5">
                      <input
                        type="text"
                        value={asset.land_location}
                        onChange={e => handleUpdateAsset(asset.id, 'land_location', e.target.value)}
                        placeholder="Alamat Lengkap Lahan"
                        className="w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 text-gray-300 py-1 outline-none text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(asset.id)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 font-bold"
                        title="Hapus Baris"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Issuance Live Pipeline Progress Indicator */}
          {isIssuing && (
            <div className="p-6 rounded-2xl bg-black/80 border border-emerald-500/50 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-spin"></span>
                <h4 className="font-bold text-white text-sm font-mono">
                  PROSES PENERBITAN MASSAL ON-CHAIN MONAD
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] font-mono">
                <div className={`p-3 rounded-lg border ${issueStep >= 1 ? 'border-emerald-400 bg-emerald-950/50 text-emerald-300' : 'border-white/5 text-gray-500'}`}>
                  1. Validasi Pemilik
                </div>
                <div className={`p-3 rounded-lg border ${issueStep >= 2 ? 'border-emerald-400 bg-emerald-950/50 text-emerald-300' : 'border-white/5 text-gray-500'}`}>
                  2. Render PDF Deterministik
                </div>
                <div className={`p-3 rounded-lg border ${issueStep >= 3 ? 'border-emerald-400 bg-emerald-950/50 text-emerald-300' : 'border-white/5 text-gray-500'}`}>
                  3. Hash SHA-256 Biner
                </div>
                <div className={`p-3 rounded-lg border ${issueStep >= 4 ? 'border-emerald-400 bg-emerald-950/50 text-emerald-300' : 'border-white/5 text-gray-500'}`}>
                  4. Merkle Tree Batch
                </div>
                <div className={`p-3 rounded-lg border ${issueStep >= 5 ? 'border-emerald-400 bg-emerald-950/50 text-emerald-300' : 'border-white/5 text-gray-500'}`}>
                  5. Monad On-Chain Tx
                </div>
              </div>
            </div>
          )}

          {/* Issuance Success Result Modal/Card */}
          {issueResult && (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-500/30">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-2">
                  <span>✔</span>
                  <span>PENERBITAN BATCH SUKSES ON-CHAIN</span>
                </span>
                <span className="text-xs font-mono text-gray-300">
                  Batch Ref: <span className="text-white font-bold">{issueResult.batch_id}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-black/50 border border-white/5">
                  <span className="text-gray-500 block text-[10px]">Merkle Root Monad:</span>
                  <span className="text-cyber-cyan break-all text-[11px]">{issueResult.merkle_root}</span>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-white/5 sm:col-span-2">
                  <span className="text-gray-500 block text-[10px]">Monad Tx Hash:</span>
                  <a
                    href={`https://testnet.monadexplorer.com/tx/${issueResult.tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline break-all text-[11px]"
                  >
                    {issueResult.tx_hash}
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs font-semibold text-white mb-2 font-mono">
                  Unduh Sertifikat Tanah Hasil Penerbitan:
                </div>
                <div className="flex flex-wrap gap-2">
                  {issueResult.assets.map((asset) => (
                    <a
                      key={asset.pdf_hash}
                      href={asset.download_url}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono transition-colors"
                    >
                      📄 {asset.owner_name} ({asset.land_type})
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: AUDIT HISTORY & ON-CHAIN DISPUTE LOCK (REVOCATION) */}
      {/* =================================================================== */}
      {activeTab === 'history' && (
        <div className="p-8 rounded-2xl glass-panel border border-emerald-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono font-bold text-yellow-400 uppercase tracking-wider">
                STEP 3: AUDIT &amp; FITUR BLOKIR SENGKETA
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {t('dash.history_title')}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {t('dash.history_desc')}
              </p>
            </div>

            {/* History Search Bar */}
            <input
              type="text"
              value={historySearch}
              onChange={e => setHistorySearch(e.target.value)}
              placeholder="Cari pemilik, NIK, atau no. sertifikat..."
              className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 w-full sm:w-72"
            />
          </div>

          {historyLoading ? (
            <div className="py-12 text-center text-xs text-gray-400 font-mono">
              Memuat data registri sertifikat...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 font-mono">
              Belum ada data sertifikat yang cocok dengan pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/60 text-gray-400 font-mono uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-3.5">Pemilik &amp; NIK</th>
                    <th className="py-3 px-3.5">Jenis &amp; No. Sertifikat</th>
                    <th className="py-3 px-3.5">Lokasi / Luas Lahan</th>
                    <th className="py-3 px-3.5">Status Kriptografis</th>
                    <th className="py-3 px-3.5">Hash SHA-256</th>
                    <th className="py-3 px-3.5 text-right">Aksi &amp; Blokir Sengketa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHistory.map((item) => (
                    <tr key={item.id || item.pdf_hash} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-white">{item.owner_name || item.name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">NIK: {item.owner_id || item.email}</div>
                      </td>
                      <td className="py-3 px-3.5 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] mr-1.5 font-bold">
                          {item.land_type || 'SHM'}
                        </span>
                        <span className="text-gray-300 text-xs">{item.certificate_number || 'SHM-01234/KB'}</span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="text-gray-300 truncate max-w-xs">{item.land_location || 'Jakarta Selatan'}</div>
                        <div className="text-[11px] text-cyber-cyan font-mono">{item.land_area || '500 m²'}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        {item.status === 'VALID' ? (
                          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
                            VALID
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-mono text-[10px] font-bold">
                            DIBLOKIR / SENGKETA
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-gray-400">
                        {item.pdf_hash ? `${item.pdf_hash.substring(0, 10)}...${item.pdf_hash.substring(58)}` : '-'}
                      </td>
                      <td className="py-3 px-3.5 text-right space-x-2">
                        <a
                          href={item.download_url || `/api/certificates/${item.pdf_hash}`}
                          className="inline-block px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-300 font-mono text-xs transition-colors"
                        >
                          Unduh PDF
                        </a>

                        {item.status === 'VALID' && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(item.pdf_hash)}
                            disabled={revokingHash === item.pdf_hash}
                            className="px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-mono text-xs transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {revokingHash === item.pdf_hash ? 'Memblokir...' : 'Blokir Sengketa'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
