/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const config = require('./toyota-hold-audit-config');
const { buildAudit } = require('./build-conservative-make-hold-audit');
const { validateAudit } = require('./validate-conservative-make-hold-audit');

const root = path.resolve(__dirname, '..');

test('covers all 547 live Toyota rows with compact byte-identical holds', () => {
  const audit = buildAudit(config);
  assert.deepEqual(audit.summary, { models: 39, rows: 547, retained: 0, held: 547, pagesPreservedPublished: 547, authorizedWriteCandidates: 0 });
  assert.equal(audit.decisionEncoding, 'snapshot-full-record-hashes');
  assert.equal(audit.decisions.every((row) => !('before' in row) && !('proposal' in row) && row.beforeSha256 === row.proposalSha256 && row.changedFields.length === 0), true);
  assert.deepEqual(validateAudit(config, audit), []);
});

test('pins the routing and risk-signal inventory without authorizing metadata changes', () => {
  const audit = buildAudit(config);
  assert.equal(audit.routing.routeCount, 6635);
  assert.deepEqual(audit.routing.summary, { exact: 2309, hidden: 784, 'model-wide-fail-open': 2532, 'selector-unavailable': 168, 'substring-only': 842 });
  assert.equal(audit.routing.metadataWritesAuthorized, 0);
  assert.equal(audit.riskSignals.uncitedRowIds.length, 80);
  assert.equal(audit.riskSignals.searchOrInvalidCitationRowIds.length, 30);
  assert.equal(audit.riskSignals.applicabilityProseTrimRowIds.length, 5);
  assert.equal(audit.riskSignals.positiveOwnerCountRowIds.length, 114);
  assert.equal(audit.riskSignals.exactModelTitleDuplicateClusters.length, 0);
});

test('all-status freeze separates live catalog from archived history', () => {
  const inventory = JSON.parse(fs.readFileSync(path.join(root, 'data/_toyota-status-inventory-2026-08-11.json'), 'utf8'));
  assert.equal(inventory.globalPublishedCount, 7642);
  assert.equal(inventory.normalizedMakeRows, 654);
  assert.deepEqual(inventory.statusCounts, { archived: 107, published: 547 });
  assert.equal(Object.values(inventory.modelCounts.published).reduce((sum, count) => sum + count, 0), 547);
  assert.equal(Object.values(inventory.modelCounts.archived).reduce((sum, count) => sum + count, 0), 107);
});

test('reviewed restoration ledger reconciles and live verification covers all 32 rewrite candidates', () => {
  const adjudication = JSON.parse(fs.readFileSync(path.join(root, 'data/known-issue-toyota-adjudication-2026-08-05.json'), 'utf8'));
  assert.deepEqual(adjudication.summary, { keep_replacement: 2, rewrite_then_publish: 32, archive_as_duplicate: 7, keep_archived: 50, total: 91 });
  const verification = JSON.parse(fs.readFileSync(path.join(root, 'data/known-issue-toyota-rewrite-live-verification-2026-08-11.json'), 'utf8'));
  assert.equal(verification.passed, true);
  assert.equal(verification.proposalCount, 32);
  assert.equal(verification.productionRowCount, 32);
  assert.deepEqual(verification.mismatches, []);
});

test('compact decision mutation and reference drift are rejected', () => {
  const audit = buildAudit(config);
  audit.decisions[0].proposalSha256 = '0'.repeat(64);
  assert.notDeepEqual(validateAudit(config, audit), []);
  const drifted = { ...config, additionalAuditReferences: [{ ...config.additionalAuditReferences[0], normalizedSha256: '0'.repeat(64) }] };
  assert.throws(() => buildAudit(drifted), /additional audit reference drifted/);
});
