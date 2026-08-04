import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';

// Lead capture. Previously appended to data/interest-emails.txt, which is
// read-only on Vercel — every production signup 500'd and the address was
// lost (2026-06-11 review finding). Now a DB row.
export async function POST(request: NextRequest) {
  try {
    const { email, context } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 320) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const ctx = typeof context === 'string' ? context.trim().slice(0, 120) : null;
    // Repeated taps/submissions are one alert subscription, not multiple email
    // deliveries. A previously unsubscribed row is intentionally not reused so
    // submitting the form again can act as an explicit re-subscription.
    const existing = await prisma.interestEmail.findFirst({
      where: {
        email: normalizedEmail,
        context: ctx,
        unsubscribedAt: null,
      },
      select: { id: true },
    });
    if (existing) return NextResponse.json({ success: true });
    // Mint an unsubscribe token up front so the weekly digest can always include
    // a one-click opt-out link (CAN-SPAM) without a follow-up write.
    const unsubscribeToken = randomBytes(24).toString('base64url');
    await prisma.interestEmail.create({
      data: { email: normalizedEmail, context: ctx, unsubscribeToken },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving interest email:', error);
    return NextResponse.json(
      { error: 'Failed to save email' },
      { status: 500 }
    );
  }
}
