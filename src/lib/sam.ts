/**
 * SAM segmentation hook for the tap/box "identify this part" flow.
 *
 * The WHERE stage of the three-stage vision engine
 * (WHERE = SAM / WHAT = VLM on the crop / WHICH = catalog match).
 *
 * SAM turns a user's POINT or BOX prompt on the photo into a tight
 * object mask — "the user pointed at this; here is the exact thing under
 * their finger, whole-object, regardless of WHERE on the part they
 * tapped." That object-level segmentation is what makes tapping the top
 * vs the bottom of the same caliper return the same region.
 *
 * SAM does NOT identify the part (that's the VLM) and does NOT resolve a
 * part number (that's the catalog). Its only job is the pixel region.
 *
 * Ships DARK, exactly like depth.ts:
 *  - INERT unless SAM_ENDPOINT_URL is set. `samEnabled()` is false and
 *    `refineRegion` returns null, so callers fall back to the raw
 *    user selection (a padded box around the tap, or the drag box) —
 *    the feature is fully usable before any SAM endpoint exists; SAM
 *    only TIGHTENS the region once deployed.
 *  - ALWAYS fail-soft: any error / non-200 / timeout returns null. SAM
 *    must never block or meaningfully slow the identify round-trip.
 *
 * Phase 2 note: the interactive, instant-feel version moves the SAM mask
 * DECODER in-browser (ONNX/WebGPU, encode-once/decode-per-tap). This
 * server hook remains as the alternative / batch path and as the place a
 * hosted SAM endpoint (Modal/Replicate/fal) plugs in.
 */

const SAM_URL = process.env.SAM_ENDPOINT_URL;
// Reuse the existing DEPTH_TOKEN when a dedicated SAM_TOKEN isn't set — the
// Modal SAM service (ml/sam/app.py) shares the same au7o-depth-token secret,
// so you only need to set SAM_ENDPOINT_URL in Vercel to go live.
const SAM_TOKEN = process.env.SAM_TOKEN || process.env.DEPTH_TOKEN;
// 9s default: a WARM Modal T4 predicts in ~0.3-0.8s, but the first tap after
// the container idles down (scaledown 4min) spends several seconds loading SAM
// weights onto the GPU. 6s clipped those cold taps → silent box fallback; 9s
// lets the mask land on the first tap too. Still well under the identify wait.
const SAM_TIMEOUT_MS = Number(process.env.SAM_TIMEOUT_MS || 9000);

/** Normalized selection prompt from the client, in PERCENT of image
 *  width/height (0-100, origin top-left) so it is resolution-agnostic. */
export type SamPrompt =
  | { kind: 'point'; x: number; y: number }
  | { kind: 'box'; x: number; y: number; w: number; h: number };

/** A normalized bounding box (0-100, origin top-left). */
export interface SamBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function samEnabled(): boolean {
  return !!SAM_URL;
}

interface SamResponse {
  ok?: boolean;
  /** Tightened bbox in percent (0-100). */
  box?: SamBox;
  /** Optional mask polygon (percent points) for a future exact overlay. */
  polygon?: Array<{ x: number; y: number }>;
  /** SAM's own mask confidence 0..1. */
  score?: number;
}

/**
 * Ask a hosted SAM endpoint to tighten a user point/box into an
 * object-level bbox. Returns null when SAM is disabled, errors, or times
 * out — the caller then uses the user's raw selection unchanged.
 *
 * The endpoint contract (kept identical to depth.ts's shape):
 *   POST { image: <base64>, token, prompt: SamPrompt }
 *   → { ok, box:{x,y,w,h} (percent), polygon?, score? }
 */
export async function refineRegion(
  imageBuffer: Buffer,
  prompt: SamPrompt,
): Promise<{ box: SamBox; score?: number; polygon?: Array<{ x: number; y: number }> } | null> {
  if (!SAM_URL) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SAM_TIMEOUT_MS);
  try {
    const res = await fetch(SAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageBuffer.toString('base64'),
        token: SAM_TOKEN,
        prompt,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const d = (await res.json()) as SamResponse;
    if (!d || !d.box) return null;
    const b = d.box;
    // Clamp to the frame — never trust an out-of-bounds mask.
    const box: SamBox = {
      x: clampPct(b.x),
      y: clampPct(b.y),
      w: clampPct(b.w),
      h: clampPct(b.h),
    };
    if (box.w <= 0 || box.h <= 0) return null;
    return { box, score: typeof d.score === 'number' ? d.score : undefined, polygon: d.polygon };
  } catch {
    return null; // timeout / network / parse — fail soft, no SAM this call
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fallback used when SAM is disabled or fails: turn a bare POINT into a
 * reasonable square box around it (a box selection passes through
 * unchanged). Percent units. The default 24% square is a sensible
 * "one component" crop for a phone-distance part photo; it is clamped so
 * it never spills past the image edges.
 */
export function promptToBox(prompt: SamPrompt, squarePct = 24): SamBox {
  if (prompt.kind === 'box') {
    return {
      x: clampPct(prompt.x),
      y: clampPct(prompt.y),
      w: clampPct(prompt.w),
      h: clampPct(prompt.h),
    };
  }
  const half = squarePct / 2;
  let x = prompt.x - half;
  let y = prompt.y - half;
  // Shift the box inside the frame rather than clipping it, so the tapped
  // point stays covered even near an edge.
  x = Math.max(0, Math.min(x, 100 - squarePct));
  y = Math.max(0, Math.min(y, 100 - squarePct));
  return { x, y, w: squarePct, h: squarePct };
}

function clampPct(n: number): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
