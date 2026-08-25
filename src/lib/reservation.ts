export const RESERVATION_COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'New Zealand',
  'Ireland', 'Germany', 'France', 'Netherlands', 'Belgium', 'Spain', 'Portugal',
  'Italy', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Poland', 'Czechia', 'Romania', 'Greece', 'Turkey', 'Mexico', 'Brazil',
  'Argentina', 'Chile', 'Colombia', 'Peru', 'Puerto Rico', 'South Africa',
  'Nigeria', 'Kenya', 'Egypt', 'United Arab Emirates', 'Saudi Arabia', 'Israel',
  'India', 'Pakistan', 'Philippines', 'Indonesia', 'Malaysia', 'Singapore',
  'Thailand', 'Vietnam', 'Japan', 'South Korea', 'China', 'Hong Kong', 'Taiwan',
  'Other',
] as const;

export const RESERVATION_SOURCES = ['hero', 'demo'] as const;

const COUNTRY_SET = new Set<string>(RESERVATION_COUNTRIES);
const SOURCE_SET = new Set<string>(RESERVATION_SOURCES);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ReservationInput {
  email: string;
  vehicle: string;
  country: string;
  source: string;
  path: string | null;
  note: string | null;
  transmission: 'automatic' | 'manual' | null;
  /**
   * What the client SAYS the vehicle is. Never stored as-is — the route runs
   * it through `verifyVehicle` (server-only, holds the catalog) to decide
   * whether it resolves to a real entry. Kept separate from the trusted fields
   * so the two can never be confused at a call site.
   */
  claimed: {
    year: number | null;
    make: string | null;
    model: string | null;
    trim: string | null;
  };
}

/** The display string stored in `vehicle`, built from picked YMMT parts. */
export function composeVehicle(parts: {
  year?: number | string | null; make?: string | null; model?: string | null; trim?: string | null;
}): string {
  return [parts.year, parts.make, parts.model, parts.trim]
    .map((p) => (p == null ? '' : String(p).trim()))
    .filter(Boolean)
    .join(' ')
    .slice(0, 120);
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, max) : null;
}

/** Validate the public payload even when callers bypass browser validation. */
export function parseReservationInput(value: unknown): ReservationInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const body = value as Record<string, unknown>;
  const email = text(body.email, 254)?.toLowerCase() ?? null;
  const vehicle = text(body.vehicle, 120);
  const country = text(body.country, 60);
  const source = text(body.source, 60);
  const rawPath = text(body.path, 200);
  const note = text(body.note, 1000);
  const transmission = body.transmission === 'automatic' || body.transmission === 'manual'
    ? body.transmission
    : null;

  if (!email || !EMAIL_RE.test(email) || !vehicle || !country || !source) return null;
  if (!COUNTRY_SET.has(country) || !SOURCE_SET.has(source)) return null;

  // Attribution must be a same-site path, never a caller-supplied URL.
  const path = rawPath?.startsWith('/') && !rawPath.startsWith('//') ? rawPath : null;

  // Shape and bounds only. Whether these name a real vehicle is decided by
  // verifyVehicle() against the catalog — a caller can claim anything, and a
  // presence check would happily mark "Chevorlet Camaro" as verified.
  const rawYear = typeof body.year === 'number' ? body.year : Number(text(body.year, 4) ?? NaN);
  const year = Number.isInteger(rawYear) && rawYear >= 1900 && rawYear <= 2100 ? rawYear : null;

  return {
    email, vehicle, country, source, path, note, transmission,
    claimed: {
      year,
      make: text(body.make, 60),
      model: text(body.model, 60),
      trim: text(body.trim, 60),
    },
  };
}
