import { NextResponse } from 'next/server';
import { VeridexDb } from '@/lib/storage';

export async function GET() {
  try {
    const events = VeridexDb.getEvents();
    const participants = VeridexDb.getParticipants();

    return NextResponse.json({
      success: true,
      events,
      participants: participants.map(p => ({
        id: p.id,
        event_id: p.event_id,
        name: p.name,
        email: p.email,
        pdf_hash: p.pdf_hash,
        status: p.status,
        serial_number: p.serial_number,
        created_at: p.created_at,
        download_url: `/api/certificates/${p.pdf_hash}`,
      })),
      stats: {
        total_events: events.length,
        total_certificates: participants.length,
        valid_count: participants.filter(p => p.status === 'VALID').length,
        revoked_count: participants.filter(p => p.status === 'REVOKED').length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
