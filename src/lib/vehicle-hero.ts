import manifest from '@/data/vehicle-heroes.json';
import { slugNorm } from '@/lib/vehicle-slug';

/**
 * Resolve the best available hero image for a YMMT from the build-time
 * manifest of /public/vehicles (src/data/vehicle-heroes.json, rebuilt by
 * scripts/build-hero-manifest.js).
 *
 * Match priority:
 *   1. exact year + make + model + trim
 *   2. exact year + make + model (no-trim base image)
 *   3. same make + model, any trim          (same body, different badge)
 * with 1-3 each searched across a ±YEAR_WINDOW span, nearest year first.
 *
 * Beyond the window we return nothing — showing a current-gen car to the
 * owner of a two-generations-older one reads as "that's not my car",
 * which is worse than the silhouette.
 */

interface HeroFile {
  file: string;
  year: number;
  rest: string; // filename between the year and the extension, lowercase
  ext: string;
}

const FILES: HeroFile[] = (manifest as string[])
  .map((file) => {
    const m = /^(\d{4})-(.+)\.(webp|png|jpg)$/i.exec(file);
    if (!m) return null;
    return { file, year: parseInt(m[1], 10), rest: m[2].toLowerCase(), ext: m[3].toLowerCase() };
  })
  .filter((f): f is HeroFile => f !== null);

const YEAR_WINDOW = 3; // ≈ one styling generation

export function vehicleHeroCandidates(
  year: number,
  make: string,
  model: string,
  trim?: string | null,
): string[] {
  const mm = `${slugNorm(make)}-${slugNorm(model)}`;
  const mmTrim = trim ? `${mm}-${slugNorm(trim)}` : null;

  const scored: { file: string; score: number }[] = [];
  for (const f of FILES) {
    const dy = Math.abs(f.year - year);
    if (dy > YEAR_WINDOW) continue;
    let match: number;
    if (mmTrim && f.rest === mmTrim) match = 0;
    else if (f.rest === mm) match = 1;
    // Same model, some other trim. A longer model name sharing the prefix
    // (camry vs camry-solara) could sneak in here — the library is curated,
    // so keep the simple rule until a real conflict ships.
    else if (f.rest.startsWith(mm + '-')) match = 2;
    else continue;
    scored.push({ file: f.file, score: match * 100 + dy * 10 + (f.ext === 'webp' ? 0 : 1) });
  }

  return scored.sort((a, b) => a.score - b.score).map((s) => `/vehicles/${s.file}`);
}
