import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

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

    const msg = body.message.trim().slice(0, 10_000);
    await prisma.feedback.create({
      data: {
        kind: type,
        message: msg,
        email: body.email?.trim().slice(0, 320) || null,
        meta: { userAgent: request.headers.get('user-agent') || null },
      },
    });

    // Notify the team so feedback is actually seen (not just a DB row).
    // Best-effort: only fires when RESEND_API_KEY + FEEDBACK_NOTIFY_EMAIL are
    // set, and a failure here must never fail the save.
    try {
      const notifyTo = process.env.FEEDBACK_NOTIFY_EMAIL;
      if (notifyTo) {
        const from = body.email?.trim() || 'anonymous';
        const safe = msg.slice(0, 4000).replace(/</g, '&lt;');
        await sendEmail({
          to: notifyTo,
          subject: `Au7o feedback (${type}) from ${from}`,
          text: `Type: ${type}\nFrom: ${from}\n\n${msg.slice(0, 4000)}`,
          html: `<p><strong>Type:</strong> ${type}</p><p><strong>From:</strong> ${from}</p><pre style="white-space:pre-wrap;font-family:inherit">${safe}</pre>`,
        });
      }
    } catch (notifyErr) {
      console.warn('feedback email notify failed (saved to DB anyway):', notifyErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}
