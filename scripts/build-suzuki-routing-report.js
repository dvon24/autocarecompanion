/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { assertSuzukiSnapshot } = require('./suzuki-snapshot-contract');
const { filterableKnownIssueTrims, isApplicabilityProseTrim, knownIssueMatchesTrim, normalizeKnownIssueTrim } = require('./known-issue-trim-routing-contract');

const SNAPSHOT_FILE = 'data/_suzuki-deeplink-snapshot-2026-08-11.json';
const YMMT_FILE = 'public/data/ymmt.json';
const PRODUCTION_FILTER_FILE = 'src/lib/known-issue-trim-filter.ts';
const MIRROR_FILE = 'scripts/known-issue-trim-routing-contract.js';
const OUTPUT_FILE = 'data/known-issue-suzuki-routing-report-2026-08-11.json';
const EXPECTED_SUMMARY = Object.freeze({
  rows: 18,
  rowsWithFrozenTrimGate: 12,
  issueYears: 151,
  issueYearsWithoutSelectableTrims: 0,
  rowsWithMissingSelectableTrimYears: 0,
  issueYearSelectableTrimRoutes: 877,
  exactTrimRoutes: 429,
  substringOnlyRoutes: 15,
  hiddenRoutes: 244,
  modelWideFailOpenRoutes: 189,
  applicabilityProseFailOpenRoutes: 0,
  rowsWithSubstringOnlyRoutes: 3,
  noLegitimateSelectableTrimOverlap: 0,
  hiddenForAllSelectableTrims: 0,
  metadataWrites: 0,
});

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function routeClassification(issueTrims, selectedTrim) {
  if (!issueTrims.length) return 'model-wide-no-trim-gate';
  if (issueTrims.some(isApplicabilityProseTrim) && !filterableKnownIssueTrims(issueTrims).length) return 'applicability-prose-fail-open';
  if (filterableKnownIssueTrims(issueTrims).some((trim) => normalizeKnownIssueTrim(trim) === normalizeKnownIssueTrim(selectedTrim))) return 'exact-trim-route';
  if (knownIssueMatchesTrim(issueTrims, selectedTrim)) return 'substring-only-route';
  return 'hidden-route';
}

