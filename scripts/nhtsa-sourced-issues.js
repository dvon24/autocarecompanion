/**
 * Generate known issues from REAL NHTSA complaint data.
 *
 * Pipeline:
 *   1. Query NHTSA Complaints API for a make/model/year
 *   2. Group complaints by component to find patterns
 *   3. Use AI to synthesize grouped complaints into structured issues
 *   4. Include real NHTSA ODI numbers as citations
 *   5. Write to database
 *
 * Usage:
 *   node scripts/nhtsa-sourced-issues.js --make Honda --model CR-V [--years 2017-2023] [--dry-run] [--min-complaints 5]
 *   node scripts/nhtsa-sourced-issues.js --all-gaps [--min-gap 5] [--limit 20] [--dry-run]
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 30000 });
pool.on('error', () => {});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const NHTSA_API = 'https://api.nhtsa.gov/complaints/complaintsByVehicle';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const AI_MODEL = 'gpt-5.4';
const API_KEY = process.env.OPENAI_API_KEY;
const AFFILIATE_TAG = 'au7o-20';

if (!API_KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1); }

const args = process.argv.slice(2);
const getArg = (name) => { const idx = args.indexOf(`--${name}`); return idx >= 0 ? args[idx + 1] : null; };
const hasFlag = (name) => args.includes(`--${name}`);

const dryRun = hasFlag('dry-run');
const allGaps = hasFlag('all-gaps');
const minComplaints = parseInt(getArg('min-complaints') || '5', 10);
const minGap = parseInt(getArg('min-gap') || '5', 10);
const limit = parseInt(getArg('limit') || '30', 10);

// ─── NHTSA API ──────────────────────────────────────────────────────────

async function fetchNHTSAComplaints(make, model, year) {
  const url = `${NHTSA_API}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

async function fetchNHTSARecalls(make, model, year) {
  const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

async function fetchAllComplaints(make, model, years) {
  const allComplaints = [];
  // Fetch complaints for each year (NHTSA API is per-year)
  for (const year of years) {
    const complaints = await fetchNHTSAComplaints(make, model, year);
    allComplaints.push(...complaints.map(c => ({ ...c, modelYear: year })));
    // Small delay to be respectful to NHTSA API
    await new Promise(r => setTimeout(r, 300));
  }
  return allComplaints;
}

async function fetchAllRecalls(make, model, years) {
  const allRecalls = [];
  for (const year of years) {
    const recalls = await fetchNHTSARecalls(make, model, year);
    allRecalls.push(...recalls.map(r => ({ ...r, modelYear: year })));
    await new Promise(r => setTimeout(r, 300));
  }
  // Deduplicate by campaign number
  const seen = new Set();
  return allRecalls.filter(r => {
    if (seen.has(r.NHTSACampaignNumber)) return false;
    seen.add(r.NHTSACampaignNumber);
    return true;
  });
}

function groupComplaintsByComponent(complaints) {
  const groups = {};
  for (const c of complaints) {
    const components = (c.components || 'UNKNOWN').split(',').map(s => s.trim());
    for (const comp of components) {
      if (!groups[comp]) groups[comp] = [];
      groups[comp].push(c);
    }
  }
  // Sort by complaint count descending, filter to significant groups
  return Object.entries(groups)
    .filter(([, arr]) => arr.length >= minComplaints)
    .sort(([, a], [, b]) => b.length - a.length);
}

// ─── AI Synthesis ───────────────────────────────────────────────────────

async function synthesizeIssues(make, model, years, complaintGroups, recalls, existingTitles) {
  const yearRange = `${Math.min(...years)}-${Math.max(...years)}`;

  // Build complaint summary for the AI
  const groupSummaries = complaintGroups.slice(0, 10).map(([component, complaints]) => {
    const sampleSummaries = complaints.slice(0, 8).map(c =>
      `  - [ODI#${c.odiNumber}] (${c.modelYear}) ${c.summary?.substring(0, 200) || 'no description'}`
    ).join('\n');
    const crashes = complaints.filter(c => c.crash).length;
    const injuries = complaints.reduce((s, c) => s + (c.numberOfInjuries || 0), 0);
    return `### ${component} (${complaints.length} complaints${crashes ? `, ${crashes} crashes` : ''}${injuries ? `, ${injuries} injuries` : ''})\n${sampleSummaries}`;
  }).join('\n\n');

  // Build recall summary
  const recallSummary = recalls.length > 0
    ? '\n\nNHTSA RECALLS:\n' + recalls.slice(0, 15).map(r =>
        `- Campaign ${r.NHTSACampaignNumber} (${r.ModelYear}): ${r.Component} — ${(r.Summary || '').substring(0, 200)}`
      ).join('\n')
    : '';

  const prompt = `You are an automotive data analyst. Below are REAL NHTSA complaint groups and recall campaigns for the ${make} ${model} (${yearRange}).

Synthesize these into 4-8 distinct known issues. Each issue should represent a clear, documented problem pattern backed by the complaint and/or recall data.

EXISTING ISSUES TO AVOID DUPLICATING:
${existingTitles.length > 0 ? existingTitles.map(t => `- ${t}`).join('\n') : '(none)'}

COMPLAINT DATA:
${groupSummaries}
${recallSummary}

For each issue, generate:
- "title": Concise issue name (e.g. "1.5T Engine Oil Dilution")
- "category": One of: engine, transmission, electrical, suspension, brakes, cooling, fuel, exhaust, interior, exterior, hvac, steering, drivetrain, safety, body
- "severity": "high" (safety/expensive), "medium" (moderate cost/inconvenience), or "low" (cosmetic/minor)
- "confidence": "high" (many complaints, clear pattern) or "medium" (fewer complaints, less clear)
- "description": 2-3 sentences describing the problem based on the complaint data
- "solution": 2-4 sentences on diagnosis and fix with specific parts and costs
- "symptoms": Array of 3-5 specific symptoms from the complaints
- "affectedSystems": Array of affected vehicle systems
- "dtcCodes": Array of OBD-II codes mentioned in complaints (empty if none)
- "estimatedCost": { "low": number, "high": number } in USD
- "years": Array of model years most affected (from the complaint data)
- "nhtsaIds": Array of 2-4 real ODI numbers from the complaints that best represent this issue
- "complaintCount": Total number of NHTSA complaints related to this issue
- "citations": Array using REAL data from above. Mix source types:
  [{"title": "NHTSA Complaint #[odiNumber]", "url": "https://www.nhtsa.gov/vehicle", "type": "nhtsa"},
   {"title": "NHTSA Recall Campaign [number]: [description]", "url": "", "type": "recall"},
   {"title": "TSB [number]: [description]", "url": "", "type": "tsb"}]
  Use real ODI numbers and recall campaign numbers from the data above. If you know a real TSB number for this issue, include it.
- "communityRecommendations": Array of 2-3 items with at least 1 part recommendation:
  - {"type": "tip", "content": "practical advice from complaints"}
  - {"type": "part", "content": "why this part helps", "partBrand": "Dorman", "partName": "Part Name", "searchQuery": "${make} ${model} Dorman Part Name"}
  Use real brands: Dorman, Moog, Denso, NGK, Bosch, K&N, Wix, Gates, ACDelco, Continental, etc.

IMPORTANT: Only create issues where you see a clear pattern in the complaint data. Do NOT invent issues not supported by the complaints above. Use real ODI numbers from the data.

Return JSON: { "issues": [...] }`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Synthesize NHTSA complaints into known issues for ${make} ${model} (${yearRange})` },
        ],
        max_completion_tokens: 5000,
        temperature: 0.2,
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

// ─── DB Helpers ─────────────────────────────────────────────────────────

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

// ─── Gap Analysis ───────────────────────────────────────────────────────

async function findModelsWithGaps() {
  const ymmt = JSON.parse(fs.readFileSync('public/data/ymmt.json', 'utf8'));

  // Build YMMT year ranges
  const ymmtRanges = {};
  for (const [year, makes] of Object.entries(ymmt)) {
    const y = parseInt(year);
    if (y < 2000 || y > 2025) continue;
    for (const [make, models] of Object.entries(makes)) {
      for (const model of Object.keys(models)) {
        const key = `${make}|${model}`;
        if (!ymmtRanges[key]) ymmtRanges[key] = { min: y, max: y, make, model, years: [] };
        ymmtRanges[key].min = Math.min(ymmtRanges[key].min, y);
        ymmtRanges[key].max = Math.max(ymmtRanges[key].max, y);
        ymmtRanges[key].years.push(y);
      }
    }
  }

  // Get DB coverage
  const issues = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { make: true, model: true, years: true }
  });

  const dbCoverage = {};
  for (const i of issues) {
    const key = `${i.make}|${i.model}`;
    if (!dbCoverage[key]) dbCoverage[key] = new Set();
    for (const y of i.years) dbCoverage[key].add(y);
  }

  // Find gaps
  const gaps = [];
  for (const [key, ymm] of Object.entries(ymmtRanges)) {
    if (ymm.years.length < 3) continue; // Skip short-lived models
    const db = dbCoverage[key] || new Set();
    const uncovered = ymm.years.filter(y => !db.has(y));
    if (uncovered.length >= minGap) {
      gaps.push({
        make: ymm.make,
        model: ymm.model,
        allYears: ymm.years.sort((a, b) => a - b),
        uncoveredYears: uncovered.sort((a, b) => a - b),
        gapSize: uncovered.length,
      });
    }
  }

  return gaps.sort((a, b) => b.gapSize - a.gapSize).slice(0, limit);
}

// ─── Main ───────────────────────────────────────────────────────────────

async function processModel(make, model, years) {
  const yearRange = `${Math.min(...years)}-${Math.max(...years)}`;
  console.log(`\n  Fetching NHTSA complaints for ${make} ${model} (${yearRange})...`);

  // Fetch complaints and recalls in parallel batches
  const [complaints, recalls] = await Promise.all([
    fetchAllComplaints(make, model, years),
    fetchAllRecalls(make, model, years),
  ]);
  console.log(`  Found ${complaints.length} complaints, ${recalls.length} recalls`);

  if (complaints.length < minComplaints && recalls.length === 0) {
    console.log(`  Skipping — fewer than ${minComplaints} complaints and no recalls`);
    return { added: 0, tokens: 0, nhtsaComplaints: complaints.length };
  }

  // Group by component
  const groups = groupComplaintsByComponent(complaints);
  const significantGroups = groups.length;
  console.log(`  Component groups (>=${minComplaints} complaints): ${groups.map(([c, arr]) => `${c}(${arr.length})`).join(', ') || 'none'}`);

  if (groups.length === 0 && recalls.length === 0) {
    console.log(`  No significant complaint patterns or recalls found`);
    return { added: 0, tokens: 0, nhtsaComplaints: complaints.length };
  }

  // Get existing issue titles to avoid duplicates
  const existing = await prisma.knownIssue.findMany({
    where: { make, model, status: 'published' },
    select: { title: true },
  });
  const existingTitles = existing.map(e => e.title);

  if (dryRun) {
    console.log(`  DRY RUN — would synthesize ${significantGroups} complaint groups + ${recalls.length} recalls into issues`);
    return { added: 0, tokens: 0, nhtsaComplaints: complaints.length };
  }

  // Synthesize into issues using AI
  console.log(`  Synthesizing complaints + recalls into issues...`);
  const result = await synthesizeIssues(make, model, years, groups, recalls, existingTitles);

  let added = 0;
  console.log(`  AI returned ${result.issues.length} issues`);
  for (const issue of result.issues) {
    // Check for duplicate title (fuzzy — check if existing title contains or is contained by new title)
    const titleLower = issue.title.toLowerCase();
    const isDupTitle = existingTitles.some(t => {
      const tl = t.toLowerCase();
      return tl === titleLower || tl.includes(titleLower) || titleLower.includes(tl);
    });
    if (isDupTitle) {
      console.log(`  Skip similar title: ${issue.title}`);
      continue;
    }

    const id = makeSlug(make, model, issue.title);
    const existingById = await prisma.knownIssue.findUnique({ where: { id } });
    if (existingById) {
      console.log(`  Skip duplicate ID: ${id}`);
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
        reportCount: issue.complaintCount || 0,
        source: 'nhtsa-verified',
        status: 'published',
      },
    });
    added++;
    existingTitles.push(issue.title);
    console.log(`  + ${issue.title} (${issue.complaintCount || '?'} complaints, ${issue.years?.length || '?'} years)`);
  }

  return { added, tokens: result.tokens, nhtsaComplaints: complaints.length };
}

async function main() {
  console.log('=== NHTSA-Sourced Known Issues ===');
  console.log(`Min complaints per group: ${minComplaints} | Dry run: ${dryRun}`);

  let modelsToProcess = [];

  if (allGaps) {
    console.log(`Mode: Fill year gaps (min gap: ${minGap} years, limit: ${limit})`);
    modelsToProcess = await findModelsWithGaps();
    console.log(`Found ${modelsToProcess.length} models with gaps\n`);
  } else {
    const make = getArg('make');
    const model = getArg('model');
    const yearsArg = getArg('years');

    if (!make || !model) {
      console.error('Usage: --make Honda --model CR-V [--years 2017-2023]');
      console.error('   or: --all-gaps [--min-gap 5] [--limit 20]');
      process.exit(1);
    }

    let years;
    if (yearsArg) {
      const [start, end] = yearsArg.split('-').map(Number);
      years = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    } else {
      // Default: 2000-2025
      years = Array.from({ length: 26 }, (_, i) => 2000 + i);
    }

    modelsToProcess = [{ make, model, uncoveredYears: years, allYears: years }];
    console.log(`Mode: Single model — ${make} ${model}\n`);
  }

  let totalAdded = 0;
  let totalTokens = 0;
  let totalComplaints = 0;
  let errors = 0;

  for (let i = 0; i < modelsToProcess.length; i++) {
    const m = modelsToProcess[i];
    const yearsToQuery = m.uncoveredYears || m.allYears;
    console.log(`[${i + 1}/${modelsToProcess.length}] ${m.make} ${m.model} (${yearsToQuery.length} years to query)`);

    try {
      const result = await processModel(m.make, m.model, yearsToQuery);
      totalAdded += result.added;
      totalTokens += result.tokens;
      totalComplaints += result.nhtsaComplaints;
    } catch (err) {
      errors++;
      console.log(`  ERROR: ${err.message}`);
      if (err.message.includes('fetch failed') || err.message.includes('aborted')) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    // Rate limit between models
    if (i < modelsToProcess.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`NHTSA complaints fetched: ${totalComplaints.toLocaleString()}`);
  console.log(`Issues added: ${totalAdded}`);
  console.log(`AI tokens: ${totalTokens.toLocaleString()}`);
  console.log(`Errors: ${errors}`);

  const total = await prisma.knownIssue.count({ where: { status: 'published' } });
  console.log(`DB total: ${total} published issues`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  prisma.$disconnect();
  pool.end();
  process.exit(1);
});
