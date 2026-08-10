import { NextResponse } from 'next/server';

/**
 * Checkout can no longer create or authenticate an account. Owners must sign
 * in through NextAuth before starting checkout, where the normal provider and
 * JWT allowlist callbacks apply.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Checkout auto-signin is closed. Sign in before checkout.' },
    { status: 410 },
  );
}
