/**
 * Visual data flywheel — Phase 0.1 capture (metadata + PRIVATE image).
 *
 * Persists ONE DiagnosisSample row per CONSENTED, signed-in photo
 * diagnosis: structured low-PII metadata (YMMT, the diagnosed component,
 * a scrubbed diagnosis summary) plus — when consent allows AND blob
 * storage is configured — the downscaled photo itself in the PRIVATE
 * Vercel Blob store (server-side access only, purged on account
 * deletion BEFORE the row cascades). The client pipeline has already
 * re-encoded the image (EXIF metadata stripped as a canvas side-effect,
 * 1920px max edge). Without BLOB_READ_WRITE_TOKEN this degrades to the
 * Phase 0.0 metadata-only behavior.
 *
 * Consent model (three-state, by design — see the GDPR review):
 *   - perUploadConsent === '1'  → store (the user ticked the per-upload
 *                                 "help improve Au7o" box). Authoritative.
 *   - perUploadConsent === '0'  → DO NOT store, even if the account-level
 *                                 opt-in is on. An explicit decline for
 *                                 THIS upload wins (Art. 7(3) — withdrawal
 *                                 as easy as giving). This closes the
 *                                 OR-gate dark-pattern.
 *   - perUploadConsent === null → no per-upload signal was collected
 *                                 (e.g. a surface without the checkbox);
 *                                 fall back to the durable account opt-in
 *                                 (User.visualDatasetOptIn).
 *
 * Called fire-and-forget from /api/vision via `after()` so it never
 * blocks or fails the diagnosis response, and so opt-in status can
 * NEVER affect latency or result quality (keeps consent "freely
 * given", Art. 7(4)).
 */

import prisma from '@/lib/db';
import { storeDiagnosisPhoto } from '@/lib/photo-storage';

interface CapturePart {
  id?: string;
  role?: string;
  category?: string;
  name?: string;
  oemPartNumbers?: string[];
  confidence?: number;
  visibleInPhoto?: boolean;
}

interface CaptureResult {
  summary?: string;
  confidence?: number;
  difficulty?: string;
  estimatedTimeMinutes?: number | null;
  vehicleMatch?: string;
  primaryPartId?: string | null;
  identifiedParts?: CapturePart[];
  relatedIssues?: Array<{ id: string }>;
}

export interface CaptureInput {
  userId: string;
  /** '1' = opted in this upload, '0' = declined this upload, null = no signal. */
  perUploadConsent: '1' | '0' | null;
  vehicle: { year?: number; make?: string; model?: string; trim?: string } | null;
  mode: 'photo' | 'video';
  result: CaptureResult;
  /** Phase 0.1: the (client-downscaled, EXIF-stripped) photo bytes.
      Stored only when the consent gate passes; null keeps metadata-only. */
  image?: { buffer: Buffer; contentType: string } | null;
}

/**
 * Strip the highest-density free-text PII from a model-authored string
 * before it's persisted. We store a SCRUBBED `summary` and deliberately
 * EXCLUDE `vehicleMatchNote` entirely (it describes the visual cue the
 * model used to identify the vehicle — the field most likely to quote a
 * visible plate/VIN). User `caption` and `audioTranscript` are never
 * passed in. Structured part numbers live in their own field and are
 * NOT scrubbed (they're product data, not PII).
 */
function scrubPII(s: string): string {
  return s
    // 17-char VIN (no I/O/Q).
    .replace(/\b[A-HJ-NPR-Z0-9]{17}\b/gi, '[vin]')
    // email
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/gi, '[email]')
    // phone-ish run of digits/separators
    .replace(/(\+?\d[\d\s().-]{7,}\d)/g, '[phone]')
    .trim();
}

export async function captureDiagnosisSample(input: CaptureInput): Promise<void> {
  // ── Consent gate ─────────────────────────────────────────────────
  let consentSource: 'per_upload_checkbox' | 'account_toggle' | null = null;
  if (input.perUploadConsent === '1') {
    consentSource = 'per_upload_checkbox';
  } else if (input.perUploadConsent === '0') {
    return; // explicit per-upload decline wins
  } else {
    const u = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { visualDatasetOptIn: true },
    });
    if (u?.visualDatasetOptIn) consentSource = 'account_toggle';
  }
  if (!consentSource) return; // no consent → store nothing (the default)

  // ── Build the metadata row ───────────────────────────────────────
  const parts = Array.isArray(input.result.identifiedParts) ? input.result.identifiedParts : [];
  const primary = input.result.primaryPartId
    ? parts.find((p) => p.id === input.result.primaryPartId)
    : undefined;

  const confidence = typeof input.result.confidence === 'number' ? input.result.confidence : null;

  const diagnosisJson = {
    summary: scrubPII(String(input.result.summary || '')),
    confidence,
    difficulty: input.result.difficulty ?? null,
    estimatedTimeMinutes: input.result.estimatedTimeMinutes ?? null,
    parts: parts.slice(0, 12).map((p) => ({
      role: p.role ?? null,
      category: p.category ?? null,
      name: typeof p.name === 'string' ? p.name : null,
      oemPartNumbers: Array.isArray(p.oemPartNumbers) ? p.oemPartNumbers.slice(0, 6) : [],
      confidence: typeof p.confidence === 'number' ? p.confidence : null,
      visibleInPhoto: p.visibleInPhoto !== false,
    })),
    relatedIssueIds: Array.isArray(input.result.relatedIssues)
      ? input.result.relatedIssues.map((i) => i.id).filter(Boolean).slice(0, 8)
      : [],
  };

  const sample = await prisma.diagnosisSample.create({
    data: {
      userId: input.userId,
      year: input.vehicle?.year ?? null,
      make: input.vehicle?.make ?? null,
      model: input.vehicle?.model ?? null,
      trim: input.vehicle?.trim ?? null,
      mode: input.mode,
      primaryCategory: primary?.category ?? null,
      primaryPartName: primary?.name ?? null,
      dtcCodes: [],
      confidence,
      vehicleMatch: input.result.vehicleMatch ?? null,
      diagnosisJson,
      // Image fields start false/null; flipped below after a successful
      // blob upload so a failed upload can never leave a dangling key.
      imageStored: false,
      storageKey: null,
      cropApplied: false,
      exifStripped: true,
      consentSource,
      consentVersion: 'v1',
    },
  });

  // ── Phase 0.1: persist the photo itself (consent already granted) ──
  if (input.image?.buffer?.length) {
    const stored = await storeDiagnosisPhoto(sample.id, input.image.buffer, input.image.contentType);
    if (stored) {
      await prisma.diagnosisSample.update({
        where: { id: sample.id },
        data: {
          imageStored: true,
          storageKey: stored.key,
          contentType: input.image.contentType,
          byteSize: stored.byteSize,
        },
      });
    }
  }

  // Consent paper-trail (mirrors the /api/account/preferences audit log).
  console.log(
    `[visual-dataset] captured sample userId=${input.userId} source=${consentSource} category=${primary?.category ?? 'none'} at=${new Date().toISOString()}`,
  );
}
