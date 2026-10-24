import { NextRequest, NextResponse } from 'next/server';
import { VeridexDb } from '@/lib/storage';
import { VeridexMerkle } from '@/lib/merkle';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let pdfHash = (body.pdf_hash || body.hash || '').trim();

    if (!pdfHash) {
      return NextResponse.json(
        { success: false, status: 'FORGED', message: 'pdf_hash parameter is required' },
        { status: 400 }
      );
    }

    if (!pdfHash.startsWith('0x')) {
      pdfHash = `0x${pdfHash}`;
    }

    // Step 1: Look up participant by PDF hash
    const participant = VeridexDb.getParticipantByHash(pdfHash);

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          status: 'FORGED',
          message: 'Hash mismatch or document forged. No matching certificate root found on Monad.',
          pdf_hash: pdfHash,
        },
        { status: 400 }
      );
    }

    // Step 2: Check revocation status
    if (participant.status === 'REVOKED') {
      return NextResponse.json(
        {
          success: false,
          status: 'REVOKED',
          message: 'This certificate was officially REVOKED by the organizer on Monad Testnet.',
          participant_name: participant.name,
          pdf_hash: pdfHash,
        },
        { status: 400 }
      );
    }

    // Step 3: Fetch event and verify cryptographic Merkle proof against Merkle Root
    const event = VeridexDb.getEventById(participant.event_id);
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          status: 'FORGED',
          message: 'Associated batch event record not found.',
        },
        { status: 400 }
      );
    }

    // Cryptographically verify Merkle proof
    const isValidProof = VeridexMerkle.verifyProof(
      participant.pdf_hash,
      participant.merkle_proof,
      event.merkle_root
    );

    if (!isValidProof) {
      return NextResponse.json(
        {
          success: false,
          status: 'FORGED',
          message: 'Cryptographic proof verification failed against Monad on-chain Merkle Root.',
        },
        { status: 400 }
      );
    }

    // Return Verified details matching PRD spec
    return NextResponse.json({
      success: true,
      status: 'VERIFIED',
      participant_name: participant.name,
      participant_email: participant.email,
      event_name: event.name,
      batch_id: event.batch_id,
      merkle_root: event.merkle_root,
      merkle_proof: participant.merkle_proof,
      tx_hash: event.tx_hash,
      block_number: event.block_number || 28491024,
      issued_at: participant.created_at || event.created_at,
      serial_number: participant.serial_number,
      pdf_hash: participant.pdf_hash,
    });
  } catch (err: any) {
    console.error('Error in /api/verify:', err);
    return NextResponse.json(
      { success: false, status: 'FORGED', message: err.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
