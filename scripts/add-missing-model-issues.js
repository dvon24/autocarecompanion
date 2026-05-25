/**
 * Add known issues for models that have ZERO issues in the DB.
 * Uses AI to research real known problems for each model.
 *
 * Usage:
 *   node scripts/add-missing-model-issues.js [--dry-run]
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 30000 });
pool.on('error', () => {});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-5.4';
const API_KEY = process.env.OPENAI_API_KEY;
const AFFILIATE_TAG = 'au7o-20';

if (!API_KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1); }

const dryRun = process.argv.includes('--dry-run');

// Models with zero issues that need coverage
const MISSING_MODELS = [
  { make: 'Infiniti', model: 'FX35', years: Array.from({ length: 10 }, (_, i) => 2003 + i) },
  { make: 'Infiniti', model: 'FX45', years: Array.from({ length: 6 }, (_, i) => 2003 + i) },
  { make: 'Infiniti', model: 'FX50', years: [2009, 2010, 2011, 2012, 2013] },
  { make: 'Infiniti', model: 'M35', years: Array.from({ length: 8 }, (_, i) => 2003 + i) },
  { make: 'Infiniti', model: 'M37', years: [2011, 2012, 2013] },
  { make: 'Infiniti', model: 'M56', years: [2011, 2012, 2013] },
  { make: 'Mercedes-Benz', model: 'SLK-Class', years: Array.from({ length: 17 }, (_, i) => 2000 + i) },
  { make: 'Mercedes-Benz', model: 'SLC', years: [2017, 2018, 2019, 2020] },
  { make: 'Renault', model: 'Twizy', years: Array.from({ length: 9 }, (_, i) => 2012 + i) },
];

function makeSlug(make, model, title) {
  return `${make}-${model}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildRecommendations(recs, make, model) {
  if (!Array.isArray(recs)) return [];
  return recs.map(rec => {
    const base = {
      type: rec.type || (rec.partBrand ? 'part' : 'tip'),
      content: rec.content || '',
      upvotes: 0,
    };
    if (base.type === 'part' && (rec.partBrand || rec.searchQuery)) {
      base.partBrand = rec.partBrand || '';
      base.partName = rec.partName || '';
      const query = rec.searchQuery || `${make} ${model} ${rec.partBrand || ''} ${rec.partName || ''}`.trim();
      base.affiliateUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
    }
    return base;
  });
}

async function researchIssues(make, model, years) {
  const yearRange = `${Math.min(...years)}-${Math.max(...years)}`;

  const prompt = `You are an automotive repair specialist. Research and document the most common known problems for the ${make} ${model} (${yearRange}).

Generate 4-6 real known issues. For each issue include:
- "title": Concise issue name (e.g. "Catalytic Converter Failure")
- "category": One of: engine, transmission, electrical, suspension, brakes, cooling, fuel, exhaust, interior, exterior, hvac, steering, drivetrain, safety, body
- "severity": "high", "medium", or "low"
- "confidence": "high" or "medium"
- "description": 2-3 sentences describing the problem, affected components, and what causes it
- "solution": 2-4 sentences explaining diagnosis and repair procedure with specific parts/costs
- "symptoms": Array of 3-5 specific symptoms
- "affectedSystems": Array of affected vehicle systems
- "dtcCodes": Array of relevant OBD-II codes (if applicable, empty array if not)
- "estimatedCost": { "low": number, "high": number } in USD
- "years": Array of specific model years affected (subset of ${yearRange})
- "citations": Array of 1-2 sources: [{"title": "descriptive title", "url": "", "type": "nhtsa"|"tsb"|"forum"}]
- "communityRecommendations": Array of 2-3 items. MUST include at least 1 "part" type:
  - {"type": "tip", "content": "practical owner advice"}
  - {"type": "part", "content": "why owners recommend this", "partBrand": "Dorman", "partName": "Control Arm", "searchQuery": "${make} ${model} Dorman Control Arm"}
  Use real aftermarket brands: Dorman, Moog, Denso, NGK, Bosch, K&N, Wix, Gates, ACDelco, Continental, etc.

Focus on REAL problems that owners actually report — NHTSA complaints, TSBs, forum discussions. Do NOT invent issues.

Return a JSON object: { "issues": [...] }`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Research known issues for ${make} ${model} (${yearRange})` },
        ],
        max_completion_tokens: 4000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    const tokens = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);
    return { issues: parsed.issues || [], tokens };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function main() {
  console.log('=== Add Issues for Missing Models ===');
  console.log(`Models to process: ${MISSING_MODELS.length} | Dry run: ${dryRun}\n`);

  let totalAdded = 0;
  let totalTokens = 0;
  let errors = 0;

  for (let m = 0; m < MISSING_MODELS.length; m++) {
    const { make, model, years } = MISSING_MODELS[m];
    const yearRange = `${Math.min(...years)}-${Math.max(...years)}`;
    process.stdout.write(`[${m + 1}/${MISSING_MODELS.length}] ${make} ${model} (${yearRange})... `);

    if (dryRun) {
      console.log('DRY RUN');
      continue;
    }

    try {
      const result = await researchIssues(make, model, years);
      let added = 0;

      for (const issue of result.issues) {
        const id = makeSlug(make, model, issue.title);

        // Check for duplicate
        const existing = await prisma.knownIssue.findUnique({ where: { id } });
        if (existing) {
          console.log(`  skip duplicate: ${id}`);
          continue;
        }

        const recs = buildRecommendations(issue.communityRecommendations, make, model);

        await prisma.knownIssue.create({
          data: {
            id,
            make,
            model,
            years: issue.years || years,
            trims: [],
            engines: [],
            category: issue.category || 'engine',
            title: issue.title,
            description: issue.description || '',
            solution: issue.solution || '',
            severity: issue.severity || 'medium',
            confidence: issue.confidence || 'medium',
            symptoms: issue.symptoms || [],
            affectedSystems: issue.affectedSystems || [],
            dtcCodes: issue.dtcCodes || [],
            estimatedCostLow: issue.estimatedCost?.low || null,
            estimatedCostHigh: issue.estimatedCost?.high || null,
            citations: issue.citations || [],
            communityRecommendations: recs,
            status: 'published',
            reportCount: 0,
          },
        });
        added++;
      }

      totalAdded += added;
      totalTokens += result.tokens;
      console.log(`${added} issues added (${result.tokens} tokens)`);

      // Rate limit
      if (m < MISSING_MODELS.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    } catch (err) {
      errors++;
      console.log(`ERROR: ${err.message}`);
      if (err.message.includes('fetch failed') || err.message.includes('aborted')) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Added: ${totalAdded} | Errors: ${errors} | Tokens: ${totalTokens.toLocaleString()}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  prisma.$disconnect();
  pool.end();
  process.exit(1);
});
