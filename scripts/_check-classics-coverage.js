#!/usr/bin/env node
/* eslint-disable */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const TARGETS = [
  ['Toyota', 'MR2'], ['Mazda', 'RX-7'], ['Nissan', '300ZX'], ['Acura', 'NSX'],
  ['Nissan', '240SX'], ['Toyota', 'Celica'], ['Mitsubishi', '3000GT'],
  ['Dodge', 'Stealth'], ['Mitsubishi', 'Eclipse'], ['Nissan', 'Skyline'],
  ['Chevrolet', 'Corvette'],
];

(async () => {
  for (const [make, model] of TARGETS) {
    const rows = await prisma.knownIssue.findMany({
      where: { make: { equals: make, mode: 'insensitive' }, model: { equals: model, mode: 'insensitive' } },
      select: { title: true, years: true, status: true },
    });
    console.log(`\n${make} ${model}: ${rows.length} existing`);
    for (const r of rows) {
      const yr = r.years.length ? `${Math.min(...r.years)}-${Math.max(...r.years)}` : '?';
      console.log(`  [${r.status}] (${yr}) ${r.title}`);
    }
  }
  await prisma.$disconnect();
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
