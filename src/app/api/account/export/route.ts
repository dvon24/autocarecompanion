/**
 * GET /api/account/export
 *
 * GDPR Article 20 (right to data portability). Returns every piece of
 * personal data we hold for the signed-in user as a structured JSON
 * download. Includes:
 *
 *   - User profile (minus passwordHash)
 *   - Garage (vehicles + maintenance records + mileage history + mods)
 *   - Chat sessions (full message arrays)
 *   - Vehicle insights (diagnoses, parts searches)
 *   - Notification log
 *   - User-issue fix reports (community contributions)
 *
 * Deliberately excludes:
 *   - passwordHash (never leaves the DB)
 *   - OAuth tokens (access_token / refresh_token on Account) — they
 *     authenticate to the third party, not to the user, and surfacing
 *     them would let anyone with the export file impersonate the user
 *     on Google
 *   - Anonymous-aggregate rows (ChatPromptInsight rows with no userId)
 *
 * Auth: requires a session. Returns 401 otherwise.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const userId = session.user.id;

  const [
    user,
    vehicles,
    chatSessions,
    insights,
    notifications,
    issueFixes,
    promptInsights,
    diagnosisSamples,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        image: true,
        emailNotifications: true,
        pushNotifications: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.vehicle.findMany({
      where: { userId },
      include: {
        maintenanceRecords: true,
        modifications: true,
        mileageHistory: true,
      },
    }),
    prisma.chatSession.findMany({ where: { userId } }),
    prisma.vehicleInsight.findMany({ where: { userId } }),
    prisma.notificationLog.findMany({ where: { userId } }),
    prisma.userIssueFix.findMany({ where: { userId } }),
    // ChatPromptInsight has no FK to User — match by userId column.
    prisma.chatPromptInsight.findMany({ where: { userId } }),
    // Visual data flywheel (Phase 0) consented diagnosis samples. Phase
    // 0.0 rows are metadata-only (no image bytes); when Phase 0.1 adds
    // stored crops, attach a signed download URL per row here.
    prisma.diagnosisSample.findMany({ where: { userId } }),
  ]);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    exportSchemaVersion: 2,
    legalNotice:
      'This file contains all personal data Au7o has stored for your account, ' +
      'exported under GDPR Article 20 (data portability). Keep it private — ' +
      'it includes your chat content and vehicle history.',
    user,
    garage: vehicles,
    chatSessions,
    insights,
    notifications,
    issueFixes,
    promptInsights,
    diagnosisSamples,
  };

  const filename = `au7o-account-export-${user.email.replace(/[^a-z0-9]+/gi, '-')}-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
