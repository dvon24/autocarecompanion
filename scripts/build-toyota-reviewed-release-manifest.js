/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  FULL_RECORD_FIELDS,
  fullRecordSnapshot,
  hashValue,
} = require('./validate-toyota-adjudication');
const {
  EXPECTED_ADJUDICATION,
  EXPECTED_PROPOSALS,
  EXPECTED_ID_SET_SHA256,
  EXPECTED_REVIEW_SET_SHA256,
  loadReviewedRows,
} = require('./verify-toyota-rewrite-proposals-production');
const { normalizedFileHash } = require('./known-issue-adjudication-utils');
const toyotaAuditConfig = require('./toyota-hold-audit-config');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_ROOT = path.join(PROJECT_ROOT, 'data');
const DEFAULT_PACKET_FILE = path.join(DATA_ROOT, '_toyota-hold-review-packet.json');
const DEFAULT_ADJUDICATION_FILE = path.join(DATA_ROOT, EXPECTED_ADJUDICATION.file);
const DEFAULT_PROPOSAL_FILES = Object.keys(EXPECTED_PROPOSALS).sort().map((file) => path.join(DATA_ROOT, file));
const DEFAULT_OUTPUT_FILE = path.join(DATA_ROOT, 'known-issue-toyota-reviewed-release-manifest-2026-08-11.json');
const EXPECTED_PACKET_NORMALIZED_SHA256 = '3e5cde0a2d1b30abb7cde144e4427afbf33187553b8bfaf3804085d987c1d956';
const PATCH_FIELDS = Object.freeze(FULL_RECORD_FIELDS.filter((field) => !['make', 'model', 'category'].includes(field)));

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function stableHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function fullRecord(row) {
  return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, clone(row[field])]));
}

function sortedIssues(issues) {
  return [...issues].sort((left, right) => left.id.localeCompare(right.id));
}

function withoutManifestHash(manifest) {
  const content = { ...manifest };
  delete content.manifestHash;
  return content;
}

function manifestHash(manifest) {
  return stableHash(withoutManifestHash(manifest));
}

function statusInventoryCounts() {
  const file = path.join(DATA_ROOT, '_toyota-status-inventory-2026-08-11.json');
  const reference = toyotaAuditConfig.additionalAuditReferences.find((item) => item.file.endsWith('_toyota-status-inventory-2026-08-11.json'));
  if (!reference || normalizedFileHash(file) !== reference.normalizedSha256) {
    throw new Error('Toyota all-status inventory drifted');
  }
  const inventory = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = inventory.rows || inventory.records || [];
  const published = rows.filter((row) => String(row.status).toLowerCase() === 'published').length;
  const archived = rows.filter((row) => String(row.status).toLowerCase() === 'archived').length;
  if (rows.length !== 654 || published !== 547 || archived !== 107) {
    throw new Error(`Toyota all-status inventory accounting drifted: ${rows.length}/${published}/${archived}`);
  }
  return { total: rows.length, published, archived };
}

function sourceFiles() {
  return {
    packet: {
      file: 'data/_toyota-hold-review-packet.json',
      normalizedSha256: EXPECTED_PACKET_NORMALIZED_SHA256,
    },
    adjudication: {
      file: `data/${EXPECTED_ADJUDICATION.file}`,
      normalizedSha256: EXPECTED_ADJUDICATION.normalizedSha256,
    },
    proposals: Object.entries(EXPECTED_PROPOSALS).sort(([left], [right]) => left.localeCompare(right)).map(([file, normalizedSha256]) => ({
      file: `data/${file}`,
      normalizedSha256,
    })),
    reviewedIdSetSha256: EXPECTED_ID_SET_SHA256,
    reviewedSetSha256: EXPECTED_REVIEW_SET_SHA256,
  };
}

