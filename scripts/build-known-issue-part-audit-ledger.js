#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Build one deterministic, snapshot-only Known Issue classification ledger.
 *
 * This command deliberately has no database or network dependency. It accepts
 * the frozen schema-v2 snapshot produced by audit-known-issue-catalog-deeplinks
 * and writes only review artifacts under data/known-issue-part-audit/.
 *
 *   node scripts/build-known-issue-part-audit-ledger.js \
 *     --snapshot data/known-issues-catalog-deeplink-snapshot.json \
 *     --disposition data/known-issue-part-audit/acura/<hash>/01-disposition-ledger.json \
 *     --make Acura
 *
 * The disposition input from buildFitmentPacket is canonical. This script adds
 * diagnostic-tool/no-tool/hold dispositions without independently reclassifying
 * repair commerce, and it writes only an IN_PROGRESS stage checkpoint.
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  PROCEDURE_TOOL_IDS,
  TOOL_PRODUCT_URLS,
  diagnosticDispositionsForIssue,
} = require('../src/lib/diagnostic-procedures');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUTPUT_ROOT = path.join(PROJECT_ROOT, 'data', 'known-issue-part-audit');
const HASH_RE = /^[a-f0-9]{64}$/;
const CLASSIFICATIONS = Object.freeze([
  'buyable',
  'diagnosis-dependent',
  'recall/dealer',
  'service/tool/fluid',
  'no-commerce',
]);
const CLASSIFICATION_SET = new Set(CLASSIFICATIONS);


function hashValue(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function canonicalHash(value) {
  return hashValue(stableValue(value));
}

function sha256File(file) {
  const canonicalText = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  return crypto.createHash('sha256').update(canonicalText, 'utf8').digest('hex');
}

function makeKey(value) {
  return String(value || '').trim().toLocaleLowerCase('en-US');
}

function compareText(left, right) {
  const a = makeKey(left);
  const b = makeKey(right);
  if (a < b) return -1;
  if (a > b) return 1;
  return String(left) < String(right) ? -1 : String(left) > String(right) ? 1 : 0;
}

function canonicalMakeLabels(records) {
  const labels = new Map();
  for (const record of records || []) {
    const raw = String(record?.make ?? record?.vehicle?.make ?? '').trim();
    const key = makeKey(raw);
    if (!key) throw new Error(`Snapshot record ${record?.id || '<missing-id>'} has no make.`);
    if (!labels.has(key)) labels.set(key, new Set());
    labels.get(key).add(raw);
  }
  return new Map([...labels.entries()].map(([key, values]) => [key, [...values].sort(compareText)[0]]));
}

/** Acura is the explicit starting checkpoint; all remaining makes are ordinal. */
function enumerateMakes(records) {
  const labels = canonicalMakeLabels(records);
  return [...labels.entries()]
    .map(([key, make]) => ({ key, make }))
    .sort((left, right) => {
      if (left.key === 'acura' && right.key !== 'acura') return -1;
      if (right.key === 'acura' && left.key !== 'acura') return 1;
      return compareText(left.make, right.make);
    });
}

function baseMakeSlug(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown-make';
}

function makeSlug(entry, makes) {
  const base = baseMakeSlug(entry.make);
  const collisions = makes.filter((candidate) => baseMakeSlug(candidate.make) === base);
  return collisions.length > 1 ? `${base}-${hashValue(entry.key).slice(0, 8)}` : base;
}

function snapshotBodyHash(snapshot) {
  const body = { ...snapshot };
  delete body.snapshotHash;
  return hashValue(body);
}

function loadFrozenSnapshot(snapshotPath) {
  const absolute = path.resolve(PROJECT_ROOT, snapshotPath);
  const snapshot = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (!snapshot || !Array.isArray(snapshot.records)) throw new Error('Frozen snapshot must contain records[].');
  if (!HASH_RE.test(snapshot.snapshotHash || '')) throw new Error('Frozen snapshot must contain a 64-character snapshotHash.');
  if (snapshot.artifactKind === 'known-issue-make-source') {
    const { makeSourceHash, ...body } = snapshot;
    if (!HASH_RE.test(makeSourceHash || '') || hashValue(body) !== makeSourceHash) {
      throw new Error('Frozen make source hash mismatch.');
    }
    if (snapshot.globalSnapshotHash !== snapshot.snapshotHash
      || snapshot.recordCount !== snapshot.records.length
      || snapshot.recordCount !== snapshot.recordIds?.length) {
      throw new Error('Frozen make source inventory binding mismatch.');
    }
    const recordIds = snapshot.records.map((record) => String(record.id || '').trim());
    if (new Set(recordIds).size !== recordIds.length
      || [...recordIds].sort(compareText).join('\n') !== [...snapshot.recordIds].sort(compareText).join('\n')) {
      throw new Error('Frozen make source record IDs mismatch.');
    }
    return { snapshot, snapshotHash: snapshot.snapshotHash };
  }
  const actualHash = snapshotBodyHash(snapshot);
  if (actualHash !== snapshot.snapshotHash) {
    throw new Error(`Frozen snapshot hash mismatch: declared ${snapshot.snapshotHash}, computed ${actualHash}.`);
  }
  return { snapshot, snapshotHash: actualHash };
}

function loadCanonicalDisposition(dispositionPath, snapshotHash, make) {
  if (!String(dispositionPath || '').trim()) throw new Error('--disposition is required.');
  const absolute = path.resolve(PROJECT_ROOT, dispositionPath);
  const ledger = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  if (ledger?.artifactKind !== 'known-issue-make-disposition-ledger') {
    throw new Error('Canonical disposition input has the wrong artifactKind.');
  }
  if (ledger.snapshotHash !== snapshotHash) throw new Error('Canonical disposition snapshotHash mismatch.');
  if (makeKey(ledger.make) !== makeKey(make)) throw new Error('Canonical disposition make mismatch.');
  if (!Array.isArray(ledger.issues)) throw new Error('Canonical disposition input must contain issues[].');
  return ledger;
}

function sortedStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value).trim()).filter(Boolean))]
    .sort(compareText);
}

