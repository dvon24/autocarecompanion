#!/usr/bin/env node
/**
 * research-issues-v2.js — hardened replacement for the AI-research pipeline.
 *
 * Three-stage flow per issue:
 *
 *   1. RESEARCHER  (Opus 4.7 + web_search)
 *      Produces a draft JSON for N issues on the target vehicle. Prompt
 *      explicitly forbids inventing URLs — citations may only contain
 *      URLs the model SAW in web_search results. If it can't find a real
 *      source for a claim, it omits the claim.
 *
 *   2. URL VALIDATOR  (local, free)
 *      HEAD/GET-checks every citation with a real Chrome user-agent
 *      (NHTSA, CarComplaints, forums all 403 the default Node UA).
 *      Dead URLs are pruned. Drafts left with fewer than 2 live
 *      citations are rejected — fewer than 2 surviving sources is the
 *      strongest "this was hallucinated" signal.
 *
 *   3. VERIFIER  (Opus 4.7 + web_search)
 *      Second Opus call given the surviving draft + its (now live)
 *      citations. Asked to verify each major claim against the cited
 *      pages. Returns "approved", "needs_correction" (with a corrected
 *      version), or "reject".
 *
 * Only "approved" or "needs_correction" drafts get written to the DB
 * with source="ai-researched-v2" so we can distinguish hardened rows
 * from the legacy AI-researched corpus.
 *
 * Usage:
 *   node scripts/research-issues-v2.js --make BMW --model "3 Series" --years 2018-2024 --count 5
 *   node scripts/research-issues-v2.js --make Lincoln --model Navigator --count 8 --dry-run
 *
 * Flags:
 *   --make MAKE             required
 *   --model MODEL           required
 *   --years YYYY-YYYY       optional (defaults to last 5 model years)
 *   --count N               how many issues to request (default 5)
 *   --dry-run               don't write to DB, print what would be saved
 *   --model-id ID           override Anthropic model (default claude-opus-4-7)
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
const YEARS = flag('years'); // "2018-2024"
const COUNT = parseInt(flag('count', '5'), 10);
const DRY_RUN = args.includes('--dry-run');
const MODEL_ID = flag('model-id', 'claude-opus-4-7');
const EXCLUDE = flag('exclude', ''); // comma-separated topic keywords to avoid (e.g. "timing belt,oil sludge")
const FOCUS = flag('focus', '');     // comma-separated topics to focus on

if (!MAKE || !MODEL) {
  console.error('Usage: node scripts/research-issues-v2.js --make MAKE --model MODEL [--years YYYY-YYYY] [--count N] [--dry-run]');
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

// ────────────────────────────────────────────────────────────────────────
// Shared HTTP probe with real Chrome UA — same logic as
// audit-citations-links.js, since we learned the hard way that the
// default Node fetch UA gets 403'd by NHTSA, CarComplaints, and most
// automotive forums even though the pages are perfectly accessible to
// humans. Pretending to be Chrome eliminates ~3,500 false-positive
// "dead URL" reports per 6k probed.

const PROBE_TIMEOUT_MS = 12_000;
async function probeUrl(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };
  const attempt = async (method) => {
    try {
      const r = await fetch(url, {
        method, redirect: 'follow',
        signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
        headers,
      });
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

// ────────────────────────────────────────────────────────────────────────
// Stage 1 — RESEARCHER

const RESEARCHER_PROMPT = (make, model, years, count, opts = {}) => `You are a senior automotive analyst documenting known issues for the ${years[0]}-${years[years.length-1]} ${make} ${model}. Your output drives a SEO content page that mechanics and owners will use. Accuracy matters more than coverage.
${opts.exclude ? `\nIMPORTANT — DO NOT INCLUDE these already-documented topics: ${opts.exclude}. Find DIFFERENT issues than these.\n` : ''}${opts.focus ? `\nFOCUS your research on these specific topics if applicable to this vehicle: ${opts.focus}\n` : ''}

Find ${count} REAL, DOCUMENTED known issues for this vehicle. For each, search the web to find:
- NHTSA complaints, recalls, TSBs (nhtsa.gov, transportation.gov)
- Manufacturer service bulletins (when published) and recall pages
- Major owner forums (model-specific subdomains preferred — e.g. bimmerpost.com for BMW, ih8mud.com for Land Cruiser)
- Reddit threads (r/MechanicAdvice, brand-specific subs)
- Carcomplaints.com entries (but VERIFY the URL pattern: ${make}/${model}/YYYY/category.shtml may not exist; only cite a URL if you saw it return real content in a search result)
- YouTube repair videos from established channels (only if the video genuinely covers the specific issue)

CRITICAL: DO NOT INVENT URLs. Only cite URLs you actually saw in web_search results with a non-error snippet. If you searched for sources and only found generic mentions, set citations to [] for that issue — empty is better than hallucinated. The downstream validator HEAD-checks every URL and will reject the entire draft if your URLs return 404 or never existed.

For each issue, produce:

{
  "id": "kebab-case-id-make-model-issue-keyword",
  "make": "${make}",
  "model": "${model}",
  "years": [list of affected model years, integers],
  "trims": [trim names where applicable; [] if all trims affected],
  "engines": [engine codes/displacements affected; [] if all engines affected],
  "category": "engine|transmission|drivetrain|electrical|brakes|suspension|cooling|fuel|interior|exterior|body|safety|exhaust|steering|hvac|emissions|other",
  "title": "Short specific title — the actual failure mode, not generic",
  "description": "2-4 sentences. What fails, why, what the driver experiences. Include trim/engine-specificity if relevant.",
  "solution": "2-4 sentences. Diagnostic steps, part numbers if known, cost ranges, key tips. Cite OEM service procedures or campaign numbers where known.",
  "severity": "high|medium|low",
  "confidence": "high|medium|low",
  "symptoms": [list of observable symptoms],
  "affectedSystems": [system names; can be empty],
  "dtcCodes": [VEHICLE-SPECIFIC OBD-II/manufacturer codes — DO NOT pad with generic P0300-class codes unless they're documented as the primary code for this issue],
  "estimatedCostLow": realistic low-end repair $,
  "estimatedCostHigh": realistic high-end repair $,
  "citations": [{ "type": "tsb|recall|nhtsa|forum|manual", "title": "Source page title", "url": "Live URL you saw in search results" }],
  "communityRecommendations": [{ "type": "tip|warning|part", "content": "Specific actionable advice", "upvotes": 0, "needsReview": false }],
  "typicalMileageLow": number or null,
  "typicalMileageHigh": number or null
}

Severity rubric:
- high: safety-critical (loss of brakes, sudden engine shutoff, fire risk)
- medium: costly repair or major drivability impact but not immediate safety risk
- low: nuisance, comfort, cosmetic

Confidence rubric:
- high: multiple independent sources confirm (NHTSA + TSB OR 3+ forum threads + recall)
- medium: 2+ sources but no formal recall/TSB
- low: 1-2 forum reports, niche issue

Return ONLY a JSON object: { "issues": [...] }. No markdown, no commentary, no preamble. Your first character must be '{' and your last character must be '}'. Do not write any sentences explaining what you found before or after the JSON.`;

async function callAnthropic({ prompt, max_tokens, max_searches = 5 }) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL_ID,
      max_tokens,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: max_searches }],
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(300_000),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  const textBlocks = (data.content || []).filter(c => c.type === 'text');
  const raw = textBlocks.map(b => b.text).join('\n').trim();
  // Try multiple JSON-extraction strategies — Opus follows JSON-only
  // instructions reliably but web_search reflection can add prose.
  const candidates = [
    raw,
    raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim(),
  ];
  // Strategy: find a ```json ... ``` fenced block anywhere in the text
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) candidates.push(fenceMatch[1].trim());
  // Strategy: first balanced brace span starting at the first '{'
  const firstBrace = raw.indexOf('{');
  if (firstBrace >= 0) {
    let depth = 0, inStr = false, esc = false, end = -1;
    for (let i = firstBrace; i < raw.length; i++) {
      const ch = raw[i];
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end > firstBrace) candidates.push(raw.slice(firstBrace, end + 1));
  }
  // Strategy: first '{' to LAST '}'
  const f = raw.indexOf('{'); const l = raw.lastIndexOf('}');
  if (f >= 0 && l > f) candidates.push(raw.slice(f, l + 1));
  // Helper: escape raw newlines/tabs inside JSON string literals
  function sanitizeJsonString(s) {
    let out = '';
    let inStr = false, esc = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (esc) { out += ch; esc = false; continue; }
      if (ch === '\\') { out += ch; esc = true; continue; }
      if (ch === '"') { inStr = !inStr; out += ch; continue; }
      if (inStr) {
        if (ch === '\n') { out += '\\n'; continue; }
        if (ch === '\r') { out += '\\r'; continue; }
        if (ch === '\t') { out += '\\t'; continue; }
        const code = ch.charCodeAt(0);
        if (code < 0x20) { out += `\\u${code.toString(16).padStart(4, '0')}`; continue; }
      }
      out += ch;
    }
    return out;
  }
  // Add sanitized versions of every candidate
  const allCandidates = [...candidates, ...candidates.map(sanitizeJsonString)];
  let lastErr = null;
  for (const c of allCandidates) {
    try { return JSON.parse(c); } catch (e) { lastErr = e; /* try next */ }
  }
  // Last resort: write raw to disk so we can inspect
  try {
    require('fs').writeFileSync('_anthropic-parse-fail.txt', raw);
    console.error('  Wrote failed response to _anthropic-parse-fail.txt');
  } catch {}
  throw new Error(`Parse failed (${lastErr && lastErr.message}). Raw len=${raw.length}.`);
}

