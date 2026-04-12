import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getKnownIssuesForArticle } from '@/lib/known-issues';
import { getRecallsForArticle } from '@/lib/recalls';
import { getVehicleSpecs } from '@/lib/maintenance';
import prisma from '@/lib/db';
import { VehicleDashboard } from '@/components/vehicle/VehicleDashboard';

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
      where: { year, make: { equals: make, mode: 'insensitive' }, model: { equals: model, mode: 'insensitive' } },
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

  return (
    <VehicleDashboard
      vehicle={vehicle}
      slug={slug}
      issues={JSON.parse(JSON.stringify(yearIssues))}
      recalls={JSON.parse(JSON.stringify(recalls))}
      cachedParts={JSON.parse(JSON.stringify(cachedParts))}
      specsSummary={specsSummary}
    />
  );
}
