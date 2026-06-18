require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const TARGETS = [
  ['Volkswagen','Gol'],['Volkswagen','Polo'],['Volkswagen','T-Cross'],['Volkswagen','Saveiro'],
  ['Fiat','Uno'],['Fiat','Palio'],['Fiat','Strada'],['Fiat','Toro'],['Fiat','Argo'],['Fiat','Mobi'],
  ['Chevrolet','Onix'],['Chevrolet','Celta'],['Chevrolet','S10'],['Chevrolet','Tracker'],
  ['Ford','Ka'],['Ford','EcoSport'],['Ford','Fiesta'],
  ['Renault','Sandero'],['Renault','Kwid'],['Renault','Duster'],['Dacia','Duster'],
  ['Hyundai','HB20'],['Toyota','Etios'],['Honda','Fit'],['Honda','City'],
  ['Opel','Corsa'],['Opel','Astra'],['Opel','Insignia'],
  ['Hyundai','Grandeur'],['Kia','Morning'],['Hyundai','Casper'],['Kia','Ray'],
  ['Hyundai','Elantra'],['Hyundai','Sonata'],['Kia','Sorento'],['Kia','Sportage'],
  ['Saab','9-3'],['Saab','9-5'],['Oldsmobile','Alero'],['Oldsmobile','Cutlass'],
];
(async () => {
  for (const [make, model] of TARGETS) {
    const n = await prisma.knownIssue.count({
      where: { make: { equals: make, mode: 'insensitive' }, model: { equals: model, mode: 'insensitive' }, status: 'published' },
    });
    console.log(`${make} ${model}: ${n}`);
  }
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
