import fs from 'fs';
import path from 'path';
import { RegistryBatch, LandAsset } from './types';
import { VeridexMerkle } from './merkle';

export interface StoredData {
  registries: RegistryBatch[];
  assets: LandAsset[];
  pdfStore: Record<string, string>; // pdf_hash => base64 PDF
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-memory singleton state
let memoryDb: StoredData = {
  registries: [],
  assets: [],
  pdfStore: {},
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore if cannot write
    }
  }
}

function loadFromDisk(): StoredData {
  try {
    ensureDir();
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Could not read db.json, using in-memory state:', err);
  }
  return { registries: [], assets: [], pdfStore: {} };
}

function saveToDisk(data: StoredData) {
  try {
    ensureDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Could not save db.json to disk:', err);
  }
}

// Initialize state
memoryDb = loadFromDisk();

const a1Hash = '0x7e5c9b2b5120a1c6a287955ad0e2168f44ff530372df0d9f48512140d046c823';
const a2Hash = '0x3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef012';
const seedTree = VeridexMerkle.buildTree([a1Hash, a2Hash]);
const correctSampleRoot = seedTree.root;

// Auto-seed or repair sample land registry with mathematically authentic Merkle Root
const sampleRegistry = memoryDb.registries.find(r => r.id === 'reg-bpn-jakarta-2026');
if (!sampleRegistry || memoryDb.assets.length === 0 || sampleRegistry.merkle_root !== correctSampleRoot) {
  const sampleRegistryId = 'reg-bpn-jakarta-2026';
  const sampleBatchId = 'BPN-MONAD-01';
  const sampleTx = '0x6e2c39178ad3ff49c6cb4931a9805566cf2eaeb7b68676d8b9ec7ad316df9845';

  // Filter out any stale seed registry
  memoryDb.registries = memoryDb.registries.filter(r => r.id !== sampleRegistryId);
  memoryDb.assets = memoryDb.assets.filter(a => a.registry_id !== sampleRegistryId);

  memoryDb.registries.unshift({
    id: sampleRegistryId,
    name: 'BPN Jakarta Selatan - Batch 2026',
    batch_id: sampleBatchId,
    merkle_root: correctSampleRoot,
    tx_hash: sampleTx,
    block_number: 28491024,
    created_at: new Date().toISOString(),
    asset_count: 2,
  });

  memoryDb.assets.unshift(
    {
      id: 'a-seed-001',
      registry_id: sampleRegistryId,
      owner_name: 'Budi Santoso',
      owner_id: '3201010101900001',
      land_location: 'Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan',
      land_area: '500 m²',
      land_type: 'SHM',
      certificate_number: 'SHM-01234/KB',
      pdf_hash: a1Hash,
      merkle_proof: seedTree.getProof(a1Hash),
      status: 'VALID',
      created_at: new Date().toISOString(),
      serial_number: 'VRX-LAND-0001',
    },
    {
      id: 'a-seed-002',
      registry_id: sampleRegistryId,
      owner_name: 'Andi Pratama',
      owner_id: '3201020202850002',
      land_location: 'Jl. Gatot Subroto Kav. 12, Setiabudi, Jakarta Selatan',
      land_area: '350 m²',
      land_type: 'SHGB',
      certificate_number: 'SHGB-05678/SB',
      pdf_hash: a2Hash,
      merkle_proof: seedTree.getProof(a2Hash),
      status: 'VALID',
      created_at: new Date().toISOString(),
      serial_number: 'VRX-LAND-0002',
    }
  );

  saveToDisk(memoryDb);
}

export class VeridexDb {
  static getRegistries(): RegistryBatch[] {
    return memoryDb.registries;
  }

  static getRegistryById(id: string): RegistryBatch | undefined {
    return memoryDb.registries.find(e => e.id === id || e.batch_id === id);
  }

  static addRegistry(registry: RegistryBatch): RegistryBatch {
    memoryDb.registries.unshift(registry);
    saveToDisk(memoryDb);
    return registry;
  }

  static getAssets(registryId?: string): LandAsset[] {
    if (registryId) {
      return memoryDb.assets.filter(a => a.registry_id === registryId);
    }
    return memoryDb.assets;
  }

  static getAssetByHash(hash: string): LandAsset | undefined {
    const cleanHash = hash.toLowerCase();
    return memoryDb.assets.find(a => a.pdf_hash.toLowerCase() === cleanHash);
  }

  static getAssetBySerial(serial: string): LandAsset | undefined {
    return memoryDb.assets.find(a => a.serial_number === serial);
  }

  static addAssets(newAssets: LandAsset[]) {
    memoryDb.assets.push(...newAssets);
    saveToDisk(memoryDb);
  }

  static revokeAsset(pdfHash: string): boolean {
    const cleanHash = pdfHash.toLowerCase();
    const a = memoryDb.assets.find(item => item.pdf_hash.toLowerCase() === cleanHash);
    if (a) {
      a.status = 'REVOKED';
      saveToDisk(memoryDb);
      return true;
    }
    return false;
  }

  static savePdfBuffer(hash: string, buffer: Uint8Array) {
    const cleanHash = hash.toLowerCase();
    memoryDb.pdfStore[cleanHash] = Buffer.from(buffer).toString('base64');
    saveToDisk(memoryDb);
  }

  static getPdfBuffer(hash: string): Uint8Array | null {
    const cleanHash = hash.toLowerCase();
    const base64 = memoryDb.pdfStore[cleanHash];
    if (base64) {
      return new Uint8Array(Buffer.from(base64, 'base64'));
    }
    return null;
  }
}
