import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * DEV ONLY: Reset or create a test user
 * POST /api/auth/dev-reset
 * Body: { email: string, password: string }
 *
 * This endpoint should be removed or protected in production.
 */
export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Update password
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { passwordHash },
      });

      return NextResponse.json({
        message: 'Password updated successfully',
        email: existingUser.email,
        userId: existingUser.id,
      });
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name: email.split('@')[0],
          subscriptionStatus: 'active', // Give full access for testing
        },
      });

      return NextResponse.json({
        message: 'User created successfully',
        email: newUser.email,
        userId: newUser.id,
      });
    }
  } catch (error) {
    console.error('Dev reset error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// GET to check if a user exists
export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        createdAt: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      email: user.email,
      name: user.name,
      subscriptionStatus: user.subscriptionStatus,
      hasPassword: !!user.passwordHash,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Dev check error:', error);
    return NextResponse.json({ error: 'Failed to check user' }, { status: 500 });
  }
}
