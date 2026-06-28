import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';

export const runtime = 'nodejs';
export const maxDuration = 120; // SAM 3D inference + cold start

/**
 * POST /api/diagnose-3d — Pro/founder only. Turns the captured photo into a
 * complete 3D Gaussian splat via the SAM 3D Modal endpoint, stores the .ply on
 * Vercel Blob (public so the browser viewer can load it), and returns its URL
 * for the "View in 3D" overlay.
 *
 * Body: { image: "<base64 / data URL>" }  ->  { ok, splatUrl, bytes }
 *
 * Cost guards: Pro-gated (paying users only); Modal is scale-to-zero; the splat
 * is served from Blob's CDN (not Fast Origin Transfer). Cold SAM 3D calls can be
 * slow/reset — we surface a clean error so the client keeps the placeholder.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  const sub = session?.user?.subscriptionStatus;
  const allowed = isFounderEmail(session?.user?.email) || sub === 'active';
  if (!allowed) {
    return NextResponse.json({ error: 'pro_required' }, { status: 403 });
  }

  const endpoint = process.env.SAM3D_ENDPOINT_URL;
  const token = process.env.DEPTH_TOKEN;
  if (!endpoint) {
    return NextResponse.json({ error: 'sam3d_not_configured' }, { status: 503 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'blob_not_configured' }, { status: 503 });
  }

  let image: string | undefined;
  try {
    ({ image } = await request.json());
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  if (!image) return NextResponse.json({ error: 'image_required' }, { status: 400 });

  // Call SAM 3D (whole-frame mask fallback in the endpoint when none supplied).
  let ply: Buffer;
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, token, seed: 42 }),
      signal: AbortSignal.timeout(110_000),
    });
    if (!r.ok) {
      return NextResponse.json({ error: 'sam3d_failed', status: r.status }, { status: 502 });
    }
    const data = (await r.json()) as { ok?: boolean; ply_b64?: string };
    if (!data?.ok || !data.ply_b64) {
      return NextResponse.json({ error: 'sam3d_no_output' }, { status: 502 });
    }
    ply = Buffer.from(data.ply_b64, 'base64');
  } catch (e) {
    // cold-start reset / timeout / network — caller keeps the placeholder + can retry
    return NextResponse.json({ error: 'sam3d_unreachable', detail: e instanceof Error ? e.message : String(e) }, { status: 504 });
  }

  // Store the splat on Blob (public, unguessable). Splats are geometry only — no
  // PII (we never store the source image here).
  try {
    const blob = await put(`splats/${Date.now()}.ply`, ply, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'application/octet-stream',
    });
    return NextResponse.json({ ok: true, splatUrl: blob.url, bytes: ply.length });
  } catch (e) {
    return NextResponse.json({ error: 'blob_failed', detail: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
