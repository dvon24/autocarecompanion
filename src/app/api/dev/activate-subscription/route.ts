import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DEV ONLY: Manually activate subscription for testing
// Remove this in production!
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    // Use upsert to create user if they don't exist
    const user = await prisma.user.upsert({
      where: { id: session.user.id },
      update: { subscriptionStatus: 'active' },
      create: {
        id: session.user.id,
        email: session.user.email || `user-${session.user.id}@temp.local`,
        name: session.user.name,
        subscriptionStatus: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error('Error activating subscription:', error);
    return NextResponse.json({ error: 'Failed to activate' }, { status: 500 });
  }
}
