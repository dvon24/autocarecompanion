// Part-propagation audit — Stage 0 (data prep, AI-free).
//
// Devon: "we need to audit and make sure if the part is listed in other makes
// or model pages." A verified fix-part on one model usually fixes the SAME
// component failure on its platform-mates (FCA EVAP ESIM, Pentastar, ZF trans,
// etc.). This finds, for each DONOR part (an issue that HAS a verified OEM PN),
// the RECIPIENT issues — same corporate family, different make/model, same
// failure — that DON'T already carry that part. The heuristic only NARROWS the
// field; a downstream web_search agent is the real fitment gate (never blind-
// copy a PN across makes — that's the Hemi->Acura cross-link trap).
//
// Output: data/_part-propagation-candidates.json  -> [{ pn, component, note,
//   priceLow, priceHigh, aftermarketXref, donor:{id,make,model,title,category},
//   candidates:[{id,make,model,title,category,years,engines,dtcCodes}] }]
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Corporate-family map (mirrors src/lib/known-issues.ts MAKE_GROUP).
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
const groupOf = (m) => MAKE_GROUP[String(m || '').toLowerCase().trim()] || null;
const normPn = (p) => String(p || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const STOP = new Set(['the','and','for','with','from','this','that','also','your','their','have','has','was','are','due','can','not','out','too','its','a','an','of','on','in','to','or','is','it','at','by','as','vehicle','car','issue','problem','failure','recall','tsb','front','rear','left','right','engine','models','model','year','years','some','may','causing','cause','caused','leak','leaks','noise']);
function tokens(s) {
  return new Set(String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w)));
}
function overlap(a, b) { let n = 0; for (const t of a) if (b.has(t)) n++; return n; }

