/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Build a guarded schema-v2 production manifest from independently reviewed
 * proposal packets without replaying byte-identical holds.
 *
 * The packet branch is evidence, not the write source. The live row is locked
 * in as the manifest's exact before-state, and only fields declared by the
 * reviewed packet are overlaid. Mutable report counts and any later cleanup
 * therefore survive.
 *
 * Example:
 *   set KNOWN_ISSUE_ENV_FILE=C:\path\to\.env.local
 *   node scripts/build-reviewed-adjudication-apply-manifest.js \
 *     --source-ref origin/codex/hyundai-deeplink-audit \
 *     --make Hyundai --slug hyundai \
 *     --batch-id reviewed-hyundai-adjudication-2026-08-08 \
 *     --expected-total 242 --expected-writes 55 \
 *     --out data/known-issues-catalog-deeplink-decisions/reviewed-hyundai-adjudication-2026-08-08.json
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  FULL_RECORD_FIELDS,
  claimIdsForRow,
  commerceUrls,
  fullRecordHashes,
  fullRecordSnapshot,
  resolveKnownIssueConnectionString,
  validateManifest,
} = require('./apply-known-issue-catalog-deeplinks');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const FROZEN_FIELDS = new Set([
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds',
]);
const PRESERVED_LIVE_FIELDS = new Set(['fixParts', 'relatedIssueIds']);
const IGNORED_PROPOSAL_FIELDS = new Set(['relatedIssueIds']);
const DEFAULT_HOLD_ACTIONS = new Set(['keep_published_pending_source', 'hold', 'keep']);
const CITATION_TYPE_ALIASES = new Map([
  // The reviewed "government" citations in this batch are non-U.S. recall
  // authorities. Calling them NHTSA would be false attribution; the catalog's
  // schema has a truthful generic recall type for those records.
  ['government', 'recall'],
  ['manufacturer-program', 'manufacturer'],
  ['program', 'manufacturer'],
  ['service-action', 'manufacturer'],
  ['service-bulletin', 'tsb'],
]);

function actionSets(args) {
  const applyActions = new Set((argValue(args, '--apply-actions', false) || 'rewrite_same_identity').split(',').map((value) => value.trim()).filter(Boolean));
  const holdActions = new Set([
    ...DEFAULT_HOLD_ACTIONS,
    ...(argValue(args, '--hold-actions', false) || '').split(',').map((value) => value.trim()).filter(Boolean),
  ]);
  const overlaps = [...applyActions].filter((action) => holdActions.has(action));
  if (overlaps.length) throw new Error(`actions cannot be both apply and hold: ${overlaps.join(', ')}`);
  return { applyActions, holdActions };
}

