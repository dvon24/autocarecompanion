#!/usr/bin/env node
/**
 * Audit a stratified sample of published KnownIssues for factual accuracy.
 *
 * Each issue is checked by Claude Sonnet 4.6 with web_search:
 *   - Is this a real, documented issue for this vehicle?
 *   - Are the DTC codes correct for the described problem?
 *   - Is the year range accurate (per NHTSA / TSBs / forums)?
 *   - Is severity calibrated reasonably?
 *   - Are the repair costs plausible?
 *
 * Also runs a fast pre-pass HEAD on every citation URL to flag dead links.
 *
 * Outputs a JSON report with per-issue verdicts + aggregate error rates so
 * we can decide whether to (a) ship a full-corpus audit or (b) target only
 * specific failure modes.
 *
 * Usage:
 *   node scripts/audit-issues-sample.js
 *   node scripts/audit-issues-sample.js --size 100
 *   node scripts/audit-issues-sample.js --output audit-report.json
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
// Opus 4.7 — picked for accuracy. Sonnet 4.6 was returning malformed JSON
// on ~40% of audits (model was emitting prose around the JSON block); Opus
// follows the JSON-only instruction tightly enough that we keep the
// verdict for nearly every issue, and its fact-grounding via web_search
// is materially better for catching wrong-year-range / wrong-DTC errors.
const MODEL = 'claude-opus-4-7';
const DELAY_MS = 2500;

const args = process.argv.slice(2);
const SAMPLE_SIZE = args.includes('--size')
  ? parseInt(args[args.indexOf('--size') + 1], 10)
  : 50;
const MAKE_FILTER = args.includes('--make')
  ? args[args.indexOf('--make') + 1]
  : null;
const MODEL_FILTER = args.includes('--model')
  ? args[args.indexOf('--model') + 1]
  : null;
const ALL_FOR_MAKE = args.includes('--all'); // audit every issue for the specified make
const OUTPUT_PATH = args.includes('--output')
  ? args[args.indexOf('--output') + 1]
  : MAKE_FILTER && MODEL_FILTER
    ? `audit-${MAKE_FILTER.toLowerCase().replace(/\s+/g, '-')}-${MODEL_FILTER.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`
    : MAKE_FILTER && ALL_FOR_MAKE
      ? `audit-${MAKE_FILTER.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`
      : `audit-sample-${Date.now()}.json`;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Stratified sample: pick issues across the top-N makes weighted by issue count.
 * Within each make, pick by reportCount desc + a few random ones so we cover
 * both popular and obscure issues.
 */
async function sampleIssues(size) {
  // Get make distribution
  const makeRows = (await pool.query(
    `SELECT make, COUNT(*)::int as c FROM "KnownIssue" WHERE status = 'published' GROUP BY make ORDER BY c DESC`,
  )).rows;
  const totalIssues = makeRows.reduce((acc, r) => acc + r.c, 0);

  // Allocate sample per make proportionally, min 1 each for the top 10
  const allocations = makeRows.slice(0, 12).map(r => ({
    make: r.make,
    count: Math.max(1, Math.round((r.c / totalIssues) * size)),
  }));
  // Normalize to target size
  const total = allocations.reduce((a, b) => a + b.count, 0);
  if (total > size) {
    let drop = total - size;
    for (let i = allocations.length - 1; i >= 0 && drop > 0; i--) {
      if (allocations[i].count > 1) { allocations[i].count--; drop--; }
    }
  }

  const issues = [];
  for (const { make, count } of allocations) {
    // Half by reportCount desc (popular), half random (obscure)
    const half = Math.ceil(count / 2);
    const popular = (await pool.query(
      `SELECT id, make, model, years, trims, "dtcCodes", category, title, description, solution, severity, "estimatedCostLow", "estimatedCostHigh", citations, source, "reportCount"
       FROM "KnownIssue"
       WHERE status = 'published' AND make = $1
       ORDER BY "reportCount" DESC LIMIT $2`,
      [make, half],
    )).rows;
    const random = (await pool.query(
      `SELECT id, make, model, years, trims, "dtcCodes", category, title, description, solution, severity, "estimatedCostLow", "estimatedCostHigh", citations, source, "reportCount"
       FROM "KnownIssue"
       WHERE status = 'published' AND make = $1 AND id NOT IN (${popular.length > 0 ? popular.map((_, i) => `$${i + 2}`).join(',') : 'NULL'})
       ORDER BY random() LIMIT $${popular.length + 2}`,
      [make, ...popular.map(p => p.id), count - half],
    )).rows;
    issues.push(...popular, ...random);
  }
  return issues;
}

/**
 * Fast pre-pass: HEAD every citation URL in parallel, flag dead links.
 */
async function checkCitationLinks(issue) {
  const cites = Array.isArray(issue.citations) ? issue.citations : [];
  const checks = await Promise.all(
    cites
      .filter(c => c && c.url)
      .map(async c => {
        try {
          const r = await fetch(c.url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) });
          return { url: c.url, type: c.type, status: r.status, ok: r.status >= 200 && r.status < 400 };
        } catch (err) {
          return { url: c.url, type: c.type, status: 0, ok: false, error: String(err.message || err) };
        }
      }),
  );
  return checks;
}

