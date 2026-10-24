import { NextRequest, NextResponse } from 'next/server';
import { VeridexDb } from '@/lib/storage';
import { VeridexPdfGenerator } from '@/lib/pdf-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const cleanHash = hash.startsWith('0x') ? hash : `0x${hash}`;
    const asset = VeridexDb.getAssetByHash(cleanHash);

    let pdfBuffer = VeridexDb.getPdfBuffer(cleanHash);

    // If not found in buffer cache but asset exists in db, regenerate Land Certificate PDF on the fly
    if (!pdfBuffer && asset) {
      const registry = VeridexDb.getRegistryById(asset.registry_id);
      const generated = await VeridexPdfGenerator.generateCertificate({
        ownerName: asset.owner_name,
        ownerId: asset.owner_id,
        landLocation: asset.land_location,
        landArea: asset.land_area,
        landType: asset.land_type,
        certificateNumber: asset.certificate_number,
        registryName: registry?.name || 'Kantor Pertanahan BPN',
        issueDate: asset.created_at ? new Date(asset.created_at).toLocaleDateString('id-ID') : '24 Oktober 2026',
        serialNumber: asset.serial_number || 'VRX-LAND-0001',
        batchId: registry?.batch_id,
      });
      pdfBuffer = generated.pdfBytes;
      VeridexDb.savePdfBuffer(cleanHash, pdfBuffer);
    }

    if (!pdfBuffer) {
      return new NextResponse('Dokumen sertifikat tanah tidak ditemukan', { status: 404 });
    }

    const safeName = (asset?.owner_name || 'Pemilik').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeType = (asset?.land_type || 'SHM').replace(/[^a-zA-Z0-9_-]/g, '_');

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Sertifikat_Tanah_${safeType}_${safeName}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('Error serving land certificate PDF:', err);
    return new NextResponse('Internal error serving PDF', { status: 500 });
  }
}
