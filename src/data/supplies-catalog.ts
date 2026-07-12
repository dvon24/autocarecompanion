/**
 * Universal supplies catalog — consumables and tools that are NOT vehicle-
 * specific (gloves, drain pan, brake cleaner, transfer pump, torque wrench…).
 *
 * These must NEVER go through the per-vehicle parts verifier: web-searching
 * "2015 Dodge Challenger SRT 392 nitrile gloves" is exactly how you get Polaris
 * drain plugs. They get a clean, generic, correctly-tagged Amazon link instead.
 * The `q` is a good product query (with a known good product/PN where useful).
 */

export interface SupplyEntry {
  keys: string[]; // lowercase substrings that identify this supply in a part name
  label: string;
  q: string; // Amazon search query (generic — NO vehicle prefix)
}

export const SUPPLIES: SupplyEntry[] = [
  { keys: ['nitrile glove', 'mechanic glove', 'gloves'], label: 'Nitrile gloves', q: 'nitrile mechanic gloves 6 mil box' },
  { keys: ['shop towel', 'shop rag', 'rag'], label: 'Shop towels', q: 'blue shop towels roll' },
  { keys: ['drain pan', 'catch pan', 'oil pan drain'], label: 'Drain pan', q: 'oil drain pan 8 quart' },
  { keys: ['funnel'], label: 'Funnel', q: 'automotive fluid funnel set' },
  { keys: ['brake clean', 'brake cleaner', 'parts cleaner'], label: 'Brake cleaner', q: 'CRC brakleen brake cleaner 05089' },
  { keys: ['fluid transfer pump', 'gear oil pump', 'transfer pump', 'fluid pump', 'suction gun'], label: 'Fluid transfer pump', q: 'gear oil fluid transfer hand pump' },
  { keys: ['torque wrench'], label: 'Torque wrench', q: '1/2 inch drive click torque wrench' },
  { keys: ['hex bit', 'allen', 'hex socket', 'socket set'], label: 'Hex/socket set', q: 'hex bit socket set metric sae' },
  { keys: ['jack stand'], label: 'Jack stands', q: '3 ton jack stands pair' },
  { keys: ['penetrating oil', 'pb blaster', 'liquid wrench'], label: 'Penetrating oil', q: 'PB Blaster penetrating oil' },
  { keys: ['gasket scraper', 'scraper'], label: 'Gasket scraper', q: 'plastic gasket scraper set' },
  { keys: ['thread sealant', 'rtv', 'thread locker', 'threadlocker'], label: 'Thread sealant', q: 'permatex thread sealant' },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * If a part name is a universal supply, return a clean generic Amazon link
 * (au7o-20). Otherwise null — the part goes through the per-vehicle verifier.
 */
export function matchSupply(partName: string): { label: string; url: string } | null {
  const n = norm(partName);
  if (!n) return null;
  for (const s of SUPPLIES) {
    if (s.keys.some((k) => n.includes(k))) {
      return { label: s.label, url: `https://www.amazon.com/s?k=${encodeURIComponent(s.q)}&tag=au7o-20` };
    }
  }
  return null;
}
