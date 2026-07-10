// Generates scripts/_wf-parts-audit.js — a subscription Workflow that
// web-search-VERIFIES each fixParts entry against the 5-gate audit standard and
// returns a verification record. AI-free generator (just reads + embeds data).
const fs = require('fs');
const INPUT = process.argv[2] || 'data/_dodge-audit-input.json';
const items = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

// Compact each item so the embedded array stays small.
const compact = items.map((it, i) => ({
  idx: i,
  issueId: it.issueId,
  title: it.issueTitle,
  vehicle: `${it.make} ${it.model}`,
  years: it.years && it.years.length ? `${Math.min(...it.years)}-${Math.max(...it.years)}` : '',
  engines: (it.engines || []).join(', '),
  trims: (it.trims || []).join(', '),
  solution: (it.solution || '').slice(0, 300),
  dtcCodes: (it.dtcCodes || []).join(' '),
  source: it.source || 'fixParts',
  partIndex: it.partIndex,
  component: (it.part.component || '').slice(0, 140),
  currentPN: it.part.oemPartNumber || '',
  xref: (it.part.aftermarketXref || []).slice(0, 4).join(', '),
  currentVendors: (it.part.buyLinks || []).map(b => b.vendor).join(', '),
}));

const DATA = JSON.stringify(compact);

const script = `export const meta = {
  name: 'parts-audit-verify',
  description: 'Web-search-verify each fixParts entry (${compact.length} parts) against the 5-gate audit standard: resolution match, PN corroboration vs vehicle scope, year/engine variant expansion, deepest VERIFIED vendor link (never a synthesized search URL), and an internal-notes vs display-caveat split. Correctness > depth > monetization.',
  phases: [ { title: 'Verify' } ],
}

const PARTS = ${DATA}

const REC = {
  type: 'object', additionalProperties: false,
  properties: {
    idx: { type: 'integer' },
    status: { type: 'string', enum: ['verified','corrected','drop'] },
    resolutionMatch: { type: 'boolean' },
    variants: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
      scope: { type: 'string' }, oemPartNumber: { type: 'string' }, note: { type: 'string' }
    }, required: ['scope','oemPartNumber','note'] } },
    vendorLinks: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
      vendor: { type: 'string' }, url: { type: 'string' },
      linkType: { type: 'string', enum: ['product','catalog_fitment','listing'] },
      verified: { type: 'boolean' }, affiliate: { type: 'boolean' }
    }, required: ['vendor','url','linkType','verified','affiliate'] } },
    recallFirst: { type: 'boolean' },
    displayCaveat: { type: 'string' },
    verificationNotes: { type: 'string' },
    confidence: { type: 'number' },
    sources: { type: 'array', items: { type: 'string' } }
  },
  required: ['idx','status','resolutionMatch','variants','vendorLinks','recallFirst','displayCaveat','verificationNotes','confidence','sources']
}

function prompt(p) {
  return \`You are an OEM parts auditor for au7o (a car-repair site becoming a trustworthy source). USE WEB SEARCH to verify — do not answer from memory. Audit ONE fixPart against the 5-gate standard. A deep link to the wrong-fitment part converts and then refunds; correctness is the product.

COMPONENT FIDELITY (critical — this is the #1 error to avoid): resolve the PN + product page for THIS EXACT component only. NEVER borrow a sibling/related part's number to fill the slot. A valve-cover GASKET is not a rocker arm; a LIFTER is not a rocker arm; a BOLT is not a stud; a HOSE is not a clamp; a SENSOR is not the housing it bolts to. The oemPartNumber you return MUST be the number for the component named below — verify the part TYPE matches, not just the vehicle. If you cannot find THIS component's own verified PN and a real product page, set its variant oemPartNumber to "" and status='drop' — do NOT substitute a different part's number to avoid an empty field.

ISSUE: "\${p.title}" — \${p.vehicle} \${p.years} \${p.engines ? '('+p.engines+')' : ''} \${p.trims ? 'trims: '+p.trims : ''}
DTCs: \${p.dtcCodes || 'none'}
RESOLUTION TEXT (what the fix prescribes): \${p.solution}

CURRENT fixPart on the page:
  component: \${p.component}
  current OEM PN: \${p.currentPN || '(none)'}
  aftermarket xref: \${p.xref || '(none)'}
  current vendors (their links are generic searches — replace with verified product pages): \${p.currentVendors || '(none)'}

FIVE GATES (web-search each):
1. RESOLUTION MATCH — does this part actually match what the resolution text prescribes? If the fix is "reflash the TIPM" and the part is a random sensor, resolutionMatch=false and status='drop'.
2. PN VERIFICATION — corroborate the OEM PN against catalogs/listings (Mopar eStore, MoparPartsGiant, RockAuto, eBay, factory parts sites). Confirm the number's APPLICATION matches THIS vehicle+engine+years, not just that the number exists. If the current PN is wrong or wrong-generation, correct it (status='corrected').
3. VARIANT EXPANSION — if fitment splits by year/engine/package, return SEPARATE variants (e.g. TIPM 2011 vs 2012-13 vs 2014). Each variant: scope (e.g. "2012-2013 R/T & SRT8"), its oemPartNumber, a one-line note. If a single PN covers the whole scope, return one variant.
4. DEEP LINKS — for each vendor, provide the DEEPEST link you can VERIFY resolves to the actual product/fitment page (open it mentally via search): a real product page (linkType 'product'), a live eBay item or an OEM-catalog fitment page for the exact vehicle ('catalog_fitment'/'listing'). NEVER return a search-engine URL, a bare part-search page, or a homepage. If you cannot verify a working link for a vendor, DROP that vendor (omit it). Set verified=true only if you actually confirmed it via search. affiliate=true if the vendor has an au7o affiliate relationship (Amazon, eBay) — but rank by correctness+depth first, affiliate is only a tiebreaker; a correct Mopar eStore / MoparPartsGiant / specialist link with affiliate=false is FIRST-CLASS.
5. RECORD SPLIT — verificationNotes = your internal reasoning + sources (never shown to users). displayCaveat = ONE short user-facing line (e.g. "Year-specific — confirm your build by VIN" or "Fits 3.6L 160A; the 220A tow unit uses a different unit").

Also: if this issue is covered by an NHTSA RECALL (the resolution mentions a recall / the part is a recalled component), set recallFirst=true — the correct first action is a free VIN recall check, not buying the part.

Return the record. Set idx to EXACTLY \${p.idx}. confidence 0-1 = how sure you are the corrected PN(s)+links are right. status: 'verified' (current data already correct), 'corrected' (you fixed PN/links/variants), or 'drop' (part doesn't belong OR you couldn't verify this exact component). If any variant PN is empty because you couldn't verify it, say so plainly in displayCaveat rather than guessing.\`;
}

phase('Verify')
const recs = await pipeline(PARTS,
  (p) => agent(prompt(p), { label: 'audit:' + p.vehicle + ' ' + (p.component||'').slice(0,28), phase: 'Verify', schema: REC })
)
const clean = recs.filter(Boolean)
log('Audited ' + clean.length + '/' + PARTS.length + ' parts')
return { records: clean, meta: PARTS.map(p => ({ idx: p.idx, issueId: p.issueId, component: p.component, currentPN: p.currentPN })) }
`;

fs.writeFileSync('scripts/_wf-parts-audit.js', script);
console.log(`Wrote scripts/_wf-parts-audit.js — ${compact.length} parts to verify`);
