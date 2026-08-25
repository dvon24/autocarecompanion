#!/usr/bin/env node
/**
 * Crash-safe checkpointing for research batches (discover/verify fan-outs).
 *
 * Every agent writes its slice to data/_wf-<batch>-parts/ the moment it finishes,
 * so a VS Code window reload / standby / reboot costs one unit, not the batch.
 * Writes are atomic (tmp + rename): a kill mid-write can never leave a half file
 * that _merge-<batch>-batch.js would choke on.
 *
 *   save   <batch> <name>              JSON on stdin  → parts/<name>.json
 *   append <batch> <name>              JSON on stdin  → parts/<name>.jsonl (one item per line)
 *   roll   <batch> <name> [--as key]   parts/<name>.jsonl → parts/<name>.json
 *                                      key defaults to candidates for discover-*, verdicts for verify-*
 *   status <batch> [--expect a,b,c]    what landed, what is missing
 *   todo   <batch> --expect a,b,c      names still missing, space separated (resume list)
 *
 * ZERO AI calls, no deps.
 */
const fs = require('fs');
const path = require('path');

const [, , cmd, batch, ...rest] = process.argv;
if (!cmd || !batch) die('usage: _wf-checkpoint.js <save|append|roll|status|todo> <batch> [name] [--expect a,b,c]');

const DIR = path.join(__dirname, '..', 'data', `_wf-${batch}-parts`);
const NAME_RE = /^[a-z0-9][a-z0-9._-]*$/i;

function die(msg) { console.error(msg); process.exit(1); }
function partPath(name, ext) {
  if (!NAME_RE.test(name)) die(`bad name "${name}" — use [a-z0-9._-], e.g. discover-3`);
  return path.join(DIR, `${name}.${ext}`);
}
function readStdin() {
  const raw = fs.readFileSync(0, 'utf8').trim();
  if (!raw) die('nothing on stdin');
  try { return { raw, val: JSON.parse(raw) }; }
  catch (e) { die(`stdin is not valid JSON (${e.message}) — nothing written, rerun the unit`); }
}
function writeAtomic(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp${process.pid}`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}
function countItems(v) {
  if (Array.isArray(v)) return v.length;
  for (const k of ['candidates', 'verdicts', 'items', 'confirmed']) if (Array.isArray(v && v[k])) return v[k].length;
  return null;
}
const expectArg = () => {
  const i = rest.indexOf('--expect');
  return i === -1 ? [] : String(rest[i + 1] || '').split(',').map((s) => s.trim()).filter(Boolean);
};

if (cmd === 'save') {
  const name = rest[0] || die('save needs a name, e.g. discover-3');
  const { raw, val } = readStdin();
  const file = partPath(name, 'json');
  writeAtomic(file, raw.endsWith('\n') ? raw : raw + '\n');
  const n = countItems(val);
  console.log(`saved ${path.relative(process.cwd(), file)}${n === null ? '' : ` (${n} items)`}`);

} else if (cmd === 'append') {
  const name = rest[0] || die('append needs a name, e.g. discover-3');
  const { val } = readStdin();
  const file = partPath(name, 'jsonl');
  fs.mkdirSync(DIR, { recursive: true });
  // append is already atomic for a single line under the O_APPEND small-write path
  fs.appendFileSync(file, JSON.stringify(val) + '\n');
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n').length;
  console.log(`appended → ${path.relative(process.cwd(), file)} (${lines} lines)`);

} else if (cmd === 'roll') {
  const name = rest[0] || die('roll needs a name, e.g. discover-3');
  const src = partPath(name, 'jsonl');
  if (!fs.existsSync(src)) die(`no ${src} to roll up`);
  const items = [];
  let dropped = 0;
  fs.readFileSync(src, 'utf8').split('\n').forEach((l) => {
    if (!l.trim()) return;
    try { items.push(JSON.parse(l)); } catch { dropped++; } // torn last line from a kill — skip it, keep the rest
  });
  const asIdx = rest.indexOf('--as');
  const key = asIdx !== -1 ? rest[asIdx + 1]
    : /^discover-/.test(name) ? 'candidates'   // shapes the merge script already reads
    : /^verify-/.test(name) ? 'verdicts'
    : 'items';
  writeAtomic(partPath(name, 'json'), JSON.stringify({ [key]: items }, null, 2) + '\n');
  console.log(`rolled ${items.length} items → ${name}.json as {${key}}${dropped ? ` (${dropped} torn line(s) skipped)` : ''}`);

} else if (cmd === 'status' || cmd === 'todo') {
  const expect = expectArg();
  const present = fs.existsSync(DIR)
    ? fs.readdirSync(DIR).filter((f) => /\.jsonl?$/.test(f)).sort()
    : [];
  const have = new Set(present.map((f) => f.replace(/\.jsonl?$/, '')));
  const missing = expect.filter((n) => !have.has(n));

  if (cmd === 'todo') {
    if (!expect.length) die('todo needs --expect a,b,c');
    console.log(missing.join(' '));
  } else {
    console.log(`batch ${batch} → ${DIR}`);
    if (!present.length) console.log('  (nothing checkpointed yet)');
    for (const f of present) {
      const full = path.join(DIR, f);
      let note = '';
      if (f.endsWith('.jsonl')) {
        note = `${fs.readFileSync(full, 'utf8').trim().split('\n').filter(Boolean).length} lines (in progress)`;
      } else {
        try { const n = countItems(JSON.parse(fs.readFileSync(full, 'utf8'))); note = n === null ? 'ok' : `${n} items`; }
        catch { note = 'CORRUPT — rerun this unit'; }
      }
      console.log(`  ${f.padEnd(28)} ${note}`);
    }
    if (expect.length) {
      console.log(missing.length ? `\nmissing (${missing.length}): ${missing.join(' ')}` : `\nall ${expect.length} expected units present`);
    }
  }

} else {
  die(`unknown command "${cmd}"`);
}