function buildRoutingReport(snapshotOverride, ymmtOverride) {
  const snapshot = snapshotOverride || JSON.parse(fs.readFileSync(resolveRepo(SNAPSHOT_FILE), 'utf8'));
  const ymmt = ymmtOverride || JSON.parse(fs.readFileSync(resolveRepo(YMMT_FILE), 'utf8'));
  const rows = assertSuzukiSnapshot(snapshot, resolveRepo(SNAPSHOT_FILE));
  const findings = rows.map((row) => {
    const frozenTrims = clone(row.trims || []);
    const yearCoverage = row.years.map((year) => {
      const selectableTrims = clone(ymmt[String(year)]?.Suzuki?.[row.model] || []);
      return { year, selectableTrims, hasSelectableTrims: selectableTrims.length > 0 };
    });
    const routes = yearCoverage.flatMap(({ year, selectableTrims }) => selectableTrims.map((selectedTrim) => ({
        year,
        selectedTrim,
        classification: routeClassification(frozenTrims, selectedTrim),
        productionVisible: knownIssueMatchesTrim(frozenTrims, selectedTrim),
        exactNormalizedMatch: filterableKnownIssueTrims(frozenTrims).some((trim) => normalizeKnownIssueTrim(trim) === normalizeKnownIssueTrim(selectedTrim)),
      })));
    const exactRoutes = routes.filter((route) => route.classification === 'exact-trim-route');
    const substringOnlyRoutes = routes.filter((route) => route.classification === 'substring-only-route');
    const hiddenRoutes = routes.filter((route) => route.classification === 'hidden-route');
    const noLegitimateOverlap = frozenTrims.length > 0 && exactRoutes.length === 0;
    const hiddenForAllSelectableTrims = routes.length > 0 && hiddenRoutes.length === routes.length;
    const missingSelectableTrimYears = yearCoverage.filter((coverage) => !coverage.hasSelectableTrims).map((coverage) => coverage.year);
    return {
      id: row.id,
      model: row.model,
      years: clone(row.years),
      frozenTrims,
      yearCoverage,
      missingSelectableTrimYears,
      applicabilityProseFailOpen: frozenTrims.some(isApplicabilityProseTrim) && !filterableKnownIssueTrims(frozenTrims).length,
      routeCount: routes.length,
      exactRoutes,
      substringOnlyRoutes,
      hiddenRoutes,
      routes,
      noLegitimateSelectableTrimOverlap: noLegitimateOverlap,
      hiddenForAllSelectableTrims,
      metadataWriteAuthorized: false,
      ymmtWriteAuthorized: false,
      ymmtCoverageGap: missingSelectableTrimYears.length ? { years: missingSelectableTrimYears, action: 'Report separately; do not mutate YMMT or indexed issue metadata.' } : null,
      correctionCandidate: noLegitimateOverlap ? { proposedTrims: null, requiredEvidence: 'Exact Suzuki model/year/trim applicability and independent approval.', action: 'Stage separately; do not mutate content packets or indexed metadata.' } : null,
    };
  });
  const routes = findings.flatMap((finding) => finding.routes);
  const count = (classification) => routes.filter((route) => route.classification === classification).length;
  return {
    schemaVersion: 2,
    status: 'report-only',
    generatedOn: '2026-08-11',
    make: 'Suzuki',
    productionMatcher: 'Exact mirror of src/lib/known-issue-trim-filter.ts, equivalence-tested for every frozen issue/year/selectable-trim route and applicability-prose fail-open fixtures.',
    mutationAuthorized: false,
    source: {
      snapshotFile: SNAPSHOT_FILE,
      snapshotSha256: normalizedFileHash(resolveRepo(SNAPSHOT_FILE)),
      ymmtFile: YMMT_FILE,
      ymmtSha256: normalizedFileHash(resolveRepo(YMMT_FILE)),
      productionFilterFile: PRODUCTION_FILTER_FILE,
      productionFilterSha256: normalizedFileHash(resolveRepo(PRODUCTION_FILTER_FILE)),
      mirrorFile: MIRROR_FILE,
      mirrorSha256: normalizedFileHash(resolveRepo(MIRROR_FILE)),
    },
    summary: {
      rows: findings.length,
      rowsWithFrozenTrimGate: findings.filter((row) => row.frozenTrims.length > 0).length,
      issueYears: findings.reduce((sum, row) => sum + row.years.length, 0),
      issueYearsWithoutSelectableTrims: findings.reduce((sum, row) => sum + row.missingSelectableTrimYears.length, 0),
      rowsWithMissingSelectableTrimYears: findings.filter((row) => row.missingSelectableTrimYears.length).length,
      issueYearSelectableTrimRoutes: routes.length,
      exactTrimRoutes: count('exact-trim-route'),
      substringOnlyRoutes: count('substring-only-route'),
      hiddenRoutes: count('hidden-route'),
      modelWideFailOpenRoutes: count('model-wide-no-trim-gate'),
      applicabilityProseFailOpenRoutes: count('applicability-prose-fail-open'),
      rowsWithSubstringOnlyRoutes: findings.filter((row) => row.substringOnlyRoutes.length).length,
      noLegitimateSelectableTrimOverlap: findings.filter((row) => row.noLegitimateSelectableTrimOverlap).length,
      hiddenForAllSelectableTrims: findings.filter((row) => row.hiddenForAllSelectableTrims).length,
      metadataWrites: 0,
    },
    invariant: 'Content decisions and routing-metadata correction candidates are independent; this report performs no write.',
    findings,
  };
}

function validateRoutingReport(report) {
  const errors = [];
  const deterministic = buildRoutingReport();
  if (!equal(report, deterministic)) errors.push('routing report does not match deterministic snapshot/YMMT build');
  if (EXPECTED_SUMMARY && !equal(report.summary, EXPECTED_SUMMARY)) errors.push(`routing totals drifted: ${JSON.stringify(report.summary)}`);
  const everySubstring = report.findings.flatMap((row) => row.routes.filter((route) => route.classification === 'substring-only-route')).length;
  if (everySubstring !== report.summary?.substringOnlyRoutes) errors.push('substring-only route inventory is incomplete');
  if ((report.findings || []).some((row) => row.metadataWriteAuthorized !== false || row.ymmtWriteAuthorized !== false || (row.correctionCandidate && row.correctionCandidate.proposedTrims !== null))) errors.push('routing report authorizes a metadata or YMMT write');
  return errors;
}

if (require.main === module) {
  const report = buildRoutingReport();
  fs.writeFileSync(resolveRepo(OUTPUT_FILE), `${JSON.stringify(report, null, 2)}\n`);
  const errors = validateRoutingReport(report);
  console.log(JSON.stringify({ output: resolveRepo(OUTPUT_FILE), summary: report.summary, valid: errors.length === 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { EXPECTED_SUMMARY, OUTPUT_FILE, buildRoutingReport, routeClassification, validateRoutingReport };
