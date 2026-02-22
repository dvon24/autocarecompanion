import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/builds/[slug] - Get a single public build
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try to find by showcase slug first, then by ID
    let build = await prisma.vehicle.findFirst({
      where: {
        OR: [
          { showcaseSlug: slug },
          { id: slug },
        ],
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
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