function sortedYears(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Number.isInteger))].sort((a, b) => a - b);
}

function recordMake(record) {
  return String(record?.make ?? record?.vehicle?.make ?? '').trim();
}

function auditRow(record, canonicalDisposition) {
  const id = String(record?.id || '').trim();
  if (!id) throw new Error('Every frozen snapshot record must have an id.');
  const solution = String(record?.solution || '');
  const dtcCodes = sortedStrings(record?.dtcCodes);
  return {
    issueId: id,
    make: recordMake(record),
    model: String(record?.model ?? record?.vehicle?.model ?? '').trim(),
    years: sortedYears(record?.years ?? record?.vehicle?.years),
    trims: sortedStrings(record?.trims ?? record?.vehicle?.trims),
    engines: sortedStrings(record?.engines ?? record?.vehicle?.engines),
    title: String(record?.title || '').trim(),
    howToFix: solution,
    dtcCodes,
    diagnosticDispositions: diagnosticDispositionsForIssue(solution, dtcCodes, {
      engines: sortedStrings(record?.engines ?? record?.vehicle?.engines),
    }),
    existingCommerceClaimIds: sortedStrings((record?.claims || []).map((claim) => claim?.claimId)),
    disposition: canonicalDisposition.disposition,
    dispositionReason: canonicalDisposition.reason,
    prescriptionCount: canonicalDisposition.prescriptionCount,
    existingFixPartCount: canonicalDisposition.existingFixPartCount,
    workItemIds: sortedStrings(canonicalDisposition.workItemIds),
  };
}

