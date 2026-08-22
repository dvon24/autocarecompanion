import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getKnownIssuesForArticle } from '@/lib/known-issues';
import { getRecallsForArticle } from '@/lib/recalls';
import { getVehicleSpecs } from '@/lib/maintenance';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { VehicleHub } from '@/components/vehicle/VehicleHub';
import { getMaintenanceSuggestions, getMaintenanceSchedule, renderOpener, type MaintenanceSuggestion, type ScheduleData } from '@/lib/maintenance-suggestions';
import { getRecentThreads, getTrendingForVehicle, getAttachableIssues } from '@/lib/hub-data';
import { getOwnersManualSchedule } from '@/lib/owners-manual-schedule';
import { isFounderEmail } from '@/lib/founder';
import { parseVehicleSlug as parseCatalogVehicleSlug } from '@/lib/vehicle-slug';
import { getKnownIssueVehicleCandidates } from '@/lib/known-issue-vehicle-aliases';
import { getTwinHubData } from '@/lib/twin-hub-data';
import { LiveTwinHub } from '@/components/twin/LiveTwinHub';

export const revalidate = 3600;
export const dynamicParams = true;

// Ground make/model/trim resolution against the same YMMT catalog that built
// the selector. This handles multi-word models such as Grand Cherokee and
// MX-5 Miata instead of guessing token boundaries.
function parseHubVehicleSlug(slug: string): {
  year: number;
  make: string;
  model: string;
  trim: string;
} | null {
  let decoded: string;
  try { decoded = decodeURIComponent(slug); } catch { return null; }
  const parsed = parseCatalogVehicleSlug(decoded) || parseLegacyVehicleSlug(decoded);
  if (!parsed) return null;
  if (parsed.year < 1990 || parsed.year > new Date().getFullYear() + 1) {
    return null;
  }
  return { ...parsed, trim: parsed.trim || 'Base' };
}

/** Preserve saved and legacy Hub URLs whose vehicle is not present in the
 * current selector snapshot. Catalog parsing remains first so supported
 * multi-word models use exact YMMT boundaries; this is compatibility only. */
function parseLegacyVehicleSlug(slug: string): {
  year: number;
  make: string;
  model: string;
  trim: string;
} | null {
  const parts = slug.split('-');
  if (parts.length < 3) return null;
  const year = Number.parseInt(parts[0], 10);
  if (!Number.isInteger(year)) return null;
  const rest = parts.slice(1);
  const multiWordMakes: Record<string, string> = {
    'land-rover': 'Land Rover',
    'alfa-romeo': 'Alfa Romeo',
    'mercedes-benz': 'Mercedes-Benz',
  };

  for (const [key, make] of Object.entries(multiWordMakes)) {
    const makeParts = key.split('-');
    if (rest.slice(0, makeParts.length).join('-') !== key) continue;
    const vehicleParts = rest.slice(makeParts.length);
    if (vehicleParts.length === 0) return null;
    return {
      year,
      make,
      model: legacySlugPart(vehicleParts[0]),
      trim: vehicleParts.slice(1).map(legacySlugPart).join(' ') || 'Base',
    };
  }

  if (rest.length < 2) return null;
  return {
    year,
    make: legacySlugPart(rest[0]),
    model: legacySlugPart(rest[1]),
    trim: rest.slice(2).map(legacySlugPart).join(' ') || 'Base',
  };
}

