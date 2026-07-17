#!/usr/bin/env node

/**
 * Compare every published KnownIssue model-year with the homepage YMMT data.
 *
 * Default mode is read-only and writes a grouped report. `--apply-verified`
 * first applies only the reviewed additions in data/known-issue-ymmt-policy.json.
 * Ambiguous rows never mutate YMMT; they remain in `needsReview`.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const YMMT_PATH = path.join(ROOT, 'public', 'data', 'ymmt.json');
const POLICY_PATH = path.join(ROOT, 'data', 'known-issue-ymmt-policy.json');
const DEFAULT_REPORT_PATH = path.join(
  ROOT,
  'data',
  'known-issue-ymmt-coverage-report.json',
);

const normalize = (value) =>
  String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const inRanges = (year, ranges) =>
  ranges.some(([from, to]) => year >= from && year <= to);

function findYmmtVehicle(ymmt, year, make, model) {
  const yearData = ymmt[String(year)];
  if (!yearData) return null;
  const makeName = Object.keys(yearData).find(
    (candidate) => normalize(candidate) === normalize(make),
  );
  if (!makeName) return null;
  const modelName = Object.keys(yearData[makeName]).find(
    (candidate) => normalize(candidate) === normalize(model),
  );
  return modelName ? { make: makeName, model: modelName } : null;
}

function findAlias(policy, make, model, year) {
  return policy.aliases.find(
    (alias) =>
      normalize(alias.knownIssue.make) === normalize(make) &&
      normalize(alias.knownIssue.model) === normalize(model) &&
      inRanges(year, alias.yearRanges),
  );
}

function uniquePublishedModelYears(rows) {
  const records = new Map();
  for (const row of rows) {
    for (const year of row.years || []) {
      const key = `${normalize(row.make)}|${normalize(row.model)}|${year}`;
      if (!records.has(key)) {
        records.set(key, { make: row.make, model: row.model, year });
      }
    }
  }
  return [...records.values()].sort(
    (a, b) =>
      a.make.localeCompare(b.make) ||
      a.model.localeCompare(b.model) ||
      a.year - b.year,
  );
}

function groupRecords(records) {
  const grouped = new Map();
  for (const record of records) {
    const key = `${record.make}|${record.model}|${record.reason || ''}`;
    const existing = grouped.get(key) || {
      make: record.make,
      model: record.model,
      years: [],
      ...(record.reason ? { reason: record.reason } : {}),
      ...(record.selector ? { selector: record.selector } : {}),
    };
    existing.years.push(record.year);
    grouped.set(key, existing);
  }
  return [...grouped.values()].map((record) => ({
    ...record,
    years: [...new Set(record.years)].sort((a, b) => a - b),
  }));
}

function auditCoverage({ rows, ymmt, policy, maximumSupportedYear }) {
  const modelYears = uniquePublishedModelYears(rows);
  const exact = [];
  const aliased = [];
  const unsupported = [];
  const needsReview = [];

  for (const record of modelYears) {
    if (
      record.year < policy.minimumSupportedYear ||
      record.year > maximumSupportedYear
    ) {
      unsupported.push({
        ...record,
        reason: `outside selector range ${policy.minimumSupportedYear}-${maximumSupportedYear}`,
      });
      continue;
    }

    if (findYmmtVehicle(ymmt, record.year, record.make, record.model)) {
      exact.push(record);
      continue;
    }

    const alias = findAlias(policy, record.make, record.model, record.year);
    if (alias) {
      const target = findYmmtVehicle(
        ymmt,
        record.year,
        alias.selector.make,
        alias.selector.model,
      );
      if (target) {
        aliased.push({ ...record, selector: target });
        continue;
      }
      needsReview.push({
        ...record,
        reason: `approved alias target missing: ${alias.selector.make} ${alias.selector.model}`,
      });
      continue;
    }

    needsReview.push({
      ...record,
      reason: 'no exact selector entry or approved naming alias',
    });
  }

  return {
    summary: {
      publishedRows: rows.length,
      uniquePublishedModelYears: modelYears.length,
      exact: exact.length,
      aliased: aliased.length,
      unsupported: unsupported.length,
      needsReview: needsReview.length,
    },
    aliasesApplied: groupRecords(aliased),
    unsupported: groupRecords(unsupported),
    needsReview: groupRecords(needsReview),
  };
}

function applyVerifiedAdditions(ymmt, policy) {
  let added = 0;
  let updated = 0;
  for (const entry of policy.verifiedAdditions) {
    for (const year of entry.years) {
      const yearKey = String(year);
      ymmt[yearKey] ||= {};
      ymmt[yearKey][entry.make] ||= {};
      const existing = ymmt[yearKey][entry.make][entry.model];
      if (!existing) {
        ymmt[yearKey][entry.make][entry.model] = [...entry.trims];
        added += 1;
        continue;
      }
      const merged = [...new Set([...existing, ...entry.trims])];
      if (merged.length !== existing.length) {
        ymmt[yearKey][entry.make][entry.model] = merged;
        updated += 1;
      }
    }
  }
  return { added, updated };
}

async function loadPublishedRows() {
  require('dotenv').config({ path: path.join(ROOT, '.env.local') });
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { PrismaClient } = require('@prisma/client');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    return await prisma.knownIssue.findMany({
      where: { status: 'published' },
      select: { make: true, model: true, years: true },
    });
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function main() {
  const ymmt = JSON.parse(fs.readFileSync(YMMT_PATH, 'utf8'));
  const policy = JSON.parse(fs.readFileSync(POLICY_PATH, 'utf8'));

  if (process.argv.includes('--apply-verified')) {
    const result = applyVerifiedAdditions(ymmt, policy);
    fs.writeFileSync(YMMT_PATH, `${JSON.stringify(ymmt, null, 2)}\n`);
    console.log(`Verified YMMT additions: ${result.added} added, ${result.updated} updated.`);
  }

  if (process.argv.includes('--apply-only')) return;

  const rows = await loadPublishedRows();
  const maximumSupportedYear = new Date().getUTCFullYear() + 1;
  const audit = auditCoverage({ rows, ymmt, policy, maximumSupportedYear });
  const report = {
    generatedAt: new Date().toISOString(),
    maximumSupportedYear,
    ...audit,
  };
  const reportPath = path.resolve(argValue('--report') || DEFAULT_REPORT_PATH);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report.summary));
  console.log(`Report: ${path.relative(ROOT, reportPath)}`);

  if (process.argv.includes('--strict') && report.summary.needsReview > 0) {
    process.exitCode = 1;
  }
}

module.exports = {
  applyVerifiedAdditions,
  auditCoverage,
  findYmmtVehicle,
  uniquePublishedModelYears,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
