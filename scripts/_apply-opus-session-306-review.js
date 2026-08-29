#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// Apply the exact repair-first decisions to the 306 Opus pending rows without
// promoting them. Dry-run by default; pass --apply only immediately before the
// paired promotion/build release.
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');
const masterPath = process.argv[2];
const gatedPath = process.argv[3];
if (!masterPath || !gatedPath) {
  console.error('usage: node scripts/_apply-opus-session-306-review.js <master-review.json> <commerce-gated.json> [--apply]');
  process.exit(1);
}

function normalizePart(part) {
  return {
    component: String(part.component || '').slice(0, 120),
    oemPartNumber: String(part.oemPartNumber || '').slice(0, 60),
    aftermarketXref: Array.isArray(part.aftermarketXref) ? part.aftermarketXref.slice(0, 6) : [],
    priceLow: Number.isFinite(part.priceLow) ? Math.round(part.priceLow) : null,
    priceHigh: Number.isFinite(part.priceHigh) ? Math.round(part.priceHigh) : null,
    note: String(part.note || '').slice(0, 300),
    verified: part.verified === true,
    ...(part.recallFirst === true ? { recallFirst: true } : {}),
    buyLinks: (part.buyLinks || []).map((link) => ({
      vendor: String(link.vendor || '').slice(0, 60),
      url: String(link.url),
      linkType: 'product',
      verified: link.verified === true,
    })).slice(0, 8),
  };
}

(async () => {
  const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
  const gated = JSON.parse(fs.readFileSync(gatedPath, 'utf8'));
  const decisions = master.decisions || [];
  if (decisions.length !== 306 || new Set(decisions.map((row) => row.id)).size !== 306) {
    throw new Error(`Expected 306 unique decisions, found ${decisions.length}`);
  }
  const commerce = new Map((gated.result?.resolvedIssues || []).map((row) => [
    row.id,
    (row.fixParts || []).map(normalizePart),
  ]));
  const ids = decisions.map((row) => row.id);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const existing = await prisma.knownIssue.findMany({
    where: { id: { in: ids } },
    select: { id: true, status: true, solution: true, fixParts: true },
  });
  const existingById = new Map(existing.map((row) => [row.id, row]));
  const missing = ids.filter((id) => !existingById.has(id));
  const notPending = existing.filter((row) => row.status !== 'pending_review');
  if (missing.length || notPending.length) {
    throw new Error(`${missing.length} missing IDs / ${notPending.length} IDs no longer pending_review`);
  }

  let changedSolutions = 0;
  let changedParts = 0;
  for (const decision of decisions) {
    const row = existingById.get(decision.id);
    const fixParts = commerce.get(decision.id) || [];
    if (row.solution !== decision.repairFirst) changedSolutions += 1;
    if (JSON.stringify(row.fixParts || []) !== JSON.stringify(fixParts)) changedParts += 1;
    if (APPLY) {
      await prisma.knownIssue.update({
        where: { id: decision.id },
        data: {
          solution: decision.repairFirst,
          fixParts,
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log(`${APPLY ? 'WROTE' : 'DRY RUN'}: ${decisions.length} exact pending rows`);
  console.log(`  solution updates: ${changedSolutions}`);
  console.log(`  fixParts updates: ${changedParts}`);
  console.log(`  commerce: ${commerce.size} issues / ${[...commerce.values()].flat().length} parts`);
  console.log('  status updates: 0 (promotion remains a separate citation-gated step)');
  if (!APPLY) console.log('  (re-run with --apply only as part of the approved release)');

  await prisma.$disconnect();
  await pool.end();
})().catch((error) => {
  console.error('FAIL:', error.message);
  process.exit(1);
});
