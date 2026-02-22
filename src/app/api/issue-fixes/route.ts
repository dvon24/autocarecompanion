import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * Schema for creating/updating an issue fix
 */
const IssueFixSchema = z.object({
  vehicleId: z.string(),
  knownIssueId: z.string(),
  status: z.enum(['fixed', 'in_progress', 'wont_fix']),
  solution: z.string().optional(),
  cost: z.number().optional(),
  difficultyRating: z.number().min(1).max(5).optional(),
  partsUsed: z.string().optional(),
  shopUsed: z.string().optional(),
  tips: z.string().optional(),
  wouldRecommend: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

/**
 * GET /api/issue-fixes
 *
 * Query params:
 * - vehicleId: Get fixes for a specific vehicle
 * - knownIssueId: Get fixes for a specific issue
 * - includePublic: Include public fixes from other users (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const vehicleId = searchParams.get('vehicleId');
    const knownIssueId = searchParams.get('knownIssueId');
    const includePublic = searchParams.get('includePublic') === 'true';

    // Build query
    const where: {
      vehicleId?: string;
      knownIssueId?: string;
      OR?: Array<{ userId: string } | { isPublic: boolean }>;
      userId?: string;
      isPublic?: boolean;
    } = {};

    if (vehicleId) where.vehicleId = vehicleId;
    if (knownIssueId) where.knownIssueId = knownIssueId;

    // If user is logged in, show their fixes + public fixes
    if (session?.user?.id) {
      if (includePublic) {
        where.OR = [
          { userId: session.user.id },
          { isPublic: true },
        ];
      } else {
        where.userId = session.user.id;
      }
    } else if (includePublic) {
      // Anonymous users can only see public fixes
      where.isPublic = true;
    } else {
      return NextResponse.json({ fixes: [] });
    }

    const fixes = await prisma.userIssueFix.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ fixes });
  } catch (error) {
    console.error('Error fetching issue fixes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issue fixes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/issue-fixes
 *
 * Create or update an issue fix for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = IssueFixSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Verify the vehicle belongs to the user
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: data.vehicleId,
        userId: session.user.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Upsert the fix (create or update)
    const fix = await prisma.userIssueFix.upsert({
      where: {
        userId_vehicleId_knownIssueId: {
          userId: session.user.id,
          vehicleId: data.vehicleId,
          knownIssueId: data.knownIssueId,
        },
      },
      update: {
        status: data.status,
        solution: data.solution,
        cost: data.cost,
        difficultyRating: data.difficultyRating,
        partsUsed: data.partsUsed,
        shopUsed: data.shopUsed,
        tips: data.tips,
        wouldRecommend: data.wouldRecommend ?? true,
        isPublic: data.isPublic ?? true,
      },
      create: {
        userId: session.user.id,
        vehicleId: data.vehicleId,
        knownIssueId: data.knownIssueId,
        status: data.status,
        solution: data.solution,
        cost: data.cost,
        difficultyRating: data.difficultyRating,
        partsUsed: data.partsUsed,
        shopUsed: data.shopUsed,
        tips: data.tips,
        wouldRecommend: data.wouldRecommend ?? true,
        isPublic: data.isPublic ?? true,
      },
    });

    return NextResponse.json({ fix });
  } catch (error) {
    console.error('Error saving issue fix:', error);
    return NextResponse.json(
      { error: 'Failed to save issue fix' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/issue-fixes
 *
 * Delete an issue fix
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fixId = searchParams.get('id');

    if (!fixId) {
      return NextResponse.json(
        { error: 'Fix ID required' },
        { status: 400 }
      );
    }

    // Delete only if it belongs to the user
    const deleted = await prisma.userIssueFix.deleteMany({
      where: {
        id: fixId,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Fix not found or does not belong to you' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting issue fix:', error);
    return NextResponse.json(
      { error: 'Failed to delete issue fix' },
      { status: 500 }
    );
  }
}
