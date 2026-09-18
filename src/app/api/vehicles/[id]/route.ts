import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canUsePersonalVehicle, canConfirmPersonalVehicleEquipment } from '@/lib/vehicle-capabilities';
import { prisma } from '@/lib/db';
import { createVehiclePatchHandler } from '@/lib/vehicle-patch-handler';
import { lockServiceOwner, lockServiceVehicle } from '@/lib/maintenance-service-mutation';
import { queueReceiptCleanup } from '@/lib/maintenance-receipt-cleanup';

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
const updateVehicle = createVehiclePatchHandler({ auth, prisma });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth(); const { id } = await context.params;
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!(await canUsePersonalVehicle(session.user.id, id))) {
    const body = await request.clone().json().catch(() => null);
    if (!(await canConfirmPersonalVehicleEquipment(session.user.id, id, body))) return NextResponse.json({ error: 'hub_required' }, { status: 403 });
  }
  return updateVehicle(request, context);
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

    await prisma.$transaction(async tx => {
      await lockServiceOwner(tx, session.user!.id!);
      await lockServiceVehicle(tx, id);
      const current = await tx.vehicle.findFirst({ where: { id, userId: session.user!.id! } });
      if (!current) return;
      await queueReceiptCleanup(tx, { userId: session.user!.id!, vehicleId: id });
      await tx.vehicle.delete({ where: { id } });
      if (current.isPrimary) {
        const next = await tx.vehicle.findFirst({ where: { userId: session.user!.id! }, orderBy: { createdAt: 'asc' } });
        if (next) await tx.vehicle.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
    }, { isolationLevel: 'ReadCommitted', timeout: 20000 });

    return NextResponse.json({ success: true, cleanupPending: true }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}
