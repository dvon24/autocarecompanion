import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/builds/[slug] - Get a single public build
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try to find by showcase slug first, then by ID.
    // Explicit select — `include` leaked vin + userId on this
    // unauthenticated endpoint (2026-06-11 review finding). Mileage stays:
    // the build page displays it as a stat. user.id dropped: display only
    // needs name + avatar.
    let build = await prisma.vehicle.findFirst({
      where: {
        OR: [
          { showcaseSlug: slug },
          { id: slug },
        ],
        isPublic: true,
      },
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        trim: true,
        color: true,
        nickname: true,
        imageUrl: true,
        showcaseSlug: true,
        currentMileage: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        modifications: {
          orderBy: [
            { category: 'asc' },
            { sortOrder: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!build) {
      return NextResponse.json(
        { error: 'Build not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ build });
  } catch (error) {
    console.error('Error fetching build:', error);
    return NextResponse.json(
      { error: 'Failed to fetch build' },
      { status: 500 }
    );
  }
}
