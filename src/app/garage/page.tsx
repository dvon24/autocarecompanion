/**
 * /garage — server-side gate.
 *
 * Routing model per user direction (2026-05-24):
 *   - Signed-in user WITH at least one saved vehicle → 302 to
 *     /vehicle/{slug} for their primary (or first) Vehicle row.
 *     The hub IS the garage when you have a car saved.
 *   - Signed-in add intents or NO vehicles → Account's shared Twin picker.
 *   - Explicit manage intent → focused owner settings, never the legacy add editor.
 *   - Anonymous user → render the client garage page (demo mode,
 *     localStorage-backed) so they can experiment without an account.
 *
 * Uses the existing GarageClient component for anonymous visitors
 * — no UI duplication, just a routing decision at the top.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { vehicleSlug } from '@/lib/vehicle-slug';
import GarageClient from './GarageClient';

export const dynamic = 'force-dynamic';

export default async function GaragePage({ searchParams }: { searchParams: Promise<{ add?: string; manage?: string }> }) {
  const sp = await searchParams;
  // Add goes to the shared picker; explicit management retains existing settings.
  const wantsGarageUI = sp.add === '1' || sp.manage === '1';

  const session = await auth();
  // Pages and layouts can render concurrently. Apply the same boundary here
  // before reading vehicles or redirecting to an owner Hub.
  if (session?.user && !session.user.capabilities?.garage) redirect('/account');
  if (session?.user?.id && sp.add === '1') redirect('/account');
  if (session?.user?.id && sp.manage === '1') return <GarageClient ownerSettings />;

  // Signed-in branch: look up the user's vehicles and redirect to the
  // hub for their primary (or first) one. We do this server-side so
  // the user never sees the empty garage-page shell flash before the
  // redirect fires.
  if (session?.user?.id && !wantsGarageUI) {
    const primary = await prisma.vehicle.findFirst({
      where: { userId: session.user.id },
      orderBy: [
        // Prefer the one explicitly marked primary
        { isPrimary: 'desc' },
        // Then most recently created
        { createdAt: 'desc' },
      ],
      select: { id: true, year: true, make: true, model: true, trim: true },
    });

    if (primary) {
      const slug = vehicleSlug(primary.year, primary.make, primary.model, primary.trim ?? null);
      redirect(`/vehicle/${slug}?vehicleId=${encodeURIComponent(primary.id)}`);
    }
    redirect('/account');
  }

  // Anonymous visitors retain the existing local-only demo.
  return <GarageClient />;
}
