#!/usr/bin/env node
/**
 * Update the citations array of a single KnownIssue row.
 *
 * Usage:
 *   node scripts/update-issue-citations.js <id> '<json-array>'
 *
 * Example:
 *   node scripts/update-issue-citations.js acura-ilx-infotainment-lag-2016 \
 *     '[{"type":"forum","title":"AcuraZine ILX firmware thread","url":"https://acurazine.com/..."},
 *       {"type":"tsb","title":"Acura TSB 16-085 ILX infotainment update","url":"https://..."}]'
 *
 * Each citation entry must be { type, title, url? }. Types align with
 * existing data: "forum", "tsb", "nhtsa", "manufacturer", "media", "other".
 *
 * Used by the citation-backfill background agent — agent calls this once
 * per issue with the WebSearch-verified replacement citations.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const HEAD_TIMEOUT_MS = 10_000;

/**
 * Verify a URL returns 2xx/3xx. Citations get this gate BEFORE writing
 * — fail closed: any URL we can't reach is rejected, the agent has to
 * retry with a different source. Matches the strategy in
 * scripts/audit-citations-links.js (HEAD first, GET fallback for hosts
 * that 405-reject HEAD like carcomplaints.com).
 */
async function isUrlLive(url) {
  if (!url || typeof url !== 'string') return false;
  if (!/^https?:\/\//i.test(url)) return false;
  const attempt = async (method) => {
    try {
      const r = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
        headers: { 'User-Agent': 'Au7oBot/1.0 (citation verifier; +https://au7o.io)' },
      });
      return r.status >= 200 && r.status < 400;
    } catch {
      return false;
    }
  };
  if (await attempt('HEAD')) return true;
  return attempt('GET');
}

async function main() {
  const [, , id, citationsJson] = process.argv;
  const skipVerify = process.argv.includes('--skip-verify');
  if (!id || !citationsJson) {
    console.error('Usage: node scripts/update-issue-citations.js <id> \'<json-array>\' [--skip-verify]');
    process.exit(1);
  }
  let citations;
  try {
    citations = JSON.parse(citationsJson);
    if (!Array.isArray(citations)) throw new Error('citations must be a JSON array');
  } catch (err) {
    console.error('Invalid JSON for citations:', err.message);
    process.exit(1);
  }
  for (const c of citations) {
    if (typeof c !== 'object' || !c.type || !c.title) {
      console.error('Each citation must have at least {type, title}; got:', c);
      process.exit(1);
    }
  }

  const r = (await pool.query(`SELECT id FROM "KnownIssue" WHERE id = $1`, [id])).rows[0];
  if (!r) {
    console.error(`No KnownIssue with id "${id}".`);
    process.exit(2);
  }

  // URL liveness gate — drop any entry whose URL can't be reached.
  // Entries without a `url` (e.g. a forum reference without a stable
  // link) pass through unchanged.
  let kept = citations;
  if (!skipVerify) {
    const results = await Promise.all(citations.map(async (c) => {
      if (!c.url) return { c, live: true, reason: 'no-url' };
      const live = await isUrlLive(c.url);
      return { c, live, reason: live ? 'ok' : 'dead' };
    }));
    kept = results.filter((r) => r.live).map((r) => r.c);
    const dropped = results.filter((r) => !r.live);
    if (dropped.length) {
      console.error(`✗ ${id} — dropped ${dropped.length} dead URL${dropped.length === 1 ? '' : 's'}:`);
      for (const d of dropped) console.error(`    × ${d.c.url}`);
    }
    if (kept.length === 0) {
      console.error(`✗ ${id} — every URL was dead; refusing to write empty citations array. Retry with different sources.`);
      await pool.end();
      process.exit(3);
    }
  }

  await pool.query(
    `UPDATE "KnownIssue" SET citations = $1::jsonb, "updatedAt" = NOW() WHERE id = $2`,
    [JSON.stringify(kept), id],
  );

  console.log(`✓ ${id} — wrote ${kept.length} citation${kept.length === 1 ? '' : 's'} (verified live)`);
  await pool.end();
}

main().catch(async (err) => {
  console.error('Fatal:', err);
  try { await pool.end(); } catch { /* ignore */ }
  process.exit(1);
});
