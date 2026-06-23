// Chunked reconcile driver — picks the next N un-reconciled issues for a make
// and injects them into the reconcile workflow. Tracks done issues in
// data/_recon-seen.json so each run advances (and so the throttle-prone big
// runs are split into safe ~30-issue chunks). Run, then Workflow(reconcile),
// then persist, then repeat.
//   node scripts/_recon-next-chunk.js --make=dodge --size=30
const fs = require('fs');
const WF = 'C:/Users/devon/.claude/projects/c--Users-devon-autocarecompanion/0a61347a-a8f9-41a4-a609-1866ef72c1c2/workflows/scripts/fixparts-reconcile.js';
const make = (process.argv.find((a) => a.startsWith('--make=')) || '').split('=')[1] || 'dodge';
const size = parseInt((process.argv.find((a) => a.startsWith('--size=')) || '').split('=')[1] || '30', 10);

const all = JSON.parse(fs.readFileSync('data/_recon-' + make + '.json', 'utf8'));
let seen = new Set();
try { seen = new Set(JSON.parse(fs.readFileSync('data/_recon-seen.json', 'utf8'))); } catch { /* first run */ }

const next = all.filter((i) => !seen.has(i.id)).slice(0, size);
if (next.length === 0) { console.log('DONE: all ' + all.length + ' ' + make + ' issues reconciled.'); process.exit(0); }

// inject
let s = fs.readFileSync(WF, 'utf8');
s = s.replace(/const ISSUES = .*\n/, 'const ISSUES = ' + JSON.stringify(next) + '\n');
fs.writeFileSync(WF, s);

// mark seen
for (const i of next) seen.add(i.id);
fs.writeFileSync('data/_recon-seen.json', JSON.stringify([...seen], null, 0));

const remaining = all.length - all.filter((i) => seen.has(i.id)).length;
console.log('Injected ' + next.length + ' ' + make + ' issues: ' + [...new Set(next.map((i) => i.model))].slice(0, 12).join(', '));
console.log('Progress: ' + (all.length - remaining) + '/' + all.length + ' ' + make + ' reconciled, ' + remaining + ' remaining.');
