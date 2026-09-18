import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { runReceiptCleanup } from '@/lib/maintenance-receipt-cleanup';
import { receiptCleanupAuthorized, receiptCleanupEnvironmentReady } from '@/lib/maintenance-receipt-cleanup-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

/** Explicit POST from an authenticated internal scheduler; no public GET worker. */
export async function POST(request: Request) {
  if (!receiptCleanupAuthorized(request.headers.get('authorization'), process.env.MAINTENANCE_RECEIPT_CLEANUP_SECRET)) return json({ error: 'Unauthorized' }, 401);
  if (!receiptCleanupEnvironmentReady()) return json({ error: 'Private document cleanup is not configured for this environment.' }, 503);
  try { return json(await runReceiptCleanup(prisma, 1)); }
  catch { return json({ error: 'Private document cleanup remains pending.' }, 503); }
}
