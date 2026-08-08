#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * READ-ONLY fitment verification of the part numbers our articles quote,
 * against the ShowMeTheParts catalog, per YEAR and per ENGINE.
 *
 * WHY THIS EXISTS
 * ---------------
 * The previous method fetched each part's buy link and asked "does this page
 * load?". That answers the wrong question. A link can resolve perfectly to a
 * part that does not fit the car — the Ford audit found every link live and 42%
 * still wrong — and when RockAuto was unreachable for an evening, "no result"
 * was misread as "fabricated" and a third of round one's findings were false.
 *
 * Asking the catalog which parts fit a given year + engine inverts it. Our part
 * number is either in the fitting set or it is not, and when it is not we get
 * the parts that ARE. One authoritative answer instead of an inference.
 *
 * WHAT IT PRODUCES
 * ----------------
 * For every entry, per year:
 *   verdict  confirmed   our PN is in the fitting set for at least one year
 *            absent      the catalog covers this vehicle but never lists our PN
 *            no-catalog  no candidates at all — cannot judge, NOT evidence of a
 *                        bad part (thin coverage, wrong product category, or an
 *                        OEM-only part the aftermarket catalog does not carry)
 *   fitmentYears  the years our PN actually appears in → this is what populates
 *                 `fixPart.fitment.years` (see src/lib/known-issue-part-fitment.ts)
 *   candidates    the fitting parts, so an `absent` verdict names a replacement
 *
 * LIMITS, STATED PLAINLY
 * ----------------------
 * - This is an AFTERMARKET catalog. It carries Moog / Gates / Dorman / Fel-Pro
 *   numbers, NOT OEM numbers like 68029736AA. An OEM part number will read
 *   `no-catalog` here and that means nothing — check it against the OEM catalog.
 * - Catalog fitment proves the part FITS. It never proves the part REPAIRS the
 *   issue the article describes. Repair role stays a human judgment.
 *
 * Nothing is written to the database. Output is a JSON artifact.
 *
 * Usage:
 *   node scripts/verify-parts-fitment.js --in data/_fitment-worklist.json \
 *        --out data/_fitment-verdicts.json [--limit 25] [--year-cap 6]
 */
const fs = require('fs');
const path = require('path');
// Reuse the existing client's parsing and field mapping rather than re-deriving
// the XML field names — guessing them produced silent empty results, which read
// as "absent" and would have condemned a correct part.
const {
  requestXml, parseItems, matchesAllTokens, filterPartCandidates, candidateFromPart,
} = require('./showmetheparts-known-issue-candidates');

const PROJECT_ROOT = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env.local') });

const CACHE_FILE = path.join(PROJECT_ROOT, 'data', '_smtp-cache.json');

