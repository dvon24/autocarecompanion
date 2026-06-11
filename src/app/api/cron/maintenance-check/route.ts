import { NextResponse } from 'next/server';
import { processMaintenanceNotifications } from '@/lib/notifications';
import { requireFounder } from '@/lib/admin-guard';

/**
 * Cron Job: Maintenance Check
 *
 * Epic 5, Story 5.4b: Maintenance Notifications
 *
 * Called by Vercel Cron daily at 9am to check for due/overdue
 * maintenance and send notifications.
 *
 * Auth FAILS CLOSED: if CRON_SECRET is not configured, the route refuses
 * to run rather than becoming public (2026-06-11 review finding — an
 * unauthenticated hit re-sends the full reminder batch to every active
 * subscriber, and processMaintenanceNotifications has no idempotency).
 * Set CRON_SECRET in Vercel env; Vercel Cron sends it automatically as
 * `Authorization: Bearer <CRON_SECRET>`.
 */

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Cron] CRON_SECRET is not set — refusing to run (fail closed).');
      return NextResponse.json({ error: 'Cron not configured' }, { status: 503 });
    }
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting maintenance check...');

    const result = await processMaintenanceNotifications();

    console.log('[Cron] Maintenance check complete:', result);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Maintenance check failed:', error);
    return NextResponse.json(
      { error: 'Maintenance check failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Manual trigger — founder-only (was public "for manual triggers").
export async function POST(request: Request) {
  const denied = await requireFounder();
  if (denied) return denied;
  try {
    const result = await processMaintenanceNotifications();
    return NextResponse.json({ success: true, ...result, manual: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Maintenance check failed', details: String(error) },
      { status: 500 }
    );
  }
}
