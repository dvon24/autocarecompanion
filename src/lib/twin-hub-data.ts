import prisma from '@/lib/db';
import { getVehicleSpecs } from '@/lib/maintenance';
import { getRecentThreads } from '@/lib/hub-data';
import { getTwinDefinition, twinMatchesVehicle } from '@/lib/twin-fulfillment';

/**
 * Server payload for the live twin hub.
 *
 * The twin hub was built as a no-account demo whose every number was invented
 * so the screen would look interesting: a 65,000 mi odometer, a "Front brake
 * pads — 20,000 mi past a typical set" card, three sample chat threads. All of
 * that is fine for a demo and false for an owner.
 *
 * This builds the real version for one garage vehicle. What it deliberately
 * does NOT do is invent anything to fill a gap: no odometer means no live hub
 * (the caller falls back to the demo rather than showing a made-up mileage),
 * and an unmapped service type simply leaves that part unlogged rather than
 * guessing when it was last done.
 *
 * The tree itself is assembled on the client (see twin-trees.js) because the
 * service intervals live alongside the tree they annotate — one source of
 * truth for "what counts as due".
 */
export interface TwinServiceRecord {
  type: string;
  mileage: number;
}

export interface TwinRecentThread {
  t: string;
  w: string;
  i: string;
  href: string;
}

export interface TwinHubData {
  vehicleId: string;
  vehicle: { year: number; make: string; model: string; trim: string; engine: string };
  miles: number;
  /** Raw logged services; the client folds these onto tree nodes. */
  records: TwinServiceRecord[];
  recent: TwinRecentThread[];
  transmission: 'automatic' | 'manual';
}

/**
 * Vehicles the twin can honestly depict.
 *
 * The stage is not a generic car: `car-base.webp`, the five hotspot glow
 * layers, the x-ray layer and every hotspot coordinate are photographs of a
 * 2015 Challenger. Show them to a Camaro owner and the hub states, in the most
 * literal way available, that their car is something it is not - while the
 * tree underneath quotes Mopar part numbers as a "verified fit".
 *
 * So the twin is gated on having art for the vehicle, not merely on the owner
 * being allowed to see it. Widening this list means producing the layer set
 * and re-mapping TH_HOTSPOTS for that body first.
 */
/** "2d ago" / "3w ago" — the sidebar's existing format. */
function agoLabel(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/**
 * Build the live payload for a vehicle the signed-in user owns.
 *
 * Returns null when the twin cannot honestly be shown — no such vehicle, not
 * this user's, or no odometer reading. The whole screen is a statement about
 * mileage ("this part is past its life at X miles"), so without a real X there
 * is nothing truthful to render and the caller keeps the ordinary hub.
 */
export async function getTwinHubData(
  userId: string,
  userEmail: string,
  vehicleId: string,
): Promise<TwinHubData | null> {
  const [vehicle, reservation] = await Promise.all([
    prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
      select: {
        id: true, year: true, make: true, model: true, trim: true, currentMileage: true,
      },
    }),
    prisma.reservation.findUnique({
      where: { email: userEmail.trim().toLowerCase() },
      select: { twinStatus: true, assignedTwin: true, transmission: true, trialDays: true, claimedAt: true },
    }),
  ]);
  if (!vehicle) return null;
  // An account alone does not activate a twin. The founder must first mark
  // this exact reservation ready (or the future claim flow must mark it
  // claimed), and the assigned definition must match the garage vehicle.
  if (!reservation || reservation.twinStatus !== 'claimed') return null;
  if (!reservation.claimedAt || !reservation.trialDays) return null;
  const expiresAt = new Date(reservation.claimedAt);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + reservation.trialDays);
  if (expiresAt.getTime() <= Date.now()) return null;
  if (reservation.transmission !== 'automatic' && reservation.transmission !== 'manual') return null;
  const twin = getTwinDefinition(reservation.assignedTwin);
  if (!twin || !twinMatchesVehicle(twin, vehicle)) return null;
  if (typeof vehicle.currentMileage !== 'number' || vehicle.currentMileage <= 0) return null;

  const [records, threads] = await Promise.all([
    prisma.maintenanceRecord.findMany({
      where: { vehicleId: vehicle.id },
      orderBy: { mileage: 'desc' },
      select: { type: true, mileage: true },
      take: 200,
    }),
    getRecentThreads(userId, vehicle.id, 3).catch(() => []),
  ]);

  const specs = getVehicleSpecs({
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim ?? undefined,
  });

  return {
    vehicleId: vehicle.id,
    vehicle: {
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim ?? '',
      // Falls back to the trim rather than a guessed displacement — naming the
      // wrong engine on a hub that sells fitment accuracy is worse than saying
      // less.
      engine: specs?.engine || vehicle.trim || '',
    },
    miles: vehicle.currentMileage,
    records: records.map((r) => ({ type: r.type, mileage: r.mileage })),
    recent: threads.map((t) => ({
      t: t.preview || 'Untitled thread',
      w: agoLabel(t.updatedAt),
      i: 'chat',
      href: `/vehicle/${encodeURIComponent(
        `${vehicle.year}-${vehicle.make}-${vehicle.model}${vehicle.trim ? '-' + vehicle.trim : ''}`
          .toLowerCase()
          .replace(/\s+/g, '-'),
      )}?session=${t.id}`,
    })),
    transmission: reservation.transmission,
  };
}
