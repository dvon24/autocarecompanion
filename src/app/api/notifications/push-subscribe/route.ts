import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

// POST /api/notifications/push-subscribe - Subscribe to push notifications
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = PushSubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid subscription data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { endpoint, keys } = parsed.data;

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existing) {
      // Update if it belongs to this user, error if different user
      if (existing.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Subscription belongs to another user' },
          { status: 400 }
        );
      }

      // Update existing subscription
      const subscription = await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });

      return NextResponse.json({ subscription, updated: true });
    }

    // Create new subscription
    const subscription = await prisma.pushSubscription.create({
      data: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    // Enable push notifications for user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { pushNotifications: true },
    });

    return NextResponse.json({ subscription, created: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/push-subscribe - Unsubscribe from push notifications
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
    }

    // Delete the subscription
    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
        endpoint,
      },
    });

    // Check if user has any remaining subscriptions
    const remaining = await prisma.pushSubscription.count({
      where: { userId: session.user.id },
    });

    // If no subscriptions left, disable push notifications
    if (remaining === 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { pushNotifications: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
