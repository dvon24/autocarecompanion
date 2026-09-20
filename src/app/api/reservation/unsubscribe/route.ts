import { createReservationUnsubscribeHandler } from '@/lib/reservation-unsubscribe-handler';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
function tokenFrom(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  return token && /^[a-zA-Z0-9_-]{16,256}$/.test(token) ? token : null;
}
export async function GET(request: Request) {
  const token = tokenFrom(request);
  if (!token) return new Response('This link is incomplete.', { status: 400 });
  return new Response(`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Reservation email preferences</title></head><body style="font:16px Arial;background:#FAF7F0;color:#0B1220;padding:32px"><main style="max-width:440px;margin:auto"><h1>Stop reservation emails?</h1><p>Your account and subscription are unchanged.</p><form method="post" action="/api/reservation/unsubscribe?token=${encodeURIComponent(token)}"><button style="padding:12px 18px;border:0;border-radius:9px;background:#2563EB;color:white">Stop reservation emails</button></form></main></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
export const POST = createReservationUnsubscribeHandler(prisma);
