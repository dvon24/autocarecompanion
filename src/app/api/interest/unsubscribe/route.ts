import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/interest/unsubscribe?token=... — one-click opt-out for the weekly
 * "new findings for your vehicle" digest (CAN-SPAM compliant: the link in every
 * email lands here and immediately suppresses all future sends).
 *
 * Idempotent + token-only (no auth, no email in the URL) so it works straight
 * from an email client. Always returns a friendly confirmation page, even for
 * an unknown/expired token, so we never leak whether an address is on the list.
 */
function page(message: string): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Unsubscribed — au7o</title><style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#F7F6F2;color:#0B1220;display:flex;min-height:100vh;align-items:center;justify-content:center}.card{max-width:420px;margin:24px;background:#fff;border:1px solid #E3DFD4;border-radius:16px;padding:28px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,0.06)}h1{font-size:18px;margin:0 0 8px}p{font-size:14px;color:#475569;line-height:1.5;margin:0 0 18px}a{display:inline-block;background:#0B1220;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-size:14px;font-weight:600}</style></head><body><div class="card"><div style="font-size:26px;margin-bottom:6px">🔧</div><h1>${message}</h1><p>You won't get any more vehicle-finding emails from au7o. Changed your mind? You can re-subscribe any time from a vehicle's known-issues page.</p><a href="https://au7o.io/known-issues">Browse known issues</a></div></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return page("That link looks incomplete.");
  try {
    const row = await prisma.interestEmail.findUnique({
      where: { unsubscribeToken: token },
      select: { email: true, context: true },
    });
    if (row) {
      // Legacy form submissions could create duplicate rows. One click must opt
      // the address out of this vehicle alert completely, not merely suppress
      // the particular row whose token happened to be in the email.
      await prisma.interestEmail.updateMany({
        where: {
          email: row.email,
          context: row.context,
          unsubscribedAt: null,
        },
        data: { unsubscribedAt: new Date() },
      });
    }
  } catch (e) {
    console.error('[interest/unsubscribe]', e instanceof Error ? e.message : e);
    // Still show success — never expose internal state / list membership.
  }
  return page("You're unsubscribed.");
}
