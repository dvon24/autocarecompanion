#!/usr/bin/env node
/**
 * Merge the `tagged` arrays from any number of DTC-tagging workflow output files into one payload
 * for `_persist-dtc-tag-pass.js`.
 *
 * Workflow task output nests the return value as {result:{result:{tagged,stats}}}; a file saved by
 * hand may be flatter. Both shapes are accepted. Entries are de-duplicated by issue id, unioning
 * the codes, so re-merging a run that was already persisted is harmless (persist is idempotent too).
 *
 *   node scripts/_merge-dtc-runs.js <out.json> <task1.output> <task2.output> ...
 */
const fs = require('fs');
const [outPath, ...inputs] = process.argv.slice(2);
if (!outPath || !inputs.length) {
  console.error('usage: node scripts/_merge-dtc-runs.js <out.json> <task.output> [...]');
  process.exit(1);
}

const byId = new Map();
let files = 0, proposed = 0, gate1 = 0;
for (const f of inputs) {
  let o;
  try { o = JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch (e) { console.log(`  SKIP ${f}: ${e.message.slice(0, 60)}`); continue; }
  const r = o?.result?.result || o?.result || o;
  const tagged = Array.isArray(r?.tagged) ? r.tagged : null;
  if (!tagged) { console.log(`  SKIP ${f}: no tagged[]`); continue; }
  files++;
  const st = r.stats || {};
  proposed += st.proposed || 0;
  gate1 += st.survivedLibraryGate || 0;
  for (const t of tagged) {
    if (!byId.has(t.id)) { byId.set(t.id, { ...t, codes: [...t.codes] }); continue; }
    const cur = byId.get(t.id);
    for (const c of t.codes) if (!cur.codes.includes(c)) cur.codes.push(c);
  }
  console.log(`  ${f.split(/[\\/]/).pop().padEnd(20)} ${String(tagged.length).padStart(3)} issues`);
}

const tagged = [...byId.values()];
const codes = tagged.reduce((s, t) => s + t.codes.length, 0);
fs.writeFileSync(outPath, JSON.stringify({ tagged }, null, 2));
console.log(`\n${files} runs merged -> ${tagged.length} distinct issues, ${codes} codes`);
console.log(`funnel across runs: proposed ${proposed} -> library-gated ${gate1} -> confirmed ${codes}`);
console.log('wrote', outPath);
