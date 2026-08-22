import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { validateEmailAddress } from '@/lib/validate-email';
import { RateLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

// dns.resolveMx in the validator requires the Node runtime, not Edge.
export const runtime = 'nodejs';

// A person signing up for alerts submits once, maybe twice if they mistype.
// Anything past this is a script or someone hammering the form.
const interestLimiter = new RateLimiter(60 * 60_000, 6); // 6 submissions / hour / IP

// Lead capture. Previously appended to data/interest-emails.txt, which is
// read-only on Vercel — every production signup 500'd and the address was
// lost (2026-06-11 review finding). Now a DB row.
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = interestLimiter.check(ip);
    if (!limit.success) return rateLimitResponse(limit.reset);

    const { email, context, company } = await request.json();

    // Honeypot: a field hidden from humans and left empty by them. Bots fill
    // every input they find. Answer 200 so the bot records a success and does
    // not adapt — nothing is written.
    if (typeof company === 'string' && company.trim() !== '') {
      return NextResponse.json({ success: true });
    }

    // Verifies syntax and that the domain can actually receive mail. Junk like
    // `fuck@off.now` (2026-08-21, Audi A6 page) would otherwise be stored and
    // then hard-bounce out of the weekly digest, costing sending reputation for
    // every real lead. See src/lib/validate-email.ts for what this cannot catch.
    const check = await validateEmailAddress(email);
    if (!check.ok) {
      return NextResponse.json(
        { error: check.reason || 'Invalid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
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
