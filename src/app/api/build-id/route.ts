import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/build-id — returns the currently-deployed git SHA + timestamp.
 *
 * Client compares this against the build hash bundled into the JS via
 * NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA. A mismatch means the PWA is
 * running stale precached assets — the most likely cause of the
 * "spinner sits forever" symptom after multiple rapid deploys.
 */
export async function GET() {
  const buildId =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
    'dev';
  const branch = process.env.VERCEL_GIT_COMMIT_REF || null;
  const deployedAt = process.env.VERCEL_DEPLOYMENT_ID || null;
  return NextResponse.json(
    { buildId, branch, deployedAt, now: Date.now() },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
  );
}
