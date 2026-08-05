/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  ACTION_BY_ID,
  CANONICAL_TARGETS,
  EXCLUDED_CITATION_URLS_BY_ID,
  FULL_RECORD_FIELDS,
  PREFERRED_COMPLAINT_ODIS,
  REDIRECTS,
  TITLE_OVERRIDES,
  YEAR_OVERRIDES,
  fullRecord,
  hashValue,
  isGenericOrSearchCitation,
} = require('./build-toyota-hold-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_PACKET = path.join(PROJECT_ROOT, 'data', 'known-issue-toyota-hold-adjudication-2026-08-05.json');
const DEFAULT_REVIEW = path.join(PROJECT_ROOT, 'data', '_toyota-hold-review-packet.json');
const DEFAULT_DISPOSITIONS = path.join(PROJECT_ROOT, 'data', '_toyota-hold-dispositions.json');
const DEFAULT_COMPLAINTS = path.join(PROJECT_ROOT, 'data', '_toyota-hold-nhtsa-complaint-candidates.json');
const ACTIONS = [
  'keep_audited_correction',
  'rewrite_and_republish',
  'redirect_duplicate',
  'uphold_archive_evidence_defect',
];

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function equalValue(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function collectUrls(value, urls = []) {
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) urls.push(value);
  if (Array.isArray(value)) value.forEach((item) => collectUrls(item, urls));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectUrls(item, urls));
  return urls;
}

