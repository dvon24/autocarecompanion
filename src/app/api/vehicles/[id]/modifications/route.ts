import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const ModificationSchema = z.object({
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
  ]),
  name: z.string().min(1, 'Name is required').max(100),
  brand: z.string().max(100).optional().nullable(),
  partNumber: z.string().max(50).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  installDate: z.string().datetime().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  modelData: z.record(z.string(), z.unknown()).optional().nullable(),
  sortOrder: z.number().int().optional(),
});

// GET /api/vehicles/[id]/modifications - Get all modifications for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    // Check if vehicle exists and is accessible
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { userId: true, isPublic: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Allow access if owner or if public
    const isOwner = session?.user?.id === vehicle.userId;
    if (!isOwner && !vehicle.isPublic) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const modifications = await prisma.modification.findMany({
      where: { vehicleId: id },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ modifications });
  } catch (error) {
    console.error('Error fetching modifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modifications' },
      { status: 500 }
    );
  }
}

// POST /api/vehicles/[id]/modifications - Add a modification
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

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

    const body = await request.json();
    const parsed = ModificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Get next sort order
    const maxOrder = await prisma.modification.aggregate({
      where: { vehicleId: id, category: parsed.data.category },
      _max: { sortOrder: true },
    });

    const { modelData, installDate, ...restData } = parsed.data;
    const twinData = modelData && typeof modelData === 'object' && !Array.isArray(modelData)
      ? modelData as Record<string, unknown>
      : null;
    const isOwnerTwinPart = twinData?.source === 'owner-twin' && twinData.kind === 'installed-part';
    if (isOwnerTwinPart && twinData.fitmentConfirmed !== true) {
      return NextResponse.json({ error: 'Confirm that this part fits the vehicle before saving it.' }, { status: 400 });
    }
    if (isOwnerTwinPart && typeof twinData.installedAtMileage === 'number' && typeof vehicle.currentMileage === 'number' && twinData.installedAtMileage > vehicle.currentMileage) {
      return NextResponse.json({ error: 'Installed mileage cannot be greater than the vehicle mileage.' }, { status: 400 });
    }

    const previous = twinData?.source === 'owner-twin' && typeof twinData.nodeId === 'string' && (twinData.kind === 'installed-part' || twinData.kind === 'upgrade')
      ? (await prisma.modification.findMany({ where:{ vehicleId:id }, select:{ id:true, modelData:true } })).filter((entry) => {
          const prior = entry.modelData && typeof entry.modelData === 'object' && !Array.isArray(entry.modelData)
            ? entry.modelData as Record<string, unknown>
            : null;
          return prior?.source === 'owner-twin' && prior.nodeId === twinData.nodeId && prior.kind === twinData.kind;
        }).map((entry) => entry.id)
      : [];

    const modification = await prisma.$transaction(async (tx) => {
      if (previous.length) await tx.modification.deleteMany({ where:{ id:{ in:previous }, vehicleId:id } });
      return tx.modification.create({ data: {
        vehicleId: id,
        ...restData,
        installDate: installDate ? new Date(installDate) : null,
        modelData: modelData ? (modelData as Prisma.InputJsonValue) : undefined,
        sortOrder: parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      } });
    });

    return NextResponse.json({ modification }, { status: 201 });
  } catch (error) {
    console.error('Error creating modification:', error);
    return NextResponse.json(
      { error: 'Failed to create modification' },
      { status: 500 }
    );
  }
}
