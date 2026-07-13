import { NextResponse } from 'next/server';
import { requireFounder } from '@/lib/admin-guard';
import prisma from '@/lib/db';
import { affiliateTrackLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(request);
  const rateCheck = affiliateTrackLimiter.check(ip);
  if (!rateCheck.success) {
    return rateLimitResponse(rateCheck.reset);
  }

  try {
    const { issueId, recommendationIndex, link, partBrand, partName } = await request.json();

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

    // Update clickCount in the communityRecommendations JSON
    const issue = await prisma.knownIssue.findUnique({ where: { id: issueId } });
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const recs = issue.communityRecommendations as any[];
    if (recs && recs[recommendationIndex]) {
      if (recs[recommendationIndex].clickCount === undefined) {
        recs[recommendationIndex].clickCount = 0;
      }
      recs[recommendationIndex].clickCount++;

      await prisma.knownIssue.update({
        where: { id: issueId },
        data: { communityRecommendations: recs },
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

    return NextResponse.json({
      totalClicks: clicks.length,
      uniqueParts: Object.keys(partStats).length,
      topParts,
      byBrand,
      byVendor,
      recentClicks: clicks.slice(0, 10).map(c => ({
        timestamp: c.clickedAt.toISOString(),
        issueId: c.knownIssueId,
        partBrand: c.partBrand,
        partName: c.partName,
        link: c.link,
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
