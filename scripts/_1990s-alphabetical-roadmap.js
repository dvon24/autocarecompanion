require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Realistic 1990s US/EU/global market makes that might NOT yet be in YMMT.
// If a make name is in this list and absent from YMMT, the campaign should
// add it (with appropriate 1990s YMMT entries) before researching issues.
const CANDIDATE_1990S_MAKES = [
  // Existing/likely existing
  'Acura', 'Alfa Romeo', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet',
  'Chrysler', 'Citroën', 'Dodge', 'Fiat', 'Ford', 'GMC', 'Honda', 'Hyundai',
  'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Mazda',
  'Mercedes-Benz', 'MINI', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot',
  'Porsche', 'RAM', 'Renault', 'SEAT', 'Subaru', 'Suzuki', 'Toyota',
  'Volkswagen', 'Volvo',
  // Defunct / niche / not-yet-added that EXISTED in 1990s
  'Daewoo', 'Daihatsu', 'Eagle', 'Geo', 'Hummer', 'Isuzu', 'Lincoln',
  'Mercury', 'Oldsmobile', 'Plymouth', 'Pontiac', 'Saab', 'Saturn',
  'Vauxhall', 'Yugo', 'Lancia', 'Skoda', 'Holden',
];

(async () => {
  const ymmt = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'ymmt.json'), 'utf8'));

  // Build per-make 1990s YMMT picture
  const makesWithYmmt = new Set();
  const ymmtByMakeYear = {}; // make -> year -> { models }
  for (let y = 1990; y <= 1999; y++) {
    if (!ymmt[y]) continue;
    for (const [make, models] of Object.entries(ymmt[y])) {
      makesWithYmmt.add(make);
      if (!ymmtByMakeYear[make]) ymmtByMakeYear[make] = {};
      ymmtByMakeYear[make][y] = Object.keys(models);
    }
  }

  // Per-make 1990s issue coverage from DB
  const allIssues = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { make: true, model: true, years: true },
  });
  const issuesByMakeYear = {}; // make -> year -> Set(model)
  const issuesByMake = {}; // make -> count of issues touching 90s
  for (const i of allIssues) {
    const yrsIn90s = (i.years || []).filter(y => y >= 1990 && y < 2000);
    if (yrsIn90s.length === 0) continue;
    if (!issuesByMake[i.make]) issuesByMake[i.make] = 0;
    issuesByMake[i.make]++;
    for (const y of yrsIn90s) {
      if (!issuesByMakeYear[i.make]) issuesByMakeYear[i.make] = {};
      if (!issuesByMakeYear[i.make][y]) issuesByMakeYear[i.make][y] = new Set();
      issuesByMakeYear[i.make][y].add(i.model);
    }
  }

  // Compute alphabetical roadmap
  const allMakes = new Set([...CANDIDATE_1990S_MAKES, ...makesWithYmmt]);
  const sorted = [...allMakes].sort((a, b) => a.localeCompare(b));

  console.log('=== 1990s ALPHABETICAL ROADMAP ===\n');
  console.log('Status | Make            | YMMT 90s models | Issues 90s | Gap rows | Action');
  console.log('-'.repeat(105));

  const actions = { ADD_MAKE: [], FILL_GAP: [], COMPLETE: [] };
  for (const make of sorted) {
    const inYmmt = makesWithYmmt.has(make);
    const ymmtRows = ymmtByMakeYear[make] || {};
    const ymmtTotal = Object.values(ymmtRows).reduce((s, models) => s + models.length, 0);
    const issueRows = issuesByMakeYear[make] || {};
    const issueTotal = Object.values(issueRows).reduce((s, set) => s + set.size, 0);
    const gapRows = ymmtTotal - issueTotal;
    const issueCount = issuesByMake[make] || 0;

    let status, action;
    if (!inYmmt) {
      status = '🔴 NEW ';
      action = 'ADD make to YMMT + research 1990s issues';
      actions.ADD_MAKE.push({ make });
    } else if (ymmtTotal === 0) {
      status = '⚪ N/A ';
      action = 'no 1990s presence (modern-only make)';
    } else if (gapRows === 0) {
      status = '✅ DONE';
      action = `fully covered (${issueCount} issues touching 90s)`;
      actions.COMPLETE.push({ make, issueCount });
    } else {
      status = '🟡 GAP ';
      action = `fill ${gapRows} missing model-year combo${gapRows === 1 ? '' : 's'}`;
      actions.FILL_GAP.push({ make, gapRows, ymmtTotal, issueCount });
    }
    console.log(`${status} | ${make.padEnd(15)} | ${String(ymmtTotal).padStart(3).padEnd(3)} models       | ${String(issueCount).padStart(3).padEnd(3)} issues  | ${String(gapRows).padStart(3).padEnd(3)}      | ${action}`);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Need to ADD make to YMMT: ${actions.ADD_MAKE.length}`);
  for (const a of actions.ADD_MAKE) console.log(`  - ${a.make}`);
  console.log(`Need to FILL 1990s gap:   ${actions.FILL_GAP.length}`);
  console.log(`Fully COVERED already:    ${actions.COMPLETE.length}`);

  console.log('\n=== FILL_GAP MAKES BY ALPHABETICAL ORDER (campaign sequence) ===');
  const fillSorted = actions.FILL_GAP.sort((a, b) => a.make.localeCompare(b.make));
  for (const a of fillSorted) {
    console.log(`  ${a.make.padEnd(15)} gap=${String(a.gapRows).padStart(3)}/${String(a.ymmtTotal).padStart(3)} | current=${a.issueCount} issues`);
  }

  await prisma.$disconnect();
  await pool.end();
})().catch(e => { console.error('FAIL:', e); process.exit(1); });
