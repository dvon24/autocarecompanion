// Repair DTC codes stored with an ISO 14229 failure-type byte glued onto the
// base code with no separator: "P05202A" is really P0520 with failure type 2A,
// "C162604" is C1626 type 04. Stored that way the code matches nothing — not
// the DTCCode library, not a /dtc/[code]/[make] page, not a user's scanner
// readout — so the page cannot mint and the tag is dead weight.
//
// The repair is conservative: keep the 5-char SAE base code, drop the suffix,
// and de-duplicate. Codes that are already valid, and manufacturer-proprietary
// hex codes that were never SAE to begin with (BMW's 7E0197), are left alone —
// the latter need a separate BMW-code decision, not a silent truncation.
//
//   node scripts/_fix-concatenated-dtc-codes.js          # dry run
//   node scripts/_fix-concatenated-dtc-codes.js --apply
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});
const p = new PrismaClient({ adapter: new PrismaPg(pool) });

const VALID = /^[PBCU][0-3][0-9A-F]{3}$/;
// Base SAE code + a 2-digit hex failure-type byte, run together.
const CONCAT = /^([PBCU][0-3][0-9A-F]{3})([0-9A-F]{2})$/;

(async () => {
  const issues = await p.knownIssue.findMany({
    where: { NOT: { dtcCodes: { isEmpty: true } } },
    select: { id: true, make: true, model: true, status: true, dtcCodes: true },
  });

  const edits = [];
  const proprietary = [];
  for (const i of issues) {
    let changed = false;
    const out = [];
    for (const raw of i.dtcCodes) {
      const c = String(raw).toUpperCase().trim();
      if (VALID.test(c)) { out.push(c); continue; }
      const m = CONCAT.exec(c);
      if (m) { out.push(m[1]); changed = true; continue; }
      if (!/^[PBCU]/.test(c)) proprietary.push({ id: i.id, code: c });
      out.push(c); // leave anything we don't positively recognize
    }
    const deduped = [...new Set(out)];
    if (changed || deduped.length !== i.dtcCodes.length) {
      edits.push({ id: i.id, vehicle: i.make + ' ' + i.model, status: i.status, before: i.dtcCodes, after: deduped });
    }
  }

  console.log('scanned ' + issues.length + ' issues with DTC tags');
  console.log('issues needing repair: ' + edits.length + (APPLY ? '  [APPLY]' : '  [DRY RUN]'));
  for (const e of edits) {
    console.log('  ' + e.id);
    console.log('    ' + e.vehicle + ' (' + e.status + ')');
    console.log('    before: ' + e.before.join(', '));
    console.log('    after:  ' + e.after.join(', '));
  }

  if (proprietary.length) {
    const uniq = [...new Set(proprietary.map((x) => x.code))];
    console.log('');
    console.log('non-SAE / manufacturer-proprietary codes left untouched (' + uniq.length + '): ' + uniq.join(', '));
    console.log('  These need a decision, not a truncation — they will never match the SAE library.');
  }

  if (APPLY) {
    for (const e of edits) {
      await p.knownIssue.update({ where: { id: e.id }, data: { dtcCodes: e.after } });
    }
    console.log('');
    console.log('updated ' + edits.length + ' issues');
  }

  await p.$disconnect();
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
