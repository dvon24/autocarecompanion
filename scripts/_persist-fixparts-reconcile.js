// Persist fixParts reconciliation: ADD verified cited-but-missing parts, and
// CORRECT wrong PNs (match by normalized currentPn in the live fixParts so we
// don't depend on a stale index). Buy-links are PN searches. Idempotent.
// Input: workflow output with result.confirmed = [{ issueId, adds:[{component,
//   oemPartNumber}], corrections:[{currentPn, correctPn}] }]
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const AMZ_TAG = 'au7o-20';
const enc = (s) => encodeURIComponent(String(s || '').trim());
const normPn = (p) => String(p || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
function buyLinks(pn, name) {
  const term = (pn && String(pn).trim()) || String(name || '').trim();
  if (!term) return [];
  return [
    { vendor: 'Amazon', url: 'https://www.amazon.com/s?k=' + enc(term) + '&tag=' + AMZ_TAG },
    { vendor: 'RockAuto', url: 'https://www.rockauto.com/en/partsearch/?q=' + enc(term) },
    { vendor: 'eBay', url: 'https://www.ebay.com/sch/i.html?_nkw=' + enc(term) },
  ];
}

(async () => {
  const wrap = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const confirmed = (wrap.result && wrap.result.confirmed) || wrap.confirmed || [];
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  let issuesTouched = 0, added = 0, corrected = 0, skipped = 0;
  for (const r of confirmed) {
    if (!r || !r.issueId) continue;
    try {
      const row = await prisma.knownIssue.findUnique({ where: { id: r.issueId }, select: { fixParts: true } });
      if (!row) continue;
      const parts = Array.isArray(row.fixParts) ? row.fixParts.slice() : [];
      let changed = false;

      // corrections first (match by normalized currentPn)
      for (const c of (r.corrections || [])) {
        const cur = normPn(c.currentPn), nxt = normPn(c.correctPn);
        if (!cur || !nxt || cur === nxt) continue;
        const idx = parts.findIndex((p) => p && normPn(p.oemPartNumber) === cur);
        if (idx < 0) continue;
        parts[idx] = { ...parts[idx], oemPartNumber: c.correctPn, buyLinks: buyLinks(c.correctPn, parts[idx].component), note: (parts[idx].note ? parts[idx].note + ' ' : '') + '[PN corrected ' + c.currentPn + '→' + c.correctPn + ']', source: 'reconciliation' };
        changed = true; corrected++;
      }

      // adds (skip if PN already present)
      const have = new Set(parts.map((p) => normPn(p && p.oemPartNumber)).filter(Boolean));
      for (const a of (r.adds || [])) {
        const key = normPn(a.oemPartNumber);
        if (!key) continue;
        if (have.has(key)) { skipped++; continue; }
        have.add(key);
        parts.push({
          component: a.component,
          oemPartNumber: a.oemPartNumber,
          aftermarketXref: [],
          priceLow: null, priceHigh: null,
          note: (a.reason ? a.reason + ' ' : '') + '(reconciled from the issue\'s own fix text)',
          buyLinks: buyLinks(a.oemPartNumber, a.component),
          source: 'reconciliation',
        });
        changed = true; added++;
      }

      if (changed) { await prisma.knownIssue.update({ where: { id: r.issueId }, data: { fixParts: parts } }); issuesTouched++; }
    } catch (e) { console.error('  ! ' + r.issueId + ': ' + e.message); }
  }
  console.log('\nReconcile persist: +' + added + ' parts added, ' + corrected + ' PNs corrected across ' + issuesTouched + ' issues (' + skipped + ' adds already present, ' + confirmed.length + ' issues in).');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
