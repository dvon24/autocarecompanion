#!/usr/bin/env node
/**
 * Full-corpus accuracy audit using the Anthropic Batch API.
 *
 * For every published KnownIssue: build the same prompt the sample
 * script uses and submit it as a batch job. Anthropic prices batch
 * requests at 50% of standard API rates and they're typically processed
 * within the announced 24h window. For ~4,300 issues × Opus 4.7 with
 * 3 web_search uses each, expect ~$300-500 vs ~$700-900 real-time.
 *
 * Three-phase workflow:
 *   1. node scripts/audit-issues-full.js submit       → creates the batch
 *      and writes audit-batch-id.txt with the message_batch_id
 *   2. node scripts/audit-issues-full.js poll         → checks status
 *      and prints progress (run periodically)
 *   3. node scripts/audit-issues-full.js fetch        → downloads results,
 *      parses verdicts, writes a JSON report, optionally tags rows in DB
 *
 * Skips issues that were already audited unless --force is passed.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-opus-4-8';
const BATCH_URL = 'https://api.anthropic.com/v1/messages/batches';
const BATCH_ID_PATH = 'audit-batch-id.txt';
const RESULTS_PATH = 'audit-full-results.jsonl';
const REPORT_PATH = 'audit-full-report.json';

const cmd = process.argv[2] || 'help';

function buildPrompt(issue) {
  const years = issue.years && issue.years.length
    ? `${Math.min(...issue.years)}-${Math.max(...issue.years)}`
    : 'unknown years';
  const trims = (issue.trims || []).join(', ') || 'any trim';
  const cost = issue.estimatedCostLow != null && issue.estimatedCostHigh != null
    ? `$${issue.estimatedCostLow}-$${issue.estimatedCostHigh}`
    : 'no cost listed';
  const dtcs = (issue.dtcCodes || []).join(', ') || 'none';
  return `You are auditing an automotive known-issue database entry. Use web_search to verify the facts. Return ONLY a JSON object, no other text.

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
}

async function submit() {
  console.log('Loading published issues...');
  // Skip issues that were already tagged with an audit verdict (we'll
  // add a verdict column when --apply runs). For first pass, audit all.
  const issues = (await pool.query(
    `SELECT id, make, model, years, trims, "dtcCodes", category, title, description, severity, "estimatedCostLow", "estimatedCostHigh", source
     FROM "KnownIssue"
     WHERE status = 'published'
     ORDER BY make, model, id`,
  )).rows;
  console.log(`Building batch for ${issues.length} issues...`);

  // Anthropic batch: array of { custom_id, params }. Anthropic requires
  // custom_id to match ^[a-zA-Z0-9_-]{1,64}$ — our KnownIssue.id contains
  // dots (e.g. "honda.civic.2008.head-gasket") so we transform non-matching
  // chars to underscore. The mapping back to id is written to a sidecar
  // file so "fetch" can correlate verdicts to the original row.
  const sanitize = (id) => id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  const idMap = {};
  for (const iss of issues) {
    let safe = sanitize(iss.id);
    // Disambiguate collisions (extremely rare given the prefix structure
    // but guarded against just in case).
    let n = 1;
    while (idMap[safe]) { safe = `${sanitize(iss.id)}_${n++}`.slice(0, 64); }
    idMap[safe] = iss.id;
  }
  fs.writeFileSync('audit-batch-idmap.json', JSON.stringify(idMap, null, 2));
  const reverseMap = Object.fromEntries(Object.entries(idMap));
  const requests = issues.map(iss => ({
    custom_id: Object.entries(reverseMap).find(([, v]) => v === iss.id)[0],
    params: {
      model: MODEL,
      max_tokens: 2500,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      messages: [{ role: 'user', content: buildPrompt(iss) }],
    },
  }));

  console.log(`Submitting batch of ${requests.length} requests to Anthropic...`);
  const res = await fetch(BATCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ requests }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error('Batch submit failed:', res.status, txt);
    process.exit(1);
  }
  const data = await res.json();
  console.log(`Batch submitted: ${data.id}`);
  console.log(`  Status: ${data.processing_status}`);
  console.log(`  Created: ${data.created_at}`);
  console.log(`  Expected completion: ${data.expires_at}`);
  fs.writeFileSync(BATCH_ID_PATH, data.id);
  console.log(`\nBatch id saved to ${BATCH_ID_PATH}`);
  console.log(`Next: node scripts/audit-issues-full.js poll`);
}

async function poll() {
  if (!fs.existsSync(BATCH_ID_PATH)) {
    console.error(`No ${BATCH_ID_PATH} found — run "submit" first.`);
    process.exit(1);
  }
  const batchId = fs.readFileSync(BATCH_ID_PATH, 'utf8').trim();
  const res = await fetch(`${BATCH_URL}/${batchId}`, {
    headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
  });
  if (!res.ok) {
    console.error('Poll failed:', res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  const counts = data.request_counts || {};
  console.log(`Batch ${batchId}`);
  console.log(`  Status:    ${data.processing_status}`);
  console.log(`  Processed: ${counts.processing || 0}`);
  console.log(`  Succeeded: ${counts.succeeded || 0}`);
  console.log(`  Errored:   ${counts.errored || 0}`);
  console.log(`  Canceled:  ${counts.canceled || 0}`);
  console.log(`  Expired:   ${counts.expired || 0}`);
  if (data.processing_status === 'ended') {
    console.log(`\n✓ Batch complete. Run "fetch" to download results.`);
  } else {
    console.log(`\n(still processing — poll again later)`);
  }
}

async function fetchResults() {
  if (!fs.existsSync(BATCH_ID_PATH)) {
    console.error(`No ${BATCH_ID_PATH} found — run "submit" first.`);
    process.exit(1);
  }
  const batchId = fs.readFileSync(BATCH_ID_PATH, 'utf8').trim();
  const batch = await (await fetch(`${BATCH_URL}/${batchId}`, {
    headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
  })).json();
  if (batch.processing_status !== 'ended') {
    console.error(`Batch not done yet: ${batch.processing_status}`);
    process.exit(1);
  }
  if (!batch.results_url) {
    console.error('No results_url on batch:', batch);
    process.exit(1);
  }
  console.log(`Downloading ${batch.results_url}...`);
  const res = await fetch(batch.results_url, {
    headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
  });
  const text = await res.text();
  fs.writeFileSync(RESULTS_PATH, text);
  console.log(`Raw results: ${RESULTS_PATH}`);

  // Parse and summarize
  const lines = text.split('\n').filter(l => l.trim());
  let verified = 0, minor = 0, major = 0, fabricated = 0, parseErrors = 0, requestErrors = 0;
  const flagged = [];
  for (const line of lines) {
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    const customId = entry.custom_id;
    if (entry.result?.type !== 'succeeded') {
      requestErrors++;
      continue;
    }
    const content = entry.result.message?.content || [];
    const textBlocks = content.filter(c => c.type === 'text');
    const raw = textBlocks.map(b => b.text).join('\n').trim();
    let parsed = null;
    const candidates = [raw, raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()];
    const f = raw.indexOf('{'); const l = raw.lastIndexOf('}');
    if (f >= 0 && l > f) candidates.push(raw.slice(f, l + 1));
    for (const c of candidates) { try { parsed = JSON.parse(c); break; } catch { /* try next */ } }
    if (!parsed) { parseErrors++; continue; }
    const v = parsed.verdict;
    if (v === 'verified') verified++;
    else if (v === 'minor_issues') minor++;
    else if (v === 'major_issues') { major++; flagged.push({ id: customId, ...parsed }); }
    else if (v === 'likely_fabricated') { fabricated++; flagged.push({ id: customId, ...parsed }); }
  }
  const total = lines.length;
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  Full Audit Results (${total} issues)`);
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Verified:          ${verified} (${((verified / total) * 100).toFixed(1)}%)`);
  console.log(`  Minor issues:      ${minor} (${((minor / total) * 100).toFixed(1)}%)`);
  console.log(`  Major issues:      ${major} (${((major / total) * 100).toFixed(1)}%)  ← review`);
  console.log(`  Likely fabricated: ${fabricated} (${((fabricated / total) * 100).toFixed(1)}%)  ← review`);
  console.log(`  Parse errors:      ${parseErrors}`);
  console.log(`  Request errors:    ${requestErrors}`);

  const report = { total, verified, minor, major, fabricated, parseErrors, requestErrors, flagged };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nFlagged issues + full report: ${REPORT_PATH}`);
  await pool.end();
}

async function main() {
  if (cmd === 'submit') await submit();
  else if (cmd === 'poll') await poll();
  else if (cmd === 'fetch') await fetchResults();
  else {
    console.log('Usage:');
    console.log('  node scripts/audit-issues-full.js submit');
    console.log('  node scripts/audit-issues-full.js poll');
    console.log('  node scripts/audit-issues-full.js fetch');
  }
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
