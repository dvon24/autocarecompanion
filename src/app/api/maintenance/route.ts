import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { MAINTENANCE_SCHEDULES } from '@/lib/maintenance';
import { isFounderEmail } from '@/lib/founder';

const CreateMaintenanceSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.string().refine((val) => val in MAINTENANCE_SCHEDULES, {
    message: 'Invalid maintenance type',
  }),
  description: z.string().max(500).optional(),
  mileage: z.number().min(0),
  cost: z.number().min(0).optional(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  nextDueMileage: z.number().min(0).optional(),
  nextDueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  notes: z.string().max(2000).optional(),
  receiptUrl: z.string().url().optional(),
  shopName: z.string().max(200).optional(),
});

// GET /api/maintenance - List maintenance records (by vehicle)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'vehicleId is required' },
        { status: 400 }
      );
    }

    // Verify vehicle ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: session.user.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const records = await prisma.maintenanceRecord.findMany({
      where: {
        vehicleId,
        ...(type && { type }),
      },
      orderBy: { date: 'desc' },
      take: Math.min(limit, 100),
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance records' },
      { status: 500 }
    );
  }
}

// POST /api/maintenance - Log new maintenance
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tier gate — maintenance logging is a Plus/Pro feature
    // (TIER_LIMITS.free.maintenanceTracking === false). Approximated
    // as "has an active Stripe subscription"; the tier-aware helper
    // will plug in once it's wired server-wide.
    //
    // Founder + ops bypass: the same allow-list used by the geo gate
    // (see src/lib/founder.ts) skips this check so the founder can QA
    // the log flow from a Free account.
    if (!isFounderEmail(session.user.email)) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subscriptionStatus: true, subscriptionId: true },
      });

      if (!user?.subscriptionId || user.subscriptionStatus !== 'active') {
        return NextResponse.json(
          {
            error: 'tier_required',
            message: 'Logging maintenance to history is a Plus / Pro feature. Upgrade to track services.',
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const parsed = CreateMaintenanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { vehicleId, date, nextDueDate, ...data } = parsed.data;

    // Verify vehicle ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: session.user.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const record = await prisma.maintenanceRecord.create({
      data: {
        ...data,
        vehicleId,
        date: new Date(date),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      },
    });

    // Update vehicle mileage if the new record has higher mileage
    if (data.mileage > (vehicle.currentMileage ?? 0)) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          currentMileage: data.mileage,
          lastMileageUpdate: new Date(),
        },
      });

      // Also log to mileage history
      await prisma.mileageLog.create({
        data: {
          vehicleId,
          mileage: data.mileage,
          source: 'maintenance',
        },
      });
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance record' },
      { status: 500 }
    );
  }
}
