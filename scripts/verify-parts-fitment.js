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
  requestXml, parseItems, matchesAllTokens, candidateFromPart,
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

const norm = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const toks = (value) => String(value || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
const named = (rows, name) => rows.find((r) => norm(r.data) === norm(name));

/**
 * Our model names and the catalog's are written by different people and rarely
 * agree. Exact-match cost us 511 rows on the first pass, every one of them
 * reported as `no-catalog` — which reads as "the part could not be found" when
 * the truth was that we never asked about the right vehicle:
 *
 *   ours "Mazda3"      catalog "3"            (make repeated in our name)
 *   ours "Mazdaspeed3" catalog "3"            (performance trim, not a catalog model)
 *   ours "MX-5 Miata"  catalog "MX-5"         (we carry the long name)
 *   ours "RX"          catalog "RX350","RX450H"  (we carry the series, it carries the variants)
 *
 * The last case is why this returns a LIST. When our article covers a series,
 * every variant in that series is a legitimate place to look, so the parts are
 * unioned and each candidate is tagged with the catalog model it came from —
 * a reviewer needs to see that an IS250 part was offered for an "IS" article.
 */
/**
 * Names the catalog files under a convention of its own. These are systematic,
 * not one-offs: Mercedes sells a "C-Class" and the catalog lists C180…C63 AMG,
 * and Nissan's "Hardbody" is a nickname the catalog never uses. Each entry was
 * confirmed against a real cached model list before being added — guessing here
 * is how a wrong part reaches a page.
 */
// Order matters: the first pattern that matches wins, so the classes whose
// catalog stem is NOT just their letter have to be listed before the general rule.
const MODEL_ALIASES = [
  [/^mclass$/, () => 'ml'],                    // M-Class → ML350, ML63 AMG
  [/^([a-z]+)class$/, (m) => m[1]],            // C-Class → C180, C300, C63 AMG
  [/^slkslc$/, () => 'slk'],                   // SLK/SLC → SLK250 (SLC is the later rename)
  [/^hardbody$/, () => 'pickup'],              // Nissan's nickname for the D21
];

function aliasFor(w) {
  for (const [pattern, resolve] of MODEL_ALIASES) {
    const m = pattern.exec(w);
    if (m) return resolve(m);
  }
  return '';
}

/** Does the catalog's token run appear contiguously inside ours, or ours in theirs? */
function tokenRunMatch(a, b) {
  const [x, y] = [toks(a), toks(b)];
  const [short, long] = x.length <= y.length ? [x, y] : [y, x];
  if (!short.length) return false;
  for (let i = 0; i + short.length <= long.length; i += 1) {
    if (short.every((t, j) => long[i + j] === t)) return true;
  }
  return false;
}

function resolveModels(models, wanted, make) {
  const w = norm(wanted);
  if (!w) return { rows: [], kind: '' };

  const exact = models.filter((m) => norm(m.data) === w);
  if (exact.length) return { rows: exact, kind: 'exact' };

  // "Mazda3" → "3", "Mazdaspeed3" → "3". Our slugs often repeat the make.
  const stripped = w.replace(new RegExp(`^${norm(make)}(speed)?`), '');
  if (stripped && stripped !== w) {
    const hit = models.filter((m) => norm(m.data) === stripped);
    if (hit.length) return { rows: hit, kind: `make-prefix-stripped (${wanted} → ${hit[0].data})` };
  }

  // We carry the longer name: "MX-5 Miata" → "MX-5". Require a real stem so a
  // two-letter coincidence cannot pull in an unrelated model.
  const shorter = models.filter((m) => norm(m.data).length >= 3 && w.startsWith(norm(m.data)));
  if (shorter.length) return { rows: shorter, kind: `catalog uses shorter name (${wanted} → ${shorter.map((m) => m.data).join(', ')})` };

  // We carry the series, the catalog carries the variants: "IS" → IS250, IS350,
  // IS F. The remainder must look like a variant designator (a displacement or
  // a one/two-letter suffix), never an arbitrary word, or "3" would swallow
  // every model that happens to start with a 3.
  // A variant designator is a NUMBER (RX350, NV1500, C63 AMG) or a one/two
  // letter suffix (IS F). It must not be allowed to begin with letters: "C" was
  // matching CL500 and CLS350, which are different cars entirely.
  const isVariantSuffix = (rest) => /^[0-9]{1,4}[a-z]{0,4}$/.test(rest) || /^[a-z]{1,2}$/.test(rest);
  const familyOf = (stem) => models.filter((m) => {
    const c = norm(m.data);
    return c.startsWith(stem) && c !== stem && isVariantSuffix(c.slice(stem.length));
  });

  const family = familyOf(w);
  if (family.length) return { rows: family, kind: `series → variants (${wanted} → ${family.map((m) => m.data).join(', ')})` };

  // A naming convention the catalog does not share ("C-Class" → C180…C63 AMG).
  const alias = aliasFor(w);
  if (alias) {
    const hit = models.filter((m) => norm(m.data) === alias).concat(familyOf(alias));
    if (hit.length) return { rows: hit, kind: `catalog naming (${wanted} → ${hit.map((m) => m.data).join(', ')})` };
  }

  // The catalog carries a word we do not: ours "Paceman", theirs "COOPER
  // PACEMAN". Whole tokens only, so "SE" can never match "SEL".
  //
  // ONE DIRECTION ONLY. Matching when OUR name is the longer one would make
  // "Grand Cherokee" resolve to "Cherokee" — a different vehicle, and exactly
  // the class of silent error this whole pass exists to remove.
  const contained = models.filter(
    (m) => toks(m.data).length > toks(wanted).length && tokenRunMatch(m.data, wanted),
  );
  if (contained.length) return { rows: contained, kind: `name contains (${wanted} → ${contained.map((m) => m.data).join(', ')})` };

  return { rows: [], kind: '' };
}

/**
 * Part-type queries come from the article's own prescription clause, so they
 * read like prose ("electric water pump assembly") while the catalog reads like
 * a parts book ("Engine Water Pump"). Requiring every token matched nothing on
 * 991 rows even though the right category was open and full of parts.
 *
 * So: drop packaging nouns, then retreat from the front one modifier at a time,
 * keeping the head noun. "electric water pump" → "water pump" → "pump". The
 * first tier with hits wins and is reported, because how loose the match had to
 * get is exactly what a reviewer needs to know before trusting the candidate.
 */
const PART_TYPE_NOISE = new Set([
  'assembly', 'assy', 'kit', 'unit', 'complete', 'new', 'oem', 'replacement',
  'set', 'system', 'component', 'components', 'the', 'a', 'an',
]);

/**
 * Articles write plurals ("front strut mounts", "spark plugs", "injectors")
 * because that is how a repair is described. The catalog writes the singular
 * part ("Strut Mount", "Spark Plug"). Exact token equality treats those as
 * different words, and it cost real rows: a GLK-Class strut-mount article
 * missed a category that had eight parts sitting in it.
 *
 * Only a trailing "s" is stripped, and only from a token long enough that it
 * cannot be a word that merely ends in one ("gas", "brass", "class"). This is
 * deliberately not a real stemmer — aggressive stemming would collide part
 * names that need to stay distinct.
 */
function stem(token) {
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
}

/** Every query token present in the part's text, comparing singular forms. */
function partMatchesTokens(part, tokens) {
  const haystack = new Set(
    toks([part.part_type, part.alt_part_type, part.brand, part.application, part.comment]
      .filter(Boolean).join(' ')).map(stem),
  );
  return tokens.every((t) => haystack.has(stem(t)));
}

function partTypeTiers(query) {
  const all = toks(query);
  let base = all.filter((t) => !PART_TYPE_NOISE.has(t));
  if (!base.length) base = all;
  const tiers = [];
  if (all.length && all.join(' ') !== base.join(' ')) tiers.push(all);
  for (let start = 0; start < base.length; start += 1) tiers.push(base.slice(start));
  return tiers;
}

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
  const resolved = resolveModels(models, model, make);
  if (!resolved.rows.length) {
    return { covered: false, reason: `model "${model}" not in catalog for ${year}`, parts: [] };
  }
  const modelNote = resolved.kind === 'exact' ? '' : `${year}: model resolved by ${resolved.kind}`;

  const collected = [];
  let anyProduct = false;
  let rawTotal = 0;
  let usedCategoryAny = '';
  let usedTierAny = '';
  for (const modelRow of resolved.rows) {
    const one = await fittingPartsForModel({
      year, makeRow, modelRow, productMatch, engineMatch, partTypeMatch,
    });
    if (!one.covered) continue;
    anyProduct = true;
    rawTotal += one.rawCount;
    usedCategoryAny = usedCategoryAny || one.usedCategory;
    usedTierAny = usedTierAny || one.usedTier;
    collected.push(...one.parts.map((p) => ({ ...p, catalogModel: modelRow.data })));
  }
  if (!anyProduct) {
    return {
      covered: false,
      reason: `no product category matching ${JSON.stringify(Array.isArray(productMatch) ? productMatch : [productMatch])}`,
      parts: [],
      modelNote,
    };
  }
  return {
    covered: true, reason: '', parts: collected, rawCount: rawTotal,
    usedCategory: usedCategoryAny, usedTier: usedTierAny, modelNote,
  };
}

