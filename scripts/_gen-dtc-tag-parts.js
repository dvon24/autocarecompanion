const fs = require('fs');
const lib = JSON.parse(fs.readFileSync('data/_dtc-library-index.json', 'utf8'));
const batches = JSON.parse(fs.readFileSync('data/_dtc-tag-batches.json', 'utf8'));

const START = Number(process.argv[2] || 0);   // index into the ranked batch list
const NPARTS = Number(process.argv[3] || 8);  // how many part files to emit
const PER = 6;                                // nameplates per part

const LIB = Object.fromEntries(Object.entries(lib).map(([c, d]) => [c, String(d || '').slice(0, 90)]));

const src = fs.readFileSync('scripts/_wf-dtc-tag-pass1.js', 'utf8');
const lines = src.split('\n');
const bIdx = lines.findIndex((l) => l.startsWith('const BATCHES = '));
const lIdx = lines.findIndex((l) => l.startsWith('const LIB = '));
if (bIdx < 0 || lIdx < 0) { console.error('could not locate BATCHES/LIB lines'); process.exit(1); }

// NOTE ON THE PROCESSED LEDGER: this script deliberately does NOT write it. Generating a part
// script is not the same as running one - an earlier version marked ids processed at generation
// time, and when only 2 of 8 generated waves were actually launched the other 512 issues were
// recorded as judged without any agent ever reading them, which would have silently excluded them
// from every future export. Mark ids only AFTER a wave completes, with:
//     node scripts/_dtc-mark-processed.js scripts/_wf-dtc-tag-w0.js ...

for (let n = 0; n < NPARTS; n++) {
  const slice = batches.slice(START + n * PER, START + (n + 1) * PER);
  if (!slice.length) { console.log('no batches left at part', n + 1); break; }
  const out = lines.slice();
  out[bIdx] = 'const BATCHES = ' + JSON.stringify(slice);
  out[lIdx] = 'const LIB = ' + JSON.stringify(LIB);
  const tag = 'w' + (START + n * PER);
  const body = out.join('\n').replace(/name: 'dtc-tag-pass1[^']*'/, "name: 'dtc-tag-" + tag + "'");
  const path = 'scripts/_wf-dtc-tag-' + tag + '.js';
  fs.writeFileSync(path, body);
  console.log(path, String(body.length).padStart(7), 'bytes |',
    String(slice.reduce((s, b) => s + b.issues.length, 0)).padStart(3), 'issues |',
    body.length < 524288 ? 'OK' : 'TOO BIG', '|',
    slice.map((b) => b.make + ' ' + b.model + (b.part > 1 ? ' p' + b.part : '')).join(', '));
}

console.log('\nreminder: run scripts/_dtc-mark-processed.js on each part script AFTER its wave completes.');
