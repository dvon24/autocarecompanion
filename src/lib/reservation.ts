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

  if (!email || !EMAIL_RE.test(email) || !vehicle || !country || !source) return null;
  if (!COUNTRY_SET.has(country) || !SOURCE_SET.has(source)) return null;

  // Attribution must be a same-site path, never a caller-supplied URL.
  const path = rawPath?.startsWith('/') && !rawPath.startsWith('//') ? rawPath : null;
  return { email, vehicle, country, source, path, note };
}
