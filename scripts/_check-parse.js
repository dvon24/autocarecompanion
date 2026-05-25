const fs = require('fs');
const t = fs.readFileSync('_last-raw-text.txt', 'utf8');
const start = t.indexOf('{', t.indexOf('"issues"') - 200);
let depth = 0, inStr = false, esc = false, end = -1;
for (let j = start; j < t.length; j++) {
  const ch = t[j];
  if (inStr) {
    if (esc) esc = false;
    else if (ch === '\\') esc = true;
    else if (ch === '"') inStr = false;
  } else {
    if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
}
console.log('start:', start, 'end:', end, 'total length:', t.length);
if (end === -1) {
  console.log('  ⚠ UNBALANCED — depth at EOF:', depth);
  console.log('  Last 300 chars:'); console.log(t.slice(-300));
} else {
  const slice = t.slice(start, end + 1);
  try {
    const o = JSON.parse(slice);
    console.log('  parsed OK, issues count:', o.issues?.length);
  } catch (e) {
    console.log('  parse fail:', e.message);
    console.log('  slice first 200:'); console.log(slice.slice(0, 200));
    console.log('  slice last 300:'); console.log(slice.slice(-300));
  }
}
