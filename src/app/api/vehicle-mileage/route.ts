/**
 * POST /api/vehicle-mileage
 *
 * Lightweight slug-based mileage update for the hub MileageEditor.
 *
 * The existing /api/vehicles/[id]/mileage endpoint requires a pre-existing
 * Vehicle row, which most hub users don't have (they landed on /vehicle/[slug]
 * without going through Garage onboarding first).
 *
 * This endpoint:
 *   - 401s anonymous users (they should write to localStorage instead — the
 *     MileageEditor component handles that branch).
 *   - For signed-in users: upserts a Vehicle row keyed by (userId, year,
 *     make, model) and writes currentMileage. Trim is also captured but
 *     not used as a key — re-using existing Vehicle rows on the same YMMT
 *     keeps the Garage tidy.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canUsePersonalVehicle } from '@/lib/vehicle-capabilities';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const Body = z.object({
  vehicleId: z.string().max(128).optional(),
  year: z.number().int().min(1900).max(2100),
  make: z.string().min(1).max(64),
  model: z.string().min(1).max(64),
  trim: z.string().min(1).max(64).optional().nullable(),
  mileage: z.number().int().min(0).max(9_999_999),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let parsed;
  try {
    parsed = Body.parse(await request.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid body', details: err instanceof z.ZodError ? err.issues : String(err) },
      { status: 400 },
    );
  }

  const { year, make, model, trim, mileage } = parsed;

  // Find existing Vehicle row by user + YMMT (case-insensitive on make/model).
  const matches = await prisma.vehicle.findMany({
    where: {
      userId: session.user.id,
      ...(parsed.vehicleId ? { id: parsed.vehicleId } : {}),
      year,
      make: { equals: make, mode: 'insensitive' },
      model: { equals: model, mode: 'insensitive' },
      trim: trim ? { equals: trim, mode: 'insensitive' } : null,
    },
    select: { id: true, currentMileage: true, trim: true },
  });
  if (matches.length !== 1) return NextResponse.json({ error: 'exact_vehicle_required', message: 'Select the exact vehicle in your garage first.' }, { status: 409 });
  const existing = matches[0];
  if (!(await canUsePersonalVehicle(session.user.id, existing.id))) return NextResponse.json({ error: 'hub_required' }, { status: 403 });

  let id: string;
  if (existing) {
    await prisma.vehicle.update({
      where: { id: existing.id },
      data: {
        currentMileage: mileage,
        lastMileageUpdate: new Date(),
        // Only overwrite trim if it changed (and caller supplied one).
        ...(trim && trim !== existing.trim ? { trim } : {}),
      },
    });
    id = existing.id;
  } else {
    const created = await prisma.vehicle.create({
      data: {
        userId: session.user.id,
        year,
        make,
        model,
        trim: trim ?? null,
        currentMileage: mileage,
        lastMileageUpdate: new Date(),
      },
      select: { id: true },
    });
    id = created.id;
  }

  return NextResponse.json({ id, currentMileage: mileage });
}
