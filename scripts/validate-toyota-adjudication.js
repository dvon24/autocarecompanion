/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ACTIONS = Object.freeze([
  'keep_replacement',
  'rewrite_then_publish',
  'archive_as_duplicate',
  'keep_archived',
]);
const FULL_RECORD_FIELDS = Object.freeze([
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'description', 'solution',
  'severity', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow',
  'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations',
  'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'status',
  'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary', 'relatedIssueIds',
]);
const PATCH_FIELDS = new Set(FULL_RECORD_FIELDS.filter((field) => !['make', 'model', 'category'].includes(field)));
const SEARCH_QUERY_KEYS = new Set(['q', 'k', '_nkw', 'query', 'keyword', 'keywords', 'search', 'searchterm', 'text']);

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function hashValue(value) {
  return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex');
}

function fullRecordSnapshot(row) {
  return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, row[field]]));
}

function isSearchUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return true;
    for (const key of url.searchParams.keys()) {
      if (SEARCH_QUERY_KEYS.has(key.toLowerCase())) return true;
    }
    return /\/(?:search|s)\/?$/i.test(url.pathname);
  } catch {
    return true;
  }
}

function actionIds(value, action) {
  if (!Array.isArray(value)) throw new Error(`decisions.${action} must be an array`);
  return value.map((row) => {
    if (typeof row === 'string') return row;
    if (row && typeof row.id === 'string') return row.id;
    throw new Error(`decisions.${action} contains a row without an id`);
  });
}

function validateAdjudication({ adjudication, packet, packetSha256 }) {
  const errors = [];
  if (!adjudication || typeof adjudication !== 'object') return ['adjudication must be an object'];
  if (!packet || typeof packet !== 'object' || !Array.isArray(packet.rows)) {
    return ['packet must contain rows[]'];
  }
  if (adjudication.status !== 'proposal-only') errors.push('status must be proposal-only');
  if (adjudication.source?.holdPacketSha256 !== packetSha256) {
    errors.push('hold packet SHA-256 does not match the frozen input');
  }

  const decisions = adjudication.decisions || {};
  const byAction = new Map();
  const allIds = [];
  for (const action of ACTIONS) {
    try {
      const ids = actionIds(decisions[action], action);
      byAction.set(action, ids);
      allIds.push(...ids);
      if (adjudication.summary?.[action] !== ids.length) {
        errors.push(`summary.${action} is ${adjudication.summary?.[action]}, expected ${ids.length}`);
      }
    } catch (error) {
      errors.push(error.message);
    }
  }

  const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
  if (duplicates.length) errors.push(`duplicate decision IDs: ${[...new Set(duplicates)].join(', ')}`);
  if (adjudication.summary?.total !== allIds.length) {
    errors.push(`summary.total is ${adjudication.summary?.total}, expected ${allIds.length}`);
  }

  const scopedRows = packet.rows
    .filter((row) => row.make === adjudication.make && (!adjudication.model || row.model === adjudication.model));
  const scopedPacketIds = scopedRows
    .map((row) => row.id)
    .sort();
  const decidedIds = [...allIds].sort();
  const missing = scopedPacketIds.filter((id) => !decidedIds.includes(id));
  const extra = decidedIds.filter((id) => !scopedPacketIds.includes(id));
  if (missing.length) errors.push(`missing packet IDs: ${missing.join(', ')}`);
  if (extra.length) errors.push(`extra decision IDs: ${extra.join(', ')}`);

  for (const row of decisions.archive_as_duplicate || []) {
    if (!row || typeof row !== 'object' || !row.canonicalId) {
      errors.push('every archive_as_duplicate row must declare canonicalId');
    } else if (row.id === row.canonicalId) {
      errors.push(`${row.id}: canonicalId cannot equal id`);
    }
  }

  if (adjudication.byModel) {
    const modelById = new Map(scopedRows.map((row) => [row.id, row.model]));
    for (const [model, expected] of Object.entries(adjudication.byModel)) {
      let total = 0;
      for (const action of ACTIONS) {
        const count = (byAction.get(action) || []).filter((id) => modelById.get(id) === model).length;
        total += count;
        if (expected?.[action] !== count) {
          errors.push(`byModel.${model}.${action} is ${expected?.[action]}, expected ${count}`);
        }
      }
      if (expected?.total !== total) errors.push(`byModel.${model}.total is ${expected?.total}, expected ${total}`);
    }
    const declaredModels = new Set(Object.keys(adjudication.byModel));
    const missingModels = [...new Set(scopedRows.map((row) => row.model))]
      .filter((model) => !declaredModels.has(model));
    if (missingModels.length) errors.push(`byModel is missing: ${missingModels.join(', ')}`);
  }

  return errors;
}

