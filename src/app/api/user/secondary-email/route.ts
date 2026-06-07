import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET  /api/user/secondary-email  — returns { secondaryEmail }
 * POST /api/user/secondary-email  — { email: string | null }
 *
 * `email` field on the User row is the immutable login identity.
 * `secondaryEmail` is a soft contact slot the user can set/clear from
 * /account — used for GDPR contact display, receipts, etc. Cleared by
 * posting null or empty string.
 *
 * 401 if not signed in. 400 if the supplied email is malformed.
 */
export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { secondaryEmail: true },
  });
  return NextResponse.json({ secondaryEmail: user?.secondaryEmail ?? null });
}

export async function POST(request: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const raw = body.email;
  const next = typeof raw === 'string' ? raw.trim() : null;

  if (next && !EMAIL_RE.test(next)) {
    return NextResponse.json(
      { error: 'invalid_email', message: 'That doesn\'t look like a valid email.' },
      { status: 400 }
    );
  }

  // Refuse to let the secondary equal the login email — would be
  // confusing and useless.
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (next && me && next.toLowerCase() === me.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'same_as_login', message: 'The secondary email is the same as your login email. Leave it blank if you only want one.' },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { secondaryEmail: next || null },
  });
  return NextResponse.json({ ok: true, secondaryEmail: next || null });
}
