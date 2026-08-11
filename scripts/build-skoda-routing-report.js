/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { assertSkodaSnapshot } = require('./skoda-snapshot-contract');
const { filterableKnownIssueTrims, isApplicabilityProseTrim, knownIssueMatchesTrim, normalizeKnownIssueTrim } = require('./known-issue-trim-routing-contract');

const SNAPSHOT_FILE = 'data/_skoda-deeplink-snapshot-2026-08-11.json';
const YMMT_FILE = 'public/data/ymmt.json';
const PRODUCTION_FILTER_FILE = 'src/lib/known-issue-trim-filter.ts';
const MIRROR_FILE = 'scripts/known-issue-trim-routing-contract.js';
const OUTPUT_FILE = 'data/known-issue-skoda-routing-report-2026-08-11.json';

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
  const rows = assertSkodaSnapshot(snapshot, resolveRepo(SNAPSHOT_FILE));
  const findings = rows.map((row) => {
    const frozenTrims = clone(row.trims || []);
    const routes = row.years.flatMap((year) => (ymmt[String(year)]?.Skoda?.[row.model] || []).map((selectedTrim) => ({
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
    return {
      id: row.id,
      model: row.model,
      years: clone(row.years),
      frozenTrims,
      applicabilityProseFailOpen: frozenTrims.some(isApplicabilityProseTrim) && !filterableKnownIssueTrims(frozenTrims).length,
      routeCount: routes.length,
      exactRoutes,
      substringOnlyRoutes,
      hiddenRoutes,
      routes,
      noLegitimateSelectableTrimOverlap: noLegitimateOverlap,
      hiddenForAllSelectableTrims,
      metadataWriteAuthorized: false,
      correctionCandidate: noLegitimateOverlap ? { proposedTrims: null, requiredEvidence: 'Exact Skoda model/year/trim applicability and independent approval.', action: 'Stage separately; do not mutate content packets or indexed metadata.' } : null,
    };
  });
  const routes = findings.flatMap((finding) => finding.routes);
  const count = (classification) => routes.filter((route) => route.classification === classification).length;
  return {
    schemaVersion: 2,
    status: 'report-only',
    generatedOn: '2026-08-11',
    make: 'Skoda',
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
  const expected = { rows: 60, rowsWithFrozenTrimGate: 33, issueYearSelectableTrimRoutes: 3061, exactTrimRoutes: 491, substringOnlyRoutes: 20, hiddenRoutes: 1207, modelWideFailOpenRoutes: 1343, applicabilityProseFailOpenRoutes: 0, rowsWithSubstringOnlyRoutes: 4, noLegitimateSelectableTrimOverlap: 19, hiddenForAllSelectableTrims: 18, metadataWrites: 0 };
  if (!equal(report.summary, expected)) errors.push(`routing totals drifted: ${JSON.stringify(report.summary)}`);
  const everySubstring = report.findings.flatMap((row) => row.routes.filter((route) => route.classification === 'substring-only-route')).length;
  if (everySubstring !== report.summary?.substringOnlyRoutes) errors.push('substring-only route inventory is incomplete');
  if ((report.findings || []).some((row) => row.metadataWriteAuthorized !== false || (row.correctionCandidate && row.correctionCandidate.proposedTrims !== null))) errors.push('routing report authorizes a metadata write');
  return errors;
}

if (require.main === module) {
  const report = buildRoutingReport();
  fs.writeFileSync(resolveRepo(OUTPUT_FILE), `${JSON.stringify(report, null, 2)}\n`);
  const errors = validateRoutingReport(report);
  console.log(JSON.stringify({ output: resolveRepo(OUTPUT_FILE), summary: report.summary, valid: errors.length === 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { OUTPUT_FILE, buildRoutingReport, routeClassification, validateRoutingReport };