async function research() {
  console.log(`\n━━━ Stage 1: Researcher (Opus 4.7 + web_search) ━━━`);
  console.log(`  Target: ${MAKE} ${MODEL}, years ${yearRange.min}-${yearRange.max}, ${COUNT} issues`);
  const prompt = RESEARCHER_PROMPT(MAKE, MODEL, yearList, COUNT, { exclude: EXCLUDE, focus: FOCUS });
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const data = await callAnthropic({ prompt, max_tokens: 16000, max_searches: 10 });
      const issues = Array.isArray(data?.issues) ? data.issues : [];
      console.log(`  Returned ${issues.length} draft issues (attempt ${attempt})\n`);
      return issues;
    } catch (err) {
      lastErr = err;
      console.log(`  ! attempt ${attempt} failed: ${err.message.slice(0, 120)}`);
      if (attempt === 1) console.log(`  Retrying...`);
    }
  }
  throw lastErr;
}

// ────────────────────────────────────────────────────────────────────────
// Stage 2 — URL VALIDATOR

async function validateUrls(draft) {
  const cits = Array.isArray(draft.citations) ? draft.citations : [];
  if (cits.length === 0) return { alive: [], dead: [] };
  const checks = await Promise.all(
    cits.filter(c => c && c.url).map(async c => {
      const r = await probeUrl(c.url);
      return { citation: c, ok: r.ok, status: r.status };
    }),
  );
  return {
    alive: checks.filter(c => c.ok).map(c => c.citation),
    dead: checks.filter(c => !c.ok).map(c => ({ ...c.citation, _status: c.status })),
  };
}

