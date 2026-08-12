/**
 * Pick a PRIMARY and an ALTERNATE from the parts a catalog says fit.
 *
 * A component-only article ("replace the water pump") has no part number at all,
 * and the catalog answers with 23 pumps that fit. Showing all 23 is not help,
 * and picking one implies a judgment we have not earned. Two — a primary and an
 * alternate from a different supplier — is what we can honestly stand behind:
 * the reader gets a real choice and can see it is a choice.
 *
 * THE RULE, IN ORDER
 *   1. Scope to the vehicle's engine. The candidate list spans every engine the
 *      model offered, so skipping this recommends a 3.3L pump for a 3.8L van.
 *   2. Collapse duplicates by part number (the same part repeats across
 *      product/engine slices of the query).
 *   3. Rank by supplier tier — see src/data/replacement-part-suppliers.ts — then
 *      alphabetically so the output is stable rather than query-order dependent.
 *   4. Primary is the top-ranked. Alternate is the best from a DIFFERENT
 *      supplier, so two Gates part numbers never fill both slots.
 *
 * The ranking asserts only what the table asserts: whether a supplier builds
 * original equipment for this part type. It is not a quality claim and must not
 * be presented as one.
 */
import { SUPPLIER_RULES, type SupplierTier } from '@/data/replacement-part-suppliers';

export interface PartCandidate {
  supplier: string;
  partNumber: string;
  partType?: string;
  brand?: string;
  engine?: string;
  application?: string;
  comment?: string;
  location?: string;
}

export interface RankedPart extends PartCandidate {
  tier: SupplierTier | 'unlisted';
  /** Factual note from the supplier table, when it has one. */
  note?: string;
}

export interface Recommendation {
  primary: RankedPart | null;
  alternate: RankedPart | null;
  /** Everything that fit, ranked — for review tooling, not for the page. */
  ranked: RankedPart[];
  /** How many distinct parts fit before we narrowed to two. */
  consideredCount: number;
}

const TIER_ORDER: Record<SupplierTier | 'unlisted', number> = { oe: 0, established: 1, unlisted: 2 };

function normalizePn(value: string): string {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeSupplier(value: string): string {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** A supplier rule applies when the supplier matches and, if the rule is
 *  part-type scoped, the part type mentions one of its keywords. */
function ruleFor(candidate: PartCandidate): { tier: SupplierTier | 'unlisted'; note?: string } {
  const supplier = normalizeSupplier(candidate.supplier);
  const partType = `${candidate.partType || ''} ${candidate.brand || ''}`.toLowerCase();
  let best: { tier: SupplierTier | 'unlisted'; note?: string } = { tier: 'unlisted' };

  for (const rule of SUPPLIER_RULES) {
    if (!supplier.includes(rule.supplier)) continue;
    if (rule.appliesTo && !rule.appliesTo.some((keyword) => partType.includes(keyword))) continue;
    if (TIER_ORDER[rule.tier] < TIER_ORDER[best.tier]) best = { tier: rule.tier, note: rule.note };
  }
  return best;
}

/**
 * `engine` is the vehicle's engine as our article records it (e.g. "3.8L V6").
 * Candidates whose engine string does not mention it are dropped. Passing no
 * engine keeps every candidate — correct when the part is engine-independent
 * (a door latch), wrong for anything driven off the engine, so callers should
 * pass it whenever the article names one.
 */
export function recommendParts(candidates: PartCandidate[], options: { engine?: string | null } = {}): Recommendation {
  const engine = options.engine ? options.engine.toLowerCase() : null;

  const scoped = engine
    ? candidates.filter((c) => {
        if (!c.engine) return true; // catalog did not scope it — do not invent an exclusion
        const haystack = c.engine.toLowerCase();
        // Match on the displacement token ("3.8l"), the most reliable shared key
        // between how we write engines and how the catalog writes them.
        const displacement = engine.match(/\d+\.\d+\s*l/);
        return displacement ? haystack.includes(displacement[0].replace(/\s+/g, '')) : haystack.includes(engine);
      })
    : candidates;

  const seen = new Set<string>();
  const deduped: PartCandidate[] = [];
  for (const candidate of scoped) {
    const key = `${normalizeSupplier(candidate.supplier)}|${normalizePn(candidate.partNumber)}`;
    if (!candidate.partNumber || seen.has(key)) continue;
    seen.add(key);
    deduped.push(candidate);
  }

  const ranked: RankedPart[] = deduped
    .map((candidate) => ({ ...candidate, ...ruleFor(candidate) }))
    .sort((a, b) => {
      const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
      if (tierDiff !== 0) return tierDiff;
      const supplierDiff = normalizeSupplier(a.supplier).localeCompare(normalizeSupplier(b.supplier));
      if (supplierDiff !== 0) return supplierDiff;
      return normalizePn(a.partNumber).localeCompare(normalizePn(b.partNumber));
    });

  const primary = ranked[0] || null;
  const alternate = primary
    ? ranked.find((candidate) => normalizeSupplier(candidate.supplier) !== normalizeSupplier(primary.supplier)) || null
    : null;

  return { primary, alternate, ranked, consideredCount: ranked.length };
}
