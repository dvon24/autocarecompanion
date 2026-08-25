// Same render semantics as _audit-render-guard-db.ts, but per-make and read from the LIVE DB
// (not the catalog snapshot), so it reflects what is actually stored on KnownIssue rows.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { isKnownIssueProductUrl, vendorMatchesProductUrl } from '../src/lib/known-issue-commerce';

const MAKES = process.argv.slice(2);
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

(async () => {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, make, "fixParts" FROM "KnownIssue"
     WHERE status='published' AND "fixParts" IS NOT NULL AND jsonb_array_length("fixParts"::jsonb)>0
     AND make = ANY($1)`, MAKES);

  let P = 0, Pv = 0, L = 0, Lv = 0, R = 0, recallSup = 0;
  const perMake: Record<string, any> = {};
  const hiddenHost: Record<string, number> = {};

  for (const r of rows) {
    const all = r.fixParts || [];
    const m = (perMake[r.make] ||= { issues: 0, rendering: 0, parts: 0, partsVerified: 0, links: 0, linksVerified: 0, renderable: 0 });
    m.issues++;
    const recall = all.some((p: any) => p?.recallFirst);
    if (recall) recallSup++;
    for (const p of all) { P++; m.parts++; if (p?.verified === true) { Pv++; m.partsVerified++; } }
    let ok = 0;
    for (const p of (recall ? [] : all.filter((p: any) => p?.verified === true))) {
      for (const l of (p.buyLinks || [])) {
        L++; m.links++;
        if (l.verified === true) { Lv++; m.linksVerified++; }
        if (l.verified === true && isKnownIssueProductUrl(l.url) && vendorMatchesProductUrl(l.vendor || '', l.url)) { R++; m.renderable++; ok++; }
        else { let h = 'unparseable'; try { h = new URL(l.url).hostname.replace(/^www\./, ''); } catch {} hiddenHost[h] = (hiddenHost[h] || 0) + 1; }
      }
    }
    if (ok) m.rendering++;
  }
  console.log(`LIVE DB, makes: ${MAKES.join(', ')}`);
  console.log(`issues with fixParts ${rows.length} | parts ${P} (verified ${Pv}) | links on verified parts ${L} (verified ${Lv}) | RENDERABLE ${R} | recall-suppressed issues ${recallSup}\n`);
  console.table(perMake);
  console.log('hidden-link hosts:');
  Object.entries(hiddenHost).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));
  await prisma.$disconnect(); await pool.end();
})();
