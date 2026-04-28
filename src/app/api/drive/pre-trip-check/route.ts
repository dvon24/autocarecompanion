import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { runPreTripSafetyCheck } from '@/lib/pre-trip-safety';

export const maxDuration = 10;

/**
 * Pre-trip safety check — the killer demo of Au7o's vehicle-aware AI.
 *
 * POST { vehicleId?: string, tripMiles?: number, fuelMilesRemaining?: number }
 *  → SafetyResult
 *
 * The actual logic lives in `@/lib/pre-trip-safety` so the voice copilot
 * (plan-route) can call the same function and surface the SAME items in
 * spoken form, naturally, instead of duplicating the analysis.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = knownIssuesLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  let body: { vehicleId?: unknown; tripMiles?: unknown; fuelMilesRemaining?: unknown };
  try { body = await request.json(); }
  catch { body = {}; }

  let session;
  try { session = await auth(); }
  catch { session = null; }

  const result = await runPreTripSafetyCheck({
    userId: session?.user?.id ?? null,
    vehicleId: typeof body.vehicleId === 'string' ? body.vehicleId : null,
    tripMiles: typeof body.tripMiles === 'number' ? body.tripMiles : null,
    fuelMilesRemaining: typeof body.fuelMilesRemaining === 'number' ? body.fuelMilesRemaining : null,
  });

  return NextResponse.json(result);
}
