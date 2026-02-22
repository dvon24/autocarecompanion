import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const UpdateVehicleSchema = z.object({
  year: z.number().min(1900).max(new Date().getFullYear() + 2).optional(),
  make: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  trim: z.string().max(100).optional().nullable(),
  vin: z.string().max(17).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  nickname: z.string().max(100).optional().nullable(),
  currentMileage: z.number().min(0).optional().nullable(),
  annualMileage: z.number().min(0).max(200000).optional().nullable(),
  isPrimary: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  showcaseSlug: z.string().max(100).optional().nullable(),
});

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
export async function PATCH(
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

    const body = await request.json();
    const parsed = UpdateVehicleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid vehicle data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { isPrimary, currentMileage, annualMileage, ...updateData } = parsed.data;

    // If marking as primary, update other vehicles
    if (isPrimary) {
      await prisma.vehicle.updateMany({
        where: {
          userId: session.user.id,
          id: { not: id },
        },
        data: { isPrimary: false },
      });
    }

    // Build update object
    const vehicleUpdate: Record<string, unknown> = {
      ...updateData,
      isPrimary: isPrimary ?? existing.isPrimary,
    };

    // Handle mileage updates
    if (currentMileage !== undefined) {
      vehicleUpdate.currentMileage = currentMileage;
      vehicleUpdate.lastMileageUpdate = new Date();

      // Log to mileage history if value changed
      if (currentMileage !== null && currentMileage !== existing.currentMileage) {
        await prisma.mileageLog.create({
          data: {
            vehicleId: id,
            mileage: currentMileage,
            source: 'manual',
          },
        });
      }
    }

    if (annualMileage !== undefined) {
      vehicleUpdate.annualMileage = annualMileage;
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: vehicleUpdate,
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

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
