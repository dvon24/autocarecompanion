#!/usr/bin/env node
/**
 * Backfill Amazon affiliate links on communityRecommendations in Supabase DB.
 *
 * For each published KnownIssue, finds "part" type recommendations missing
 * an affiliateUrl and generates an Amazon search URL with the au7o-20 tag.
 *
 * Usage: node scripts/backfill-affiliate-links-db.js [--dry-run]
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const AFFILIATE_TAG = 'au7o-20';
const dryRun = process.argv.includes('--dry-run');

function buildAmazonUrl(rec, issue) {
  let searchTerms = [];

  if (rec.partNumber) {
    // Part number is the most specific search term
    searchTerms.push(rec.partNumber);
    // Add brand for disambiguation if available and not already in part number
    if (rec.partBrand && !rec.partNumber.toLowerCase().includes(rec.partBrand.toLowerCase())) {
      searchTerms.unshift(rec.partBrand);
    }
  } else if (rec.partBrand && rec.partName) {
    searchTerms.push(rec.partBrand, rec.partName);
  } else if (rec.partName) {
    // No brand or number - add vehicle context for better search results
    const make = issue.make || '';
    const model = issue.model || '';
    searchTerms.push(make, model, rec.partName);
  } else {
    return null;
  }

  const query = searchTerms.filter(Boolean).join(' ').trim();
  if (!query) return null;

  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

async function main() {
  console.log(dryRun ? '[DRY RUN] No changes will be written.\n' : '');
  console.log('Fetching all published known issues from database...');

  const issues = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: {
      id: true,
      make: true,
      model: true,
      communityRecommendations: true,
    },
  });

  console.log(`Found ${issues.length} published issues.\n`);

  let totalIssuesChecked = 0;
  let totalRecsUpdated = 0;
  let totalAlreadyHadLinks = 0;
  let totalSkippedNoParts = 0;
  let totalSkippedNoData = 0;
  let issuesModified = 0;
  const examples = [];

  // Skip brands that are verbs / not real brands
  const skipBrands = new Set(['install', 'replace', 'use', 'check', 'upgrade', 'avoid', 'search']);

  for (const issue of issues) {
    totalIssuesChecked++;
    const recs = issue.communityRecommendations;
    if (!Array.isArray(recs) || recs.length === 0) continue;

    let issueModified = false;

    for (const rec of recs) {
      // Only process "part" type recommendations (or those with part data)
      if (rec.type !== 'part' && !rec.partNumber && !rec.partName && !rec.partBrand) {
        totalSkippedNoParts++;
        continue;
      }

      // Skip if brand is just a verb and no other part data
      if (rec.partBrand && skipBrands.has(rec.partBrand.toLowerCase()) && !rec.partNumber && !rec.partName) {
        totalSkippedNoData++;
        continue;
      }

      // Already has a link
      if (rec.affiliateUrl) {
        totalAlreadyHadLinks++;
        continue;
      }

      // For type=part but no partNumber/partName/partBrand at all, skip
      if (!rec.partNumber && !rec.partName && !rec.partBrand) {
        totalSkippedNoData++;
        continue;
      }

      const url = buildAmazonUrl(rec, issue);
      if (url) {
        rec.affiliateUrl = url;
        totalRecsUpdated++;
        issueModified = true;

        if (examples.length < 15) {
          examples.push({
            issueId: issue.id,
            brand: rec.partBrand || '(none)',
            partName: rec.partName || '(none)',
            partNumber: rec.partNumber || '(none)',
            url,
          });
        }
      } else {
        totalSkippedNoData++;
      }
    }

    if (issueModified && !dryRun) {
      await prisma.knownIssue.update({
        where: { id: issue.id },
        data: { communityRecommendations: recs },
      });
      issuesModified++;
    } else if (issueModified) {
      issuesModified++;
    }
  }

  console.log('--- Results ---');
  console.log(`Total issues checked:          ${totalIssuesChecked}`);
  console.log(`Issues modified:               ${issuesModified}`);
  console.log(`Recommendations updated:       ${totalRecsUpdated}`);
  console.log(`Already had affiliate links:   ${totalAlreadyHadLinks}`);
  console.log(`Skipped (not part type):        ${totalSkippedNoParts}`);
  console.log(`Skipped (no part data):         ${totalSkippedNoData}`);

  if (examples.length > 0) {
    console.log('\n--- Sample updates ---');
    for (const ex of examples) {
      console.log(`  [${ex.issueId}]`);
      console.log(`    Brand: ${ex.brand} | Part: ${ex.partName} | PN: ${ex.partNumber}`);
      console.log(`    -> ${ex.url}`);
    }
  }

  if (dryRun) {
    console.log('\n[DRY RUN] No changes were written to the database.');
  } else {
    console.log(`\nDone. Updated ${totalRecsUpdated} recommendations across ${issuesModified} issues.`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error('Error:', err);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
