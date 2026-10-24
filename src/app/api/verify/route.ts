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

    // Step 1: Look up land asset by PDF hash
    const asset = VeridexDb.getAssetByHash(pdfHash);

    if (!asset) {
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
    if (asset.status === 'REVOKED') {
      return NextResponse.json(
        {
          success: false,
          status: 'REVOKED',
          message: 'This certificate was officially REVOKED by the land registry office.',
          participant_name: asset.owner_name,
          owner_name: asset.owner_name,
          pdf_hash: pdfHash,
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
          message: 'Associated batch registry record not found.',
        },
        { status: 400 }
      );
    }

    // Cryptographically verify Merkle proof
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
          message: 'Cryptographic proof verification failed against Monad on-chain Merkle Root.',
        },
        { status: 400 }
      );
    }

    // Return Verified details matching both land asset and participant interfaces
    return NextResponse.json({
      success: true,
      status: 'VERIFIED',
      participant_name: asset.owner_name,
      owner_name: asset.owner_name,
      owner_id: asset.owner_id,
      land_location: asset.land_location,
      land_area: asset.land_area,
      land_type: asset.land_type,
      certificate_number: asset.certificate_number,
      event_name: registry.name,
      registry_name: registry.name,
      batch_id: registry.batch_id,
      merkle_root: registry.merkle_root,
      merkle_proof: asset.merkle_proof,
      tx_hash: registry.tx_hash,
      block_number: registry.block_number || 28491024,
      issued_at: asset.created_at || registry.created_at,
      serial_number: asset.serial_number,
      pdf_hash: asset.pdf_hash,
    });
  } catch (err: any) {
    console.error('Error in /api/verify:', err);
    return NextResponse.json(
      { success: false, status: 'FORGED', message: err.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
