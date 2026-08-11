/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { reviewedArtifactFiles, sourceControlProvenance } = require('./build-subaru-make-reconciliation');
const { buildRoutingReport } = require('./build-subaru-routing-report');

test('adversarial inventory: no archived ID can masquerade as a packet row', () => {
  const root = path.resolve(__dirname, '..');
  const inventory = JSON.parse(fs.readFileSync(path.join(root, 'data/_subaru-status-inventory-2026-08-11.json'), 'utf8'));
  const archived = new Set(inventory.rows.filter((row) => row.status === 'archived').map((row) => row.id));
  const packetFiles = fs.readdirSync(path.join(root, 'data')).filter((file) => /^known-issue-subaru-.*-adjudication-2026-08-11\.json$/.test(file));
  const packetIds = packetFiles.flatMap((file) => JSON.parse(fs.readFileSync(path.join(root, 'data', file), 'utf8')).rows.map((row) => row.id));
  assert.equal(packetFiles.length, 14);
  assert.equal(packetIds.length, 205);
  assert.equal(new Set(packetIds).size, 205);
  assert.deepEqual(packetIds.filter((id) => archived.has(id)), []);
});

test('adversarial routing: every classified route is accounted for exactly once', () => {
  const report = buildRoutingReport();
  const routes = report.findings.flatMap((finding) => finding.routes);
  const classified = ['exact-trim-route', 'substring-only-route', 'hidden-route', 'model-wide-no-trim-gate', 'applicability-prose-fail-open']
    .reduce((sum, classification) => sum + routes.filter((route) => route.classification === classification).length, 0);
  assert.equal(classified, routes.length);
  assert.equal(classified, report.summary.issueYearSelectableTrimRoutes);
  assert.equal(report.findings.reduce((sum, finding) => sum + finding.years.length, 0), report.summary.issueYears);
});

test('adversarial provenance: reviewed artifact tree is Subaru-scoped and rooted at reviewed Skoda', () => {
  const files = reviewedArtifactFiles();
  const canonicalProjection = 'scripts/apply-known-issue-catalog-deeplinks.js';
  assert.ok(files.length > 20);
  assert.ok(files.every((file) => /subaru/i.test(file) || file === '.gitignore' || file === canonicalProjection));
  assert.equal(files.filter((file) => file === canonicalProjection).length, 1);
  const provenance = sourceControlProvenance();
  assert.equal(provenance.containsBaseline, true);
  assert.equal(provenance.baselineCommit, '950c28cdec60ea49df4cdd6642ba7dbb6239641a');
  assert.equal(provenance.reviewedTree.files.length, files.length);
});
