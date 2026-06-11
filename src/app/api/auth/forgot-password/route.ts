/**
 * POST /api/auth/forgot-password
 *
 * Issues a single-use, time-limited password reset link and emails it
 * to the user. Always returns 200 OK regardless of whether the email
 * matched a user — leaking that signal is a credential-enumeration
 * vector. The honest "we sent it if the email exists" message is
 * shown on the client.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { sendEmail, passwordResetEmail, appUrl } from '@/lib/email';
import { z } from 'zod';
import { RateLimiter } from '@/lib/rate-limit';

const Body = z.object({
  email: z.string().email().max(254),
});

// Best-effort abuse brake (in-memory, per instance): without it any IP
// could bomb an arbitrary address with reset emails in a loop and burn
// Resend quota (2026-06-11 review finding). Limited callers still get
// {ok:true} so neither rate limits nor registration status leak.
const ipLimiter = new RateLimiter(60 * 60 * 1000, 10); // 10/hour per IP
const emailLimiter = new RateLimiter(60 * 60 * 1000, 3); // 3/hour per target address

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0].trim() : '') || 'unknown';
}

// Lifetime of a reset link. 60 minutes is the industry sweet spot —
// long enough that users finishing a meeting/dinner can still use it,
// short enough that a leaked link from search history goes stale fast.
const TOKEN_TTL_MIN = 60;

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: true }); // Don't leak validation errors here either.
  }
  const email = parsed.email.toLowerCase().trim();

  if (!ipLimiter.check(clientIp(request)).success || !emailLimiter.check(email).success) {
    return NextResponse.json({ ok: true }); // same shape — don't leak the limit
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true, email: true, name: true },
  });

  // Even if no user, return success and don't send. This intentionally
  // matches the response shape for both branches so a network-tap
  // observer can't tell which emails are registered.
  if (!user) {
    // Sleep briefly so timing doesn't leak existence either.
    await new Promise((r) => setTimeout(r, 120));
    return NextResponse.json({ ok: true });
  }

  // Generate a 32-byte URL-safe random token. We store only its SHA-256
  // hash so a DB compromise doesn't yield usable reset links.
  const rawToken = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MIN * 60 * 1000);

  // Invalidate any prior outstanding tokens for this user before issuing
  // a new one — keeps the "single live reset link per user" invariant.
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetLink = `${appUrl()}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;
  const { html, text } = passwordResetEmail(resetLink, TOKEN_TTL_MIN);

  await sendEmail({
    to: user.email,
    subject: 'Reset your Au7o password',
    html,
    text,
  });

  return NextResponse.json({ ok: true });
}
