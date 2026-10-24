import fs from 'fs';
import path from 'path';
import { EventBatch, Participant } from './types';

export interface StoredData {
  events: EventBatch[];
  participants: Participant[];
  pdfStore: Record<string, string>; // pdf_hash => base64 PDF
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-memory singleton state
let memoryDb: StoredData = {
  events: [],
  participants: [],
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
  return { events: [], participants: [], pdfStore: {} };
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

// Auto-seed sample event from PRD if database is empty
if (memoryDb.events.length === 0) {
  const sampleEventId = 'evt-monad-blitz-2026';
  const sampleBatchId = 'EVT-MONAD-01';
  const sampleRoot = '0x9d45e036e088f11ec4e50eb95b5ca49b5c21966a01dfb00eebe3e5b3f68051a8';
  const sampleTx = '0x6e2c39178ad3ff49c6cb4931a9805566cf2eaeb7b68676d8b9ec7ad316df9845';

  const p1Hash = '0x7e5c9b2b5120a1c6a287955ad0e2168f44ff530372df0d9f48512140d046c823';
  const p2Hash = '0x3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef012';

  memoryDb.events.push({
    id: sampleEventId,
    name: 'Monad Blitz Hackathon 2026',
    batch_id: sampleBatchId,
    merkle_root: sampleRoot,
    tx_hash: sampleTx,
    block_number: 28491024,
    created_at: new Date().toISOString(),
    participant_count: 2,
  });

  memoryDb.participants.push(
    {
      id: 'p-seed-001',
      event_id: sampleEventId,
      name: 'Budi Santoso',
      email: 'budi@gmail.com',
      pdf_hash: p1Hash,
      merkle_proof: [p2Hash],
      status: 'VALID',
      created_at: new Date().toISOString(),
      serial_number: 'VRX-2026-0001',
    },
    {
      id: 'p-seed-002',
      event_id: sampleEventId,
      name: 'Andi Pratama',
      email: 'andi@mail.com',
      pdf_hash: p2Hash,
      merkle_proof: [p1Hash],
      status: 'VALID',
      created_at: new Date().toISOString(),
      serial_number: 'VRX-2026-0002',
    }
  );

  saveToDisk(memoryDb);
}

export class VeridexDb {
  static getEvents(): EventBatch[] {
    return memoryDb.events;
  }

  static getEventById(id: string): EventBatch | undefined {
    return memoryDb.events.find(e => e.id === id || e.batch_id === id);
  }

  static addEvent(event: EventBatch): EventBatch {
    memoryDb.events.unshift(event);
    saveToDisk(memoryDb);
    return event;
  }

  static getParticipants(eventId?: string): Participant[] {
    if (eventId) {
      return memoryDb.participants.filter(p => p.event_id === eventId);
    }
    return memoryDb.participants;
  }

  static getParticipantByHash(hash: string): Participant | undefined {
    const cleanHash = hash.toLowerCase();
    return memoryDb.participants.find(p => p.pdf_hash.toLowerCase() === cleanHash);
  }

  static getParticipantBySerial(serial: string): Participant | undefined {
    return memoryDb.participants.find(p => p.serial_number === serial);
  }

  static addParticipants(newParticipants: Participant[]) {
    memoryDb.participants.push(...newParticipants);
    saveToDisk(memoryDb);
  }

  static revokeParticipant(pdfHash: string): boolean {
    const cleanHash = pdfHash.toLowerCase();
    const p = memoryDb.participants.find(item => item.pdf_hash.toLowerCase() === cleanHash);
    if (p) {
      p.status = 'REVOKED';
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
