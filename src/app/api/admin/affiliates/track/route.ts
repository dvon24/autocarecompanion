import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
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

    return NextResponse.json({
      totalClicks: clicks.length,
      uniqueParts: Object.keys(partStats).length,
      topParts,
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
