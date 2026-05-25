#!/usr/bin/env node
/**
 * Wrapper around research-issues-v2.js logic that writes new issues with
 * status='pending_review' instead of 'published'. After this completes
 * the audit-and-promote step (_audit-and-promote.js) flips verified rows
 * to 'published' and leaves fabricated/major_issues rows as 'pending_review'
 * (or marks them 'archived').
 *
 * Usage:
 *   node scripts/_research-pending.js --make Mazda --model "CX-60" --years 2022-2025 --count 8 \
 *       [--id-prefix mazda-cx60] [--avoid-titles "title1|title2"]
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const args = process.argv.slice(2);
function flag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
}
const MAKE = flag('make');
const MODEL = flag('model');
const YEARS = flag('years');
const COUNT = parseInt(flag('count', '5'), 10);
const ID_PREFIX = flag('id-prefix', '');
const AVOID_TITLES = flag('avoid-titles', '');
const FOCUS = flag('focus', '');
const MODEL_ID = flag('model-id', 'claude-opus-4-7');
const DRY_RUN = args.includes('--dry-run');

if (!MAKE || !MODEL) {
  console.error('Usage: node scripts/_research-pending.js --make MAKE --model MODEL [--years YYYY-YYYY] [--count N]');
  process.exit(1);
}

const yearRange = (() => {
  if (YEARS && /^\d{4}-\d{4}$/.test(YEARS)) {
    const [a, b] = YEARS.split('-').map(n => parseInt(n, 10));
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }
  const thisYear = new Date().getFullYear();
  return { min: thisYear - 5, max: thisYear };
})();
const yearList = Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) => yearRange.min + i);

const PROBE_TIMEOUT_MS = 12_000;
async function probeUrl(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };
  const attempt = async (method) => {
    try {
      const r = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(PROBE_TIMEOUT_MS), headers });
      return { status: r.status, ok: r.status >= 200 && r.status < 400 };
    } catch (err) {
      return { status: 0, ok: false, error: String(err.name || err.message || err).slice(0, 80) };
    }
  };
  const head = await attempt('HEAD');
  if (head.ok) return head;
  if ([403, 405, 501, 0].includes(head.status)) {
    const get = await attempt('GET');
    return { ...get, headStatus: head.status };
  }
  return head;
}

const RESEARCHER_PROMPT = (make, model, years, count) => {
  let focusText = '';
  if (FOCUS) focusText = `\n\nFOCUS: ${FOCUS}\n`;
  let avoidText = '';
  if (AVOID_TITLES) {
    avoidText = `\n\nAVOID DUPLICATES — these issues are ALREADY in the database. Do NOT produce variants on these:\n${AVOID_TITLES.split('|').map(t => `  - ${t.trim()}`).join('\n')}\n`;
  }
  return `You are a senior automotive analyst documenting known issues for the ${years[0]}-${years[years.length - 1]} ${make} ${model}. Your output drives a SEO content page that mechanics and owners will use. Accuracy matters more than coverage.${focusText}${avoidText}

Find ${count} REAL, DOCUMENTED known issues for this vehicle. For each, search the web to find:
- NHTSA complaints, recalls, TSBs (nhtsa.gov, transportation.gov)
- Manufacturer service bulletins and recall pages
- Major owner forums (model-specific subdomains preferred)
- Reddit threads (r/MechanicAdvice, brand-specific subs)
- HonestJohn (honestjohn.co.uk) and AutoExpress (autoexpress.co.uk) for UK/EU models
- owners.mazda.com / mazda.co.uk / mazda.com.au for Mazda
- Carcomplaints.com (only if you saw the URL return real content)
- YouTube repair videos from established channels

CRITICAL: DO NOT INVENT URLs. Only cite URLs you actually saw in web_search results with a non-error snippet. Empty citations is better than hallucinated ones. The downstream validator HEAD-checks every URL and rejects drafts with fewer than 2 surviving citations.

For each issue produce:

{
  "id": "${ID_PREFIX || 'kebab-case-id-make-model-issue-keyword'}-DESCRIPTIVE-SLUG",
  "make": "${make}",
  "model": "${model}",
  "years": [list of affected model years, integers, ONLY from ${years.join(', ')}],
  "trims": [trim names where applicable; [] if all trims affected],
  "engines": [engine codes/displacements affected; [] if all engines affected],
  "category": "engine|transmission|drivetrain|electrical|brakes|suspension|cooling|fuel|interior|exterior|body|safety|exhaust|steering|hvac|emissions|other",
  "title": "Short specific title — the actual failure mode, not generic",
  "description": "2-4 sentences. What fails, why, what the driver experiences.",
  "solution": "2-4 sentences. Diagnostic steps, part numbers if known, cost ranges, key tips.",
  "severity": "high|medium|low",
  "confidence": "high|medium|low",
  "symptoms": [list of observable symptoms],
  "affectedSystems": [system names; can be empty],
  "dtcCodes": [VEHICLE-SPECIFIC OBD-II/manufacturer codes — DO NOT pad with generic P0300-class unless documented],
  "estimatedCostLow": realistic low-end repair $,
  "estimatedCostHigh": realistic high-end repair $,
  "citations": [{ "type": "tsb|recall|nhtsa|forum|manual|media", "title": "Source page title", "url": "Live URL you saw in search results" }],
  "communityRecommendations": [{ "type": "tip|warning|part", "content": "Specific actionable advice", "upvotes": 0, "needsReview": false }],
  "typicalMileageLow": number or null,
  "typicalMileageHigh": number or null
}

Severity:
- high: safety-critical (loss of brakes, sudden engine shutoff, fire risk)
- medium: costly repair or major drivability impact, not immediate safety
- low: nuisance, comfort, cosmetic

Confidence:
- high: multiple independent sources + recall/TSB
- medium: 2+ sources, no formal recall
- low: 1-2 forum reports

Return ONLY a JSON object: { "issues": [...] }. No markdown, no commentary.`;
};

async function callAnthropic({ prompt, max_tokens, max_searches = 5 }) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL_ID,
      max_tokens,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: max_searches }],
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(240_000),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  const textBlocks = (data.content || []).filter(c => c.type === 'text');
  const raw = textBlocks.map(b => b.text).join('\n').trim();
  const candidates = [raw, raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()];
  const f = raw.indexOf('{'); const l = raw.lastIndexOf('}');
  if (f >= 0 && l > f) candidates.push(raw.slice(f, l + 1));
  for (const c of candidates) { try { return JSON.parse(c); } catch { /* try next */ } }
  throw new Error(`Parse failed. Raw start: ${raw.slice(0, 200)}`);
}

