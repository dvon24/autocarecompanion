#!/usr/bin/env node
/**
 * Re-audit a specific list of KnownIssue IDs that errored during a batch
 * audit run (e.g. http_529 overload window, network timeouts, parse failures).
 *
 * Same prompt + Opus 4.7 setup as audit-issues-sample.js, with:
 *   - 3 retries on 529 / network with exponential backoff (15s, 45s, 120s)
 *   - 4s base delay between issues to give the API breathing room
 *
 * Usage:
 *   node scripts/audit-issues-reaudit.js --ids-file audit-audi-errored-ids.json
 *   node scripts/audit-issues-reaudit.js --ids-file <file> --output audit-audi-reaudit.json
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-7';
const DELAY_MS = 4000;
const RETRY_BACKOFFS_MS = [15_000, 45_000, 120_000];

const args = process.argv.slice(2);
const IDS_FILE = args.includes('--ids-file')
  ? args[args.indexOf('--ids-file') + 1]
  : null;
const OUTPUT_PATH = args.includes('--output')
  ? args[args.indexOf('--output') + 1]
  : `audit-reaudit-${Date.now()}.json`;

if (!IDS_FILE) {
  console.error('Required: --ids-file <path-to-json-list-of-ids>');
  process.exit(1);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function auditOneIssueOnce(issue) {
  const years = issue.years && issue.years.length
    ? `${Math.min(...issue.years)}-${Math.max(...issue.years)}`
    : 'unknown years';
  const trims = (issue.trims || []).join(', ') || 'any trim';
  const cost = issue.estimatedCostLow != null && issue.estimatedCostHigh != null
    ? `$${issue.estimatedCostLow}-$${issue.estimatedCostHigh}`
    : 'no cost listed';
  const dtcs = (issue.dtcCodes || []).join(', ') || 'none';

  const prompt = `You are auditing an automotive known-issue database entry. Use web_search to verify the facts. Return ONLY a JSON object, no other text.

VEHICLE: ${years} ${issue.make} ${issue.model} (${trims})
ISSUE TITLE: ${issue.title}
DESCRIPTION: ${issue.description.slice(0, 500)}
DTC CODES: ${dtcs}
SEVERITY: ${issue.severity}
REPAIR COST: ${cost}
SOURCE: ${issue.source || 'unknown'}

Verify:
1. Is this a real, documented issue for this vehicle/year? (Search NHTSA, manufacturer TSBs, owner forums)
2. Are the DTC codes correct for the described problem?
3. Is the year range accurate, or does it miss/include wrong years?
4. Is the severity calibrated reasonably (high = safety-critical, medium = costly but not dangerous, low = nuisance)?
5. Are the repair costs in the right ballpark?

Return JSON:
{
  "verdict": "verified" | "minor_issues" | "major_issues" | "likely_fabricated",
  "real": true | false,
  "issues_found": ["short description", ...],
  "evidence": "1-2 sentence summary of what your search found",
  "confidence": "high" | "medium" | "low"
}

Definitions:
- verified: facts match real-world data, no concerns
- minor_issues: real issue but small inaccuracies (year off by 1, cost range narrow, etc.)
- major_issues: real issue but significantly wrong (wrong DTCs, severity miscategorized, costs 3x off)
- likely_fabricated: cannot find real-world evidence this issue exists for this vehicle`;

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2500,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    const err = new Error(`http_${res.status}`);
    err.status = res.status;
    err.body = txt.slice(0, 200);
    throw err;
  }
  const data = await res.json();
  const textBlocks = (data.content || []).filter(c => c.type === 'text');
  const raw = textBlocks.map(b => b.text).join('\n').trim();
  const candidates = [
    raw,
    raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim(),
  ];
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(raw.slice(firstBrace, lastBrace + 1));
  }
  for (const c of candidates) {
    try { return JSON.parse(c); } catch { /* try next */ }
  }
  const err = new Error('parse_failed');
  err.raw = raw.slice(0, 400);
  throw err;
}

