/**
 * Measure how much unique, non-boilerplate content each rendering DTC page
 * actually has, so the thin-page decision (enrich vs noindex) rests on
 * numbers rather than impression.
 *
 * "Unique" = the vehicle-issue text. The DTC reference block (name,
 * description, commonCauses) is the same prose on every page that shares the
 * code, and is what makes these look like the 1,000 other DTC sites.
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const words = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;

async function main() {
  const issues = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: {
      dtcCodes: true,
      title: true,
      description: true,
      solution: true,
      symptoms: true,
      make: true,
      model: true,
    },
  });

  const byCode = new Map();
  for (const i of issues) {
    for (const c of i.dtcCodes) {
      const k = c.toUpperCase();
      if (!byCode.has(k)) byCode.set(k, []);
      byCode.get(k).push(i);
    }
  }

  const lib = await prisma.dTCCode.findMany({
    select: { code: true, name: true, description: true, commonCauses: true },
  });

  const rows = [];
  for (const d of lib) {
    const linked = byCode.get(d.code);
    if (!linked || linked.length === 0) continue; // 404s, not our problem here
    const unique = linked.reduce(
      (n, i) =>
        n +
        words(i.title) +
        words(i.description) +
        words(i.solution) +
        words((i.symptoms || []).join(' ')),
      0,
    );
    const boiler =
      words(d.name) + words(d.description) + words((d.commonCauses || []).join(' '));
    rows.push({
      code: d.code,
      issues: linked.length,
      vehicles: new Set(linked.map((i) => `${i.make}|${i.model}`)).size,
      unique,
      boiler,
    });
  }

  rows.sort((a, b) => a.unique - b.unique);
  const bucket = (n) => rows.filter(n).length;
  console.log(`Rendering DTC pages: ${rows.length}\n`);
  console.log('unique (vehicle-specific) word count distribution:');
  for (const [lo, hi] of [[0, 100], [100, 200], [200, 400], [400, 800], [800, 1e9]]) {
    const c = bucket((r) => r.unique >= lo && r.unique < hi);
    console.log(
      `  ${String(lo).padStart(4)}-${hi === 1e9 ? '   +' : String(hi).padStart(4)} words: ${String(c).padStart(4)}  ${'#'.repeat(Math.round((c / rows.length) * 60))}`,
    );
  }
  const oneIssue = rows.filter((r) => r.issues === 1);
  console.log(`\npages backed by exactly 1 issue: ${oneIssue.length}`);
  console.log(
    `  their median unique words: ${oneIssue.length ? oneIssue[Math.floor(oneIssue.length / 2)].unique : 0}`,
  );
  console.log(
    `pages where boilerplate >= unique content: ${bucket((r) => r.boiler >= r.unique)}`,
  );
  console.log('\nthinnest 15:');
  for (const r of rows.slice(0, 15)) {
    console.log(
      `  ${r.code.padEnd(8)} issues=${r.issues} vehicles=${r.vehicles} unique=${String(r.unique).padStart(4)}w boilerplate=${String(r.boiler).padStart(4)}w`,
    );
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
