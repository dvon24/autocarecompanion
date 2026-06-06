import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * POST /api/diag — diagnostic sink for client-side upload traces.
 *
 * The body is logged as a single JSON line to Vercel's function logs
 * (grep `tag":"diag"` to find these). Returns 204 with no body.
 *
 * No auth required — diagnostics are low-volume, no sensitive data
 * leaves the client (just timing + phase names + a build hash). If
 * spam becomes a problem, gate behind the IP rate limiter.
 */
export async function POST(request: NextRequest) {
  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const safe = sanitize(payload);
    // Single-line JSON makes log grep + Datadog ingest cleaner.
    console.log(JSON.stringify({ tag: 'diag', ...safe }));
  } catch {
    /* swallow — diag must never 5xx */
  }

  return new NextResponse(null, { status: 204 });
}

/**
 * Strip any field whose key contains 'token', 'key', 'secret', or
 * 'password' before logging. Defense-in-depth against a client
 * accidentally including a sensitive value in extra context.
 */
function sanitize(p: unknown): Record<string, unknown> {
  if (!p || typeof p !== 'object') return { value: String(p) };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
    if (/token|key|secret|password|cookie/i.test(k)) continue;
    if (typeof v === 'string' && v.length > 4000) {
      out[k] = v.slice(0, 4000) + '...';
    } else {
      out[k] = v;
    }
  }
  return out;
}