/** Part numbers are printed inconsistently (K750744, K-750744, k750744). */
function normalizePn(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// ── a resumable cache, so a re-run costs almost nothing ───────────────────────
let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch { cache = {}; }
let cacheDirty = false;

function saveCache() {
  if (!cacheDirty) return;
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf8');
  cacheDirty = false;
}

async function lookup(key, params, itemTag) {
  if (cache[key]) return cache[key];
  const items = parseItems(await requestXml(params), itemTag);
  cache[key] = items;
  cacheDirty = true;
  return items;
}

const named = (rows, name) => rows.find((r) => String(r.data || '').toLowerCase() === String(name || '').toLowerCase());

/**
 * One (year, make, model) → the fitting parts for a product/engine/part-type
 * slice. Every step is cached independently, so a second year on the same model
 * only re-fetches the parts call.
 */
async function fittingParts({ year, make, model, productMatch, engineMatch, partTypeMatch }) {
  const makes = await lookup(`makes:${year}`, { lookup: 'make3', year }, 'make');
  const makeRow = named(makes, make);
  if (!makeRow) return { covered: false, reason: `make "${make}" not in catalog for ${year}`, parts: [] };

  const models = await lookup(`models:${year}:${makeRow.id}`, { lookup: 'model', year, make: makeRow.id }, 'model');
  const modelRow = named(models, model);
  if (!modelRow) return { covered: false, reason: `model "${model}" not in catalog for ${year}`, parts: [] };

  const products = await lookup(
    `products:${year}:${makeRow.id}:${modelRow.id}`,
    { lookup: 'product', year, make: makeRow.id, model: modelRow.id }, 'product',
  );
  const selectedProducts = productMatch
    ? products.filter((p) => matchesAllTokens(p.data, productMatch))
    : products;
  if (selectedProducts.length === 0) return { covered: false, reason: `no product category matching "${productMatch}"`, parts: [] };

  const out = [];
  let rawCount = 0;
  for (const product of selectedProducts) {
    const engines = await lookup(
      `engines:${year}:${makeRow.id}:${modelRow.id}:${product.id}`,
      { lookup: 'engine', year, make: makeRow.id, model: modelRow.id, product: product.id }, 'engine',
    );
    const selectedEngines = engineMatch ? engines.filter((e) => matchesAllTokens(e.data, engineMatch)) : engines;
    for (const engine of selectedEngines) {
      const parts = await lookup(
        `parts:${year}:${makeRow.id}:${modelRow.id}:${product.id}:${engine.id}`,
        { lookup: 'parts', year, make: makeRow.id, model: modelRow.id, product: product.id, engine: engine.id }, 'partsdata',
      );
      // `rawCount` is the unfiltered set for this engine. It is what separates
      // "the catalog covers this vehicle and our part is not in it" from "our
      // part-type filter matched nothing" — only the first is evidence.
      rawCount += parts.length;
      for (const part of filterPartCandidates(parts, partTypeMatch)) {
        const candidate = candidateFromPart(part, { year, engine: engine.data, product: product.data });
        out.push({
          supplier: candidate.supplier,
          partNumber: candidate.partNumber,
          partType: candidate.partType,
          brand: candidate.brand,
          engine: engine.data,
        });
      }
    }
  }
  return { covered: true, reason: '', parts: out, rawCount };
}

async function verifyEntry(entry, yearCap) {
  // Sample ACROSS the span, not the first N. Taking the earliest years only
  // would test a 1990-1997 article exclusively at 1990-1992 and then report a
  // `fitment.years` that silently excludes most of the article's own range.
  const allYears = [...new Set(entry.years || [])].sort((a, b) => a - b);
  const years = allYears.length <= yearCap
    ? allYears
    : Array.from({ length: yearCap }, (_, i) => allYears[Math.round((i * (allYears.length - 1)) / (yearCap - 1))]);
  const target = normalizePn(entry.partNumber);
  const fitmentYears = [];
  const candidatesByYear = {};
  const notes = [];
  let anyCovered = false;

  for (const year of years) {
    let result;
    try {
      result = await fittingParts({ ...entry, year });
    } catch (error) {
      notes.push(`${year}: lookup failed — ${error.message}`);
      continue; // an API failure is NOT evidence about the part
    }
    if (!result.covered) { notes.push(`${year}: ${result.reason}`); continue; }
    if (result.parts.length === 0) {
      // The vehicle resolved but nothing matched the part-type filter. That is a
      // gap in OUR query, not a fact about the part. Saying "absent" here is
      // precisely the mistake that made round one condemn correct parts.
      notes.push(`${year}: no part-type match for "${entry.partTypeMatch}" (${result.rawCount} parts in category)`);
      continue;
    }
    anyCovered = true;
    candidatesByYear[year] = result.parts.map((p) => `${p.supplier} ${p.partNumber}`.trim());
    if (result.parts.some((p) => normalizePn(p.partNumber) === target)) fitmentYears.push(year);
  }

  let verdict;
  if (!anyCovered) verdict = 'no-catalog';
  // A component-only article quotes no part number at all, so there is nothing
  // to confirm or refute — we are SOURCING one. Calling that "absent" would
  // report thousands of non-existent errors.
  else if (!target) verdict = 'discovered';
  else if (fitmentYears.length > 0) verdict = 'confirmed';
  else verdict = 'absent';

  return {
    id: entry.id,
    vehicle: `${years[0] || '?'} ${entry.make} ${entry.model}`,
    quotedPartNumber: entry.partNumber,
    verdict,
    fitmentYears,
    yearsChecked: years,
    candidatesByYear,
    notes,
  };
}

(async () => {
  const args = process.argv.slice(2);
  const arg = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
  };
  const inFile = arg('--in', 'data/_fitment-worklist.json');
  const outFile = arg('--out', 'data/_fitment-verdicts.json');
  const limit = Number(arg('--limit', '0')) || Infinity;
  const yearCap = Number(arg('--year-cap', '6'));

  const worklist = JSON.parse(fs.readFileSync(path.resolve(PROJECT_ROOT, inFile), 'utf8'));
  const entries = (Array.isArray(worklist) ? worklist : worklist.entries).slice(0, limit);
  console.log(`verifying ${entries.length} parts, up to ${yearCap} years each`);

  const results = [];
  for (const [index, entry] of entries.entries()) {
    const result = await verifyEntry(entry, yearCap);
    results.push(result);
    saveCache();
    console.log(
      `  [${index + 1}/${entries.length}] ${result.verdict.padEnd(10)} ${entry.partNumber || '(none)'} — ${result.vehicle}` +
      (result.verdict === 'confirmed' ? ` (fits ${result.fitmentYears.join(', ')})` : ''),
    );
  }

  const tally = results.reduce((acc, r) => ({ ...acc, [r.verdict]: (acc[r.verdict] || 0) + 1 }), {});
  fs.writeFileSync(path.resolve(PROJECT_ROOT, outFile), JSON.stringify({
    checkedAt: new Date().toISOString(),
    source: 'ShowMeTheParts subscription API',
    guardrail: 'Catalog fitment proves the part FITS. It never proves the part REPAIRS the issue.',
    tally,
    results,
  }, null, 1));
  saveCache();
  console.log('\nTALLY:', JSON.stringify(tally));
  console.log('report:', outFile);
})().catch((error) => { saveCache(); console.error('ERR', error.message); process.exitCode = 1; });
