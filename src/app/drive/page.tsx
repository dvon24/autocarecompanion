import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { DriveClient } from '@/components/drive/DriveClient';
import type { DriveVehicle } from '@/components/drive/VehiclePicker';

export const metadata = {
  title: 'Drive',
  description: 'Voice-driven route planning from Au7o.',
};

// Auth-aware but NOT gated. Anonymous users get the current /drive flow with
// localStorage vehicle. Signed-in users with a primary Vehicle in their
// garage see it pre-loaded — no re-typing year/make/model every session.
// This is Day 1 of the freemium funnel work: foundation only, no paywall yet.
export const dynamic = 'force-dynamic';

export default async function DrivePage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  // ?to=<destination> handoff from the hub. When the chat says "I'll plot
  // this in Drive" and the user clicks through, /drive auto-routes to that
  // destination instead of waiting for the user to type it again.
  const { to: prefillDestination } = await searchParams;

  if (!mapboxToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md rounded-2xl bg-white border border-gray-200 p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Drive is offline</h1>
          <p className="text-sm text-gray-600">
            The Mapbox token isn&apos;t configured. Set <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> in your environment and redeploy.
          </p>
        </div>
      </div>
    );
  }

  // Optional vehicle pre-load for signed-in users with a primary vehicle.
  // Failure is silent — we never block /drive on auth/db hiccups.
  let initialVehicle: DriveVehicle | null = null;
  let isAuthed = false;
  try {
    const session = await auth();
    if (session?.user?.id) {
      isAuthed = true;
      const primary = await prisma.vehicle.findFirst({
        where: { userId: session.user.id, isPrimary: true },
        select: { year: true, make: true, model: true, trim: true },
      });
      if (primary) {
        initialVehicle = {
          year: primary.year,
          make: primary.make,
          model: primary.model,
          trim: primary.trim ?? '',
        };
      }
    }
  } catch {
    // Silent — anonymous flow continues to work even if auth/db is down.
  }

  return (
    <DriveClient
      mapboxToken={mapboxToken}
      initialVehicle={initialVehicle}
      isAuthed={isAuthed}
      prefillDestination={prefillDestination || null}
    />
  );
}