function validateSubset({ parent, subset, packet }) {
  const errors = [];
  const model = subset.model;
  if (!model) return ['subset.model must be present'];
  const packetIds = new Set(packet.rows.filter((row) => row.make === subset.make && row.model === model).map((row) => row.id));
  const parentActionById = new Map();
  const subsetActionById = new Map();
  for (const action of ACTIONS) {
    for (const id of actionIds(parent.decisions?.[action], action)) parentActionById.set(id, action);
    for (const id of actionIds(subset.decisions?.[action], action)) subsetActionById.set(id, action);
  }
  for (const id of packetIds) {
    if (parentActionById.get(id) !== subsetActionById.get(id)) {
      errors.push(`${id}: parent=${parentActionById.get(id) || '<missing>'}, subset=${subsetActionById.get(id) || '<missing>'}`);
    }
  }
  return errors;
}

function validateRewriteProposals({ adjudication, proposals, packet }) {
  const errors = [];
  if (!proposals || typeof proposals !== 'object' || !Array.isArray(proposals.rows)) {
    return ['rewrite proposal must contain rows[]'];
  }
  if (proposals.status !== 'proposal-only') errors.push('rewrite proposal status must be proposal-only');
  if (proposals.requiresIndependentApproval !== true) {
    errors.push('rewrite proposal must require independent approval');
  }

  const expectedIds = actionIds(adjudication.decisions?.rewrite_then_publish, 'rewrite_then_publish').sort();
  const actualIds = proposals.rows.map((row) => row && row.id).sort();
  const duplicates = actualIds.filter((id, index) => actualIds.indexOf(id) !== index);
  if (duplicates.length) errors.push(`duplicate rewrite IDs: ${[...new Set(duplicates)].join(', ')}`);
  const missing = expectedIds.filter((id) => !actualIds.includes(id));
  const extra = actualIds.filter((id) => !expectedIds.includes(id));
  if (missing.length) errors.push(`missing rewrite IDs: ${missing.join(', ')}`);
  if (extra.length) errors.push(`extra rewrite IDs: ${extra.join(', ')}`);

  const packetById = new Map(packet.rows.map((row) => [row.id, row]));
  for (const row of proposals.rows) {
    const label = row.id || '<missing id>';
    const packetRow = packetById.get(row.id);
    const auditAfter = packetRow?.auditDecisions?.[0]?.after;
    if (!auditAfter) {
      errors.push(`${label}: missing frozen audit after-state`);
    } else if (row.expectedAuditAfterSha256 !== hashValue(fullRecordSnapshot(auditAfter))) {
      errors.push(`${label}: expectedAuditAfterSha256 does not match the frozen audit after-state`);
    }
    if (typeof row.identityReview !== 'string' || row.identityReview.length < 20) {
      errors.push(`${label}: identityReview must explain the title restoration`);
    }
    if (!row.patch || typeof row.patch !== 'object' || Array.isArray(row.patch)) {
      errors.push(`${label}: patch must be an object`);
      continue;
    }
    const unsupported = Object.keys(row.patch).filter((field) => !PATCH_FIELDS.has(field));
    if (unsupported.length) errors.push(`${label}: unsupported or identity patch fields: ${unsupported.join(', ')}`);
    if (row.patch.status !== 'published') errors.push(`${label}: proposed status must be published`);
    if (row.patch.humanApproved !== true) errors.push(`${label}: proposed row must require human approval`);
    if (!Array.isArray(row.patch.years) || row.patch.years.length === 0) errors.push(`${label}: years must be non-empty`);
    if (!Array.isArray(row.patch.citations) || row.patch.citations.length === 0) {
      errors.push(`${label}: citations must be non-empty`);
    }
    if (!Array.isArray(row.patch.fixParts) || row.patch.fixParts.length !== 0) {
      errors.push(`${label}: fixParts must stay empty`);
    }
    if (row.patch.estimatedCostLow !== null || row.patch.estimatedCostHigh !== null) {
      errors.push(`${label}: costs must stay null`);
    }
    if (row.patch.typicalMileageLow !== null || row.patch.typicalMileageHigh !== null) {
      errors.push(`${label}: mileage claims must stay null`);
    }
    if (/^Archived\s*-/i.test(row.patch.title || '')) errors.push(`${label}: title still leaks archive state`);
    if (!/owner[- ](?:report|complaint)|T-SB-/i.test(row.patch.title || '')) {
      errors.push(`${label}: title must disclose owner-report scope or identify the official bulletin`);
    }
    for (const trim of row.patch.trims || []) {
      if (/\b(?:vehicle|vin|equipped|built|production|applicable)\b/i.test(trim)) {
        errors.push(`${label}: trims contains applicability prose: ${trim}`);
      }
    }
    for (const citation of row.patch.citations || []) {
      if (!citation || !citation.title || isSearchUrl(citation.url)) {
        errors.push(`${label}: citation must be a titled direct HTTPS page: ${citation?.url || '<missing>'}`);
      }
    }
    for (const recommendation of row.patch.communityRecommendations || []) {
      if (recommendation && /\b(?:buy|purchase|amazon|ebay|rockauto|part number)\b/i.test(recommendation.content || '')) {
        errors.push(`${label}: recommendation contains commerce language`);
      }
    }
  }
  return errors;
}

