/**
 * Google Cloud Vision — Web Detection grounding for the identify flow.
 *
 * This is the engine behind "Google Lens": given the tapped part crop, it
 * returns a BEST-GUESS label + the web entities / visually-similar real
 * listings Google matched. We feed that into Fable 5 as a strong hint so the
 * model's ID is anchored to what Google's visual index actually recognizes —
 * the thing that beat our stack in Devon's Google-Lens test.
 *
 * Ships DARK like depth.ts / sam.ts: inert unless GOOGLE_VISION_API_KEY is set.
 * Always fail-soft (any error / non-200 / timeout → null); it must never block
 * or meaningfully slow the identify round-trip.
 *
 * Setup (Devon, one-time):
 *   1. Google Cloud Console → create/select a project.
 *   2. Enable the "Cloud Vision API".
 *   3. APIs & Services → Credentials → Create credentials → API key
 *      (optionally restrict it to the Vision API).
 *   4. Set GOOGLE_VISION_API_KEY in Vercel, redeploy.
 */

const GV_KEY = process.env.GOOGLE_VISION_API_KEY;
const GV_TIMEOUT_MS = Number(process.env.GOOGLE_VISION_TIMEOUT_MS || 6000);
const GV_URL = 'https://vision.googleapis.com/v1/images:annotate';

export function googleVisionEnabled(): boolean {
  return !!GV_KEY;
}

export interface WebDetectResult {
  /** Google's single "best guess" for what the image shows. */
  bestGuess?: string;
  /** Top matched web entities (things Google recognizes in the image). */
  entities: string[];
}

interface GVWebEntity { entityId?: string; score?: number; description?: string }
interface GVResponse {
  responses?: Array<{
    webDetection?: {
      bestGuessLabels?: Array<{ label?: string; languageCode?: string }>;
      webEntities?: GVWebEntity[];
    };
  }>;
}

/**
 * Run Web Detection on a base64 JPEG/PNG (no data-url prefix). Returns the
 * best-guess label + top entities, or null when disabled / empty / failed.
 */
export async function webDetect(base64: string): Promise<WebDetectResult | null> {
  if (!GV_KEY) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GV_TIMEOUT_MS);
  try {
    const res = await fetch(`${GV_URL}?key=${GV_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{ image: { content: base64 }, features: [{ type: 'WEB_DETECTION', maxResults: 10 }] }],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as GVResponse;
    const wd = data?.responses?.[0]?.webDetection;
    if (!wd) return null;
    const bestGuess = wd.bestGuessLabels?.[0]?.label?.trim() || undefined;
    const entities = (wd.webEntities || [])
      .filter((e) => e.description && (e.score ?? 0) > 0.3)
      .slice(0, 6)
      .map((e) => e.description!.trim())
      .filter(Boolean);
    if (!bestGuess && entities.length === 0) return null;
    return { bestGuess, entities };
  } catch {
    return null; // timeout / network / parse — fail soft
  } finally {
    clearTimeout(timer);
  }
}

/** Build the grounding block we append to the model prompt. */
export function webDetectPromptBlock(r: WebDetectResult): string {
  const bits: string[] = [];
  if (r.bestGuess) bits.push(`best guess: "${r.bestGuess}"`);
  if (r.entities.length) bits.push(`visually similar to: ${r.entities.join(', ')}`);
  return `\n\nGOOGLE VISUAL MATCH (from Google's image index — a STRONG hint, the same engine as Google Lens; reconcile it with the image + catalog, but weight it heavily when it names a specific part or vehicle): ${bits.join('; ')}.`;
}
