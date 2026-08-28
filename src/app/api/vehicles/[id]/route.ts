import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createVehiclePatchHandler } from '@/lib/vehicle-patch-handler';

// GET /api/vehicles/[id] - Get single vehicle
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

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        maintenanceRecords: {
          orderBy: { date: 'desc' },
        },
        modifications: {
          orderBy: { sortOrder: 'asc' },
        },
        mileageHistory: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}

// PATCH /api/vehicles/[id] - Update vehicle
export const PATCH = createVehiclePatchHandler({ auth, prisma });

// DELETE /api/vehicles/[id] - Delete vehicle
export async function DELETE(
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
    const existing = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    // If deleted vehicle was primary, make another one primary
    if (existing.isPrimary) {
      const nextVehicle = await prisma.vehicle.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' },
      });

      if (nextVehicle) {
        await prisma.vehicle.update({
          where: { id: nextVehicle.id },
          data: { isPrimary: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}
