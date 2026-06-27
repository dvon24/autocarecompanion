require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client'); const { PrismaPg } = require('@prisma/adapter-pg'); const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 }); pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const leads = await prisma.interestEmail.findMany({ where: { unsubscribedAt: null, context: { startsWith: 'known-issues:' } }, select: { context: true } });
  const subjects = [...new Set(leads.map((l) => String(l.context || '').slice('known-issues:'.length).trim()))];
  const pairs = await prisma.knownIssue.findMany({ where: { status: 'published' }, distinct: ['make', 'model'], select: { make: true, model: true } });
  const pairBySubject = new Map(); for (const p of pairs) pairBySubject.set((p.make + ' ' + p.model).toLowerCase().trim(), p);
  const out = [];
  for (const subj of subjects) {
    const pair = pairBySubject.get(subj.toLowerCase());
    if (!pair) { console.log('  ! no DB match: "' + subj + '" (model not in DB — skip)'); continue; }
    const rows = await prisma.knownIssue.findMany({ where: { status: 'published', make: pair.make, model: pair.model }, select: { title: true } });
    out.push({ make: pair.make, model: pair.model, existing: rows.map((r) => r.title) });
    console.log('  ' + pair.make + ' ' + pair.model + ': ' + rows.length + ' existing');
  }
  fs.writeFileSync('data/_lead-deepen-queue.json', JSON.stringify(out, null, 0));
  console.log('Queued ' + out.length + ' unique lead vehicles for deepening.');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
