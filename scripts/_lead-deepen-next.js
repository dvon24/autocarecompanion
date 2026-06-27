const fs = require('fs');
const all = JSON.parse(fs.readFileSync('data/_lead-deepen-queue.json', 'utf8'));
let seen = []; try { seen = JSON.parse(fs.readFileSync('data/_lead-deepen-seen.json', 'utf8')); } catch { /* first */ }
const seenSet = new Set(seen); const key = (m) => m.make + '|' + m.model;
const size = parseInt((process.argv.find((a) => a.startsWith('--size=')) || '').split('=')[1] || '4', 10);
const next = all.filter((m) => !seenSet.has(key(m))).slice(0, size);
if (next.length === 0) { console.log('DONE: all ' + all.length + ' lead vehicles deepened.'); process.exit(0); }
const p = 'C:/Users/devon/.claude/projects/c--Users-devon-autocarecompanion/0a61347a-a8f9-41a4-a609-1866ef72c1c2/workflows/scripts/deepen-with-parts.js';
let s = fs.readFileSync(p, 'utf8'); s = s.replace(/const MODELS = .*\n/, 'const MODELS = ' + JSON.stringify(next) + '\n'); fs.writeFileSync(p, s);
for (const m of next) seenSet.add(key(m));
fs.writeFileSync('data/_lead-deepen-seen.json', JSON.stringify([...seenSet], null, 0));
console.log('Armed ' + next.length + ' lead vehicles: ' + next.map((m) => m.make + ' ' + m.model).join(', '));
console.log('Lead-deepen progress: ' + seenSet.size + '/' + all.length + ' (' + (all.length - seenSet.size) + ' remaining)');
