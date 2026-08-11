/**
 * Turn fitment verdicts into STAGED fixPart proposals. Writes no database.
 *
 * Input : the artifacts from scripts/verify-parts-fitment.js
 * Output: one proposal per issue — a primary and an alternate part, each scoped
 *         to the years the catalog actually confirmed, ready for review and
 *         (once approved) for the link step.
 *
 * WHAT A PROPOSAL DELIBERATELY DOES NOT CLAIM
 * -------------------------------------------
 * `verified: false` and no `buyLinks`. The catalog proved these parts FIT the
 * vehicle; it said nothing about whether they REPAIR the failure the article
 * describes. Marking them verified here would launder a fitment fact into a
 * repair claim, which is the exact move that produced the wrong-part problem in
 * the first place. A human approves repair role, then links get built.
 *
 * `fitment.years` is the years the catalog CONFIRMED, which is a subset of the
 * years sampled, which is a subset of the article's span. It is never widened to
 * the article's range on the assumption that untested years behave the same.
 */
import fs from 'fs';
import { config } from 'dotenv';
import { Pool } from 'pg';
import { recommendParts, type PartCandidate } from '../src/lib/part-recommendation';
import { formatYearRange } from '../src/lib/known-issue-part-fitment';

config({ path: '.env.local' });

type FitmentCandidate = PartCandidate & { catalogModel?: string };

interface Verdict {
  id: string;
  vehicle: string;
  verdict: string;
  yearsChecked: number[];
  candidatesByYear: Record<string, FitmentCandidate[] | string[]>;
  partTypeMatch?: string;
  mappedFrom?: string;
  engineMatch?: string | null;
  /** Set by the fitment pass when the part-type query had to be loosened. */
  partTypeTierUsed?: string;
  notes?: string[];
}

const inputs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (inputs.length === 0) {
  console.error('usage: build-part-proposals.ts <verdicts.json> [more.json ...]');
  process.exit(1);
}

/**
 * The catalog's own filter matches tokens across part type, brand, application
 * AND comment, so a query for "fuel pump" legitimately returns a Fuel Pump
 * *Strainer* and a Fuel Sender and Hanger Assembly. Those fit the vehicle; they
 * are not the part the article says to replace.
 *
 * So a candidate has to earn its place on `part_type` alone, and accessories are
 * excluded unless the component we are looking for IS that accessory — an
 * article about a head gasket should get a gasket, an article about a fuel pump
 * should not.
 */
/**
 * Relevance is decided by the HEAD NOUN — the last word of the part type.
 *
 * A blocklist of accessory words was the first attempt and it fails in both
 * directions: it has to be endlessly extended, and adding `cylinder` (to stop
 * clutch master cylinders being proposed for clutch-disc articles) also blocked
 * the cylinder where it IS the part.
 *
 * The head noun says what a thing IS; everything before it qualifies. "Electric
 * Fuel Pump" is a pump. "Fuel Pump Strainer" is a strainer. "Engine Cylinder
 * Head Gasket" is a gasket. So a candidate is relevant when it is the same KIND
 * of thing the article asked for — no list to maintain, and it self-corrects for
 * accessories because an accessory's head noun is the accessory.
 */
function headNoun(value: string): string {
  const words = String(value || '').toLowerCase().replace(/[^a-z0-9\s/-]/g, ' ').split(/\s+/).filter(Boolean);
  return words[words.length - 1] || '';
}

/**
 * Words in a catalog part type that carry no identifying information — they
 * appear on almost every row and would never be quoted in an article.
 */
const GENERIC_TYPE_WORD = new Set([
  'engine', 'assembly', 'kit', 'set', 'system', 'auto', 'automatic', 'vehicle',
  'front', 'rear', 'left', 'right', 'upper', 'lower', 'inner', 'outer', 'and',
  'with', 'for', 'the', 'of', 'universal', 'epa', 'carb', 'direct', 'genuine',
]);

