// Generate a subscription Workflow that DISCOVERS + verifies the primary fix part
// for each parts-less known issue of one make. Output shape matches
// _persist-fixparts-reconcile.js: { confirmed: [{ issueId, adds:[{component,
// oemPartNumber}], corrections:[] }] }. AI-free generator (reads + embeds).
//   node scripts/_gen-fixparts-deepen-wf.js <MAKE>
const fs = require('fs');
const MAKE = process.argv[2];
if (!MAKE) { console.error('usage: node scripts/_gen-fixparts-deepen-wf.js <MAKE>'); process.exit(1); }
const all = JSON.parse(fs.readFileSync('data/_fixparts-gaps.json', 'utf8'));
const issues = all[MAKE];
if (!issues || !issues.length) { console.error('no gap issues for', MAKE); process.exit(1); }

const DATA = JSON.stringify(issues.map((it) => ({
  id: it.id, t: it.title, v: `${it.make} ${it.model}`, y: it.years, e: it.engines, dtc: it.dtc,
  s: (it.solution || '').slice(0, 320), c: it.category,
})));

const script = `export const meta = {
  name: 'fixparts-deepen-${MAKE.toLowerCase()}',
  description: 'Discover + verify the primary OEM fix part for ${issues.length} parts-less ${MAKE} known issues, to the 5-gate standard (PN from a real product page, correct component + vehicle scope, or DROP). Correctness > depth > monetization.',
  phases: [{ title: 'Verify' }],
}

const ISSUES = ${DATA}

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    confirmed: { type: 'boolean', description: 'true ONLY if a correct OEM fix part was verified against a real product page' },
    component: { type: 'string', description: 'the fix part name, e.g. "thermostat housing" — empty if not confirmed' },
    oemPartNumber: { type: 'string', description: 'OEM part number FROM a live product page, empty if not confirmed' },
    caveat: { type: 'string', description: 'one short fitment note or empty' },
  },
  required: ['confirmed', 'component', 'oemPartNumber', 'caveat'],
}

const results = await pipeline(
  ISSUES,
  (it) => agent(
    \`You are an OEM parts auditor for au7o. USE WEB SEARCH — never answer from memory.

Known issue on a \${it.v} (\${it.y || 'multi-year'}\${it.e ? ', ' + it.e : ''}):
TITLE: \${it.t}
CATEGORY: \${it.c}
FIX / SOLUTION: \${it.s}
\${it.dtc ? 'DTCs: ' + it.dtc : ''}

TASK: identify the SINGLE primary OEM PART a buyer needs to FIX this specific issue (the component the solution replaces — e.g. a failed water pump, thermostat, ignition coil, valve cover gasket). Then WEB-SEARCH to verify its correct OEM part number for THIS vehicle.

5-GATE STANDARD (a wrong-fitment PN converts then refunds — correctness is the product):
- The part must actually RESOLVE this issue (match the solution text), not a loosely-related part.
- Correct OEM PN for THIS make/model/year/engine scope. Verify part TYPE + fitment. NEVER borrow a sibling model's number.
- The PN must come FROM a real product page you opened via search — not memory.
- If the issue is a procedure/adjustment/software fix with NO single buyable part, or you cannot confirm a correct PN on a real product page, set confirmed=false (DROP — do not guess).
- If genuinely multiple valid PNs by build, pick the most-common and note it in caveat.

Return confirmed=true ONLY with a real verified OEM PN; else confirmed=false with empty fields.\`,
    { label: \`fix:\${it.v}\`.slice(0, 40), phase: 'Verify', schema: SCHEMA },
  ).then((r) => (r && r.confirmed && r.oemPartNumber ? { issueId: it.id, adds: [{ component: r.component, oemPartNumber: r.oemPartNumber, caveat: r.caveat || '' }], corrections: [] } : null)),
)

const confirmed = results.filter(Boolean)
log(\`${MAKE}: \${confirmed.length}/\${ISSUES.length} issues got a verified fix part\`)
return { confirmed }
`;

const outPath = `scripts/_wf-fixparts-${MAKE.toLowerCase()}.js`;
fs.writeFileSync(outPath, script);
console.log(`Wrote ${outPath} (${issues.length} issues, ${(script.length / 1024).toFixed(0)}KB)`);
