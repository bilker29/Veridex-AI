import { NextRequest, NextResponse } from 'next/server';
import { VeridexPdfGenerator } from '@/lib/pdf-generator';
import { VeridexMerkle } from '@/lib/merkle';
import { MonadClient } from '@/lib/monad-client';
import { VeridexDb } from '@/lib/storage';
import { EventBatch, Participant } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Security Gate: Ensure caller is a registered organizer
    const organizerKey = req.headers.get('x-organizer-key') || body.organizer_key;
    const validOrganizerKey = process.env.ORGANIZER_SECRET_KEY || 'MONAD-ORGANIZER-2026';

    if (organizerKey !== validOrganizerKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses Ditolak: Hanya Penyelenggara Resmi / Terdaftar yang memiliki izin untuk menerbitkan sertifikat ke Monad.',
        },
        { status: 401 }
      );
    }

    const eventName = (body.event_name || 'Monad Blitz Hackathon 2026').trim();
    const participantsData = body.participants;

    if (!Array.isArray(participantsData) || participantsData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'participants array must not be empty' },
        { status: 400 }
      );
    }

    const eventId = `evt-${Date.now()}`;
    const batchId = `EVT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Step 1: Generate PDFs & Calculate pure SHA-256 binary hashes
    const generatedList: Array<{
      id: string;
      name: string;
      email: string;
      serialNumber: string;
      pdfBytes: Uint8Array;
      pdfHash: string;
    }> = [];

    for (let i = 0; i < participantsData.length; i++) {
      const p = participantsData[i];
      const serialNumber = `VRX-2026-${(i + 1).toString().padStart(4, '0')}`;

      const { pdfBytes } = await VeridexPdfGenerator.generateCertificate({
        recipientName: p.name || 'Participant',
        recipientEmail: p.email || 'user@veridex.xyz',
        eventName,
        issueDate: currentDate,
        serialNumber,
        batchId,
      });

      // Pure SHA-256 hash of PDF buffer
      const pdfHash = VeridexMerkle.sha256(pdfBytes);

      // Save PDF buffer for direct downloads
      VeridexDb.savePdfBuffer(pdfHash, pdfBytes);

      generatedList.push({
        id: `p-${Date.now()}-${i}`,
        name: p.name,
        email: p.email,
        serialNumber,
        pdfBytes,
        pdfHash,
      });
    }

    // Step 2: Build Merkle Tree
    const leaves = generatedList.map(g => g.pdfHash);
    const { root: merkleRoot, getProof } = VeridexMerkle.buildTree(leaves);

    // Step 3: Broadcast transaction to Monad Testnet
    const monadTx = await MonadClient.publishBatchRoot(batchId, merkleRoot);

    // Step 4: Construct participant records with Merkle proofs
    const participantRecords: Participant[] = generatedList.map(g => {
      const proof = getProof(g.pdfHash);
      return {
        id: g.id,
        event_id: eventId,
        name: g.name,
        email: g.email,
        pdf_hash: g.pdfHash,
        merkle_proof: proof,
        status: 'VALID',
        created_at: new Date().toISOString(),
        serial_number: g.serialNumber,
      };
    });

    // Step 5: Save Event & Participants to Database
    const eventRecord: EventBatch = {
      id: eventId,
      name: eventName,
      batch_id: batchId,
      merkle_root: merkleRoot,
      tx_hash: monadTx.txHash,
      block_number: monadTx.blockNumber,
      created_at: new Date().toISOString(),
      participant_count: participantRecords.length,
    };

    VeridexDb.addEvent(eventRecord);
    VeridexDb.addParticipants(participantRecords);

    return NextResponse.json({
      success: true,
      message: 'Batch processed and committed to Monad',
      data: {
        batch_id: batchId,
        tx_hash: monadTx.txHash,
        merkle_root: merkleRoot,
        block_number: monadTx.blockNumber,
        gas_used: monadTx.gasUsed,
        event_name: eventName,
        participants: participantRecords.map(p => ({
          name: p.name,
          email: p.email,
          pdf_hash: p.pdf_hash,
          serial_number: p.serial_number,
          status: p.status,
          download_url: `/api/certificates/${p.pdf_hash}`,
        })),
      },
    });
  } catch (err: any) {
    console.error('Error in /api/issue:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to issue batch' },
      { status: 500 }
    );
  }
}
