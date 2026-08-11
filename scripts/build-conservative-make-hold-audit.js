/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  FULL_RECORD_FIELDS,
  clone,
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
  stableValue,
} = require('./known-issue-adjudication-utils');
const { filterableKnownIssueTrims, knownIssueMatchesTrim, normalizeKnownIssueTrim } = require('./known-issue-trim-routing-contract');

const ACTION = 'hold_indexed_identity_byte_identical_pending_identity_policy';
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function normalizeMake(value) { return String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').trim().toLowerCase(); }
function sortedObject(value) { return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))); }

function assertSnapshot(config, snapshot) {
  const absolute = resolveRepo(config.snapshotFile);
  if (normalizedFileHash(absolute) !== config.snapshotNormalizedSha256) throw new Error(`${config.make} snapshot normalized hash drifted`);
  if (snapshot.snapshotHash !== config.snapshotInternalHash) throw new Error(`${config.make} snapshot internal hash drifted`);
  if (snapshot.schemaVersion !== 2 || snapshot.auditScope !== 'full-record' || !Array.isArray(snapshot.records)) throw new Error(`${config.make} snapshot is not a schema-v2 full-record freeze`);
  const rows = snapshot.records.filter((row) => normalizeMake(row.make) === config.normalizedMake).sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== config.expectedRows || snapshot.inventory?.publishedIssueCount !== config.expectedRows) throw new Error(`${config.make} frozen row count drifted`);
  const rawMakes = [...new Set(rows.map((row) => row.make))].sort();
  if (!equal(rawMakes, [config.make])) throw new Error(`${config.make} raw make variants drifted: ${JSON.stringify(rawMakes)}`);
  const ids = new Set();
  const modelCounts = {};
  for (const row of rows) {
    if (ids.has(row.id)) throw new Error(`${config.make} duplicate frozen id ${row.id}`);
    ids.add(row.id);
    if (row.status !== 'published') throw new Error(`${row.id}: frozen row is not published`);
    modelCounts[row.model] = (modelCounts[row.model] || 0) + 1;
    for (const field of FULL_RECORD_FIELDS) {
      if (row.before?.[`${field}Hash`] !== hashValue(row[field])) throw new Error(`${row.id}: frozen ${field} hash drifted`);
    }
  }
  if (!equal(sortedObject(modelCounts), sortedObject(config.expectedModelCounts))) throw new Error(`${config.make} model counts drifted`);
  return rows;
}

function sourceInspection(citation) {
  return {
    url: citation?.url || '',
    type: citation?.type || '',
    title: citation?.title || '',
    inspection: 'frozen-citation-metadata-only; source content was not promoted to exact primary proof',
  };
}

function buildRouting(rows, config, ymmt) {
  const routes = [];
  for (const row of rows) {
    const issueTrims = filterableKnownIssueTrims(row.trims);
    for (const year of row.years || []) {
      const selectable = ymmt?.[String(year)]?.[config.make]?.[row.model] || [];
      if (!selectable.length) {
        routes.push({ id: row.id, model: row.model, year, issueTrims: clone(row.trims), classification: 'selector-unavailable', selectableTrims: [] });
        continue;
      }
      if (!issueTrims.length) {
        routes.push({ id: row.id, model: row.model, year, issueTrims: clone(row.trims), classification: 'model-wide-fail-open', selectableTrims: clone(selectable) });
        continue;
      }
      for (const trim of selectable) {
        const exact = issueTrims.some((candidate) => normalizeKnownIssueTrim(candidate) === normalizeKnownIssueTrim(trim));
        const productionMatch = knownIssueMatchesTrim(row.trims, trim);
        routes.push({ id: row.id, model: row.model, year, selectedTrim: trim, classification: exact ? 'exact' : productionMatch ? 'substring-only' : 'hidden' });
      }
    }
  }
  const summary = routes.reduce((counts, route) => ({ ...counts, [route.classification]: (counts[route.classification] || 0) + 1 }), {});
  return { selectorYearRange: clone(config.selectorYearRange), routes, summary: sortedObject(summary), metadataWritesAuthorized: 0 };
}

function buildAudit(config) {
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(config.snapshotFile), 'utf8'));
  const ymmt = JSON.parse(fs.readFileSync(resolveRepo('public/data/ymmt.json'), 'utf8'));
  const rows = assertSnapshot(config, snapshot);
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = clone(before);
    return {
      id: row.id,
      model: row.model,
      action: ACTION,
      disposition: 'Preserve the complete published record byte-identical pending exact-identity primary-source review.',
      justification: config.flaggedRows[row.id] || 'No captured exact same-identity primary evidence authorizes a content or metadata rewrite.',
      existingSourcesInspected: (row.citations || []).map(sourceInspection),
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
      contentWriteAuthorized: false,
      metadataWriteAuthorized: false,
    };
  });
  const routing = buildRouting(rows, config, ymmt);
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'make-wide-conservative-primary-source-and-routing-review',
    requiresIndependentApproval: false,
    generatedOn: config.generatedOn,
    make: config.make,
    reviewBoundary: config.reviewBoundary,
    source: {
      snapshotFile: config.snapshotFile,
      snapshotNormalizedSha256: config.snapshotNormalizedSha256,
      snapshotHash: snapshot.snapshotHash,
      snapshotGeneratedAt: snapshot.generatedAt,
      captureCommand: `node scripts/audit-known-issue-catalog-deeplinks.js --export --make-ci ${config.make} --output ${config.snapshotFile}`,
      captureTransaction: 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY',
      secretValuesRecorded: false,
      globalPublishedCountAtFreeze: config.expectedGlobalPublishedAtFreeze,
    },
    safetyContract: [
      'No archive, redirect, consolidation, title change, URL change, indexed vehicle-metadata change, status/severity change, owner-telemetry change or commerce mutation is authorized.',
      'Every audited row remains a byte-identical published no-op across every full-record field.',
      'Unknown owner totals remain internal zero and are never converted into social proof.',
      'Routing findings are evidence for later correction and authorize no metadata write.',
      'No content write is inferred from citation metadata alone.',
    ],
    summary: {
      models: Object.keys(config.expectedModelCounts).length,
      rows: decisions.length,
      retained: 0,
      held: decisions.length,
      pagesPreservedPublished: decisions.length,
      authorizedWriteCandidates: 0,
    },
    modelCounts: clone(config.expectedModelCounts),
    routing,
    applicationGate: { status: 'blocked', reason: `All ${decisions.length} ${config.make} rows are byte-identical holds; no database write set exists.` },
    decisions,
  };
}

function writeAudit(config, audit = buildAudit(config)) {
  fs.writeFileSync(resolveRepo(config.outputFile), `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  return audit;
}

if (require.main === module) {
  const flagIndex = process.argv.indexOf('--config');
  if (flagIndex < 0 || !process.argv[flagIndex + 1]) throw new Error('--config is required');
  const config = require(resolveRepo(process.argv[flagIndex + 1]));
  const audit = writeAudit(config);
  console.log(JSON.stringify({ output: config.outputFile, summary: audit.summary, routing: audit.routing.summary, applicationGate: audit.applicationGate.status }, null, 2));
}

module.exports = { ACTION, assertSnapshot, buildAudit, buildRouting, normalizeMake, sourceInspection, writeAudit };
