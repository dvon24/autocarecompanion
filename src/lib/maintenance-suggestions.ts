import prisma from '@/lib/db';
import { MAINTENANCE_SCHEDULES } from '@/lib/maintenance';

/**
 * Maintenance suggestions tailored to a vehicle's current mileage and the
 * user's `MaintenanceRecord` history. Powers the auto-generated first
 * message in the /vehicle/[slug] hub: "Hey, at 64,218 miles you're
 * approaching brake fluid + spark plugs..."
 *
 * Strategy:
 *   1. For each maintenance type in MAINTENANCE_SCHEDULES, calculate the
 *      next-due mileage based on the user's last logged service of that
 *      type (or 0 if never logged).
 *   2. Bucket by status:
 *        - overdue   (current > nextDue + grace)
 *        - due_now   (current is within `dueWindow` mi of nextDue)
 *        - upcoming  (nextDue is within ~5000 mi)
 *        - on_track  (nothing to surface)
 *   3. Rank by severity (overdue first, then due_now, then upcoming).
 *      Cap at top N so the chat opener stays readable.
 */

// Maintenance types we surface in the hub opener. Tighter than the full
// 19-type list — the goal is "what should you think about RIGHT NOW",
// not a full service-due dashboard.
const HUB_RELEVANT_TYPES = [
  'oil_change',
  'tire_rotation',
  'brake_service',
  'brake_fluid',
  'coolant_flush',
  'transmission_fluid',
  'differential_fluid',
  'spark_plugs',
  'air_filter',
  'cabin_filter',
  'fuel_filter',
  'wiper_blades',
];

export type SuggestionStatus = 'overdue' | 'due_now' | 'upcoming';

export interface MaintenanceSuggestion {
  typeId: string;
  name: string;
  status: SuggestionStatus;
  intervalMiles: number;
  lastServiceMileage: number | null;
  lastServiceDate: string | null;
  nextDueMileage: number;
  // Negative = miles overdue, positive = miles until due.
  milesUntilDue: number;
}

interface RunOptions {
  vehicleId: string;
  currentMileage: number;
}

export async function getMaintenanceSuggestions(opts: RunOptions): Promise<MaintenanceSuggestion[]> {
  const records = await prisma.maintenanceRecord.findMany({
    where: { vehicleId: opts.vehicleId },
    orderBy: { date: 'desc' },
  });

  const suggestions: MaintenanceSuggestion[] = [];
  const grace = 1000; // miles past due before "overdue" classification
  const dueWindow = 500; // within this many miles = "due_now"

  for (const typeId of HUB_RELEVANT_TYPES) {
    const schedule = MAINTENANCE_SCHEDULES[typeId];
    if (!schedule) continue;

    const last = records.find((r) => r.type === typeId);
    const lastServiceMileage = last?.mileage ?? null;
    const lastServiceDate = last?.date.toISOString().split('T')[0] ?? null;
    // Never-logged services use mileage 0 as the reference; the next-due
    // is the manufacturer interval. For older vehicles this surfaces a
    // long backlog all at once, which is correct — they should know.
    const baseline = lastServiceMileage ?? 0;
    const nextDueMileage = baseline + schedule.defaultIntervalMiles;
    const milesUntilDue = nextDueMileage - opts.currentMileage;

    let status: SuggestionStatus | null = null;
    if (milesUntilDue < -grace) status = 'overdue';
    else if (milesUntilDue <= dueWindow) status = 'due_now';
    else if (milesUntilDue <= 5000) status = 'upcoming';

    if (!status) continue;

    suggestions.push({
      typeId,
      name: schedule.name,
      status,
      intervalMiles: schedule.defaultIntervalMiles,
      lastServiceMileage,
      lastServiceDate,
      nextDueMileage,
      milesUntilDue,
    });
  }

  const order: Record<SuggestionStatus, number> = { overdue: 0, due_now: 1, upcoming: 2 };
  suggestions.sort((a, b) => order[a.status] - order[b.status] || a.milesUntilDue - b.milesUntilDue);
  // Cap at 6 — anything beyond that and the opener becomes a wall of text.
  return suggestions.slice(0, 6);
}

// ─── Rich maintenance schedule (powers the hero attachment in the hub) ────

export type ScheduleServiceStatus = 'done' | 'overdue' | 'due_now' | 'upcoming';

export interface ScheduleService {
  typeId: string;
  name: string;
  mileage: number;
  status: ScheduleServiceStatus;
  // Human-readable note ("in 782 mi · ~3 weeks", "Mobil 1 0W-40 · 54,810")
  note: string;
  // True for the single most-pressing service — gets the highlighted dot.
  primary?: boolean;
}

export interface ScheduleData {
  services: ScheduleService[];
  stats: {
    nowMileage: number;
    nextDueMiles: number | null;
    overdueCount: number;
    ytdSpent: number;
  };
  timelineMin: number;
  timelineMax: number;
}

/**
 * Build the rich Maintenance Schedule visualization data for the hub's hero
 * attachment. Combines logged history (MaintenanceRecord) with the
 * suggestion engine output so a single component can render past + future
 * services on one mileage timeline.
 */