function argValue(args, flag) {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`Missing ${flag}`);
  return path.resolve(args[index + 1]);
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    const adjudicationFile = argValue(args, '--adjudication');
    const packetFile = argValue(args, '--packet');
    const rewriteIndex = args.indexOf('--rewrites');
    const rewriteFile = rewriteIndex >= 0 && args[rewriteIndex + 1] ? path.resolve(args[rewriteIndex + 1]) : null;
    const subsetIndex = args.indexOf('--subset');
    const subsetFile = subsetIndex >= 0 && args[subsetIndex + 1] ? path.resolve(args[subsetIndex + 1]) : null;
    const adjudication = JSON.parse(fs.readFileSync(adjudicationFile, 'utf8'));
    const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
    const errors = validateAdjudication({ adjudication, packet, packetSha256: sha256(packetFile) });
    const proposals = rewriteFile ? JSON.parse(fs.readFileSync(rewriteFile, 'utf8')) : null;
    if (proposals) errors.push(...validateRewriteProposals({ adjudication, proposals, packet }));
    const subset = subsetFile ? JSON.parse(fs.readFileSync(subsetFile, 'utf8')) : null;
    if (subset) errors.push(...validateSubset({ parent: adjudication, subset, packet }));
    const result = {
      passed: errors.length === 0,
      adjudicationFile,
      adjudicationSha256: sha256(adjudicationFile),
      packetFile,
      packetSha256: sha256(packetFile),
      rewriteFile,
      rewriteSha256: rewriteFile ? sha256(rewriteFile) : null,
      subsetFile,
      subsetSha256: subsetFile ? sha256(subsetFile) : null,
      decisionCount: Object.values(adjudication.decisions || {}).reduce(
        (sum, rows) => sum + (Array.isArray(rows) ? rows.length : 0),
        0,
      ),
      errors,
    };
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  ACTIONS,
  FULL_RECORD_FIELDS,
  actionIds,
  fullRecordSnapshot,
  hashValue,
  isSearchUrl,
  validateAdjudication,
  validateRewriteProposals,
  validateSubset,
};
