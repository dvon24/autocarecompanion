import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

/**
 * Issue Report API Route
 *
 * Accepts user reports about vehicle issues.
 * Implements IP-based rate limiting (1 report per 24 hours).
 *
 * Story 4.4: User Issue Reporting
 */

// In-memory rate limit store (resets on cold start, but provides some protection)
const rateLimitStore = new Map<string, number>();
const RATE_LIMIT_MS = 24 * 60 * 60 * 1000; // 24 hours

// Request validation schema
const ReportRequestSchema = z.object({
  vehicle: z.object({
    year: z.number().min(1900).max(2030),
    make: z.string().min(1),
    model: z.string().min(1),
    trim: z.string().optional(),
  }),
  existingIssueId: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  severity: z.enum(['high', 'medium', 'low']),
  mileage: z.number().min(0).max(1000000).optional(),
});

type IssueReport = {
  id: string;
  timestamp: string;
  ipHash: string;
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim?: string;
  };
  existingIssueId?: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  mileage?: number;
  status: 'pending_review';
};

/**
 * Hash IP address for privacy
 */
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'au7o-salt').digest('hex').substring(0, 16);
}

/**
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

/**
 * Check rate limit for IP
 */
function checkRateLimit(ipHash: string): { allowed: boolean; retryAfter?: number } {
  const lastReport = rateLimitStore.get(ipHash);
  const now = Date.now();

  if (lastReport && now - lastReport < RATE_LIMIT_MS) {
    const retryAfter = Math.ceil((RATE_LIMIT_MS - (now - lastReport)) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

/**
 * Generate unique report ID
 */
function generateReportId(): string {
  return `rpt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    // Get and hash client IP
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Check rate limit
    const { allowed, retryAfter } = checkRateLimit(ipHash);
    if (!allowed) {
      const hours = Math.ceil((retryAfter || 0) / 3600);
      return NextResponse.json(
        {
          error: `You can submit one report every 24 hours. Please try again in ${hours} hour${hours !== 1 ? 's' : ''}.`,
          retryAfter
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = ReportRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid report data',
          details: parseResult.error.issues.map(i => i.message)
        },
        { status: 400 }
      );
    }

    const { vehicle, existingIssueId, description, severity, mileage } = parseResult.data;

    // Create report object
    const report: IssueReport = {
      id: generateReportId(),
      timestamp: new Date().toISOString(),
      ipHash,
      vehicle,
      existingIssueId,
      description,
      severity,
      mileage,
      status: 'pending_review',
    };

    // Log the report (in production, this would go to a database)
    console.log('[Issue Report]', JSON.stringify(report));

    // Update rate limit
    rateLimitStore.set(ipHash, Date.now());

    // Clean up old rate limit entries (prevent memory leak)
    const now = Date.now();
    for (const [hash, timestamp] of rateLimitStore.entries()) {
      if (now - timestamp > RATE_LIMIT_MS) {
        rateLimitStore.delete(hash);
      }
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: 'Thank you for your report. It will be reviewed by our team.',
    });
  } catch (error) {
    console.error('Error processing issue report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report. Please try again.' },
      { status: 500 }
    );
  }
}
