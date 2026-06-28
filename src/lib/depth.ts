/**
 * Depth grounding for /api/vision — Phase 1a of the 3D vision pipeline.
 *
 * Calls the Modal-hosted Depth Anything 3 (metric) endpoint to turn the
 * diagnosis photo into real geometry, returned as a short natural-language
 * block we inject into the vision prompt so the model SANITY-CHECKS its read
 * against measured shape ("is that bulge real / how big is that gap") instead
 * of guessing.
 *
 * Hard rules:
 *  - INERT unless DEPTH_ENDPOINT_URL is set (so this ships dark and lights up
 *    the moment the Modal endpoint + env var are live).
 *  - ALWAYS fail-soft: any error, non-200, or timeout returns null. Depth must
 *    never block or meaningfully slow the magic-moment diagnosis — it runs
 *    concurrently with the DB context loads and is bounded by DEPTH_TIMEOUT_MS
 *    (a cold Modal start just skips depth for that one call; next call is warm).
 *  - HONESTY: the injected text tells the model depth is approximate and must
 *    NOT be used for sub-mm tire tread (that still routes to the penny test).
 */

const DEPTH_URL = process.env.DEPTH_ENDPOINT_URL;
const DEPTH_TOKEN = process.env.DEPTH_TOKEN;
const DEPTH_TIMEOUT_MS = Number(process.env.DEPTH_TIMEOUT_MS || 7000);

export function depthEnabled(): boolean {
  return !!DEPTH_URL;
}

interface DepthRegion { name: string; median: number; min: number; max: number; unit: string }
interface DepthResponse {
  ok?: boolean;
  unit?: 'm' | 'relative';
  overall?: { nearest: number; farthest: number; median: number };
  regions?: DepthRegion[];
}

/**
 * Returns a short grounding string to append to the vision prompt, or null if
 * depth is disabled / failed / timed out. `regions` (optional) are bboxes to
 * measure — later these come from SAM 3 masks; for now callers can omit them.
 */
export async function getDepthContext(
  imageBuffer: Buffer,
  opts?: { focalPx?: number; regions?: Array<{ name: string; x1: number; y1: number; x2: number; y2: number }> },
): Promise<string | null> {
  if (!DEPTH_URL) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEPTH_TIMEOUT_MS);
  try {
    const res = await fetch(DEPTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageBuffer.toString('base64'),
        token: DEPTH_TOKEN,
        focalPx: opts?.focalPx,
        regions: opts?.regions,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const d = (await res.json()) as DepthResponse;
    if (!d || !d.overall) return null;

    const metric = d.unit === 'm';
    const unitLabel = metric ? 'meters (approx, monocular metric depth)' : 'relative depth (ratios only — NOT real distance)';
    const o = d.overall;
    const lines: string[] = [
      `MEASURED GEOMETRY (depth model, ${unitLabel}): nearest surface ≈ ${o.nearest}, median ≈ ${o.median}, farthest ≈ ${o.farthest}.`,
    ];
    if (d.regions && d.regions.length) {
      for (const r of d.regions) {
        lines.push(`  • ${r.name}: median ≈ ${r.median}, range ${r.min}–${r.max} ${r.unit === 'm' ? 'm' : '(rel)'}.`);
      }
    }
    lines.push(
      'Use this ONLY to sanity-check macro shape (is a surface bulged/dented/flat, the size of a gap/dent/puddle, ride height, relative closeness). It is approximate. DO NOT infer sub-millimeter tire tread depth from it — tread still routes to the penny/quarter test. If geometry contradicts an apparent defect, prefer the conservative read.',
    );
    return lines.join('\n');
  } catch {
    return null; // timeout / network / parse — fail soft, no depth this call
  } finally {
    clearTimeout(timer);
  }
}
