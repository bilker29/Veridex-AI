import { NextRequest, NextResponse } from 'next/server';
import { VeridexDb } from '@/lib/storage';
import { MonadClient } from '@/lib/monad-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Security Gate: Ensure caller is an authorized registry official
    const organizerKey = req.headers.get('x-organizer-key') || body.organizer_key;
    const validOrganizerKey = process.env.ORGANIZER_SECRET_KEY || 'MONAD-ORGANIZER-2026';

    if (organizerKey !== validOrganizerKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses Ditolak: Hanya Petugas Kantor Pertanahan Resmi yang memiliki izin untuk membatalkan/mencabut sertifikat tanah.',
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

    const asset = VeridexDb.getAssetByHash(certHash);
    if (!asset) {
      return NextResponse.json(
        { success: false, message: 'Sertifikat tanah tidak ditemukan dalam database registri' },
        { status: 404 }
      );
    }

    // Revoke in local DB
    VeridexDb.revokeAsset(certHash);

    // Broadcast revocation to Monad Testnet
    const monadTx = await MonadClient.revokeCertificate(certHash);

    return NextResponse.json({
      success: true,
      status: 'REVOKED',
      message: `Sertifikat tanah ${asset.certificate_number} milik ${asset.owner_name} berhasil dicabut di smart contract Monad`,
      data: {
        owner_name: asset.owner_name,
        certificate_number: asset.certificate_number,
        cert_hash: certHash,
        tx_hash: monadTx.txHash,
        block_number: monadTx.blockNumber,
        explorer_url: monadTx.explorerUrl,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/revoke:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Pencabutan sertifikat gagal' },
      { status: 500 }
    );
  }
}
