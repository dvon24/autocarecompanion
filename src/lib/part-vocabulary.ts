/**
 * Canonical part vocabulary — the contract that replaces fuzzy name matching in
 * the record store. Every buyable part the hub/vision surfaces maps to ONE
 * canonical slug; the record store is keyed on that slug; lookup is EXACT.
 *
 * Why this exists: `nameScore` (Jaccard + head-noun) is a heuristic, and a
 * heuristic mismatches — "oil filter" scored close enough to a cached "air
 * filter" to hijack it. A canonical slug can't collide: canonicalize("oil
 * filter") === "oil_filter" and canonicalize("air filter") === "air_filter",
 * distinct keys, exact match, done. Free text that maps to NO slug still works —
 * it falls back to the fuzzy lane, so nothing regresses.
 *
 * The model is told to prefer these slugs in its PART markers; whatever it emits
 * (slug or free text) is canonicalized server-side, so the contract holds even
 * when the model writes prose.
 */

/** Coarse category (matches the marker `category` enum). One per slug. */
export type PartCategoryLite =
  | 'filter' | 'fluid' | 'brake_pad' | 'rotor' | 'caliper' | 'spark_plug'
  | 'ignition' | 'belt' | 'hose' | 'battery' | 'alternator' | 'starter'
  | 'fuel_pump' | 'sensor' | 'suspension' | 'wiper' | 'bulb' | 'tire'
  | 'wheel' | 'lug_nut' | 'tpms' | 'other';

export interface PartDef {
  slug: string;
  display: string;
  category: PartCategoryLite;
  /** Free-text forms that map to this slug. Order-independent; matched as a
   *  token SUBSET (singularized), so "front brake pads" matches "brake pad front". */
  aliases: string[];
}

