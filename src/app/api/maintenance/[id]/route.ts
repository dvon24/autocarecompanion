import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createMaintenancePatchHandler } from '@/lib/maintenance-patch-handler';

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
export const PATCH = createMaintenancePatchHandler({ auth, prisma });

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

    await prisma.maintenanceRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    return NextResponse.json(
      { error: 'Failed to delete maintenance record' },
      { status: 500 }
    );
  }
}
