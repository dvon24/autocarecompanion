import { NextResponse } from 'next/server';
import { requireFounder } from '@/lib/admin-guard';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '@/lib/db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const denied = await requireFounder();
  if (denied) return denied;
  try {
    const { issueId, title, vehicle, category, description } = await request.json();

    // Use Claude with web search to find specific recommendations
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      tools: [
        {
          type: 'web_search_20241115' as any,
          name: 'web_search',
          max_uses: 10
        }
      ],
      messages: [
        {
          role: 'user',
          content: `Research specific, actionable recommendations for this car issue:

**Issue:** ${title}
**Vehicle:** ${vehicle}
**Category:** ${category}
**Description:** ${description}

Find SPECIFIC recommendations from forums, owner communities, and mechanics:

1. **Parts** - Find actual products owners recommend:
   - Exact brand names and part numbers
   - Amazon product links (for affiliate tracking)
   - Specific oil types, additives, aftermarket parts
   - Alternative part sources (RockAuto, OEM)
   - Example: "VCMuzzler II" not just "VCM disabler"

2. **Tips** - Find what owners ACTUALLY did:
   - Specific DIY procedures with tool names
   - Maintenance intervals owners found work
   - Preventive measures that worked
   - Example: "Change transmission fluid every 30k miles with Honda ATF 3.1" not "regular fluid changes"

3. **Warnings** - Find real cautionary advice:
   - Specific problems to avoid
   - Parts that don't work or fail
   - Safety concerns from real experiences

Search sources:
- Reddit (r/Honda, r/mechanics, r/Cartalk, vehicle-specific subs)
- Dedicated forums (HondaTech, RidgelineOwnersClub, etc.)
- NHTSA complaints for patterns
- Amazon reviews for specific parts
- YouTube mechanic channels

For each recommendation, provide:
- type: "part" | "tip" | "warning"
- content: Specific, actionable advice (1-2 sentences)
- partBrand: Exact brand if applicable
- partName: Exact product name if applicable
- partNumber: Part number if found
- amazonLink: Amazon product URL if found (with tag autocarecompanion-20)
- sourceUrl: Forum post or review URL if found

Return as JSON array of 5-10 highly specific recommendations.`,
        },
      ],
    });

    // Extract recommendations from Claude's response
    let recommendations: any[] = [];

    // Parse the response content
    const textContent = message.content.find((c: any) => c.type === 'text');
    if (textContent && 'text' in textContent) {
      const text = textContent.text;

      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          recommendations = JSON.parse(jsonMatch[0]);
        } catch {
          // If JSON parsing fails, create recommendations from text
          recommendations = parseRecommendationsFromText(text);
        }
      } else {
        recommendations = parseRecommendationsFromText(text);
      }
    }

    // Update known issue in database with new recommendations
    const issue = await prisma.knownIssue.findUnique({ where: { id: issueId } });
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const updatedRecs = recommendations.map(rec => ({
      ...rec,
      upvotes: 0,
      clickCount: rec.amazonLink ? 0 : undefined,
      needsReview: false,
    }));

    await prisma.knownIssue.update({
      where: { id: issueId },
      data: { communityRecommendations: updatedRecs },
    });

    return NextResponse.json({
      success: true,
      recommendationsCount: recommendations.length,
      issueId,
    });
  } catch (error) {
    console.error('Error researching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to research recommendations' },
      { status: 500 }
    );
  }
}

function parseRecommendationsFromText(text: string): any[] {
  const recommendations: any[] = [];

  // Parse recommendations from markdown-style text
  const lines = text.split('\n');
  let currentRec: any = null;

  for (const line of lines) {
    // Detect recommendation types
    if (line.match(/\*\*Part\*\*|Part:|1\./)) {
      if (currentRec) recommendations.push(currentRec);
      currentRec = { type: 'part' };
    } else if (line.match(/\*\*Tip\*\*|Tip:|2\./)) {
      if (currentRec) recommendations.push(currentRec);
      currentRec = { type: 'tip' };
    } else if (line.match(/\*\*Warning\*\*|Warning:|3\./)) {
      if (currentRec) recommendations.push(currentRec);
      currentRec = { type: 'warning' };
    }

    // Extract content
    if (currentRec && line.trim() && !line.match(/^\d+\.|Part:|Tip:|Warning:/)) {
      if (!currentRec.content) currentRec.content = '';
      currentRec.content += line.trim() + ' ';
    }

    // Extract brand/product names from content
    if (currentRec && currentRec.type === 'part') {
      const brandMatch = line.match(/brand:\s*([^,\n]+)/i);
      if (brandMatch) currentRec.partBrand = brandMatch[1].trim();

      const productMatch = line.match(/product:\s*([^,\n]+)/i);
      if (productMatch) currentRec.partName = productMatch[1].trim();

      const partNumMatch = line.match(/part\s*#?:\s*([A-Z0-9-]+)/i);
      if (partNumMatch) currentRec.partNumber = partNumMatch[1].trim();

      const amazonMatch = line.match(/amazon\.com[^\s)]+/i);
      if (amazonMatch) {
        currentRec.amazonLink = amazonMatch[0].includes('http')
          ? amazonMatch[0]
          : 'https://' + amazonMatch[0];
      }
    }
  }

  if (currentRec) recommendations.push(currentRec);

  // Clean up content
  return recommendations.map(rec => ({
    ...rec,
    content: rec.content?.trim().replace(/\s+/g, ' ') || 'No content',
  }));
}
