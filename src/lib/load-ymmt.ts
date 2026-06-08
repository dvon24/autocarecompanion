import { type YMMTData, YMMTDataSchema } from '@/schemas/vehicle.schema';

/**
 * Resilient YMMT (year/make/model/trim) loader for every vehicle picker.
 *
 * Why this exists: pickers used to `fetch('/data/ymmt.json')` and on ANY
 * failure left their dropdowns permanently empty. A German user kept
 * hitting empty year dropdowns even after the asset was confirmed healthy
 * at the Frankfurt edge — the failure is client-side and NOT a region
 * gate:
 *   - the ~1 MB file's download can be interrupted on a flaky/slow
 *     connection, so `res.json()` throws on a partial body;
 *   - the PWA service worker can serve a broken/incomplete precached
 *     copy of the file (the 1 MB precache install can fail on mobile),
 *     so the "fetch" succeeds with garbage;
 *   - a strict Zod parse can throw on a prod-bundle edge case.
 *
 * The fix: try the network fetch first (keeps the 1 MB out of the main
 * bundle on the happy path), but on ANY failure fall back to a
 * dynamically-imported BUNDLED copy of the same JSON. The bundled copy
 * ships with the deploy as a hashed webpack chunk — it can't be a stale
 * precache and doesn't depend on the /data fetch succeeding — so the
 * picker ALWAYS populates. safeParse + raw fallback guard the schema.
 */
export async function loadYmmt(): Promise<YMMTData> {
  try {
    // cache: 'no-store' forces revalidation past the HTTP cache so a
    // stale browser-cached copy isn't reused. (The SW precache is handled
    // separately by excluding /data/ymmt.json from precache in
    // next.config.ts — see FIX B.)
    const res = await fetch('/data/ymmt.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`ymmt fetch failed: ${res.status}`);
    const data = await res.json();
    return coerce(data);
  } catch (networkErr) {
    console.warn('[ymmt] network load failed, falling back to bundled copy', networkErr);
    // Dynamic import → code-split chunk shipped with this deploy. Same
    // file vehicle-slug.ts already imports at build time, so this is
    // known to bundle cleanly.
    const mod = await import('../../public/data/ymmt.json');
    const data = (mod as { default?: unknown }).default ?? mod;
    return coerce(data);
  }
}

function coerce(data: unknown): YMMTData {
  const parsed = YMMTDataSchema.safeParse(data);
  if (!parsed.success) {
    console.warn('[ymmt] schema validation failed, using raw data', parsed.error);
    return data as YMMTData;
  }
  return parsed.data;
}
