import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canUsePersonalVehicle } from '@/lib/vehicle-capabilities';
import { prisma } from '@/lib/db';
import { createMaintenancePatchHandler } from '@/lib/maintenance-patch-handler';
import { lockServiceOwner, lockServiceVehicle, transferDeletedInvoiceCost } from '@/lib/maintenance-service-mutation';
import { queueStoredReceiptCleanup } from '@/lib/maintenance-receipt-cleanup';

// GET /api/maintenance/[id] - Get single maintenance record
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const record = await prisma.maintenanceRecord.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            userId: true,
            year: true,
            make: true,
            model: true,
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Verify ownership
    if (record.vehicle.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error('Error fetching maintenance record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance record' },
      { status: 500 }
    );
  }
}

// PATCH /api/maintenance/[id] - Update maintenance record
const updateMaintenance = createMaintenancePatchHandler({ auth, prisma });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth(); const { id } = await context.params;
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const record = await prisma.maintenanceRecord.findFirst({ where: { id, vehicle: { userId: session.user.id } }, select: { vehicleId: true } });
  if (!record) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!(await canUsePersonalVehicle(session.user.id, record.vehicleId))) return NextResponse.json({ error: 'hub_required' }, { status: 403 });
  return updateMaintenance(request, context);
}

// DELETE /api/maintenance/[id] - Delete maintenance record
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find record and verify ownership
    const existing = await prisma.maintenanceRecord.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: { userId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    if (existing.vehicle.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cleanupPending = await prisma.$transaction(async tx => {
      await lockServiceOwner(tx, session.user!.id!);
      await lockServiceVehicle(tx, existing.vehicleId);
      const current = await tx.maintenanceRecord.findFirst({ where: { id, vehicle: { userId: session.user!.id! } } });
      if (!current) return false;
      await transferDeletedInvoiceCost(tx, current);
      const queued = await queueStoredReceiptCleanup(tx, { userId: session.user!.id!, vehicleId: current.vehicleId, receiptUrl: current.receiptUrl });
      await tx.maintenanceRecord.delete({ where: { id } });
      return queued;
    }, { isolationLevel: 'ReadCommitted', timeout: 20000 });

    return NextResponse.json({ success: true, cleanupPending }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    return NextResponse.json(
      { error: 'Failed to delete maintenance record' },
      { status: 500 }
    );
  }
}