function legacySlugPart(value: string): string {
  const special: Record<string, string> = {
    bmw: 'BMW', gmc: 'GMC', ram: 'RAM', mini: 'MINI',
    crv: 'CR-V', 'cr-v': 'CR-V', rav4: 'RAV4',
    zl1: 'ZL1', srt: 'SRT', gt: 'GT', ss: 'SS', rs: 'RS',
    sel: 'SEL', se: 'SE', xle: 'XLE', lx: 'LX', ex: 'EX',
    lt: 'LT', ls: 'LS', le: 'LE', dx: 'DX',
  };
  return special[value.toLowerCase()]
    || `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = parseHubVehicleSlug(slug);
  if (!vehicle) return { title: 'Vehicle Not Found' };

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} — Au7o`;
  const description = `Everything you need for your ${vehicle.year} ${vehicle.make} ${vehicle.model}: known issues, parts, maintenance guides, recalls, and AI diagnostics.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', siteName: 'Au7o' },
  };
}

export default async function VehicleProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session?: string; from?: string; twin?: string }>;
}) {
  const { slug } = await params;
  const { session: sessionIdParam, twin: twinParam } = await searchParams;
  const vehicle = parseHubVehicleSlug(slug);
  if (!vehicle) notFound();

  const { year, make, model, trim } = vehicle;

  const knownIssueVehicles = getKnownIssueVehicleCandidates({ year, make, model });
  const knownIssuesPromise = Promise.all(
    knownIssueVehicles.map((candidate) =>
      getKnownIssuesForArticle(candidate.make, candidate.model).catch(() => []),
    ),
  ).then((groups) => {
    const seen = new Set<string>();
    return groups.flat().filter((issue) => {
      if (seen.has(issue.id)) return false;
      seen.add(issue.id);
      return true;
    });
  });

  // Load all data in parallel
  const [issues, recalls, cachedParts, specs] = await Promise.all([
    knownIssuesPromise,
    getRecallsForArticle(make, model, [year]).catch(() => []),
    prisma.vehiclePartLookup.findMany({
      where: {
        year,
        make: { equals: make, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' },
        // Try exact trim first, otherwise get all and filter later
        OR: [
          { trim: { equals: trim, mode: 'insensitive' } },
          { trim: 'Base' },
        ],
      },
      select: { task: true, parts: true, source: true },
    }).catch(() => []),
    Promise.resolve(getVehicleSpecs({ year, make, model, trim })),
  ]);

  // Filter issues relevant to this year AND trim/engine
  const trimLower = trim.toLowerCase();
  const engineStr = specs?.engine?.toLowerCase() || '';
  const yearIssues = issues.filter(issue => {
    if (!issue.vehicleMatch.years.includes(year)) return false;
    // If issue specifies engines, only show if our trim/engine matches
    if (issue.vehicleMatch.engines && issue.vehicleMatch.engines.length > 0) {
      const engineMatch = issue.vehicleMatch.engines.some((e: string) => {
        const eLower = e.toLowerCase();
        return trimLower.includes(eLower) || eLower.includes(trimLower) || engineStr.includes(eLower);
      });
      if (!engineMatch) return false;
    }
    // If issue specifies trims, only show if our trim matches
    if (issue.vehicleMatch.trims && issue.vehicleMatch.trims.length > 0) {
      const trimMatch = issue.vehicleMatch.trims.some((t: string) =>
        trimLower.includes(t.toLowerCase()) || t.toLowerCase().includes(trimLower)
      );
      if (!trimMatch) return false;
    }
    return true;
  });

  // Build specs summary for the cheat sheet
  const specsSummary: Record<string, string> = {};
  if (specs) {
    specsSummary.engine = specs.engine;
    if (specs.oil) {
      specsSummary.oil = `${specs.oil.type} · ${specs.oil.capacity}`;
      specsSummary.oilFilter = specs.oil.filterPartNumber;
    }
    if (specs.coolant) specsSummary.coolant = `${specs.coolant.type} · ${specs.coolant.capacity}`;
    if (specs.sparkPlugs) specsSummary.sparkPlugs = `${specs.sparkPlugs.partNumber} x${specs.sparkPlugs.quantity}`;
    if (specs.transmission) specsSummary.transmission = `${specs.transmission.type} · ${specs.transmission.capacity}`;
    if (specs.lug) specsSummary.lug = `${specs.lug.size} · ${specs.lug.torque}${specs.lug.useBolts ? ' (bolts)' : ''}`;
    if (specs.brakeFluid) specsSummary.brakeFluid = specs.brakeFluid.type;
  }

  // Generate parts from vehicle specs (always available, no seeding needed)
  const tag = 'au7o-20';
  const specsParts: { task: string; parts: any[]; source: string }[] = [];
  const cachedTasks = new Set(cachedParts.map(p => p.task));

  if (specs) {
    if (specs.oil && !cachedTasks.has('oil_change')) {
      const parts: any[] = [];
      // Extract just the weight (e.g. "0W-40" from "0W-40 Full Synthetic (Pennzoil...)")
      const oilWeight = specs.oil.type.match(/\d+W-\d+/)?.[0] || specs.oil.type;
      parts.push({
        name: oilWeight + ' Motor Oil',
        spec: specs.oil.type + ' · ' + specs.oil.capacity,
        brand: '',
        partNumber: '',
        searchQuery: specs.oil.type.split('(')[0].trim() + ' motor oil',
        affiliateUrl: 'https://www.amazon.com/s?k=' + encodeURIComponent(oilWeight + ' full synthetic motor oil') + '&tag=' + tag,
      });
      if (specs.oil.filterPartNumber) {
        // Clean up filter part number (remove brand suffix like "(Mopar)")
        const filterPN = specs.oil.filterPartNumber.replace(/\s*\(.*\)/, '').trim();
        const filterBrand = specs.oil.filterPartNumber.includes('Mopar') ? 'Mopar' : specs.oil.filterPartNumber.startsWith('PF') ? 'ACDelco' : '';
        parts.push({
          name: 'Oil Filter',
          spec: filterBrand ? filterBrand + ' ' + filterPN : filterPN,
          brand: filterBrand,
          partNumber: filterPN,
          searchQuery: filterPN,
          affiliateUrl: 'https://www.amazon.com/s?k=' + encodeURIComponent(filterPN + ' oil filter') + '&tag=' + tag,
        });
      }
      if (specs.oil.drainPlugSize) {
        parts.push({ name: 'Drain Plug Socket', spec: specs.oil.drainPlugSize, brand: '', partNumber: '', searchQuery: specs.oil.drainPlugSize + ' socket' });
      }
      specsParts.push({ task: 'oil_change', parts, source: 'specs' });
    }
    if (specs.sparkPlugs && !cachedTasks.has('spark_plugs')) {
      specsParts.push({ task: 'spark_plugs', parts: [{
        name: 'Spark Plug (x' + specs.sparkPlugs.quantity + ')',
        spec: 'Gap: ' + specs.sparkPlugs.gap + ' · Torque: ' + specs.sparkPlugs.torque,
        brand: specs.sparkPlugs.partNumber.includes('41') ? 'ACDelco' : 'NGK',
        partNumber: specs.sparkPlugs.partNumber,
        searchQuery: specs.sparkPlugs.partNumber,
        affiliateUrl: 'https://www.amazon.com/s?k=' + encodeURIComponent(specs.sparkPlugs.partNumber) + '&tag=' + tag,
      }], source: 'specs' });
    }
    if (specs.coolant && !cachedTasks.has('coolant_flush')) {
      specsParts.push({ task: 'coolant_flush', parts: [{
        name: 'Coolant',
        spec: specs.coolant.type + ' · ' + specs.coolant.capacity,
        brand: '', partNumber: '',
        searchQuery: specs.coolant.type + ' ' + make,
        affiliateUrl: 'https://www.amazon.com/s?k=' + encodeURIComponent(specs.coolant.type + ' coolant') + '&tag=' + tag,
      }], source: 'specs' });
    }
    if (specs.transmission && !cachedTasks.has('transmission_fluid')) {
      specsParts.push({ task: 'transmission_fluid', parts: [{
        name: 'Transmission Fluid',
        spec: specs.transmission.type + ' · ' + specs.transmission.capacity,
        brand: '', partNumber: '',
        searchQuery: specs.transmission.type,
        affiliateUrl: 'https://www.amazon.com/s?k=' + encodeURIComponent(specs.transmission.type) + '&tag=' + tag,
      }], source: 'specs' });
    }
    if (specs.brakeFluid && !cachedTasks.has('brake_fluid')) {
      specsParts.push({ task: 'brake_fluid', parts: [{
        name: 'Brake Fluid',
        spec: specs.brakeFluid.type,
        brand: '', partNumber: '',
        searchQuery: specs.brakeFluid.type + ' brake fluid',
        affiliateUrl: 'https://www.amazon.com/s?k=' + encodeURIComponent(specs.brakeFluid.type + ' brake fluid') + '&tag=' + tag,
      }], source: 'specs' });
    }
    if (specs.lug && !cachedTasks.has('tire_rotation')) {
      specsParts.push({ task: 'tire_rotation', parts: [{
        name: 'Lug ' + (specs.lug.useBolts ? 'Bolt' : 'Nut') + ' Socket',
        spec: specs.lug.size + ' · Torque: ' + specs.lug.torque,
        brand: '', partNumber: '',
        searchQuery: specs.lug.size + ' lug socket',
      }], source: 'specs' });
    }
  }

  const allParts = [...cachedParts, ...specsParts];

  // Map of maintenance typeId → buyable parts, so the hub can show "order
  // these" links right on each overdue/due maintenance row (the affiliate
  // moment — the overdue list IS a shopping list). Ensure every part has an
  // affiliate URL (fall back to a tagged Amazon search).
  const partsByTask: Record<string, { name: string; spec?: string; partNumber?: string; affiliateUrl: string }[]> = {};
  for (const p of allParts) {
    const list = (Array.isArray(p.parts) ? p.parts : []).map((pt: any) => ({
      name: String(pt.name || '').trim(),
      spec: pt.spec ? String(pt.spec) : undefined,
      partNumber: pt.partNumber ? String(pt.partNumber) : undefined,
      affiliateUrl: pt.affiliateUrl || `https://www.amazon.com/s?k=${encodeURIComponent(pt.searchQuery || pt.name || '')}&tag=${tag}`,
    })).filter((pt) => pt.name);
    if (list.length > 0) partsByTask[p.task] = list;
  }

  // ── Auth + maintenance suggestions for the new conversation hub ──
  // Anonymous visitors hit this page with no Vehicle row to look up, so
  // they get a generic opener. Signed-in users with a matching Vehicle in
  // their garage get a maintenance-aware opener tailored to their actual
  // mileage + service history.
  let isAuthed = false;
  let currentMileage: number | null = null;
  let userVehicleId: string | null = null;
  let maintenanceSuggestions: MaintenanceSuggestion[] = [];
  let maintenanceSchedule: ScheduleData | null = null;
  let userId: string | null = null;
  let userInfo: { name: string; joinedAt: string; isSubscriber: boolean } | null = null;
  // Whether this viewer may see the twin hub in place of the classic one.
  let isFounder = false;
  // Saved vehicles for the top-bar switcher dropdown — only populated
  // when authed. Empty array on anonymous viewers so the switcher just
  // renders the static vehicle label without dropdown affordance.
  let userVehicles: Array<{ id: string; year: number; make: string; model: string; trim: string | null; nickname: string | null }> = [];
  try {
    const session = await auth();
    if (session?.user?.id) {
      isAuthed = true;
      userId = session.user.id;
      // Pull the user row to get joinedAt for the rail footer's "SUBSCRIBER · X MO".
      const userRow = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, createdAt: true },
      });
      if (userRow) {
        userInfo = {
          name: userRow.name || userRow.email.split('@')[0],
          joinedAt: userRow.createdAt.toISOString(),
          // Founder + ops accounts read as subscriber for UI gating so
          // they can QA Plus/Pro surfaces (Mark complete, etc.) from a
          // Free DB row. Matches the server-side bypass in
          // /api/maintenance.
          isSubscriber: session.user.subscriptionStatus === 'active' || isFounderEmail(userRow.email),
        };
        isFounder = isFounderEmail(userRow.email);
      }
      // Pull ALL vehicles for the switcher dropdown — same query as
      // /api/vehicles GET but inlined here so we can do it in parallel
      // with the userVehicle lookup below. Bounded to 10 for the
      // dropdown render budget (rare to have more anyway).
      userVehicles = await prisma.vehicle.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isPrimary: 'desc' }, { updatedAt: 'desc' }],
        take: 10,
        select: { id: true, year: true, make: true, model: true, trim: true, nickname: true },
      });

      // Match the vehicle URL to a row in the user's garage. Loose match
      // on year/make/model — trim variations are common ("SRT 392" vs
      // "SRT" vs "Hellcat") so we'd rather over-match than miss the
      // user's actual garage entry.
      const userVehicle = await prisma.vehicle.findFirst({
        where: {
          userId: session.user.id,
          year,
          make: { equals: make, mode: 'insensitive' },
          model: { equals: model, mode: 'insensitive' },
        },
        select: { id: true, currentMileage: true },
      });
      if (userVehicle) {
        userVehicleId = userVehicle.id;
        if (userVehicle.currentMileage != null) {
          currentMileage = userVehicle.currentMileage;
          // Compute owner's-manual schedule FIRST so the suggestion
          // engine can use its per-vehicle interval_miles values
          // instead of generic MAINTENANCE_SCHEDULES defaults.
          // (e.g. 2015 Challenger SRT 392 oil interval is 7,000 mi,
          // not the generic 5,000.) When no manual schedule exists
          // for this YMMT, defaults apply unchanged.
          const oms = getOwnersManualSchedule({ year, make, model, trim });
          maintenanceSuggestions = await getMaintenanceSuggestions({
            vehicleId: userVehicle.id,
            currentMileage: userVehicle.currentMileage,
            ownersManualSchedule: oms,
          });
          maintenanceSchedule = await getMaintenanceSchedule({
            vehicleId: userVehicle.id,
            currentMileage: userVehicle.currentMileage,
            suggestions: maintenanceSuggestions,
          });
        }
      }
    }
  } catch {
    // Silent fallback — anonymous flow continues to work even when auth
    // or DB is briefly unhappy.
  }

  // Free users don't see a maintenance opener line (tier-gated alongside
  // the schedule card). Inline gate here because the rest of the tier
  // variables haven't been computed yet at this point in the function.
  const _isSubForOpener = !!userInfo?.isSubscriber;
  const opener = renderOpener(
    { year, make, model, trim, currentMileage },
    _isSubForOpener ? maintenanceSuggestions : [],
  );

  // Batch 3 data: recent threads (only when authed), trending intents
  // (everyone), and attachable known-issue cards (everyone). All run in
  // parallel so the page render time doesn't grow.
  const [recentThreads, trending, attachableIssues] = await Promise.all([
    isAuthed && userId
      ? getRecentThreads(userId, userVehicleId).catch(() => [])
      : Promise.resolve([]),
    getTrendingForVehicle({ make, model, currentMileage }).catch(() => []),
    getAttachableIssues({ make, model, year, trim }).catch(() => []),
  ]);

  // Owner's-manual-sourced maintenance schedule (separate from the dynamic
  // suggestion-engine timeline). Available for ALL users on vehicles where
  // we have a verified schedule entry — Phase 0 POC ships with the 2019
  // Camaro ZL1 (LT4); Phase 1 expands coverage to top 25 US vehicles.
  const ownersManualSchedule = getOwnersManualSchedule({ year, make, model, trim });

  // Tier gate on the dynamic Maintenance Schedule card. Per
  // TIER_LIMITS.free.maintenanceTracking = false, the schedule UI
  // is a Plus/Pro feature — free users (and anonymous) don't see
  // it attached to the hub opener or seeded chat messages. The
  // Known Issues card stays on for everyone (it's the free SEO
  // product). Founder bypass on isSubscriber means this still
  // resolves to true for QA accounts.
  const isSubscriberFlag = !!userInfo?.isSubscriber;
  const scheduleForHub = isSubscriberFlag ? maintenanceSchedule : null;
  // Same tier gate applied to the maintenance-suggestions text
  // context. The opener-text generator (renderOpener) and the chat
  // system prompt both read maintenanceSuggestions — leaving it on
  // for free users would leak Plus-tier hints into chat ("your next
  // oil change is due in 800 mi") even though the visual schedule
  // card is hidden. Gate both at the source so the gating decision
  // is unambiguous.
  const suggestionsForHub = isSubscriberFlag ? maintenanceSuggestions : [];
  // Show the inline "Upgrade to Plus" tile in the schedule slot
  // when the visitor is signed in on a free tier with a matching
  // garage vehicle. Anonymous users see neither schedule nor tile
  // (they're upstream of the signup conversion). Subscribers see
  // the real schedule. Quietly absent everywhere else.
  const showMaintenanceUpgradeTile = isAuthed && !isSubscriberFlag && !!userVehicleId;

  // ---- Twin hub swap -------------------------------------------------
  // The tech-tree hub (the /demo/hub screen) replaces the classic hub for
  // the founder, so it can be driven daily against a real car instead of
  // the 65,000 mi demo. Deliberately narrow for now:
  //
  //   * founder only - the stage art depicts a Challenger, so any other
  //     vehicle would be shown the wrong car, which is exactly the fitment
  //     dishonesty this codebase avoids elsewhere.
  //   * needs a garage vehicle WITH an odometer - getTwinHubData returns
  //     null otherwise, and a mileage-based screen with no mileage has
  //     nothing true to say.
  //   * ?twin=0 forces the classic hub back, so there is always a way out
  //     without a deploy.
  //
  // Any of those failing falls through to the classic hub below.
  if (isFounder && twinParam !== '0' && userId && userVehicleId) {
    const twinData = await getTwinHubData(userId, userVehicleId).catch(() => null);
    if (twinData) return <LiveTwinHub data={twinData} />;
  }

  return (
    <VehicleHub
      vehicle={{ year, make, model, trim }}
      slug={slug}
      isAuthed={isAuthed}
      counts={{
        knownIssues: yearIssues.length,
        recalls: recalls.length,
        partsCached: allParts.length,
      }}
      currentMileage={currentMileage}
      maintenanceSuggestions={suggestionsForHub}
      opener={opener}
      recentThreads={recentThreads}
      trending={trending}
      attachableIssues={attachableIssues}
      recalls={recalls.map((r) => ({ campaignNumber: r.campaignNumber, component: r.component, summary: r.summary, remedy: r.remedy, severity: r.severity }))}
      partsByTask={partsByTask}
      user={userInfo}
      schedule={scheduleForHub}
      ownersManualSchedule={ownersManualSchedule}
      userVehicles={userVehicles}
      loggableVehicleId={userVehicleId}
      canLogMaintenance={!!userInfo?.isSubscriber && !!userVehicleId}
      initialSessionId={sessionIdParam || null}
      showMaintenanceUpgradeTile={showMaintenanceUpgradeTile}
    />
  );
}
