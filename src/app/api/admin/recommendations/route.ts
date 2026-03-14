import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const issues = await prisma.knownIssue.findMany({
      where: { status: 'published' },
    });

    const needsReview = issues
      .filter(issue => {
        const recs = issue.communityRecommendations as any[];
        return recs?.some((r: any) => r.needsReview === true);
      })
      .map(issue => ({
        id: issue.id,
        vehicle: `${issue.years[0]}-${issue.years[issue.years.length - 1]} ${issue.make} ${issue.model}`,
        title: issue.title,
        category: issue.category,
        recommendations: (issue.communityRecommendations as any[]).filter((r: any) => r.needsReview === true),
        totalRecommendations: (issue.communityRecommendations as any[]).length,
      }));

    return NextResponse.json({ issues: needsReview, total: needsReview.length });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { issueId } = await request.json();

    const issue = await prisma.knownIssue.findUnique({ where: { id: issueId } });
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Remove needsReview flag from all recommendations
    const recs = (issue.communityRecommendations as any[]).map(({ needsReview, ...rest }: any) => rest);
    await prisma.knownIssue.update({
      where: { id: issueId },
      data: { communityRecommendations: recs },
    });

    return NextResponse.json({ success: true, issueId });
  } catch (error) {
    console.error('Error approving recommendations:', error);
    return NextResponse.json({ error: 'Failed to approve recommendations' }, { status: 500 });
  }
}
