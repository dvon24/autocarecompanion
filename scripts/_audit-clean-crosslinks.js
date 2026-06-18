#!/usr/bin/env node
/**
 * Audit + clean mechanically-impossible "also affects" cross-links at the
 * DATA level. The render gate in src/lib/known-issues.ts already SUPPRESSES
 * these at display time, but the bad neighbor ids still live in
 * KnownIssue.relatedIssueIds (the embedding pass added them). This strips them.
 *
 * Rule (mirrors the render gate): an issue A keeps a related neighbor B only if
 *   - same make, OR
 *   - A and B share a SPECIFIC engine family (hemi/ea888/b58/coyote…) — not a
 *     bare displacement/layout ("2.0L turbo", "V6") unrelated makes coincide on.
 * Cross-make semantic neighbors with no specific shared engine = the bug class
 * (Hemi/MDS tick → Acura MDX). Stripped.
 *
 * ZERO AI CALLS — pure Prisma reads + updates. Dry-run by default; pass --apply
 * to write. Idempotent.
 *
 * Usage: node scripts/_audit-clean-crosslinks.js [--apply]
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');

const GENERIC_ENGINE_TOKENS = new Set([
  'v4', 'v6', 'v8', 'v10', 'v12', 'i3', 'i4', 'i5', 'i6', 'l4', 'l6',
  'inline-4', 'inline-6', 'inline 4', 'inline 6', 'flat-4', 'flat-6', 'boxer',
  '3-cylinder', '4-cylinder', '5-cylinder', '6-cylinder', '8-cylinder',
  'turbo', 'twin-turbo', 'supercharged', 'diesel', 'hybrid', 'phev', 'ev',
  'electric', 'gas', 'gasoline', 'petrol', 'naturally aspirated', 'na',
]);
function isGenericEngineToken(token) {
  const t = String(token || '').toLowerCase().trim();
  if (!t) return true;
  if (GENERIC_ENGINE_TOKENS.has(t)) return true;
  if (/^\d(\.\d)?\s*l?(\s*(turbo|t|tdi|tsi|tfsi|v\d{1,2}|i\d|l\d|diesel|hybrid|na))?$/.test(t)) return true;
  return false;
}
function specificEngines(engines) {
  return new Set((Array.isArray(engines) ? engines : [])
    .map((e) => String(e).toLowerCase().trim())
    .filter((e) => e && !isGenericEngineToken(e)));
}
function engTokens(engines) {
  return new Set((Array.isArray(engines) ? engines : []).map((e) => String(e).toLowerCase().trim()).filter(Boolean));
}
function dtcSet(codes) {
  return new Set((Array.isArray(codes) ? codes : []).map((c) => String(c).toUpperCase().trim()).filter(Boolean));
}
// Sibling brands that genuinely share platforms/engines/defects — keep their
// cross-make links even when `engines` is too sparse to prove a shared family.
const MAKE_GROUP = {
  dodge: 'stellantis', chrysler: 'stellantis', jeep: 'stellantis', ram: 'stellantis', 'ram trucks': 'stellantis', fiat: 'stellantis', 'alfa romeo': 'stellantis', maserati: 'stellantis', lancia: 'stellantis', plymouth: 'stellantis',
  chevrolet: 'gm', chevy: 'gm', gmc: 'gm', cadillac: 'gm', buick: 'gm', pontiac: 'gm', saturn: 'gm', oldsmobile: 'gm', hummer: 'gm',
  ford: 'ford', lincoln: 'ford', mercury: 'ford',
  volkswagen: 'vw', vw: 'vw', audi: 'vw', porsche: 'vw', seat: 'vw', skoda: 'vw', 'škoda': 'vw', bentley: 'vw', lamborghini: 'vw', bugatti: 'vw', cupra: 'vw',
  toyota: 'toyota', lexus: 'toyota', scion: 'toyota', daihatsu: 'toyota',
  honda: 'honda', acura: 'honda',
  nissan: 'nissan', infiniti: 'nissan', datsun: 'nissan',
  hyundai: 'hyundai', kia: 'hyundai', genesis: 'hyundai',
  bmw: 'bmw', mini: 'bmw', 'rolls-royce': 'bmw',
  'mercedes-benz': 'mercedes', mercedes: 'mercedes', smart: 'mercedes', maybach: 'mercedes',
  jaguar: 'jlr', 'land rover': 'jlr',
  volvo: 'geely', polestar: 'geely', lotus: 'geely', 'lynk & co': 'geely',
};
function sameCorporateFamily(a, b) {
  const ga = MAKE_GROUP[String(a || '').toLowerCase().trim()];
  const gb = MAKE_GROUP[String(b || '').toLowerCase().trim()];
  return !!ga && ga === gb;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const all = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { id: true, make: true, model: true, engines: true, dtcCodes: true, relatedIssueIds: true, title: true },
  });
  console.log(`Published issues: ${all.length}`);

  const byId = new Map(all.map((i) => [i.id, i]));

  let issuesWithLinks = 0;
  let totalLinks = 0;
  let strippedLinks = 0;
  const changed = [];
  const examples = [];

  for (const issue of all) {
    const links = Array.isArray(issue.relatedIssueIds) ? issue.relatedIssueIds : [];
    if (links.length === 0) continue;
    issuesWithLinks++;
    totalLinks += links.length;

    const issMake = String(issue.make || '').toLowerCase();
    const issSpecific = specificEngines(issue.engines);
    const issEng = engTokens(issue.engines);
    const issDtc = dtcSet(issue.dtcCodes);

    const kept = links.filter((nid) => {
      const nb = byId.get(nid);
      if (!nb) return true; // unknown / unpublished id — leave it (harmless, not the bug)
      const nbMake = String(nb.make || '').toLowerCase();
      if (nbMake === issMake) return true; // same make
      // specific shared engine = real mechanical link across any make
      const nbSpecific = specificEngines(nb.engines);
      for (const e of issSpecific) if (nbSpecific.has(e)) return true;
      // sibling brand (relatedIssueIds entries are already semantic neighbors,
      // so same-family alone is a defensible link — Dodge↔RAM↔Chrysler etc.)
      if (sameCorporateFamily(nbMake, issMake)) return true;
      return false; // cross-family, no specific shared engine → strip
    });

    if (kept.length !== links.length) {
      const removed = links.filter((x) => !kept.includes(x));
      strippedLinks += removed.length;
      changed.push({ id: issue.id, kept });
      if (examples.length < 25) {
        for (const rid of removed) {
          const nb = byId.get(rid);
          if (nb) examples.push(`  ✗ ${issue.make} ${issue.model} — "${(issue.title || '').slice(0, 44)}"  ⇏  ${nb.make} ${nb.model}`);
        }
      }
    }
  }

  console.log(`Issues with cross-links: ${issuesWithLinks}`);
  console.log(`Total cross-link ids: ${totalLinks}`);
  console.log(`Impossible cross-links to strip: ${strippedLinks} (across ${changed.length} issues)\n`);
  console.log('Examples (mechanically-impossible pairs being removed):');
  console.log(examples.join('\n') || '  (none)');

  if (!APPLY) {
    console.log(`\nDRY-RUN. Re-run with --apply to write the ${changed.length} cleaned relatedIssueIds.`);
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  console.log(`\nApplying — updating ${changed.length} issues…`);
  let done = 0, failed = 0;
  for (const c of changed) {
    try {
      await prisma.knownIssue.update({ where: { id: c.id }, data: { relatedIssueIds: c.kept } });
      done++;
    } catch (err) {
      failed++;
      console.error(`  ✗ ${c.id}: ${err.message}`);
    }
  }
  console.log(`\n━━━ Cross-link clean complete ━━━`);
  console.log(`  Updated: ${done}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Cross-link ids removed: ${strippedLinks}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.message); process.exit(1); });
