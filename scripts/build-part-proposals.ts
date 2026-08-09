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
import { recommendParts, type PartCandidate } from '../src/lib/part-recommendation';
import { formatYearRange } from '../src/lib/known-issue-part-fitment';

interface Verdict {
  id: string;
  vehicle: string;
  verdict: string;
  yearsChecked: number[];
  candidatesByYear: Record<string, PartCandidate[] | string[]>;
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

function partTypeIsRelevant(partType: string, target: string): boolean {
  const type = String(partType || '').toLowerCase();
  const tokens = String(target || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
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
function loadTargets(): Map<string, { partTypeMatch: string; mappedFrom?: string }> {
  const targets = new Map<string, { partTypeMatch: string; mappedFrom?: string }>();
  for (const file of fs.readdirSync('data')) {
    if (!/-fitment-input\.json$/.test(file)) continue;
    try {
      const rows = JSON.parse(fs.readFileSync(`data/${file}`, 'utf8')) as Array<{ id: string; partTypeMatch: string; mappedFrom?: string }>;
      for (const r of rows) targets.set(r.id, { partTypeMatch: r.partTypeMatch, mappedFrom: r.mappedFrom });
    } catch { /* a malformed worklist should not take the whole run down */ }
  }
  return targets;
}
const TARGETS = loadTargets();
/** --include-solution-derived opts the risky tier back in, for review tooling. */
const INCLUDE_SOLUTION_DERIVED = process.argv.includes('--include-solution-derived');

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
    const candidateByKey = new Map<string, PartCandidate>();
    for (const [year, list] of Object.entries(r.candidatesByYear || {})) {
      for (const entry of list as Array<PartCandidate | string>) {
        if (typeof entry === 'string') { structuredMissing++; continue; }
        const key = `${entry.supplier}|${entry.partNumber}`.toLowerCase();
        if (!yearsByPart.has(key)) yearsByPart.set(key, new Set());
        yearsByPart.get(key)!.add(Number(year));
        if (!candidateByKey.has(key)) candidateByKey.set(key, entry);
      }
    }
    if (candidateByKey.size === 0) { skipped['no-structured-candidates'] = (skipped['no-structured-candidates'] || 0) + 1; continue; }

    const entry = TARGETS.get(r.id);
    if (!INCLUDE_SOLUTION_DERIVED && entry?.mappedFrom === 'solution') {
      skipped['solution-derived (needs review)'] = (skipped['solution-derived (needs review)'] || 0) + 1;
      continue;
    }
    // Drop anything whose part_type is not actually the component in question.
    const target = entry?.partTypeMatch || '';
    const relevant = [...candidateByKey.entries()].filter(([, c]) => partTypeIsRelevant(c.partType || '', target));
    if (relevant.length === 0) {
      // The vehicle had fitting parts, but none of them were this component.
      // Proposing the closest thing anyway is how an axle-bearing article ends
      // up recommending a wheel seal.
      skipped['no-matching-part-type'] = (skipped['no-matching-part-type'] || 0) + 1;
      continue;
    }
    for (const key of [...candidateByKey.keys()]) if (!relevant.some(([k]) => k === key)) candidateByKey.delete(key);

    // Engine comes from the candidates themselves — the verifier already scoped
    // the query by engine where the article named one.
    const engine = [...candidateByKey.values()].map((c) => c.engine).find(Boolean) || null;
    const { primary, alternate, consideredCount } = recommendParts([...candidateByKey.values()], { engine });
    if (!primary) { skipped['no-primary'] = (skipped['no-primary'] || 0) + 1; continue; }

    const scopeFor = (supplier: string, partNumber: string) => {
      const years = [...(yearsByPart.get(`${supplier}|${partNumber}`.toLowerCase()) || [])].sort((a, b) => a - b);
      return years.length ? years : r.yearsChecked;
    };

    const toPart = (p: NonNullable<typeof primary>, role: 'primary' | 'alternate') => {
      const years = scopeFor(p.supplier, p.partNumber);
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
      parts: [toPart(primary, 'primary'), ...(alternate ? [toPart(alternate, 'alternate')] : [])],
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
