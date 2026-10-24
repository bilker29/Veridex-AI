import { NextRequest, NextResponse } from 'next/server';
import { VeridexDb } from '@/lib/storage';
import { VeridexMerkle } from '@/lib/merkle';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const queryParam = (body.query || body.search || body.certificate_number || body.serial_number || '').trim();
    let pdfHash = (body.pdf_hash || body.hash || '').trim();

    if (!pdfHash && !queryParam) {
      return NextResponse.json(
        { success: false, status: 'FORGED', message: 'Hash dokumen atau nomor sertifikat diperlukan untuk verifikasi' },
        { status: 400 }
      );
    }

    if (pdfHash && !pdfHash.startsWith('0x') && pdfHash.length === 64) {
      pdfHash = `0x${pdfHash}`;
    }

    // Step 1: Look up land asset by PDF hash or query (certificate number, serial, NIK)
    let asset = pdfHash ? VeridexDb.getAssetByHash(pdfHash) : undefined;
    if (!asset && (queryParam || pdfHash)) {
      asset = VeridexDb.getAssetByQuery(queryParam || pdfHash);
    }

    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          status: 'FORGED',
          message: 'Sertifikat tidak ditemukan atau nilai hash tidak cocok dengan catatan resmi pada blockchain Monad.',
          pdf_hash: pdfHash || queryParam,
        },
        { status: 400 }
      );
    }

    // Step 2: Check revocation status
    if (asset.status === 'REVOKED') {
      return NextResponse.json(
        {
          success: false,
          status: 'REVOKED',
          message: 'Sertifikat tanah ini pernah diterbitkan namun telah resmi DICABUT / DIBATALKAN oleh Kantor Pertanahan.',
          owner_name: asset.owner_name,
          owner_id: asset.owner_id,
          certificate_number: asset.certificate_number,
          land_location: asset.land_location,
          land_area: asset.land_area,
          land_type: asset.land_type,
          pdf_hash: asset.pdf_hash,
          serial_number: asset.serial_number,
        },
        { status: 400 }
      );
    }

    // Step 3: Fetch registry batch and verify cryptographic Merkle proof against Merkle Root
    const registry = VeridexDb.getRegistryById(asset.registry_id);
    if (!registry) {
      return NextResponse.json(
        {
          success: false,
          status: 'FORGED',
          message: 'Data batch registri kantor pertanahan tidak ditemukan.',
        },
        { status: 400 }
      );
    }

    // Cryptographically verify Merkle proof against Monad on-chain Merkle Root
    const isValidProof = VeridexMerkle.verifyProof(
      asset.pdf_hash,
      asset.merkle_proof,
      registry.merkle_root
    );

    if (!isValidProof) {
      return NextResponse.json(
        {
          success: false,
          status: 'FORGED',
          message: 'Verifikasi bukti kriptografis Merkle gagal terhadap Root on-chain Monad.',
        },
        { status: 400 }
      );
    }

    // Return Verified details with complete land asset specifications
    return NextResponse.json({
      success: true,
      status: 'VERIFIED',
      owner_name: asset.owner_name,
      owner_id: asset.owner_id,
      land_location: asset.land_location,
      land_area: asset.land_area,
      land_type: asset.land_type,
      certificate_number: asset.certificate_number,
      registry_name: registry.name,
      batch_id: registry.batch_id,
      merkle_root: registry.merkle_root,
      merkle_proof: asset.merkle_proof,
      tx_hash: registry.tx_hash,
      block_number: registry.block_number || 28491024,
      issued_at: asset.created_at || registry.created_at,
      serial_number: asset.serial_number,
      pdf_hash: asset.pdf_hash,
      download_url: `/api/certificates/${asset.pdf_hash}`,
      tampered_download_url: `/api/certificates/${asset.pdf_hash}/tampered`,
      // Backward compatibility aliases
      participant_name: asset.owner_name,
      participant_email: asset.owner_id,
      event_name: registry.name,
    });
  } catch (err: any) {
    console.error('Error in /api/verify:', err);
    return NextResponse.json(
      { success: false, status: 'FORGED', message: err.message || 'Verifikasi sertifikat gagal' },
      { status: 500 }
    );
  }
}
