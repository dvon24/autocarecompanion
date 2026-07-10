import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { affiliateTrackLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * POST /api/vision/track-buy — log an outbound buy/shop click from au7o vision
 * (tap-to-identify + voice surface). Known-issues page clicks already log to
 * AffiliateClick via /api/admin/affiliates/track, but that path REQUIRES a
 * knownIssueId + a recommendation index, so the vision surface was silently
 * unattributed — every rotor/hose tap Devon shopped left no record (which is
 * also why "what happened last time" wasn't answerable).
 *
 * This writes the same AffiliateClick table so all buy clicks aggregate in one
 * place. knownIssueId is the matched issue id when there is one, else a
 * `vision:<category>` sentinel (the column is a plain String, no FK relation).
 * recommendationIdx = -1 marks a vision-surface click. Fire-and-forget, never
 * blocks the user; open to everyone (public affiliate telemetry, IP-limited).
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rc = affiliateTrackLimiter.check(ip);
  if (!rc.success) return rateLimitResponse(rc.reset);

  try {
    const body = await request.json().catch(() => ({}));
    const link = typeof body.link === 'string' ? body.link : '';
    if (!link) return NextResponse.json({ error: 'link required' }, { status: 400 });

    const category = typeof body.category === 'string' && body.category ? body.category : 'part';
    const issueId = typeof body.issueId === 'string' && body.issueId ? body.issueId : `vision:${category}`;
    const partBrand = typeof body.partBrand === 'string' && body.partBrand
      ? body.partBrand
      : (typeof body.vendor === 'string' ? body.vendor : null);
    const partName = typeof body.partName === 'string' ? body.partName.slice(0, 200) : null;

    await prisma.affiliateClick.create({
      data: {
        knownIssueId: issueId.slice(0, 120),
        recommendationIdx: -1, // vision-surface sentinel (not a known-issues rec index)
        partBrand: partBrand ? partBrand.slice(0, 80) : null,
        partName,
        link: link.slice(0, 1000),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Telemetry must never block a purchase — swallow and 200.
    return NextResponse.json({ ok: false });
  }
}
