#!/usr/bin/env node
/**
 * List KnownIssue rows that need citation backfill, prioritized for
 * the agent's processing order.
 *
 * Priority order:
 *   1. severity = 'critical' AND zero alive citations
 *   2. severity = 'high'     AND zero alive citations
 *   3. severity = 'critical' AND < 2 alive citations
 *   4. severity = 'high'     AND < 2 alive citations
 *   5. Everything else with < 2 alive citations
 *
 * Within each tier, popular makes come first (BMW, Ford, Toyota, Honda,
 * Chevrolet, Audi, Mercedes-Benz, Nissan, VW, Dodge — covers the bulk
 * of SERP traffic).
 *
 * Usage:
 *   node scripts/list-citation-needs.js --audit audit-citations-1779557973927.json
 *   node scripts/list-citation-needs.js --audit ... --limit 50
 *   node scripts/list-citation-needs.js --audit ... --json   # machine-readable
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const args = process.argv.slice(2);
function getArg(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}
const AUDIT = getArg('--audit');
const LIMIT = parseInt(getArg('--limit') || '0', 10);
const JSON_OUT = args.includes('--json');

if (!AUDIT) {
  console.error('Required: --audit <path-to-audit-citations-{ts}.json>');
  process.exit(1);
}

const POPULAR_MAKES = new Set([
  'BMW', 'Ford', 'Toyota', 'Honda', 'Chevrolet', 'Audi', 'Mercedes-Benz',
  'Nissan', 'Volkswagen', 'Dodge', 'Jeep', 'RAM', 'GMC', 'Subaru', 'Hyundai',
  'Kia', 'Tesla', 'Mazda',
]);

function tierFor(severity, alive) {
  if (alive === 0 && severity === 'critical') return 1;
  if (alive === 0 && severity === 'high') return 2;
  if (severity === 'critical') return 3;
  if (severity === 'high') return 4;
  return 5;
}

async function main() {
  const auditRaw = fs.readFileSync(AUDIT, 'utf8');
  const audit = JSON.parse(auditRaw);
  const needsByMakeModel = audit.issuesNeedBackfill;

  // Pull current severity from DB so we can prioritize.
  const ids = needsByMakeModel.map((n) => n.id);
  const rows = (await pool.query(
    `SELECT id, make, model, severity, title FROM "KnownIssue"
     WHERE id = ANY($1::text[]) AND status = 'published'`,
    [ids],
  )).rows;

  const aliveById = new Map(needsByMakeModel.map((n) => [n.id, n.alive]));
  const ranked = rows.map((r) => ({
    id: r.id,
    make: r.make,
    model: r.model,
    title: r.title,
    severity: r.severity,
    alive: aliveById.get(r.id) ?? 0,
    tier: tierFor(r.severity, aliveById.get(r.id) ?? 0),
    popularMake: POPULAR_MAKES.has(r.make),
  }));

  ranked.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.popularMake !== b.popularMake) return a.popularMake ? -1 : 1;
    return a.make.localeCompare(b.make) || a.model.localeCompare(b.model);
  });

  const trimmed = LIMIT > 0 ? ranked.slice(0, LIMIT) : ranked;

  if (JSON_OUT) {
    console.log(JSON.stringify(trimmed, null, 2));
  } else {
    console.log(`Total: ${trimmed.length} issues, prioritized (tier 1 = worst case)\n`);
    let lastTier = -1;
    for (const r of trimmed) {
      if (r.tier !== lastTier) {
        const tierLabel = ['', 'CRITICAL · 0 cites', 'HIGH · 0 cites', 'CRITICAL · <2 cites', 'HIGH · <2 cites', 'OTHER · <2 cites'][r.tier];
        console.log(`\n━━ Tier ${r.tier}: ${tierLabel} ━━`);
        lastTier = r.tier;
      }
      console.log(`  ${r.id.padEnd(60)} ${r.make} ${r.model} — ${r.title.slice(0, 60)}${r.title.length > 60 ? '...' : ''}`);
    }
  }
  await pool.end();
}

main().catch(async (err) => {
  console.error('Fatal:', err);
  try { await pool.end(); } catch { /* ignore */ }
  process.exit(1);
});
