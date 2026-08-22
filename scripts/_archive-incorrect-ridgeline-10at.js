#!/usr/bin/env node
// Archive one known-bad published row before the corrected 9AT replacement is
// inserted. Dry-run by default; --apply uses exact identity/status predicates.
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');
const expected = {
  id: 'honda-ridgeline-10speed-transmission-2020',
  make: 'Honda',
  model: 'Ridgeline',
  title: '10-Speed Transmission - Rough Shifting and Programming Defect',
  status: 'published',
};

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const row = await prisma.knownIssue.findUnique({
    where: { id: expected.id },
    select: { id: true, make: true, model: true, title: true, status: true, years: true },
  });
  if (!row) throw new Error(`Expected row not found: ${expected.id}`);
  for (const field of ['id', 'make', 'model', 'title', 'status']) {
    if (row[field] !== expected[field]) {
      throw new Error(`Identity/status mismatch for ${field}: expected ${expected[field]}, found ${row[field]}`);
    }
  }
  console.log(`${APPLY ? 'ARCHIVE' : 'DRY RUN — would archive'}: ${row.id}`);
  console.log(`  ${row.make} ${row.model} ${JSON.stringify(row.years)} — ${row.title}`);
  if (APPLY) {
    const result = await prisma.knownIssue.updateMany({
      where: expected,
      data: { status: 'archived', updatedAt: new Date() },
    });
    if (result.count !== 1) throw new Error(`Expected to archive exactly 1 row; archived ${result.count}`);
    console.log('  archived exactly 1 published row');
  }
  await prisma.$disconnect();
  await pool.end();
})().catch((error) => {
  console.error('FAIL:', error.message);
  process.exitCode = 1;
});
