/**
 * Pre-seed the maintenance-parts record store (fable 5's plan, step 2).
 *
 * The parts behind maintenance-task taps are a small enumerable set. This runs
 * the A-STANDARD verify (web-search → PN from a live product page, deepest
 * verified product URL, or DROP) for that set × the active vehicle population
 * and writes the result to VehiclePartLookup under `part:<name>` — so a tap
 * hits cache and renders a real product deep link INSTANTLY (no live verify in
 * the message path).
 *
 * Mirrors src/lib/verified-parts.ts runAStandardVerify (kept in sync by hand).
 * Usage:
 *   node scripts/_preseed-maintenance-parts.js                 # all garage vehicles
 *   node scripts/_preseed-maintenance-parts.js --vehicle "2015 Dodge Challenger SRT 392"
 *   node scripts/_preseed-maintenance-parts.js --limit 5       # cap vehicles (test)
 */

// .env.local FIRST — dotenv does not override already-set vars, and .env has a
// stale DATABASE_URL. .env.local must win.
try { require('dotenv').config({ path: '.env.local' }); require('dotenv').config(); } catch { /* dotenv optional */ }
const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// The maintenance vocabulary — the parts a maintenance tap asks for. Universal
// SUPPLIES (gloves, pan, cleaner) are intentionally excluded — they never get
// per-vehicle verification (they'd return wrong-vehicle junk).
const MAINT_PARTS = [
  'engine oil', 'oil filter', 'rear differential fluid', 'engine air filter',
  'cabin air filter', 'engine coolant', 'brake fluid', 'transmission fluid',
  'front brake pads', 'rear brake pads', 'front brake rotors', 'spark plugs',
  'wiper blades', 'serpentine belt', 'power steering fluid',
];

const RETAILER_HOST = /(^|\.)(amazon\.[a-z.]+|rockauto\.com|ebay\.[a-z.]+|autozone\.com|oreillyauto\.com|napaonline\.com|summitracing\.com|partsgeek\.com|1aauto\.com|carid\.com|walmart\.com|moparpartsgiant\.com|gmpartsgiant\.com|mopar\.com|advanceautoparts\.com|americanmuscle\.com|tirerack\.com)$/i;

