#!/usr/bin/env node
/**
 * One-shot password reset — for when an owner forgets their password and
 * the proper email-based reset flow isn't an option (e.g. email provider
 * not configured yet, or you just want to get back in fast).
 *
 * Usage:
 *   node scripts/reset-password.js <email> <new-password>
 *
 * Examples:
 *   node scripts/reset-password.js devonsroberson24@yahoo.com Hunter2024!
 *
 * Notes:
 *   - Refuses passwords shorter than 8 characters.
 *   - Refuses if no User row matches the email.
 *   - Hashes with bcryptjs at cost 12 (matches src/lib/auth.ts).
 *   - Touches updatedAt so audit logs reflect the change.
 */

require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

async function main() {
  const [, , emailRaw, password] = process.argv;
  if (!emailRaw || !password) {
    console.error('Usage: node scripts/reset-password.js <email> <new-password>');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const email = emailRaw.toLowerCase().trim();
  const found = (await pool.query(
    `SELECT id, email FROM "User" WHERE LOWER(email) = $1 LIMIT 1`,
    [email],
  )).rows[0];

  if (!found) {
    console.error(`No user found with email "${email}".`);
    process.exit(2);
  }

  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2`,
    [hash, found.id],
  );

  console.log(`✓ Password reset for ${found.email} (id: ${found.id})`);
  console.log('  You can now sign in at /auth/signin');
  await pool.end();
}

main().catch(async (err) => {
  console.error('Fatal:', err);
  try { await pool.end(); } catch { /* ignore */ }
  process.exit(1);
});
