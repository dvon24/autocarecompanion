import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * eBay Marketplace Account Deletion/Closure Notification endpoint.
 *
 * Required to ENABLE the eBay production keyset. eBay validates this endpoint
 * with a GET challenge handshake, then POSTs a notification whenever an eBay
 * user closes their account so apps can purge that user's data.
 *
 * au7o stores NO eBay user personal data — we only READ public marketplace
 * listings via the Browse API to resolve part numbers. So the POST handler has
 * nothing to delete; it just acknowledges (200). (If we ever store eBay user
 * data, purge it here keyed on the notification's userId.)
 *
 * Setup (Devon, one-time):
 *   1. Set EBAY_VERIFICATION_TOKEN in Vercel — a random string 32-80 chars,
 *      alphanumeric plus _ and - only (e.g. a UUID with dashes removed + more).
 *   2. In developer.ebay.com → Alerts & Notifications → Marketplace Account
 *      Deletion, register:
 *        Endpoint URL:        https://au7o.io/api/ebay/deletion-notification
 *        Verification token:  <the same EBAY_VERIFICATION_TOKEN value>
 *   3. eBay sends the GET challenge to this endpoint; it responds with the hash
 *      and the keyset activates.
 */
const VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN;
// MUST byte-for-byte match the Endpoint URL registered in the eBay portal.
const ENDPOINT_URL = process.env.EBAY_DELETION_ENDPOINT || 'https://au7o.io/api/ebay/deletion-notification';

// GET — eBay's validation challenge. Respond with
// SHA256(challengeCode + verificationToken + endpointUrl) as hex, JSON 200.
export async function GET(request: Request) {
  const challengeCode = new URL(request.url).searchParams.get('challenge_code');
  if (!challengeCode) return NextResponse.json({ error: 'missing_challenge_code' }, { status: 400 });
  if (!VERIFICATION_TOKEN) return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  const hash = crypto.createHash('sha256');
  hash.update(challengeCode);
  hash.update(VERIFICATION_TOKEN);
  hash.update(ENDPOINT_URL);
  const challengeResponse = hash.digest('hex');
  return NextResponse.json({ challengeResponse }, { status: 200, headers: { 'Content-Type': 'application/json' } });
}

// POST — actual account-deletion notifications. We store no eBay user data, so
// there's nothing to purge; acknowledge with 200 (eBay retries on non-2xx).
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const userId = body?.notification?.data?.userId || body?.notification?.data?.username || 'unknown';
    console.log('[ebay-deletion] account-closure notification received for', userId, '(no stored eBay data to purge)');
  } catch { /* ignore malformed */ }
  return new NextResponse(null, { status: 200 });
}
