import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const ModificationUpdateSchema = z.object({
  category: z.enum([
    'wheels',
    'tires',
    'suspension',
    'exhaust',
    'body',
    'interior',
    'performance',
    'lighting',
    'audio',
    'other',
  ]).optional(),
  name: z.string().min(1).max(100).optional(),
  brand: z.string().max(100).optional().nullable(),
  partNumber: z.string().max(50).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  installDate: z.string().datetime().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  modelData: z.record(z.string(), z.unknown()).optional().nullable(),
  sortOrder: z.number().int().optional(),
});

// GET /api/vehicles/[id]/modifications/[modId] - Get a single modification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; modId: string }> }
) {
  try {
    const session = await auth();
    const { id, modId } = await params;

    // Check if vehicle exists and is accessible
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { userId: true, isPublic: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const isOwner = session?.user?.id === vehicle.userId;
    if (!isOwner && !vehicle.isPublic) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const modification = await prisma.modification.findFirst({
      where: {
        id: modId,
        vehicleId: id,
      },
    });

    if (!modification) {
      return NextResponse.json(
        { error: 'Modification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ modification });
  } catch (error) {
    console.error('Error fetching modification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modification' },
      { status: 500 }
    );
  }
}

// PATCH /api/vehicles/[id]/modifications/[modId] - Update a modification
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; modId: string }> }
) {
  try {
    const session = await auth();
    const { id, modId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const existing = await prisma.modification.findFirst({
      where: {
        id: modId,
        vehicleId: id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Modification not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = ModificationUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { modelData, installDate, ...restData } = parsed.data;
    const updateData: Record<string, unknown> = { ...restData };

    if (installDate !== undefined) {
      updateData.installDate = installDate ? new Date(installDate) : null;
    }
    if (modelData !== undefined) {
      updateData.modelData = modelData ? (modelData as Prisma.InputJsonValue) : undefined;
    }

    const modification = await prisma.modification.update({
      where: { id: modId },
      data: updateData,
    });

    return NextResponse.json({ modification });
  } catch (error) {
    console.error('Error updating modification:', error);
    return NextResponse.json(
      { error: 'Failed to update modification' },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicles/[id]/modifications/[modId] - Delete a modification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; modId: string }> }
) {
  try {
    const session = await auth();
    const { id, modId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const existing = await prisma.modification.findFirst({
      where: {
        id: modId,
        vehicleId: id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Modification not found' },
        { status: 404 }
      );
    }

    await prisma.modification.delete({
      where: { id: modId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting modification:', error);
    return NextResponse.json(
      { error: 'Failed to delete modification' },
      { status: 500 }
    );
  }
}
