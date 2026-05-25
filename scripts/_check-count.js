require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
prisma.knownIssue.count({ where: { status: 'published' } })
  .then(c => { console.log('Total published:', c); return prisma.$disconnect(); })
  .then(() => pool.end());
