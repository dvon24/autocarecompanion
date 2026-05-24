/**
 * POST /api/auth/signup
 *
 * Free email+password account creation. Separate from the paid
 * /subscribe → Stripe Checkout flow so users can have a basic
 * persistent account (vehicle memory, chat history, mileage sync)
 * without subscribing.
 *
 * Returns 200 + the email on success; the client then calls
 * next-auth signIn() to establish a session.
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const Body = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80).optional(),
});

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = Body.parse(await request.json());
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof z.ZodError
            ? err.issues[0]?.message || 'Invalid input'
            : 'Invalid request body',
      },
      { status: 400 },
    );
  }

  const email = parsed.email.toLowerCase().trim();
  const name = parsed.name?.trim() || null;

  // Reject if email already exists. We deliberately surface the
  // collision here (unlike forgot-password where we mask existence) —
  // signup forms generally need to tell the user "this email is
  // already registered, try signing in instead" or the UX is awful.
  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      {
        error:
          'An account with this email already exists. Try signing in, or reset your password.',
      },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.password, 12);

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      // emailVerified intentionally null — verification email is a
      // follow-up once Resend is configured. For now anyone with the
      // password is treated as the account owner.
    },
    select: { id: true, email: true },
  });

  return NextResponse.json({ ok: true, email });
}
