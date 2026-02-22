import { NextResponse } from 'next/server';
import { processMaintenanceNotifications } from '@/lib/notifications';

/**
 * Cron Job: Maintenance Check
 *
 * Epic 5, Story 5.4b: Maintenance Notifications
 *
 * This endpoint is called by Vercel Cron daily at 9am to check
 * for due/overdue maintenance and send notifications.
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/maintenance-check",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */

export async function GET(request: Request) {
  try {
    // Verify cron secret (Vercel adds this header for cron jobs)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, verify the request is from Vercel Cron
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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

// Also support POST for manual triggers
export async function POST(request: Request) {
  return GET(request);
}
