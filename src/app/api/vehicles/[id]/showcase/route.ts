import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const ShowcaseSettingsSchema = z.object({
  isPublic: z.boolean().optional(),
  showcaseSlug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
    .nullable(),
});

// GET /api/vehicles/[id]/showcase - Get showcase settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        isPublic: true,
        showcaseSlug: true,
        nickname: true,
        year: true,
        make: true,
        model: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({ settings: vehicle });
  } catch (error) {
    console.error('Error fetching showcase settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/vehicles/[id]/showcase - Update showcase settings
export async function PATCH(
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
    const existing = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = ShowcaseSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { isPublic, showcaseSlug } = parsed.data;

    // Check if slug is already taken (if provided)
    if (showcaseSlug) {
      const slugTaken = await prisma.vehicle.findFirst({
        where: {
          showcaseSlug,
          id: { not: id },
        },
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: 'This URL is already taken' },
          { status: 400 }
        );
      }
    }

    // Update settings
    const updateData: Record<string, unknown> = {};
    if (typeof isPublic === 'boolean') updateData.isPublic = isPublic;
    if (showcaseSlug !== undefined) updateData.showcaseSlug = showcaseSlug;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        isPublic: true,
        showcaseSlug: true,
      },
    });

    return NextResponse.json({ settings: vehicle });
  } catch (error) {
    console.error('Error updating showcase settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
