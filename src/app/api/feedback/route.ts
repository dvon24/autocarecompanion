import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface FeedbackPayload {
  type: 'bug' | 'feature' | 'general';
  message: string;
  email?: string;
}

// User feedback. Previously appended to data/feedback.jsonl, which is
// read-only on Vercel — every production submission 500'd and the message
// was lost (2026-06-11 review finding). Now a DB row.
export async function POST(request: NextRequest) {
  try {
    const body: FeedbackPayload = await request.json();

    if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json(
        { error: 'Feedback message is required' },
        { status: 400 }
      );
    }

    const validTypes = ['bug', 'feature', 'general'];
    const type = validTypes.includes(body.type) ? body.type : 'general';

    await prisma.feedback.create({
      data: {
        kind: type,
        message: body.message.trim().slice(0, 10_000),
        email: body.email?.trim().slice(0, 320) || null,
        meta: { userAgent: request.headers.get('user-agent') || null },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}