function diagnosticSummary(rows) {
  const dispositions = rows.flatMap((row) => row.diagnosticDispositions || []);
  return {
    issueWithDtcCount: rows.filter((row) => row.dtcCodes.length > 0).length,
    uniqueDtcCount: new Set(rows.flatMap((row) => row.dtcCodes)).size,
    instructionCount: dispositions.filter((item) => item.source === 'solution').length,
    dtcDispositionCount: dispositions.filter((item) => item.source === 'dtcCodes').length,
    toolLinkedCount: dispositions.filter((item) => item.status === 'tool-linked').length,
    procedureNoToolCount: dispositions.filter((item) => item.status === 'procedure-no-tool').length,
    unresolvedToolHoldCount: dispositions.filter((item) => item.status === 'unresolved-tool-hold').length,
  };
}

function compareAuditRows(left, right) {
  return compareText(left.model, right.model)
    || ((left.years[0] ?? Number.MAX_SAFE_INTEGER) - (right.years[0] ?? Number.MAX_SAFE_INTEGER))
    || compareText(left.issueId, right.issueId);
}

function classificationCounts(rows) {
  return Object.fromEntries(CLASSIFICATIONS.map((classification) => [
    classification,
    rows.filter((row) => row.disposition === classification).length,
  ]));
}

function validateLedger(ledger, expectedIssueIds) {
  const errors = [];
  const rows = Array.isArray(ledger?.rows) ? ledger.rows : [];
  const expected = [...expectedIssueIds].sort(compareText);
  const actual = rows.map((row) => row.issueId).sort(compareText);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) errors.push('ledger issue ids do not exactly cover the selected make');
  if (new Set(actual).size !== actual.length) errors.push('ledger contains duplicate issue ids');

  const unclassified = [];
  const invalidDiagnosticDispositions = [];
  const knownToolIds = new Set([
    ...Object.values(PROCEDURE_TOOL_IDS),
    'ancel-ad310',
    'autel-mk808s',
  ]);
  for (const row of rows) {
    if (!CLASSIFICATION_SET.has(row.disposition)
      || !String(row.dispositionReason || '').trim()) {
      unclassified.push(row.issueId || '<missing-id>');
    }
    if (!Array.isArray(row.dtcCodes) || !Array.isArray(row.diagnosticDispositions)) {
      invalidDiagnosticDispositions.push(`${row.issueId || '<missing-id>'}:missing-arrays`);
      continue;
    }
    for (const disposition of row.diagnosticDispositions) {
      const validStatus = ['tool-linked', 'procedure-no-tool', 'unresolved-tool-hold'].includes(disposition?.status);
      const hasEvidence = ['solution', 'dtcCodes'].includes(disposition?.source)
        && String(disposition?.procedure || '').trim()
        && String(disposition?.reasonCode || '').trim()
        && String(disposition?.excerpt || '').trim();
      const validTool = disposition?.status === 'tool-linked'
        ? knownToolIds.has(disposition?.toolId)
          && disposition?.productUrl === TOOL_PRODUCT_URLS[disposition.toolId]
          && /^https:\/\//.test(disposition.productUrl)
          && !/[?&](?:q|query|search|keyword|keywords|_nkw|k|term)=/i.test(disposition.productUrl)
          && !/\/(?:search|category|categories|catalog|collections?)(?:\/|\?|$)/i.test(disposition.productUrl)
        : disposition?.toolId === null && disposition?.productUrl === null;
      if (!validStatus || !hasEvidence || !validTool) {
        invalidDiagnosticDispositions.push(`${row.issueId || '<missing-id>'}:${disposition?.procedure || '<missing-procedure>'}`);
      }
    }
  }
  if (unclassified.length) errors.push(`unclassified rows: ${unclassified.join(', ')}`);
  if (invalidDiagnosticDispositions.length) {
    errors.push(`invalid diagnostic dispositions: ${invalidDiagnosticDispositions.join(', ')}`);
  }
  if (ledger.zeroUnclassified !== true || ledger.unclassifiedCount !== 0) errors.push('zero-unclassified gate is not closed');
  if (JSON.stringify(ledger.counts) !== JSON.stringify(classificationCounts(rows))) errors.push('classification counts do not match rows');
  if (JSON.stringify(ledger.diagnosticSummary) !== JSON.stringify(diagnosticSummary(rows))) {
    errors.push('diagnostic summary does not match rows');
  }
  if (errors.length) throw new Error(`Invalid classification ledger: ${errors.join('; ')}`);
  return true;
}

