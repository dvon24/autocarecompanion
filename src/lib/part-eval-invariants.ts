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
import { getVehicleSpecs } from './maintenance';
import { canonicalSlug } from './part-vocabulary';
import { getCachedVerifiedPart } from './verified-parts';

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

  // INV-4 — spec-DB regression guard. The spec DB feeds part verification as
  // ground truth, and it was generated by a process that BLURS engine variants
  // (it stamped the 3.6L V6 filter + 5.7L plug + pre-2015 axle fluid onto the
  // 6.4L SRT). If that generation runs again it could silently reintroduce the
  // contamination, so lock in BOTH the corrected values AND the trim resolution
  // that routes every 6.4L trim to the right block. No network/secrets — pure data.
  try {
    const bad: string[] = [];
    // (a) corrected values on the canonical trim — the wrong-engine PNs must not return.
    const srt = getVehicleSpecs({ year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' }) as {
      sparkPlugs?: { partNumber?: string }; oil?: { filterPartNumber?: string }; differentials?: { rear?: { type?: string } };
    } | null;
    if (!srt) bad.push('SRT 392 resolved to NULL spec');
    else {
      const plug = srt.sparkPlugs?.partNumber || '';
      const filter = srt.oil?.filterPartNumber || '';
      const diff = srt.differentials?.rear?.type || '';
      if (!/LZTR6AP11EG/i.test(plug)) bad.push(`spark plug regressed: "${plug}" (want LZTR6AP11EG, the 6.4L plug — LZFR5CI is the 5.7L's)`);
      if (!/0?4884899/i.test(filter)) bad.push(`oil filter regressed: "${filter}" (want 04884899 spin-on — 68191349AC is the 3.6L V6 cartridge)`);
      if (!/75W-85/i.test(diff)) bad.push(`diff fluid regressed: "${diff}" (want 75W-85 — 75W-140 is the pre-2015 axle)`);
    }
    // (b) trim resolution: every 6.4L trim must reach the same 6.4L block (not the V6).
    for (const trim of ['Scat Pack', '392', 'R/T Scat Pack']) {
      const s = getVehicleSpecs({ year: 2015, make: 'Dodge', model: 'Challenger', trim }) as { sparkPlugs?: { partNumber?: string } } | null;
      if (!/LZTR6AP11EG/i.test(s?.sparkPlugs?.partNumber || '')) {
        bad.push(`trim "${trim}" mis-resolved to "${s?.sparkPlugs?.partNumber || 'NULL'}" (should reach the 6.4L block, not V6)`);
      }
    }
    // (c) Mopar V8-family fixtures (from the systemic audit). The V6 cartridge
    // filter 68191349AC must never be the V8's ONLY filter; the old copper plug
    // LZFR5CI must be gone; the 6.4 TRUCK plug must stay distinct from the car's.
    type Blk = { sparkPlugs?: { partNumber?: string }; oil?: { filterPartNumber?: string }; differentials?: { rear?: { variants?: unknown[] } } } | null;
    const charger = getVehicleSpecs({ year: 2018, make: 'Dodge', model: 'Charger', trim: 'R/T' }) as Blk;
    if (!/SP143877AB/i.test(charger?.sparkPlugs?.partNumber || '')) bad.push(`Charger 5.7 plug regressed: "${charger?.sparkPlugs?.partNumber}" (want iridium SP143877AB)`);
    const cf = charger?.oil?.filterPartNumber || '';
    if (!/04892339|MO-339/i.test(cf)) bad.push(`Charger 5.7 filter missing V8 spin-on: "${cf}" (68191349AC alone is the V6 cartridge)`);
    const ram3500 = getVehicleSpecs({ year: 2021, make: 'RAM', model: '3500', trim: 'Tradesman' }) as Blk;
    if (!/SP138239AC/i.test(ram3500?.sparkPlugs?.partNumber || '')) bad.push(`RAM 3500 6.4 truck plug regressed: "${ram3500?.sparkPlugs?.partNumber}" (want SP138239AC, distinct from car SP149212AC)`);
    if (!(ram3500?.differentials?.rear?.variants?.length)) bad.push('RAM 3500 diff lost its conditional variants (SRW/DRW)');
    const ok = bad.length === 0;
    out.push({ name: 'INV-4 spec-DB no-cross-engine-contamination', ok, detail: ok ? undefined : bad.join(' | ') });
  } catch (e) {
    out.push({ name: 'INV-4 spec-DB no-cross-engine-contamination', ok: false, detail: e instanceof Error ? e.message : String(e) });
  }

  // INV-5 — canonical-key contract. The record-store match is EXACT on canonical
  // slug, not fuzzy, so distinct parts get distinct keys and can't hijack each
  // other (the "oil filter" ~ "air filter" collision that motivated the contract).
  // Pure, no network.
  try {
    const bad: string[] = [];
    const eq: Array<[string, string]> = [
      ['oil filter', 'oil_filter'], ['engine air filter', 'air_filter'],
      ['front brake pads', 'brake_pad_front'], ['rear differential fluid', 'differential_fluid_rear'],
      ['diff fluid', 'differential_fluid_rear'], ['spark plugs', 'spark_plug'],
    ];
    for (const [text, slug] of eq) {
      const got = canonicalSlug(text);
      if (got !== slug) bad.push(`canonicalSlug("${text}")="${got}" (want "${slug}")`);
    }
    // Distinct parts MUST get distinct slugs (the anti-collision guarantee).
    const distinct: Array<[string, string]> = [['oil filter', 'air filter'], ['oil filter', 'fuel filter'], ['front brake pads', 'rear brake pads']];
    for (const [a, b] of distinct) {
      const sa = canonicalSlug(a), sb = canonicalSlug(b);
      if (sa && sb && sa === sb) bad.push(`"${a}" and "${b}" collide on slug "${sa}"`);
    }
    // Free text outside the vocabulary must be null (falls to the fuzzy/supply lane).
    if (canonicalSlug('nitrile gloves') !== null) bad.push('"nitrile gloves" should be null (supply, not a vocab part)');
    const ok = bad.length === 0;
    out.push({ name: 'INV-5 canonical-key no-collision', ok, detail: ok ? undefined : bad.join(' | ') });
  } catch (e) {
    out.push({ name: 'INV-5 canonical-key no-collision', ok: false, detail: e instanceof Error ? e.message : String(e) });
  }

  // INV-6 — the air-filter fitment guard. A standard-config SRT 392 must NEVER
  // surface 68322213AA (the T/A open-element COLD-AIR intake filter). The guard
  // is prompt-logic, which has regressed twice — so this fixture catches a
  // re-cache of the wrong-config part. DB-backed but TOLERANT: if the read fails
  // (no DB / offline eval) it SKIPS rather than failing, so it's safe anywhere;
  // it only FAILS on a confirmed read that shows the trap PN.
  try {
    let detail: string | undefined;
    let ok = true;
    try {
      const h = await getCachedVerifiedPart({ year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' }, 'air filter');
      const pn = (h?.partNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (pn === '68322213AA') { ok = false; detail = 'SRT 392 air filter is 68322213AA — the T/A cold-air filter (standard-config guard regressed)'; }
      else if (!h?.buyUrl) detail = 'skipped — no cached SRT 392 air filter record to check';
      else detail = `standard-config OK (${h.partNumber || 'no-PN'})`;
    } catch {
      detail = 'skipped — DB unavailable (offline eval)';
    }
    out.push({ name: 'INV-6 air-filter standard-config (no T/A trap)', ok, detail });
  } catch (e) {
    out.push({ name: 'INV-6 air-filter standard-config (no T/A trap)', ok: false, detail: e instanceof Error ? e.message : String(e) });
  }

  return out;
}