function argValue(args, flag, required = true) {
  const index = args.indexOf(flag);
  const value = index >= 0 ? args[index + 1] : undefined;
  if (required && (!value || value.startsWith('--'))) throw new Error(`Missing ${flag}`);
  return value;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function stableHash(value) {
  const encoded = JSON.stringify(stableValue(value));
  return crypto.createHash('sha256').update(encoded === undefined ? 'undefined' : encoded).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function reviewedEvidence(row) {
  if (Array.isArray(row.evidence)) return clone(row.evidence);
  if (!row.evidence || typeof row.evidence !== 'object') return [];
  return [
    ...(Array.isArray(row.evidence.primaryEvidence) ? row.evidence.primaryEvidence : []).map((observation) => ({
      kind: 'primary-evidence',
      observation,
    })),
    ...(typeof row.evidence.limitations === 'string' && row.evidence.limitations.trim()
      ? [{ kind: 'evidence-limitation', observation: row.evidence.limitations }]
      : []),
  ];
}

function git(args) {
  return execFileSync('git', args, { cwd: PROJECT_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function resolveCommit(ref) {
  const commit = git(['rev-parse', '--verify', `${ref}^{commit}`]).trim();
  if (!/^[0-9a-f]{40}$/i.test(commit)) throw new Error(`Could not resolve ${ref} to a commit`);
  return commit;
}

function packetFiles(baselineCommit, sourceCommit, slug) {
  const changed = git(['diff', '--name-only', `${baselineCommit}...${sourceCommit}`]).split(/\r?\n/).filter(Boolean);
  const pattern = new RegExp(`^data/known-issue-${slug}(?:-.+)?-adjudication-\\d{4}-\\d{2}-\\d{2}\\.json$`);
  return changed.filter((file) => pattern.test(file)).sort();
}

function selectWrites(rows, applyActions, excludedWriteIds = new Set()) {
  const writeCandidates = rows.filter((row) => applyActions.has(row.action));
  const candidateIds = new Set(writeCandidates.map((row) => row.id));
  const unknownExclusions = [...excludedWriteIds].filter((id) => !candidateIds.has(id));
  if (unknownExclusions.length) throw new Error(`excluded write IDs are not apply candidates: ${unknownExclusions.join(', ')}`);
  return writeCandidates.filter((row) => !excludedWriteIds.has(row.id));
}

function isPacketFilename(file, slug) {
  return new RegExp(`^data/known-issue-${slug}(?:-.+)?-adjudication-\\d{4}-\\d{2}-\\d{2}\\.json$`).test(file);
}

function readPacket(sourceRef, file) {
  return JSON.parse(git(['show', `${sourceRef}:${file}`]));
}

function packetSummary(packet, file = '<packet>') {
  const packetRows = packet.rows || [];
  if (Number.isInteger(packet.summary?.total) && packet.summary.total !== packetRows.length) {
    throw new Error(`${file}: summary total does not equal packet rows`);
  }
  return { ...(packet.summary || {}), total: packetRows.length };
}

function normalizedFileHash(sourceRef, file) {
  return crypto.createHash('sha256').update(git(['show', `${sourceRef}:${file}`]).replace(/\r\n/g, '\n')).digest('hex');
}

function changedFields(before, after) {
  return FULL_RECORD_FIELDS.filter((field) => stableHash(before[field]) !== stableHash(after[field]));
}

function normalizedChangedFields(row) {
  const actual = changedFields(row.before, row.proposal);
  if (Array.isArray(row.changedFields)) assertEqual(`${row.id}: changedFields`, actual, row.changedFields);
  return actual;
}

function assertEqual(label, actual, expected) {
  if (stableHash(actual) !== stableHash(expected)) throw new Error(`${label} mismatch`);
}

function selectRowsSql() {
  return ['id', ...FULL_RECORD_FIELDS].map((field) => `"${field}"`).join(', ');
}

function buildReviewedAfterState(row, current) {
  for (const field of FROZEN_FIELDS) {
    assertEqual(`${row.id}: live ${field}`, current[field], row.before[field]);
    if (!IGNORED_PROPOSAL_FIELDS.has(field) && stableHash(row.proposal[field]) !== stableHash(row.before[field])) {
      throw new Error(`${row.id}: proposal changes ${field}`);
    }
  }
  if (current.status !== 'published') throw new Error(`${row.id}: live row is not published`);

  const after = clone(current);
  for (const field of row.changedFields || []) {
    if (!FULL_RECORD_FIELDS.includes(field)) throw new Error(`${row.id}: unknown changed field ${field}`);
    if (IGNORED_PROPOSAL_FIELDS.has(field)) continue;
    if (PRESERVED_LIVE_FIELDS.has(field)) throw new Error(`${row.id}: cannot change ${field}`);
    if (FROZEN_FIELDS.has(field)) throw new Error(`${row.id}: frozen field ${field} cannot be written`);
    if (!Object.prototype.hasOwnProperty.call(row.proposal, field)) throw new Error(`${row.id}: proposal missing ${field}`);
    assertEqual(`${row.id}: live ${field}`, current[field], row.before[field]);
    after[field] = clone(row.proposal[field]);
  }
  // Independent approval changes the proposal's audit flag only; content and
  // identity remain exactly the reviewed after-state.
  after.humanApproved = true;
  after.citations = (after.citations || []).map((citation) => ({
    ...citation,
    type: CITATION_TYPE_ALIASES.get(citation.type) || citation.type,
  }));

  for (const field of FROZEN_FIELDS) assertEqual(`${row.id}: after ${field}`, after[field], current[field]);
  assertEqual(`${row.id}: after fixParts`, after.fixParts, current.fixParts);
  assertEqual(`${row.id}: after relatedIssueIds`, after.relatedIssueIds, current.relatedIssueIds);
  const currentCommerce = new Set(commerceUrls(current).map((entry) => stableHash(entry)));
  const introducedCommerce = commerceUrls(after).filter((entry) => !currentCommerce.has(stableHash(entry)));
  if (introducedCommerce.length) throw new Error(`${row.id}: reviewed adjudication introduces commerce`);
  if (!Array.isArray(after.citations) || after.citations.length === 0) throw new Error(`${row.id}: no verified citation in after-state`);
  return after;
}

async function main() {
  const args = process.argv.slice(2);
  const sourceRef = argValue(args, '--source-ref');
  const baselineRef = argValue(args, '--baseline-ref', false) || 'origin/main';
  const make = argValue(args, '--make');
  const slug = argValue(args, '--slug');
  const batchId = argValue(args, '--batch-id');
  const outFile = path.resolve(PROJECT_ROOT, argValue(args, '--out'));
  const expectedTotal = Number(argValue(args, '--expected-total'));
  const expectedWrites = Number(argValue(args, '--expected-writes'));
  const reviewDate = argValue(args, '--review-date', false) || new Date().toISOString().slice(0, 10);
  const reviewer = argValue(args, '--reviewer', false) || 'Opus';
  const reviewNote = argValue(args, '--review-note', false)
    || `${reviewer} independently reconciled the ${make} packet set; Devon authorized deployment after review.`;
  const { applyActions, holdActions } = actionSets(args);
  const excludedWriteIds = new Set((argValue(args, '--exclude-write-ids', false) || '')
    .split(',').map((value) => value.trim()).filter(Boolean));

  const sourceCommit = resolveCommit(sourceRef);
  const baselineCommit = resolveCommit(baselineRef);
  const files = packetFiles(baselineCommit, sourceCommit, slug);
  if (files.length === 0) throw new Error(`No ${make} adjudication packets found on ${sourceRef}`);

  const rows = [];
  const packetProvenance = [];
  const seenIds = new Set();
  for (const file of files) {
    const packet = readPacket(sourceCommit, file);
    if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.make !== make) {
      throw new Error(`${file}: invalid proposal contract`);
    }
    const packetRows = packet.rows || [];
    const normalizedSummary = packetSummary(packet, file);
    packetProvenance.push({
      file,
      sha256: normalizedFileHash(sourceCommit, file),
      model: packet.model,
      byModel: packet.byModel || null,
      frozenMakeValues: packet.frozenMakeValues || [packet.make],
      summary: normalizedSummary,
    });
    for (const row of packetRows) {
      if (seenIds.has(row.id)) throw new Error(`${row.id}: duplicate packet row`);
      seenIds.add(row.id);
      if (stableHash(row.before) !== row.beforeSha256) throw new Error(`${row.id}: beforeSha256 mismatch`);
      if (stableHash(row.proposal) !== row.proposalSha256) throw new Error(`${row.id}: proposalSha256 mismatch`);
      const actualChanged = normalizedChangedFields(row);
      if (!applyActions.has(row.action) && !holdActions.has(row.action)) {
        throw new Error(`${row.id}: unclassified action ${row.action}`);
      }
      rows.push({ ...row, changedFields: actualChanged, packetFile: file });
    }
  }

  const writes = selectWrites(rows, applyActions, excludedWriteIds);
  if (rows.length !== expectedTotal) throw new Error(`row count ${rows.length}; expected ${expectedTotal}`);
  if (writes.length !== expectedWrites) throw new Error(`write count ${writes.length}; expected ${expectedWrites}`);
  const frozenMakeCounts = {};
  for (const packet of packetProvenance) {
    const packetCounts = packet.summary && packet.summary.frozen_make_counts;
    if (packetCounts && typeof packetCounts === 'object') {
      for (const [makeValue, count] of Object.entries(packetCounts)) {
        if (!Number.isInteger(count) || count < 0) throw new Error(`${packet.file}: invalid frozen make count`);
        frozenMakeCounts[makeValue] = (frozenMakeCounts[makeValue] || 0) + count;
      }
    } else {
      const total = packet.summary && packet.summary.total;
      if (!Number.isInteger(total) || total < 0) throw new Error(`${packet.file}: missing frozen make counts`);
      frozenMakeCounts[make] = (frozenMakeCounts[make] || 0) + total;
    }
  }
  const frozenMakeValues = Object.keys(frozenMakeCounts).sort();
  if (Object.values(frozenMakeCounts).reduce((sum, count) => sum + count, 0) !== expectedTotal) {
    throw new Error('frozen make counts do not equal packet row count');
  }

  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1 });
  let liveRows;
  let frozenCatalogStatus;
  try {
    const [result, catalogStatus] = await Promise.all([
      pool.query(
        `SELECT ${selectRowsSql()} FROM "KnownIssue" WHERE id = ANY($1::text[]) ORDER BY id`,
        [writes.map((row) => row.id)],
      ),
      pool.query(`SELECT status, count(*)::int AS count FROM "KnownIssue" GROUP BY status ORDER BY status`),
    ]);
    liveRows = result.rows;
    frozenCatalogStatus = Object.fromEntries(catalogStatus.rows.map((row) => [row.status, Number(row.count)]));
  } finally {
    await pool.end();
  }
  if (liveRows.length !== writes.length) throw new Error(`database returned ${liveRows.length}; expected ${writes.length}`);
  const liveById = new Map(liveRows.map((row) => [row.id, fullRecordSnapshot(row)]));

  const issues = writes.map((row) => {
    const current = liveById.get(row.id);
    if (!current) throw new Error(`${row.id}: missing live row`);
    const after = buildReviewedAfterState(row, current);

    return {
      id: row.id,
      disposition: 'no-commerce',
      evidence: [
        ...reviewedEvidence(row),
        {
          kind: 'independent-review',
          verifiedOn: reviewDate,
          observation: `${reviewNote} Source packet: ${row.packetFile}.`,
        },
      ],
      before: { ...fullRecordHashes(current), claimIds: claimIdsForRow(current) },
      after,
    };
  });

  const manifest = {
    schemaVersion: 3,
    auditScope: 'full-record',
    manifestKind: 'known-issues-catalog-deeplinks',
    batchId,
    generatedAt: new Date().toISOString(),
    sourceRef,
    sourceCommit,
    baselineRef,
    baselineCommit,
    packetSlug: slug,
    make,
    frozenMakeValues,
    frozenMakeCounts,
    frozenCatalogStatus,
    approval: {
      reviewer,
      owner: 'Devon',
      reviewDate,
      contract: 'same indexed identity, published status preserved, holds are no-ops, no retail commerce',
      excludedWriteIds: [...excludedWriteIds].sort(),
    },
    packetCount: files.length,
    packetRowCount: rows.length,
    writeRowCount: issues.length,
    heldRowCount: rows.length - issues.length,
    packets: packetProvenance,
    issues,
  };
  const errors = validateManifest(manifest);
  if (errors.length) throw new Error(`generated manifest invalid: ${errors.join('; ')}`);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    outFile: path.relative(PROJECT_ROOT, outFile),
    batchId,
    packetCount: files.length,
    packetRowCount: rows.length,
    writes: issues.length,
    holdsSkipped: rows.length - issues.length,
    manifestSha256: stableHash(manifest),
  }, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = {
  CITATION_TYPE_ALIASES, actionSets, buildReviewedAfterState, changedFields, isPacketFilename, stableHash,
  normalizedChangedFields, packetFiles, packetSummary, resolveCommit, selectWrites,
};
