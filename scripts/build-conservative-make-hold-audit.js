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
  normalizedTextHash,
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
  const pinnedSource = fs.readFileSync(absolute, 'utf8');
  if (normalizedTextHash(pinnedSource) !== config.snapshotNormalizedSha256) throw new Error(`${config.make} snapshot normalized hash drifted`);
  const pinnedSnapshot = JSON.parse(pinnedSource);
  if (!equal(snapshot, pinnedSnapshot)) throw new Error(`${config.make} snapshot object differs from the pinned snapshot file`);
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

function isSearchLikeUrl(value) {
  try {
    const url = new URL(String(value || ''));
    const searchKeys = new Set(['q', 'k', '_nkw', 'query', 'keyword', 'keywords', 'search', 'searchterm', 'text']);
    return [...url.searchParams.keys()].some((key) => searchKeys.has(key.toLowerCase())) || /\/(?:search|s)\/?$/i.test(url.pathname);
  } catch {
    return true;
  }
}

function buildRiskSignals(rows) {
  const byTitle = new Map();
  const normalizeTitle = (value) => String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  for (const row of rows) {
    const key = `${row.model}\u0000${normalizeTitle(row.title)}`;
    if (!byTitle.has(key)) byTitle.set(key, []);
    byTitle.get(key).push(row.id);
  }
  const idsWhere = (predicate) => rows.filter(predicate).map((row) => row.id).sort();
  return {
    uncitedRowIds: idsWhere((row) => !(row.citations || []).length),
    searchOrInvalidCitationRowIds: idsWhere((row) => (row.citations || []).some((citation) => isSearchLikeUrl(citation?.url))),
    literalUndefinedCitationRowIds: idsWhere((row) => (row.citations || []).some((citation) => /\bundefined\b/i.test(String(citation?.url || '')))),
    applicabilityProseTrimRowIds: idsWhere((row) => (row.trims || []).some((trim) => /\b(?:vehicles?|vin|equipped|built|production|applicability|sales code)\b/i.test(String(trim)))),
    positiveOwnerCountRowIds: idsWhere((row) => Number(row.reportCount) > 0),
    ownerClaimLanguageRowIds: idsWhere((row) => /\b(?:owners?|owner[- ]reports?|reported by|commonly reported|widespread)\b/i.test(`${row.description || ''} ${row.solution || ''}`)),
    commerceRowIds: idsWhere((row) => (row.fixParts || []).length > 0 || (row.communityRecommendations || []).length > 0),
    exactModelTitleDuplicateClusters: [...byTitle.entries()]
      .filter(([, ids]) => ids.length > 1)
      .map(([key, ids]) => ({ model: key.split('\u0000')[0], ids: [...ids].sort() }))
      .sort((left, right) => left.model.localeCompare(right.model) || left.ids[0].localeCompare(right.ids[0])),
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
  if (config.compactRouting === true) {
    const byId = new Map();
    for (const row of rows) byId.set(row.id, { id: row.id, model: row.model, exact: 0, substringOnly: 0, hidden: 0, modelWideFailOpen: 0, selectorUnavailable: 0, selectorUnavailableYears: [], substringOnlyTrimSamples: [] });
    for (const route of routes) {
      const item = byId.get(route.id);
      if (route.classification === 'exact') item.exact += 1;
      else if (route.classification === 'substring-only') {
        item.substringOnly += 1;
        if (item.substringOnlyTrimSamples.length < 10 && route.selectedTrim) item.substringOnlyTrimSamples.push({ year: route.year, trim: route.selectedTrim });
      } else if (route.classification === 'hidden') item.hidden += 1;
      else if (route.classification === 'model-wide-fail-open') item.modelWideFailOpen += 1;
      else if (route.classification === 'selector-unavailable') {
        item.selectorUnavailable += 1;
        item.selectorUnavailableYears.push(route.year);
      }
    }
    return {
      selectorYearRange: clone(config.selectorYearRange),
      encoding: 'per-row-route-counts',
      routeCount: routes.length,
      rowSummaries: [...byId.values()].sort((left, right) => left.id.localeCompare(right.id)),
      summary: sortedObject(summary),
      metadataWritesAuthorized: 0,
    };
  }
  return { selectorYearRange: clone(config.selectorYearRange), routes, summary: sortedObject(summary), metadataWritesAuthorized: 0 };
}

function buildAudit(config) {
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(config.snapshotFile), 'utf8'));
  const ymmt = JSON.parse(fs.readFileSync(resolveRepo('public/data/ymmt.json'), 'utf8'));
  const rows = assertSnapshot(config, snapshot);
  for (const reference of config.additionalAuditReferences || []) {
    if (!reference.file || !reference.normalizedSha256) throw new Error(`${config.make} additional audit reference is incomplete`);
    if (normalizedFileHash(resolveRepo(reference.file)) !== reference.normalizedSha256) throw new Error(`${config.make} additional audit reference drifted: ${reference.file}`);
  }
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = clone(before);
    const decision = {
      id: row.id,
      model: row.model,
      action: ACTION,
      disposition: 'Preserve the complete published record byte-identical pending exact-identity primary-source review.',
      justification: config.flaggedRows[row.id] || 'No captured exact same-identity primary evidence authorizes a content or metadata rewrite.',
      existingSourcesInspected: (row.citations || []).map(sourceInspection),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
      contentWriteAuthorized: false,
      metadataWriteAuthorized: false,
    };
    if (config.compactDecisions === true) return decision;
    return { ...decision, before, proposal };
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
    ...(Array.isArray(config.additionalAuditReferences) && config.additionalAuditReferences.length
      ? { additionalAuditReferences: clone(config.additionalAuditReferences) }
      : {}),
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
    ...(config.compactDecisions === true ? { decisionEncoding: 'snapshot-full-record-hashes' } : {}),
    modelCounts: clone(config.expectedModelCounts),
    ...(config.includeRiskSignals === true ? { riskSignals: buildRiskSignals(rows) } : {}),
    routing,
    applicationGate: { status: 'blocked', reason: `All ${decisions.length} ${config.make} rows are byte-identical holds; no database write set exists.` },
    decisions,
  };
}

function writeAudit(config, audit = buildAudit(config), writeFile = fs.writeFileSync) {
  if (!equal(audit, buildAudit(config))) throw new Error(`${config.make} audit does not match the fresh deterministic build`);
  writeFile(resolveRepo(config.outputFile), `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  return audit;
}

if (require.main === module) {
  const flagIndex = process.argv.indexOf('--config');
  if (flagIndex < 0 || !process.argv[flagIndex + 1]) throw new Error('--config is required');
  const config = require(resolveRepo(process.argv[flagIndex + 1]));
  const audit = writeAudit(config);
  console.log(JSON.stringify({ output: config.outputFile, summary: audit.summary, routing: audit.routing.summary, applicationGate: audit.applicationGate.status }, null, 2));
}

module.exports = { ACTION, assertSnapshot, buildAudit, buildRiskSignals, buildRouting, isSearchLikeUrl, normalizeMake, sourceInspection, writeAudit };
