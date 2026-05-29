#!/usr/bin/env node
/**
 * Audit all pending_review issues for a given make/model and:
 *   - verified  → status='published'
 *   - minor_issues → status='published' (small inaccuracies acceptable, user can refine)
 *   - major_issues → status='archived', flagged in report
 *   - likely_fabricated → status='archived', flagged in report
 *   - errors → leave as pending_review for retry
 *
 * Usage:
 *   node scripts/_audit-and-promote.js --make Mazda --model "CX-60"
 *   node scripts/_audit-and-promote.js --ids "id1,id2,id3"
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-8';
const DELAY_MS = 3500;

const args = process.argv.slice(2);
function flag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
}
const MAKE = flag('make');
const MODEL_NAME = flag('model');
const IDS = flag('ids');
const OUTPUT_PATH = flag('output', `audit-promote-${Date.now()}.json`);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function auditOne(issue) {
  const years = issue.years && issue.years.length
    ? `${Math.min(...issue.years)}-${Math.max(...issue.years)}` : 'unknown years';
  const trims = (issue.trims || []).join(', ') || 'any trim';
  const cost = issue.estimatedCostLow != null && issue.estimatedCostHigh != null
    ? `$${issue.estimatedCostLow}-$${issue.estimatedCostHigh}` : 'no cost listed';
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
3. Is the year range accurate?
4. Is the severity calibrated reasonably?
5. Are the repair costs in the right ballpark?

Return JSON:
{
  "verdict": "verified" | "minor_issues" | "major_issues" | "likely_fabricated",
  "real": true | false,
  "issues_found": ["short description", ...],
  "evidence": "1-2 sentence summary of what your search found",
  "confidence": "high" | "medium" | "low"
}`;

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2500,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`http_${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const textBlocks = (data.content || []).filter(c => c.type === 'text');
  const raw = textBlocks.map(b => b.text).join('\n').trim();
  const candidates = [raw, raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()];
  const f = raw.indexOf('{'); const l = raw.lastIndexOf('}');
  if (f >= 0 && l > f) candidates.push(raw.slice(f, l + 1));
  for (const c of candidates) { try { return JSON.parse(c); } catch { /* try next */ } }
  throw new Error('parse_failed');
}

async function main() {
  let issues;
  if (IDS) {
    const ids = IDS.split(',').map(s => s.trim()).filter(Boolean);
    issues = (await pool.query(
      `SELECT id, make, model, years, trims, "dtcCodes", title, description, severity, "estimatedCostLow", "estimatedCostHigh", source, status
       FROM "KnownIssue" WHERE id = ANY($1) ORDER BY id`,
      [ids],
    )).rows;
  } else if (MAKE && MODEL_NAME) {
    issues = (await pool.query(
      `SELECT id, make, model, years, trims, "dtcCodes", title, description, severity, "estimatedCostLow", "estimatedCostHigh", source, status
       FROM "KnownIssue" WHERE LOWER(make)=LOWER($1) AND LOWER(model)=LOWER($2) AND status='pending_review' ORDER BY id`,
      [MAKE, MODEL_NAME],
    )).rows;
  } else {
    console.error('Required: --make + --model OR --ids id1,id2');
    process.exit(1);
  }

  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Audit-and-promote: ${issues.length} pending_review issues`);
  if (MAKE) console.log(`  Vehicle: ${MAKE} ${MODEL_NAME}`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  const results = [];
  let verified = 0, minor = 0, major = 0, fabricated = 0, errors = 0;

  for (let i = 0; i < issues.length; i++) {
    const iss = issues[i];
    process.stdout.write(`  [${i + 1}/${issues.length}] ${iss.title.slice(0, 60)}... `);
    let audit = null;
    try { audit = await auditOne(iss); }
    catch (err) { console.log(`✗ ERROR ${err.message.slice(0, 80)}`); errors++; results.push({ id: iss.id, title: iss.title, error: err.message }); await sleep(DELAY_MS); continue; }

    const v = audit.verdict;
    let newStatus = null;
    if (v === 'verified') { verified++; newStatus = 'published'; console.log(`✓ verified → published`); }
    else if (v === 'minor_issues') { minor++; newStatus = 'published'; console.log(`~ minor → published: ${(audit.issues_found || []).join('; ').slice(0, 60)}`); }
    else if (v === 'major_issues') { major++; newStatus = 'archived'; console.log(`! major → archived: ${(audit.issues_found || []).join('; ').slice(0, 60)}`); }
    else if (v === 'likely_fabricated') { fabricated++; newStatus = 'archived'; console.log(`✗ FABRICATED → archived`); }
    else { errors++; console.log(`? unknown verdict ${v}`); }

    if (newStatus) {
      await pool.query(`UPDATE "KnownIssue" SET status=$1, "reviewedOn"=$2, "updatedAt"=NOW() WHERE id=$3`,
        [newStatus, new Date().toISOString().slice(0, 10), iss.id]);
    }
    results.push({ id: iss.id, title: iss.title, severity: iss.severity, verdict: v, newStatus, audit });
    await sleep(DELAY_MS);
  }

  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  Verified (published):       ${verified}`);
  console.log(`  Minor issues (published):   ${minor}`);
  console.log(`  Major issues (archived):    ${major}`);
  console.log(`  Likely fabricated (archived): ${fabricated}`);
  console.log(`  Audit errors:               ${errors}`);
  console.log(`═══════════════════════════════════════════════════════════`);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({
    auditedAt: new Date().toISOString(),
    make: MAKE, model: MODEL_NAME,
    total: issues.length, verified, minor, major, fabricated, errors,
    results,
  }, null, 2));
  console.log(`Report: ${OUTPUT_PATH}`);

  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
