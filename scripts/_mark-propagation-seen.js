// Mark every pair in the just-run batch (data/_propagation-batch.json) as
// "seen" so the next export skips them — whether they were confirmed or
// rejected. Run AFTER _persist-part-propagation.js. Idempotent.
const fs = require('fs');
const normPn = (p) => String(p || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const batchFile = process.argv[2] || 'data/_propagation-batch.json';
const batch = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
let seen = [];
try { seen = JSON.parse(fs.readFileSync('data/_propagation-seen.json', 'utf8')); } catch { /* first run */ }
const set = new Set(seen);
let added = 0;
for (const p of batch) {
  const key = String(p.candidate.id) + '|' + normPn(p.part.pn);
  if (!set.has(key)) { set.add(key); added++; }
}
fs.writeFileSync('data/_propagation-seen.json', JSON.stringify([...set], null, 0));
console.log('Marked ' + added + ' new pairs seen (' + set.size + ' total).');
