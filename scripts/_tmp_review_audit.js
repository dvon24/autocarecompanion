#!/usr/bin/env node
/**
 * TEMP read-only integrity audit of KnownIssue / DTCCode tables.
 * SELECT-ONLY: uses prisma.findMany / groupBy / count exclusively. No writes.
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low'];
const VALID_CATEGORIES = [
  'engine', 'transmission', 'drivetrain', 'electrical', 'brakes', 'suspension',
  'cooling', 'fuel', 'interior', 'exterior', 'body', 'safety', 'exhaust',
  'steering', 'hvac', 'emissions', 'other',
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // ---- 1. Row counts by status and source ----
  const byStatus = await prisma.knownIssue.groupBy({ by: ['status'], _count: { _all: true } });
  const bySource = await prisma.knownIssue.groupBy({ by: ['source'], _count: { _all: true } });
  console.log('=== 1. ROW COUNTS ===');
  console.log('By status:', JSON.stringify(byStatus.map(r => ({ status: r.status, n: r._count._all }))));
  console.log('By source:', JSON.stringify(bySource.map(r => ({ source: r.source, n: r._count._all }))));

  // ---- Fetch all published rows once ----
  const pub = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: {
      id: true, make: true, model: true, title: true, severity: true, category: true,
      years: true, citations: true, symptoms: true,
      estimatedCostLow: true, estimatedCostHigh: true, dtcCodes: true, source: true,
    },
  });
  console.log(`\nPublished rows fetched: ${pub.length}`);

  // ---- 2. Field validity on published rows ----
  const badSeverity = pub.filter(r => !VALID_SEVERITIES.includes(r.severity));
  const sevValues = {};
  for (const r of pub) sevValues[r.severity] = (sevValues[r.severity] || 0) + 1;

  const badCategory = pub.filter(r => !VALID_CATEGORIES.includes(r.category));
  const badCatValues = {};
  for (const r of badCategory) badCatValues[r.category] = (badCatValues[r.category] || 0) + 1;

  const emptyCitations = pub.filter(r => !Array.isArray(r.citations) || r.citations.length === 0);
  const emptyYears = pub.filter(r => !Array.isArray(r.years) || r.years.length === 0);
  const badYears = pub.filter(r => Array.isArray(r.years) && r.years.some(y => y < 1980 || y > 2027));
  const costInverted = pub.filter(r =>
    r.estimatedCostLow != null && r.estimatedCostHigh != null && r.estimatedCostLow > r.estimatedCostHigh);
  const emptySymptoms = pub.filter(r => !Array.isArray(r.symptoms) || r.symptoms.length === 0);

  console.log('\n=== 2. PUBLISHED FIELD VALIDITY ===');
  console.log('Severity value distribution:', JSON.stringify(sevValues));
  console.log(`Invalid severity (not ${VALID_SEVERITIES.join('/')}): ${badSeverity.length}`);
  badSeverity.slice(0, 10).forEach(r => console.log(`  - [${r.severity}] ${r.id}`));
  console.log(`Invalid category (not in 17-value enum): ${badCategory.length}`);
  console.log('  Invalid category values:', JSON.stringify(badCatValues));
  badCategory.slice(0, 10).forEach(r => console.log(`  - [${r.category}] ${r.id}`));
  console.log(`Empty/null citations array: ${emptyCitations.length}`);
  emptyCitations.slice(0, 10).forEach(r => console.log(`  - ${r.id} (source=${r.source})`));
  const ecBySource = {};
  for (const r of emptyCitations) ecBySource[r.source] = (ecBySource[r.source] || 0) + 1;
  console.log('  Empty-citations by source:', JSON.stringify(ecBySource));
  console.log(`Empty years: ${emptyYears.length}`);
  emptyYears.slice(0, 10).forEach(r => console.log(`  - ${r.id}`));
  console.log(`Years outside 1980-2027: ${badYears.length}`);
  badYears.slice(0, 10).forEach(r => console.log(`  - ${r.id} years=${JSON.stringify(r.years.filter(y => y < 1980 || y > 2027))}`));
  console.log(`costLow > costHigh: ${costInverted.length}`);
  costInverted.slice(0, 10).forEach(r => console.log(`  - ${r.id} low=${r.estimatedCostLow} high=${r.estimatedCostHigh}`));
  console.log(`Empty symptoms: ${emptySymptoms.length}`);
  emptySymptoms.slice(0, 10).forEach(r => console.log(`  - ${r.id}`));

  // ---- 3. Orphan dtcCodes (referenced by published issues, no DTCCode row) ----
  const referenced = new Set();
  for (const r of pub) for (const c of (r.dtcCodes || [])) referenced.add(c);
  const dtcRows = await prisma.dTCCode.findMany({ select: { code: true } });
  const dtcSet = new Set(dtcRows.map(d => d.code));
  const orphans = [...referenced].filter(c => !dtcSet.has(c)).sort();
  // count how many published issues reference an orphan
  const issuesWithOrphan = pub.filter(r => (r.dtcCodes || []).some(c => !dtcSet.has(c)));
  console.log('\n=== 3. ORPHAN DTC CODES ===');
  console.log(`Distinct dtcCodes referenced by published issues: ${referenced.size}`);
  console.log(`Orphan codes (no DTCCode row): ${orphans.length}`);
  console.log(`Published issues referencing >=1 orphan code: ${issuesWithOrphan.length}`);
  console.log('Orphan list (up to 30):', JSON.stringify(orphans.slice(0, 30)));

  // ---- 4. Near-duplicate published issues (same make+model+lower(title)) ----
  const dupMap = new Map();
  for (const r of pub) {
    const key = `${r.make}|${r.model}|${r.title.toLowerCase().trim()}`;
    if (!dupMap.has(key)) dupMap.set(key, []);
    dupMap.get(key).push(r.id);
  }
  const dupGroups = [...dupMap.entries()].filter(([, ids]) => ids.length > 1);
  const dupExtraRows = dupGroups.reduce((s, [, ids]) => s + ids.length - 1, 0);
  console.log('\n=== 4. NEAR-DUPLICATES (make+model+lower(title)) ===');
  console.log(`Duplicate groups: ${dupGroups.length} (redundant rows: ${dupExtraRows})`);
  dupGroups.slice(0, 10).forEach(([key, ids]) => console.log(`  - ${key}  -> ${ids.join(', ')}`));

  // ---- 5. Citation health (published rows) ----
  const domainCounts = {};
  let totalCitations = 0, nonHttp = 0, carcomplaints = 0, noUrl = 0;
  for (const r of pub) {
    if (!Array.isArray(r.citations)) continue;
    for (const c of r.citations) {
      totalCitations++;
      const url = c && typeof c === 'object' ? c.url : null;
      if (!url || typeof url !== 'string') { noUrl++; continue; }
      if (!/^http/i.test(url)) { nonHttp++; continue; }
      try {
        const host = new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
        domainCounts[host] = (domainCounts[host] || 0) + 1;
        if (host.endsWith('carcomplaints.com')) carcomplaints++;
      } catch { nonHttp++; }
    }
  }
  const topDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);
  console.log('\n=== 5. CITATION HEALTH (published) ===');
  console.log(`Total citation entries: ${totalCitations}`);
  console.log(`Citations with missing/absent url field: ${noUrl}`);
  console.log(`Citations whose URL does not start with http (or unparseable): ${nonHttp}`);
  console.log(`Citations pointing at carcomplaints.com: ${carcomplaints}`);
  console.log('Top 20 domains:');
  topDomains.forEach(([d, n]) => console.log(`  ${String(n).padStart(5)}  ${d}`));

  // ---- 6. Models with <3 published issues ----
  const modelCounts = new Map();
  for (const r of pub) {
    const key = `${r.make} ${r.model}`;
    modelCounts.set(key, (modelCounts.get(key) || 0) + 1);
  }
  const thin = [...modelCounts.entries()].filter(([, n]) => n < 3).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  console.log('\n=== 6. THIN MODELS (<3 published issues) ===');
  console.log(`Total make+model combos: ${modelCounts.size}; thin (<3): ${thin.length}`);
  thin.slice(0, 40).forEach(([k, n]) => console.log(`  - ${k} (${n})`));

  // ---- 7. DTCCode table health ----
  const allDtc = await prisma.dTCCode.findMany({ select: { code: true, description: true } });
  const shortDesc = allDtc.filter(d => !d.description || d.description.trim().length < 100);
  console.log('\n=== 7. DTCCODE TABLE ===');
  console.log(`Total DTCCode rows: ${allDtc.length}`);
  console.log(`Rows with empty/short (<100 chars) description: ${shortDesc.length}`);
  shortDesc.slice(0, 20).forEach(d => console.log(`  - ${d.code} (len=${(d.description || '').trim().length})`));

  // ---- 8. Blast radius detail ----
  const badCatModels = {};
  for (const r of badCategory) {
    const k = `${r.make} ${r.model}`;
    badCatModels[k] = (badCatModels[k] || 0) + 1;
  }
  const critModels = new Set();
  for (const r of pub) if (r.severity === 'critical') critModels.add(`${r.make} ${r.model}`);
  console.log('\n=== 8. BLAST RADIUS ===');
  console.log(`Models with >=1 invalid-category published issue (${Object.keys(badCatModels).length}):`, JSON.stringify(badCatModels));
  console.log(`Models with >=1 'critical'-severity published issue: ${critModels.size}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.stack || err.message); process.exit(1); });
