/**
 * Generate social media post content from Au7o's known issues database.
 *
 * Picks a random high-engagement issue and generates:
 *   - Caption text (IG/FB optimized)
 *   - Image prompt for AI generation
 *   - Hashtags
 *   - Call-to-action with au7o.io link
 *
 * Usage:
 *   node scripts/social/generate-post.js [--type tip|alert|carousel] [--make Honda] [--dry-run]
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 30000 });
pool.on('error', () => {});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const AI_MODEL = 'claude-sonnet-4-6';
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) { console.error('Missing ANTHROPIC_API_KEY'); process.exit(1); }

const args = process.argv.slice(2);
const getArg = (name) => { const idx = args.indexOf(`--${name}`); return idx >= 0 ? args[idx + 1] : null; };
const hasFlag = (name) => args.includes(`--${name}`);

const postType = getArg('type') || 'tip';
const makeFilter = getArg('make');
const dryRun = hasFlag('dry-run');

// ─── Content Templates ──────────────────────────────────────────────────

const HASHTAG_SETS = {
  general: '#cartips #autorepair #diymechanic #carcare #au7o #knowyourcar #carmaintenance',
  make: {
    Honda: '#honda #hondanation #hondaowners #vtec',
    Toyota: '#toyota #toyotanation #toyotastrong #letsgoplaces',
    Ford: '#ford #fordnation #fordperformance #builtfordtough',
    Chevrolet: '#chevy #chevrolet #chevynation #findnewroads',
    BMW: '#bmw #bimmer #bmwlife #ultimatedrivingmachine',
    Jeep: '#jeep #jeeplife #jeepnation #itsajeepthing',
    Dodge: '#dodge #dodgenation #mopar #moparornnocar',
    RAM: '#ram #ramtrucks #ramlife',
    Nissan: '#nissan #nissannation #nissan370z',
    Hyundai: '#hyundai #hyundaiusa',
    Kia: '#kia #kianation #movementhatinspires',
    Subaru: '#subaru #subarulove #subarunation',
    Volkswagen: '#vw #volkswagen #vwlife #dasauto',
    'Mercedes-Benz': '#mercedes #mercedesbenz #amg #thebestornothing',
    Audi: '#audi #audilife #vorsprungdurchtechnik',
  },
};

function makeSlug(make, model) {
  return `${make} ${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ─── Issue Selection ────────────────────────────────────────────────────

async function selectIssue() {
  const where = {
    status: 'published',
    severity: { in: ['high', 'medium'] },
    ...(makeFilter ? { make: makeFilter } : {}),
  };

  // Get issues with good content (has solution, symptoms, cost data)
  const candidates = await prisma.knownIssue.findMany({
    where,
    select: {
      id: true, make: true, model: true, title: true, description: true,
      solution: true, severity: true, symptoms: true, years: true,
      estimatedCostLow: true, estimatedCostHigh: true, reportCount: true,
      communityRecommendations: true, category: true, source: true,
    },
    orderBy: { reportCount: 'desc' },
    take: 200,
  });

  // Filter to issues with good content
  const good = candidates.filter(c =>
    c.solution && c.solution.length > 30 &&
    c.symptoms && c.symptoms.length >= 2 &&
    c.description && c.description.length > 30
  );

  if (good.length === 0) {
    console.error('No suitable issues found');
    process.exit(1);
  }

  // Check which issues we've already posted (track in a local JSON file)
  const postedFile = path.join(__dirname, '.posted-issues.json');
  let posted = [];
  try { posted = JSON.parse(fs.readFileSync(postedFile, 'utf8')); } catch {}

  const unposted = good.filter(g => !posted.includes(g.id));
  const pool = unposted.length > 0 ? unposted : good; // Reset if we've posted everything

  // Random selection from top candidates
  return pool[Math.floor(Math.random() * Math.min(pool.length, 50))];
}

// ─── Caption Generation ─────────────────────────────────────────────────

async function generateCaption(issue, type) {
  const yearRange = `${Math.min(...issue.years)}-${Math.max(...issue.years)}`;
  const costStr = issue.estimatedCostLow
    ? `$${issue.estimatedCostLow}-$${issue.estimatedCostHigh}`
    : 'varies';
  const slug = makeSlug(issue.make, issue.model);
  const articleUrl = `https://au7o.io/known-issues/${slug}`;

  const prompts = {
    tip: `Write a short, engaging Instagram caption for this car tip post. Target audience: DIY car owners.

Issue: ${issue.make} ${issue.model} (${yearRange}) — ${issue.title}
Severity: ${issue.severity}
Description: ${issue.description}
Key symptoms: ${issue.symptoms.slice(0, 3).join(', ')}
Estimated cost: ${costStr}

Rules:
- Start with an attention-grabbing hook (question, bold statement, or emoji)
- Keep it under 150 words
- Include 1-2 specific symptoms owners should watch for
- Mention the repair cost range if available
- End with a CTA: "Full breakdown + fix guide at au7o.io (link in bio)"
- Tone: helpful, knowledgeable, not alarmist
- Do NOT use fake urgency or clickbait
- Include a line break before hashtags

Return JSON: { "caption": "...", "imagePrompt": "a brief description for generating a clean, professional social media graphic about this car issue — NO text on the image, just the car/component visual" }`,

    alert: `Write an Instagram "issue alert" caption for this known vehicle problem. Target audience: owners of this specific vehicle.

Issue: ${issue.make} ${issue.model} (${yearRange}) — ${issue.title}
Severity: ${issue.severity}
Description: ${issue.description}
Symptoms: ${issue.symptoms.join(', ')}
Solution summary: ${issue.solution?.substring(0, 200)}
Estimated cost: ${costStr}

Rules:
- Start with "Attention ${issue.make} ${issue.model} owners" or similar direct address
- Keep under 200 words
- Be specific about symptoms, years affected, and what to do
- Include the cost range
- End with "See the full repair guide at au7o.io (link in bio)"
- Professional but urgent tone for high severity, informational for medium
- Do NOT exaggerate or fear-monger

Return JSON: { "caption": "...", "imagePrompt": "..." }`,
  };

  const prompt = prompts[type] || prompts.tip;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 1500,
      system: prompt + '\n\nReturn ONLY valid JSON, no markdown fences, no prose.',
      messages: [{ role: 'user', content: `Generate social media caption for: ${issue.make} ${issue.model} — ${issue.title}` }],
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API ${res.status}`);
  }

  const data = await res.json();
  const raw = data.content?.[0]?.text || '{}';
  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const content = JSON.parse(jsonStr);
  const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

  // Add hashtags
  const makeHashtags = HASHTAG_SETS.make[issue.make] || '';
  const hashtags = `${HASHTAG_SETS.general} ${makeHashtags} #${issue.make.toLowerCase().replace(/[^a-z]/g, '')} #${issue.model.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  return {
    caption: content.caption + '\n\n' + hashtags,
    imagePrompt: content.imagePrompt || `Professional automotive photo of a ${issue.make} ${issue.model}, clean background, modern look`,
    tokens,
    articleUrl,
  };
}

// ─── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Au7o Social Post Generator ===');
  console.log(`Type: ${postType} | Make: ${makeFilter || 'any'} | Dry run: ${dryRun}\n`);

  const issue = await selectIssue();
  console.log(`Selected: ${issue.make} ${issue.model} — ${issue.title}`);
  console.log(`Severity: ${issue.severity} | Source: ${issue.source || 'ai-researched'}`);
  console.log(`Reports: ${issue.reportCount} | Years: ${Math.min(...issue.years)}-${Math.max(...issue.years)}\n`);

  const result = await generateCaption(issue, postType);

  console.log('━━━ CAPTION ━━━');
  console.log(result.caption);
  console.log('\n━━━ IMAGE PROMPT ━━━');
  console.log(result.imagePrompt);
  console.log('\n━━━ ARTICLE URL ━━━');
  console.log(result.articleUrl);
  console.log(`\nTokens used: ${result.tokens}`);

  // Save to output file
  const output = {
    issueId: issue.id,
    make: issue.make,
    model: issue.model,
    title: issue.title,
    type: postType,
    caption: result.caption,
    imagePrompt: result.imagePrompt,
    articleUrl: result.articleUrl,
    generatedAt: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `post-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));
  console.log(`\nSaved to: ${outFile}`);

  if (!dryRun) {
    // Track that we posted this issue
    const postedFile = path.join(__dirname, '.posted-issues.json');
    let posted = [];
    try { posted = JSON.parse(fs.readFileSync(postedFile, 'utf8')); } catch {}
    posted.push(issue.id);
    fs.writeFileSync(postedFile, JSON.stringify(posted));
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  prisma.$disconnect();
  pool.end();
  process.exit(1);
});
