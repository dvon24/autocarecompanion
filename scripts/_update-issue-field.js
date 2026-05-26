#!/usr/bin/env node
/**
 * Dumb-pipe known-issue updater. Takes an issue ID and a JSON object
 * of fields to update. Used by the manual audit pass to correct
 * inaccuracies discovered during deep audit.
 *
 * EXPLICITLY ZERO AI CALLS — pure Prisma write.
 *
 * Usage:
 *   node scripts/_update-issue-field.js <id> '<json-fields-to-update>'
 *
 * Example:
 *   node scripts/_update-issue-field.js acura-foo '{"severity":"medium","years":[1998,1999]}'
 *
 * Updates updatedAt + reviewedOn automatically.
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const [, , id, fieldsJson] = process.argv;
  if (!id || !fieldsJson) {
    console.error('Usage: node scripts/_update-issue-field.js <id> \'<json>\'');
    process.exit(1);
  }
  let fields;
  try { fields = JSON.parse(fieldsJson); } catch (e) {
    console.error('Invalid JSON:', e.message); process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const existing = await prisma.knownIssue.findUnique({ where: { id } });
  if (!existing) {
    console.error(`No issue with id "${id}"`); process.exit(2);
  }

  fields.updatedAt = new Date();
  fields.reviewedOn = new Date().toISOString().slice(0, 10);

  await prisma.knownIssue.update({ where: { id }, data: fields });
  console.log(`✓ Updated ${id} — ${Object.keys(fields).filter(k => k !== 'updatedAt' && k !== 'reviewedOn').join(', ')}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
