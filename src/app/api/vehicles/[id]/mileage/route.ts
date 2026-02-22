import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const UpdateMileageSchema = z.object({
  mileage: z.number().min(0).max(9999999),
  source: z.enum(['manual', 'obd', 'estimated']).optional().default('manual'),
});

// POST /api/vehicles/[id]/mileage - Update vehicle mileage
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = UpdateMileageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid mileage data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { mileage, source } = parsed.data;

    // Validate mileage is greater than current (unless it's the first entry)
    if (vehicle.currentMileage && mileage < vehicle.currentMileage) {
      return NextResponse.json(
        { error: 'New mileage must be greater than current mileage' },
        { status: 400 }
      );
    }

    // Update vehicle mileage
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        currentMileage: mileage,
        lastMileageUpdate: new Date(),
      },
    });

    // Create mileage log entry
    const mileageLog = await prisma.mileageLog.create({
      data: {
        vehicleId: id,
        mileage,
        source,
      },
    });

    return NextResponse.json({
      vehicle: updatedVehicle,
      mileageLog,
    });
  } catch (error) {
    console.error('Error updating mileage:', error);
    return NextResponse.json(
      { error: 'Failed to update mileage' },
      { status: 500 }
    );
  }
}

// GET /api/vehicles/[id]/mileage - Get mileage history
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');

    const mileageHistory = await prisma.mileageLog.findMany({
      where: { vehicleId: id },
      orderBy: { date: 'desc' },
      take: Math.min(limit, 100),
    });

    return NextResponse.json({ mileageHistory });
  } catch (error) {
    console.error('Error fetching mileage history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mileage history' },
      { status: 500 }
    );
  }
}
