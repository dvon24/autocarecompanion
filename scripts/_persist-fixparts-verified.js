// Persist fixParts from the RESOLVER + BUY-LINK GATE pipeline.
//
// Differs from _persist-fixparts.js on purpose: that script DISCARDS the resolver's
// links and reconstructs generic search URLs from the part number. That is the right
// call when links were never verified, but here every link has already survived the
// zero-AI liveness gate (_verify-buylinks.js), and a verified product page beats a
// constructed search URL. So we keep what the gate passed and add nothing.
//
// Input: the gate's output — { result: { resolvedIssues: [{ id, fixParts: [...] }] } }
// AI-free, idempotent. Usage: node scripts/_persist-fixparts-verified.js <gated.json> [--apply]
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');
const file = process.argv[2];
if (!file) { console.error('usage: node scripts/_persist-fixparts-verified.js <gated.json> [--apply]'); process.exit(1); }

function normalizePart(p) {
  return {
    component: String(p.component || '').slice(0, 120),
    oemPartNumber: String(p.oemPartNumber || '').slice(0, 60),
    aftermarketXref: Array.isArray(p.aftermarketXref) ? p.aftermarketXref.map((x) => String(x).slice(0, 60)).slice(0, 6) : [],
    priceLow: Number.isFinite(p.priceLow) ? Math.round(p.priceLow) : null,
    priceHigh: Number.isFinite(p.priceHigh) ? Math.round(p.priceHigh) : null,
    note: String(p.note || '').slice(0, 300),
    // MUST be preserved: src/lib/known-issue-commerce.ts getKnownIssueCommerce() keeps only
    // parts with verified===true and links with verified===true. Dropping either flag writes
    // fixParts that render NOTHING while still counting as coverage in every DB query.
    verified: p.verified === true,
    // Issue-level safety gate. One recall-first part suppresses every retail CTA
    // until the owner checks VIN/remedy eligibility.
    ...(p.recallFirst === true ? { recallFirst: true } : {}),
    // Verified links only, as passed by the gate. Never reconstructed.
    buyLinks: (Array.isArray(p.buyLinks) ? p.buyLinks : [])
      .filter((l) => l && l.url && l.verified)
      .map((l) => ({ vendor: String(l.vendor || '').slice(0, 60), url: String(l.url), linkType: l.linkType === 'catalog' ? 'catalog' : 'product', verified: true }))
      .slice(0, 8),
  };
}

(async () => {
  const wrap = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list = (wrap.result && wrap.result.resolvedIssues) || [];
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  let upd = 0, skip = 0, parts = 0, links = 0, overwrite = 0;
  for (const row of list) {
    const id = String(row.id || '').trim();
    const fp = Array.isArray(row.fixParts)
      ? row.fixParts.filter((p) => p && (p.oemPartNumber || p.component)).map(normalizePart).filter((p) => p.buyLinks.length)
      : [];
    if (!id || fp.length === 0) { skip++; continue; }
    if (fp.some((x) => x.verified !== true)) { console.log(`  ! ${id}: part missing verified flag — would render nothing`); skip++; continue; }
    const exists = await prisma.knownIssue.findUnique({ where: { id }, select: { id: true, fixParts: true } });
    if (!exists) { console.log(`  ! id not found: ${id}`); skip++; continue; }
    const had = exists.fixParts && JSON.stringify(exists.fixParts) !== '[]' && exists.fixParts !== null;
    if (had) overwrite++;
    if (APPLY) await prisma.knownIssue.update({ where: { id }, data: { fixParts: fp } });
    upd++; parts += fp.length; links += fp.reduce((a, p) => a + p.buyLinks.length, 0);
  }
  console.log(`${APPLY ? 'WROTE' : 'DRY RUN'}: ${upd} issues, ${parts} parts, ${links} verified links (skipped ${skip} of ${list.length})`);
  if (overwrite) console.log(`  note: ${overwrite} of those already had fixParts and would be REPLACED`);
  if (!APPLY) console.log('  (re-run with --apply to write)');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
