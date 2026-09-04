/**
 * Mirror getRelatedDTCCodes() for every DTC page that actually renders, and
 * count how many of the "Related Codes" links point at a code with no
 * published issue — i.e. a URL the route 404s on.
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const issueRows = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { dtcCodes: true },
  });
  const codesInIssues = new Set();
  for (const r of issueRows) for (const c of r.dtcCodes) codesInIssues.add(c.toUpperCase());

  const all = await prisma.dTCCode.findMany({ select: { code: true, system: true } });
  const live = all.filter((d) => codesInIssues.has(d.code)); // pages that render

  const bySystem = new Map();
  for (const d of all) {
    if (!bySystem.has(d.system)) bySystem.set(d.system, []);
    bySystem.get(d.system).push(d);
  }

  let totalLinks = 0;
  let deadLinks = 0;
  const deadTargets = new Set();
  const pagesWithDead = new Set();

  for (const cur of live) {
    const prefix = cur.code.slice(0, 4);
    const sameSeries = all.filter((d) => d.code.startsWith(prefix) && d.code !== cur.code).slice(0, 4);
    const sameSystem = (bySystem.get(cur.system) || [])
      .filter((d) => d.code !== cur.code && !d.code.startsWith(prefix))
      .slice(0, 8 - sameSeries.length);

    const seen = new Set([cur.code]);
    for (const item of [...sameSeries, ...sameSystem]) {
      if (seen.has(item.code)) continue;
      seen.add(item.code);
      totalLinks++;
      if (!codesInIssues.has(item.code)) {
        deadLinks++;
        deadTargets.add(item.code);
        pagesWithDead.add(cur.code);
      }
    }
  }

  console.log(`DTC library codes:            ${all.length}`);
  console.log(`Codes with a rendering page:  ${live.length}`);
  console.log(`"Related Codes" links total:  ${totalLinks}`);
  console.log(
    `  -> DEAD (target 404s):      ${deadLinks}  (${((deadLinks / totalLinks) * 100).toFixed(1)}%)`,
  );
  console.log(`  -> distinct dead targets:   ${deadTargets.size}`);
  console.log(
    `  -> pages emitting >=1 dead: ${pagesWithDead.size} of ${live.length} (${((pagesWithDead.size / live.length) * 100).toFixed(1)}%)`,
  );

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
