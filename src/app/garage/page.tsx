/**
 * /garage — server-side gate.
 *
 * Routing model per user direction (2026-05-24):
 *   - Signed-in user WITH at least one saved vehicle → 302 to
 *     /vehicle/{slug} for their primary (or first) Vehicle row.
 *     The hub IS the garage when you have a car saved.
 *   - Signed-in user with NO vehicles → render the client garage
 *     page so they can add their first vehicle.
 *   - Anonymous user → render the client garage page (demo mode,
 *     localStorage-backed) so they can experiment without an account.
 *
 * Uses the existing GarageClient component for the latter two cases
 * — no UI duplication, just a routing decision at the top.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { vehicleSlug } from '@/lib/vehicle-slug';
import GarageClient from './GarageClient';

export const dynamic = 'force-dynamic';

export default async function GaragePage() {
  const session = await auth();

  // Signed-in branch: look up the user's vehicles and redirect to the
  // hub for their primary (or first) one. We do this server-side so
  // the user never sees the empty garage-page shell flash before the
  // redirect fires.
  if (session?.user?.id) {
    const primary = await prisma.vehicle.findFirst({
      where: { userId: session.user.id },
      orderBy: [
        // Prefer the one explicitly marked primary
        { isPrimary: 'desc' },
        // Then most recently created
        { createdAt: 'desc' },
      ],
      select: { year: true, make: true, model: true, trim: true },
    });

    if (primary) {
      const slug = vehicleSlug(primary.year, primary.make, primary.model, primary.trim ?? null);
      redirect(`/vehicle/${slug}`);
    }
    // Fall through: signed in but no saved vehicles — show GarageClient
    // so the user can add their first one. The GarageContext detects
    // the authed-empty case and renders the add-vehicle flow correctly.
  }

  // Anonymous OR signed-in-with-no-vehicles → demo/onboarding UI.
  return <GarageClient />;
}
