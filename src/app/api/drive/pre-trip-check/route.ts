import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { MAINTENANCE_SCHEDULES } from '@/lib/maintenance';

export const maxDuration = 10;

/**
 * Pre-trip safety check — the killer demo of Au7o's vehicle-aware AI.
 *
 * POST { vehicleId?: string, tripMiles?: number, fuelMilesRemaining?: number }
 *  → SafetyResult
 *
 * Cross-references the user's MaintenanceRecord history + KnownIssue DB +
 * fuel range against the planned trip to produce a 🟢/🟡/🔴 verdict that
 * Waze and Google Maps literally cannot generate. Anonymous users get a
 * polite "Sign in" prompt instead of a verdict.
 */

type Severity = 'high' | 'medium' | 'low';
type Verdict = 'go' | 'caution' | 'stop';

interface SafetyItem {
  severity: Severity;
  icon: string; // semantic key the client maps to an emoji or SVG
  title: string;
  detail: string;
  action?: { label: string; href: string };
}

interface SafetyResult {
  authed: boolean;
  vehicle: { year: number; make: string; model: string; trim: string | null; mileage: number | null } | null;
  verdict: Verdict;
  items: SafetyItem[];
  summary: string;
}

// Maintenance types we surface in the pre-trip view. Keep this list short —
// the goal is "is this trip safe?", not a full service-due dashboard.
const TRIP_RELEVANT_TYPES = [
  'oil_change',
  'tire_rotation',
  'brake_service',
  'coolant_flush',
  'transmission_fluid',
  'air_filter',
  'cabin_filter',
];

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = knownIssuesLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  let body: { vehicleId?: unknown; tripMiles?: unknown; fuelMilesRemaining?: unknown };
  try { body = await request.json(); }
  catch { body = {}; }

  const tripMiles = typeof body.tripMiles === 'number' ? body.tripMiles : null;
  const fuelMilesRemaining = typeof body.fuelMilesRemaining === 'number' ? body.fuelMilesRemaining : null;
  const vehicleId = typeof body.vehicleId === 'string' ? body.vehicleId : null;

  // Anonymous users get a gentle nudge, not a wall.
  let session;
  try { session = await auth(); }
  catch { session = null; }

  if (!session?.user?.id) {
    return NextResponse.json<SafetyResult>({
      authed: false,
      vehicle: null,
      verdict: 'caution',
      items: [{
        severity: 'low',
        icon: 'lock',
        title: 'Sign in to enable pre-trip safety',
        detail: 'Au7o cross-checks your maintenance history + known issues for your specific car before each trip.',
        action: { label: 'Sign in', href: '/auth/signin?callbackUrl=/drive' },
      }],
      summary: 'Sign in to check whether your car is ready for this trip.',
    });
  }

  // Fall back to the user's primary vehicle when none is specified.
  const vehicle = vehicleId
    ? await prisma.vehicle.findFirst({ where: { id: vehicleId, userId: session.user.id } })
    : await prisma.vehicle.findFirst({ where: { userId: session.user.id, isPrimary: true } });

  if (!vehicle) {
    return NextResponse.json<SafetyResult>({
      authed: true,
      vehicle: null,
      verdict: 'caution',
      items: [{
        severity: 'low',
        icon: 'add',
        title: 'Add a vehicle to your garage',
        detail: 'We need to know what you drive to flag overdue maintenance and known issues for this trip.',
        action: { label: 'Add vehicle', href: '/garage' },
      }],
      summary: 'Add your vehicle to /garage so Au7o can run a real safety check.',
    });
  }

  const items: SafetyItem[] = [];

  // ── Maintenance overdue ───────────────────────────────────────────────
  const records = await prisma.maintenanceRecord.findMany({
    where: { vehicleId: vehicle.id },
    orderBy: { date: 'desc' },
  });

  if (vehicle.currentMileage != null) {
    const currentMi = vehicle.currentMileage;
    for (const typeId of TRIP_RELEVANT_TYPES) {
      const schedule = MAINTENANCE_SCHEDULES[typeId];
      if (!schedule) continue;
      const last = records.find((r) => r.type === typeId);
      if (!last) continue; // Never logged — can't tell if overdue. Skip silently.
      const milesSince = currentMi - last.mileage;
      const interval = schedule.defaultIntervalMiles;
      // Only surface if approaching or past due; don't spam green checkmarks.
      if (milesSince > interval + 1000) {
        items.push({
          severity: 'high',
          icon: 'wrench',
          title: `${schedule.name} ${milesSince - interval} mi overdue`,
          detail: `Last serviced at ${last.mileage.toLocaleString()} mi · interval is ${interval.toLocaleString()} mi.`,
          action: { label: 'Log service', href: '/garage' },
        });
      } else if (milesSince > interval) {
        items.push({
          severity: 'medium',
          icon: 'wrench',
          title: `${schedule.name} overdue`,
          detail: `Last serviced ${milesSince.toLocaleString()} mi ago — ${milesSince - interval} past the ${interval.toLocaleString()}-mi interval.`,
          action: { label: 'Log service', href: '/garage' },
        });
      } else if (interval - milesSince < 500) {
        items.push({
          severity: 'low',
          icon: 'wrench',
          title: `${schedule.name} due soon`,
          detail: `${(interval - milesSince).toLocaleString()} mi remaining on the interval.`,
        });
      }
    }
  }

  // ── High-severity known issues for this vehicle ───────────────────────
  const issues = await prisma.knownIssue.findMany({
    where: {
      make: { equals: vehicle.make, mode: 'insensitive' },
      model: { equals: vehicle.model, mode: 'insensitive' },
      years: { has: vehicle.year },
      severity: 'high',
      status: 'published',
    },
    orderBy: [{ humanApproved: 'desc' }, { reportCount: 'desc' }],
    take: 3,
    select: { id: true, title: true, description: true, typicalMileageLow: true, typicalMileageHigh: true },
  });
  // Filter to issues likely relevant at the user's current mileage.
  for (const i of issues) {
    if (vehicle.currentMileage != null && i.typicalMileageHigh != null) {
      // Skip issues whose typical window is hundreds of thousands of miles
      // away from the driver's current odometer — irrelevant noise.
      if (vehicle.currentMileage < (i.typicalMileageLow ?? 0) - 20_000) continue;
      if (vehicle.currentMileage > i.typicalMileageHigh + 50_000) continue;
    }
    items.push({
      severity: 'medium',
      icon: 'issue',
      title: i.title,
      detail: i.description.slice(0, 160) + (i.description.length > 160 ? '…' : ''),
      action: { label: 'Read more', href: `/known-issues/${vehicle.make.toLowerCase().replace(/\s+/g, '-')}-${vehicle.model.toLowerCase().replace(/\s+/g, '-')}#${i.id}` },
    });
  }

  // ── Fuel range vs trip distance ───────────────────────────────────────
  if (typeof tripMiles === 'number' && tripMiles > 0 && typeof fuelMilesRemaining === 'number' && fuelMilesRemaining > 0) {
    if (tripMiles > fuelMilesRemaining) {
      items.push({
        severity: 'high',
        icon: 'fuel',
        title: 'Not enough fuel for this trip',
        detail: `Trip is ${tripMiles.toFixed(0)} mi but you only have about ${Math.round(fuelMilesRemaining)} mi of range.`,
      });
    } else if (tripMiles > fuelMilesRemaining * 0.85) {
      items.push({
        severity: 'medium',
        icon: 'fuel',
        title: 'Cutting it close on fuel',
        detail: `${tripMiles.toFixed(0)} mi trip vs ~${Math.round(fuelMilesRemaining)} mi of range. Plan a fuel stop.`,
      });
    }
  }

  // ── Verdict + summary ─────────────────────────────────────────────────
  const counts = items.reduce(
    (acc, item) => {
      acc[item.severity]++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 } as Record<Severity, number>,
  );

  let verdict: Verdict = 'go';
  if (counts.high >= 2) verdict = 'stop';
  else if (counts.high === 1 || counts.medium >= 2) verdict = 'caution';
  else if (counts.medium === 1 || counts.low > 0) verdict = 'go';

  const summary = (() => {
    if (verdict === 'stop') return `Hold off — ${counts.high} serious item${counts.high === 1 ? '' : 's'} to handle before this trip.`;
    if (verdict === 'caution') {
      const top = items.find((i) => i.severity === 'high') || items.find((i) => i.severity === 'medium');
      return top ? `Heads up: ${top.title.toLowerCase()}.` : 'Heads up before this trip.';
    }
    return 'Your car is ready for this trip.';
  })();

  // Sort items by severity for the UI.
  const order = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => order[a.severity] - order[b.severity]);

  return NextResponse.json<SafetyResult>({
    authed: true,
    vehicle: {
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      mileage: vehicle.currentMileage,
    },
    verdict,
    items,
    summary,
  });
}
