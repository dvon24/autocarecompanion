import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';

interface VehicleFeedback {
  timestamp: string;
  userInput: string;
  aiParsed: {
    year: number;
    make: string;
    model: string;
    trim?: string;
    engine?: string;
  };
  userCorrection: string;
  userAgent?: string;
}

// Vehicle-parse corrections. Previously persisted to data/vehicle-feedback.json,
// which is read-only on Vercel — every production correction 500'd and was
// lost, and the admin view always showed an empty list (2026-06-11 review
// finding). Now Feedback rows with kind='vehicle-correction'.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, aiParsed, userCorrection } = body;

    if (!userInput || !aiParsed || !userCorrection) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await prisma.feedback.create({
      data: {
        kind: 'vehicle-correction',
        message: String(userCorrection).slice(0, 2_000),
        meta: {
          userInput: String(userInput).slice(0, 2_000),
          aiParsed,
          userAgent: request.headers.get('user-agent') || null,
        },
      },
    });

    console.log('[Vehicle Feedback] New correction submitted:', {
      input: userInput,
      parsed: `${aiParsed.year} ${aiParsed.make} ${aiParsed.model} ${aiParsed.trim || ''}`,
      correction: userCorrection,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vehicle feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Founder-only: feeds the admin dashboard's corrections view.
  const session = await auth();
  if (!isFounderEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  try {
    const rows = await prisma.feedback.findMany({
      where: { kind: 'vehicle-correction' },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    const feedback: VehicleFeedback[] = rows.map((r) => {
      const meta = (r.meta ?? {}) as Record<string, unknown>;
      return {
        timestamp: r.createdAt.toISOString(),
        userInput: String(meta.userInput ?? ''),
        aiParsed: (meta.aiParsed ?? {}) as VehicleFeedback['aiParsed'],
        userCorrection: r.message,
        userAgent: (meta.userAgent as string) ?? undefined,
      };
    });
    return NextResponse.json({ feedback, count: feedback.length });
  } catch (error) {
    console.error('Vehicle feedback fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
