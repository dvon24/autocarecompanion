#!/usr/bin/env node
/** READ-ONLY coverage review: SELECT queries only. */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // distinct make+model with published counts
  const byModel = await prisma.knownIssue.groupBy({
    by: ['make', 'model'],
    where: { status: 'published' },
    _count: { id: true },
  });
  byModel.sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model));
  console.log('=== MAKE+MODEL published counts ===');
  byModel.forEach((r) => console.log(`${r.make}|${r.model}|${r._count.id}`));

  // per-make totals
  const byMake = await prisma.knownIssue.groupBy({
    by: ['make'],
    where: { status: 'published' },
    _count: { id: true },
  });
  byMake.sort((a, b) => b._count.id - a._count.id);
  console.log('\n=== PER-MAKE totals (published) ===');
  byMake.forEach((r) => console.log(`${r.make}|${r._count.id}`));

  // DTC count + specific high-volume code presence
  const dtcCount = await prisma.dTCCode.count();
  console.log(`\n=== DTCCode total rows: ${dtcCount} ===`);
  const probe = ['P0420','P0430','P0171','P0174','P0300','P0301','P0302','P0303','P0304','P0305','P0306','P0455','P0442','P0440','P0441','P0446','P0128','P0301','P0011','P0016','P0101','P0102','P0113','P0131','P0135','P0141','P0172','P0299','P0325','P0335','P0340','P0401','P0411','P0456','P0457','P0500','P0506','P0507','P0562','P0700','P0705','P0715','P0730','P0740','P0741','P0750','P1450','U0100','U0101','U0073','U0121','U0140','U1000','C0035','C0040','C0561','C1201','C1241','B0081','B1000','B1342','B1318'];
  const found = await prisma.dTCCode.findMany({
    where: { code: { in: probe } },
    select: { code: true },
  });
  const foundSet = new Set(found.map((f) => f.code));
  console.log('PRESENT: ' + probe.filter((c) => foundSet.has(c)).join(','));
  console.log('MISSING: ' + probe.filter((c) => !foundSet.has(c)).join(','));

  // prefix distribution of DTC codes
  const all = await prisma.dTCCode.findMany({ select: { code: true } });
  const prefixes = {};
  all.forEach((r) => { const p = r.code[0]; prefixes[p] = (prefixes[p] || 0) + 1; });
  console.log('\n=== DTC prefix distribution ===');
  Object.entries(prefixes).forEach(([k, v]) => console.log(`${k}: ${v}`));

  console.log('\n=== ALL DTC CODES ===');
  console.log(all.map((r) => r.code).sort().join(','));

  // Codes actually used by published issues (page generation = intersection with DTCCode rows)
  const issueRows = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { dtcCodes: true },
  });
  const used = new Set();
  issueRows.forEach((r) => (r.dtcCodes || []).forEach((c) => used.add(c.toUpperCase())));
  const refSet = new Set(all.map((r) => r.code.toUpperCase()));
  const pages = [...used].filter((c) => refSet.has(c)).sort();
  console.log(`\n=== CODES IN PUBLISHED ISSUES: ${used.size}; WITH REFERENCE ROW (= static pages): ${pages.length} ===`);
  console.log('PAGES: ' + pages.join(','));
  const refOnly = [...refSet].filter((c) => !used.has(c)).sort();
  console.log(`\n=== REFERENCE ROWS WITH NO PUBLISHED ISSUE (no static page/sitemap entry): ${refOnly.length} ===`);
  console.log(refOnly.join(','));

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.message); process.exit(1); });