// ────────────────────────────────────────────────────────────────────────
// Stage 3 — VERIFIER

const VERIFIER_PROMPT = (issue) => `You are auditing a draft automotive issue document before publication. You have access to web_search. Verify whether the draft's specific claims (year range, DTC codes, repair cost, severity, root cause) are supported by the cited sources OR by current real-world data you can find.

DRAFT:
${JSON.stringify(issue, null, 2)}

Tasks:
1. Visit each citation URL via web_search to confirm its content supports the draft's claims.
2. Sanity-check the DTC codes: do they actually correspond to the described failure on this make/model?
3. Sanity-check the year range: is the draft's range accurate, or does it miss/include wrong years?
4. Sanity-check severity calibration.
5. Sanity-check repair cost ranges against forum/shop reports.

If the draft is correct as-is, return { "verdict": "approved", "reasons": [] }.
If small things are wrong but fixable, return { "verdict": "needs_correction", "corrected_issue": { ...full corrected JSON in same shape as the input... }, "reasons": ["what changed and why"] }.
If the issue appears fabricated or fundamentally wrong, return { "verdict": "reject", "reasons": ["specifically what's wrong"] }.

Return ONLY the JSON object. No commentary.`;

async function verify(draft) {
  const data = await callAnthropic({ prompt: VERIFIER_PROMPT(draft), max_tokens: 8000, max_searches: 5 });
  return data;
}

