import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { issueId, recommendationIndex, link, partBrand, partName } = await request.json();

    // Update click count in known-issues.json
    const dataPath = path.join(process.cwd(), 'src', 'data', 'known-issues.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const issueIndex = data.issues.findIndex((i: any) => i.id === issueId);
    if (issueIndex !== -1) {
      const recommendations = data.issues[issueIndex].communityRecommendations;
      if (recommendations && recommendations[recommendationIndex]) {
        // Increment click count
        if (recommendations[recommendationIndex].clickCount === undefined) {
          recommendations[recommendationIndex].clickCount = 0;
        }
        recommendations[recommendationIndex].clickCount++;

        // Save updated data
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

        // Also log to affiliate tracking file for analytics
        const logPath = path.join(process.cwd(), 'data', 'affiliate-clicks.log');
        const logEntry = {
          timestamp: new Date().toISOString(),
          issueId,
          partBrand,
          partName,
          link,
          clickCount: recommendations[recommendationIndex].clickCount
        };

        // Ensure data directory exists
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        // Append to log file
        fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n', 'utf-8');

        return NextResponse.json({
          success: true,
          clickCount: recommendations[recommendationIndex].clickCount
        });
      }
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

// GET endpoint to retrieve affiliate stats
export async function GET() {
  try {
    const logPath = path.join(process.cwd(), 'data', 'affiliate-clicks.log');

    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ clicks: [], totalClicks: 0 });
    }

    const logContent = fs.readFileSync(logPath, 'utf-8');
    const clicks = logContent
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    // Aggregate stats
    const partStats: Record<string, { brand: string; name: string; clicks: number; lastClicked: string }> = {};

    clicks.forEach(click => {
      const key = `${click.partBrand}-${click.partName}`;
      if (!partStats[key]) {
        partStats[key] = {
          brand: click.partBrand,
          name: click.partName,
          clicks: 0,
          lastClicked: click.timestamp
        };
      }
      partStats[key].clicks++;
      if (click.timestamp > partStats[key].lastClicked) {
        partStats[key].lastClicked = click.timestamp;
      }
    });

    const topParts = Object.values(partStats)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20);

    return NextResponse.json({
      totalClicks: clicks.length,
      uniqueParts: Object.keys(partStats).length,
      topParts,
      recentClicks: clicks.slice(-10).reverse()
    });
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
