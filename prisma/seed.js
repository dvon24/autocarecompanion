require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// --- Normalization ---

const validCategories = ['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','other'];
const categoryMap = {
  'steering': 'suspension', 'Steering': 'suspension',
  'hvac': 'cooling', 'Climate Control': 'cooling',
  'fuel_system': 'fuel', 'Fuel System': 'fuel',
  'exhaust': 'engine', 'emissions': 'engine',
};

function normalizeCategory(cat) {
  if (!cat) return 'other';
  const lower = cat.toLowerCase();
  if (validCategories.includes(lower)) return lower;
  if (categoryMap[cat]) return categoryMap[cat];
  return 'other';
}

function normalizeSeverity(sev) {
  if (!sev) return 'medium';
  const lower = sev.toLowerCase();
  if (lower === 'critical' || lower === 'high') return 'high';
  if (lower === 'moderate' || lower === 'medium') return 'medium';
  if (lower === 'low') return 'low';
  return 'medium';
}

function normalizeConfidence(conf) {
  if (conf === undefined || conf === null) return 'medium';
  if (typeof conf === 'number') {
    if (conf >= 85) return 'high';
    if (conf >= 60) return 'medium';
    return 'low';
  }
  const lower = String(conf).toLowerCase();
  if (lower === 'high') return 'high';
  if (lower === 'low') return 'low';
  return 'medium';
}

function normalizeStatus(s) {
  if (!s || s === 'active') return 'published';
  return s;
}

// --- Setup ---

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedKnownIssues() {
  const dataPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const issues = raw.issues;

  console.log(`Seeding ${issues.length} known issues...`);

  // Clear existing data first for clean seed
  await prisma.knownIssue.deleteMany({});
  console.log('  Cleared existing rows.');

  let processed = 0;
  let errors = 0;

  for (const issue of issues) {
    const isLegacy = !!issue.vehicleMatch;

    const make = isLegacy ? issue.vehicleMatch.make : issue.make;
    const model = isLegacy ? issue.vehicleMatch.model : issue.model;

    let years;
    if (isLegacy) {
      years = issue.vehicleMatch.years || [];
    } else {
      years = [];
      const yr = issue.years;
      for (let y = yr.start; y <= yr.end; y++) years.push(y);
    }

    const trims = isLegacy
      ? (issue.vehicleMatch.trims || [])
      : (issue.trims || []);
    const engines = isLegacy
      ? (issue.vehicleMatch.engines || [])
      : (issue.engines || []);

    const ec = issue.estimatedCost;
    const costLow = ec ? (ec.low !== undefined ? ec.low : (ec.min !== undefined ? ec.min : null)) : null;
    const costHigh = ec ? (ec.high !== undefined ? ec.high : (ec.max !== undefined ? ec.max : null)) : null;

    try {
      await prisma.knownIssue.create({
        data: {
          id: issue.id,
          make,
          model,
          years,
          trims,
          engines,
          category: normalizeCategory(issue.category),
          title: issue.title,
          description: issue.description || '',
          solution: issue.solution || '',
          severity: normalizeSeverity(issue.severity),
          confidence: normalizeConfidence(issue.confidence),
          symptoms: issue.symptoms || [],
          affectedSystems: issue.affectedSystems || [],
          dtcCodes: (issue.dtcCodes || []).map(c => c.toUpperCase()),
          estimatedCostLow: costLow,
          estimatedCostHigh: costHigh,
          citations: issue.citations || [],
          communityRecommendations: issue.communityRecommendations || [],
          humanApproved: issue.humanApproved === true,
          reportCount: issue.reportCount || 0,
          status: normalizeStatus(issue.status),
          lastReportedByOwners: issue.lastReportedByOwners || issue.reviewedOn || '',
          reviewedOn: issue.reviewedOn || '',
        }
      });
      processed++;
    } catch (e) {
      errors++;
      if (errors <= 5) {
        console.error(`  Error on ${issue.id}: ${e.message.slice(0, 150)}`);
      }
    }

    if (processed % 500 === 0) {
      console.log(`  ${processed}/${issues.length} issues seeded...`);
    }
  }

  console.log(`Done: ${processed} issues seeded, ${errors} errors.`);
}

async function seedDTCCodes() {
  const dataPath = path.join(__dirname, '..', 'src', 'data', 'dtc-codes.json');
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const entries = Object.entries(raw);

  console.log(`Seeding ${entries.length} DTC codes...`);

  await prisma.dTCCode.deleteMany({});

  let processed = 0;
  for (const [code, info] of entries) {
    await prisma.dTCCode.create({
      data: {
        code: code.toUpperCase(),
        name: info.name,
        system: info.system,
        description: info.description,
        commonCauses: info.commonCauses || [],
        severity: normalizeSeverity(info.severity),
      }
    });
    processed++;
  }

  console.log(`Done: ${processed} DTC codes seeded.`);
}

async function verify() {
  const issueCount = await prisma.knownIssue.count();
  const dtcCount = await prisma.dTCCode.count();
  const severities = await prisma.knownIssue.groupBy({ by: ['severity'], _count: true });
  const statuses = await prisma.knownIssue.groupBy({ by: ['status'], _count: true });

  console.log('\n--- Verification ---');
  console.log(`KnownIssue rows: ${issueCount}`);
  console.log(`DTCCode rows: ${dtcCount}`);
  console.log('Severities:', severities.map(s => `${s.severity}: ${s._count}`).join(', '));
  console.log('Statuses:', statuses.map(s => `${s.status}: ${s._count}`).join(', '));
}

async function main() {
  console.log('Starting database seed...\n');
  await seedKnownIssues();
  console.log('');
  await seedDTCCodes();
  await verify();
  console.log('\nSeed complete!');
}

main()
  .catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
