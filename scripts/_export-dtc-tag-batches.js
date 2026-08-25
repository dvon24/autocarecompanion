#!/usr/bin/env node
/**
 * Re-export the untagged-issue batches that feed the DTC tagging pass.
 *
 * MUST be re-run after every `_persist-dtc-tag-pass.js --apply`, and the ledger below is why it is
 * not enough to just re-query "issues with no dtcCodes".
 *
 * THREE FILTERS decide what is eligible, and all three matter:
 *
 *   1. vehicleType = 'car'. Motorcycles are a separate catalog with a separate count and their own
 *      tagging pass; a bike must never be swept into an automotive batch.
 *
 *   2. max(years) >= 1996 - the OBD-II gate. A pre-OBD vehicle cannot store a generic code at all.
 *      This is not hypothetical: the largest untagged cluster in the catalog is Land Rover Series
 *      I/II/IIA (built 1948-71), which would otherwise sit at the top of the ranking and burn a
 *      whole wave proposing codes that can never exist.
 *
 *   3. NOT ALREADY PROCESSED (data/_dtc-processed-ids.json). This is the subtle one. "Untagged" and
 *      "unexamined" are NOT the same set: the pass tags only ~28% of what it reads, because most
 *      failures genuinely set no code, and a correctly-declined issue stays untagged forever.
 *      Ranking on untagged count alone therefore puts the SAME nameplates back at the top of every
 *      wave - RAV4, Civic, CR-V and F-150 all resurfaced in the top 15 after being fully processed
 *      - and the run burns its agents re-judging issues it already declined. The ledger is appended
 *      to by _gen-dtc-tag-parts.js as it emits each part script.
 *
 * Batches are one nameplate each, capped at CAP issues; a nameplate with more than CAP remaining
 * issues is split into numbered parts so no single agent gets an unreadable prompt. Ranked by
 * remaining count descending, because that is where the yield is.
 *
 *   node scripts/_export-dtc-tag-batches.js
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const CAP = 20;               // issues per batch (per agent prompt)
const OBD2_FIRST_YEAR = 1996;

// Categories whose failures usually ARE watched by an onboard monitor. This is a PRIORITY ORDER,
// deliberately not a filter: brakes and safety genuinely do set codes (an ABS fault sets a C-code,
// a failed airbag spiral cable sets B0100, an EPS dropout sets U0131 - all three were confirmed
// tags), so excluding them would lose real pages. But the split matters enormously for yield.
//
// Measured 2026-08-25: the first two waves of the remainder drew batches dominated by `safety` and
// `body` - seat-belt anchor bolts, paint peeling, sunvisor mounts, water leaks, glass shattering,
// tire date codes - and tagged 7 of 161 issues (4%), against 28% earlier the same night. Nothing
// was broken: those failures set no code, and the gates correctly declined them. The fix is
// SELECTION, not prompting. Sorting code-likely issues to the front of each nameplate concentrates
// them into the low-numbered parts, so a wave spends its agents where codes actually exist.
const CODE_LIKELY = new Set(['engine', 'transmission', 'fuel', 'emissions', 'cooling', 'electrical', 'drivetrain', 'exhaust']);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

(async () => {
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published', vehicleType: 'car' },
    select: {
      id: true, make: true, model: true, title: true, category: true,
      years: true, engines: true, description: true, symptoms: true, dtcCodes: true,
    },
  });

  let processed = new Set();
  try { processed = new Set(JSON.parse(fs.readFileSync('data/_dtc-processed-ids.json', 'utf8'))); }
  catch { /* first run: no ledger yet */ }

  let preObd = 0, alreadyTagged = 0, alreadySeen = 0;
  const byNameplate = new Map();
  for (const r of rows) {
    if (r.dtcCodes && r.dtcCodes.length) { alreadyTagged++; continue; }
    if (processed.has(r.id)) { alreadySeen++; continue; }
    const maxYear = Math.max(0, ...(r.years || []));
    if (!(maxYear >= OBD2_FIRST_YEAR)) { preObd++; continue; }

    // Key on a delimiter that cannot occur in a make or model, and carry make/model through as
    // real fields rather than re-deriving them. Splitting a "make model" string back apart is not
    // recoverable - "Land Rover Defender" and "Jeep Grand Cherokee" both have multi-word halves -
    // and a mangled model is not cosmetic: _persist-dtc-tag-pass.js re-checks make/model against
    // the row and would reject the whole batch.
    const key = r.make + '␟' + r.model;
    if (!byNameplate.has(key)) byNameplate.set(key, { make: r.make, model: r.model, issues: [] });
    byNameplate.get(key).issues.push({
      id: r.id,
      title: r.title,
      category: r.category,
      years: r.years,
      engines: r.engines,
      description: String(r.description || '').slice(0, 420),
      symptoms: r.symptoms,
    });
  }

  // Sort code-likely issues to the front WITHIN each nameplate, then rank nameplates by how many
  // code-likely issues they still hold. Together these put the densest work in the earliest parts.
  for (const n of byNameplate.values()) {
    n.issues.sort((a, b) => (CODE_LIKELY.has(b.category) ? 1 : 0) - (CODE_LIKELY.has(a.category) ? 1 : 0));
    n.likely = n.issues.filter((i) => CODE_LIKELY.has(i.category)).length;
  }

  // --code-likely-only drops the code-poor tail entirely for this export, giving ~100% density
  // instead of ~59%. Sorting alone cannot concentrate much once most nameplates are down to a
  // handful of issues each - there is nothing left to push into a later part. The dropped issues
  // are NOT marked processed and NOT lost; they simply wait for a later, lower-priority pass.
  const DENSE = process.argv.includes('--code-likely-only');
  if (DENSE) {
    for (const n of byNameplate.values()) n.issues = n.issues.filter((i) => CODE_LIKELY.has(i.category));
  }

  const ranked = [...byNameplate.values()]
    .filter((n) => n.issues.length)
    .sort((a, b) => b.likely - a.likely || b.issues.length - a.issues.length);

  const batches = [];
  for (const n of ranked) {
    if (n.issues.length <= CAP) { batches.push({ make: n.make, model: n.model, issues: n.issues }); continue; }
    const parts = Math.ceil(n.issues.length / CAP);
    for (let p = 0; p < parts; p++) {
      batches.push({ make: n.make, model: n.model, part: p + 1, issues: n.issues.slice(p * CAP, (p + 1) * CAP) });
    }
  }

  // Fail loudly rather than emitting a batch the persist step will reject wholesale.
  const malformed = batches.filter((b) => !b.make || !b.model);
  if (malformed.length) {
    console.error(`ABORT: ${malformed.length} batches have a missing make or model`);
    process.exit(1);
  }

  fs.writeFileSync('data/_dtc-tag-batches.json', JSON.stringify(batches));
  const total = batches.reduce((s, b) => s + b.issues.length, 0);
  console.log(`published cars scanned: ${rows.length}`);
  console.log(`  already tagged:                    ${alreadyTagged}`);
  console.log(`  already judged + declined (ledger):${String(alreadySeen).padStart(6)}`);
  console.log(`  pre-OBD-II (excluded):             ${preObd}`);
  console.log(`  ELIGIBLE remaining:                ${total} across ${batches.length} batches / ${ranked.length} nameplates`);
  console.log('\ntop 15 by remaining count:');
  batches.slice(0, 15).forEach((b, i) => console.log(`  ${String(i).padStart(3)}  ${b.make} ${b.model}${b.part ? ' p' + b.part : ''} - ${b.issues.length}`));
  console.log('\nwrote data/_dtc-tag-batches.json');

  await prisma.$disconnect();
  await pool.end();
})();
