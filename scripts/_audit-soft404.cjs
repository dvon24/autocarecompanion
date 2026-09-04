/**
 * Classify the GSC "soft 404" URL list against the live DB so we know which
 * bucket each URL is in before changing any render code.
 *
 * Usage: node scripts/_audit-soft404.cjs <urls.txt>
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const slugOf = (make, model) =>
  `${make} ${model}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function main() {
  const lines = fs
    .readFileSync(process.argv[2], 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Preload the published article slug set once.
  const distinct = await prisma.knownIssue.findMany({
    where: { status: 'published', vehicleType: 'car' },
    distinct: ['make', 'model'],
    select: { make: true, model: true },
  });
  const articleSlugs = new Set(distinct.map((d) => slugOf(d.make, d.model)));

  const out = [];
  for (const line of lines) {
    if (line.startsWith('dtc/')) {
      const parts = line.slice(4).split('/');
      const rawCode = decodeURIComponent(parts[0]);
      const code = rawCode.toUpperCase();
      const makeSlug = parts[1] || null;

      const dtc = await prisma.dTCCode.findUnique({
        where: { code },
        select: { code: true, name: true, description: true, commonCauses: true },
      });
      if (!dtc) {
        out.push({ url: line, bucket: 'CODE_NOT_IN_LIBRARY', issues: 0 });
        continue;
      }

      const where = { dtcCodes: { has: code }, status: 'published' };
      if (makeSlug) {
        // route uses slugToMake; approximate by matching the slugified make
        const makes = await prisma.knownIssue.findMany({
          where: { dtcCodes: { has: code }, status: 'published' },
          distinct: ['make'],
          select: { make: true },
        });
        const match = makes.find(
          (m) => m.make.toLowerCase().replace(/[^a-z0-9]+/g, '-') === makeSlug,
        );
        if (!match) {
          out.push({ url: line, bucket: 'MAKE_HAS_NO_ISSUES', issues: 0 });
          continue;
        }
        where.make = { equals: match.make, mode: 'insensitive' };
      }

      const rows = await prisma.knownIssue.findMany({
        where,
        select: { id: true, make: true, model: true, description: true, solution: true },
      });
      const descLen = rows.reduce((n, r) => n + (r.description || '').length, 0);
      out.push({
        url: line,
        bucket: rows.length === 0 ? 'ZERO_ISSUES' : rows.length === 1 ? 'ONE_ISSUE' : 'MULTI',
        issues: rows.length,
        descChars: descLen,
        refChars:
          (dtc.description || '').length + (dtc.commonCauses || []).join(' ').length,
      });
    } else if (line.startsWith('category/')) {
      const cat = line.slice(9);
      const n = await prisma.knownIssue.count({
        where: { status: 'published', vehicleType: 'car', category: cat },
      });
      out.push({ url: line, bucket: n === 0 ? 'CATEGORY_EMPTY' : 'CATEGORY_OK', issues: n });
    } else {
      out.push({
        url: line,
        bucket: articleSlugs.has(line) ? 'ARTICLE_EXISTS' : 'ARTICLE_SLUG_UNKNOWN',
        issues: 0,
      });
    }
  }

  const byBucket = {};
  for (const r of out) (byBucket[r.bucket] ||= []).push(r);
  console.log('=== BUCKET COUNTS ===');
  for (const [k, v] of Object.entries(byBucket).sort((a, b) => b[1].length - a[1].length)) {
    console.log(String(v.length).padStart(4), k);
  }
  fs.writeFileSync(
    process.argv[3] || '.tmp-soft404-audit.json',
    JSON.stringify(byBucket, null, 2),
  );
  console.log('\nwrote', process.argv[3] || '.tmp-soft404-audit.json');

  // Thin-content signal for the pages that DO render.
  const renders = out.filter((r) => r.bucket === 'ONE_ISSUE' || r.bucket === 'MULTI');
  if (renders.length) {
    const avgDesc = Math.round(
      renders.reduce((n, r) => n + (r.descChars || 0), 0) / renders.length,
    );
    const avgRef = Math.round(
      renders.reduce((n, r) => n + (r.refChars || 0), 0) / renders.length,
    );
    console.log(
      `\nrendering pages: ${renders.length} | avg issue-desc chars ${avgDesc} | avg DTC-reference chars ${avgRef}`,
    );
  }
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
