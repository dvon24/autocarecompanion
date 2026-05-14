#!/usr/bin/env node
/**
 * Citation link health check + auto-prune.
 *
 * Walks every published KnownIssue, HEAD-checks every URL in the
 * citations[] array, and (optionally) writes back the filtered list with
 * dead URLs removed. Concurrent HEAD requests so the whole 4k-issue
 * corpus runs in minutes.
 *
 * Default: dry-run (report only).
 * --apply: actually write the cleaned citations back to the DB.
 * --concurrency N: parallel HEAD requests (default 25).
 *
 * Output: audit-citations-${ts}.json with per-issue breakdown +
 *         the list of issues that drop below 2 citations after pruning
 *         (those become candidates for re-backfill via
 *         scripts/backfill-citations.js).
 *
 * Usage:
 *   node scripts/audit-citations-links.js                  # dry-run report
 *   node scripts/audit-citations-links.js --apply          # write back changes
 *   node scripts/audit-citations-links.js --apply --make Ford
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const MAKE = args.includes('--make') ? args[args.indexOf('--make') + 1] : null;
const CONCURRENCY = args.includes('--concurrency')
  ? parseInt(args[args.indexOf('--concurrency') + 1], 10)
  : 25;
const HEAD_TIMEOUT_MS = 12_000;
const OUTPUT_PATH = `audit-citations-${Date.now()}.json`;

async function checkUrl(url) {
  // Two-pass strategy: HEAD first (cheap), then GET fallback for hosts
  // that reject HEAD (some forums + carcomplaints.com return 405 on HEAD).
  // A URL is "live" if either method returns a 2xx/3xx final response.
  const attempt = async (method) => {
    try {
      const r = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
        headers: {
          // Use a real Chrome user-agent. NHTSA + carcomplaints + most
          // forums fingerprint the "Au7oBot/..." string the first pass
          // used and return 403 to anything that smells like a crawler;
          // that produced ~3,500 false-positive "dead" URLs against
          // pages that are perfectly accessible to humans.
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      return { status: r.status, ok: r.status >= 200 && r.status < 400 };
    } catch (err) {
      return { status: 0, ok: false, error: String(err.name || err.message || err).slice(0, 80) };
    }
  };
  const head = await attempt('HEAD');
  if (head.ok) return { ...head, method: 'HEAD' };
  // Some hosts reject HEAD (405/501/403). Try GET before declaring dead.
  if ([403, 405, 501, 0].includes(head.status)) {
    const get = await attempt('GET');
    return { ...get, method: 'GET', headStatus: head.status };
  }
  return { ...head, method: 'HEAD' };
}

async function runConcurrent(tasks, concurrency) {
  const results = new Array(tasks.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: concurrency }).map(async () => {
      while (true) {
        const i = cursor++;
        if (i >= tasks.length) return;
        results[i] = await tasks[i]();
      }
    }),
  );
  return results;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Citation Link Health Audit');
  console.log(`  Apply changes: ${APPLY}`);
  console.log(`  Make filter:   ${MAKE || 'ALL'}`);
  console.log(`  Concurrency:   ${CONCURRENCY}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  const params = [];
  let where = `status = 'published' AND citations::text != '[]'`;
  if (MAKE) { params.push(MAKE); where += ` AND make ILIKE $${params.length}`; }

  const issues = (await pool.query(
    `SELECT id, make, model, title, citations FROM "KnownIssue" WHERE ${where} ORDER BY make, model`,
    params,
  )).rows;
  console.log(`Walking ${issues.length} issues...\n`);

  // Build dedup'd URL set first so we don't HEAD the same URL N times.
  const urlSet = new Set();
  for (const iss of issues) {
    for (const c of iss.citations || []) {
      if (c && c.url) urlSet.add(c.url);
    }
  }
  const urls = [...urlSet];
  console.log(`Found ${urls.length} unique URLs across ${issues.length} issues. Probing...\n`);

  const t0 = Date.now();
  let done = 0;
  const tasks = urls.map((u) => async () => {
    const r = await checkUrl(u);
    done++;
    if (done % 100 === 0 || done === urls.length) {
      const pct = ((done / urls.length) * 100).toFixed(1);
      process.stdout.write(`\r  probed ${done}/${urls.length} (${pct}%)`);
    }
    return [u, r];
  });
  const probeResults = await runConcurrent(tasks, CONCURRENCY);
  console.log(`\n  ${((Date.now() - t0) / 1000).toFixed(1)}s elapsed\n`);

  const urlHealth = new Map(probeResults);
  const dead = [...urlHealth.entries()].filter(([, r]) => !r.ok);
  console.log(`Dead URLs: ${dead.length}/${urls.length} (${((dead.length / urls.length) * 100).toFixed(1)}%)\n`);

  // Per-issue analysis
  const perIssue = [];
  let issuesAllDead = 0;
  let issuesSomeDead = 0;
  let issuesAllGood = 0;
  let issuesNeedBackfill = []; // < 2 citations after prune
  let toUpdate = []; // { id, citations }

  for (const iss of issues) {
    const cits = iss.citations || [];
    if (cits.length === 0) continue;
    const alive = [];
    const deadHere = [];
    for (const c of cits) {
      if (!c || !c.url) continue;
      const h = urlHealth.get(c.url);
      if (h && h.ok) alive.push(c);
      else deadHere.push({ ...c, _status: h?.status, _error: h?.error });
    }
    const record = {
      id: iss.id,
      make: iss.make,
      model: iss.model,
      title: iss.title,
      before: cits.length,
      alive: alive.length,
      dead: deadHere.length,
      deadUrls: deadHere.map(d => ({ url: d.url, status: d._status, error: d._error })),
    };
    perIssue.push(record);
    if (alive.length === 0 && deadHere.length > 0) issuesAllDead++;
    else if (deadHere.length > 0) issuesSomeDead++;
    else issuesAllGood++;
    if (alive.length < 2) issuesNeedBackfill.push({ id: iss.id, make: iss.make, model: iss.model, alive: alive.length });
    if (deadHere.length > 0) toUpdate.push({ id: iss.id, citations: alive });
  }

  console.log(`Per-issue summary:`);
  console.log(`  All citations alive:        ${issuesAllGood}`);
  console.log(`  Some dead, some alive:      ${issuesSomeDead}`);
  console.log(`  ALL citations dead:         ${issuesAllDead}`);
  console.log(`  Issues left with <2 cites:  ${issuesNeedBackfill.length}  ← need re-backfill\n`);

  if (APPLY) {
    console.log(`Writing ${toUpdate.length} cleaned citation arrays to DB...`);
    let updated = 0;
    for (const u of toUpdate) {
      try {
        await pool.query(
          'UPDATE "KnownIssue" SET citations = $1, "updatedAt" = NOW() WHERE id = $2',
          [JSON.stringify(u.citations), u.id],
        );
        updated++;
        if (updated % 100 === 0) process.stdout.write(`\r  updated ${updated}/${toUpdate.length}`);
      } catch (err) {
        console.log(`\n  ✗ update failed for ${u.id}:`, err.message);
      }
    }
    console.log(`\n  done — ${updated} issues updated\n`);
  } else {
    console.log(`(dry run — re-run with --apply to write changes)\n`);
  }

  const report = {
    auditedAt: new Date().toISOString(),
    applied: APPLY,
    totals: {
      issues: issues.length,
      uniqueUrls: urls.length,
      deadUrls: dead.length,
      deadUrlPct: dead.length / urls.length,
      issuesAllGood,
      issuesSomeDead,
      issuesAllDead,
      issuesNeedBackfill: issuesNeedBackfill.length,
    },
    issuesNeedBackfill,
    perIssue,
  };
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));
  console.log(`Report: ${OUTPUT_PATH}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  pool.end();
  process.exit(1);
});
