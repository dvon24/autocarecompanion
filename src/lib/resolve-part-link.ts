/**
 * THE shared part-link decision tree. Both the hub chat and vision call this so
 * they can never diverge again (vision used to surface Summit/aftermarket via
 * its own logic while the hub was already resolving verified deep links). One
 * tree, N renderers — the record-store program made literal at the logic layer.
 *
 * Returns STRUCTURED data; each surface renders it its own way (hub → markdown,
 * vision → vendorLinks[]). The authoritative lanes — supply short-circuit,
 * canonical-key verified lookup, honest miss — live HERE. Surface-specific
 * miss-fallback (the hub's Amazon search, vision's catalog links) stays in the
 * caller; that's the honest "we don't have a verified record yet" path, not a
 * competing source of truth.
 */
import { matchSupply } from '@/data/supplies-catalog';
import { canonicalizePart } from './part-vocabulary';
import { getCachedVerifiedPart } from './verified-parts';

export interface ResolvedPartLink {
  /** Clean display name (canonical when the part is in the vocabulary). */
  displayName: string;
  /** supply = universal consumable → generic Amazon; verified = a web-verified
   *  record-store deep link; miss = no verified record (caller does its fallback
   *  + a background warm has been queued). */
  kind: 'supply' | 'verified' | 'miss';
  partNumber?: string;
  /** Verified product pages (supply → the one generic Amazon link). buyLinks[0]
   *  is the primary. `verified` flags a record-store-confirmed product page. */
  buyLinks: Array<{ vendor: string; url: string; verified: boolean }>;
  /** One short display caveat (fitment note), first clause capped ~80 chars. */
  caveat?: string;
  aftermarket: Array<{ brand: string; partNumber: string }>;
}

/** First clause of a caveat, capped — not the verifier's full audit note. */
function shortCaveat(c: string): string {
  const first = c.split(/[.;]/)[0].trim();
  return first.length > 80 ? first.slice(0, 77).trimEnd() + '…' : first;
}

export async function resolvePartLink(
  input: { partName: string; brand?: string },
  vehicle: { year?: number; make?: string; model?: string; trim?: string },
  warmSet?: Set<string>,
): Promise<ResolvedPartLink> {
  const partName = (input.partName || '').trim();
  const canon = canonicalizePart(partName);
  const displayName = canon?.display || partName;
  const empty = { displayName, kind: 'miss' as const, buyLinks: [], aftermarket: [] };
  if (!partName) return empty;

  // 1. Universal supply (gloves, pan, cleaner) → clean generic Amazon, NEVER a
  //    per-vehicle verify (that's how "nitrile gloves" returned drain plugs).
  const supply = matchSupply(displayName);
  if (supply) return { displayName: supply.label, kind: 'supply', buyLinks: [{ vendor: 'Amazon', url: supply.url, verified: false }], aftermarket: [] };

  // 2. Canonical-key verified lookup — the authoritative deep link, same source
  //    as the known-issues fix links. Cache-read only (no synchronous A-grade
  //    verify in a live path).
  let verified = null as Awaited<ReturnType<typeof getCachedVerifiedPart>>;
  try { verified = await getCachedVerifiedPart(vehicle, displayName); } catch { /* */ }

  if (verified?.buyUrl) {
    const links = (verified.buyLinks?.length ? verified.buyLinks : [{ vendor: verified.buyVendor || 'Buy', url: verified.buyUrl }]).slice(0, 3);
    return {
      displayName,
      kind: 'verified',
      partNumber: verified.partNumber,
      buyLinks: links.map((l) => ({ vendor: l.vendor, url: l.url, verified: true })),
      caveat: verified.caveat ? shortCaveat(verified.caveat) : undefined,
      aftermarket: (verified.aftermarket || []).slice(0, 2).map((a) => ({ brand: a.brand, partNumber: a.partNumber })),
    };
  }

  // 3. Miss — queue a background A-standard verify so the next asker (any
  //    surface) gets the deep link. Caller renders its own honest fallback.
  if (warmSet) warmSet.add(displayName);
  return empty;
}