// argv: optional --family=stellantis to limit; optional --max-cands=4
const familyArg = (process.argv.find((a) => a.startsWith('--family=')) || '').split('=')[1] || null;
const MAX_CANDS = parseInt((process.argv.find((a) => a.startsWith('--max-cands=')) || '').split('=')[1] || '5', 10);

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { id: true, make: true, model: true, title: true, category: true, symptoms: true, dtcCodes: true, engines: true, years: true, fixParts: true },
  });
  console.log('Loaded ' + rows.length + ' published issues.');

  // index issues by corporate family for fast candidate lookup
  const byFamily = new Map();
  for (const r of rows) {
    const g = groupOf(r.make);
    if (!g) continue;
    if (familyArg && g !== familyArg) continue;
    if (!byFamily.has(g)) byFamily.set(g, []);
    byFamily.get(g).push(r);
  }

  // donors: issues with >=1 fixPart carrying a real PN
  const clusters = [];
  let donorParts = 0;
  for (const r of rows) {
    const g = groupOf(r.make);
    if (!g) continue;
    if (familyArg && g !== familyArg) continue;
    const parts = Array.isArray(r.fixParts) ? r.fixParts : [];
    const fam = byFamily.get(g) || [];
    const donorTok = tokens(r.title);
    for (const p of parts) {
      if (!p || !p.oemPartNumber) continue;
      const pn = normPn(p.oemPartNumber);
      if (pn.length < 4) continue;
      donorParts++;
      // The COMPONENT (the actual part) is the precise signal — the candidate
      // issue must itself reference that component, not merely share generic
      // words with the donor's title. This kills "backup-camera PN -> Uconnect
      // freeze" style false matches.
      const compTok = tokens(p.component || '');
      const cands = [];
      for (const c of fam) {
        if (c.id === r.id) continue;
        // must be a DIFFERENT make OR model (sibling page), same family
        if (String(c.make).toLowerCase() === String(r.make).toLowerCase() && String(c.model).toLowerCase() === String(r.model).toLowerCase()) continue;
        // skip if candidate already has this exact PN
        const cParts = Array.isArray(c.fixParts) ? c.fixParts : [];
        if (cParts.some((cp) => cp && normPn(cp.oemPartNumber) === pn)) continue;
        const catMatch = String(c.category || '') === String(r.category || '');
        const candTitleTok = tokens(c.title);
        const compInTitle = overlap(compTok, candTitleTok); // does candidate's TITLE name this component?
        const dtcShared = Array.isArray(c.dtcCodes) && Array.isArray(r.dtcCodes) && c.dtcCodes.some((d) => r.dtcCodes.includes(d));
        const engShared = Array.isArray(c.engines) && Array.isArray(r.engines) && c.engines.some((e) => r.engines.map((x) => String(x).toLowerCase()).includes(String(e).toLowerCase()));
        // Require the component to be named in the candidate title (>=1 shared
        // component token) OR a shared DTC. Then score and threshold.
        if (compInTitle < 1 && !dtcShared) continue;
        const score = compInTitle * 2 + (dtcShared ? 3 : 0) + (engShared && catMatch ? 2 : 0) + (catMatch ? 1 : 0);
        if (score < 3) continue;
        // TIER A = concrete platform proof (shared DTC or engine code) — high
        // precision. TIER B = component-name match only — plausible but the
        // word may name a DIFFERENT part (camera, sensor, module); needs the
        // agent to resolve. Run A first.
        const tier = (dtcShared || engShared) ? 'A' : 'B';
        cands.push({ id: c.id, make: c.make, model: c.model, title: c.title, category: c.category, years: c.years || [], engines: c.engines || [], dtcCodes: c.dtcCodes || [], _score: score, _tier: tier });
      }
      if (cands.length === 0) continue;
      cands.sort((a, b) => b._score - a._score);
      clusters.push({
        pn: p.oemPartNumber,
        component: p.component || '',
        note: p.note || '',
        priceLow: p.priceLow ?? null, priceHigh: p.priceHigh ?? null,
        aftermarketXref: p.aftermarketXref || [],
        donor: { id: r.id, make: r.make, model: r.model, title: r.title, category: r.category },
        candidates: cands.slice(0, MAX_CANDS).map(({ _score, ...c }) => c),
      });
    }
  }

  // Within each cluster, Tier A (concrete DTC/engine proof) first.
  for (const cl of clusters) cl.candidates.sort((a, b) => (a._tier === 'A' ? 0 : 1) - (b._tier === 'A' ? 0 : 1) || b._score - a._score);
  // sort clusters: most Tier-A candidates first (highest-confidence leverage)
  const tierAcount = (cl) => cl.candidates.filter((c) => c._tier === 'A').length;
  clusters.sort((a, b) => tierAcount(b) - tierAcount(a) || b.candidates.length - a.candidates.length);
  const totalPairs = clusters.reduce((s, c) => s + c.candidates.length, 0);
  const totalA = clusters.reduce((s, c) => s + c.candidates.filter((x) => x._tier === 'A').length, 0);
  console.log('Tier A (shared DTC/engine — concrete): ' + totalA + ' pairs');
  console.log('Tier B (component-name match only): ' + (totalPairs - totalA) + ' pairs');
  const out = 'data/_part-propagation-candidates.json';
  fs.writeFileSync(out, JSON.stringify(clusters, null, 2));

  // Also emit a FLAT, Tier-A-only, capped batch the verifier workflow consumes
  // (one row per part->candidate pair, donor part info inlined). Tier A first
  // because shared DTC/engine is concrete platform proof — highest precision.
  const BATCH_MAX = parseInt((process.argv.find((a) => a.startsWith('--batch-max=')) || '').split('=')[1] || '90', 10);
  const tierAonly = !process.argv.includes('--include-tierB');
  // Skip pairs already attempted in a prior run (confirmed OR rejected) so the
  // audit advances batch-by-batch and never re-burns tokens on the same reject.
  let seen = new Set();
  try { seen = new Set(JSON.parse(fs.readFileSync('data/_propagation-seen.json', 'utf8'))); } catch { /* first run */ }
  const pairKey = (cid, pn) => String(cid) + '|' + normPn(pn);
  const pairs = [];
  for (const cl of clusters) {
    for (const c of cl.candidates) {
      if (tierAonly && c._tier !== 'A') continue;
      if (seen.has(pairKey(c.id, cl.pn))) continue;
      pairs.push({
        part: { pn: cl.pn, component: cl.component, note: cl.note, priceLow: cl.priceLow, priceHigh: cl.priceHigh, aftermarketXref: cl.aftermarketXref },
        donor: cl.donor,
        candidate: { id: c.id, make: c.make, model: c.model, title: c.title, years: c.years, dtcCodes: c.dtcCodes },
      });
      if (pairs.length >= BATCH_MAX) break;
    }
    if (pairs.length >= BATCH_MAX) break;
  }
  fs.writeFileSync('data/_propagation-batch.json', JSON.stringify(pairs, null, 2));
  console.log('Batch (Tier-' + (tierAonly ? 'A only' : 'A+B') + ', capped ' + BATCH_MAX + '): ' + pairs.length + ' pairs -> data/_propagation-batch.json');
  console.log('Donor parts w/ PN: ' + donorParts);
  console.log('Clusters (donor parts with >=1 candidate): ' + clusters.length);
  console.log('Total (part -> candidate) pairs to verify: ' + totalPairs);
  console.log('Wrote ' + out);
  if (clusters[0]) {
    console.log('\nTop cluster: "' + clusters[0].component + '" PN ' + clusters[0].pn + ' (' + clusters[0].donor.make + ' ' + clusters[0].donor.model + ') -> ' + clusters[0].candidates.length + ' candidates:');
    for (const c of clusters[0].candidates) console.log('   - ' + c.make + ' ' + c.model + ': ' + c.title.slice(0, 64));
  }
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