/**
 * A candidate must not introduce a QUALIFIER the article never mentions.
 *
 * "Position sensor" is a generic target, so Camshaft, Crankshaft and THROTTLE
 * position sensors all satisfy it on tokens alone — and a throttle position
 * sensor was proposed for a crankshaft-sensor article. The article itself
 * settles it: it says crankshaft and camshaft, and never says throttle.
 *
 * So every identifying word in the candidate's part type has to appear
 * somewhere in the article. This is deliberately evidence-based rather than a
 * hand-maintained list of confusable sensors.
 */
function qualifiersAppearInArticle(partType: string, article: string): boolean {
  if (!article) return true; // no text to check against — do not invent a rejection
  const haystack = article.toLowerCase();
  return String(partType || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !GENERIC_TYPE_WORD.has(w))
    .every((w) => haystack.includes(w));
}

function partTypeIsRelevant(partType: string, target: string): boolean {
  const type = String(partType || '').toLowerCase();
  const tokens = String(target || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  // Every word the article asked for must appear — "fuel pump" cannot match a
  // part type that never says fuel.
  if (!tokens.every((t) => type.includes(t))) return false;
  // …and the candidate must be the same kind of thing.
  const wantHead = headNoun(target);
  const gotHead = headNoun(partType);
  if (wantHead && gotHead && wantHead !== gotHead) {
    // An assembly containing the requested part still counts: "Wheel Bearing and
    // Hub Assembly" answers "wheel bearing", and "Window Motor and Regulator
    // Assembly" answers "window motor".
    if (!/\b(assembly|kit|set)\b/.test(gotHead)) return false;
  }
  return true;
}

/**
 * id -> what the mapping asked for, and WHERE it was identified.
 *
 * `mappedFrom` is the single best predictor of a wrong recommendation. When no
 * rule matches the title, the mapper falls back to the solution text, which
 * routinely names a different component in passing — measured on Ford, that
 * fallback sends "CD4E Automatic Transmission Failure" looking for a clutch,
 * a CCRM relay-module article looking for a fuel pump, and cracked cylinder
 * heads looking for a water pump. It is 19% of entries and nearly all of the
 * observed errors, so it is excluded from proposals by default.
 */
/**
 * id -> title + solution, the evidence a candidate's qualifiers are checked
 * against. Loaded once up front; a failure here degrades to "no article text",
 * which makes the qualifier check pass rather than silently reject everything.
 */
const ARTICLE = new Map<string, string>();

async function loadArticles() {
  const ids = new Set<string>();
  for (const file of inputs) {
    const doc = JSON.parse(fs.readFileSync(file, 'utf8')) as { results: Verdict[] };
    for (const r of doc.results) ids.add(r.id);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  try {
    const { rows } = await pool.query('select id, title, solution from "KnownIssue" where id = any($1)', [[...ids]]);
    for (const r of rows) ARTICLE.set(r.id, `${r.title} ${r.solution}`);
  } catch (e) {
    console.warn('WARN could not load article text — qualifier check disabled:', (e as Error).message);
  }
  await pool.end();
}

async function main() {
await loadArticles();
const proposals: unknown[] = [];
const skipped: Record<string, number> = {};
let structuredMissing = 0;

for (const file of inputs) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8')) as { results: Verdict[] };
  for (const r of doc.results) {
    if (r.verdict !== 'discovered' && r.verdict !== 'absent') {
      skipped[r.verdict] = (skipped[r.verdict] || 0) + 1;
      continue;
    }

    // Flatten every sampled year, remembering which years each part appeared in.
    // A part confirmed in 2009 and 2013 but not 2011 keeps that shape rather
    // than being smoothed into a range it was never tested across.
    const yearsByPart = new Map<string, Set<number>>();
    const modelsByPart = new Map<string, Set<string>>();
    const candidateByKey = new Map<string, FitmentCandidate>();
    for (const [year, list] of Object.entries(r.candidatesByYear || {})) {
      for (const entry of list as Array<FitmentCandidate | string>) {
        if (typeof entry === 'string') { structuredMissing++; continue; }
        const key = `${entry.supplier}|${entry.partNumber}`.toLowerCase();
        if (!yearsByPart.has(key)) yearsByPart.set(key, new Set());
        yearsByPart.get(key)!.add(Number(year));
        if (entry.catalogModel) {
          if (!modelsByPart.has(key)) modelsByPart.set(key, new Set());
          modelsByPart.get(key)!.add(entry.catalogModel);
        }
        if (!candidateByKey.has(key)) candidateByKey.set(key, entry);
      }
    }
    if (candidateByKey.size === 0) { skipped['no-structured-candidates'] = (skipped['no-structured-candidates'] || 0) + 1; continue; }

    if (!r.partTypeMatch || !['title', 'prescription'].includes(r.mappedFrom || '')) {
      skipped['missing-or-risky-source-metadata'] = (skipped['missing-or-risky-source-metadata'] || 0) + 1;
      continue;
    }
    // Drop anything whose part_type is not actually the component in question.
    const target = r.partTypeMatch;
    const articleText = ARTICLE.get(r.id) || '';
    if (!articleText) {
      skipped['missing-article-text'] = (skipped['missing-article-text'] || 0) + 1;
      continue;
    }

    /**
     * Some articles explicitly tell the reader NOT to buy a part from the page,
     * because the failed component cannot be identified without diagnosis. The
     * Mercedes ABC hydraulic rewrite is the clearest example: "Do not buy an ABC
     * line, strut, pump, accumulator or conversion kit from this page."
     *
     * Attaching a buy button to such a page contradicts its own instruction, so
     * the article's judgment wins over the catalog's.
     */
    if (/\b(do not|don'?t|never)\s+(buy|purchase|order)\b/i.test(articleText)) {
      skipped['article says do not buy'] = (skipped['article says do not buy'] || 0) + 1;
      continue;
    }
    const relevant = [...candidateByKey.entries()].filter(([, c]) =>
      partTypeIsRelevant(c.partType || '', target) && qualifiersAppearInArticle(c.partType || '', articleText));
    if (relevant.length === 0) {
      // The vehicle had fitting parts, but none of them were this component.
      // Proposing the closest thing anyway is how an axle-bearing article ends
      // up recommending a wheel seal.
      skipped['no-matching-part-type'] = (skipped['no-matching-part-type'] || 0) + 1;
      continue;
    }
    for (const key of [...candidateByKey.keys()]) if (!relevant.some(([k]) => k === key)) candidateByKey.delete(key);

    /**
     * A part confirmed in only ONE sampled year, while the other sampled years
     * returned a DIFFERENT set of parts, is not this article's part — it is the
     * part for one end of an over-broad year span.
     *
     * The case that found this: "5.4L 3V Triton Spark Plug Seizure and Blowout"
     * on a page scoped 2004+. The Expedition's 5.4 was 2-valve in 2004 and 3V
     * from 2005, so the 2004 sample returned Bosch 6710 (a 2V plug) and the 2010
     * sample returned NGK PZNAR6A11H (a 3V plug) — disjoint sets. Taking the
     * earliest year proposed the wrong engine generation entirely, on the
     * highest-traffic page in the catalog.
     *
     * Fitment verification cannot repair an article whose own scope is wrong, so
     * the honest move is to detect the disagreement and decline.
     */
    const sampledYears = Object.keys(r.candidatesByYear || {}).length;
    if (sampledYears > 1) {
      const spansMultipleYears = [...candidateByKey.keys()]
        .some((key) => (yearsByPart.get(key)?.size || 0) > 1);
      if (!spansMultipleYears) {
        skipped['year-sets-disagree (scope likely too broad)'] =
          (skipped['year-sets-disagree (scope likely too broad)'] || 0) + 1;
        continue;
      }
      // Keep only parts the catalog confirmed in more than one sampled year.
      for (const [key] of [...candidateByKey.entries()]) {
        if ((yearsByPart.get(key)?.size || 0) < 2) candidateByKey.delete(key);
      }
    }

    // Engine comes from the candidates themselves — the verifier already scoped
    // the query by engine where the article named one.
    // Do not invent engine scope from API ordering. An unscoped article remains
    // unscoped even when the catalog returned candidates for several engines.
    const engine = r.engineMatch || null;
    const { primary, alternate, consideredCount } = recommendParts([...candidateByKey.values()], { engine });
    if (!primary) { skipped['no-primary'] = (skipped['no-primary'] || 0) + 1; continue; }

    // The catalog occasionally carries a placeholder where a part number should
    // be — "N/R" (no reference) among them. It is not orderable, not linkable,
    // and putting it on a page states a part number that does not exist.
    const PLACEHOLDER = /^(n\/?r|n\/?a|none|null|tbd|unknown|-+)$/i;
    const validPartNumber = (value?: string | null) => {
      const normalized = String(value || '').trim();
      return normalized.length >= 3 && !PLACEHOLDER.test(normalized);
    };
    if (!validPartNumber(primary.partNumber)) {
      skipped['placeholder-part-number'] = (skipped['placeholder-part-number'] || 0) + 1;
      continue;
    }

    const scopeFor = (supplier: string, partNumber: string) => {
      const years = [...(yearsByPart.get(`${supplier}|${partNumber}`.toLowerCase()) || [])].sort((a, b) => a - b);
      return years.length ? years : r.yearsChecked;
    };

    const toPart = (p: NonNullable<typeof primary>, role: 'primary' | 'alternate') => {
      const years = scopeFor(p.supplier, p.partNumber);
      const key = `${p.supplier}|${p.partNumber}`.toLowerCase();
      const catalogModels = [...(modelsByPart.get(key) || [])].sort();
      return {
        role,
        component: p.partType || 'Replacement part',
        supplier: p.supplier,
        oemPartNumber: '',            // this is an aftermarket number, not OEM
        aftermarketPartNumber: p.partNumber,
        supplierTier: p.tier,
        note: [
          `${p.supplier} ${p.partNumber}.`,
          `Catalog-confirmed fitment for ${formatYearRange(years)}${engine ? ` ${engine}` : ''}.`,
          p.note ? `${p.note}.` : '',
          'Fitment only — repair role not established.',
        ].filter(Boolean).join(' '),
        fitment: { years, ...(engine ? { engines: [engine] } : {}) },
        ...(catalogModels.length ? { catalogModels } : {}),
        buyLinks: [],
        verified: false,
        provenance: 'ShowMeTheParts catalog fitment lookup by year and engine',
      };
    };

    proposals.push({
      id: r.id,
      vehicle: r.vehicle,
      yearsChecked: r.yearsChecked,
      consideredCount,
      /**
       * How loose the catalog query had to get before it answered, carried
       * through from the fitment pass so review can weigh it. A candidate found
       * at the article's own wording ("electric water pump") is stronger
       * evidence than one found after retreating to the head noun ("pump"), and
       * an empty value here means no relaxation was needed at all.
       *
       * Without this the two are indistinguishable on the review sheet, which
       * is how a weak match gets approved at the same glance as a strong one.
       */
      ...(r.partTypeTierUsed ? { partTypeRelaxedTo: r.partTypeTierUsed } : {}),
      ...(r.notes?.some((n) => /model resolved by/.test(n))
        ? { modelResolvedBy: r.notes.find((n) => /model resolved by/.test(n))?.replace(/^\d+: /, '') }
        : {}),
      parts: [
        toPart(primary, 'primary'),
        ...(alternate && validPartNumber(alternate.partNumber) ? [toPart(alternate, 'alternate')] : []),
      ],
    });
  }
}

fs.writeFileSync('data/_part-proposals.json', JSON.stringify({
  generatedFrom: inputs,
  guardrail: 'Catalog fitment only. Repair role unestablished; verified:false and no buy links until a human approves.',
  count: proposals.length,
  proposals,
}, null, 1));

const withAlternate = (proposals as Array<{ parts: unknown[] }>).filter((p) => p.parts.length > 1).length;
console.log(`proposals: ${proposals.length}  (with an alternate: ${withAlternate})`);
console.log('skipped:', JSON.stringify(skipped));
if (structuredMissing) console.log(`NOTE: ${structuredMissing} candidate rows were display strings — re-run the verifier to get structured candidates.`);
console.log('report: data/_part-proposals.json');
}

main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
