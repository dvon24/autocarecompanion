/**
 * Replacement-part supplier tiers — DATA, not code.
 *
 * When the catalog returns 23 water pumps that fit a vehicle, something has to
 * decide which two an owner sees. This table is that decision, kept as data so
 * revising it never touches the selection rule in `src/lib/part-recommendation.ts`.
 *
 * WHAT THIS IS NOT
 * ----------------
 * It is NOT a quality ranking, and nothing here has been tested or reviewed. It
 * encodes one narrow, checkable fact — whether a supplier is known to build the
 * original equipment for this kind of part — plus a coarse "established brand"
 * bucket for everyone else. That is a weaker claim than "better", and the UI
 * must not upgrade it into one.
 *
 * Real evidence (owner reviews, failure rates, our own return signal) belongs on
 * top of this later. Until then, two options ranked by a stated rule beats one
 * option chosen by nothing, and beats 23 options ranked by nothing at all.
 */

/**
 * `oe` — supplies original equipment for this part type on at least some
 *        mainstream vehicles. The closest thing to "what the factory fitted".
 * `established` — long-standing replacement-parts brand with broad coverage.
 * (unlisted) — ranks last. Not a judgment; just unknown to us.
 */
export type SupplierTier = 'oe' | 'established';

export interface SupplierRule {
  /** Supplier name as the catalog prints it, lowercased for matching. */
  supplier: string;
  tier: SupplierTier;
  /** Part-type keywords this rule applies to. Omit to apply to every part. */
  appliesTo?: string[];
  /** Shown to the reader when this supplier is picked. Must stay factual. */
  note?: string;
}

export const SUPPLIER_RULES: SupplierRule[] = [
  // ── OE builders, scoped to the part types they actually supply ──
  { supplier: 'aisin', tier: 'oe', appliesTo: ['water pump', 'thermostat', 'clutch', 'timing'], note: 'Builds original-equipment units for several manufacturers' },
  { supplier: 'denso', tier: 'oe', appliesTo: ['alternator', 'starter', 'oxygen sensor', 'spark plug', 'compressor', 'radiator'], note: 'Original-equipment supplier for many Japanese manufacturers' },
  { supplier: 'bosch', tier: 'oe', appliesTo: ['oxygen sensor', 'fuel pump', 'spark plug', 'brake', 'ignition'], note: 'Original-equipment supplier for many European manufacturers' },
  { supplier: 'ntn', tier: 'oe', appliesTo: ['bearing', 'hub'] },
  { supplier: 'skf', tier: 'oe', appliesTo: ['bearing', 'hub', 'seal'] },
  { supplier: 'mahle', tier: 'oe', appliesTo: ['filter', 'gasket', 'piston', 'thermostat'] },
  { supplier: 'continental', tier: 'oe', appliesTo: ['belt', 'tensioner', 'timing'] },
  { supplier: 'valeo', tier: 'oe', appliesTo: ['clutch', 'alternator', 'starter', 'wiper'] },
  { supplier: 'sachs', tier: 'oe', appliesTo: ['shock', 'strut', 'clutch'] },
  { supplier: 'zf', tier: 'oe', appliesTo: ['shock', 'strut', 'steering'] },

  // ── established replacement brands ──
  { supplier: 'gates', tier: 'established', appliesTo: ['belt', 'hose', 'tensioner', 'water pump', 'thermostat'] },
  { supplier: 'dayco', tier: 'established', appliesTo: ['belt', 'tensioner', 'water pump'] },
  { supplier: 'moog', tier: 'established', appliesTo: ['ball joint', 'control arm', 'tie rod', 'bushing', 'link', 'bearing'] },
  { supplier: 'fel-pro', tier: 'established', appliesTo: ['gasket', 'seal'] },
  { supplier: 'monroe', tier: 'established', appliesTo: ['shock', 'strut', 'mount'] },
  { supplier: 'kyb', tier: 'established', appliesTo: ['shock', 'strut'] },
  { supplier: 'four seasons', tier: 'established', appliesTo: ['a/c', 'compressor', 'water pump', 'heater'] },
  { supplier: 'dorman', tier: 'established' },
  { supplier: 'acdelco', tier: 'established' },
  { supplier: 'motorcraft', tier: 'established' },
  { supplier: 'walker', tier: 'established', appliesTo: ['exhaust', 'converter', 'sensor'] },
  { supplier: 'cardone', tier: 'established' },
  { supplier: 'wagner', tier: 'established', appliesTo: ['brake'] },
  { supplier: 'raybestos', tier: 'established', appliesTo: ['brake'] },
  { supplier: 'timken', tier: 'established', appliesTo: ['bearing', 'hub', 'seal'] },
];
