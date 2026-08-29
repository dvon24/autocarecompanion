// A harvest pass that ends early (throttle, kill, crash) leaves some lead
// vehicles with no row at all. A missing row is worse than a bad one: it drops
// the vehicle out of the report entirely, so nobody can see it was never
// checked. Fill every gap with an explicit status:"unknown" row.
//
//   node scripts/_lead-recall-fill-missing.js
const fs = require('fs');

const OUT = 'data/_lead-recall-gaps.json';
const rows = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const coverage = JSON.parse(fs.readFileSync('data/_lead-coverage.json', 'utf8'));

const have = new Set(rows.map((r) => r.vehicle));
const added = [];
for (const c of coverage) {
  if (have.has(c.vehicle)) continue;
  rows.push({
    vehicle: c.vehicle, leads: c.leads, make: null, model: null,
    status: 'unknown', resolvedModels: [], variantsTruncated: false, totalVariants: 0,
    published: c.pub, recalls: 0, uncovered: 0, fetchFailures: null, uncoveredList: [],
  });
  added.push(c.vehicle);
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 2));
console.log('filled ' + added.length + ' missing vehicles as unknown: ' + (added.join(', ') || '(none)'));
console.log('rows now: ' + rows.length + ' of ' + coverage.length);
