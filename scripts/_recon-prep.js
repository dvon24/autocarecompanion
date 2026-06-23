require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // 1) Challenger differential whine issue(s)
  const ch = await prisma.knownIssue.findMany({
    where: { status: 'published', make: { equals: 'Dodge', mode: 'insensitive' }, model: { equals: 'Challenger', mode: 'insensitive' },
      OR: [ { title: { contains: 'differential', mode: 'insensitive' } }, { title: { contains: 'whine', mode: 'insensitive' } }, { title: { contains: 'axle', mode: 'insensitive' } } ] },
    select: { id: true, title: true, fixParts: true, solution: true },
  });
  console.log('=== Challenger diff/whine/axle issues: ' + ch.length + ' ===');
  for (const i of ch) {
    const pns = (Array.isArray(i.fixParts) ? i.fixParts : []).map(p => p.oemPartNumber).filter(Boolean);
    const has68 = JSON.stringify(i.fixParts || []).includes('68156617');
    console.log('- ' + i.id + '\n    title: ' + i.title + '\n    fixPart PNs: ' + (pns.join(', ') || '(none)') + '\n    cites 68156617 in solution: ' + (String(i.solution||'').includes('68156617')) + ' | in fixParts: ' + has68);
  }

  // 2) Export ALL Dodge issues for reconciliation
  const dodge = await prisma.knownIssue.findMany({
    where: { status: 'published', make: { equals: 'Dodge', mode: 'insensitive' } },
    select: { id: true, make: true, model: true, title: true, description: true, solution: true, fixParts: true },
  });
  fs.writeFileSync('data/_recon-dodge.json', JSON.stringify(dodge, null, 0));
  console.log('\nExported ' + dodge.length + ' Dodge issues -> data/_recon-dodge.json');

  // 3) Export recent Toyota fixParts for blind re-audit
  const toy = await prisma.knownIssue.findMany({
    where: { status: 'published', make: { equals: 'Toyota', mode: 'insensitive' } },
    select: { id: true, make: true, model: true, title: true, fixParts: true },
    orderBy: { createdAt: 'desc' }, take: 80,
  });
  const toyParts = toy.filter(i => Array.isArray(i.fixParts) && i.fixParts.some(p => p && p.oemPartNumber));
  fs.writeFileSync('data/_reaudit-toyota.json', JSON.stringify(toyParts, null, 0));
  let pcount = 0; for (const i of toyParts) pcount += i.fixParts.filter(p=>p&&p.oemPartNumber).length;
  console.log('Exported ' + toyParts.length + ' recent Toyota issues w/ ' + pcount + ' PNs -> data/_reaudit-toyota.json');

  await prisma.$disconnect(); await pool.end();
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
