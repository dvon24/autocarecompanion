import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { GuideSchema } from '@/schemas/guide.schema';
import { getCacheStats } from '@/lib/guide-cache';

/**
 * Admin Guide Cache API
 *
 * GET  - List cached guides with filtering + stats
 * PUT  - Update a cached guide (JSON, status, notes)
 * DELETE - Remove cached guide(s)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const make = searchParams.get('make');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 20;

    // Build filter
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (make) where.make = make;
    if (type) where.maintenanceType = type;

    const [guides, total, stats] = await Promise.all([
      prisma.cachedGuide.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          cacheKey: true,
          year: true,
          make: true,
          model: true,
          trim: true,
          maintenanceType: true,
          title: true,
          status: true,
          version: true,
          hitCount: true,
          lastHitAt: true,
          generationCostUsd: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.cachedGuide.count({ where }),
      getCacheStats(),
    ]);

    return NextResponse.json({
      guides,
      total,
      page,
      pageSize,
      stats,
    });
  } catch (error) {
    console.error('[admin/guides] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cached guides' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, guideJson, status, reviewNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing guide id' }, { status: 400 });
    }

    const existing = await prisma.cachedGuide.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (guideJson !== undefined) {
      // Validate against GuideSchema before saving
      const parseResult = GuideSchema.safeParse(guideJson);
      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: 'Invalid guide JSON',
            details: parseResult.error.issues.map((i) => i.message),
          },
          { status: 400 }
        );
      }
      updateData.guideJson = guideJson;
      updateData.title = guideJson.title || existing.title;
      updateData.version = existing.version + 1;
    }

    if (status !== undefined) {
      if (!['auto-generated', 'reviewed', 'verified'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be auto-generated, reviewed, or verified.' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (reviewNotes !== undefined) {
      updateData.reviewNotes = reviewNotes;
    }

    const updated = await prisma.cachedGuide.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ guide: updated });
  } catch (error) {
    console.error('[admin/guides] PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update guide' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty ids array' },
        { status: 400 }
      );
    }

    const result = await prisma.cachedGuide.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error('[admin/guides] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete guides' },
      { status: 500 }
    );
  }
}
