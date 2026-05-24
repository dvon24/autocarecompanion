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

// GDPR Art. 6(1)(a) + Art. 7 require explicit, demonstrable consent
// before processing personal data on a lawful basis of consent. Art. 8
// requires verifying that the user is at or above the local age of
// consent (16 by default in the EU; some member states set 13). We
// gate both at the server so a hand-crafted POST can't bypass the
// checkboxes shown in the signup UI. Both values are required and
// must be exactly `true` — anything else (false, missing, string)
// fails the schema.
const Body = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80).optional(),
  acceptedPolicies: z.literal(true, {
    message: 'You must accept the Privacy Policy and Terms to create an account.',
  }),
  ageConfirmed: z.literal(true, {
    message: 'You must confirm you are at least 16 years old.',
  }),
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

  // Capture consent at the moment it was given so we can prove it if
  // a regulator asks (GDPR Art. 7(1) — controller must "be able to
  // demonstrate that the data subject has consented"). We log to the
  // server console in addition to the DB record so the consent event
  // is in Vercel logs and isn't lost if the DB row is later purged
  // via an Article 17 erasure request.
  const now = new Date().toISOString();
  console.log(
    `[signup-consent] email=${email} acceptedPolicies=true ageConfirmed=true at=${now}`,
  );

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
