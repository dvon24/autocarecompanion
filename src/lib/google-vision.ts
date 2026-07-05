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
  /** OCR text read off the image — badges ("ZL1", "SRT", "AMG"), stamped/
   *  cast part numbers, warning labels. The single HIGHEST-signal feature on
   *  most car parts; injected into the prompt as an explicit hard hint so the
   *  model reads the badge instead of guessing from silhouette. */
  text?: string;
}

interface GVWebEntity { entityId?: string; score?: number; description?: string }
interface GVResponse {
  responses?: Array<{
    webDetection?: {
      bestGuessLabels?: Array<{ label?: string; languageCode?: string }>;
      webEntities?: GVWebEntity[];
    };
    // TEXT_DETECTION: textAnnotations[0].description is the full aggregated
    // OCR string for the image.
    textAnnotations?: Array<{ description?: string }>;
    fullTextAnnotation?: { text?: string };
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
        requests: [{
          image: { content: base64 },
          // WEB_DETECTION = "what is this" (Lens engine); TEXT_DETECTION = OCR
          // the badges/part-numbers, the single highest-signal ID feature.
          features: [{ type: 'WEB_DETECTION', maxResults: 10 }, { type: 'TEXT_DETECTION', maxResults: 1 }],
        }],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as GVResponse;
    const resp = data?.responses?.[0];
    const wd = resp?.webDetection;
    const bestGuess = wd?.bestGuessLabels?.[0]?.label?.trim() || undefined;
    const entities = (wd?.webEntities || [])
      .filter((e) => e.description && (e.score ?? 0) > 0.3)
      .slice(0, 6)
      .map((e) => e.description!.trim())
      .filter(Boolean);
    // OCR: collapse whitespace/newlines, cap length — a badge is a few chars.
    const rawText = resp?.textAnnotations?.[0]?.description || resp?.fullTextAnnotation?.text || '';
    const text = rawText.replace(/\s+/g, ' ').trim().slice(0, 160) || undefined;
    if (!bestGuess && entities.length === 0 && !text) return null;
    return { bestGuess, entities, text };
  } catch {
    return null; // timeout / network / parse — fail soft
  } finally {
    clearTimeout(timer);
  }
}

/** Build the grounding block we append to the model prompt. */
export function webDetectPromptBlock(r: WebDetectResult): string {
  let block = '';
  // OCR text is the single highest-signal feature — a badge like "ZL1" or a
  // stamped part number pins the make/model/part harder than any silhouette.
  // Surface it FIRST and as a hard instruction to read it.
  if (r.text) {
    block += `\n\nTEXT READ ON THE PART/VEHICLE (OCR — badges, stamps, part numbers): "${r.text}". This is the STRONGEST identifying signal — a badge ("ZL1", "SRT", "AMG") names the exact trim/vehicle; a stamped/cast number can be the part number. Read it and let it drive the make/model/trim identification, even over the garage vehicle.`;
  }
  const bits: string[] = [];
  if (r.bestGuess) bits.push(`best guess: "${r.bestGuess}"`);
  if (r.entities.length) bits.push(`visually similar to: ${r.entities.join(', ')}`);
  if (bits.length) {
    block += `\n\nGOOGLE VISUAL MATCH (from Google's image index — a STRONG hint, the same engine as Google Lens; reconcile it with the image + catalog, but weight it heavily when it names a specific part or vehicle): ${bits.join('; ')}.`;
  }
  return block;
}