export async function getMaintenanceSchedule(opts: {
  vehicleId: string;
  currentMileage: number;
  suggestions: MaintenanceSuggestion[];
}): Promise<ScheduleData | null> {
  const { vehicleId, currentMileage, suggestions } = opts;

  const records = await prisma.maintenanceRecord.findMany({
    where: { vehicleId },
    orderBy: { date: 'desc' },
  });

  // Recently completed services — anything logged in the last 12 months.
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const ytdSpent = records
    .filter((r) => r.date >= oneYearAgo && typeof r.cost === 'number')
    .reduce((sum, r) => sum + (r.cost ?? 0), 0);

  const services: ScheduleService[] = [];

  // Plot completed services (cap at the most recent 6 so the timeline isn't
  // overwhelmed for high-mileage vehicles).
  for (const r of records.slice(0, 6)) {
    const sched = MAINTENANCE_SCHEDULES[r.type];
    if (!sched) continue;
    const ago = monthsBetween(r.date, new Date());
    services.push({
      typeId: r.type,
      name: sched.name,
      mileage: r.mileage,
      status: 'done',
      note: ago === 0 ? 'this month' : ago === 1 ? '1 mo ago' : `${ago} mo ago`,
    });
  }

  // Plot upcoming/overdue/due-now services (already deduped + ranked).
  const topPrimary = suggestions[0]?.typeId ?? null;
  for (const s of suggestions) {
    const status: ScheduleServiceStatus =
      s.status === 'overdue' ? 'overdue' :
      s.status === 'due_now' ? 'due_now' : 'upcoming';
    const note = status === 'overdue'
      ? `${Math.abs(s.milesUntilDue).toLocaleString()} mi past due`
      : `in ${s.milesUntilDue.toLocaleString()} mi`;
    services.push({
      typeId: s.typeId,
      name: s.name,
      mileage: s.nextDueMileage,
      status,
      note,
      primary: s.typeId === topPrimary,
    });
  }

  if (services.length === 0) return null;

  const mileages = services.map((s) => s.mileage);
  // Pad the timeline so the "you are here" marker isn't pinned to the edge.
  const rawMin = Math.min(currentMileage, ...mileages);
  const rawMax = Math.max(currentMileage, ...mileages);
  const span = Math.max(5000, rawMax - rawMin);
  const timelineMin = Math.max(0, Math.floor((rawMin - span * 0.05) / 1000) * 1000);
  const timelineMax = Math.ceil((rawMax + span * 0.05) / 1000) * 1000;

  const overdueCount = suggestions.filter((s) => s.status === 'overdue').length;
  const nextDueMiles = suggestions[0] && suggestions[0].milesUntilDue >= 0
    ? suggestions[0].milesUntilDue
    : null;

  return {
    services,
    stats: { nowMileage: currentMileage, nextDueMiles, overdueCount, ytdSpent },
    timelineMin,
    timelineMax,
  };
}

function monthsBetween(a: Date, b: Date): number {
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

/**
 * Render a maintenance-aware opener message. Pure prose — no AI call;
 * deterministic so the same vehicle state always produces the same text
 * (powers prompt-cache hits on subsequent chat turns).
 */
export function renderOpener(
  vehicle: { year: number; make: string; model: string; trim: string | null; currentMileage: number | null },
  suggestions: MaintenanceSuggestion[],
): { text: string; cta: string[] } {
  const v = vehicle;
  const mileage = v.currentMileage ?? 0;
  const mileageStr = mileage.toLocaleString();
  const vehicleLabel = `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''}`;

  if (suggestions.length === 0) {
    return {
      text: `Your ${vehicleLabel} is at ${mileageStr} mi and on top of its scheduled maintenance — nothing flagged based on what you've logged. What's on your mind today?`,
      cta: [
        'Common problems at this mileage',
        'Plan a road trip',
        'Look up a check-engine code',
      ],
    };
  }

  const overdue = suggestions.filter((s) => s.status === 'overdue');
  const dueNow = suggestions.filter((s) => s.status === 'due_now');
  const upcoming = suggestions.filter((s) => s.status === 'upcoming');

  const lines: string[] = [];
  lines.push(`Your ${vehicleLabel} is at ${mileageStr} mi. Here's what's on your maintenance horizon:`);
  lines.push('');

  for (const s of overdue) {
    const overBy = Math.abs(s.milesUntilDue).toLocaleString();
    lines.push(`- **${s.name}** — overdue by ~${overBy} mi (interval: ${s.intervalMiles.toLocaleString()} mi)`);
  }
  for (const s of dueNow) {
    lines.push(`- **${s.name}** — due now (interval: ${s.intervalMiles.toLocaleString()} mi)`);
  }
  for (const s of upcoming) {
    lines.push(`- **${s.name}** — coming up in ~${s.milesUntilDue.toLocaleString()} mi`);
  }

  lines.push('');
  lines.push('Want me to walk through any of these, find a part, or plan a shop visit?');

  // CTAs derived from the top 3 suggestions so the chip group is contextual.
  const cta: string[] = suggestions.slice(0, 3).map((s) => `Help with ${s.name.toLowerCase()}`);
  cta.push('Common problems at this mileage');

  return { text: lines.join('\n'), cta };
}
