// Zero-AI: how much of the EXISTING fixParts corpus actually renders a buy button?
// src/lib/known-issue-commerce.ts hides links failing isKnownIssueProductUrl() /
// vendorMatchesProductUrl(), so DB coverage overstates what readers see.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { isKnownIssueProductUrl, vendorMatchesProductUrl } from '../src/lib/known-issue-commerce';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

(async () => {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, make, "fixParts" FROM "KnownIssue"
     WHERE status='published' AND "fixParts" IS NOT NULL AND "fixParts"::text NOT IN ('[]','null')`
  );
  let links = 0, renderable = 0, issuesWithLink = 0, issuesNoLink = 0;
  let recallSuppressed = 0, unverifiedParts = 0;
  const hiddenHost: Record<string, number> = {};
  const makeNoLink: Record<string, number> = {};

  for (const r of rows) {
    const allParts = Array.isArray(r.fixParts) ? r.fixParts : [];
    // Mirror getKnownIssueCommerce(): unverified parts are dropped entirely, a recallFirst
    // marker suppresses every retail link on the issue, and each link needs verified===true.
    const recallFirst = allParts.some((p: any) => p?.recallFirst);
    const parts = recallFirst ? [] : allParts.filter((p: any) => p?.verified === true);
    if (recallFirst) recallSuppressed++;
    unverifiedParts += allParts.length - parts.length;
    let ok = 0;
    for (const p of parts) {
      for (const l of (p?.buyLinks || [])) {
        if (!l?.url) continue;
        links++;
        if (l.verified === true && isKnownIssueProductUrl(l.url) && vendorMatchesProductUrl(l.vendor || '', l.url)) { renderable++; ok++; }
        else {
          let h = 'unparseable';
          try { h = new URL(l.url).hostname.replace(/^www\./, ''); } catch {}
          hiddenHost[h] = (hiddenHost[h] || 0) + 1;
        }
      }
    }
    if (ok) issuesWithLink++; else { issuesNoLink++; makeNoLink[r.make] = (makeNoLink[r.make] || 0) + 1; }
  }
  console.log(`published issues WITH fixParts : ${rows.length}`);
  console.log(`  render >=1 buy link          : ${issuesWithLink}`);
  console.log(`  render NOTHING               : ${issuesNoLink}`);
  console.log(`stored buy links               : ${links}`);
  console.log(`  renderable                   : ${renderable} (${links ? (100*renderable/links).toFixed(1) : 0}%)`);
  console.log('\ntop hidden-link hosts:');
  Object.entries(hiddenHost).sort((a, b) => b[1] - a[1]).slice(0, 12)
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(5)}  ${k}`));
  console.log('\nissues rendering nothing, by make:');
  Object.entries(makeNoLink).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));
  await prisma.$disconnect(); await pool.end();
})();
