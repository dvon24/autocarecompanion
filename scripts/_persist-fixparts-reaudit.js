// Apply the blind re-audit drops: for any part number the second auditor could
// not re-confirm, CLEAR the oemPartNumber (keep the part name) and rebuild that
// part's buy-links as a NAME search (still works, no fabricated PN shown).
// Input: workflow output with result.drops = [{ id, i, component, pn, audited }]
// Usage: node scripts/_persist-fixparts-reaudit.js <output.json>
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const AMZ_TAG = 'au7o-20';
const enc = (s) => encodeURIComponent(String(s || '').trim());
function buyLinksByName(name) {
  const term = String(name || '').trim();
  if (!term) return [];
  return [
    { vendor: 'Amazon', url: 'https://www.amazon.com/s?k=' + enc(term) + '&tag=' + AMZ_TAG },
    { vendor: 'RockAuto', url: 'https://www.rockauto.com/en/partsearch/?q=' + enc(term) },
    { vendor: 'eBay', url: 'https://www.ebay.com/sch/i.html?_nkw=' + enc(term) },
  ];
}

(async () => {
  const wrap = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const drops = (wrap.result && wrap.result.drops) || wrap.drops || [];
  // group dropped indices per issue id
  const byId = new Map();
  let notChecked = 0;
  for (const d of drops) {
    // ONLY clear a PN an auditor actually ran on and could not confirm.
    // A drop with audited:false means the auditor never ran (e.g. the
    // subscription session-limit killed the batch) — that is "not checked",
    // NOT "wrong", so we must NOT wipe the PN. Re-run the re-audit later.
    if (d.audited !== true) { notChecked++; continue; }
    if (!byId.has(d.id)) byId.set(d.id, new Set());
    byId.get(d.id).add(Number(d.i));
  }
  if (notChecked) console.log('Skipped ' + notChecked + ' un-checked drops (auditor did not run — will re-audit later).');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  let issuesTouched = 0, pnsCleared = 0;
  for (const [id, idxSet] of byId) {
    try {
      const row = await prisma.knownIssue.findUnique({ where: { id }, select: { fixParts: true } });
      if (!row || !Array.isArray(row.fixParts)) continue;
      let changed = false;
      const next = row.fixParts.map((p, i) => {
        if (idxSet.has(i) && p && p.oemPartNumber) {
          changed = true; pnsCleared++;
          return { ...p, oemPartNumber: '', buyLinks: buyLinksByName(p.component) };
        }
        return p;
      });
      if (changed) { await prisma.knownIssue.update({ where: { id }, data: { fixParts: next } }); issuesTouched++; }
    } catch (e) { console.error('  ! ' + id + ': ' + e.message); }
  }
  console.log('\nRe-audit applied: cleared ' + pnsCleared + ' unconfirmed PNs across ' + issuesTouched + ' issues (' + drops.length + ' drops in).');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
