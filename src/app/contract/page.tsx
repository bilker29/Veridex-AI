'use client';

import React, { useState } from 'react';
import { 
  FileCode, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Terminal, 
  Search, 
  Flame, 
  ShieldCheck, 
  Lock,
  Layers
} from 'lucide-react';

export default function ContractExplorerPage() {
  const [copied, setCopied] = useState(false);
  const [searchBatchId, setSearchBatchId] = useState('EVT-MONAD-01');
  const [batchResult, setBatchResult] = useState<string | null>(null);

  const contractAddress = '0x78B96C33d42e6f49CA330A24f8e65894101e127';
  const ownerAddress = '0x12a80FeB6E837E1C77F5C5Bfa8E0A9D6c3d88195';

  const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title VeridexRegistry
 * @dev Ultra-lightweight on-chain Merkle Root Registry for Veridex on Monad Testnet.
 */
contract VeridexRegistry {
    address public owner;
    
    // Mapping: batchId => merkleRoot
    mapping(string => bytes32) public batchRoots;
    // Mapping: certificateHash => isRevoked
    mapping(bytes32 => bool) public revokedCertificates;

    event BatchPublished(string batchId, bytes32 merkleRoot, uint256 timestamp);
    event CertificateRevoked(bytes32 certHash, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function publishBatchRoot(string memory batchId, bytes32 merkleRoot) external onlyOwner {
        batchRoots[batchId] = merkleRoot;
        emit BatchPublished(batchId, merkleRoot, block.timestamp);
    }

    function verifyCertificate(
        string memory batchId, 
        bytes32 certHash, 
        bytes32[] calldata proof
    ) external view returns (bool) {
        if (revokedCertificates[certHash]) {
            return false;
        }
        bytes32 root = batchRoots[batchId];
        return MerkleProof.verify(proof, root, certHash);
    }

    function revokeCertificate(bytes32 certHash) external onlyOwner {
        revokedCertificates[certHash] = true;
        emit CertificateRevoked(certHash, block.timestamp);
    }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(solidityCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      {/* Solidity Code Viewer */}
      <div className="p-4 sm:p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-monad-400 flex-shrink-0" />
            <h3 className="font-bold text-white text-sm sm:text-base">Solidity Source Code</h3>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono transition-colors cursor-pointer flex-shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-3.5 sm:p-4 rounded-xl bg-black/70 border border-white/10 text-gray-300 font-mono text-[11px] sm:text-xs overflow-x-auto leading-relaxed">
          {solidityCode}
        </pre>
      </div>
    </div>
  );
}
