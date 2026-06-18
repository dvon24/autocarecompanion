#!/usr/bin/env node
/* eslint-disable */
/**
 * Archive tonight's wave-2 issues that duplicate OLDER established issues
 * on the same vehicle (triaged by hand from _check-tonight-dupes.js output
 * — pairs where the new row re-describes an existing report-backed issue).
 * Keeps the older row (report counts, indexed anchors). Targeted single-row
 * updates, idempotent.
 *
 * NOT archived (triaged as distinct): Grand Vitara H25A vs N32A chains,
 * Murano oil consumption 2003-2007 vs 2009-2014 (disjoint years/gens),
 * Chrysler 200 neutral-shift recall vs generic shifting, 200 oil
 * consumption vs filter-housing leak, Journey liftgate harness vs TIPM,
 * Journey Pentastar head vs head gasket.
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const ARCHIVE_IDS = [
  // [new duplicate id, kept older id]
  ['skoda-fabia-1-2-tsi-ea111-timing-chain-stretch-tensioner-failure', 'skoda-fabia-tsi-timing-chain'],
  ['buick-lacrosse-3-6l-v6-timing-chain-stretch-wear', 'buick-lacrosse-3.6l-timing-chain'],
  ['chevrolet-hhr-defective-ignition-switch-can-shut-off-engine-while-driving', 'chevy-hhr-ignition-switch-defect-2006'],
  ['chevrolet-hhr-ecotec-timing-chain-stretch-tensioner-failure', 'chevy-hhr-ecotec-timing-chain-2006'],
  ['chevrolet-hhr-sudden-loss-electric-power-steering-assist', 'chevy-hhr-power-steering-failure-2006'],
  ['renault-koleos-x-tronic-cvt-transmission-failure', 'renault-koleos-cvt-judder'],
  ['chevrolet-avalanche-excessive-oil-consumption-afm-lifter-failure', 'chevy-avalanche-afm-oil-consumption-2007'],
  ['chevrolet-avalanche-unwanted-low-speed-abs-activation-recall-05v379', 'chevy-avalanche-abs-unwanted-activation-2002'],
  ['nissan-murano-cvt-transmission-judder-slipping-premature-failure', 'nissan-murano-cvt-failure-2009'],
  ['nissan-murano-awd-transfer-case-failure-fluid-leak', 'nissan-murano-transfer-case-seal-2003'],
  ['nissan-xterra-secondary-timing-chain-tensioner-guide-noise', 'nissan-xterra-timing-chain-2005'],
  ['lincoln-mkx-internal-water-pump-failure-contaminating-engine-oil', 'lincoln-mkx-3.7l-water-pump-internal'],
  ['chrysler-200-zf-9-speed-harsh-rough-shifting-lurching-hesitation', 'chrysler-200-9speed-trans-2015'],
  ['chrysler-200-2-4l-tigershark-excessive-oil-consumption', 'chrysler-200-oil-consumption-2015'],
  ['chrysler-200-first-generation-engine-stalling-low-speed-idle', 'chrysler-200-throttle-stall-2011'],
  ['dodge-journey-tipm-failure-causing-widespread-electrical-faults', 'dodge-journey-tipm-2009'],
  ['dodge-journey-premature-brake-pad-rotor-wear', 'dodge-journey-brake-wear-2009'],
  ['dodge-journey-wireless-ignition-node-module-ignition-switch-defect', 'dodge-journey-ignition-switch-2009'],
];

(async () => {
  // Manual check: Xterra SMOD pair the token scan missed (category mismatch).
  const smodPair = await prisma.knownIssue.findMany({
    where: { make: 'Nissan', model: 'Xterra', title: { contains: 'ilkshake', mode: 'insensitive' } },
    select: { id: true, title: true, category: true, years: true, status: true, createdAt: true, reportCount: true },
  });
  console.log('Xterra SMOD candidates:');
  for (const r of smodPair) console.log(`  ${r.id} [${r.status}] cat=${r.category} reports=${r.reportCount} created=${r.createdAt.toISOString().slice(0, 10)} — ${r.title}`);
  // Archive the NEW one (created in the last 12h) if an older published one exists.
  const oldSmod = smodPair.find((r) => Date.now() - r.createdAt.getTime() > 12 * 3600e3 && r.status === 'published');
  const newSmod = smodPair.find((r) => Date.now() - r.createdAt.getTime() <= 12 * 3600e3 && r.status === 'published');
  if (oldSmod && newSmod) ARCHIVE_IDS.push([newSmod.id, oldSmod.id]);

  let archived = 0, missing = 0;
  for (const [newId, keptId] of ARCHIVE_IDS) {
    const kept = await prisma.knownIssue.findUnique({ where: { id: keptId }, select: { id: true, status: true } });
    if (!kept || kept.status !== 'published') {
      console.log(`! SKIP ${newId} — kept counterpart ${keptId} not found/published`);
      missing++;
      continue;
    }
    const res = await prisma.knownIssue.updateMany({
      where: { id: newId, status: 'published' },
      data: { status: 'archived' },
    });
    if (res.count === 1) { console.log(`✓ archived ${newId} (dup of ${keptId})`); archived++; }
    else console.log(`- already archived / not found: ${newId}`);
  }

  // Category fix: old HHR EPS issue was filed under 'suspension'.
  const fix = await prisma.knownIssue.updateMany({
    where: { id: 'chevy-hhr-power-steering-failure-2006', category: 'suspension' },
    data: { category: 'steering' },
  });
  if (fix.count) console.log('✓ fixed chevy-hhr-power-steering-failure-2006 category suspension→steering');

  console.log(`\nArchived ${archived} duplicates · ${missing} skipped`);
  await prisma.$disconnect();
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
