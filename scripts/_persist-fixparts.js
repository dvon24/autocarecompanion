// Persist fixParts (the buyable resolution) onto existing KnownIssue rows.
// Input: a workflow output whose result.fixPartsByIssue = [{ id, fixParts:[...] }]
// where each fixPart = { component, oemPartNumber, aftermarketXref[], priceLow,
// priceHigh, note }.  We CONSTRUCT the buy-links here from the verified part
// number (never from AI text) so links always resolve + carry the affiliate tag.
// AI-free, idempotent. Usage: node scripts/_persist-fixparts.js <output.json>
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const AMZ_TAG = 'au7o-20';
const enc = (s) => encodeURIComponent(String(s || '').trim());

// Buy-links are derived deterministically from the verified part number — a
// PN search always resolves (no dead deep-links), and Amazon carries the tag.
function buyLinksFor(part) {
  const pn = String(part.oemPartNumber || '').trim();
  const xref = Array.isArray(part.aftermarketXref) ? part.aftermarketXref.filter(Boolean) : [];
  const term = pn || part.component || '';
  if (!term) return [];
  const links = [
    { vendor: 'Amazon', url: 'https://www.amazon.com/s?k=' + enc(term) + '&tag=' + AMZ_TAG },
    { vendor: 'RockAuto', url: pn ? ('https://www.rockauto.com/en/partsearch/?partnum=' + enc(pn)) : ('https://www.rockauto.com/en/partsearch/?q=' + enc(term)) },
    { vendor: 'eBay', url: 'https://www.ebay.com/sch/i.html?_nkw=' + enc(term) },
  ];
  void xref;
  return links;
}

function normalizePart(p) {
  return {
    component: String(p.component || '').slice(0, 120),
    oemPartNumber: String(p.oemPartNumber || '').slice(0, 60),
    aftermarketXref: Array.isArray(p.aftermarketXref) ? p.aftermarketXref.map((x) => String(x).slice(0, 60)).slice(0, 6) : [],
    priceLow: Number.isFinite(p.priceLow) ? Math.round(p.priceLow) : null,
    priceHigh: Number.isFinite(p.priceHigh) ? Math.round(p.priceHigh) : null,
    note: String(p.note || '').slice(0, 300),
    buyLinks: buyLinksFor(p),
  };
}

(async () => {
  const wrap = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const list = (wrap.result && wrap.result.fixPartsByIssue) || wrap.fixPartsByIssue || [];
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  let upd = 0, skip = 0, parts = 0;
  for (const row of list) {
    const id = String(row.id || '').trim();
    const fp = Array.isArray(row.fixParts) ? row.fixParts.filter((p) => p && (p.oemPartNumber || p.component)).map(normalizePart) : [];
    if (!id || fp.length === 0) { skip++; continue; }
    try {
      const exists = await prisma.knownIssue.findUnique({ where: { id }, select: { id: true } });
      if (!exists) { skip++; continue; }
      await prisma.knownIssue.update({ where: { id }, data: { fixParts: fp } });
      upd++; parts += fp.length;
    } catch (e) { console.error('  ! ' + id + ': ' + e.message); skip++; }
  }
  console.log('\nfixParts persist: updated ' + upd + ' issues with ' + parts + ' parts, skipped ' + skip + ' (of ' + list.length + ')');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