function jsonText(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeAtomicIfChanged(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === contents) return false;
  const temp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temp, contents, 'utf8');
  fs.renameSync(temp, file);
  return true;
}

function checkpointFiles(outputRoot, makeEntry, makes, snapshotHash) {
  const directory = path.join(outputRoot, makeSlug(makeEntry, makes), snapshotHash);
  return {
    directory,
    ledger: path.join(directory, 'classification-ledger.json'),
    checkpoint: path.join(directory, 'checkpoint.json'),
    complete: path.join(directory, 'COMPLETE.json'),
  };
}

function resolveBoundFile(root, relativeFile, label) {
  if (typeof relativeFile !== 'string' || !relativeFile.trim() || path.isAbsolute(relativeFile)) {
    throw new Error(`${label} must be a relative path.`);
  }
  const absoluteRoot = path.resolve(root);
  const absolute = path.resolve(absoluteRoot, relativeFile);
  if (absolute === absoluteRoot || !absolute.startsWith(`${absoluteRoot}${path.sep}`)
    || !fs.statSync(absolute, { throwIfNoEntry: false })?.isFile()) {
    throw new Error(`${label} is missing or escapes its binding root.`);
  }
  return absolute;
}

function verifyDiskHashMap(hashMap, root, label) {
  const entries = Object.entries(hashMap || {});
  if (entries.length === 0) throw new Error(`${label} has no file bindings.`);
  for (const [file, expected] of entries) {
    if (!HASH_RE.test(expected || '')) throw new Error(`${label}.${file} has no SHA-256 binding.`);
    const actual = sha256File(resolveBoundFile(root, file, `${label}.${file}`));
    if (actual !== expected) throw new Error(`${label}.${file} drifted on disk.`);
  }
}