function isRetailerProductUrl(u, pn) {
  if (!/^https?:\/\//i.test(u)) return false;
  let host = '', path = '';
  try { const url = new URL(u); host = url.hostname; path = url.pathname.toLowerCase(); } catch { return false; }
  if (!RETAILER_HOST.test(host)) return false;
  if (/[?&](k|q|_nkw|searchstring|search|keyword|text|searchterm)=/i.test(u)) return false;
  if (/\/search(\/|\?|$)|\/s\?|\/sch\//i.test(u)) return false;
  const p = (pn || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (p.length >= 5 && u.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p)) return true;
  if (/\/(dp|gp\/product|itm|ipd|moreinfo|product|products)\//i.test(path)) return true;
  if (/rockauto\.com/i.test(host) && /partnum=/i.test(u)) return true;
  return false;
}

function ownAffiliate(u) {
  try {
    const url = new URL(u);
    if (/amazon\./i.test(url.hostname)) {
      for (const p of ['tag', 'linkCode', 'ascsubtag', 'ref_', 'linkId']) url.searchParams.delete(p);
      url.searchParams.set('tag', 'au7o-20');
      return url.toString();
    }
    return u;
  } catch { return u; }
}

async function checkLive(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Au7oLinkCheck/1.0' } });
    if (res.status === 405 || res.status === 501) res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Au7oLinkCheck/1.0', Range: 'bytes=0-0' } });
    if (res.status === 404 || res.status === 410) return 'dead';
    return 'ok';
  } catch { return 'unknown'; } finally { clearTimeout(timer); }
}

async function aStandardVerify(vehicleStr, partName) {
  const prompt = `You are an OEM parts auditor for au7o. USE WEB SEARCH — never answer from memory. Find the buyable part for ONE component on ONE vehicle, to a strict standard.

Vehicle: ${vehicleStr}
Component: ${partName}

RULES (a wrong-fitment or wrong-spec deep link converts then refunds — correctness is the product):
- COMPONENT FIDELITY: correct OEM part number for THIS EXACT component. Verify the part TYPE matches. NEVER borrow a sibling part's number.
- SPEC MATCH: FIRST determine the correct factory specification for this component on THIS exact vehicle (e.g. the exact gear-oil viscosity — 75W-140 vs 75W-85 is NOT interchangeable). The product you link MUST match that spec. A product with a different viscosity/grade/type is WRONG — reject it.
- AVAILABILITY: the product must be CURRENTLY AVAILABLE for sale. If the listing is DISCONTINUED / superseded / no-longer-available, find the current replacement (superseding PN) or status "drop". Do NOT link a discontinued page.
- The part number MUST come FROM a real product page you opened via search — NOT memory.
- DEEP LINKS (multi-vendor): find a verified product page on AS MANY stores as you can confirm — Amazon, RockAuto, eBay, the OEM catalog (Mopar eStore/MoparPartsGiant/GM Parts Giant), AutoZone, etc. EACH must be a real, in-stock, correct-spec PRODUCT page. Include ONLY vendors you verified. NEVER a search/category/homepage.
- If you cannot find this component's own part number AND at least one real, in-stock, correct-spec product page, status "drop".
- aftermarket: up to 2 equivalents (brand + own part number) by fitment.

Return ONLY JSON: {"status":"verified"|"drop","partNumber":"","oemBrand":"","buyLinks":[{"vendor":"","url":""}],"aftermarket":[{"brand":"","partNumber":""}],"caveat":""}`;

  let msg;
  try {
    msg = await client.messages.create({
      model: 'claude-haiku-4-5', max_tokens: 1200,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }],
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (e) { return null; }

  let text = ''; const urls = [];
  for (const b of msg.content) {
    if (b.type === 'text') text += b.text;
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) for (const r of b.content) if (r.type === 'web_search_result' && r.url) urls.push(r.url);
  }
  const m = text.replace(/```json/g, '').replace(/```/g, '').match(/\{[\s\S]*\}/);
  if (!m) return null;
  let j; try { j = JSON.parse(m[0]); } catch { return null; }
  if (j.status !== 'verified') return null;

  const pn = (j.partNumber || '').trim();
  const vname = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
  const claimed = Array.isArray(j.buyLinks) ? j.buyLinks.map((b) => b && b.url).filter(Boolean) : [];
  const cands = [...claimed, ...urls].filter((u) => typeof u === 'string' && u).filter((u) => isRetailerProductUrl(u, pn));
  const byVendor = new Map();
  for (const u of cands) { const v = vname(u); if (!byVendor.has(v)) byVendor.set(v, u); if (byVendor.size >= 6) break; }
  const checked = await Promise.all([...byVendor.entries()].map(async ([v, u]) => ({ v, u, live: (await checkLive(u)) !== 'dead' })));
  const liveLinks = checked.filter((c) => c.live).map((c) => ({ vendor: c.v, url: ownAffiliate(c.u) }));
  if (!liveLinks.length) return null;

  const pnNorm = pn.toLowerCase().replace(/[^a-z0-9]/g, '');
  const pnInUrl = pnNorm.length >= 5 && liveLinks.some((l) => l.url.toLowerCase().replace(/[^a-z0-9]/g, '').includes(pnNorm));
  const aftermarket = Array.isArray(j.aftermarket) ? j.aftermarket.filter((a) => a && a.brand && a.partNumber).map((a) => ({ brand: String(a.brand), partNumber: String(a.partNumber) })).slice(0, 2) : [];
  return { partNumber: pnInUrl ? pn : '', oemBrand: j.oemBrand || '', buyLinks: liveLinks, aftermarket };
}

async function main() {
  const args = process.argv.slice(2);
  const vFlag = args.includes('--vehicle') ? args[args.indexOf('--vehicle') + 1] : null;
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : null;

  let vehicles;
  if (vFlag) {
    const [year, make, model, ...t] = vFlag.split(' ');
    vehicles = [{ year: parseInt(year, 10), make, model, trim: t.join(' ') || 'Base' }];
  } else {
    const rows = await prisma.vehicle.findMany({ select: { year: true, make: true, model: true, trim: true }, distinct: ['year', 'make', 'model', 'trim'] });
    vehicles = rows.map((r) => ({ year: r.year, make: r.make, model: r.model, trim: r.trim || 'Base' }));
  }
  if (limit) vehicles = vehicles.slice(0, limit);

  console.log(`Pre-seeding ${MAINT_PARTS.length} parts × ${vehicles.length} vehicles = ${MAINT_PARTS.length * vehicles.length} lookups`);
  let done = 0, verified = 0, dropped = 0, skipped = 0;

  for (const v of vehicles) {
    const vehicleStr = `${v.year} ${v.make} ${v.model} ${v.trim}`.replace(/\s+/g, ' ').trim();
    for (const partName of MAINT_PARTS) {
      const task = `part:${partName.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()}`;
      const existing = await prisma.vehiclePartLookup.findUnique({ where: { year_make_model_trim_task: { year: v.year, make: v.make, model: v.model, trim: v.trim, task } } }).catch(() => null);
      if (existing && existing.webSearchConfirmed) { skipped++; continue; }

      const hit = await aStandardVerify(vehicleStr, partName).catch(() => null);
      const confirmed = !!(hit && hit.buyLinks && hit.buyLinks.length);
      const parts = hit ? [{ name: partName, partNumber: hit.partNumber, oemBrand: hit.oemBrand, crossReferences: hit.aftermarket, searchQuery: partName, confidence: 'oem-verified' }] : [];
      const verificationLog = confirmed ? [{ partNumber: hit.partNumber || '', searchQuery: partName, found: true, retailers: hit.buyLinks.map((l) => l.vendor), sourceUrls: hit.buyLinks.map((l) => l.url), retried: false }] : [];
      // No upsert — PrismaPg adapter doesn't support it. findUnique → update/create.
      const key = { year: v.year, make: v.make, model: v.model, trim: v.trim, task };
      const data = { parts, verificationLog, source: 'pipeline-freetext', status: confirmed ? 'verified' : 'failed', webSearchConfirmed: confirmed, verifiedAt: new Date() };
      const found = await prisma.vehiclePartLookup.findUnique({ where: { year_make_model_trim_task: key } }).catch(() => null);
      if (found) await prisma.vehiclePartLookup.update({ where: { year_make_model_trim_task: key }, data }).catch((e) => console.warn('update failed', e.message));
      else await prisma.vehiclePartLookup.create({ data: { ...key, ...data } }).catch((e) => console.warn('create failed', e.message));

      done++; confirmed ? verified++ : dropped++;
      console.log(`  ${confirmed ? '✓' : '·'} ${vehicleStr} — ${partName}${hit && hit.partNumber ? ` [${hit.partNumber}]` : ''}`);
    }
  }
  console.log(`\nDone. ${done} looked up · ${verified} verified · ${dropped} dropped/unverified · ${skipped} already cached.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
