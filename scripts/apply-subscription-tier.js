#!/usr/bin/env node
/**
 * Adds the User.subscriptionTier column and backfills existing active
 * subscribers to 'plus'. Idempotent — uses IF NOT EXISTS and only
 * backfills rows where subscriptionTier IS NULL.
 *
 * Why direct SQL instead of `prisma migrate`: production has drift
 * against the local migration history (same reason Phase 2's
 * onboardingCompletedAt was applied this way). Direct DDL is the
 * safe path.
 *
 * Usage:  node scripts/apply-subscription-tier.js
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
import pg from 'pg';

const { Pool } = pg;

const url = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('No POSTGRES_PRISMA_URL or DATABASE_URL set.');
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });
pool.on('error', () => {});

async function main() {
  await pool.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT;`);
  console.log('Column ensured: User.subscriptionTier');

  const before = await pool.query(`SELECT COUNT(*)::int AS n FROM "User" WHERE "subscriptionTier" IS NULL AND "subscriptionStatus" = 'active';`);
  const toBackfill = before.rows[0].n;
  console.log(`Active users with no tier set: ${toBackfill}`);

  if (toBackfill > 0) {
    const r = await pool.query(`UPDATE "User" SET "subscriptionTier" = 'plus' WHERE "subscriptionTier" IS NULL AND "subscriptionStatus" = 'active';`);
    console.log(`Backfilled ${r.rowCount} active users to tier=plus`);
  } else {
    console.log('Nothing to backfill.');
  }

  const summary = await pool.query(`SELECT "subscriptionStatus", "subscriptionTier", COUNT(*)::int AS n FROM "User" GROUP BY 1, 2 ORDER BY 1 NULLS FIRST, 2 NULLS FIRST;`);
  console.log('\nFinal distribution:');
  for (const row of summary.rows) {
    console.log(`  status=${row.subscriptionStatus ?? 'null'}  tier=${row.subscriptionTier ?? 'null'}  count=${row.n}`);
  }
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
