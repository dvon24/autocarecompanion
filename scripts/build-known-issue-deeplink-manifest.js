/* eslint-disable @typescript-eslint/no-require-imports */
/** Build a full guarded manifest from a compact, human-reviewed decision patch. */
const fs = require('fs');
const path = require('path');
const {
  FULL_RECORD_FIELDS,
  beforeHashes,
  fullRecordHashes,
  fullRecordSnapshot,
  validateManifest,
} = require('./apply-known-issue-catalog-deeplinks');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function baseAfter(record, schemaVersion = 1) {
  if (schemaVersion >= 2) return fullRecordSnapshot(record);
  return {
    title: record.title,
    years: clone(record.years || (record.vehicle && record.vehicle.years) || []),
    trims: clone(record.trims || (record.vehicle && record.vehicle.trims) || []),
    engines: clone(record.engines || (record.vehicle && record.vehicle.engines) || []),
    description: record.description,
    solution: record.solution,
    dtcCodes: clone(record.dtcCodes || []),
    citations: clone(record.citations || []),
    communityRecommendations: clone(record.communityRecommendations || []),
    fixParts: clone(record.fixParts || []),
    contentUpdatedOn: record.contentUpdatedOn || '',
    contentUpdateSummary: record.contentUpdateSummary || '',
  };
}

function indexesForClaimIds(ids, prefix) {
  return new Set((ids || []).map((id) => {
    const match = new RegExp(`^${prefix}:(\\d+)$`).exec(id);
    if (!match) throw new Error(`Invalid ${prefix} claim id: ${id}`);
    return Number(match[1]);
  }));
}

function componentKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function mergeFixParts(existing, merges) {
  const out = clone(existing || []);
  for (const merge of merges || []) {
    if (!merge || typeof merge !== 'object' || !merge.part || typeof merge.part !== 'object') {
      throw new Error('mergeFixParts entries require a part object');
    }
    const wanted = componentKey(merge.component || merge.part.component);
    if (!wanted) throw new Error('mergeFixParts entries require a component key');
    if (componentKey(merge.part.component) !== wanted) {
      throw new Error(`mergeFixParts component mismatch: ${merge.component} vs ${merge.part.component}`);
    }
    const matches = out.map((part, index) => componentKey(part && part.component) === wanted ? index : -1)
      .filter((index) => index >= 0);
    if (matches.length > 1) throw new Error(`mergeFixParts component is ambiguous: ${wanted}`);
    if (matches.length === 1) out[matches[0]] = clone(merge.part);
    else out.push(clone(merge.part));
  }
  return out;
}

function applyDecision(record, decision, schemaVersion = 1) {
  const after = baseAfter(record, schemaVersion);
  const dropCommunity = indexesForClaimIds(decision.dropCommunityClaimIds, 'communityRecommendations');
  const dropFixParts = indexesForClaimIds(decision.dropFixPartClaimIds, 'fixParts');
  if (dropCommunity.size) after.communityRecommendations = after.communityRecommendations.filter((_, index) => !dropCommunity.has(index));
  if (dropFixParts.size) after.fixParts = after.fixParts.filter((_, index) => !dropFixParts.has(index));
  if (decision.clearAllBuyLinks) after.fixParts = after.fixParts.map((part) => ({ ...part, buyLinks: [] }));
  if (decision.clearBuyLinksForClaimIds) {
    const clear = indexesForClaimIds(decision.clearBuyLinksForClaimIds, 'fixParts');
    after.fixParts = after.fixParts.map((part, index) => clear.has(index) ? { ...part, buyLinks: [] } : part);
  }
  if (decision.replaceCommunityRecommendations) after.communityRecommendations = clone(decision.replaceCommunityRecommendations);
  if (decision.replaceFixParts && decision.mergeFixParts) {
    throw new Error(`Decision ${decision.id || '(unknown)'} cannot combine replaceFixParts and mergeFixParts`);
  }
  if (decision.replaceFixParts) after.fixParts = clone(decision.replaceFixParts);
  if (decision.mergeFixParts) after.fixParts = mergeFixParts(after.fixParts, decision.mergeFixParts);
  if (decision.title !== undefined) after.title = decision.title;
  if (decision.years !== undefined) after.years = clone(decision.years);
  if (decision.trims !== undefined) after.trims = clone(decision.trims);
  if (decision.engines !== undefined) after.engines = clone(decision.engines);
  if (decision.description !== undefined) after.description = decision.description;
  if (decision.solution !== undefined) after.solution = decision.solution;
  if (decision.dtcCodes !== undefined) after.dtcCodes = clone(decision.dtcCodes);
  if (decision.citations !== undefined) after.citations = clone(decision.citations);
  if (decision.contentUpdatedOn !== undefined) after.contentUpdatedOn = decision.contentUpdatedOn;
  if (decision.contentUpdateSummary !== undefined) after.contentUpdateSummary = decision.contentUpdateSummary;
  if (schemaVersion >= 2) {
    for (const field of FULL_RECORD_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(decision, field)) after[field] = clone(decision[field]);
    }
  }
  return after;
}