// ────────────────────────────────────────────────────────────────────────
// DB writer

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
      "updatedAt" = NOW()
  `;
  const today = new Date().toISOString().slice(0, 10);
  await pool.query(sql, [
    issue.id,
    issue.make,
    issue.model,
    issue.years || [],
    issue.trims || [],
    issue.engines || [],
    issue.category,
    issue.title,
    issue.description,
    issue.solution,
    issue.severity,
    issue.confidence,
    issue.symptoms || [],
    issue.affectedSystems || [],
    issue.dtcCodes || [],
    issue.estimatedCostLow ?? null,
    issue.estimatedCostHigh ?? null,
    JSON.stringify(issue.citations || []),
    JSON.stringify(issue.communityRecommendations || []),
    false, // humanApproved — gets set true on manual review only
    issue.reportCount ?? 0,
    'published',
    today,
    today,
    'ai-researched-v2', // distinguishes hardened rows from legacy ai-researched
    issue.typicalMileageLow ?? null,
    issue.typicalMileageHigh ?? null,
  ]);
}

// ────────────────────────────────────────────────────────────────────────
// Orchestrator

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Hardened Known-Issue Research`);
  console.log(`  Vehicle: ${MAKE} ${MODEL} (${yearRange.min}-${yearRange.max})`);
  console.log(`  Count:   ${COUNT}`);
  console.log(`  Model:   ${MODEL_ID}`);
  console.log(`  Dry run: ${DRY_RUN}`);
  console.log('═══════════════════════════════════════════════════════════');

  const drafts = await research();
  if (drafts.length === 0) {
    console.log('No drafts returned. Exiting.');
    await pool.end();
    return;
  }

  let saved = 0, rejectedUrls = 0, rejectedVerifier = 0, corrected = 0;
  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i];
    console.log(`\n━━━ [${i + 1}/${drafts.length}] ${draft.title?.slice(0, 70) || '(no title)'} ━━━`);

    // Stage 2 — URL validation
    process.stdout.write(`  URL validation: `);
    const { alive, dead } = await validateUrls(draft);
    console.log(`${alive.length} alive, ${dead.length} dead`);
    for (const d of dead) {
      console.log(`     DEAD [${d._status}] ${d.url}`);
    }
    for (const a of alive) {
      console.log(`     LIVE         ${a.url}`);
    }
    if (alive.length < 2) {
      console.log(`  ✗ REJECTED — fewer than 2 surviving citations after URL check (likely hallucinated)`);
      rejectedUrls++;
      continue;
    }
    draft.citations = alive;

    // Stage 3 — verifier
    process.stdout.write(`  Verifier:       `);
    let verdict;
    try {
      verdict = await verify(draft);
    } catch (err) {
      console.log(`error — ${err.message.slice(0, 120)}`);
      rejectedVerifier++;
      continue;
    }
    if (verdict.verdict === 'reject') {
      console.log(`✗ REJECTED — ${(verdict.reasons || []).join('; ').slice(0, 150)}`);
      rejectedVerifier++;
      continue;
    }
    let finalIssue = draft;
    if (verdict.verdict === 'needs_correction' && verdict.corrected_issue) {
      finalIssue = verdict.corrected_issue;
      finalIssue.citations = alive; // keep validated citations
      console.log(`~ CORRECTED — ${(verdict.reasons || []).join('; ').slice(0, 120)}`);
      corrected++;
    } else if (verdict.verdict === 'approved') {
      console.log(`✓ APPROVED`);
    } else {
      console.log(`? unknown verdict ${verdict.verdict} — skipping`);
      rejectedVerifier++;
      continue;
    }

    // Stage 4 — save
    if (DRY_RUN) {
      console.log(`  (dry run — would save id="${finalIssue.id}")`);
    } else {
      try {
        await saveIssue(finalIssue);
        console.log(`  ✓ saved`);
        saved++;
      } catch (err) {
        console.log(`  ✗ DB error: ${err.message.slice(0, 200)}`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Done`);
  console.log(`  Saved:                 ${saved}`);
  console.log(`  Corrected then saved:  ${corrected}`);
  console.log(`  Rejected (URLs dead):  ${rejectedUrls}`);
  console.log(`  Rejected (verifier):   ${rejectedVerifier}`);
  console.log('═══════════════════════════════════════════════════════════');

  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  pool.end();
  process.exit(1);
});
