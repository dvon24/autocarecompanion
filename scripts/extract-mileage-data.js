/**
 * Extract typical mileage ranges from known issue descriptions.
 *
 * Patterns matched:
 * - "60,000-100,000 miles"
 * - "between 80K and 120K miles"
 * - "around 50,000 miles"
 * - "after 100,000 miles"
 * - "under 30,000 miles"
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function parseMileage(str) {
  // Remove commas and normalize
  const clean = str.replace(/,/g, '');
  const num = parseInt(clean, 10);
  if (isNaN(num)) return null;
  // Handle "K" shorthand: "80K" = 80000
  if (/\d+k/i.test(str)) return num * 1000;
  return num;
}

function extractMileageRange(text) {
  // Pattern 1: explicit range "60,000-100,000 miles" or "60,000 to 100,000 miles"
  const rangePattern = /(\d{1,3}[,.]?\d{3})\s*[-–to]+\s*(\d{1,3}[,.]?\d{3})\s*(miles|mi\b)/gi;
  let match = rangePattern.exec(text);
  if (match) {
    const low = parseMileage(match[1]);
    const high = parseMileage(match[2]);
    if (low && high && low < high && low >= 1000 && high <= 500000) {
      // Filter out oil consumption rates like "1,500-3,000 miles" (too low for issue onset)
      if (low >= 5000) return { low, high };
    }
  }

  // Pattern 2: "between 80K and 120K miles"
  const betweenPattern = /between\s+(\d+)k?\s+and\s+(\d+)k?\s*(miles|mi\b)/gi;
  match = betweenPattern.exec(text);
  if (match) {
    let low = parseInt(match[1], 10);
    let high = parseInt(match[2], 10);
    if (low < 1000) low *= 1000;
    if (high < 1000) high *= 1000;
    if (low < high && low >= 5000 && high <= 500000) return { low, high };
  }

  // Pattern 3: "around/at/by 50,000 miles" → create ±20% range
  const aroundPattern = /(around|approximately|at|by|near|about)\s+(\d{1,3}[,.]?\d{3})\s*(miles|mi\b)/gi;
  match = aroundPattern.exec(text);
  if (match) {
    const mid = parseMileage(match[2]);
    if (mid && mid >= 10000 && mid <= 300000) {
      return { low: Math.round(mid * 0.8), high: Math.round(mid * 1.2) };
    }
  }

  // Pattern 4: "after 100,000 miles" → range from value to +50%
  const afterPattern = /(after|over|past|beyond|exceeding)\s+(\d{1,3}[,.]?\d{3})\s*(miles|mi\b)/gi;
  match = afterPattern.exec(text);
  if (match) {
    const start = parseMileage(match[2]);
    if (start && start >= 10000 && start <= 300000) {
      return { low: start, high: Math.round(start * 1.5) };
    }
  }

  // Pattern 5: "under/before 30,000 miles" → 0 to value
  const underPattern = /(under|before|within|less than)\s+(\d{1,3}[,.]?\d{3})\s*(miles|mi\b)/gi;
  match = underPattern.exec(text);
  if (match) {
    const end = parseMileage(match[2]);
    if (end && end >= 5000 && end <= 200000) {
      return { low: Math.round(end * 0.3), high: end };
    }
  }

  // Pattern 6: "XX,000-mile" as in "60,000-mile mark"
  const markPattern = /(\d{1,3}[,.]?\d{3})[-\s]mile/gi;
  match = markPattern.exec(text);
  if (match) {
    const mid = parseMileage(match[1]);
    if (mid && mid >= 10000 && mid <= 300000) {
      return { low: Math.round(mid * 0.8), high: Math.round(mid * 1.2) };
    }
  }

  return null;
}

async function main() {
  const issues = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { id: true, description: true, title: true, solution: true },
  });

  console.log(`Processing ${issues.length} issues...\n`);

  let extracted = 0;
  let skipped = 0;
  const updates = [];

  for (const issue of issues) {
    // Search description first, then solution, then title
    const text = `${issue.description} ${issue.solution} ${issue.title}`;
    const range = extractMileageRange(text);

    if (range) {
      extracted++;
      updates.push({ id: issue.id, low: range.low, high: range.high });
    } else {
      skipped++;
    }
  }

  console.log(`Extracted mileage data: ${extracted}`);
  console.log(`No mileage data found: ${skipped}`);
  console.log(`\nSample extractions:`);
  updates.slice(0, 15).forEach(u => {
    console.log(`  ${u.id}: ${u.low.toLocaleString()}-${u.high.toLocaleString()} miles`);
  });

  // Batch update
  console.log(`\nUpdating ${updates.length} issues...`);
  let updated = 0;
  for (const u of updates) {
    await prisma.knownIssue.update({
      where: { id: u.id },
      data: { typicalMileageLow: u.low, typicalMileageHigh: u.high },
    });
    updated++;
    if (updated % 100 === 0) process.stdout.write(`  ${updated}/${updates.length}\r`);
  }

  console.log(`\nDone! Updated ${updated} issues with mileage data.`);

  // Stats
  const byRange = {};
  for (const u of updates) {
    const bucket = `${Math.floor(u.low / 25000) * 25}K-${Math.ceil(u.high / 25000) * 25}K`;
    byRange[bucket] = (byRange[bucket] || 0) + 1;
  }
  console.log('\nMileage distribution:');
  Object.entries(byRange)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([range, count]) => console.log(`  ${range}: ${count} issues`));

  await prisma.$disconnect();
  pool.end();
}

main().catch(console.error);
