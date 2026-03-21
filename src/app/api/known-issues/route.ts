import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { KnownIssue } from '@/schemas/knownIssue.schema';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

function dbRowToKnownIssue(row: any): KnownIssue {
  return {
    id: row.id,
    vehicleMatch: {
      years: row.years,
      make: row.make,
      model: row.model,
      ...(row.trims.length > 0 ? { trims: row.trims } : {}),
      ...(row.engines.length > 0 ? { engines: row.engines } : {}),
    },
    category: row.category,
    title: row.title,
    description: row.description,
    solution: row.solution,
    severity: row.severity,
    confidence: row.confidence,
    symptoms: row.symptoms,
    affectedSystems: row.affectedSystems,
    estimatedCost: row.estimatedCostLow != null
      ? { low: row.estimatedCostLow, high: row.estimatedCostHigh }
      : undefined,
    typicalMileage: row.typicalMileageLow != null
      ? { low: row.typicalMileageLow, high: row.typicalMileageHigh }
      : undefined,
    citations: row.citations as any[],
    communityRecommendations: row.communityRecommendations as any[],
    humanApproved: row.humanApproved,
    lastReportedByOwners: row.lastReportedByOwners,
    reviewedOn: row.reviewedOn,
    reportCount: row.reportCount,
    status: row.status,
    dtcCodes: row.dtcCodes,
  } as KnownIssue;
}

/**
 * GET /api/known-issues
 *
 * Query params:
 * - year: Vehicle year (required)
 * - make: Vehicle make (required)
 * - model: Vehicle model (required)
 * - trim: Vehicle trim (optional)
 * - severity: Filter by severity (optional, comma-separated)
 * - status: Filter by status (default: published)
 */
export async function GET(request: NextRequest) {
  // Rate limit: 60 requests per minute per IP
  const ip = getClientIp(request);
  const rateCheck = knownIssuesLimiter.check(ip);
  if (!rateCheck.success) {
    return rateLimitResponse(rateCheck.reset);
  }

  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const trim = searchParams.get('trim') || undefined;
    const severity = searchParams.get('severity');
    const status = searchParams.get('status') || 'published';

    if (!year || !make || !model) {
      return NextResponse.json(
        { error: 'Missing required parameters: year, make, model' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum)) {
      return NextResponse.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      );
    }

    // Query database — data is pre-normalized
    const rows = await prisma.knownIssue.findMany({
      where: {
        make: { equals: make, mode: 'insensitive' },
        model: { contains: model, mode: 'insensitive' },
        years: { has: yearNum },
        status,
        ...(severity ? { severity: { in: severity.split(',') } } : {}),
      },
    });

    // Post-filter for trim matching (same logic as before)
    let filtered = rows;
    if (trim) {
      filtered = rows.filter(row => {
        if (row.trims.length === 0) return true; // no trim restriction
        const trimLower = trim.toLowerCase();
        return row.trims.some(t =>
          trimLower.includes(t.toLowerCase()) || t.toLowerCase().includes(trimLower)
        );
      });
    }

    // Sort by severity then report count
    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    filtered.sort((a, b) => {
      const sevDiff = (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
      if (sevDiff !== 0) return sevDiff;
      return b.reportCount - a.reportCount;
    });

    const issues = filtered.map(dbRowToKnownIssue);

    return NextResponse.json(
      { vehicle: { year: yearNum, make, model, trim }, issues, total: issues.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching known issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch known issues' },
      { status: 500 }
    );
  }
}