async function validateUrls(draft) {
  const cits = Array.isArray(draft.citations) ? draft.citations : [];
  if (cits.length === 0) return { alive: [], dead: [] };
  const checks = await Promise.all(cits.filter(c => c && c.url).map(async c => {
    const r = await probeUrl(c.url);
    return { citation: c, ok: r.ok, status: r.status };
  }));
  return {
    alive: checks.filter(c => c.ok).map(c => c.citation),
    dead: checks.filter(c => !c.ok).map(c => ({ ...c.citation, _status: c.status })),
  };
}

const VERIFIER_PROMPT = (issue) => `You are auditing a draft automotive issue document before publication. You have access to web_search. Verify whether the draft's specific claims (year range, DTC codes, repair cost, severity, root cause) are supported by the cited sources OR by current real-world data you can find.

DRAFT:
${JSON.stringify(issue, null, 2)}

Tasks:
1. Visit each citation URL via web_search to confirm its content supports the draft's claims.
2. Sanity-check the DTC codes: do they actually correspond to the described failure on this make/model?
3. Sanity-check the year range.
4. Sanity-check severity calibration.
5. Sanity-check repair cost ranges.

If correct as-is, return { "verdict": "approved", "reasons": [] }.
If small things are wrong but fixable, return { "verdict": "needs_correction", "corrected_issue": { ...full corrected JSON... }, "reasons": ["what changed and why"] }.
If fabricated or fundamentally wrong, return { "verdict": "reject", "reasons": ["specifically what's wrong"] }.

Return ONLY the JSON object.`;

async function verify(draft) {
  return callAnthropic({ prompt: VERIFIER_PROMPT(draft), max_tokens: 8000, max_searches: 5 });
}