function buildManifest(snapshot, patch) {
  if (!snapshot || snapshot.snapshotKind !== 'known-issues-catalog-deeplinks') throw new Error('Invalid catalog snapshot');
  if (!patch || patch.patchKind !== 'known-issues-catalog-deeplink-decisions') throw new Error('Invalid decision patch');
  if (patch.snapshotHash !== snapshot.snapshotHash) throw new Error('Decision patch snapshotHash does not match snapshot');
  if (!Array.isArray(patch.decisions) || patch.decisions.length === 0) throw new Error('Decision patch has no decisions');
  const schemaVersion = patch.schemaVersion || snapshot.schemaVersion || 1;
  if (schemaVersion >= 2 && (snapshot.schemaVersion !== 2 || snapshot.auditScope !== 'full-record')) {
    throw new Error('Schema v2 decisions require a schema v2 full-record snapshot');
  }
  const records = new Map(snapshot.records.map((record) => [record.id, record]));
  const ids = new Set();
  const issues = patch.decisions.map((decision) => {
    if (ids.has(decision.id)) throw new Error(`Duplicate decision id: ${decision.id}`);
    ids.add(decision.id);
    const record = records.get(decision.id);
    if (!record) throw new Error(`Decision id not found in snapshot: ${decision.id}`);
    return {
      id: decision.id,
      disposition: decision.disposition,
      decision: decision.decision,
      evidence: decision.evidence,
      before: {
        ...(schemaVersion >= 2 ? fullRecordHashes(record) : beforeHashes(record)),
        claimIds: clone(record.before.claimIds),
      },
      after: applyDecision(record, decision, schemaVersion),
    };
  });
  const manifest = {
    schemaVersion,
    manifestKind: 'known-issues-catalog-deeplinks',
    ...(schemaVersion >= 2 ? { auditScope: 'full-record' } : {}),
    batchId: patch.batchId,
    snapshotHash: snapshot.snapshotHash,
    researchedWith: 'Ultra subscription web research; no LLM API',
    issues,
  };
  const errors = validateManifest(manifest);
  if (errors.length) throw new Error(`Built manifest is invalid: ${errors.join('; ')}`);
  return manifest;
}

function argValue(args, flag) {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`Missing ${flag}`);
  return path.resolve(PROJECT_ROOT, args[index + 1]);
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, file);
}

function main() {
  const args = process.argv.slice(2);
  const snapshotFile = argValue(args, '--snapshot');
  const patchFile = argValue(args, '--patch');
  const outputFile = argValue(args, '--output');
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  const decisionPatch = JSON.parse(fs.readFileSync(patchFile, 'utf8'));
  const manifest = buildManifest(snapshot, decisionPatch);
  writeJsonAtomic(outputFile, manifest);
  console.log(JSON.stringify({ output: path.relative(PROJECT_ROOT, outputFile), batchId: manifest.batchId, issueCount: manifest.issues.length }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

module.exports = { applyDecision, baseAfter, buildManifest, componentKey, mergeFixParts };
