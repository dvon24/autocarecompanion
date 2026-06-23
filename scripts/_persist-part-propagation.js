// Part-propagation audit — persist. Attaches fitment-CONFIRMED platform-shared
// parts to the sibling issues' fixParts. Idempotent: skips a part already on the
// issue (same normalized PN). Buy-links are PN searches (a wrong PN degrades to
// search results, never a wrong product) — same shape as _persist-fixparts.js.
// Input: workflow output with result.confirmed = [{ candidateId, component,
//   oemPartNumber, aftermarketXref, priceLow, priceHigh, note }]
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
  // group confirmed parts by issue id
  const byId = new Map();
  for (const c of confirmed) {
    if (!c || !c.candidateId || !c.oemPartNumber) continue;
    if (!byId.has(c.candidateId)) byId.set(c.candidateId, []);
    byId.get(c.candidateId).push(c);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  let issuesTouched = 0, partsAdded = 0, skipped = 0;
  for (const [id, parts] of byId) {
    try {
      const row = await prisma.knownIssue.findUnique({ where: { id }, select: { fixParts: true } });
      if (!row) { continue; }
      const existing = Array.isArray(row.fixParts) ? row.fixParts.slice() : [];
      const have = new Set(existing.map((p) => normPn(p && p.oemPartNumber)).filter(Boolean));
      let added = 0;
      for (const c of parts) {
        const key = normPn(c.oemPartNumber);
        if (have.has(key)) { skipped++; continue; }
        have.add(key);
        existing.push({
          component: c.component,
          oemPartNumber: c.oemPartNumber,
          aftermarketXref: Array.isArray(c.aftermarketXref) ? c.aftermarketXref.slice(0, 6) : [],
          priceLow: c.priceLow ?? null,
          priceHigh: c.priceHigh ?? null,
          note: c.note || '',
          buyLinks: buyLinks(c.oemPartNumber, c.component),
          source: 'propagation', // provenance: cross-model fitment-verified
        });
        added++; partsAdded++;
      }
      if (added > 0) { await prisma.knownIssue.update({ where: { id }, data: { fixParts: existing } }); issuesTouched++; }
    } catch (e) { console.error('  ! ' + id + ': ' + e.message); }
  }
  console.log('\nPropagation persist: added ' + partsAdded + ' parts across ' + issuesTouched + ' sibling issues (' + skipped + ' already present, ' + confirmed.length + ' confirmed in).');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
