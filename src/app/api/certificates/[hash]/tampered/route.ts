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
      const participant = VeridexDb.getParticipantByHash(cleanHash);
      if (participant) {
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
      }
    }

    if (!pdfBuffer) {
      return new NextResponse('Certificate file not found', { status: 404 });
    }

    // Tamper the PDF buffer by flipping bits in a content byte
    const tamperedBuffer = VeridexPdfGenerator.tamperPdf(pdfBuffer);

    return new NextResponse(Buffer.from(tamperedBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Veridex_TAMPERED_FORGERY_TEST.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Error generating tampered PDF:', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
