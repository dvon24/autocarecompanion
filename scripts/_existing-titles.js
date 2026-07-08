require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const TARGETS = [
  ['Kia','Soul'],['Kia','Forte'],['Kia','Stinger'],['Nissan','Juke'],['Nissan','GT-R'],
  ['Toyota','FJ Cruiser'],['Toyota','C-HR'],['Mazda','RX-8'],['Jeep','Renegade'],
  ['Chevrolet','Sonic'],['Chevrolet','Volt'],['Hyundai','Accent'],['Ford','F-150 Lightning'],['GMC','Terrain'],
];
(async () => {
  const out = {};
  for (const [make, model] of TARGETS) {
    const rows = await prisma.knownIssue.findMany({
      where: { make: { equals: make, mode: 'insensitive' }, model: { equals: model, mode: 'insensitive' } },
      select: { title: true }, orderBy: { reportCount: 'desc' },
    });
    out[`${make}|${model}`] = rows.map(r => r.title);
  }
  console.log(JSON.stringify(out));
  await prisma.$disconnect(); await pool.end();
})();
