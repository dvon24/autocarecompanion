import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/builds - Get public builds
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sort = searchParams.get('sort') || 'recent'; // recent, mods, invested
    const make = searchParams.get('make');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      isPublic: true,
    };

    if (make) {
      where.make = { equals: make, mode: 'insensitive' };
    }

    // Build order by clause
    let orderBy: Record<string, unknown> = { updatedAt: 'desc' };
    if (sort === 'mods') {
      orderBy = { modifications: { _count: 'desc' } };
    }
    // Note: 'invested' sorting would require aggregation, handled in memory for now

    const [builds, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          modifications: {
            select: {
              cost: true,
            },
          },
          _count: {
            select: {
              modifications: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.vehicle.count({ where }),
    ]);

    // Sort by invested if requested
    let sortedBuilds = builds;
    if (sort === 'invested') {
      sortedBuilds = [...builds].sort((a, b) => {
        const aTotal = a.modifications.reduce((sum: number, m: any) => sum + (m.cost || 0), 0);
        const bTotal = b.modifications.reduce((sum: number, m: any) => sum + (m.cost || 0), 0);
        return bTotal - aTotal;
      });
    }

    return NextResponse.json({
      builds: sortedBuilds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching builds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch builds' },
      { status: 500 }
    );
  }
}
