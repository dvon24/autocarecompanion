require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const TARGETS = [
  { make: 'Ford', model: 'F-150' },
  { make: 'Chevrolet', model: 'Silverado 1500' },
  { make: 'Jeep', model: 'Grand Cherokee' },
  { make: 'Toyota', model: 'Camry' },
];
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 }); pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const out = [];
  for (const t of TARGETS) {
    const rows = await prisma.knownIssue.findMany({ where: { status: 'published', make: { equals: t.make, mode: 'insensitive' }, model: { equals: t.model, mode: 'insensitive' } }, select: { title: true } });
    out.push({ make: t.make, model: t.model, existing: rows.map((r) => r.title) });
    console.log(t.make + ' ' + t.model + ': ' + rows.length + ' existing issues');
  }
  fs.writeFileSync('data/_deepen-targets.json', JSON.stringify(out, null, 0));
  console.log('Wrote data/_deepen-targets.json');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