function buildManifest({
  packetFile = DEFAULT_PACKET_FILE,
  adjudicationFile = DEFAULT_ADJUDICATION_FILE,
  proposalFiles = DEFAULT_PROPOSAL_FILES,
} = {}) {
  if (normalizedFileHash(packetFile) !== EXPECTED_PACKET_NORMALIZED_SHA256) {
    throw new Error('Toyota frozen hold packet drifted');
  }
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const reviewed = loadReviewedRows(adjudicationFile, proposalFiles);
  const packetById = new Map((packet.rows || []).map((row) => [row.id, row]));
  const issues = reviewed.rows.map((proposal) => {
    const packetRow = packetById.get(proposal.id);
    if (!packetRow || !Array.isArray(packetRow.auditDecisions) || packetRow.auditDecisions.length !== 1) {
      throw new Error(`${proposal.id}: frozen packet row/decision is missing or ambiguous`);
    }
    const before = fullRecord(packetRow.auditDecisions[0].after);
    if (hashValue(fullRecordSnapshot(before)) !== proposal.expectedAuditAfterSha256) {
      throw new Error(`${proposal.id}: frozen before-state does not match reviewed proposal hash`);
    }
    if (before.status !== 'archived') throw new Error(`${proposal.id}: reviewed before-state is not archived`);
    const patchKeys = Object.keys(proposal.patch || {}).sort();
    if (JSON.stringify(patchKeys) !== JSON.stringify([...PATCH_FIELDS].sort())) {
      throw new Error(`${proposal.id}: patch is not an exact full reviewed non-identity overlay`);
    }
    if (typeof proposal.identityReview !== 'string' || proposal.identityReview.trim().length < 20) {
      throw new Error(`${proposal.id}: identity review is missing`);
    }
    const after = fullRecord({ ...before, ...clone(proposal.patch) });
    if (after.make !== before.make || after.model !== before.model || after.category !== before.category) {
      throw new Error(`${proposal.id}: make/model/category identity changed`);
    }
    if (after.status !== 'published' || after.humanApproved !== true || after.reportCount !== 0) {
      throw new Error(`${proposal.id}: reviewed publication/status/owner gate failed`);
    }
    const recommendationHasCommerce = after.communityRecommendations.some((recommendation) => recommendation && typeof recommendation === 'object'
      && ['url', 'affiliateUrl', 'productUrl', 'buyUrl'].some((field) => typeof recommendation[field] === 'string' && recommendation[field].trim()));
    if (!Array.isArray(after.citations) || after.citations.length === 0 || after.fixParts.length !== 0 || recommendationHasCommerce) {
      throw new Error(`${proposal.id}: reviewed evidence/commerce gate failed`);
    }
    if (/^Archived\s*-/i.test(after.title) || !Array.isArray(after.years) || after.years.length === 0) {
      throw new Error(`${proposal.id}: title/year publication gate failed`);
    }
    return {
      id: proposal.id,
      identityReview: proposal.identityReview,
      proposalFile: path.relative(PROJECT_ROOT, proposal.proposalFile).replace(/\\/g, '/'),
      before,
      beforeSha256: proposal.expectedAuditAfterSha256,
      patch: clone(proposal.patch),
      patchSha256: stableHash(proposal.patch),
      after,
      afterSha256: hashValue(fullRecordSnapshot(after)),
    };
  });
  const inventory = statusInventoryCounts();
  const manifest = {
    schemaVersion: 1,
    manifestKind: 'toyota-reviewed-republish',
    batchId: 'toyota-reviewed-rewrites-2026-08-11',
    generatedOn: '2026-08-11',
    source: sourceFiles(),
    inventory: {
      before: {
        globalPublished: toyotaAuditConfig.expectedGlobalPublishedAtFreeze,
        toyotaPublished: inventory.published,
        toyotaArchived: inventory.archived,
      },
      after: {
        globalPublished: toyotaAuditConfig.expectedGlobalPublishedAtFreeze + issues.length,
        toyotaPublished: inventory.published + issues.length,
        toyotaArchived: inventory.archived - issues.length,
      },
    },
    summary: {
      reviewedRows: issues.length,
      archivedToPublished: issues.length,
      titleRestorations: issues.filter((issue) => issue.before.title !== issue.after.title).length,
      commerceRows: issues.filter((issue) => issue.after.fixParts.length || issue.after.communityRecommendations.some((recommendation) => recommendation
        && ['url', 'affiliateUrl', 'productUrl', 'buyUrl'].some((field) => typeof recommendation[field] === 'string' && recommendation[field].trim()))).length,
    },
    issues: sortedIssues(issues),
  };
  manifest.manifestHash = manifestHash(manifest);
  return manifest;
}

function validateManifest(manifest) {
  const expected = buildManifest();
  const errors = [];
  if (stableHash(manifest) !== stableHash(expected)) errors.push('manifest does not equal the deterministic reviewed source union');
  if (manifest.manifestHash !== manifestHash(manifest)) errors.push('manifestHash');
  if (manifest.summary?.reviewedRows !== 32 || manifest.summary?.archivedToPublished !== 32) errors.push('summary');
  if (manifest.summary?.titleRestorations !== 32 || manifest.summary?.commerceRows !== 0) errors.push('reviewed identity/commerce summary');
  if (new Set((manifest.issues || []).map((issue) => issue.id)).size !== 32) errors.push('exact issue IDs');
  return errors;
}

function writeManifest(file = DEFAULT_OUTPUT_FILE) {
  const manifest = buildManifest();
  fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return manifest;
}

if (require.main === module) {
  try {
    const outputIndex = process.argv.indexOf('--output');
    const output = outputIndex >= 0 && process.argv[outputIndex + 1] ? path.resolve(process.argv[outputIndex + 1]) : DEFAULT_OUTPUT_FILE;
    const manifest = writeManifest(output);
    console.log(JSON.stringify({ output, manifestHash: manifest.manifestHash, ...manifest.summary, inventory: manifest.inventory }, null, 2));
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  DEFAULT_OUTPUT_FILE,
  PATCH_FIELDS,
  buildManifest,
  manifestHash,
  stableHash,
  validateManifest,
  writeManifest,
};