async function auditOneIssue(issue) {
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

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        // 800 was too tight — Opus's web_search reflection runs ~500 tokens
        // before the JSON object, which truncated the response mid-JSON
        // ~37% of the time on the first sample. 2500 covers the reflection
        // + a generous JSON payload (issues_found array can hold a few
        // multi-sentence findings without bumping into the cap).
        max_tokens: 2500,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return { error: `http_${res.status}`, details: txt.slice(0, 200) };
    }
    const data = await res.json();
    // Extract the assistant's final text content
    const textBlocks = (data.content || []).filter(c => c.type === 'text');
    const raw = textBlocks.map(b => b.text).join('\n').trim();
    // Strategy: try parsing as-is, then strip code fences, then extract
    // the first {...} block. Sonnet's failure mode was prefacing the JSON
    // with narrative text from the web_search reflection; Opus follows
    // the instruction more tightly, but this pre-cleanup is cheap insurance.
    const candidates = [
      raw,
      raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim(),
    ];
    // Greedy match the first {...} that spans to end of last } in the text.
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      candidates.push(raw.slice(firstBrace, lastBrace + 1));
    }
    for (const c of candidates) {
      try { return JSON.parse(c); } catch { /* try next */ }
    }
    return { error: 'parse_failed', raw: raw.slice(0, 400) };
  } catch (err) {
    return { error: 'network', details: String(err.message || err) };
  }
}

async function main() {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Known-Issues Audit Sample`);
  console.log(`  Size: ${SAMPLE_SIZE}`);
  console.log(`  Output: ${OUTPUT_PATH}`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  let issues;
  if (MAKE_FILTER && MODEL_FILTER) {
    console.log(`Loading ALL published issues for make="${MAKE_FILTER}" model="${MODEL_FILTER}"...`);
    issues = (await pool.query(
      `SELECT id, make, model, years, trims, "dtcCodes", category, title, description, solution, severity, "estimatedCostLow", "estimatedCostHigh", citations, source, "reportCount"
       FROM "KnownIssue"
       WHERE status = 'published' AND make ILIKE $1 AND model ILIKE $2
       ORDER BY "reportCount" DESC, id`,
      [MAKE_FILTER, MODEL_FILTER],
    )).rows;
  } else if (MAKE_FILTER && ALL_FOR_MAKE) {
    // Audit every published issue for one make. Used for the per-make
    // cleanup pass — small enough makes (≤300 issues) are cheap to do
    // completely instead of sampling.
    console.log(`Loading ALL published issues for make="${MAKE_FILTER}"...`);
    issues = (await pool.query(
      `SELECT id, make, model, years, trims, "dtcCodes", category, title, description, solution, severity, "estimatedCostLow", "estimatedCostHigh", citations, source, "reportCount"
       FROM "KnownIssue"
       WHERE status = 'published' AND make ILIKE $1
       ORDER BY "reportCount" DESC, model, id`,
      [MAKE_FILTER],
    )).rows;
  } else {
    issues = await sampleIssues(SAMPLE_SIZE);
  }
  console.log(`Sampled ${issues.length} issues across ${new Set(issues.map(i => i.make)).size} makes\n`);

  const results = [];
  let verified = 0, minor = 0, major = 0, fabricated = 0, errors = 0;
  let deadLinks = 0, totalLinks = 0;

  for (let i = 0; i < issues.length; i++) {
    const iss = issues[i];
    process.stdout.write(`  [${i + 1}/${issues.length}] ${iss.make} ${iss.model}: ${iss.title.slice(0, 50)}... `);

    // Citation link check
    const linkChecks = await checkCitationLinks(iss);
    const dead = linkChecks.filter(c => !c.ok);
    deadLinks += dead.length;
    totalLinks += linkChecks.length;

    // AI audit
    const audit = await auditOneIssue(iss);

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
      links: linkChecks,
      deadLinkCount: dead.length,
    });

    await sleep(DELAY_MS);
  }

  // Summary
  const total = issues.length;
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  Audit Results`);
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Verified:        ${verified}/${total} (${((verified / total) * 100).toFixed(1)}%)`);
  console.log(`  Minor issues:    ${minor}/${total} (${((minor / total) * 100).toFixed(1)}%)`);
  console.log(`  Major issues:    ${major}/${total} (${((major / total) * 100).toFixed(1)}%)`);
  console.log(`  Likely fabricated: ${fabricated}/${total} (${((fabricated / total) * 100).toFixed(1)}%)`);
  console.log(`  Audit errors:    ${errors}/${total} (${((errors / total) * 100).toFixed(1)}%)`);
  console.log(`  Citation links:  ${totalLinks - deadLinks}/${totalLinks} live (${((deadLinks / Math.max(1, totalLinks)) * 100).toFixed(1)}% dead)`);

  const summary = { sampledAt: new Date().toISOString(), total, verified, minor, major, fabricated, errors, deadLinks, totalLinks, results };
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(summary, null, 2));
  console.log(`\nFull report written to ${OUTPUT_PATH}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  pool.end();
  process.exit(1);
});
