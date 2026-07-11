// AI-FREE. Persist the parts-audit verification records back into KnownIssue
// fixes — the record-store migration. Rebuilds each issue's fixParts into the
// UNIFIED verified shape (verified deep links, variant rows, display_caveat vs
// internal verification_notes, provenance, seen_at), migrates the old
// communityRecommendations type:'part' entries into fixParts, and DROPS parts
// the audit couldn't verify. Correctness > depth > monetization already baked
// into the records (vendorLinks ordered by the auditor).
//
// Usage:
//   node scripts/_persist-parts-audit.js --input data/_dodge-full-audit-input.json --records data/_dodge-full-audit-out.json [--apply] [--min-confidence 0.7]
//
// Dry-run by default: prints exactly what WOULD change per issue. --apply writes.
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const args = process.argv.slice(2);
const getArg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const APPLY = args.includes('--apply');
const INPUT = getArg('--input', 'data/_dodge-full-audit-input.json');
const RECORDS = getArg('--records', 'data/_dodge-full-audit-out.json');
const MIN_CONF = parseFloat(getArg('--min-confidence', '0.7'));
const NOW = new Date().toISOString();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const isSearchUrl = (u) => !u || /\/s\?k=|[?&]k=|\/sch\/|[?&]_nkw=|\/search\?|\/partsearch\/|google\.[a-z.]+\/search/i.test(u);

// BRAND FIDELITY: drop a deep link only when it points at manufacturer B's OWN
// site while the component explicitly NAMES a different brand A (the Fluidyne/
// CSF radiator → mishimoto.com class). Conservative: retailer links (RockAuto/
// Amazon/eBay/Summit/Mopar) never trigger; a component with no brand token never
// triggers (so a Dorman PN 926-959 → dormanproducts.com stays).
const MFR_DOMAINS = { 'mishimoto.com': 'mishimoto', 'csfrace.com': 'csf', 'dormanproducts.com': 'dorman', 'powerstop.com': 'power stop', 'driveshaftshop.com': 'driveshaft shop', 'energysuspension': 'energy suspension', 'teamenergysuspension.com': 'energy suspension', 'hawkperformance': 'hawk', 'ebcbrakes': 'ebc', 'stoptech.com': 'stoptech', 'dbabrakes': 'dba', 'mishimoto': 'mishimoto' };
const BRAND_TOKENS = ['mishimoto', 'csf', 'fluidyne', 'power stop', 'ebc', 'hawk', 'brembo', 'stoptech', 'dba', 'moog', 'energy suspension', 'gates', 'denso', 'bosch', 'fel-pro', 'spicer', 'driveshaft shop', 'koni', 'bilstein', 'eibach', 'borla', 'corsa', 'afe', 'mishimoto'];
function brandConflict(componentText, url) {
  const u = (url || '').toLowerCase();
  let linkBrand = null;
  for (const [dom, b] of Object.entries(MFR_DOMAINS)) { if (u.includes(dom)) { linkBrand = b; break; } }
  if (!linkBrand) return false; // retailer, not a manufacturer's own site
  const comp = (componentText || '').toLowerCase();
  for (const t of BRAND_TOKENS) {
    if (comp.includes(t) && t !== linkBrand && !linkBrand.includes(t) && !t.includes(linkBrand)) return true;
  }
  return false;
}

// Build the unified fixPart from an audit record (+ its original input item for
// component name / price fallback).
function toUnifiedFixPart(rec, item) {
  const variants = (rec.variants || []).filter((v) => v && (v.oemPartNumber || v.note));
  const primaryPN = variants.find((v) => v.oemPartNumber)?.oemPartNumber || '';
  // FALLBACK (Layer 1): a guaranteed-live descriptive search so the Buy button
  // never dead-ends if a verified deep link later rots. Amazon (au7o-20) always
  // resolves. The TTL re-verify sweep + render use this when a deep link 404s.
  const veh = [item.years && item.years.length ? Math.min(...item.years) + '-' + Math.max(...item.years) : '', item.make, item.model].filter(Boolean).join(' ');
  const fbQuery = [item.make, item.model, item.part.component].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().slice(0, 120) || (item.part.component || 'auto part');
  const fallbackUrl = `https://www.amazon.com/s?k=${encodeURIComponent(fbQuery)}&tag=au7o-20`;
  // Keep only VERIFIED, non-search vendor links; order as the auditor returned
  // (correctness>depth>monetization). eBay links get EPN-tagged at render.
  const comp = item.part.component || rec.component || '';
  const buyLinks = (rec.vendorLinks || [])
    .filter((l) => l && l.url && l.verified && !isSearchUrl(l.url) && !brandConflict(comp, l.url))
    .map((l) => ({ vendor: l.vendor, url: l.url, linkType: l.linkType || 'product', verified: true, affiliate: !!l.affiliate }));
  return {
    component: item.part.component || rec.component || '',
    oemPartNumber: primaryPN || null,
    aftermarketXref: item.part.aftermarketXref || [],
    priceLow: item.part.priceLow ?? null,
    priceHigh: item.part.priceHigh ?? null,
    // Rendered: the short honest caveat. Internal: the GATE reasoning + sources.
    note: (rec.displayCaveat || '').slice(0, 300),
    verificationNotes: (rec.verificationNotes || '').slice(0, 2000),
    variants: variants.map((v) => ({ scope: v.scope || '', oemPartNumber: v.oemPartNumber || '', note: v.note || '' })),
    buyLinks,
    fallbackUrl,             // Layer 1 safety net — guaranteed-live descriptive search
    recallFirst: !!rec.recallFirst,
    provenance: rec.status === 'verified' ? 'audit_verified' : 'audit_corrected',
    confidence: typeof rec.confidence === 'number' ? rec.confidence : null,
    verified: true,
    seenAt: NOW,
    sources: (rec.sources || []).slice(0, 8),
  };
}

