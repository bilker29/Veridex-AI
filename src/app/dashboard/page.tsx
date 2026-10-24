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

export default function DashboardPage() {
  const { lang, t } = useLanguage();

  // Official Authentication State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginEmail, setLoginEmail] = useState('bpn@veridex.id');
  const [loginPin, setLoginPin] = useState('101430');
  const [authError, setAuthError] = useState('');

  // Dashboard Registry Data State
  const [registryName, setRegistryName] = useState('Kantor Pertanahan & Notaris/PPAT Jakarta Selatan - Batch 2026');
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

    // Check credentials for registered land registry officer
    if (
      (cleanEmail === 'bpn@veridex.id' ||
        cleanEmail === 'admin@veridex.id' ||
        cleanEmail === 'petugas@bpn.go.id' ||
        cleanEmail === 'panitia@veridex.id' ||
        cleanEmail === 'bpn' ||
        cleanEmail === 'admin' ||
        cleanEmail.includes('bpn') ||
        cleanEmail.includes('veridex')) &&
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
    setLoginEmail('');
    setLoginPin('');
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
      } else {
        alert(
          lang === 'id'
            ? 'Tidak ada data aset tanah yang terdeteksi dari teks.'
            : 'No land asset data detected in the text.'
        );
      }
    } catch (err: any) {
      alert(`Error ekstraksi data: ${err.message}`);
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
        ? 'Apakah Anda yakin ingin mengaktifkan Blokir Sengketa (Revoke) sertifikat tanah ini di smart contract Monad? Dokumen ini akan ditandai SENGKETA/BATAL pada verifikasi publik.'
        : 'Are you sure you want to trigger an on-chain Dispute Lock / Revoke on Monad Testnet? This action is permanent and flags the certificate as DISPUTED / REVOKED.';

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
        alert(data.message || (lang === 'id' ? 'Sertifikat tanah berhasil dicabut.' : 'Certificate revoked successfully.'));
        fetchHistory();
      } else {
        alert(data.message || (lang === 'id' ? 'Gagal mencabut sertifikat tanah.' : 'Failed to revoke land certificate.'));
      }
    } catch (err: any) {
      alert(`Revoke error: ${err.message}`);
    } finally {
      setRevokingHash(null);
    }
  };

  // IF NOT LOGGED IN: Render Official BPN Login Gate
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6">
        <div className="p-8 rounded-2xl glass-panel border border-emerald-500/30 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded">
              {lang === 'id' ? 'Portal Petugas Pertanahan' : 'Restricted Land Registry Access'}
            </span>
            <h1 className="text-2xl font-bold text-white">
              {t('dash.auth_title')}
            </h1>
            <p className="text-xs text-gray-400">
              {t('dash.auth_desc')}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center font-mono">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-xs">
              <label className="text-gray-300 font-medium block">
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

            <div className="space-y-1 text-xs">
              <label className="text-gray-300 font-medium block">
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
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
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
            className="w-full p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/20 text-[11px] text-emerald-300/80 font-mono text-center transition-colors cursor-pointer"
          >
            {t('dash.cred_hint')}
          </button>
        </div>
      </div>
    );
  }

  // LOGGED IN: Full Land Registry Dashboard
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-emerald-500/30">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {t('dash.auth_badge')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {registryName}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono transition-colors self-start sm:self-auto"
        >
          {t('dash.logout_btn')}
        </button>
      </div>

      {/* Issuance Section */}
      <div className="p-8 rounded-2xl glass-panel border border-emerald-500/30 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white">
            {t('dash.title')}
          </h1>
          <p className="text-xs text-gray-400">
            {t('dash.subtitle')}
          </p>
        </div>

        {/* Registry Batch Name */}
        <div className="space-y-2">
          <label className="text-xs text-gray-300 font-semibold block">
            {t('dash.registry_label')}
          </label>
          <input
            type="text"
            value={registryName}
            onChange={e => setRegistryName(e.target.value)}
            className="w-full sm:w-96 px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Step 1: Raw Ingest with AI Extraction */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">
                1. {t('dash.ingest_title')}
              </h3>
              <p className="text-xs text-gray-400">
                {t('dash.ingest_desc')}
              </p>
            </div>

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
              className="text-xs text-emerald-400 hover:text-emerald-300 font-mono transition-colors self-start sm:self-auto"
            >
              {t('dash.ingest_sample')}
            </button>
          </div>

          <textarea
            rows={4}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="Ketik atau tempel data tanah..."
            className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono transition-all disabled:opacity-50"
            >
              {isExtracting ? t('dash.extracting_btn') : t('dash.extract_btn')}
            </button>
          </div>
        </div>

        {/* Step 2: Land Assets Preview Table */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              2. {t('dash.preview_title')}
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              {assets.length} {t('dash.preview_count')}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-gray-400 font-mono uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Nama Pemilik</th>
                  <th className="py-2.5 px-3">NIK / Identitas</th>
                  <th className="py-2.5 px-3">Jenis Hak</th>
                  <th className="py-2.5 px-3">Luas Tanah</th>
                  <th className="py-2.5 px-3">Lokasi / Alamat Tanah</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={asset.owner_name}
                        onChange={e => handleUpdateAsset(asset.id, 'owner_name', e.target.value)}
                        placeholder="Nama Pemilik"
                        className="w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 text-white py-1 outline-none font-medium"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={asset.owner_id}
                        onChange={e => handleUpdateAsset(asset.id, 'owner_id', e.target.value)}
                        placeholder="16 Digit NIK"
                        className="w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 text-gray-300 py-1 outline-none font-mono text-[11px]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={asset.land_type}
                        onChange={e => handleUpdateAsset(asset.id, 'land_type', e.target.value)}
                        className="bg-black/80 border border-white/10 text-emerald-300 font-mono text-xs rounded px-2 py-1 outline-none"
                      >
                        <option value="SHM">SHM (Hak Milik)</option>
                        <option value="SHGB">SHGB (Guna Bangunan)</option>
                        <option value="AJB">AJB (Akta Jual Beli)</option>
                        <option value="HP">HP (Hak Pakai)</option>
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={asset.land_area}
                        onChange={e => handleUpdateAsset(asset.id, 'land_area', e.target.value)}
                        placeholder="e.g. 500 m²"
                        className="w-28 bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 text-cyber-cyan py-1 outline-none font-mono text-[11px]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={asset.land_location}
                        onChange={e => handleUpdateAsset(asset.id, 'land_location', e.target.value)}
                        placeholder="Alamat Lengkap Tanah"
                        className="w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 text-gray-300 py-1 outline-none text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(asset.id)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono transition-colors"
            >
              + {t('dash.add_row_btn')}
            </button>

            <button
              type="button"
              onClick={handleIssueCertificates}
              disabled={isIssuing || assets.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-monad-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/25 disabled:opacity-50"
            >
              {isIssuing ? t('dash.issuing_btn') : t('dash.issue_btn')}
            </button>
          </div>
        </div>

        {/* Issuance Live Pipeline Progress Indicator */}
        {isIssuing && (
          <div className="p-6 rounded-2xl bg-black/60 border border-emerald-500/40 space-y-4">
            <h4 className="font-bold text-white text-sm">
              {lang === 'id' ? 'Proses Tokenisasi & Penerbitan Sertifikat ke Monad' : 'Tokenization & Issuance Pipeline on Monad'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] font-mono">
              <div className={`p-2.5 rounded-lg border ${issueStep >= 1 ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300' : 'border-white/5 text-gray-500'}`}>
                1. Validasi Pemilik
              </div>
              <div className={`p-2.5 rounded-lg border ${issueStep >= 2 ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300' : 'border-white/5 text-gray-500'}`}>
                2. Render Sertifikat PDF
              </div>
              <div className={`p-2.5 rounded-lg border ${issueStep >= 3 ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300' : 'border-white/5 text-gray-500'}`}>
                3. Hash SHA-256
              </div>
              <div className={`p-2.5 rounded-lg border ${issueStep >= 4 ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300' : 'border-white/5 text-gray-500'}`}>
                4. Merkle Tree Batch
              </div>
              <div className={`p-2.5 rounded-lg border ${issueStep >= 5 ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300' : 'border-white/5 text-gray-500'}`}>
                5. On-Chain Monad Tx
              </div>
            </div>
          </div>
        )}

        {/* Issuance Success Result Modal/Card */}
        {issueResult && (
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">
                PENERBITAN BATCH SUKSES ON-CHAIN
              </span>
              <span className="text-xs font-mono text-gray-400">
                Batch ID: {issueResult.batch_id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="text-gray-500 block text-[10px]">Merkle Root Monad:</span>
                <span className="text-cyber-cyan break-all text-[11px]">{issueResult.merkle_root}</span>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 sm:col-span-2">
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
              <div className="text-xs font-semibold text-white mb-2">
                Unduh Sertifikat Tanah Hasil Penerbitan:
              </div>
              <div className="flex flex-wrap gap-2">
                {issueResult.assets.map((asset, i) => (
                  <a
                    key={i}
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

      {/* Historical List of Land Certificates & Revocation */}
      <div className="p-8 rounded-2xl glass-panel border border-emerald-500/20 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">
            {t('dash.history_title')}
          </h2>
          <p className="text-xs text-gray-400">
            {t('dash.history_desc')}
          </p>
        </div>

        {historyLoading ? (
          <div className="py-8 text-center text-xs text-gray-400 font-mono">
            Memuat data sertifikat...
          </div>
        ) : issuedHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 font-mono">
            Belum ada sertifikat tanah yang diterbitkan.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-gray-400 font-mono uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Pemilik &amp; NIK</th>
                  <th className="py-2.5 px-3">Jenis &amp; No. Sertifikat</th>
                  <th className="py-2.5 px-3">Lokasi / Luas</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Hash Dokumen</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {issuedHistory.map((item) => (
                  <tr key={item.id || item.pdf_hash} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{item.owner_name || item.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{item.owner_id || item.email}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] mr-1.5 font-bold">
                        {item.land_type || 'SHM'}
                      </span>
                      <span className="text-gray-300 text-xs">{item.certificate_number || 'SHM-01234/KB'}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-gray-300 truncate max-w-xs">{item.land_location || 'Jakarta Selatan'}</div>
                      <div className="text-[11px] text-cyber-cyan font-mono">{item.land_area || '500 m²'}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      {item.status === 'VALID' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
                          VALID
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-mono text-[10px] font-bold">
                          DIBLOKIR / SENGKETA
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400">
                      {item.pdf_hash ? `${item.pdf_hash.substring(0, 10)}...${item.pdf_hash.substring(58)}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <a
                        href={item.download_url || `/api/certificates/${item.pdf_hash}`}
                        className="inline-block px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-emerald-300 font-mono text-[11px] transition-colors"
                      >
                        Unduh PDF
                      </a>

                      {item.status === 'VALID' && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(item.pdf_hash)}
                          disabled={revokingHash === item.pdf_hash}
                          className="px-2.5 py-1 rounded bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-mono text-[11px] transition-colors disabled:opacity-50"
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
    </div>
  );
}
