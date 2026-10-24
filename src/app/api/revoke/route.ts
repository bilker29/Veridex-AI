import { NextRequest, NextResponse } from 'next/server';
import { VeridexDb } from '@/lib/storage';
import { MonadClient } from '@/lib/monad-client';

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
          message: 'Akses Ditolak: Hanya Penyelenggara Resmi / Terdaftar yang memiliki izin untuk mencabut sertifikat.',
        },
        { status: 401 }
      );
    }

    let certHash = (body.cert_hash || body.pdf_hash || '').trim();

    if (!certHash) {
      return NextResponse.json(
        { success: false, message: 'cert_hash is required' },
        { status: 400 }
      );
    }

    if (!certHash.startsWith('0x')) {
      certHash = `0x${certHash}`;
    }

    const participant = VeridexDb.getParticipantByHash(certHash);
    if (!participant) {
      return NextResponse.json(
        { success: false, message: 'Certificate not found in registry' },
        { status: 404 }
      );
    }

    // Revoke in DB
    VeridexDb.revokeParticipant(certHash);

    // Broadcast revocation to Monad Testnet
    const monadTx = await MonadClient.revokeCertificate(certHash);

    return NextResponse.json({
      success: true,
      status: 'REVOKED',
      message: `Certificate for ${participant.name} revoked successfully on Monad Testnet`,
      data: {
        participant_name: participant.name,
        cert_hash: certHash,
        tx_hash: monadTx.txHash,
        block_number: monadTx.blockNumber,
        explorer_url: monadTx.explorerUrl,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/revoke:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Revocation failed' },
      { status: 500 }
    );
  }
}