(async () => {
  const items = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));           // indexed by idx
  const wrap = JSON.parse(fs.readFileSync(RECORDS, 'utf-8'));
  const records = wrap.records || wrap.result?.records || wrap;
  console.log(`Loaded ${items.length} input parts + ${records.length} audit records. min-confidence=${MIN_CONF}. ${APPLY ? 'APPLY' : 'DRY-RUN'}`);

  // Index each record + its input item by (issueId, source, partIndex) so we can
  // MERGE precisely against the live data — never rebuild-from-audit-only (that
  // would delete un-audited parts if a slice/agent didn't cover them).
  const byKey = new Map();
  const key = (iss, src, pi) => `${iss}::${src}::${pi}`;
  records.forEach((r, i) => {
    const idx = (typeof r.idx === 'number' ? r.idx : i);
    const item = (items[idx] && (item_matches(items[idx], r) || items[idx].idx === idx)) ? items[idx] : items[i];
    if (!item) return;
    byKey.set(key(item.issueId, item.source, item.partIndex), { rec: r, item });
  });
  function item_matches() { return true; } // idx alignment is the mapping; this keeps the guard readable

  const issueIds = [...new Set(items.map((it) => it.issueId))];
  let issuesChanged = 0, written = 0, droppedC = 0, heldC = 0, migrated = 0, kept = 0;

  for (const issueId of issueIds) {
    const issue = await prisma.knownIssue.findUnique({ where: { id: issueId }, select: { id: true, title: true, fixParts: true, communityRecommendations: true } });
    if (!issue) { console.log(`  ⚠ ${issueId}: not found, skip`); continue; }

    const origFP = Array.isArray(issue.fixParts) ? issue.fixParts : [];
    const origCR = Array.isArray(issue.communityRecommendations) ? issue.communityRecommendations : [];

    const newFixParts = [];
    let iDropped = 0, iHeld = 0, iWrote = 0;

    // 1. Walk ORIGINAL fixParts by index — replace/drop/hold/keep.
    origFP.forEach((p, pi) => {
      const hit = byKey.get(key(issueId, 'fixParts', pi));
      if (!hit) { newFixParts.push(p); kept++; return; }             // not audited → keep as-is
      const conf = typeof hit.rec.confidence === 'number' ? hit.rec.confidence : 0;
      if (hit.rec.status === 'drop') { iDropped++; droppedC++; return; }
      if (conf < MIN_CONF) { newFixParts.push(p); iHeld++; heldC++; return; } // shaky → keep ORIGINAL (don't lose it)
      const fp = toUnifiedFixPart(hit.rec, hit.item);
      if (!fp.oemPartNumber && fp.buyLinks.length === 0) { newFixParts.push(p); iHeld++; heldC++; return; }
      newFixParts.push(fp); iWrote++; written++;
    });

    // 2. Migrate ORIGINAL communityRec type:'part' entries into fixParts (verified only).
    const newCR = [];
    origCR.forEach((x, pi) => {
      const isPart = x && (x.type === 'part' || x.partNumber || x.affiliateUrl);
      if (!isPart) { newCR.push(x); return; }                        // tips/upgrades — keep untouched
      const hit = byKey.get(key(issueId, 'communityRec', pi));
      if (!hit) { newCR.push(x); kept++; return; }                   // not audited → leave in CR
      const conf = typeof hit.rec.confidence === 'number' ? hit.rec.confidence : 0;
      if (hit.rec.status === 'drop') { iDropped++; droppedC++; return; }
      if (conf < MIN_CONF) { newCR.push(x); iHeld++; heldC++; return; }
      const fp = toUnifiedFixPart(hit.rec, hit.item);
      if (!fp.oemPartNumber && fp.buyLinks.length === 0) { newCR.push(x); iHeld++; heldC++; return; }
      newFixParts.push(fp); iWrote++; written++; migrated++;
    });

    const before = origFP.length + origCR.filter((x) => x && (x.type === 'part' || x.partNumber)).length;
    console.log(`  ${issue.title.slice(0, 44).padEnd(44)} parts ${before} → ${newFixParts.length}  (verified:${iWrote} dropped:${iDropped} held-kept-original:${iHeld})`);

    if (APPLY) {
      await prisma.knownIssue.update({ where: { id: issueId }, data: { fixParts: newFixParts, communityRecommendations: newCR } });
    }
    issuesChanged++;
  }

  console.log(`\n${APPLY ? 'WROTE' : 'WOULD WRITE'} — issues:${issuesChanged} | verified-parts:${written} (migrated from communityRec:${migrated}) | dropped:${droppedC} | held→kept-original:${heldC} | untouched(no record):${kept}`);
  if (!APPLY) console.log('DRY-RUN — re-run with --apply to write.');
  await prisma.$disconnect(); await pool.end();
})();
