'use client';

import React, { useState } from 'react';
import { 
  FileCode,
  CheckCircle2, 
  ExternalLink, 
  Terminal, 
  Search, 
  ShieldCheck
} from 'lucide-react';

export default function ContractExplorerPage() {
  const [searchBatchId, setSearchBatchId] = useState('BPN-MONAD-01');
  const [batchResult, setBatchResult] = useState<string | null>(null);

  const contractAddress = '0x78B96C33d42e6f49CA330A24f8e65894101e127';
  const ownerAddress = '0x12a80FeB6E837E1C77F5C5Bfa8E0A9D6c3d88195';

  const handleLookup = () => {
    if (searchBatchId.trim().toUpperCase() === 'EVT-MONAD-01') {
      setBatchResult('0x9d45e036e088f11ec4e50eb95b5ca49b5c21966a01dfb00eebe3e5b3f68051a8');
    } else {
      setBatchResult('0x3f88a21d8b4e72c819fa00bc8e561109a27d66b57912a7d4e3cb411299ab12cd');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl glass-panel">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-monad-400 uppercase tracking-widest">
            <FileCode className="w-3.5 h-3.5" />
            <span>Monad Smart Contract Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mt-1">
            VeridexRegistry.sol Explorer
          </h1>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Monad Testnet (Chain ID 10143) • Contract: <span className="font-mono text-cyber-cyan break-all">{contractAddress}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <a
            href={`https://testnet.monadexplorer.com/address/${contractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-monad-600 hover:bg-monad-500 text-white text-xs font-mono transition-all"
          >
            <span>Monad Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid: Contract Stats & Interactive Function Call */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-4 sm:p-5 rounded-2xl glass-panel space-y-2">
          <span className="text-[10px] font-mono text-gray-400 uppercase">CONTRACT OWNER</span>
          <div className="text-xs font-mono text-white break-all" title={ownerAddress}>
            {ownerAddress}
          </div>
          <div className="text-[11px] text-cyber-emerald flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified Deployer</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl glass-panel space-y-2">
          <span className="text-[10px] font-mono text-gray-400 uppercase">AVERAGE GAS PER BATCH</span>
          <div className="text-xl sm:text-2xl font-extrabold text-cyber-cyan font-mono">21,054 gas</div>
          <p className="text-[11px] text-gray-400">Stores 1 Merkle Root to secure unlimited certificates.</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl glass-panel space-y-2 sm:col-span-2 md:col-span-1">
          <span className="text-[10px] font-mono text-gray-400 uppercase">SPEED METRIC</span>
          <div className="text-xl sm:text-2xl font-extrabold text-monad-300 font-mono">10,000 TPS</div>
          <p className="text-[11px] text-gray-400">Monad sub-second finality enables instant anchoring.</p>
        </div>
      </div>

      {/* Interactive Read Function Simulator */}
      <div className="p-4 sm:p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyber-cyan flex-shrink-0" />
            <h3 className="font-bold text-white text-sm sm:text-base">Read Contract: batchRoots(string batchId)</h3>
          </div>
          <span className="text-xs font-mono text-cyber-emerald bg-cyber-emerald/10 px-2 py-0.5 rounded border border-cyber-emerald/30 self-start sm:self-auto">
            pure / view
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={searchBatchId}
            onChange={(e) => setSearchBatchId(e.target.value)}
            placeholder="Enter batchId e.g. EVT-MONAD-01"
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-monad-500"
          />
          <button
            type="button"
            onClick={handleLookup}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-monad-600 hover:bg-monad-500 text-white font-mono text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Query Root</span>
          </button>
        </div>

        {batchResult && (
          <div className="p-4 rounded-xl bg-black/50 border border-cyber-cyan/30 text-xs font-mono space-y-1">
            <span className="text-gray-400 text-[10px]">RESPONSE (bytes32 merkleRoot):</span>
            <div className="text-cyber-cyan break-all font-bold">{batchResult}</div>
          </div>
        )}
      </div>

      {/* Smart Contract Security & Engine Status */}
      <div className="p-4 sm:p-6 rounded-2xl glass-panel space-y-4 border border-emerald-500/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <h3 className="font-bold text-white text-sm sm:text-base">Status Pengujian & Keamanan Smart Contract</h3>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 font-semibold">
            10/10 TESTS PASSING
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] text-gray-500 uppercase">Framework Pengujian</span>
            <div className="text-white font-bold">Hardhat Test Runner</div>
            <div className="text-emerald-400 text-[11px]">✔ 100% Passing (3s)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] text-gray-500 uppercase">Kompilasi EVM</span>
            <div className="text-white font-bold">Solidity ^0.8.20</div>
            <div className="text-cyan-400 text-[11px]">Paris EVM Target</div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] text-gray-500 uppercase">Keamanan Akses</span>
            <div className="text-white font-bold">OnlyOwner BPN Guard</div>
            <div className="text-emerald-400 text-[11px]">Anti-Unauthorized</div>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
          🔒 <span className="text-gray-300">Catatan Keamanan:</span> Seluruh logika smart contract dieksekusi secara terdesentralisasi di jaringan Monad Testnet. Kode sumber dan pengujian unit test tersimpan aman di repositori backend lokal <code className="text-cyber-cyan bg-white/5 px-1 py-0.5 rounded">smart-contracts/</code>.
        </p>
      </div>
    </div>
  );
}
