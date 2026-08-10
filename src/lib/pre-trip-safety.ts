import prisma from '@/lib/db';
import { MAINTENANCE_SCHEDULES } from '@/lib/maintenance';

/**
 * Shared pre-trip safety logic. Used by:
 *  - /api/drive/pre-trip-check (visual card on the trip-planned bottom sheet)
 *  - /api/drive/plan-route (injected into Claude's system prompt so the
 *    voice copilot can mention overdue maintenance / known issues
 *    naturally, like a friend, instead of reciting a list)
 *
 * Keeping this in one place means we never disagree between the card and
 * the voice — Claude's read of the world matches what the driver sees.
 */

export type Severity = 'high' | 'medium' | 'low';
export type Verdict = 'go' | 'caution' | 'stop';

export interface SafetyItem {
  severity: Severity;
  icon: string;
  title: string;
  detail: string;
  action?: { label: string; href: string };
}

export interface SafetyResult {
  authed: boolean;
  vehicle: { id: string; year: number; make: string; model: string; trim: string | null; mileage: number | null } | null;
  verdict: Verdict;
  items: SafetyItem[];
  summary: string;
}

const TRIP_RELEVANT_TYPES = [
  'oil_change',
  'tire_rotation',
  'brake_service',
  'coolant_flush',
  'transmission_fluid',
  'air_filter',
  'cabin_filter',
];

interface RunOptions {
  userId: string | null;
  vehicleId?: string | null;
  tripMiles?: number | null;
  fuelMilesRemaining?: number | null;
}

export async function runPreTripSafetyCheck(opts: RunOptions): Promise<SafetyResult> {
  const { userId, vehicleId, tripMiles, fuelMilesRemaining } = opts;

  if (!userId) {
    return {
      authed: false,
      vehicle: null,
      verdict: 'caution',
      items: [{
        severity: 'low',
        icon: 'lock',
        title: 'Pre-trip history check unavailable',
        detail: 'Browse known issues for your vehicle before setting out.',
        action: { label: 'Browse known issues', href: '/known-issues' },
      }],
      summary: 'Vehicle-history checks are unavailable without owner access.',
    };
  }

  const vehicle = vehicleId
    ? await prisma.vehicle.findFirst({ where: { id: vehicleId, userId } })
    : await prisma.vehicle.findFirst({ where: { userId, isPrimary: true } });

  if (!vehicle) {
    return {
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
    };
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
      if (!last) continue;
      const milesSince = currentMi - last.mileage;
      const interval = schedule.defaultIntervalMiles;
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
  for (const i of issues) {
    if (vehicle.currentMileage != null && i.typicalMileageHigh != null) {
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
    (acc, item) => { acc[item.severity]++; return acc; },
    { high: 0, medium: 0, low: 0 } as Record<Severity, number>,
  );

  let verdict: Verdict = 'go';
  if (counts.high >= 2) verdict = 'stop';
  else if (counts.high === 1 || counts.medium >= 2) verdict = 'caution';

  const summary = (() => {
    if (verdict === 'stop') return `Hold off — ${counts.high} serious item${counts.high === 1 ? '' : 's'} to handle before this trip.`;
    if (verdict === 'caution') {
      const top = items.find((i) => i.severity === 'high') || items.find((i) => i.severity === 'medium');
      return top ? `Heads up: ${top.title.toLowerCase()}.` : 'Heads up before this trip.';
    }
    return 'Your car is ready for this trip.';
  })();

  const order = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    authed: true,
    vehicle: {
      id: vehicle.id,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      mileage: vehicle.currentMileage,
    },
    verdict,
    items,
    summary,
  };
}

/**
 * Build the slice of Claude's system prompt that teaches the voice copilot
 * to weave the pre-trip safety items into its spoken reply *naturally* —
 * like a friend who knows your car, not a robotic disclaimer reader.
 *
 * The result is empty string when there's nothing to say (free user, no
 * vehicle, all clear) so the prompt stays clean.
 */
export function buildVoiceSafetyPromptSlice(safety: SafetyResult, lang: 'en' | 'de'): string {
  // Skip the voice slice entirely for unauth/no-vehicle — the visual card
  // already has the "sign in" pitch. Don't make Claude awkwardly recite it.
  if (!safety.authed || !safety.vehicle) return '';
  if (safety.verdict === 'go' && safety.items.length === 0) return '';

  // Filter to items the voice should consider mentioning. Keep low-severity
  // off the voice channel — they live on the visual card, not in the
  // driver's ear.
  const voiceItems = safety.items.filter((i) => i.severity !== 'low');
  if (voiceItems.length === 0) return '';

  // Compact lines so the prompt isn't inflated.
  const lines = voiceItems.slice(0, 4).map((i) => `- [${i.severity.toUpperCase()}] ${i.title}`).join('\n');

  if (lang === 'de') {
    return `\n\nFAHRZEUG-KONTEXT (nutze NUR wenn relevant — recitiere nicht mechanisch):
${lines}

Sprich darüber wie ein Kumpel, nicht wie eine Versicherungs-App. Regeln:
- HÖCHSTENS EIN Punkt pro Antwort. Wähle den nützlichsten.
- HIGH-Severity = immer erwähnen (das ist genau der Moment, wo Au7o hilft, eine Panne zu vermeiden).
- MEDIUM = nur erwähnen, wenn der Punkt zur Fahrt passt (z. B. Kühlmittel bei langer Hitze-Fahrt).
- Webe den Punkt in die Reise-Antwort ein, nicht als separaten Disclaimer.
- Wenn alles ok ist, sag NICHT "alles ok" — fahr einfach los.
- Beispiel-Stil: "Heilbronn, klar — 45 km, etwa 30 Minuten. Übrigens, dein Ölwechsel ist überfällig, hol dir einen Liter unterwegs."
- KEIN Stil: "Pre-trip Sicherheits-Check abgeschlossen: Ölwechsel überfällig."`;
  }

  return `\n\nVEHICLE CONTEXT (use ONLY if relevant — do not recite mechanically):
${lines}

Speak about this like a buddy who happens to be a mechanic, not like an insurance app. Rules:
- AT MOST ONE item per response. Pick the most useful one.
- HIGH severity = always mention (this is exactly when Au7o saves someone from breaking down).
- MEDIUM = mention only if it relates to this trip's context (e.g. coolant on a long hot drive).
- Weave the item INTO the trip reply, never as a standalone disclaimer.
- If there's nothing serious, do NOT say "you're all set" — just go.
- Example style: "Heilbronn it is — 45 miles, about 35 minutes. Hey, your oil's been overdue a while; grab a quart on the way and you're good."
- BAD style: "Pre-trip safety check complete. Oil change overdue 1200 miles."`;
}