async function auditOneIssueWithRetry(issue) {
  let lastErr = null;
  for (let attempt = 0; attempt <= RETRY_BACKOFFS_MS.length; attempt++) {
    try {
      return await auditOneIssueOnce(issue);
    } catch (err) {
      lastErr = err;
      // Retry on 529 (overloaded), network, or parse failure
      const retryable = err.status === 529 || err.status === 529 || err.message === 'parse_failed' || /timeout|network|fetch failed|ECONN|ETIMEDOUT/i.test(String(err.message || ''));
      if (!retryable || attempt >= RETRY_BACKOFFS_MS.length) break;
      const backoff = RETRY_BACKOFFS_MS[attempt];
      process.stdout.write(` [retry ${attempt + 1} after ${backoff / 1000}s] `);
      await sleep(backoff);
    }
  }
  return {
    error: lastErr && lastErr.status ? `http_${lastErr.status}` : (lastErr && lastErr.message) || 'unknown',
    details: lastErr && (lastErr.body || lastErr.raw) ? String(lastErr.body || lastErr.raw).slice(0, 200) : undefined,
  };
}

async function main() {
  const ids = JSON.parse(fs.readFileSync(IDS_FILE, 'utf8'));
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Re-audit ${ids.length} issues from ${IDS_FILE}`);
  console.log(`  Output: ${OUTPUT_PATH}`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  const issues = (await pool.query(
    `SELECT id, make, model, years, trims, "dtcCodes", category, title, description, solution, severity, "estimatedCostLow", "estimatedCostHigh", citations, source, "reportCount"
     FROM "KnownIssue"
     WHERE id = ANY($1)
     ORDER BY make, model, id`,
    [ids],
  )).rows;

  const byId = Object.fromEntries(issues.map(i => [i.id, i]));
  const missing = ids.filter(id => !byId[id]);
  if (missing.length) console.log(`  ${missing.length} IDs not found in DB:\n    ${missing.join('\n    ')}\n`);

  const results = [];
  let verified = 0, minor = 0, major = 0, fabricated = 0, errors = 0;

  for (let i = 0; i < issues.length; i++) {
    const iss = issues[i];
    process.stdout.write(`  [${i + 1}/${issues.length}] ${iss.make} ${iss.model}: ${iss.title.slice(0, 50)}... `);

    const audit = await auditOneIssueWithRetry(iss);

    if (audit.error) {
      console.log(`✗ ${audit.error}`);
      errors++;
    } else {
      const v = audit.verdict;
      if (v === 'verified') { verified++; console.log(`✓ verified`); }
      else if (v === 'minor_issues') { minor++; console.log(`~ minor: ${(audit.issues_found || []).join('; ').slice(0, 60)}`); }
      else if (v === 'major_issues') { major++; console.log(`! major: ${(audit.issues_found || []).join('; ').slice(0, 60)}`); }
      else if (v === 'likely_fabricated') { fabricated++; console.log(`✗ FABRICATED`); }
      else { errors++; console.log(`? unknown verdict: ${v}`); }
    }

    results.push({
      id: iss.id,
      vehicle: `${Math.min(...(iss.years || [0]))} ${iss.make} ${iss.model}`,
      title: iss.title,
      severity: iss.severity,
      source: iss.source,
      reportCount: iss.reportCount,
      audit,
    });
    await sleep(DELAY_MS);
  }

  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  Re-audit Results`);
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Verified:        ${verified}/${issues.length} (${(verified / issues.length * 100).toFixed(1)}%)`);
  console.log(`  Minor issues:    ${minor}/${issues.length} (${(minor / issues.length * 100).toFixed(1)}%)`);
  console.log(`  Major issues:    ${major}/${issues.length} (${(major / issues.length * 100).toFixed(1)}%)`);
  console.log(`  Likely fabricated: ${fabricated}/${issues.length} (${(fabricated / issues.length * 100).toFixed(1)}%)`);
  console.log(`  Audit errors:    ${errors}/${issues.length} (${(errors / issues.length * 100).toFixed(1)}%)`);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({
    sampledAt: new Date().toISOString(),
    sourceFile: IDS_FILE,
    total: issues.length,
    verified, minor, major, fabricated, errors,
    results,
  }, null, 2));
  console.log(`\nFull report written to ${OUTPUT_PATH}`);

  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
