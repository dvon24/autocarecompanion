import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'data', 'known-issues.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Find issues with recommendations needing review
    const needsReview = data.issues
      .filter((issue: any) =>
        issue.communityRecommendations?.some((rec: any) => rec.needsReview === true)
      )
      .map((issue: any) => ({
        id: issue.id,
        vehicle: `${issue.vehicleMatch.years[0]}-${issue.vehicleMatch.years[issue.vehicleMatch.years.length - 1]} ${issue.vehicleMatch.make} ${issue.vehicleMatch.model}`,
        title: issue.title,
        category: issue.category,
        recommendations: issue.communityRecommendations.filter((rec: any) => rec.needsReview === true),
        totalRecommendations: issue.communityRecommendations.length,
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

    const dataPath = path.join(process.cwd(), 'src', 'data', 'known-issues.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Find and update the issue
    const issueIndex = data.issues.findIndex((i: any) => i.id === issueId);
    if (issueIndex === -1) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Remove needsReview flag from all recommendations
    if (data.issues[issueIndex].communityRecommendations) {
      data.issues[issueIndex].communityRecommendations = data.issues[issueIndex].communityRecommendations.map((rec: any) => {
        const { needsReview, ...rest } = rec;
        return rest;
      });
    }

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ success: true, issueId });
  } catch (error) {
    console.error('Error approving recommendations:', error);
    return NextResponse.json({ error: 'Failed to approve recommendations' }, { status: 500 });
  }
}
