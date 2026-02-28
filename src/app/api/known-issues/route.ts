import { NextRequest, NextResponse } from 'next/server';
import { KnownIssue } from '@/schemas/knownIssue.schema';
import knownIssuesData from '@/data/known-issues.json';

/**
 * Check if a vehicle matches an issue's vehicle criteria.
 * Handles both legacy format (vehicleMatch.years array) and
 * new format (top-level make/model with years.start/end range).
 */
function vehicleMatchesIssue(
  issue: any,
  year: number,
  make: string,
  model: string,
  trim?: string
): boolean {
  // New format: make/model/years at top level with years as {start, end}
  if (!issue.vehicleMatch && issue.make && issue.model && issue.years) {
    const issueMake = issue.make as string;
    const issueModel = issue.model as string;
    const years = issue.years as { start: number; end: number };

    // Check year range
    if (year < years.start || year > years.end) return false;

    // Check make (case-insensitive)
    if (issueMake.toLowerCase() !== make.toLowerCase()) return false;

    // Check model (case-insensitive, partial match)
    const modelLower = model.toLowerCase();
    const issueModelLower = issueModel.toLowerCase();
    if (!modelLower.includes(issueModelLower) && !issueModelLower.includes(modelLower)) {
      return false;
    }

    // Check trims for new-format issues
    if (issue.trims && issue.trims.length > 0 && trim) {
      const trimLower = trim.toLowerCase();
      const hasMatchingTrim = issue.trims.some((t: string) =>
        trimLower.includes(t.toLowerCase()) || t.toLowerCase().includes(trimLower)
      );
      if (!hasMatchingTrim) return false;
    }

    return true;
  }

  // Legacy format: vehicleMatch with years array
  const match = issue.vehicleMatch;
  if (!match) return false;

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
    const hasMatchingTrim = match.trims.some((t: string) =>
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

    // Valid categories for the frontend
    const validCategories = ['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','other'];
    const categoryMap: Record<string, string> = {
      'steering': 'suspension', 'Steering': 'suspension',
      'hvac': 'cooling', 'Climate Control': 'cooling',
      'fuel_system': 'fuel', 'Fuel System': 'fuel',
      'exhaust': 'engine', 'emissions': 'engine',
    };

    function normalizeCategory(cat: string | undefined): string {
      if (!cat) return 'other';
      // Handle case-insensitive match
      const lower = cat.toLowerCase();
      if (validCategories.includes(lower)) return lower;
      // Try mapped categories
      if (categoryMap[cat]) return categoryMap[cat];
      return 'other';
    }

    // Normalize severity to match frontend expectations (high/medium/low)
    function normalizeSeverity(sev: string | undefined): 'high' | 'medium' | 'low' {
      if (!sev) return 'medium';
      const lower = sev.toLowerCase();
      if (lower === 'critical' || lower === 'high') return 'high';
      if (lower === 'moderate' || lower === 'medium') return 'medium';
      if (lower === 'low') return 'low';
      return 'medium';
    }

    // Normalize all issues to match the KnownIssue shape expected by frontend
    function normalizeIssue(issue: any): KnownIssue {
      // Normalize estimatedCost for ALL issues (min/max -> low/high)
      const ec = issue.estimatedCost;
      const normalizedCost = ec
        ? { low: ec.low ?? ec.min ?? 0, high: ec.high ?? ec.max ?? 0 }
        : undefined;

      // Already in legacy format
      if (issue.vehicleMatch) {
        return {
          ...issue,
          category: normalizeCategory(issue.category),
          severity: normalizeSeverity(issue.severity),
          estimatedCost: normalizedCost,
          symptoms: issue.symptoms || [],
          citations: issue.citations || [],
          solution: issue.solution || '',
          confidence: issue.confidence || 'medium',
          reportCount: issue.reportCount || 0,
          status: issue.status || 'published',
        } as KnownIssue;
      }

      // Convert new format to legacy format
      const years = issue.years as { start: number; end: number };
      const yearArray: number[] = [];
      for (let y = years.start; y <= years.end; y++) {
        yearArray.push(y);
      }

      return {
        id: issue.id,
        vehicleMatch: {
          years: yearArray,
          make: issue.make,
          model: issue.model,
          ...(issue.trims ? { trims: issue.trims } : {}),
        },
        category: normalizeCategory(issue.category),
        title: issue.title,
        description: issue.description,
        solution: issue.solution || '',
        severity: normalizeSeverity(issue.severity),
        confidence: issue.confidence || 'medium',
        symptoms: issue.symptoms || [],
        affectedSystems: issue.affectedSystems,
        estimatedCost: normalizedCost,
        citations: issue.citations || [],
        communityRecommendations: issue.communityRecommendations,
        humanApproved: issue.humanApproved ?? false,
        lastReportedByOwners: issue.lastReportedByOwners || issue.reviewedOn || '',
        reviewedOn: issue.reviewedOn || '',
        reportCount: issue.reportCount || 0,
        status: issue.status || 'published',
      } as KnownIssue;
    }

    // Normalize status values (treat 'active' as 'published')
    function normalizeStatus(s: string | undefined): string {
      if (!s || s === 'active') return 'published';
      return s;
    }

    // Filter issues by vehicle match (using statically imported data for Vercel compatibility)
    let matchingIssues = (knownIssuesData.issues as any[])
      .filter(issue => vehicleMatchesIssue(issue, yearNum, make, model, trim))
      .map(normalizeIssue)
      .map(issue => ({ ...issue, status: normalizeStatus(issue.status) }));

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

    // Sort by severity (critical/high first) then by report count
    const severityOrder: Record<string, number> = { critical: 0, high: 1, moderate: 2, medium: 3, low: 4 };
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
