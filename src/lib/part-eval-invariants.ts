/**
 * Runtime invariants for the part-resolution pipeline — the guardrails that must
 * hold forever or a regression has landed. Shared by the CLI eval
 * (scripts/eval-resolve-parts.ts) and the daily cron (/api/cron/eval), so they
 * run "without Devon remembering." These need NO secrets and no network (eBay
 * verify stays off), so they're safe to run anywhere on every deploy/day.
 *
 * They lock in this session's fixes:
 *  - INV-1  the model can never fabricate a PN: an uncorroborated part resolves
 *           with oemPartNumber === null + an honest fitment note (the Ram-PN-on-
 *           a-Challenger class).
 *  - INV-2  no RETAIL vendor URL ever carries a bare OEM part number — retail
 *           always gets a descriptive query (vendor dialect). Tested by feeding
 *           the resolver a real OEM PN and asserting retail links stay descriptive.
 *  - INV-3  eBay links are EPN-affiliate-tagged when a campaign id is configured.
 */

import { resolveParts } from './resolve-parts';
import { attachVendorLinks } from './vendor-resolver';

export interface InvariantResult {
  name: string;
  ok: boolean;
  detail?: string;
}

const RETAIL_HOST = /(amazon|summitracing|autozone|napaonline|oreillyauto|advanceautoparts|americanmuscle)\./i;

function queryOf(url: string): string {
  try {
    const u = new URL(url);
    for (const k of ['k', 'searchTerm', '_nkw', 'searchText', 'text', 'q', 'search_string']) {
      const v = u.searchParams.get(k);
      if (v) return decodeURIComponent(v);
    }
  } catch { /* */ }
  return '';
}

export async function runPartInvariants(): Promise<InvariantResult[]> {
  const out: InvariantResult[] = [];
  const veh = { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' };

  // INV-1 — STRUCTURAL, not a blocklist. The guarantee lives in resolveParts:
  // oemPartNumber is ONLY ever assigned from a corroboration source (eBay seller
  // agreement or our catalog) — never from the model/intent — so a PN is
  // un-fabricable by construction. This asserts the OBSERVABLE consequence over
  // several parts + vehicles: (a) every non-null PN carries a real provenance
  // (never 'unresolved'), and (b) with no corroboration available (eBay off) no
  // PN appears and the honest fitment note does. Adding a new wrong number can't
  // pass this the way a "known-bad-number blocklist" would miss it.
  try {
    const CASES = [
      { veh, intent: { partName: 'lower radiator hose', category: 'hose' as const, tier: 'oem' as const } },
      { veh, intent: { partName: 'water pump', category: 'other' as const, tier: 'oem' as const } },
      { veh: { year: 2020, make: 'Toyota', model: 'Camry', trim: 'LE' }, intent: { partName: 'front brake pads', category: 'brake_pad' as const, tier: 'oem' as const } },
    ];
    const bad: string[] = [];
    const GOOD_PROV = new Set(['ebay_verified', 'ebay_reported', 'catalog']);
    for (const c of CASES) {
      const [card] = await resolveParts([c.intent], c.veh, { useEbay: false });
      if (!card) { bad.push(`${c.intent.partName}: no card`); continue; }
      // (a) any PN must have provenance — never a PN with 'unresolved'.
      if (card.oemPartNumber !== null && !GOOD_PROV.has(card.provenance)) {
        bad.push(`${c.intent.partName}: PN ${card.oemPartNumber} has provenance "${card.provenance}" (un-sourced)`);
      }
      // (b) uncorroborated (eBay off) ⇒ null PN + honest fitment note.
      if (card.oemPartNumber !== null || !card.fitmentNote) {
        bad.push(`${c.intent.partName}: expected null PN + fitment note, got PN=${card.oemPartNumber} note=${card.fitmentNote}`);
      }
    }
    const ok = bad.length === 0;
    out.push({ name: 'INV-1 no-fabricated-PN (structural: PN⇒provenance)', ok, detail: ok ? undefined : bad.join(' | ') });
  } catch (e) {
    out.push({ name: 'INV-1 no-fabricated-PN (structural: PN⇒provenance)', ok: false, detail: e instanceof Error ? e.message : String(e) });
  }

  // INV-2 — feed the vendor resolver a real OEM PN and confirm RETAIL vendors
  // still get a DESCRIPTIVE query (make/model present, not the bare PN).
  try {
    const pn = '68184587AB';
    const [part] = attachVendorLinks([{
      id: 'inv2', role: 'primary', category: 'rotor', name: 'front brake rotor',
      confidence: 1, visibleInPhoto: false, oemPartNumbers: [pn],
    }], { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' });
    const offenders: string[] = [];
    for (const l of part.vendorLinks) {
      if (!RETAIL_HOST.test(l.url)) continue; // only retail vendors must be descriptive
      const q = queryOf(l.url);
      const descriptive = /dodge|challenger/i.test(q);
      const barePN = q.replace(/\s+/g, '').toUpperCase() === pn.toUpperCase();
      if (!descriptive || barePN) offenders.push(`${l.vendor}: "${q}"`);
    }
    const ok = offenders.length === 0;
    out.push({ name: 'INV-2 retail-descriptive-not-bare-PN', ok, detail: ok ? undefined : offenders.join(' | ') });
  } catch (e) {
    out.push({ name: 'INV-2 retail-descriptive-not-bare-PN', ok: false, detail: e instanceof Error ? e.message : String(e) });
  }

  // INV-3 — eBay links are affiliate-tagged when a campaign id is set. Skips
  // (passes) when unset, since the tagging ships dark by design.
  try {
    const hasCampaign = !!process.env.NEXT_PUBLIC_EBAY_CAMPAIGN_ID;
    const [part] = await resolveParts([{ partName: 'front brake rotor', category: 'rotor' }], veh, { useEbay: false });
    const ebay = part?.vendorLinks.find((l) => l.vendor === 'ebay_motors');
    let ok = true; let detail: string | undefined;
    if (hasCampaign) {
      ok = !!ebay && /campid=/.test(ebay.url);
      if (!ok) detail = `campaign set but eBay link untagged: ${ebay?.url || '(no ebay link)'}`;
    } else {
      detail = 'skipped — NEXT_PUBLIC_EBAY_CAMPAIGN_ID not set (affiliate ships dark)';
    }
    out.push({ name: 'INV-3 ebay-affiliate-tagged', ok, detail });
  } catch (e) {
    out.push({ name: 'INV-3 ebay-affiliate-tagged', ok: false, detail: e instanceof Error ? e.message : String(e) });
  }

  return out;
}