function requireCompleteCheckpoint(outputRoot, makeEntry, makes, snapshotHash, projectRoot = PROJECT_ROOT) {
  const files = checkpointFiles(outputRoot, makeEntry, makes, snapshotHash);
  if (!fs.existsSync(files.complete)) {
    throw new Error(`Cannot audit a later make: ${makeEntry.make} has no COMPLETE checkpoint for snapshot ${snapshotHash}.`);
  }
  let checkpoint;
  try {
    checkpoint = JSON.parse(fs.readFileSync(files.complete, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot audit a later make: ${makeEntry.make} checkpoint is unreadable (${error.message}).`);
  }
  const requiredArtifacts = [
    '00-make-source.json',
    '01-disposition-ledger.json',
    '02-fitment-worklist.json',
    '03-showmetheparts-evidence.json',
    '04-part-proposals.json',
    '05-direct-link-evidence.json',
    '06-independent-review.json',
    '07-decision-patch.json',
    '08-guarded-manifest.json',
    'classification-ledger.json',
    'checkpoint.json',
    'diagnostic-tool-evidence.json',
  ];
  const artifactFiles = Object.keys(checkpoint.artifactSha256 || {}).sort(compareText);
  const expectedFiles = [...requiredArtifacts].sort(compareText);
  const completionBody = { ...checkpoint };
  delete completionBody.completionHash;
  const completionHash = canonicalHash(completionBody);
  const implementationHashes = Object.values(checkpoint.diagnosticImplementationSha256 || {});
  const commerceImplementationHashes = Object.values(checkpoint.commercePipelineImplementationSha256 || {});
  const completionStateMatchesRelease = checkpoint.releaseBlocked === true
    ? checkpoint.completionState === 'AUDIT_COMPLETE_RELEASE_BLOCKED'
    : checkpoint.releaseBlocked === false
      && checkpoint.completionState === 'AUDIT_COMPLETE_RELEASE_READY';
  if (checkpoint.schemaVersion !== 2
    || checkpoint.artifactKind !== 'known-issue-make-completion'
    || checkpoint.status !== 'AUDIT_COMPLETE'
    || checkpoint.auditComplete !== true
    || !completionStateMatchesRelease
    || checkpoint.snapshotHash !== snapshotHash
    || checkpoint.makeKey !== makeEntry.key
    || checkpoint.manifestFile !== '08-guarded-manifest.json'
    || !HASH_RE.test(checkpoint.makeSourceHash || '')
    || !HASH_RE.test(checkpoint.manifestHash || '')
    || JSON.stringify(artifactFiles) !== JSON.stringify(expectedFiles)
    || requiredArtifacts.some((file) => !HASH_RE.test(checkpoint.artifactSha256[file] || ''))
    || checkpoint.artifactSha256['08-guarded-manifest.json'] !== checkpoint.manifestHash
    || Object.keys(checkpoint.artifactSha256 || {}).some((file) => path.basename(file).toUpperCase() === 'COMPLETE.JSON')
    || !HASH_RE.test(checkpoint.completionHash || '')
    || checkpoint.completionHash !== completionHash
    || implementationHashes.length === 0
    || implementationHashes.some((hash) => !HASH_RE.test(hash || ''))
    || commerceImplementationHashes.length === 0
    || commerceImplementationHashes.some((hash) => !HASH_RE.test(hash || ''))
    || checkpoint.diagnosticScope?.issueCount !== checkpoint.issueCount
    || checkpoint.diagnosticScope?.uncoveredDiagnosticInstructionCount !== 0
    || checkpoint.productionApplied !== false
    || checkpoint.productionWriteAuthorized !== false) {
    throw new Error(`Cannot audit a later make: ${makeEntry.make} checkpoint is not a valid COMPLETE checkpoint.`);
  }
  try {
    verifyDiskHashMap(checkpoint.artifactSha256, files.directory, 'artifactSha256');
    verifyDiskHashMap(checkpoint.diagnosticImplementationSha256, projectRoot, 'diagnosticImplementationSha256');
    verifyDiskHashMap(
      checkpoint.commercePipelineImplementationSha256,
      projectRoot,
      'commercePipelineImplementationSha256',
    );
    const source = JSON.parse(fs.readFileSync(
      resolveBoundFile(files.directory, '00-make-source.json', 'make source'),
      'utf8',
    ));
    const { makeSourceHash, ...sourceBody } = source;
    if (hashValue(sourceBody) !== makeSourceHash
      || source.snapshotHash !== checkpoint.snapshotHash
      || makeSourceHash !== checkpoint.makeSourceHash
      || makeKey(source.make) !== makeEntry.key
      || source.makeKey !== makeEntry.key) {
      throw new Error('make source binding drifted on disk.');
    }
  } catch (error) {
    throw new Error(`Cannot audit a later make: ${makeEntry.make} checkpoint bindings are stale (${error.message}).`);
  }
}

function buildMakeLedger({ snapshot, snapshotHash, makeEntry, makeIndex, makes, canonicalDispositionLedger }) {
  const selectedRecords = snapshot.records.filter((record) => makeKey(recordMake(record)) === makeEntry.key);
  const canonicalById = new Map(canonicalDispositionLedger.issues.map((issue) => [String(issue.issueId), issue]));
  const expectedIds = selectedRecords.map((record) => String(record.id || '').trim()).sort(compareText);
  const dispositionIds = [...canonicalById.keys()].sort(compareText);
  if (JSON.stringify(expectedIds) !== JSON.stringify(dispositionIds)) {
    throw new Error('Canonical disposition input does not exactly cover the selected make.');
  }
  const rows = selectedRecords.map((record) => auditRow(record, canonicalById.get(String(record.id)))).sort(compareAuditRows);
  const ledger = {
    schemaVersion: 1,
    artifactKind: 'known-issue-part-classification-ledger',
    snapshotHash,
    make: makeEntry.make,
    makeKey: makeEntry.key,
    makeIndex,
    totalMakes: makes.length,
    issueCount: rows.length,
    classifications: CLASSIFICATIONS,
    counts: classificationCounts(rows),
    diagnosticSummary: diagnosticSummary(rows),
    unclassifiedCount: 0,
    zeroUnclassified: true,
    rows,
  };
  validateLedger(ledger, selectedRecords.map((record) => String(record.id || '').trim()));
  return ledger;
}

function runAudit({ snapshotPath, dispositionPath, make, outputRoot = DEFAULT_OUTPUT_ROOT, projectRoot = PROJECT_ROOT }) {
  if (!String(snapshotPath || '').trim()) throw new Error('--snapshot is required.');
  if (!String(make || '').trim()) throw new Error('--make is required.');
  const { snapshot, snapshotHash } = loadFrozenSnapshot(snapshotPath);
  const makes = enumerateMakes(snapshot.records);
  if (makes.length === 0) throw new Error('Frozen snapshot has no makes.');
  if (makes.some((entry) => entry.key === 'acura') && makes[0].key !== 'acura') {
    throw new Error('Canonical make order must begin with Acura.');
  }

  const requestedKey = makeKey(make);
  const makeIndex = makes.findIndex((entry) => entry.key === requestedKey);
  if (makeIndex < 0) throw new Error(`Make not found in frozen snapshot: ${make}.`);
  for (const priorMake of makes.slice(0, makeIndex)) {
    requireCompleteCheckpoint(outputRoot, priorMake, makes, snapshotHash, projectRoot);
  }

  const makeEntry = makes[makeIndex];
  const canonicalDispositionLedger = loadCanonicalDisposition(dispositionPath, snapshotHash, makeEntry.make);
  const ledger = buildMakeLedger({ snapshot, snapshotHash, makeEntry, makeIndex, makes, canonicalDispositionLedger });
  const files = checkpointFiles(outputRoot, makeEntry, makes, snapshotHash);
  const ledgerContents = jsonText(ledger);
  writeAtomicIfChanged(files.ledger, ledgerContents);
  const checkpoint = {
    schemaVersion: 1,
    artifactKind: 'known-issue-part-audit-checkpoint',
    status: 'IN_PROGRESS',
    stage: 'DIAGNOSTIC_DISPOSITION_RECONCILED',
    snapshotHash,
    make: makeEntry.make,
    makeKey: makeEntry.key,
    makeIndex,
    totalMakes: makes.length,
    issueCount: ledger.issueCount,
    diagnosticSummary: ledger.diagnosticSummary,
    unclassifiedCount: 0,
    zeroUnclassified: true,
    ledgerFile: 'classification-ledger.json',
    ledgerHash: hashValue(ledgerContents),
    completionRequirement: 'A separate COMPLETE.json is written only after fitment, exact links, independent review, reconciliation, and guarded manifest.',
  };
  writeAtomicIfChanged(files.checkpoint, jsonText(checkpoint));

  return {
    make: makeEntry.make,
    makeIndex,
    totalMakes: makes.length,
    snapshotHash,
    issueCount: ledger.issueCount,
    zeroUnclassified: true,
    output: path.relative(PROJECT_ROOT, files.directory),
  };
}

function argValue(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : '';
}

function main() {
  const args = process.argv.slice(2);
  const result = runAudit({
    snapshotPath: argValue(args, '--snapshot'),
    make: argValue(args, '--make'),
    dispositionPath: argValue(args, '--disposition'),
  });
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

module.exports = {
  CLASSIFICATIONS,
  auditRow,
  buildMakeLedger,
  checkpointFiles,
  diagnosticSummary,
  enumerateMakes,
  hashValue,
  loadFrozenSnapshot,
  makeKey,
  makeSlug,
  runAudit,
  snapshotBodyHash,
  canonicalHash,
  sha256File,
  validateLedger,
};
