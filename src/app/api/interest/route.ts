import { NextRequest, NextResponse } from 'next/server';
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

    const ctx = typeof context === 'string' ? context.slice(0, 120) : null;
    await prisma.interestEmail.create({ data: { email: email.trim().toLowerCase(), context: ctx } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving interest email:', error);
    return NextResponse.json(
      { error: 'Failed to save email' },
      { status: 500 }
    );
  }
}