// The vocabulary. Positional parts (brakes, diffs) have a generic slug AND
// front/rear specifics, so "brake pads" → generic and "front brake pads" →
// the specific one. Keep aliases minimal but cover the obvious phrasings.
export const PART_VOCAB: PartDef[] = [
  // Engine / oil
  { slug: 'engine_oil', display: 'Engine oil', category: 'fluid', aliases: ['engine oil', 'motor oil', 'oil'] },
  { slug: 'oil_filter', display: 'Oil filter', category: 'filter', aliases: ['oil filter', 'engine oil filter'] },
  { slug: 'air_filter', display: 'Engine air filter', category: 'filter', aliases: ['air filter', 'engine air filter', 'intake filter'] },
  { slug: 'cabin_air_filter', display: 'Cabin air filter', category: 'filter', aliases: ['cabin air filter', 'cabin filter', 'pollen filter', 'ac filter'] },
  { slug: 'fuel_filter', display: 'Fuel filter', category: 'filter', aliases: ['fuel filter'] },
  { slug: 'pcv_valve', display: 'PCV valve', category: 'other', aliases: ['pcv valve', 'pcv'] },
  { slug: 'oil_drain_plug', display: 'Oil drain plug', category: 'other', aliases: ['oil drain plug', 'drain plug', 'sump plug'] },
  // Ignition
  { slug: 'spark_plug', display: 'Spark plugs', category: 'spark_plug', aliases: ['spark plug', 'sparkplug', 'plugs'] },
  { slug: 'ignition_coil', display: 'Ignition coil', category: 'ignition', aliases: ['ignition coil', 'coil pack', 'coil'] },
  // Brakes
  { slug: 'brake_pad', display: 'Brake pads', category: 'brake_pad', aliases: ['brake pad', 'brake pads', 'pads'] },
  { slug: 'brake_pad_front', display: 'Front brake pads', category: 'brake_pad', aliases: ['front brake pad', 'front pad'] },
  { slug: 'brake_pad_rear', display: 'Rear brake pads', category: 'brake_pad', aliases: ['rear brake pad', 'rear pad'] },
  { slug: 'brake_rotor', display: 'Brake rotors', category: 'rotor', aliases: ['brake rotor', 'rotor', 'brake disc', 'disc'] },
  { slug: 'brake_rotor_front', display: 'Front brake rotors', category: 'rotor', aliases: ['front brake rotor', 'front rotor', 'front disc'] },
  { slug: 'brake_rotor_rear', display: 'Rear brake rotors', category: 'rotor', aliases: ['rear brake rotor', 'rear rotor', 'rear disc'] },
  { slug: 'brake_caliper', display: 'Brake caliper', category: 'caliper', aliases: ['brake caliper', 'caliper'] },
  { slug: 'brake_fluid', display: 'Brake fluid', category: 'fluid', aliases: ['brake fluid'] },
  // Cooling
  { slug: 'coolant', display: 'Coolant', category: 'fluid', aliases: ['coolant', 'antifreeze', 'engine coolant'] },
  { slug: 'thermostat', display: 'Thermostat', category: 'other', aliases: ['thermostat'] },
  { slug: 'water_pump', display: 'Water pump', category: 'other', aliases: ['water pump'] },
  { slug: 'radiator', display: 'Radiator', category: 'other', aliases: ['radiator'] },
  { slug: 'radiator_hose_upper', display: 'Upper radiator hose', category: 'hose', aliases: ['upper radiator hose', 'upper hose'] },
  { slug: 'radiator_hose_lower', display: 'Lower radiator hose', category: 'hose', aliases: ['lower radiator hose', 'lower hose'] },
  // Drivetrain fluids
  { slug: 'transmission_fluid', display: 'Transmission fluid', category: 'fluid', aliases: ['transmission fluid', 'trans fluid', 'atf', 'gearbox oil'] },
  { slug: 'differential_fluid_rear', display: 'Rear differential fluid', category: 'fluid', aliases: ['rear differential fluid', 'rear diff fluid', 'differential fluid', 'diff fluid', 'gear oil', 'axle fluid'] },
  { slug: 'differential_fluid_front', display: 'Front differential fluid', category: 'fluid', aliases: ['front differential fluid', 'front diff fluid'] },
  { slug: 'transfer_case_fluid', display: 'Transfer case fluid', category: 'fluid', aliases: ['transfer case fluid', 'transfer case oil'] },
  { slug: 'power_steering_fluid', display: 'Power steering fluid', category: 'fluid', aliases: ['power steering fluid', 'ps fluid'] },
  // Belts
  { slug: 'serpentine_belt', display: 'Serpentine belt', category: 'belt', aliases: ['serpentine belt', 'drive belt', 'accessory belt'] },
  { slug: 'timing_belt', display: 'Timing belt', category: 'belt', aliases: ['timing belt'] },
  // Electrical
  { slug: 'battery', display: 'Battery', category: 'battery', aliases: ['battery', 'car battery'] },
  { slug: 'alternator', display: 'Alternator', category: 'alternator', aliases: ['alternator'] },
  { slug: 'starter', display: 'Starter', category: 'starter', aliases: ['starter', 'starter motor'] },
  // Fuel / air
  { slug: 'fuel_pump', display: 'Fuel pump', category: 'fuel_pump', aliases: ['fuel pump'] },
  { slug: 'mass_air_flow_sensor', display: 'Mass air flow sensor', category: 'sensor', aliases: ['mass air flow sensor', 'maf sensor', 'maf'] },
  { slug: 'oxygen_sensor', display: 'Oxygen sensor', category: 'sensor', aliases: ['oxygen sensor', 'o2 sensor', 'lambda sensor'] },
  // Suspension / steering
  { slug: 'shock_absorber', display: 'Shock absorber', category: 'suspension', aliases: ['shock absorber', 'shock', 'shocks'] },
  { slug: 'strut', display: 'Strut assembly', category: 'suspension', aliases: ['strut', 'strut assembly'] },
  { slug: 'control_arm', display: 'Control arm', category: 'suspension', aliases: ['control arm', 'lower control arm', 'upper control arm'] },
  { slug: 'sway_bar_link', display: 'Sway bar link', category: 'suspension', aliases: ['sway bar link', 'stabilizer link', 'end link'] },
  { slug: 'wheel_bearing', display: 'Wheel bearing', category: 'suspension', aliases: ['wheel bearing', 'hub bearing'] },
  { slug: 'cv_axle', display: 'CV axle', category: 'suspension', aliases: ['cv axle', 'cv joint', 'axle shaft', 'half shaft'] },
  { slug: 'tie_rod_end', display: 'Tie rod end', category: 'suspension', aliases: ['tie rod end', 'tie rod'] },
  // Wear items
  { slug: 'wiper_blade', display: 'Wiper blades', category: 'wiper', aliases: ['wiper blade', 'wiper', 'windshield wiper'] },
  { slug: 'headlight_bulb', display: 'Headlight bulb', category: 'bulb', aliases: ['headlight bulb', 'headlight', 'head light bulb'] },
  { slug: 'tail_light_bulb', display: 'Tail light bulb', category: 'bulb', aliases: ['tail light bulb', 'taillight bulb', 'brake light bulb'] },
  { slug: 'tpms_sensor', display: 'TPMS sensor', category: 'tpms', aliases: ['tpms sensor', 'tpms', 'tire pressure sensor'] },
];

const SLUG_SET = new Set(PART_VOCAB.map((v) => v.slug));

const singular = (w: string) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w);
const tokens = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean).map(singular);

/**
 * Map any part text (a canonical slug OR free text) to its canonical PartDef, or
 * null if it maps to nothing in the vocabulary (caller falls back to fuzzy). A
 * slug wins outright; otherwise the entry whose longest alias is a token-subset
 * of the input wins (longest = most specific, so "front brake pad" beats "brake
 * pad"). Deterministic — same input always yields the same slug.
 */
export function canonicalizePart(text: string | undefined | null): PartDef | null {
  if (!text) return null;
  const raw = text.trim().toLowerCase();
  // Direct slug (the model emitted a vocabulary slug).
  const asSlug = raw.replace(/[\s-]+/g, '_');
  if (SLUG_SET.has(asSlug)) return PART_VOCAB.find((v) => v.slug === asSlug) || null;

  const inputTokens = new Set(tokens(raw));
  if (!inputTokens.size) return null;

  let best: PartDef | null = null;
  let bestLen = 0;
  for (const v of PART_VOCAB) {
    for (const a of v.aliases) {
      const at = tokens(a);
      if (!at.length) continue;
      const subset = at.every((w) => inputTokens.has(w));
      if (subset && at.length > bestLen) { best = v; bestLen = at.length; }
    }
  }
  return best;
}

/** The canonical slug for a part text, or null. Convenience over canonicalizePart. */
export function canonicalSlug(text: string | undefined | null): string | null {
  return canonicalizePart(text)?.slug ?? null;
}
