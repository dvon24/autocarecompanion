/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const config = require('./volvo-hold-audit-config');
const { buildAudit } = require('./build-conservative-make-hold-audit');
const { validateAudit } = require('./validate-conservative-make-hold-audit');

const root = path.resolve(__dirname, '..');

test('covers all 180 live Volvo rows with compact byte-identical holds', () => {
  const audit = buildAudit(config);
  assert.deepEqual(audit.summary, { models: 28, rows: 180, retained: 0, held: 180, pagesPreservedPublished: 180, authorizedWriteCandidates: 0 });
  assert.equal(audit.decisions.every((row) => !('before' in row) && !('proposal' in row) && row.beforeSha256 === row.proposalSha256 && row.changedFields.length === 0), true);
  assert.deepEqual(validateAudit(config, audit), []);
});

test('pins every matcher route without authorizing metadata writes', () => {
  const audit = buildAudit(config);
  assert.equal(audit.routing.routeCount, 1254);
  assert.deepEqual(audit.routing.summary, { exact: 86, hidden: 106, 'model-wide-fail-open': 978, 'selector-unavailable': 38, 'substring-only': 46 });
  assert.equal(audit.routing.metadataWritesAuthorized, 0);
  assert.equal(audit.routing.rowSummaries.filter((row) => row.exact === 0).length, 174);
  assert.equal(audit.routing.rowSummaries.filter((row) => row.hidden > 0 && row.exact + row.substringOnly + row.modelWideFailOpen === 0).length, 0);
});

test('pins citation, owner, commerce and duplicate risk inventory', () => {
  const audit = buildAudit(config);
  assert.equal(audit.riskSignals.uncitedRowIds.length, 73);
  assert.equal(audit.riskSignals.searchOrInvalidCitationRowIds.length, 12);
  assert.equal(audit.riskSignals.literalUndefinedCitationRowIds.length, 0);
  assert.equal(audit.riskSignals.positiveOwnerCountRowIds.length, 69);
  assert.equal(audit.riskSignals.ownerClaimLanguageRowIds.length, 52);
  assert.equal(audit.riskSignals.commerceRowIds.length, 175);
  assert.equal(audit.riskSignals.exactModelTitleDuplicateClusters.length, 0);
});

test('all-status inventory separates 180 published from three archived rows', () => {
  const inventory = JSON.parse(fs.readFileSync(path.join(root, 'data/_volvo-status-inventory-2026-08-11.json'), 'utf8'));
  assert.equal(inventory.globalPublishedCount, 7642);
  assert.equal(inventory.normalizedMakeRows, 183);
  assert.deepEqual(inventory.statusCounts, { archived: 3, published: 180 });
  assert.equal(Object.values(inventory.modelCounts.published).reduce((sum, count) => sum + count, 0), 180);
  assert.equal(Object.values(inventory.modelCounts.archived).reduce((sum, count) => sum + count, 0), 3);
});

test('compact decision mutation and external inventory drift are rejected', () => {
  const audit = buildAudit(config);
  audit.decisions[0].proposalSha256 = '0'.repeat(64);
  assert.notDeepEqual(validateAudit(config, audit), []);
  const drifted = { ...config, additionalAuditReferences: [{ ...config.additionalAuditReferences[0], normalizedSha256: '0'.repeat(64) }] };
  assert.throws(() => buildAudit(drifted), /additional audit reference drifted/);
});
