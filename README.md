# VERIDEX 📜🛡️
**Smart Assessment. High-Speed Issuance. Unforgeable Proof.**  
*A Next-Gen Credentialing Platform Built for Monad Blitz Hackathon*

---

## 📌 Executive Summary

VERIDEX is an ultra-high-speed verifiable credentialing platform designed for the Monad Blitz Hackathon. It solves two critical bottlenecks in credentials:
1. **Administrative Friction:** Organizers deal with chaotic chat logs from Telegram/Zoom. Gemini 1.5 Flash instantly normalizes them into structured JSON.
2. **Document Forgery:** Traditional PDF certificates can be forged in seconds. VERIDEX anchors a **Merkle Tree Root** on the **Monad Testnet**, achieving 1-pixel tamper detection while batch-issuing thousands of certificates in **1 single on-chain transaction** with near-zero gas (< $0.0001).

---

## 🚀 Key Features

- 🤖 **AI Data Ingestion (Gemini 1.5 Flash):** Paste unorganized chats; AI extracts clean names & emails automatically.
- ⚡ **High-Speed Batch Issuance:** Generates high-res tamper-proof PDF certificates with embedded QR codes using `pdf-lib`.
- 🌳 **1-Tx Merkle Tree Scaling:** Computes pure binary SHA-256 leaves and broadcasts 1 root to `VeridexRegistry.sol` on Monad Testnet.
- 🛡️ **Zero-Knowledge Public Verification:** Drag & drop PDF files directly in the browser. Hashing is performed **100% client-side** in browser memory — no document data is sent to external servers.
- 🚫 **On-Chain Revocation:** Organizers can permanently revoke compromised or disqualified certificates directly on Monad.
- 🧪 **Judge QA Sandbox:** Pre-loaded test cases for instant 1-click verification of authentic vs. tampered certificates.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router), Tailwind CSS | Organizer Studio, Public PDF Verifier, Pitch Deck |
| **AI Layer** | Gemini 1.5 Flash API | Unstructured text normalization to JSON |
| **PDF Engine** | `pdf-lib`, `qrcode` | Certificate rendering, vector borders & QR codes |
| **Crypto** | `crypto-js`, `merkletreejs`, `ethers` | Pure SHA-256 hashing & OpenZeppelin Merkle proofs |
| **Blockchain** | Solidity, Monad Testnet (Chain ID 10143) | `VeridexRegistry.sol` Merkle Root anchoring |
| **Database** | In-Memory + Persistent JSON Store | Event batches and Merkle proof matrices |

---

## 💻 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Configure `.env.local` if you wish to use your own Gemini API key or live Monad wallet:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key   # Optional: Heuristic NLP fallback active if blank
NEXT_PUBLIC_MONAD_RPC_URL=https://rpc.testnet.monad.xyz
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_CONTRACT_ADDRESS=0x78B96C33d42e6f49CA330A24f8e65894101e127
```

### 3. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Hackathon Jury QA Test Suite

1. **Verify Valid Certificate:**
   - Go to `/verify`
   - Click **"Test Valid PDF (Budi)"** or drag `Sample_Valid_Budi.pdf`
   - Result: 🟩 **VERIFIED** with Monad Merkle Proof & Tx Hash.
2. **Verify Forged/Tampered Certificate:**
   - Click **"Test Forged PDF"** or drag a modified PDF
   - Result: 🟥 **FORGED / HASH MISMATCH** with 1-pixel tamper diagnostics.
3. **AI Ingestion Test:**
   - Go to `/dashboard`
   - Click **"+ Insert Sample Hackathon Chat Log"**
   - Click **"AI Extract to Table"** ➔ Watch Gemini parse attendees into an editable table.
4. **Issue Batch on Monad:**
   - Click **"Issue Certificates On Monad Testnet"**
   - Experience the 5-step interactive blockchain minting modal and live explorer links!
