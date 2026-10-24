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
    let pdfBuffer = VeridexDb.getPdfBuffer(cleanHash);

    if (!pdfBuffer) {
      const asset = VeridexDb.getAssetByHash(cleanHash);
      if (asset) {
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
      }
    }

    if (!pdfBuffer) {
      return new NextResponse('Dokumen sertifikat tanah tidak ditemukan', { status: 404 });
    }

    // Tamper the PDF buffer by flipping bits in a content byte
    const tamperedBuffer = VeridexPdfGenerator.tamperPdf(pdfBuffer);

    return new NextResponse(Buffer.from(tamperedBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Sertifikat_Tanah_PALSU_REKAYASA_TEST.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Error generating tampered land PDF:', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