function validatePacket(packet, review, complaints, inputHashes = {}) {
  const errors = [];
  const reviewById = new Map(review.rows.map((row) => [row.id, row]));
  const complaintById = new Map(complaints.rows.map((row) => [row.id, row]));

  if (packet.schemaVersion !== 1) errors.push('unexpected schema version');
  if (packet.status !== 'proposal-only') errors.push('packet status must be proposal-only');
  if (packet.requiresIndependentApproval !== true) errors.push('packet must require independent approval');
  if (packet.make !== 'Toyota') errors.push('packet make must be Toyota');
  if (packet.scope !== '91-row post-restore content hold') errors.push('packet scope mismatch');
  if (inputHashes.review && packet.source?.reviewPacketSha256 !== inputHashes.review) errors.push('review packet SHA-256 mismatch');
  if (inputHashes.dispositions && packet.source?.preliminaryDispositionsSha256 !== inputHashes.dispositions) errors.push('dispositions SHA-256 mismatch');
  if (inputHashes.complaints && packet.source?.complaintCandidatesSha256 !== inputHashes.complaints) errors.push('complaint evidence SHA-256 mismatch');
  if (packet.source?.preAuditSnapshotSha256 !== review.source.preAuditSnapshotSha256) errors.push('pre-audit snapshot hash mismatch');
  if (packet.source?.restoreManifestSha256 !== review.source.holdManifestSha256) errors.push('restore-manifest hash mismatch');
  if (!Array.isArray(packet.rows)) return [...errors, 'packet rows[] missing'];

  const ids = packet.rows.map((row) => row.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const missingIds = [...reviewById.keys()].filter((id) => !ids.includes(id));
  const extraIds = ids.filter((id) => !reviewById.has(id));
  if (duplicateIds.length) errors.push(`duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}`);
  if (missingIds.length) errors.push(`missing hold IDs: ${missingIds.join(', ')}`);
  if (extraIds.length) errors.push(`extra IDs: ${extraIds.join(', ')}`);
  if (packet.rows.length !== 91 || review.rows.length !== 91) errors.push('Toyota hold must contain exactly 91 rows');

  for (const row of packet.rows) {
    const label = row.id || '<missing>';
    const source = reviewById.get(row.id);
    if (!source) continue;
    const before = fullRecord(source.preAudit);
    const auditAfter = fullRecord(source.auditDecisions[0].after);
    const expectedAction = ACTION_BY_ID.get(row.id);

    if (row.action !== expectedAction) errors.push(`${label}: action mismatch`);
    if (row.beforeSha256 !== hashValue(row.before) || row.beforeSha256 !== hashValue(before)) errors.push(`${label}: before hash mismatch`);
    if (!equalValue(row.before, before)) errors.push(`${label}: before payload drifted`);
    if (row.auditAfterSha256 !== hashValue(row.auditAfter) || row.auditAfterSha256 !== hashValue(auditAfter)) errors.push(`${label}: audit-after hash mismatch`);
    if (!equalValue(row.auditAfter, auditAfter)) errors.push(`${label}: audit-after payload drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${label}: proposal hash mismatch`);
    for (const field of FULL_RECORD_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row.before, field)) errors.push(`${label}: before missing ${field}`);
      if (!Object.prototype.hasOwnProperty.call(row.auditAfter, field)) errors.push(`${label}: auditAfter missing ${field}`);
      if (!Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${label}: proposal missing ${field}`);
    }
    if (row.proposal.make !== 'Toyota') errors.push(`${label}: make drift`);
    if (row.proposal.model !== row.model || row.proposal.model !== row.before.model) errors.push(`${label}: model drift`);

    if (row.action === 'keep_audited_correction') {
      if (!equalValue(row.proposal, row.auditAfter)) errors.push(`${label}: keep action changed audited correction`);
      if (row.proposal.status !== 'published') errors.push(`${label}: keep action must remain published`);
    }

    if (row.action === 'uphold_archive_evidence_defect') {
      if (!equalValue(row.proposal, row.auditAfter)) errors.push(`${label}: hold action changed audited record`);
      if (row.proposal.status !== 'archived') errors.push(`${label}: evidence-defect hold must remain archived for review`);
      if (row.redirectTargetId) errors.push(`${label}: non-duplicate hold has redirect target`);
    }

    if (row.action === 'redirect_duplicate') {
      const expectedTarget = REDIRECTS[row.id];
      if (row.redirectTargetId !== expectedTarget) errors.push(`${label}: redirect target mismatch`);
      if (!equalValue(row.redirectTarget, CANONICAL_TARGETS[expectedTarget])) errors.push(`${label}: redirect target metadata mismatch`);
      for (const field of FULL_RECORD_FIELDS.filter((name) => name !== 'relatedIssueIds')) {
        if (!equalValue(row.proposal[field], row.auditAfter[field])) errors.push(`${label}: redirect action changed ${field}`);
      }
      if (row.proposal.status !== 'archived') errors.push(`${label}: redirect source must remain archived`);
      if (!row.proposal.relatedIssueIds.includes(expectedTarget)) errors.push(`${label}: canonical target missing from relatedIssueIds`);
    }

    if (row.action === 'rewrite_and_republish') {
      if (row.proposal.status !== 'published') errors.push(`${label}: republish proposal is not published`);
      if (/\barchived\b/i.test(`${row.proposal.title} ${row.proposal.description} ${row.proposal.solution}`)) errors.push(`${label}: archived label remains visible`);
      if (!equalValue(row.proposal.trims, []) || !equalValue(row.proposal.engines, [])) errors.push(`${label}: applicability arrays must fail open`);
      if (!equalValue(row.proposal.fixParts, []) || !equalValue(row.proposal.communityRecommendations, [])) errors.push(`${label}: commerce must be empty`);
      if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null) errors.push(`${label}: cost claims remain`);
      if (row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${label}: mileage claims remain`);
      if (row.proposal.humanApproved !== false) errors.push(`${label}: proposal incorrectly marked human-approved`);
      if (row.proposal.reportCount !== 0) errors.push(`${label}: reportCount must not encode scraped prevalence`);
      if (!row.proposal.citations.length) errors.push(`${label}: republish proposal lacks a deep citation`);
      const proposalUrls = collectUrls(row.proposal);
      if (proposalUrls.some(isGenericOrSearchCitation)) errors.push(`${label}: generic/search URL remains`);
      for (const excluded of EXCLUDED_CITATION_URLS_BY_ID[row.id] || []) {
        if (proposalUrls.includes(excluded)) errors.push(`${label}: excluded false/unrelated citation remains`);
      }
      if (TITLE_OVERRIDES[row.id] && row.proposal.title !== TITLE_OVERRIDES[row.id]) errors.push(`${label}: title override mismatch`);
      if (YEAR_OVERRIDES[row.id] && !equalValue(row.proposal.years, YEAR_OVERRIDES[row.id])) errors.push(`${label}: year override mismatch`);
    }

    const preferred = PREFERRED_COMPLAINT_ODIS[row.id] || [];
    const research = complaintById.get(row.id);
    for (const odi of preferred) {
      const sample = research?.samples.find((candidate) => candidate.odiNumber === odi);
      if (!sample) errors.push(`${label}: selected ODI ${odi} missing from frozen research`);
      const packetSample = row.evidence?.nhtsaOwnerReports?.find((candidate) => candidate.odiNumber === odi);
      if (!packetSample || !equalValue(packetSample, sample)) errors.push(`${label}: selected ODI ${odi} evidence drifted`);
      if (!row.proposal.citations.some((citation) => citation.title.includes(String(odi)) && citation.url === sample?.queryUrl)) {
        errors.push(`${label}: selected ODI ${odi} citation missing`);
      }
    }
  }

  for (const action of ACTIONS) {
    const actual = packet.rows.filter((row) => row.action === action).length;
    if (packet.summary?.[action] !== actual) errors.push(`summary.${action} mismatch`);
  }
  const expectedCounts = {
    keep_audited_correction: 2,
    rewrite_and_republish: 68,
    redirect_duplicate: 6,
    uphold_archive_evidence_defect: 15,
  };
  for (const [action, count] of Object.entries(expectedCounts)) {
    if (packet.summary?.[action] !== count) errors.push(`${action} count must be ${count}`);
  }
  if (packet.summary?.total !== 91) errors.push('summary.total must be 91');
  return errors;
}

function argValue(args, flag, fallback) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? path.resolve(args[index + 1]) : fallback;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const packetFile = argValue(args, '--packet', DEFAULT_PACKET);
  const reviewFile = argValue(args, '--review', DEFAULT_REVIEW);
  const dispositionsFile = argValue(args, '--dispositions', DEFAULT_DISPOSITIONS);
  const complaintsFile = argValue(args, '--complaints', DEFAULT_COMPLAINTS);
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const review = JSON.parse(fs.readFileSync(reviewFile, 'utf8'));
  const complaints = JSON.parse(fs.readFileSync(complaintsFile, 'utf8'));
  const errors = validatePacket(packet, review, complaints, {
    review: sha256File(reviewFile),
    dispositions: sha256File(dispositionsFile),
    complaints: sha256File(complaintsFile),
  });
  console.log(JSON.stringify({
    passed: errors.length === 0,
    packetFile,
    packetSha256: sha256File(packetFile),
    reviewFile,
    reviewSha256: sha256File(reviewFile),
    complaintsFile,
    complaintsSha256: sha256File(complaintsFile),
    decisionCount: packet.rows?.length || 0,
    errors,
  }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { ACTIONS, collectUrls, validatePacket };
