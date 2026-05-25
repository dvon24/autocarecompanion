/**
 * Backfill known issues for models with year coverage gaps.
 *
 * Identifies models where known issues don't cover the full YMMT year range
 * and uses AI to research and add issues for the missing years.
 *
 * Usage:
 *   node scripts/backfill-year-gaps.js [--make Audi] [--dry-run] [--limit 20] [--min-gap 3]
 *
 *   --make <Make>      Only process this make
 *   --dry-run          Don't write to DB, just show what would be done
 *   --limit <N>        Max models to process (default: 20)
 *   --min-gap <N>      Minimum recent gap in years to qualify (default: 3)
 *   --recent-only      Only fill recent gaps (not old gaps)
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Config ────────────────────────────────────────────────────────────

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-5.4';
const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1); }

// ─── Parse args ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const makeFilter = args.includes('--make') ? args[args.indexOf('--make') + 1] : null;
const dryRun = args.includes('--dry-run');
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : 20;
const minGap = args.includes('--min-gap') ? parseInt(args[args.indexOf('--min-gap') + 1], 10) : 3;
const recentOnly = args.includes('--recent-only');

// ─── Valid categories and severities ────────────────────────────────────

const VALID_CATEGORIES = [
  'engine', 'transmission', 'drivetrain', 'electrical', 'brakes',
  'suspension', 'cooling', 'fuel', 'interior', 'exterior', 'body', 'safety', 'other'
];
const VALID_SEVERITIES = ['high', 'medium', 'low'];

// ─── Load YMMT data ─────────────────────────────────────────────────────

const ymmtData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/ymmt.json'), 'utf-8'));

// ─── Analyze gaps ───────────────────────────────────────────────────────

async function analyzeGaps() {
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { make: true, model: true, years: true },
  });

  // Build issue year ranges per model
  const issueYears = {};
  rows.forEach(r => {
    const k = `${r.make}|${r.model}`;
    if (!issueYears[k]) issueYears[k] = { min: Infinity, max: -Infinity, count: 0, allYears: new Set() };
    r.years.forEach(y => {
      if (y < issueYears[k].min) issueYears[k].min = y;
      if (y > issueYears[k].max) issueYears[k].max = y;
      issueYears[k].allYears.add(y);
    });
    issueYears[k].count++;
  });

  // Build YMMT year ranges
  const ymmtYearsMap = {};
  Object.entries(ymmtData).forEach(([yr, makes]) => {
    Object.entries(makes).forEach(([make, models]) => {
      Object.keys(models).forEach(model => {
        const k = `${make}|${model}`;
        if (!ymmtYearsMap[k]) ymmtYearsMap[k] = { min: Infinity, max: -Infinity, years: [] };
        const y = parseInt(yr, 10);
        if (y < ymmtYearsMap[k].min) ymmtYearsMap[k].min = y;
        if (y > ymmtYearsMap[k].max) ymmtYearsMap[k].max = y;
        ymmtYearsMap[k].years.push(y);
      });
    });
  });

  // Find gaps
  const gaps = [];
  Object.keys(issueYears).forEach(k => {
    const iy = issueYears[k];
    const yy = ymmtYearsMap[k];
    if (!yy) return;

    const [make, model] = k.split('|');
    if (makeFilter && make !== makeFilter) return;

    // Clamp to 2000-2025 range as user requested
    const effectiveYmmtMin = Math.max(yy.min, 2000);
    const effectiveYmmtMax = Math.min(yy.max, 2025);

    const recentGap = effectiveYmmtMax - iy.max;
    const oldGap = iy.min - effectiveYmmtMin;

    // Determine which year ranges need issues
    const missingRanges = [];
    if (recentGap >= minGap) {
      missingRanges.push({ from: iy.max + 1, to: effectiveYmmtMax, type: 'recent' });
    }
    if (!recentOnly && oldGap >= 5) {
      missingRanges.push({ from: effectiveYmmtMin, to: iy.min - 1, type: 'old' });
    }

    if (missingRanges.length > 0) {
      gaps.push({
        make,
        model,
        issueCount: iy.count,
        issueRange: `${iy.min}-${iy.max}`,
        ymmtRange: `${effectiveYmmtMin}-${effectiveYmmtMax}`,
        recentGap: Math.max(0, recentGap),
        oldGap: Math.max(0, oldGap),
        missingRanges,
      });
    }
  });

  // Sort by recent gap descending (prioritize biggest gaps)
  gaps.sort((a, b) => b.recentGap - a.recentGap || b.oldGap - a.oldGap);
  return gaps;
}

// ─── AI Research ────────────────────────────────────────────────────────

async function researchIssues(make, model, yearFrom, yearTo, existingTitles) {
  const yearRange = yearFrom === yearTo ? `${yearFrom}` : `${yearFrom}-${yearTo}`;

  const prompt = `You are an automotive reliability researcher with deep expertise in vehicle defects, TSBs, recalls, and owner complaints.

Research the ${make} ${model} for model years ${yearRange}.

EXISTING issues already documented (DO NOT duplicate these):
${existingTitles.map(t => `- ${t}`).join('\n') || '(none)'}

Find 3-6 REAL, well-documented known issues for the ${yearRange} ${make} ${model}. These must be:
- Actual problems reported by multiple owners (not theoretical)
- Specific to this generation/year range
- Sourced from NHTSA complaints, TSBs, recalls, owner forums, or repair databases
- Different from the existing issues listed above

For each issue, provide:
1. A specific, descriptive title (e.g. "2.0T TFSI Carbon Buildup on Intake Valves" not just "Engine Problem")
2. Affected years (within ${yearRange})
3. Category (one of: engine, transmission, drivetrain, electrical, brakes, suspension, cooling, fuel, interior, exterior, body, safety)
4. Severity: high (safety risk or >$2000 repair), medium ($500-2000), low (<$500)
5. Confidence: high (TSB/recall/widespread), medium (common forum reports), low (emerging/less documented)
6. Detailed description (what happens, why, what owners experience)
7. Solution (how to diagnose and fix)
8. Common symptoms (array of strings)
9. Affected systems (array of strings)
10. Any related DTC codes
11. Estimated repair cost range (low and high in USD)
12. Typical mileage range when issue appears
13. Affected trims (empty array if all trims)
14. Affected engines (empty array if all engines)
15. 1-2 citations (forum threads, TSBs, NHTSA complaint IDs)
16. 2-4 community recommendations — MUST include at least 1-2 "part" type entries with specific brand, part name, and an Amazon search query. Format:
    - For tips: {"type": "tip", "content": "advice text"}
    - For parts: {"type": "part", "content": "why this part helps", "partBrand": "Mobil 1", "partName": "Extended Performance 0W-20", "searchQuery": "2020 Audi A3 Mobil 1 Extended Performance 0W-20"}
    Part recommendations should be specific aftermarket brands owners actually use (Mobil 1, Wix, Denso, NGK, Bosch, K&N, Dorman, Moog, ACDelco, Gates, etc.)

Respond with a JSON object:
{
  "issues": [
    {
      "title": "string",
      "years": [2020, 2021, 2022],
      "category": "engine",
      "severity": "medium",
      "confidence": "medium",
      "description": "string (2-4 sentences)",
      "solution": "string (2-4 sentences)",
      "symptoms": ["string"],
      "affectedSystems": ["string"],
      "dtcCodes": [],
      "estimatedCostLow": 500,
      "estimatedCostHigh": 1500,
      "typicalMileageLow": 30000,
      "typicalMileageHigh": 80000,
      "trims": [],
      "engines": [],
      "citations": [{"title": "string", "url": "string", "type": "forum|tsb|recall|nhtsa"}],
      "communityRecommendations": [
        {"type": "tip", "content": "string"},
        {"type": "part", "content": "string", "partBrand": "string", "partName": "string", "searchQuery": "string"}
      ]
    }
  ]
}

Return ONLY valid JSON. Be accurate — wrong information destroys trust.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Research known issues for the ${yearRange} ${make} ${model}. Focus on real, documented problems.` },
        ],
        max_completion_tokens: 6000,
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
    const usage = data.usage;
    const tokens = (usage?.prompt_tokens || 0) + (usage?.completion_tokens || 0);

    if (!parsed.issues || !Array.isArray(parsed.issues)) {
      throw new Error('Invalid AI response — no issues array');
    }

    return { issues: parsed.issues, tokens };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ─── Generate Issue ID ──────────────────────────────────────────────────

function generateIssueId(make, model, title, years) {
  const slug = [make, model, ...title.split(/\s+/).slice(0, 4)]
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .substring(0, 60);
  const minYear = Math.min(...years);
  return `${slug}-${minYear}`;
}

// ─── Build Recommendations with Affiliate Links ────────────────────────

const AFFILIATE_TAG = 'au7o-20';

function buildRecommendations(recs, make, model) {
  if (!Array.isArray(recs) || recs.length === 0) return [];

  return recs.map(rec => {
    const base = {
      type: rec.type || (rec.partBrand ? 'part' : 'tip'),
      content: rec.content || '',
      upvotes: 0,
    };

    if (base.type === 'part' && (rec.partBrand || rec.partName || rec.searchQuery)) {
      base.partBrand = rec.partBrand || '';
      base.partName = rec.partName || '';
      // Build Amazon affiliate URL from search query
      const query = rec.searchQuery || `${make} ${model} ${rec.partBrand || ''} ${rec.partName || ''}`.trim();
      base.affiliateUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
    }

    return base;
  });
}

// ─── Save Issues to DB ──────────────────────────────────────────────────

async function saveIssues(make, model, issues) {
  let saved = 0;
  let skipped = 0;

  for (const issue of issues) {
    // Validate
    if (!issue.title || !issue.years || !Array.isArray(issue.years) || issue.years.length === 0) {
      skipped++;
      continue;
    }

    const category = VALID_CATEGORIES.includes(issue.category) ? issue.category : 'other';
    const severity = VALID_SEVERITIES.includes(issue.severity) ? issue.severity : 'medium';
    const confidence = ['high', 'medium', 'low'].includes(issue.confidence) ? issue.confidence : 'medium';

    const id = generateIssueId(make, model, issue.title, issue.years);

    // Check if ID already exists
    const existing = await prisma.knownIssue.findUnique({ where: { id } });
    if (existing) {
      skipped++;
      continue;
    }

    try {
      await prisma.knownIssue.create({
        data: {
          id,
          make,
          model,
          years: issue.years.filter(y => typeof y === 'number' && y >= 1990 && y <= 2026),
          trims: Array.isArray(issue.trims) ? issue.trims : [],
          engines: Array.isArray(issue.engines) ? issue.engines : [],
          category,
          title: issue.title,
          description: issue.description || '',
          solution: issue.solution || '',
          severity,
          confidence,
          symptoms: Array.isArray(issue.symptoms) ? issue.symptoms : [],
          affectedSystems: Array.isArray(issue.affectedSystems) ? issue.affectedSystems : [],
          dtcCodes: Array.isArray(issue.dtcCodes) ? issue.dtcCodes : [],
          estimatedCostLow: typeof issue.estimatedCostLow === 'number' ? issue.estimatedCostLow : null,
          estimatedCostHigh: typeof issue.estimatedCostHigh === 'number' ? issue.estimatedCostHigh : null,
          typicalMileageLow: typeof issue.typicalMileageLow === 'number' ? issue.typicalMileageLow : null,
          typicalMileageHigh: typeof issue.typicalMileageHigh === 'number' ? issue.typicalMileageHigh : null,
          citations: Array.isArray(issue.citations) ? issue.citations : [],
          communityRecommendations: buildRecommendations(issue.communityRecommendations, make, model),
          humanApproved: false,
          reportCount: 0,
          status: 'published',
        },
      });
      saved++;
    } catch (err) {
      if (err.code === 'P2002') {
        skipped++; // Duplicate ID
      } else {
        console.error(`    Error saving "${issue.title}":`, err.message);
        skipped++;
      }
    }
  }

  return { saved, skipped };
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Known Issues Year Gap Backfill ===');
  console.log(`Model: ${MODEL}`);
  console.log(`Make filter: ${makeFilter || 'all'}`);
  console.log(`Min gap: ${minGap} years`);
  console.log(`Recent only: ${recentOnly}`);
  console.log(`Limit: ${limit}`);
  console.log(`Dry run: ${dryRun}\n`);

  const gaps = await analyzeGaps();
  console.log(`Models with gaps: ${gaps.length}`);

  const toProcess = gaps.slice(0, limit);
  console.log(`Processing: ${toProcess.length}\n`);

  if (toProcess.length === 0) {
    console.log('Nothing to do!');
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  let totalIssuesAdded = 0;
  let totalTokens = 0;
  let errors = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const gap = toProcess[i];
    const { make, model, missingRanges, issueRange, ymmtRange } = gap;

    // Get existing issue titles to avoid duplicates
    const existingIssues = await prisma.knownIssue.findMany({
      where: { make, model, status: 'published' },
      select: { title: true },
    });
    const existingTitles = existingIssues.map(i => i.title);

    for (const range of missingRanges) {
      const rangeStr = range.from === range.to ? `${range.from}` : `${range.from}-${range.to}`;
      process.stdout.write(
        `[${i + 1}/${toProcess.length}] ${make} ${model} (${range.type} gap: ${rangeStr}, current: ${issueRange}, ymmt: ${ymmtRange})... `
      );

      if (dryRun) {
        console.log('DRY RUN — would research issues');
        continue;
      }

      try {
        const { issues, tokens } = await researchIssues(make, model, range.from, range.to, existingTitles);
        totalTokens += tokens;

        const { saved, skipped } = await saveIssues(make, model, issues);
        totalIssuesAdded += saved;

        // Add newly saved titles to avoid duplication in next range
        issues.forEach(iss => existingTitles.push(iss.title));

        console.log(`${saved} added, ${skipped} skipped (${tokens} tokens)`);

        // Rate limit
        if (i < toProcess.length - 1 || missingRanges.indexOf(range) < missingRanges.length - 1) {
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
  }

  console.log(`\n=== Done ===`);
  console.log(`Issues added: ${totalIssuesAdded}`);
  console.log(`Total tokens: ${totalTokens.toLocaleString()}`);
  console.log(`Errors: ${errors}`);

  // Show updated DB stats
  const total = await prisma.knownIssue.count({ where: { status: 'published' } });
  const models = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    distinct: ['make', 'model'],
    select: { make: true, model: true },
  });
  console.log(`\nDB total: ${total} issues across ${models.length} models`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  prisma.$disconnect();
  pool.end();
  process.exit(1);
});
