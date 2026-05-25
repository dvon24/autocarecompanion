/**
 * Fix community recommendations that are missing affiliate URLs.
 * Adds Amazon affiliate links (tag: au7o-20) to any "part" recommendation
 * that has a searchQuery or partBrand but no affiliateUrl.
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const TAG = 'au7o-20';

async function fix() {
  const issues = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { id: true, make: true, model: true, communityRecommendations: true },
  });

  let fixed = 0;
  for (const issue of issues) {
    const recs = issue.communityRecommendations;
    if (recs === null || recs === undefined) continue;
    if (!Array.isArray(recs) || recs.length === 0) continue;

    let changed = false;
    const updated = recs.map(rec => {
      // Fix recs that have searchQuery but no affiliateUrl
      if (rec.searchQuery && !rec.affiliateUrl) {
        changed = true;
        return {
          type: rec.type || (rec.partBrand ? 'part' : 'tip'),
          content: rec.content || '',
          upvotes: rec.upvotes || 0,
          ...(rec.partBrand ? { partBrand: rec.partBrand } : {}),
          ...(rec.partName ? { partName: rec.partName } : {}),
          affiliateUrl: `https://www.amazon.com/s?k=${encodeURIComponent(rec.searchQuery)}&tag=${TAG}`,
        };
      }
      // Fix recs that have partBrand but no affiliateUrl and no searchQuery
      if (rec.partBrand && !rec.affiliateUrl && !rec.searchQuery) {
        changed = true;
        const query = `${issue.make} ${issue.model} ${rec.partBrand || ''} ${rec.partName || ''}`.trim();
        return {
          ...rec,
          type: rec.type || 'part',
          upvotes: rec.upvotes || 0,
          affiliateUrl: `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${TAG}`,
        };
      }
      return rec;
    });

    if (changed) {
      await prisma.knownIssue.update({
        where: { id: issue.id },
        data: { communityRecommendations: updated },
      });
      fixed++;
    }
  }

  console.log(`Fixed ${fixed} issues with missing affiliate links`);
  await prisma.$disconnect();
  await pool.end();
}

fix().catch(e => { console.error(e); process.exit(1); });
