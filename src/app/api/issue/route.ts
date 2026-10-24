import { NextRequest, NextResponse } from 'next/server';
import { VeridexPdfGenerator } from '@/lib/pdf-generator';
import { VeridexMerkle } from '@/lib/merkle';
import { MonadClient } from '@/lib/monad-client';
import { VeridexDb } from '@/lib/storage';
import { RegistryBatch, LandAsset } from '@/lib/types';

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
          message: 'Akses Ditolak: Hanya Petugas Kantor Pertanahan Resmi yang memiliki izin untuk menerbitkan sertifikat tanah ke Monad.',
        },
        { status: 401 }
      );
    }

    const registryName = (body.registry_name || body.event_name || 'Kantor Pertanahan Jakarta Selatan').trim();
    const assetsData = body.assets || body.participants;

    if (!Array.isArray(assetsData) || assetsData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'assets array must not be empty' },
        { status: 400 }
      );
    }

    const registryId = `reg-${Date.now()}`;
    const batchId = `BPN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const currentDate = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Step 1: Generate Land Certificate PDFs & Calculate SHA-256 binary hashes
    const generatedList: Array<{
      id: string;
      ownerName: string;
      ownerId: string;
      landLocation: string;
      landArea: string;
      landType: string;
      certificateNumber: string;
      serialNumber: string;
      pdfBytes: Uint8Array;
      pdfHash: string;
    }> = [];

    for (let i = 0; i < assetsData.length; i++) {
      const a = assetsData[i];
      const serialNumber = `VRX-LAND-${(i + 1).toString().padStart(4, '0')}`;
      const landType = (a.land_type || a.type || 'SHM').toUpperCase();
      const certNum = `${landType}-${Math.floor(10000 + Math.random() * 90000)}/2026`;
      const ownerName = a.owner_name || a.name || 'Pemilik Tanah';
      const ownerId = a.owner_id || a.nik || '3201010101900001';
      const landLocation = a.land_location || a.location || 'DKI Jakarta';
      const landArea = a.land_area || a.area || '500 m²';

      const { pdfBytes } = await VeridexPdfGenerator.generateCertificate({
        ownerName,
        ownerId,
        landLocation,
        landArea,
        landType,
        certificateNumber: certNum,
        registryName,
        issueDate: currentDate,
        serialNumber,
        batchId,
      });

      // Pure SHA-256 hash of the binary PDF
      const pdfHash = VeridexMerkle.sha256(pdfBytes);

      // Save PDF buffer for instant retrieval & downloads
      VeridexDb.savePdfBuffer(pdfHash, pdfBytes);

      generatedList.push({
        id: `asset-${Date.now()}-${i}`,
        ownerName,
        ownerId,
        landLocation,
        landArea,
        landType,
        certificateNumber: certNum,
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

    // Step 4: Construct LandAsset records with cryptographic Merkle proofs
    const assetRecords: LandAsset[] = generatedList.map(g => {
      const proof = getProof(g.pdfHash);
      return {
        id: g.id,
        registry_id: registryId,
        owner_name: g.ownerName,
        owner_id: g.ownerId,
        land_location: g.landLocation,
        land_area: g.landArea,
        land_type: g.landType,
        certificate_number: g.certificateNumber,
        pdf_hash: g.pdfHash,
        merkle_proof: proof,
        status: 'VALID',
        created_at: new Date().toISOString(),
        serial_number: g.serialNumber,
      };
    });

    // Step 5: Save Registry Batch & Land Assets to Storage
    const registryRecord: RegistryBatch = {
      id: registryId,
      name: registryName,
      batch_id: batchId,
      merkle_root: merkleRoot,
      tx_hash: monadTx.txHash,
      block_number: monadTx.blockNumber,
      created_at: new Date().toISOString(),
      asset_count: assetRecords.length,
    };

    VeridexDb.addRegistry(registryRecord);
    VeridexDb.addAssets(assetRecords);

    return NextResponse.json({
      success: true,
      message: 'Batch sertifikat tanah RWA berhasil diterbitkan ke Monad Testnet',
      data: {
        batch_id: batchId,
        tx_hash: monadTx.txHash,
        merkle_root: merkleRoot,
        block_number: monadTx.blockNumber,
        gas_used: monadTx.gasUsed,
        registry_name: registryName,
        assets: assetRecords.map(a => ({
          owner_name: a.owner_name,
          owner_id: a.owner_id,
          land_location: a.land_location,
          land_area: a.land_area,
          land_type: a.land_type,
          certificate_number: a.certificate_number,
          pdf_hash: a.pdf_hash,
          serial_number: a.serial_number,
          status: a.status,
          download_url: `/api/certificates/${a.pdf_hash}`,
        })),
      },
    });
  } catch (err: any) {
    console.error('Error in /api/issue:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal menerbitkan batch sertifikat tanah' },
      { status: 500 }
    );
  }
}
