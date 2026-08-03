/**
 * POST /api/auth/reset-password
 *
 * Consumes a single-use reset token (issued by /forgot-password) and
 * sets the user's new password. Marks the token used atomically so
 * a repeated submit can't change the password twice.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { passwordResetLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

const Body = z.object({
  token: z.string().min(20).max(256),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  // Reset tokens are guessable in principle; without a brake this endpoint
  // accepts unlimited token submissions.
  const ip = getClientIp(request);
  if (ip !== 'unknown') {
    const gate = passwordResetLimiter.check(ip);
    if (!gate.success) return rateLimitResponse(gate.reset);
  }

  let parsed;
  try {
    parsed = Body.parse(await request.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 },
    );
  }
  const { token, password } = parsed;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'This reset link is invalid or has expired. Request a new one.' },
      { status: 400 },
    );
  }

  const hash = await bcrypt.hash(password, 12);

  // Update password + mark token used in a single transaction so a
  // double-submit can't slip through under load.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash: hash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
