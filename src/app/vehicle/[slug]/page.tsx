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

export const revalidate = 3600;
export const dynamicParams = true;

// Parse slug like "2019-chevrolet-camaro-zl1" into vehicle tuple
function parseVehicleSlug(slug: string): { year: number; make: string; model: string; trim: string } | null {
  const decoded = decodeURIComponent(slug);
  const parts = decoded.split('-');
  if (parts.length < 3) return null;

  const year = parseInt(parts[0], 10);
  if (isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1) return null;

  // Try to match make (could be multi-word like "land-rover")
  // Strategy: the make is 1-2 words, model is 1-2 words, rest is trim
  const rest = parts.slice(1);

  // Known multi-word makes
  const multiWordMakes: Record<string, string> = {
    'land-rover': 'Land Rover',
    'alfa-romeo': 'Alfa Romeo',
    'mercedes-benz': 'Mercedes-Benz',
  };

  for (const [key, displayName] of Object.entries(multiWordMakes)) {
    const keyParts = key.split('-');
    const prefix = rest.slice(0, keyParts.length).join('-');
    if (prefix === key) {
      const afterMake = rest.slice(keyParts.length);
      if (afterMake.length < 1) return null;
      // Model is next word(s), trim is rest
      const model = capitalize(afterMake[0]);
      const trim = afterMake.slice(1).map(capitalize).join(' ') || 'Base';
      return { year, make: displayName, model, trim };
    }
  }

  // Single-word make
  const make = capitalize(rest[0]);
  if (rest.length < 2) return null;
  const model = capitalize(rest[1]);
  const trim = rest.slice(2).map(capitalize).join(' ') || 'Base';

  return { year, make, model, trim };
}

function capitalize(s: string): string {
  if (!s) return s;
  // Handle special cases
  const specials: Record<string, string> = {
    'bmw': 'BMW', 'gmc': 'GMC', 'ram': 'RAM', 'mini': 'MINI',
    'crv': 'CR-V', 'rav4': 'RAV4', 'cr-v': 'CR-V',
    'zl1': 'ZL1', 'srt': 'SRT', 'gt': 'GT', 'ss': 'SS', 'rs': 'RS',
    'sel': 'SEL', 'se': 'SE', 'xle': 'XLE', 'lx': 'LX', 'ex': 'EX',
    'lt': 'LT', 'ls': 'LS', 'le': 'LE', 'dx': 'DX',
  };
  if (specials[s.toLowerCase()]) return specials[s.toLowerCase()];
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = parseVehicleSlug(slug);
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vehicle = parseVehicleSlug(slug);
  if (!vehicle) notFound();

  const { year, make, model, trim } = vehicle;

  // Load all data in parallel
  const [issues, recalls, cachedParts, specs] = await Promise.all([
    getKnownIssuesForArticle(make, model).catch(() => []),
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
          isSubscriber: session.user.subscriptionStatus === 'active',
        };
      }
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
          maintenanceSuggestions = await getMaintenanceSuggestions({
            vehicleId: userVehicle.id,
            currentMileage: userVehicle.currentMileage,
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

  const opener = renderOpener(
    { year, make, model, trim, currentMileage },
    maintenanceSuggestions,
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
      maintenanceSuggestions={maintenanceSuggestions}
      opener={opener}
      recentThreads={recentThreads}
      trending={trending}
      attachableIssues={attachableIssues}
      user={userInfo}
      schedule={maintenanceSchedule}
    />
  );
}
