import { NextResponse } from 'next/server';
import { requireFounder } from '@/lib/admin-guard';
import prisma from '@/lib/db';
import { affiliateTrackLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import type { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(request);
  const rateCheck = affiliateTrackLimiter.check(ip);
  if (!rateCheck.success) {
    return rateLimitResponse(rateCheck.reset);
  }

  try {
    const { issueId, recommendationIndex, recommendationSource, link, partBrand, partName } = await request.json();

    // Record click in AffiliateClick table
    await prisma.affiliateClick.create({
      data: {
        knownIssueId: issueId,
        recommendationIdx: recommendationIndex,
        partBrand,
        partName,
        link,
      },
    });

    // recommendationIndex is reused by fixParts, contextual tools, and parts
    // finder links. Only a community click may mutate the same-index community
    // entry; the old unconditional write attributed fixPart clicks to unrelated
    // recommendations. AffiliateClick above remains the source of truth for all
    // outbound clicks.
    if (recommendationSource !== 'community') {
      return NextResponse.json({ success: true });
    }

    // Update clickCount in the explicitly identified community recommendation.
    const issue = await prisma.knownIssue.findUnique({ where: { id: issueId } });
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const recs = issue.communityRecommendations as Array<Record<string, unknown>>;
    // This endpoint is deliberately unauthenticated (public click tracker), so
    // recommendationIndex is attacker-controlled. Require a real array index —
    // a string like "__proto__" would otherwise index the prototype chain.
    if (
      Array.isArray(recs) &&
      Number.isInteger(recommendationIndex) &&
      recommendationIndex >= 0 &&
      recommendationIndex < recs.length
    ) {
      const current = typeof recs[recommendationIndex].clickCount === 'number' ? recs[recommendationIndex].clickCount : 0;
      recs[recommendationIndex] = { ...recs[recommendationIndex], clickCount:current + 1 };

      await prisma.knownIssue.update({
        where: { id: issueId },
        data: { communityRecommendations: recs as Prisma.InputJsonValue },
      });

      return NextResponse.json({
        success: true,
        clickCount: recs[recommendationIndex].clickCount,
      });
    }

    return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const denied = await requireFounder();
  if (denied) return denied;
  try {
    const clicks = await prisma.affiliateClick.findMany({
      orderBy: { clickedAt: 'desc' },
      take: 1000,
    });
    const articleIssueIds = [...new Set(clicks.map((click) => click.knownIssueId).filter((id) => id && !/^(ki:|vision:|parts-finder-)/.test(id)))];
    const issueRows = articleIssueIds.length ? await prisma.knownIssue.findMany({
      where: { id: { in: articleIssueIds }, status: 'published' }, select: { id: true, make: true, model: true },
    }) : [];
    const slug = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const issueHrefById = new Map(issueRows.map((issue) => [issue.id, `/known-issues/${slug(`${issue.make} ${issue.model}`)}#${issue.id}`]));

    // Aggregate stats
    const partStats: Record<string, { brand: string; name: string; clicks: number; lastClicked: string }> = {};

    clicks.forEach(click => {
      const key = `${click.partBrand || 'unknown'}-${click.partName || 'unknown'}`;
      if (!partStats[key]) {
        partStats[key] = {
          brand: click.partBrand || 'unknown',
          name: click.partName || 'unknown',
          clicks: 0,
          lastClicked: click.clickedAt.toISOString(),
        };
      }
      partStats[key].clicks++;
      const ts = click.clickedAt.toISOString();
      if (ts > partStats[key].lastClicked) {
        partStats[key].lastClicked = ts;
      }
    });

    const topParts = Object.values(partStats)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20);

    // By BRAND — "how many clicks did we send toward DiabloSport / Mopar / etc."
    // (partner-reporting numbers Devon can show brands).
    const brandCounts: Record<string, number> = {};
    // By VENDOR/DESTINATION — parsed from the link host (Amazon, eBay, RockAuto…).
    const vendorCounts: Record<string, number> = {};
    const vendorOf = (link: string | null): string => {
      if (!link) return 'unknown';
      try {
        const h = new URL(link).hostname.replace(/^www\./, '');
        const map: Record<string, string> = {
          'amazon.com': 'Amazon', 'ebay.com': 'eBay', 'rockauto.com': 'RockAuto',
          'store.mopar.com': 'Mopar eStore', 'moparpartsgiant.com': 'MoparPartsGiant',
          'summitracing.com': 'Summit Racing', 'americanmuscle.com': 'American Muscle',
          'autozone.com': 'AutoZone', 'oreillyauto.com': "O'Reilly", 'walmart.com': 'Walmart',
        };
        return map[h] || h;
      } catch { return 'unknown'; }
    };
    for (const c of clicks) {
      const brand = (c.partBrand || '').trim() || 'Unbranded / generic';
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      const vendor = vendorOf(c.link);
      vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1;
    }
    const byBrand = Object.entries(brandCounts).map(([brand, clicks]) => ({ brand, clicks })).sort((a, b) => b.clicks - a.clicks);
    const byVendor = Object.entries(vendorCounts).map(([vendor, clicks]) => ({ vendor, clicks })).sort((a, b) => b.clicks - a.clicks);

    // Did the click land on an actual PRODUCT page (deep link) or a SEARCH page?
    // This is the conversion signal: search-link clicks are the ones to fix.
    const isDeepLink = (link: string | null): boolean => {
      if (!link) return false;
      if (/[?&](k|_nkw|q|searchTerm|text)=/i.test(link) || /\/s\?|\/sch\/|\/search/i.test(link)) return false;
      return /\/(dp|gp\/product|itm|ipd|moreinfo|product|products|oem-parts)\//i.test(link) || /partnum=/i.test(link);
    };

    // FIX LIST: known issues that got clicks on a SEARCH link (not deep) — these
    // are the pages to upgrade to a verified /dp/ deep link (and whose interested
    // clickers could be notified once fixed). Grouped by issue, most-clicked first.
    const needsMap: Record<string, { issueId: string; issueHref: string | null; searchClicks: number; lastPart: string; lastClicked: string }> = {};
    for (const c of clicks) {
      if (isDeepLink(c.link)) continue;
      const id = c.knownIssueId || 'unknown';
      if (!needsMap[id]) needsMap[id] = { issueId: id, issueHref: issueHrefById.get(id) ?? null, searchClicks: 0, lastPart: c.partName || '', lastClicked: c.clickedAt.toISOString() };
      needsMap[id].searchClicks++;
      const ts = c.clickedAt.toISOString();
      if (ts > needsMap[id].lastClicked) { needsMap[id].lastClicked = ts; needsMap[id].lastPart = c.partName || needsMap[id].lastPart; }
    }
    const needsDeepLink = Object.values(needsMap).sort((a, b) => b.searchClicks - a.searchClicks).slice(0, 30);
    const deepCount = clicks.filter((c) => isDeepLink(c.link)).length;

    return NextResponse.json({
      totalClicks: clicks.length,
      uniqueParts: Object.keys(partStats).length,
      deepLinkedClicks: deepCount,
      searchLinkedClicks: clicks.length - deepCount,
      topParts,
      byBrand,
      byVendor,
      needsDeepLink,
      recentClicks: clicks.slice(0, 25).map(c => ({
        timestamp: c.clickedAt.toISOString(),
        issueId: c.knownIssueId,
        issueHref: issueHrefById.get(c.knownIssueId) ?? null,
        partBrand: c.partBrand,
        partName: c.partName,
        link: c.link,
        deepLinked: isDeepLink(c.link),
      })),
    });
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
