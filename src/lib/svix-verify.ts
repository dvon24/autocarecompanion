import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Svix webhook signature verification.
 *
 * Resend signs its webhooks with Svix. This is implemented directly rather than
 * pulling in the `svix` package — the scheme is a single HMAC-SHA256 over
 * `{id}.{timestamp}.{body}` and the dependency is not worth it for one route.
 *
 * Lives in its own module (not inside the route file) so it is unit-testable:
 * Next.js route files may only export handlers and known config values, so an
 * exported helper there would break the build.
 */

const TOLERANCE_SECONDS = 5 * 60;

export interface SvixHeaders {
  id: string;
  timestamp: string;
  signature: string;
}

/**
 * @param secret  the `whsec_...` signing secret
 * @param headers svix-id / svix-timestamp / svix-signature
 * @param body    the RAW request body — re-serializing parsed JSON changes the
 *                bytes and breaks the HMAC
 * @param nowMs   injectable clock, for tests
 */
export function verifySvixSignature(
  secret: string,
  headers: SvixHeaders,
  body: string,
  nowMs: number = Date.now(),
): boolean {
  const timestamp = Number(headers.timestamp);
  if (!Number.isFinite(timestamp)) return false;

  // Reject replays of a captured request outside a 5-minute window.
  if (Math.abs(nowMs / 1000 - timestamp) > TOLERANCE_SECONDS) return false;

  // whsec_<base64>. The prefix is a label, not key material.
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key)
    .update(`${headers.id}.${headers.timestamp}.${body}`)
    .digest();

  // The header carries a SPACE-SEPARATED list of `v1,<base64>` pairs — there
  // can be several during a secret rotation, so any one match is a pass.
  for (const part of headers.signature.split(' ')) {
    const [version, value] = part.split(',');
    if (version !== 'v1' || !value) continue;
    let given: Buffer;
    try {
      given = Buffer.from(value, 'base64');
    } catch {
      continue;
    }
    if (given.length === expected.length && timingSafeEqual(given, expected)) {
      return true;
    }
  }
  return false;
}
