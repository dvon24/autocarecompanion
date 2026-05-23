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
import { prisma } from '@/lib/db';
import { z } from 'zod';

const Body = z.object({
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
  const existing = await prisma.vehicle.findFirst({
    where: {
      userId: session.user.id,
      year,
      make: { equals: make, mode: 'insensitive' },
      model: { equals: model, mode: 'insensitive' },
    },
    select: { id: true, currentMileage: true, trim: true },
  });

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
