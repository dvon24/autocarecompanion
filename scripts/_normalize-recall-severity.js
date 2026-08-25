#!/usr/bin/env node
/**
 * Deterministic severity normalisation for recall-derived issues. ZERO AI.
 *
 * WHY: the discover agents rated all 99 batch-1 entries "high". The prompt rule ("high if the
 * consequence involves crash, fire, injury or loss of control") matches almost every recall,
 * because NHTSA consequence text nearly always cites crash or injury risk — that is what makes
 * it a recall. The effect is no severity variation at all: a mis-printed load-capacity sticker
 * ranks level with an airbag that will not inflate, which makes the site's severity filter
 * useless and misleads readers.
 *
 * Severity is a classification, not a research finding, so derive it from NHTSA's own Component
 * taxonomy. Conservative: only DOWNGRADES clear non-hazards, never upgrades.
 *
 * Usage: node scripts/_normalize-recall-severity.js <file.json> [--dry-run]
 */
const fs = require('fs');
const file = process.argv[2];
const dry = process.argv.includes('--dry-run');
if (!file) { console.error('usage: node scripts/_normalize-recall-severity.js <file.json> [--dry-run]'); process.exit(1); }

// component pattern -> severity. First match wins; anything unmatched keeps what it had.
const RULES = [
  [/LABEL|OWNER'?S? MANUAL|DOCUMENT/i,                 'low',    'documentation/label defect — no failure occurs'],
  [/BACK OVER PREVENTION|REAR ?VIEW|CAMERA/i,          'medium', 'lost rear visibility aid; driver retains mirrors and control'],
  [/RADIO|TAPE DECK|ENTERTAINMENT|INFOTAINMENT/i,      'medium', 'infotainment/telematics — not a driving-control failure'],
];

const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
const confirmed = payload?.result?.confirmed || [];
const changes = [];
for (const c of confirmed) {
  const comp = String(c._component || c._campaignComponent || '');
  // component isn't carried on the issue, so fall back to matching title+description text
  const hay = `${comp} ${c.title} ${c.description}`;
  for (const [re, sev, why] of RULES) {
    if (re.test(hay) && c.severity !== sev) {
      changes.push({ id: `${c.make} ${c.model}`, campaign: c._campaign, from: c.severity, to: sev, why });
      if (!dry) c.severity = sev;
      break;
    }
  }
}
const after = {};
confirmed.forEach((c) => { after[c.severity] = (after[c.severity] || 0) + 1; });
console.log(`${confirmed.length} issues | ${changes.length} severity changes${dry ? ' (dry-run)' : ''}`);
changes.forEach((c) => console.log(`   ${c.from} -> ${c.to}   ${c.id}  [${c.campaign}]  ${c.why}`));
console.log('\nseverity distribution after:', JSON.stringify(after));
if (!dry && changes.length) {
  fs.writeFileSync(file.replace(/\.json$/, '.presev.bak.json'), JSON.stringify(JSON.parse(fs.readFileSync(file, 'utf8')), null, 2));
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  console.log(`\nwritten (backup: ${file.replace(/\.json$/, '.presev.bak.json')})`);
}
