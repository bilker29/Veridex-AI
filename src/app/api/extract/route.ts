import { NextRequest, NextResponse } from 'next/server';
import { AiExtractor } from '@/lib/ai-extractor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = body.raw_text || body.text || '';

    if (!rawText.trim()) {
      return NextResponse.json(
        { success: false, message: 'raw_text is required' },
        { status: 400 }
      );
    }

    const participants = await AiExtractor.extractParticipants(rawText);

    return NextResponse.json({
      success: true,
      data: participants,
    });
  } catch (err: any) {
    console.error('Error in /api/extract:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to extract data' },
      { status: 500 }
    );
  }
}
