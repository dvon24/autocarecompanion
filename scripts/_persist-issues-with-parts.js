// Persist combined deepen-with-parts output: insert each NEW issue (status
// pending_review) WITH its fixParts (buy-links built here from the verified PN).
// Input: workflow output, result.confirmed = [{...issue, make, model, fixParts[]}]
// Then: promote (URL gate) -> blind PN re-audit -> push, as usual.
// AI-free + idempotent. Usage: node scripts/_persist-issues-with-parts.js <out.json>
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const UI_CATEGORIES = ['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','exhaust','steering','hvac','emissions','other'];
const CAT_ALIAS = { 'fuel-system': 'fuel', electronics: 'electrical', ignition: 'engine', 'wheels-tires': 'suspension' };
const toCat = (c) => { const l = String(c || '').toLowerCase(); return UI_CATEGORIES.includes(l) ? l : (CAT_ALIAS[l] || 'other'); };
const toSev = (s) => { const l = String(s || '').toLowerCase(); return (l === 'critical' || l === 'high') ? 'high' : l === 'low' ? 'low' : 'medium'; };
const slug = (s, n = 60) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, n).replace(/-+$/, '');
const genId = (mk, md, t) => (slug(mk) + '-' + slug(md) + '-' + slug(String(t).replace(/\([^)]*\)/g, '').replace(/\b(and|or|the|a|an|of|in|on|at|for|with)\b/gi, ''))).replace(/-+/g, '-');
const AMZ_TAG = 'au7o-20';
const enc = (s) => encodeURIComponent(String(s || '').trim());
function buyLinks(p) {
  const term = String(p.oemPartNumber || '').trim() || String(p.component || '').trim();
  if (!term) return [];
  const pn = String(p.oemPartNumber || '').trim();
  return [
    { vendor: 'Amazon', url: 'https://www.amazon.com/s?k=' + enc(term) + '&tag=' + AMZ_TAG },
    { vendor: 'RockAuto', url: pn ? ('https://www.rockauto.com/en/partsearch/?partnum=' + enc(pn)) : ('https://www.rockauto.com/en/partsearch/?q=' + enc(term)) },
    { vendor: 'eBay', url: 'https://www.ebay.com/sch/i.html?_nkw=' + enc(term) },
  ];
}
const validCite = ['forum','nhtsa','tsb','recall','article','manufacturer','reddit'];
const cleanCite = (c) => ({ type: validCite.includes(c.type) ? c.type : 'article', title: String(c.title || 'Reference').slice(0, 300), url: String(c.url || '') });
function normPart(p) {
  return { component: String(p.component || '').slice(0, 120), oemPartNumber: String(p.oemPartNumber || '').slice(0, 60), aftermarketXref: Array.isArray(p.aftermarketXref) ? p.aftermarketXref.map((x) => String(x).slice(0, 60)).slice(0, 6) : [], priceLow: Number.isFinite(p.priceLow) ? Math.round(p.priceLow) : null, priceHigh: Number.isFinite(p.priceHigh) ? Math.round(p.priceHigh) : null, note: String(p.note || '').slice(0, 300), buyLinks: buyLinks(p) };
}

(async () => {
  const wrap = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const rows = (wrap.result && wrap.result.confirmed) || wrap.confirmed || [];
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  let ins = 0, skip = 0, withParts = 0;
  for (const r of rows) {
    if (!r.title || !r.make || !r.model) { skip++; continue; }
    const id = genId(r.make, r.model, r.title);
    try {
      if (await prisma.knownIssue.findUnique({ where: { id }, select: { id: true } })) { skip++; continue; }
      const fixParts = Array.isArray(r.fixParts) ? r.fixParts.filter((p) => p && (p.oemPartNumber || p.component)).map(normPart) : [];
      if (fixParts.length) withParts++;
      await prisma.knownIssue.create({ data: {
        id, make: r.make, model: r.model,
        years: Array.isArray(r.years) ? r.years : [],
        trims: Array.isArray(r.trims) ? r.trims : [],
        engines: Array.isArray(r.engines) ? r.engines : [],
        category: toCat(r.category), title: String(r.title).slice(0, 300),
        description: String(r.description || ''), solution: String(r.solution || ''),
        severity: toSev(r.severity), confidence: 'medium',
        symptoms: Array.isArray(r.symptoms) ? r.symptoms : [],
        affectedSystems: [], dtcCodes: Array.isArray(r.dtcCodes) ? r.dtcCodes.map((d) => String(d).toUpperCase()) : [],
        estimatedCostLow: Number.isFinite(r.estimatedCostLow) ? Math.round(r.estimatedCostLow) : null,
        estimatedCostHigh: Number.isFinite(r.estimatedCostHigh) ? Math.round(r.estimatedCostHigh) : null,
        citations: Array.isArray(r.citations) ? r.citations.map(cleanCite) : [],
        communityRecommendations: [], fixParts,
        humanApproved: false, reportCount: 0, source: 'ai-researched', status: 'pending_review',
        lastReportedByOwners: '', reviewedOn: '',
      } });
      ins++;
    } catch (e) { console.error('  ! ' + id + ': ' + e.message); skip++; }
  }
  console.log('\nIssues+parts persist: inserted ' + ins + ' (pending_review), ' + withParts + ' with a fix-part, skipped ' + skip + ' (of ' + rows.length + ').');
  console.log('Next: promote (URL gate) -> blind PN re-audit -> push.');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
