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
    const participant = VeridexDb.getParticipantByHash(cleanHash);

    let pdfBuffer = VeridexDb.getPdfBuffer(cleanHash);

    // If not found in buffer cache but participant exists, regenerate PDF on the fly
    if (!pdfBuffer && participant) {
      const event = VeridexDb.getEventById(participant.event_id);
      const generated = await VeridexPdfGenerator.generateCertificate({
        recipientName: participant.name,
        recipientEmail: participant.email,
        eventName: event?.name || 'Monad Blitz Hackathon 2026',
        issueDate: participant.created_at ? new Date(participant.created_at).toLocaleDateString() : 'October 24, 2026',
        serialNumber: participant.serial_number || 'VRX-2026-0001',
        batchId: event?.batch_id,
      });
      pdfBuffer = generated.pdfBytes;
      VeridexDb.savePdfBuffer(cleanHash, pdfBuffer);
    }

    if (!pdfBuffer) {
      return new NextResponse('Certificate file not found', { status: 404 });
    }

    const safeName = (participant?.name || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_');

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Veridex_Certificate_${safeName}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('Error serving certificate PDF:', err);
    return new NextResponse('Internal error serving PDF', { status: 500 });
  }
}