async function saveIssue(issue) {
  const sql = `
    INSERT INTO "KnownIssue" (
      id, make, model, years, trims, engines,
      category, title, description, solution, severity, confidence,
      symptoms, "affectedSystems", "dtcCodes",
      "estimatedCostLow", "estimatedCostHigh",
      citations, "communityRecommendations",
      "humanApproved", "reportCount", status,
      "lastReportedByOwners", "reviewedOn",
      source,
      "createdAt", "updatedAt",
      "typicalMileageLow", "typicalMileageHigh"
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12,
      $13, $14, $15,
      $16, $17,
      $18, $19,
      $20, $21, $22,
      $23, $24,
      $25,
      NOW(), NOW(),
      $26, $27
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description,
      solution = EXCLUDED.solution, citations = EXCLUDED.citations,
      "communityRecommendations" = EXCLUDED."communityRecommendations",
      "dtcCodes" = EXCLUDED."dtcCodes",
      "estimatedCostLow" = EXCLUDED."estimatedCostLow",
      "estimatedCostHigh" = EXCLUDED."estimatedCostHigh",
      severity = EXCLUDED.severity, confidence = EXCLUDED.confidence,
      symptoms = EXCLUDED.symptoms,
      source = EXCLUDED.source,
      status = EXCLUDED.status,
      "updatedAt" = NOW()
  `;
  const today = new Date().toISOString().slice(0, 10);
  await pool.query(sql, [
    issue.id, issue.make, issue.model, issue.years || [], issue.trims || [], issue.engines || [],
    issue.category, issue.title, issue.description, issue.solution, issue.severity, issue.confidence,
    issue.symptoms || [], issue.affectedSystems || [], issue.dtcCodes || [],
    issue.estimatedCostLow ?? null, issue.estimatedCostHigh ?? null,
    JSON.stringify(issue.citations || []), JSON.stringify(issue.communityRecommendations || []),
    false, issue.reportCount ?? 0, 'pending_review',
    today, today,
    'ai-researched-v2',
    issue.typicalMileageLow ?? null, issue.typicalMileageHigh ?? null,
  ]);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Research (pending_review) — ${MAKE} ${MODEL} (${yearRange.min}-${yearRange.max})`);
  console.log(`  Count: ${COUNT}   Model: ${MODEL_ID}   Dry run: ${DRY_RUN}`);
  console.log('═══════════════════════════════════════════════════════════');

  console.log(`\n━━━ Stage 1: Researcher (Opus 4.7 + web_search) ━━━`);
  const prompt = RESEARCHER_PROMPT(MAKE, MODEL, yearList, COUNT);
  const data = await callAnthropic({ prompt, max_tokens: 16000, max_searches: 10 });
  const drafts = Array.isArray(data?.issues) ? data.issues : [];
  console.log(`  Returned ${drafts.length} draft issues`);

  let saved = 0, rejectedUrls = 0, rejectedVerifier = 0, corrected = 0;
  const savedIds = [];
  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i];
    console.log(`\n━━━ [${i + 1}/${drafts.length}] ${(draft.title || '(no title)').slice(0, 70)} ━━━`);
    process.stdout.write(`  URL validation: `);
    const { alive, dead } = await validateUrls(draft);
    console.log(`${alive.length} alive, ${dead.length} dead`);
    if (alive.length < 2) {
      console.log(`  ✗ REJECTED — <2 surviving citations`);
      rejectedUrls++;
      continue;
    }
    draft.citations = alive;

    process.stdout.write(`  Verifier:       `);
    let verdict;
    try { verdict = await verify(draft); }
    catch (err) { console.log(`error — ${err.message.slice(0, 120)}`); rejectedVerifier++; continue; }

    if (verdict.verdict === 'reject') {
      console.log(`✗ REJECTED — ${(verdict.reasons || []).join('; ').slice(0, 150)}`);
      rejectedVerifier++;
      continue;
    }
    let finalIssue = draft;
    if (verdict.verdict === 'needs_correction' && verdict.corrected_issue) {
      finalIssue = verdict.corrected_issue;
      finalIssue.citations = alive;
      console.log(`~ CORRECTED — ${(verdict.reasons || []).join('; ').slice(0, 120)}`);
      corrected++;
    } else if (verdict.verdict === 'approved') {
      console.log(`✓ APPROVED`);
    } else {
      console.log(`? unknown verdict ${verdict.verdict}`);
      rejectedVerifier++;
      continue;
    }

    if (DRY_RUN) { console.log(`  (dry run — would save id="${finalIssue.id}")`); }
    else {
      try { await saveIssue(finalIssue); console.log(`  ✓ saved as pending_review`); saved++; savedIds.push(finalIssue.id); }
      catch (err) { console.log(`  ✗ DB error: ${err.message.slice(0, 200)}`); }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Done — saved ${saved} as pending_review, ${corrected} corrected, ${rejectedUrls} URL-rejected, ${rejectedVerifier} verifier-rejected`);
  console.log(`  IDs saved:\n${savedIds.map(id => `    ${id}`).join('\n')}`);
  console.log('═══════════════════════════════════════════════════════════');

  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
