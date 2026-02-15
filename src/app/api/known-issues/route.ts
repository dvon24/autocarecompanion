import { NextRequest, NextResponse } from 'next/server';
import { KnownIssue } from '@/schemas/knownIssue.schema';
import knownIssuesData from '@/data/known-issues.json';

/**
 * Check if a vehicle matches an issue's vehicle criteria
 */
function vehicleMatchesIssue(
  issue: KnownIssue,
  year: number,
  make: string,
  model: string,
  trim?: string
): boolean {
  const match = issue.vehicleMatch;

  // Check year
  if (!match.years.includes(year)) return false;

  // Check make (case-insensitive)
  if (match.make.toLowerCase() !== make.toLowerCase()) return false;

  // Check model (case-insensitive, partial match allowed)
  const modelLower = model.toLowerCase();
  const matchModelLower = match.model.toLowerCase();
  if (!modelLower.includes(matchModelLower) && !matchModelLower.includes(modelLower)) {
    return false;
  }

  // If trim is specified in match criteria, check it
  if (match.trims && match.trims.length > 0 && trim) {
    const trimLower = trim.toLowerCase();
    const hasMatchingTrim = match.trims.some(t =>
      trimLower.includes(t.toLowerCase()) || t.toLowerCase().includes(trimLower)
    );
    if (!hasMatchingTrim) return false;
  }

  return true;
}

/**
 * GET /api/known-issues
 *
 * Query params:
 * - year: Vehicle year
 * - make: Vehicle make
 * - model: Vehicle model
 * - trim: Vehicle trim (optional)
 * - severity: Filter by severity (optional)
 * - status: Filter by status (default: published)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const trim = searchParams.get('trim') || undefined;
    const severity = searchParams.get('severity');
    const status = searchParams.get('status') || 'published';

    // Validate required params
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

    // Filter issues by vehicle match (using statically imported data for Vercel compatibility)
    let matchingIssues = (knownIssuesData.issues as KnownIssue[]).filter(issue =>
      vehicleMatchesIssue(issue, yearNum, make, model, trim)
    );

    // Filter by status
    if (status) {
      matchingIssues = matchingIssues.filter(issue => issue.status === status);
    }

    // Filter by severity if specified
    if (severity) {
      const severities = severity.split(',');
      matchingIssues = matchingIssues.filter(issue =>
        severities.includes(issue.severity)
      );
    }

    // Sort by severity (high first) then by report count
    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    matchingIssues.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.reportCount - a.reportCount;
    });

    return NextResponse.json({
      vehicle: { year: yearNum, make, model, trim },
      issues: matchingIssues,
      total: matchingIssues.length,
    });
  } catch (error) {
    console.error('Error fetching known issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch known issues' },
      { status: 500 }
    );
  }
}
