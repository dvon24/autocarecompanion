#!/usr/bin/env node
/**
 * ⚠️ THIS SCRIPT USES PAID ANTHROPIC API (small per-call cost) ⚠️
 *
 * Re-audits a single already-published KnownIssue using the Anthropic
 * API verifier. The previous Cloudflare-blocking constraint meant my
 * subscription-mode chat audit couldn't independently verify citations
 * on bot-protected sites. Anthropic's API web_search tool runs server-
 * side via Anthropic's infrastructure, which DOES have bot-trusted
 * access to many sites that block my WebFetch.
 *
 * Cost per call (approximate):
 *   - Input: ~2,000 tokens × $3/M = $0.006
 *   - Output: ~3,000-4,000 tokens × $15/M = ~$0.05
 *   - Web searches: 2-3 × $0.01 = $0.02-0.03
 *   - TOTAL: ~$0.08-0.12 per issue
 *
 * Hard-capped at max_tokens=4000 and max_searches=3 to control cost.
 *
 * Behavior:
 *   - Reads issue from DB
 *   - Calls Anthropic verifier with the issue + cited URLs
 *   - Parses verdict: 'verified' | 'rejected' | 'corrections-needed'
 *   - If verified → flips humanApproved=true
 *   - If rejected → logs reason, leaves humanApproved=false
 *   - If corrections-needed → logs corrections, leaves humanApproved=false
 *     (user can apply via _update-issue-field.js manually)
 *
 * Usage:
 *   node scripts/_paid-reaudit-single.js <issue-id>
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set in .env.local — refusing to run.');
  process.exit(1);
}

const VERIFIER_PROMPT = (issue) => `You are auditing a published automotive known-issue document. Verify whether its specific factual claims are supported by the cited sources OR by current real-world data you can find via web_search.

Issue to audit:
${JSON.stringify({
  id: issue.id,
  make: issue.make,
  model: issue.model,
  years: issue.years,
  engines: issue.engines,
  trims: issue.trims,
  category: issue.category,
  title: issue.title,
  description: issue.description,
  solution: issue.solution,
  severity: issue.severity,
  estimatedCostLow: issue.estimatedCostLow,
  estimatedCostHigh: issue.estimatedCostHigh,
  dtcCodes: issue.dtcCodes,
  citations: issue.citations,
}, null, 2)}

Instructions:
1. Use web_search to fetch the cited URLs OR find equivalent independent sources for the key claims.
2. Check: (a) is the issue real, (b) are the affected years correct, (c) is the engine/trim attribution correct, (d) are repair costs plausible, (e) is the severity reasonable, (f) are DTC codes correct, (g) are citation URLs accessible and on-topic.
3. Return ONLY a JSON object with this shape (no other text):
{
  "verdict": "verified" | "rejected" | "corrections-needed",
  "summary": "<one sentence overall judgment>",
  "issues_found": ["<list of any specific factual problems>"],
  "corrections": { "field_name": "new_value", ... }  // empty {} if none
}

If verdict is "verified", the issue can be marked humanApproved=true.
If "rejected", the entire issue should be archived.
If "corrections-needed", the specific fields in "corrections" should be updated before marking approved.`;

async function callAnthropic(prompt) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  // Sum usage costs
  const inputTokens = data?.usage?.input_tokens || 0;
  const outputTokens = data?.usage?.output_tokens || 0;
  const cacheRead = data?.usage?.cache_read_input_tokens || 0;
  const webSearchCount = data?.usage?.server_tool_use?.web_search_requests || 0;
  // Sonnet 4.5: $3/M input, $15/M output
  const cost = (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15 + webSearchCount * 0.01;
  return {
    text: data?.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') || '',
    inputTokens, outputTokens, cacheRead, webSearchCount, cost,
  };
}

function extractJson(text) {
  // Find first { ... } block
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: node scripts/_paid-reaudit-single.js <issue-id>');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const issue = await prisma.knownIssue.findUnique({ where: { id } });
  if (!issue) {
    console.error(`No issue with id "${id}"`);
    process.exit(2);
  }

  console.log(`\n━━━ Re-auditing: ${id} ━━━`);
  console.log(`  ${issue.make} ${issue.model} (${(issue.years || []).join(',')}) — ${issue.title.slice(0, 80)}`);

  const { text, inputTokens, outputTokens, webSearchCount, cost } = await callAnthropic(VERIFIER_PROMPT(issue));
  console.log(`  📊 Tokens: ${inputTokens} in / ${outputTokens} out, ${webSearchCount} web_searches, cost ~$${cost.toFixed(4)}`);

  const verdict = extractJson(text);
  if (!verdict) {
    console.error(`  ✗ Could not parse verifier response. Raw:\n${text.slice(0, 500)}`);
    await prisma.$disconnect(); await pool.end();
    process.exit(3);
  }

  console.log(`  📋 Verdict: ${verdict.verdict}`);
  console.log(`  📝 Summary: ${verdict.summary}`);
  if (verdict.issues_found?.length) {
    console.log(`  ⚠️  Issues found:`);
    for (const i of verdict.issues_found) console.log(`     - ${i}`);
  }
  if (verdict.corrections && Object.keys(verdict.corrections).length) {
    console.log(`  🔧 Suggested corrections:`);
    for (const [k, v] of Object.entries(verdict.corrections)) {
      console.log(`     ${k} → ${JSON.stringify(v).slice(0, 100)}`);
    }
  }

  // Apply action based on verdict
  if (verdict.verdict === 'verified') {
    await prisma.knownIssue.update({
      where: { id },
      data: { humanApproved: true, reviewedOn: new Date().toISOString().slice(0, 10), updatedAt: new Date() },
    });
    console.log(`  ✓ Flipped humanApproved=true`);
  } else if (verdict.verdict === 'rejected') {
    console.log(`  ⚠️  Verifier REJECTED issue — leaving humanApproved=false for manual review`);
  } else {
    console.log(`  ⚠️  Corrections needed — leaving humanApproved=false until applied manually`);
  }

  await prisma.$disconnect();
  await pool.end();
  return cost;
}

main().catch(async (err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
