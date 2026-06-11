/**
 * Slug helpers for the /vehicle/[slug] hub route.
 *
 * URL shape: /vehicle/{year}-{make}-{model}-{trim?}
 *   /vehicle/2015-dodge-challenger-srt-392
 *   /vehicle/2024-honda-civic
 *   /vehicle/2026-tesla-model-y-long-range
 *
 * The make+model can have multi-word names (Land Rover, Model 3, Grand
 * Cherokee, ...). To resolve unambiguously we ground against the YMMT
 * data — same approach as /known-issues/[slug] uses parseSlug().
 */

import ymmtData from '../../public/data/ymmt.json';

type Ymmt = Record<string, Record<string, Record<string, string[]>>>;
const YMMT = ymmtData as Ymmt;

export interface VehicleSlugParts {
  year: number;
  make: string;
  model: string;
  trim: string | null;
}

/**
 * Normalize a string to URL-safe kebab case, transliterating accented
 * characters first so that "Citroën" → "citroen" not "citro-n".
 *
 * The earlier implementation just stripped any non-[a-z0-9] character,
 * which broke Citroën URLs (the ë became a `-`, producing slugs like
 * `citro-n-berlingo`). Google saw those malformed slugs and de-prioritized
 * them — visible in GSC's "Crawled — currently not indexed" report.
 *
 * Fix: NFD-normalize to decompose accented chars into base letter +
 * combining diacritic, strip the combining marks (U+0300-U+036F), then
 * apply the original kebab pass. Result: Citroën → citroen, Škoda → skoda,
 * Ñoño → nono, etc.
 */
export function slugNorm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function vehicleSlug(year: number, make: string, model: string, trim?: string | null): string {
  const parts = [String(year), slugNorm(make), slugNorm(model)];
  if (trim) parts.push(slugNorm(trim));
  return parts.join('-');
}

/**
 * Resolve "/vehicle/2015-dodge-challenger-srt-392" → { year, make, model, trim }.
 * Returns null when no make+model in the YMMT data matches the slug.
 *
 * Strategy: pop the year (first 4 chars must be digits). Then walk the
 * remaining tokens, growing the make+model+trim windows greedily, and
 * check each combination against ymmt.json. First match wins.
 */
export function parseVehicleSlug(slug: string): VehicleSlugParts | null {
  if (!slug || slug.length < 6) return null;
  const m = /^(\d{4})-(.+)$/.exec(slug);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  if (!Number.isFinite(year) || year < 1980 || year > 2100) return null;
  const yearKey = String(year);
  const yearData = YMMT[yearKey];
  if (!yearData) return null;

  const tokens = m[2].split('-').filter(Boolean);
  if (tokens.length === 0) return null;

  // Greedy match: try longest make first, then longest model, then trim.
  // Strips diacritics so that "Citroën" in YMMT matches "citroen" in
  // the URL slug after vehicleSlug() normalization.
  const makeKeys = Object.keys(yearData);
  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');

  for (let mLen = Math.min(tokens.length - 1, 3); mLen >= 1; mLen--) {
    const makeCandidate = tokens.slice(0, mLen).join('-');
    const matchedMake = makeKeys.find((k) => norm(k) === norm(makeCandidate));
    if (!matchedMake) continue;
    const modelData = yearData[matchedMake];
    const modelKeys = Object.keys(modelData);

    for (let mdLen = Math.min(tokens.length - mLen, 4); mdLen >= 1; mdLen--) {
      const modelCandidate = tokens.slice(mLen, mLen + mdLen).join('-');
      const matchedModel = modelKeys.find((k) => norm(k) === norm(modelCandidate));
      if (!matchedModel) continue;

      const trimTokens = tokens.slice(mLen + mdLen);
      const trims = modelData[matchedModel] || [];
      let matchedTrim: string | null = null;
      if (trimTokens.length > 0) {
        const trimCandidate = trimTokens.join('-');
        matchedTrim = trims.find((t) => norm(t) === norm(trimCandidate)) || trimCandidate;
      }

      return { year, make: matchedMake, model: matchedModel, trim: matchedTrim };
    }
  }

  return null;
}

/** Bucket mileage to 10k-mi increments so trending data doesn't fragment. */
export function mileageBucket(miles: number | null | undefined): number | null {
  if (typeof miles !== 'number' || miles < 0) return null;
  return Math.floor(miles / 10000) * 10000;
}
