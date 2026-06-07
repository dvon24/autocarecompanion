#!/usr/bin/env node
/**
 * Finds users whose `subscriptionStatus` says they're paying but who
 * have no `subscriptionId` on file — i.e. the row says "active" but
 * no Stripe subscription is actually attached. This usually happens
 * after a manual sub deletion in Stripe + no webhook delivery, or
 * after a legacy backfill that promoted a stale row.
 *
 * For each orphan row, clears subscriptionStatus + subscriptionTier +
 * subscriptionId so the user is treated as Free everywhere. Keeps
 * stripeCustomerId in place so they can resubscribe without losing
 * their Stripe-side history.
 *
 * Usage:   node scripts/clear-orphan-subscriptions.js
 * Or to target one user explicitly:
 *          node scripts/clear-orphan-subscriptions.js --email=you@x.com
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

const targetEmail = process.argv.find((a) => a.startsWith('--email='))?.split('=')[1];

const pool = new Pool({ connectionString: url, max: 1 });
pool.on('error', () => {});

async function main() {
  let where, params;
  if (targetEmail) {
    where = `WHERE email = $1`;
    params = [targetEmail];
    console.log(`Targeting single user: ${targetEmail}`);
  } else {
    where = `WHERE "subscriptionStatus" IN ('active','trialing','past_due') AND "subscriptionId" IS NULL`;
    params = [];
    console.log('Targeting all rows with active status but no subscriptionId');
  }

  const before = await pool.query(
    `SELECT email, "subscriptionStatus", "subscriptionTier", "subscriptionId", "stripeCustomerId" FROM "User" ${where};`,
    params
  );
  console.log(`\nRows to clear: ${before.rows.length}`);
  for (const r of before.rows) {
    console.log(`  ${r.email}  status=${r.subscriptionStatus}  tier=${r.subscriptionTier}  subId=${r.subscriptionId ?? 'null'}  custId=${r.stripeCustomerId ?? 'null'}`);
  }

  if (before.rows.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  const upd = await pool.query(
    `UPDATE "User" SET "subscriptionStatus" = NULL, "subscriptionTier" = NULL, "subscriptionId" = NULL ${where} RETURNING email;`,
    params
  );
  console.log(`\nCleared ${upd.rowCount} row(s).`);
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