async function fittingPartsForModel({ year, makeRow, modelRow, productMatch, engineMatch, partTypeMatch }) {
  const products = await lookup(
    `products:${year}:${makeRow.id}:${modelRow.id}`,
    { lookup: 'product', year, make: makeRow.id, model: modelRow.id }, 'product',
  );
  // productMatch may be a list of categories to try in order. A component can
  // live in more than one depending on how it fails (an intake manifold's
  // gasket is filed under gaskets, not engine components), and the category
  // set is per-vehicle, so one that exists on one model is absent on another.
  const wanted = Array.isArray(productMatch) ? productMatch : [productMatch];
  let selectedProducts = [];
  let usedCategory = '';
  for (const candidate of wanted) {
    const hit = candidate ? products.filter((p) => matchesAllTokens(p.data, candidate)) : products;
    if (hit.length) { selectedProducts = hit; usedCategory = candidate; break; }
  }
  if (selectedProducts.length === 0) {
    return { covered: false, reason: `no product category matching ${JSON.stringify(wanted)}`, parts: [] };
  }

  // Collect the whole category first, then filter. The part-type tiers have to
  // be tried against the full set, and re-fetching per tier would multiply the
  // catalog calls for nothing — they are all cached anyway.
  const pool = [];
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
      for (const part of parts) pool.push({ part, engine, product });
    }
  }

  const tiers = partTypeTiers(partTypeMatch);
  let matched = [];
  let usedTier = '';
  if (!tiers.length) {
    matched = pool;
  } else {
    for (const tier of tiers) {
      const hit = pool.filter(({ part }) => partMatchesTokens(part, tier));
      if (hit.length) { matched = hit; usedTier = tier.join(' '); break; }
    }
  }

  const out = matched.map(({ part, engine, product }) => {
    const candidate = candidateFromPart(part, { year, engine: engine.data, product: product.data });
    return {
      supplier: candidate.supplier,
      partNumber: candidate.partNumber,
      partType: candidate.partType,
      brand: candidate.brand,
      engine: engine.data,
    };
  });
  return { covered: true, reason: '', parts: out, rawCount, usedCategory, usedTier };
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
  let partTypeTierUsed = '';

  for (const year of years) {
    let result;
    try {
      result = await fittingParts({ ...entry, year });
    } catch (error) {
      notes.push(`${year}: lookup failed — ${error.message}`);
      continue; // an API failure is NOT evidence about the part
    }
    if (result.modelNote && !notes.includes(result.modelNote)) notes.push(result.modelNote);
    if (!result.covered) { notes.push(`${year}: ${result.reason}`); continue; }
    // How loose the part-type filter had to get before the catalog answered.
    // A candidate found at "pump" is weaker evidence than one found at
    // "electric water pump", and review has to be able to tell them apart.
    if (result.usedTier && toks(result.usedTier).length < toks(entry.partTypeMatch).length) {
      const relaxed = `part-type relaxed to "${result.usedTier}" (asked "${entry.partTypeMatch}")`;
      if (!notes.includes(relaxed)) notes.push(relaxed);
      partTypeTierUsed = result.usedTier;
    }
    if (result.parts.length === 0) {
      // The vehicle resolved but nothing matched the part-type filter. That is a
      // gap in OUR query, not a fact about the part. Saying "absent" here is
      // precisely the mistake that made round one condemn correct parts.
      notes.push(`${year}: no part-type match for "${entry.partTypeMatch}" (${result.rawCount} parts in category)`);
      continue;
    }
    anyCovered = true;
    // Structured, not a display string. Ranking needs partType (a supplier rule
    // is scoped to the part types it covers) and engine (the candidate set spans
    // every engine the model offered), and flattening to "Supplier PN" throws
    // both away.
    candidatesByYear[year] = result.parts.map((p) => ({
      supplier: p.supplier,
      partNumber: p.partNumber,
      partType: p.partType,
      brand: p.brand,
      engine: p.engine,
    }));
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
    // Empty when the article's own wording matched the catalog as written.
    partTypeTierUsed,
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
  const writeReport = () => {
    const tally = results.reduce((acc, r) => ({ ...acc, [r.verdict]: (acc[r.verdict] || 0) + 1 }), {});
    fs.writeFileSync(path.resolve(PROJECT_ROOT, outFile), JSON.stringify({
      checkedAt: new Date().toISOString(),
      source: 'ShowMeTheParts subscription API',
      guardrail: 'Catalog fitment proves the part FITS. It never proves the part REPAIRS the issue.',
      complete: results.length === entries.length,
      progress: `${results.length}/${entries.length}`,
      tally,
      results,
    }, null, 1));
    return tally;
  };

  for (const [index, entry] of entries.entries()) {
    const result = await verifyEntry(entry, yearCap);
    results.push(result);
    saveCache();
    // Write after every entry. A long run WILL be interrupted, and losing an
    // hour of catalog lookups to a kill signal is avoidable.
    writeReport();
    console.log(
      `  [${index + 1}/${entries.length}] ${result.verdict.padEnd(10)} ${entry.partNumber || '(none)'} — ${result.vehicle}` +
      (result.verdict === 'confirmed' ? ` (fits ${result.fitmentYears.join(', ')})` : ''),
    );
  }

  const tally = writeReport();
  saveCache();
  console.log('\nTALLY:', JSON.stringify(tally));
  console.log('report:', outFile);
})().catch((error) => { saveCache(); console.error('ERR', error.message); process.exitCode = 1; });
