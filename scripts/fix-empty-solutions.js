/**
 * Fix issues with empty solutions and missing citations.
 * Uses AI to generate proper solutions and find relevant sources.
 *
 * Usage:
 *   node scripts/fix-empty-solutions.js [--limit 50] [--dry-run] [--citations-only]
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-5.4';
const API_KEY = process.env.OPENAI_API_KEY;
const AFFILIATE_TAG = 'au7o-20';

if (!API_KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1); }

const args = process.argv.slice(2);
const limitArg = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : 50;
const dryRun = args.includes('--dry-run');
const citationsOnly = args.includes('--citations-only');

async function fixIssue(issue) {
  const needsSolution = !issue.solution || issue.solution.trim().length < 20;
  const needsCitations = !Array.isArray(issue.citations) || issue.citations.length === 0 || issue.citations === '[]';
  const needsRecs = !Array.isArray(issue.communityRecommendations) || issue.communityRecommendations.length === 0;

  if (citationsOnly && !needsCitations) return null;
  if (!needsSolution && !needsCitations && !needsRecs) return null;

  const parts = [];
  if (needsSolution) parts.push('solution');
  if (needsCitations) parts.push('citations');
  if (needsRecs) parts.push('recommendations');

  const yearRange = issue.years.length > 0 ? `${Math.min(...issue.years)}-${Math.max(...issue.years)}` : 'unknown years';

  const prompt = `You are an automotive repair specialist. Fix the missing data for this known vehicle issue.

Vehicle: ${issue.make} ${issue.model} (${yearRange})
Issue Title: ${issue.title}
Category: ${issue.category}
Severity: ${issue.severity}
Description: ${issue.description}
${issue.solution ? `Current Solution: ${issue.solution}` : 'Solution: MISSING - needs to be written'}
Symptoms: ${(issue.symptoms || []).join(', ') || 'none listed'}

Generate the following MISSING fields:

${needsSolution ? `1. "solution": A detailed 2-4 sentence solution explaining how to diagnose and fix this issue. Be specific about parts, procedures, and costs.` : ''}

${needsCitations ? `2. "citations": Array of 1-2 real sources. Use formats like:
   - {"title": "NHTSA Complaint #12345678", "url": "https://www.nhtsa.gov/vehicle/...", "type": "nhtsa"}
   - {"title": "TSB XX-XXX-XX: [Description]", "url": "", "type": "tsb"}
   - {"title": "[Forum Name] - [Thread Title]", "url": "https://...", "type": "forum"}
   Use real TSB numbers and NHTSA complaint patterns for this vehicle. If you don't know the exact URL, leave url empty but include a descriptive title.` : ''}

${needsRecs ? `3. "communityRecommendations": Array of 2-3 items. Include at least 1 "part" type with a specific brand owners use:
   - {"type": "tip", "content": "practical advice"}
   - {"type": "part", "content": "why this part helps", "partBrand": "Dorman", "partName": "Control Arm Assembly", "searchQuery": "${issue.make} ${issue.model} Dorman Control Arm"}
   Use real aftermarket brands: Dorman, Moog, Denso, NGK, Bosch, K&N, Wix, Fram, Gates, ACDelco, Mobil 1, etc.` : ''}

Respond with a JSON object containing ONLY the fields listed above. Return ONLY valid JSON.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

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
          { role: 'user', content: `Fix the missing data for: ${issue.make} ${issue.model} - ${issue.title}` },
        ],
        max_completion_tokens: 2000,
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

    // Build update object
    const update = {};

    if (needsSolution && parsed.solution && parsed.solution.length > 20) {
      update.solution = parsed.solution;
    }

    if (needsCitations && Array.isArray(parsed.citations) && parsed.citations.length > 0) {
      update.citations = parsed.citations.map(c => ({
        title: c.title || '',
        url: c.url || '',
        type: c.type || 'forum',
      }));
    }

    if (needsRecs && Array.isArray(parsed.communityRecommendations) && parsed.communityRecommendations.length > 0) {
      update.communityRecommendations = parsed.communityRecommendations.map(rec => {
        const base = {
          type: rec.type || (rec.partBrand ? 'part' : 'tip'),
          content: rec.content || '',
          upvotes: 0,
        };
        if (base.type === 'part' && (rec.partBrand || rec.searchQuery)) {
          base.partBrand = rec.partBrand || '';
          base.partName = rec.partName || '';
          const query = rec.searchQuery || `${issue.make} ${issue.model} ${rec.partBrand || ''} ${rec.partName || ''}`.trim();
          base.affiliateUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
        }
        return base;
      });
    }

    return { update, tokens, parts };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function main() {
  console.log('=== Fix Empty Solutions & Citations ===');
  console.log(`Limit: ${limitArg} | Dry run: ${dryRun} | Citations only: ${citationsOnly}\n`);

  // Find issues needing fixes
  const allIssues = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: {
      id: true, make: true, model: true, title: true, category: true,
      severity: true, description: true, solution: true, symptoms: true,
      years: true, citations: true, communityRecommendations: true,
    },
  });

  const needsFix = allIssues.filter(i => {
    const needsSolution = !i.solution || i.solution.trim().length < 20;
    const needsCitations = !Array.isArray(i.citations) || i.citations.length === 0 || i.citations === '[]';
    const needsRecs = !Array.isArray(i.communityRecommendations) || i.communityRecommendations.length === 0;
    if (citationsOnly) return needsCitations;
    return needsSolution || needsCitations || needsRecs;
  });

  console.log(`Issues needing fixes: ${needsFix.length}`);
  const toProcess = needsFix.slice(0, limitArg);
  console.log(`Processing: ${toProcess.length}\n`);

  let fixed = 0;
  let totalTokens = 0;
  let errors = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const issue = toProcess[i];
    process.stdout.write(`[${i + 1}/${toProcess.length}] ${issue.make} ${issue.model}: ${issue.title.substring(0, 50)}... `);

    if (dryRun) {
      console.log('DRY RUN');
      continue;
    }

    try {
      const result = await fixIssue(issue);
      if (!result || Object.keys(result.update).length === 0) {
        console.log('no changes needed');
        continue;
      }

      await prisma.knownIssue.update({
        where: { id: issue.id },
        data: result.update,
      });

      totalTokens += result.tokens;
      fixed++;
      console.log(`fixed ${result.parts.join(', ')} (${result.tokens} tokens)`);

      if (i < toProcess.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
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
  console.log(`Fixed: ${fixed} | Errors: ${errors} | Tokens: ${totalTokens.toLocaleString()}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  prisma.$disconnect();
  pool.end();
  process.exit(1);
});
