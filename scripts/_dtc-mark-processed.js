#!/usr/bin/env node
/**
 * Mark the issues in one or more DTC part scripts as PROCESSED, after their waves have run.
 *
 * Kept separate from _gen-dtc-tag-parts.js on purpose. Generating a part script is not the same as
 * running one: an earlier version marked ids at generation time, and when only 2 of 8 generated
 * waves were launched, 512 issues were recorded as judged without any agent having read them - they
 * would have been silently excluded from every future export, invisibly shrinking the catalog's
 * taggable surface. Marking is therefore an explicit step that follows a completed run.
 *
 * The ledger is what stops future exports from re-ranking the same nameplates to the top forever:
 * only ~28% of what the pass reads gets a code, and a correctly-declined issue stays untagged, so
 * "still untagged" is not the same set as "not yet examined".
 *
 *   node scripts/_dtc-mark-processed.js scripts/_wf-dtc-tag-w0.js scripts/_wf-dtc-tag-w6.js
 */
const fs = require('fs');

const LEDGER = 'data/_dtc-processed-ids.json';
const files = process.argv.slice(2).filter((a) => a.endsWith('.js'));
if (!files.length) {
  console.error('usage: node scripts/_dtc-mark-processed.js <part-script.js> [...]');
  process.exit(1);
}

let ledger = new Set();
try { ledger = new Set(JSON.parse(fs.readFileSync(LEDGER, 'utf8'))); } catch { /* first run */ }
const before = ledger.size;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const line = src.split('\n').find((l) => l.startsWith('const BATCHES = '));
  if (!line) { console.log(`  SKIP ${f}: no BATCHES line`); continue; }
  const batches = JSON.parse(line.slice('const BATCHES = '.length));
  let n = 0;
  batches.forEach((b) => b.issues.forEach((i) => { ledger.add(i.id); n++; }));
  console.log(`  ${f.split(/[\\/]/).pop().padEnd(24)} ${String(n).padStart(4)} issues | ${batches.map((b) => b.make + ' ' + b.model + (b.part > 1 ? ' p' + b.part : '')).join(', ')}`);
}

fs.writeFileSync(LEDGER, JSON.stringify([...ledger]));
console.log(`\nprocessed ledger: ${before} -> ${ledger.size} (+${ledger.size - before})`);
