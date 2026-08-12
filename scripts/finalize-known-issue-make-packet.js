/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Freeze one exact make subset and finalize its reviewed parts packet.
 *
 * This script is staging-only. It never opens a database connection and never
 * invokes the apply script.
 *
 *   node scripts/finalize-known-issue-make-packet.js --freeze-make-source \
 *     --snapshot data/known-issue-part-audit/acura/pending/00-source-snapshot.json \
 *     --dir data/known-issue-part-audit/acura/<full-snapshot-hash> --make Acura
 *
 *   node scripts/finalize-known-issue-make-packet.js --finalize \
 *     --dir data/known-issue-part-audit/acura/<full-snapshot-hash> --make Acura
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  claimIdsForRow,
  fullRecordHashes,
  hashValue,
  productUrlError,
  validateManifest,
  vendorMatchesUrl,
} = require('./apply-known-issue-catalog-deeplinks');
const { buildManifest, componentKey } = require('./build-known-issue-deeplink-manifest');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REVIEWED_FILES = [
  '01-disposition-ledger.json',
  '02-fitment-worklist.json',
  '03-showmetheparts-evidence.json',
  '04-part-proposals.json',
  '05-direct-link-evidence.json',
];
const PACKET_FILES = [
  '00-make-source.json',
  ...REVIEWED_FILES,
  '06-independent-review.json',
  '07-decision-patch.json',
  '08-guarded-manifest.json',
];
const DIAGNOSTIC_ARTIFACT_FILES = [
  'classification-ledger.json',
  'checkpoint.json',
  'diagnostic-tool-evidence.json',
];
// These files form the end-to-end diagnostic rendering path: audit recognition,
// exact tool registry/selection, selected-engine propagation, and the UI that
// decides whether a tool link is rendered. COMPLETE.json binds their bytes so
// a later code edit cannot silently inherit this review.
const DIAGNOSTIC_IMPLEMENTATION_FILES = [
  'src/lib/diagnostic-procedures.js',
  'src/data/diagnostic-tools.ts',
  'src/components/known-issues/IssueDiagnosticTools.tsx',
  'src/components/known-issues/KnownIssueCard.tsx',
  'src/components/known-issues/CategorySection.tsx',
  'src/components/known-issues/ArticleIssuesList.tsx',
  'src/app/garage/[id]/maintenance/page.tsx',
  'src/components/vehicle/VehicleDashboard.tsx',
];
const HASH_RE = /^[a-f0-9]{64}$/;
const REVIEW_READY_STATUS = 'REVIEW_READY_RECONCILED';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sha256File(file) {
  // Every bound input is UTF-8 JSON/JS/TS. Git may materialize the same blob
  // with CRLF on Windows, so line endings are not evidence. Normalize CRLF and
  // lone CR to the repository's LF form; all other bytes remain significant.
  const canonicalText = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  return crypto.createHash('sha256').update(canonicalText, 'utf8').digest('hex');
}

function sha256Files(root, files) {
  return Object.fromEntries(files.map((file) => [file, sha256File(path.join(root, file))]));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, file);
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function exactSet(values, label) {
  const set = new Set(values);
  if (set.size !== values.length) throw new Error(`${label} contains duplicates`);
  return set;
}

function assertSameSet(leftValues, rightValues, label) {
  const left = exactSet(leftValues, `${label} left`);
  const right = exactSet(rightValues, `${label} right`);
  const missing = [...left].filter((value) => !right.has(value));
  const extra = [...right].filter((value) => !left.has(value));
  if (missing.length || extra.length) {
    throw new Error(`${label} set mismatch: missing=${missing.join(',') || 'none'} extra=${extra.join(',') || 'none'}`);
  }
}

function assertHashMap(hashMap, requiredFiles, label) {
  assertSameSet(Object.keys(hashMap || {}), requiredFiles, `${label} files`);
  for (const file of requiredFiles) {
    if (!HASH_RE.test(hashMap[file] || '')) throw new Error(`${label}: ${file} has no SHA-256 binding`);
  }
}

function verifyFrozenRecord(record) {
  const computed = fullRecordHashes(record);
  for (const [field, value] of Object.entries(computed)) {
    if (record.before?.[field] !== value) throw new Error(`${record.id}: frozen ${field} mismatch`);
  }
  if (!sameJson(record.before?.claimIds || [], claimIdsForRow(record))) {
    throw new Error(`${record.id}: frozen claimIds mismatch`);
  }
  return computed;
}

function buildMakeSource(globalSnapshot, make) {
  if (globalSnapshot.snapshotKind !== 'known-issues-catalog-deeplinks' || globalSnapshot.auditScope !== 'full-record') {
    throw new Error('Global source must be a full-record known-issues snapshot');
  }
  const { snapshotHash, ...globalBody } = globalSnapshot;
  if (hashValue(globalBody) !== snapshotHash) throw new Error('Global snapshotHash does not match its body');
  const records = globalSnapshot.records
    .filter((record) => String(record.make).toLowerCase() === make.toLowerCase())
    .sort((left, right) => left.id.localeCompare(right.id))
    .map(clone);
  if (!records.length) throw new Error(`No ${make} records in global snapshot`);
  const recordProvenance = records.map((record) => ({
    id: record.id,
    recordHash: hashValue(record),
    fullRecordHashes: verifyFrozenRecord(record),
    claimIds: clone(record.before.claimIds || []),
  }));
  const body = {
    schemaVersion: 2,
    snapshotKind: 'known-issues-catalog-deeplinks',
    auditScope: 'full-record',
    artifactKind: 'known-issue-make-source',
    snapshotHash,
    globalSnapshotHash: snapshotHash,
    globalGeneratedAt: globalSnapshot.generatedAt,
    source: 'Exact full-record make subset of the immutable global production snapshot',
    make,
    makeKey: make.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    recordCount: records.length,
    recordIds: records.map((record) => record.id),
    recordProvenance,
    records,
  };
  return { ...body, makeSourceHash: hashValue(body) };
}

function validateMakeSource(source, make) {
  if (source.artifactKind !== 'known-issue-make-source' || source.schemaVersion !== 2 || source.auditScope !== 'full-record') {
    throw new Error('Invalid make source artifact');
  }
  const { makeSourceHash, ...body } = source;
  if (hashValue(body) !== makeSourceHash) throw new Error('makeSourceHash does not match source body');
  if (source.make.toLowerCase() !== make.toLowerCase()) throw new Error('Make source make mismatch');
  if (source.snapshotHash !== source.globalSnapshotHash) throw new Error('Make source global snapshot binding mismatch');
  if (source.recordCount !== source.records.length || source.recordCount !== source.recordIds.length) {
    throw new Error('Make source record count mismatch');
  }
  assertSameSet(source.recordIds, source.records.map((record) => record.id), 'make source record IDs');
  assertSameSet(source.recordIds, source.recordProvenance.map((record) => record.id), 'make source provenance IDs');
  const provenance = new Map(source.recordProvenance.map((record) => [record.id, record]));
  for (const record of source.records) {
    if (record.make.toLowerCase() !== make.toLowerCase() || record.status !== 'published') {
      throw new Error(`${record.id}: make source includes an out-of-scope record`);
    }
    const proof = provenance.get(record.id);
    if (proof.recordHash !== hashValue(record)) throw new Error(`${record.id}: exact recordHash mismatch`);
    if (!sameJson(proof.fullRecordHashes, verifyFrozenRecord(record))) throw new Error(`${record.id}: provenance hashes mismatch`);
  }
  return source;
}

function normalizedPartNumber(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function partNumberFor(part) {
  return String(part.oemPartNumber || part.aftermarketXref?.[0] || '').trim();
}

function reviewKey(row) {
  return `${row.proposalId}::${row.partIndex}`;
}

function proposalRows(proposals) {
  return proposals.flatMap((proposal) => proposal.parts.map((part, partIndex) => ({ proposal, part, partIndex })));
}

function normalizedScope(fitment = {}) {
  return {
    years: [...new Set(fitment.years || [])].sort((a, b) => a - b),
    engines: [...new Set(fitment.engines || [])].sort(),
    trims: [...new Set(fitment.trims || [])].sort(),
    drivetrains: [...new Set(fitment.drivetrains || [])].sort(),
    transmissions: [...new Set(fitment.transmissions || [])].sort(),
  };
}

function scopesOverlap(leftFitment, rightFitment) {
  const left = normalizedScope(leftFitment);
  const right = normalizedScope(rightFitment);
  return ['years', 'engines', 'trims', 'drivetrains', 'transmissions'].every((field) => {
    if (!left[field].length || !right[field].length) return true;
    return left[field].some((value) => right[field].includes(value));
  });
}

function scopeKey(fitment) {
  return JSON.stringify(normalizedScope(fitment));
}

function validateExactProductLink(part, review) {
  const expected = normalizedPartNumber(review.partNumber);
  const sourceNumbers = [part.oemPartNumber, ...(part.aftermarketXref || [])].map(normalizedPartNumber);
  if (!expected || !sourceNumbers.includes(expected)) throw new Error(`${reviewKey(review)}: reviewed part number mismatch`);
  if (!/\bexact\b/i.test(review.reviewedSourceEvidence?.directLink || '')) {
    throw new Error(`${reviewKey(review)}: review does not attest an exact product link`);
  }
  const links = part.buyLinks || [];
  if (!links.length) throw new Error(`${reviewKey(review)}: approved row has no direct link`);
  for (const link of links) {
    const decoded = decodeURIComponent(String(link.url || '')).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (link.linkType !== 'product' || link.verified !== true || productUrlError(link.url)) {
      throw new Error(`${reviewKey(review)}: approved link is not a verified product URL`);
    }
    if (!vendorMatchesUrl(link.vendor, link.url)) throw new Error(`${reviewKey(review)}: vendor/link mismatch`);
    if (!decoded.includes(expected)) throw new Error(`${reviewKey(review)}: product URL lacks exact part-number evidence`);
  }
}

function finalPart(candidate) {
  const { part, review, proposal } = candidate;
  const partNumber = partNumberFor(part);
  return {
    component: part.component,
    oemPartNumber: part.oemPartNumber || '',
    aftermarketXref: clone(part.aftermarketXref || []),
    note: `${part.supplier || ''} ${partNumber}. ${review.reason}`.trim(),
    buyLinks: (part.buyLinks || []).map((link) => ({
      vendor: link.vendor,
      url: link.url,
      linkType: 'product',
      verified: true,
      affiliate: /(?:^|\.)ebay\./i.test(new URL(link.url).hostname),
    })),
    fitment: clone(part.fitment || {}),
    variants: [],
    verified: true,
    provenance: `ShowMeTheParts fitment + independent review ${proposal.proposalId}`,
  };
}

function consolidateCandidates(candidates) {
  const byIssueAndComponent = new Map();
  for (const candidate of candidates) {
    const key = `${candidate.review.issueId}::${componentKey(candidate.part.component)}`;
    if (!byIssueAndComponent.has(key)) byIssueAndComponent.set(key, []);
    byIssueAndComponent.get(key).push(candidate);
  }
  const mergedByIssue = new Map();
  for (const candidatesForComponent of byIssueAndComponent.values()) {
    const deduped = [];
    for (const candidate of candidatesForComponent) {
      const identity = `${normalizedPartNumber(candidate.review.partNumber)}::${scopeKey(candidate.part.fitment)}`;
      const existing = deduped.find((row) => row.identity === identity);
      if (existing) {
        existing.reviewIds.push(reviewKey(candidate.review));
        continue;
      }
      deduped.push({ identity, candidate, reviewIds: [reviewKey(candidate.review)] });
    }
    for (let left = 0; left < deduped.length; left += 1) {
      for (let right = left + 1; right < deduped.length; right += 1) {
        if (scopesOverlap(deduped[left].candidate.part.fitment, deduped[right].candidate.part.fitment)) {
          throw new Error(`${deduped[left].candidate.review.issueId}: overlapping approved variants for ${deduped[left].candidate.part.component}`);
        }
      }
    }
    const first = deduped[0].candidate;
    let part;
    if (deduped.length === 1) {
      part = finalPart(first);
      part.provenance += ` (${deduped[0].reviewIds.join(', ')})`;
    } else {
      part = {
        component: first.part.component,
        oemPartNumber: '',
        aftermarketXref: [],
        note: 'Select the exact reviewed variant for the chosen vehicle.',
        buyLinks: [],
        variants: deduped.map(({ candidate, reviewIds }) => {
          const built = finalPart(candidate);
          return {
            scope: scopeKey(built.fitment),
            oemPartNumber: built.oemPartNumber || built.aftermarketXref[0],
            component: built.component,
            aftermarketXref: built.aftermarketXref,
            note: `${built.note} Review: ${reviewIds.join(', ')}`,
            buyLinks: built.buyLinks,
            fitment: built.fitment,
          };
        }),
        verified: true,
        provenance: 'ShowMeTheParts fitment + independent review; disjoint variants',
      };
    }
    const issueId = first.review.issueId;
    if (!mergedByIssue.has(issueId)) mergedByIssue.set(issueId, []);
    mergedByIssue.get(issueId).push({ component: part.component, part });
  }
  return mergedByIssue;
}

function validatePacketSets(source, ledger, worklist, evidence, proposals, links, review) {
  const snapshotHash = source.snapshotHash;
  for (const [label, artifact] of [['ledger', ledger], ['worklist', worklist], ['review', review]]) {
    if (artifact.snapshotHash !== snapshotHash) throw new Error(`${label} snapshotHash mismatch`);
  }
  if (ledger.issueCount !== 70 || ledger.issues.length !== 70 || source.recordCount !== 70) {
    throw new Error('Acura finalization requires exact 70-issue coverage');
  }
  assertSameSet(source.recordIds, ledger.issues.map((issue) => issue.issueId), 'source/ledger issues');
  if (worklist.issueCount !== 70 || worklist.entries.length !== worklist.componentApplicationCount) {
    throw new Error('Worklist counts mismatch');
  }
  if (!evidence.complete || evidence.results.length !== worklist.entries.length || evidence.progress !== `${worklist.entries.length}/${worklist.entries.length}`) {
    throw new Error('Catalog evidence is incomplete');
  }
  assertSameSet(worklist.entries.map((row) => row.workItemId), evidence.results.map((row) => row.workItemId), 'worklist/evidence rows');
  assertSameSet(
    ledger.issues.flatMap((issue) => issue.workItemIds || []),
    worklist.entries.map((row) => row.workItemId),
    'ledger/worklist rows',
  );
  if (proposals.count !== proposals.proposals.length || links.count !== links.proposals.length) throw new Error('Proposal counts mismatch');
  assertSameSet(proposals.proposals.map((row) => row.proposalId), links.proposals.map((row) => row.proposalId), 'proposal/link proposals');
  const sourceRows = proposalRows(links.proposals);
  if (review.reconciliation?.complete !== true
    || review.reconciliation.sourcePartRowCount !== sourceRows.length
    || review.decisions.length !== sourceRows.length) throw new Error('Independent review reconciliation is incomplete');
  assertSameSet(sourceRows.map(({ proposal, partIndex }) => `${proposal.proposalId}::${partIndex}`), review.decisions.map(reviewKey), 'proposal/review rows');
  const existingWorkRows = worklist.entries.filter((row) => row.source === 'existing-fix-part');
  if ((review.existingClaimWorkRowCount || 0) !== existingWorkRows.length
    || (review.existingClaims || []).length !== existingWorkRows.length) {
    throw new Error('Existing-claim review counts mismatch');
  }
  assertSameSet(existingWorkRows.map((row) => row.workItemId), (review.existingClaims || []).map((row) => row.workItemId), 'existing-claim review rows');
  for (const file of REVIEWED_FILES) {
    if (!review.reviewedArtifacts.includes(file)) throw new Error(`Review did not bind ${file}`);
  }
}

function verifyReviewHashes(directory, review) {
  const hashes = {};
  for (const file of REVIEWED_FILES) {
    const actual = sha256File(path.join(directory, file));
    hashes[file] = actual;
    if (review.reviewedArtifactSha256?.[file] !== actual) throw new Error(`${file}: independent-review SHA-256 mismatch`);
  }
  return hashes;
}

function diagnosticSummaryFromRows(rows) {
  const dispositions = rows.flatMap((row) => row.diagnosticDispositions || []);
  const dtcCodes = rows.flatMap((row) => row.dtcCodes || []).map((code) => String(code).trim()).filter(Boolean);
  return {
    issueWithDtcCount: rows.filter((row) => (row.dtcCodes || []).length > 0).length,
    uniqueDtcCount: new Set(dtcCodes).size,
    instructionCount: dispositions.filter((row) => row.source === 'solution').length,
    dtcDispositionCount: dispositions.filter((row) => row.source === 'dtcCodes').length,
    toolLinkedCount: dispositions.filter((row) => row.status === 'tool-linked').length,
    procedureNoToolCount: dispositions.filter((row) => row.status === 'procedure-no-tool').length,
    unresolvedToolHoldCount: dispositions.filter((row) => row.status === 'unresolved-tool-hold').length,
  };
}

function assertObjectValues(actual, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    if (actual?.[key] !== value) throw new Error(`${label}: ${key} expected ${value}, got ${actual?.[key]}`);
  }
}

function validateDiagnosticInputs(source, commerceLedger, inputs, options = {}) {
  const { classification, checkpoint, diagnosticEvidence } = inputs;
  const make = source.make.toLowerCase();
  for (const [label, artifact, kind] of [
    ['classification ledger', classification, 'known-issue-part-classification-ledger'],
    ['diagnostic checkpoint', checkpoint, 'known-issue-part-audit-checkpoint'],
    ['diagnostic evidence', diagnosticEvidence, 'known-issue-diagnostic-tool-evidence'],
  ]) {
    if (artifact?.artifactKind !== kind) throw new Error(`${label} artifact kind mismatch`);
    if (artifact.snapshotHash !== source.snapshotHash) throw new Error(`${label} snapshotHash mismatch`);
    if (String(artifact.make || '').toLowerCase() !== make) throw new Error(`${label} make mismatch`);
  }
  if (classification.makeKey !== source.makeKey || checkpoint.makeKey !== source.makeKey) {
    throw new Error('Diagnostic makeKey mismatch');
  }
  if (classification.issueCount !== 70 || classification.rows?.length !== 70 || checkpoint.issueCount !== 70) {
    throw new Error('Diagnostic reconciliation requires exact 70-issue coverage');
  }
  assertSameSet(source.recordIds, classification.rows.map((row) => row.issueId), 'source/diagnostic issue IDs');
  assertSameSet(commerceLedger.issues.map((row) => row.issueId), classification.rows.map((row) => row.issueId), 'commerce/diagnostic issue IDs');
  if (classification.unclassifiedCount !== 0 || classification.zeroUnclassified !== true) {
    throw new Error('Diagnostic classification has unclassified issues');
  }
  const classifiedTotal = Object.values(classification.counts || {}).reduce((sum, count) => sum + count, 0);
  if (classifiedTotal !== 70) throw new Error(`Diagnostic classification scope total is ${classifiedTotal}, expected 70`);

  const summary = diagnosticSummaryFromRows(classification.rows);
  assertObjectValues(classification.diagnosticSummary, summary, 'classification diagnostic summary');
  assertObjectValues(checkpoint.diagnosticSummary, summary, 'checkpoint diagnostic summary');
  if (checkpoint.status !== 'IN_PROGRESS' || checkpoint.stage !== 'DIAGNOSTIC_DISPOSITION_RECONCILED') {
    throw new Error('Diagnostic checkpoint must remain IN_PROGRESS at DIAGNOSTIC_DISPOSITION_RECONCILED');
  }
  if (checkpoint.unclassifiedCount !== 0 || checkpoint.zeroUnclassified !== true
    || checkpoint.makeIndex !== classification.makeIndex || checkpoint.totalMakes !== classification.totalMakes
    || checkpoint.ledgerFile !== 'classification-ledger.json') {
    throw new Error('Diagnostic checkpoint does not reconcile to the classification ledger');
  }
  const artifactSha256 = Object.fromEntries(DIAGNOSTIC_ARTIFACT_FILES.map((file) => [file, options.inputSha256?.[file]]));
  assertHashMap(artifactSha256, DIAGNOSTIC_ARTIFACT_FILES, 'diagnostic artifacts');
  if (checkpoint.ledgerHash !== artifactSha256['classification-ledger.json']) {
    throw new Error('Diagnostic checkpoint ledgerHash mismatch');
  }
  assertHashMap(options.implementationSha256, DIAGNOSTIC_IMPLEMENTATION_FILES, 'diagnostic implementation');

  const expectedScope = {
    issueCount: 70,
    issuesWithDtcCodes: summary.issueWithDtcCount,
    uniqueDtcCount: summary.uniqueDtcCount,
    solutionInstructionCount: summary.instructionCount,
    dtcDispositionCount: summary.dtcDispositionCount,
    toolLinkedDispositionCount: summary.toolLinkedCount,
    procedureNoToolDispositionCount: summary.procedureNoToolCount,
    unresolvedToolHoldCount: summary.unresolvedToolHoldCount,
    uncoveredDiagnosticInstructionCount: 0,
  };
  assertObjectValues(diagnosticEvidence.scope, expectedScope, 'diagnostic evidence scope');
  if (summary.unresolvedToolHoldCount !== 1 || diagnosticEvidence.holds?.length !== 1) {
    throw new Error('Acura diagnostic reconciliation requires exactly one explicit hold');
  }
  const heldRows = classification.rows.flatMap((row) => (row.diagnosticDispositions || [])
    .filter((disposition) => disposition.status === 'unresolved-tool-hold')
    .map((disposition) => ({ issueId: row.issueId, ...disposition })));
  const evidenceHold = diagnosticEvidence.holds[0];
  const ledgerHold = heldRows[0];
  for (const field of ['issueId', 'procedure', 'excerpt', 'reasonCode', 'toolId', 'productUrl']) {
    if (evidenceHold[field] !== ledgerHold[field]) throw new Error(`Diagnostic hold ${field} mismatch`);
  }

  const reviewedTools = [...(diagnosticEvidence.acuraToolLinks || []), ...(diagnosticEvidence.reusableReviewedTools || [])];
  const toolsById = new Map(reviewedTools.map((tool) => [tool.toolId, tool]));
  if (toolsById.size !== reviewedTools.length) throw new Error('Diagnostic evidence contains duplicate tool IDs');
  for (const disposition of classification.rows.flatMap((row) => row.diagnosticDispositions || [])) {
    if (disposition.status !== 'tool-linked') continue;
    const tool = toolsById.get(disposition.toolId);
    if (!tool || tool.productUrl !== disposition.productUrl) {
      throw new Error(`Diagnostic tool evidence mismatch for ${disposition.toolId}`);
    }
  }
  return {
    status: 'RECONCILED_WITH_EXPLICIT_HOLD',
    artifactSha256,
    implementationSha256: clone(options.implementationSha256),
    scope: expectedScope,
    hold: clone(evidenceHold),
  };
}

function validateUnrelatedCommerce(beforeParts, afterParts, mergedComponents, issueId) {
  const merged = new Set(mergedComponents.map(componentKey));
  for (const part of beforeParts || []) {
    if (merged.has(componentKey(part.component))) continue;
    const after = afterParts.find((candidate) => componentKey(candidate.component) === componentKey(part.component));
    if (!after || !sameJson(after, part)) throw new Error(`${issueId}: unrelated existing fixPart changed`);
  }
}

function finalizePacket(inputs, options = {}) {
  const {
    source, ledger, worklist, evidence, proposals, links, review,
    classification, checkpoint, diagnosticEvidence,
  } = inputs;
  validateMakeSource(source, options.make || source.make);
  validatePacketSets(source, ledger, worklist, evidence, proposals, links, review);
  const diagnosticReconciliation = validateDiagnosticInputs(
    source,
    ledger,
    { classification, checkpoint, diagnosticEvidence },
    options,
  );
  const proposalMap = new Map(links.proposals.map((proposal) => [proposal.proposalId, proposal]));
  const approvedPrimary = [];
  const reviewRows = [];
  for (const decision of review.decisions) {
    const proposal = proposalMap.get(decision.proposalId);
    const part = proposal?.parts?.[decision.partIndex];
    if (!proposal || !part) throw new Error(`${reviewKey(decision)}: reviewed source row missing`);
    const sourcePartNumber = partNumberFor(part);
    if (normalizedPartNumber(sourcePartNumber) !== normalizedPartNumber(decision.partNumber)) {
      throw new Error(`${reviewKey(decision)}: source/review part number mismatch`);
    }
    let reconciliationStatus = 'held';
    if (decision.decision === 'approve' && part.role === 'primary') {
      validateExactProductLink(part, decision);
      approvedPrimary.push({ proposal, part, review: decision });
      reconciliationStatus = 'selected-primary';
    } else if (decision.decision === 'approve') {
      reconciliationStatus = 'excluded-non-primary';
    }
    reviewRows.push({
      proposalId: decision.proposalId,
      partIndex: decision.partIndex,
      issueId: decision.issueId,
      partNumber: decision.partNumber,
      verdict: decision.decision,
      reconciliationStatus,
      reason: decision.reason,
    });
  }
  const mergesByIssue = consolidateCandidates(approvedPrimary);
  const sourceRecords = new Map(source.records.map((record) => [record.id, record]));
  const reviewedOn = String(source.globalGeneratedAt || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedOn)) throw new Error('Make source has no deterministic review date');
  const decisions = [];
  for (const [issueId, mergeFixParts] of [...mergesByIssue].sort(([left], [right]) => left.localeCompare(right))) {
    const record = sourceRecords.get(issueId);
    if (!record) throw new Error(`${issueId}: approved row is outside make source`);
    const componentKeys = mergeFixParts.map((merge) => componentKey(merge.component));
    if (new Set(componentKeys).size !== componentKeys.length) throw new Error(`${issueId}: duplicate stable component merge`);
    decisions.push({
      id: issueId,
      disposition: 'replace',
      decision: 'Keyed-merge only independently approved primary parts with exact direct-product links.',
      evidence: mergeFixParts.flatMap((merge) => (merge.part.buyLinks || []).map((link) => ({
        label: `${merge.part.component} exact product`,
        url: link.url,
      }))),
      mergeFixParts,
      contentUpdatedOn: reviewedOn,
      contentUpdateSummary: 'Added independently reviewed, vehicle-scoped repair-part links.',
    });
  }
  if (!decisions.length) throw new Error('No approved primary rows change fixParts');
  const removalProposals = [];
  for (const claim of review.existingClaims || []) {
    if (claim.verdict !== 'block') continue;
    removalProposals.push({
      issueId: claim.issueId,
      workItemId: claim.workItemId,
      partNumber: claim.partNumber,
      action: 'hold-for-explicit-reviewed-removal',
      applied: false,
      reason: claim.reason,
    });
  }
  const patch = {
    schemaVersion: 2,
    patchKind: 'known-issues-catalog-deeplink-decisions',
    batchId: `${source.makeKey}-parts-${source.snapshotHash.slice(0, 12)}`,
    snapshotHash: source.snapshotHash,
    makeSourceHash: source.makeSourceHash,
    status: REVIEW_READY_STATUS,
    makeComplete: true,
    productionApplied: false,
    diagnosticReconciliation: clone(diagnosticReconciliation),
    decisions,
    removalProposals,
  };
  const manifest = buildManifest(source, patch);
  const manifestErrors = validateManifest(manifest);
  if (manifestErrors.length) throw new Error(`Final manifest invalid: ${manifestErrors.join('; ')}`);
  assertSameSet(decisions.map((decision) => decision.id), manifest.issues.map((issue) => issue.id), 'patch/manifest changed issues');
  for (const manifestIssue of manifest.issues) {
    const record = sourceRecords.get(manifestIssue.id);
    const patchDecision = decisions.find((decision) => decision.id === manifestIssue.id);
    if (sameJson(record.fixParts || [], manifestIssue.after.fixParts || [])) throw new Error(`${manifestIssue.id}: manifest row does not change fixParts`);
    validateUnrelatedCommerce(record.fixParts || [], manifestIssue.after.fixParts || [], patchDecision.mergeFixParts.map((merge) => merge.component), manifestIssue.id);
  }
  const changed = new Set(decisions.map((decision) => decision.id));
  const heldIssues = new Set(reviewRows.filter((row) => row.reconciliationStatus === 'held').map((row) => row.issueId));
  const removalIssues = new Set(removalProposals.map((row) => row.issueId));
  const issueCoverage = ledger.issues.map((issue) => ({
    issueId: issue.issueId,
    disposition: issue.disposition,
    commerceAction: changed.has(issue.issueId)
      ? 'guarded-fixparts-change'
      : removalIssues.has(issue.issueId)
        ? 'existing-claim-removal-held'
        : heldIssues.has(issue.issueId)
          ? 'proposal-held'
          : 'no-fixparts-change',
  }));
  if (issueCoverage.length !== 70 || new Set(issueCoverage.map((row) => row.issueId)).size !== 70) {
    throw new Error('Final reconciliation does not cover exactly 70 Acura issues');
  }
  const reconciliation = {
    schemaVersion: 2,
    artifactKind: 'known-issue-make-parts-reconciliation',
    snapshotHash: source.snapshotHash,
    makeSourceHash: source.makeSourceHash,
    status: REVIEW_READY_STATUS,
    makeComplete: true,
    productionApplied: false,
    diagnosticReconciliation: clone(diagnosticReconciliation),
    counts: {
      issueCount: issueCoverage.length,
      reviewedProposalPartRows: reviewRows.length,
      approvedRows: reviewRows.filter((row) => row.verdict === 'approve').length,
      selectedPrimaryRows: reviewRows.filter((row) => row.reconciliationStatus === 'selected-primary').length,
      excludedApprovedNonPrimaryRows: reviewRows.filter((row) => row.reconciliationStatus === 'excluded-non-primary').length,
      heldProposalRows: reviewRows.filter((row) => row.reconciliationStatus === 'held').length,
      blockedExistingClaimRows: removalProposals.length,
      changedIssueCount: decisions.length,
      mergedStablePartCount: decisions.reduce((sum, decision) => sum + decision.mergeFixParts.length, 0),
      manifestIssueCount: manifest.issues.length,
      overlappingSelectedScopeCount: 0,
    },
    inputSha256: options.inputSha256 || {},
    reviewRows,
    removalProposals,
    issueCoverage,
  };
  patch.reconciliation = clone(reconciliation);
  return { patch, manifest, reconciliation };
}

function buildCompletionArtifact({ source, patch, manifest, artifactSha256, implementationSha256 }) {
  validateMakeSource(source, source.make);
  assertHashMap(artifactSha256, [...PACKET_FILES, ...DIAGNOSTIC_ARTIFACT_FILES], 'completion artifacts');
  assertHashMap(implementationSha256, DIAGNOSTIC_IMPLEMENTATION_FILES, 'completion diagnostic implementation');
  if (patch.snapshotHash !== source.snapshotHash || manifest.snapshotHash !== source.snapshotHash) {
    throw new Error('Completion packet snapshotHash mismatch');
  }
  if (patch.makeSourceHash !== source.makeSourceHash || patch.status !== REVIEW_READY_STATUS
    || patch.makeComplete !== true || patch.productionApplied !== false
    || patch.reconciliation?.status !== REVIEW_READY_STATUS
    || patch.reconciliation?.diagnosticReconciliation?.status !== 'RECONCILED_WITH_EXPLICIT_HOLD') {
    throw new Error('Completion patch is not fully reconciled and review-ready');
  }
  const manifestErrors = validateManifest(manifest);
  if (manifestErrors.length) throw new Error(`Completion manifest invalid: ${manifestErrors.join('; ')}`);
  assertSameSet(patch.decisions.map((row) => row.id), manifest.issues.map((row) => row.id), 'completion patch/manifest issues');
  for (const file of [...PACKET_FILES.slice(0, 7), ...DIAGNOSTIC_ARTIFACT_FILES]) {
    if (patch.reconciliation.inputSha256?.[file] !== artifactSha256[file]) {
      throw new Error(`Completion patch does not bind ${file}`);
    }
  }
  if (!sameJson(patch.reconciliation.diagnosticReconciliation.artifactSha256,
    Object.fromEntries(DIAGNOSTIC_ARTIFACT_FILES.map((file) => [file, artifactSha256[file]])))) {
    throw new Error('Completion diagnostic artifact bindings mismatch');
  }
  if (!sameJson(patch.reconciliation.diagnosticReconciliation.implementationSha256, implementationSha256)) {
    throw new Error('Completion diagnostic implementation bindings mismatch');
  }
  const manifestHash = artifactSha256['08-guarded-manifest.json'];
  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-make-completion',
    status: 'COMPLETE',
    completionState: 'REVIEW_READY_NOT_APPLIED',
    snapshotHash: source.snapshotHash,
    makeSourceHash: source.makeSourceHash,
    make: source.make,
    makeKey: source.makeKey,
    issueCount: source.recordCount,
    manifestFile: '08-guarded-manifest.json',
    manifestHash,
    artifactSha256: clone(artifactSha256),
    diagnosticImplementationSha256: clone(implementationSha256),
    diagnosticScope: clone(patch.reconciliation.diagnosticReconciliation.scope),
    explicitDiagnosticHold: clone(patch.reconciliation.diagnosticReconciliation.hold),
    productionApplied: false,
    productionWriteAuthorized: false,
  };
}

function argValue(args, flag, fallback = '') {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function main() {
  const args = process.argv.slice(2);
  const directoryArg = argValue(args, '--dir');
  const make = argValue(args, '--make');
  if (!directoryArg || !make) throw new Error('--dir and --make are required');
  const directory = path.resolve(PROJECT_ROOT, directoryArg);
  const sourceFile = path.join(directory, '00-make-source.json');
  if (args.includes('--freeze-make-source')) {
    const snapshotArg = argValue(args, '--snapshot');
    if (!snapshotArg) throw new Error('--snapshot is required with --freeze-make-source');
    const globalFile = path.resolve(PROJECT_ROOT, snapshotArg);
    const globalSnapshot = readJson(globalFile);
    const source = buildMakeSource(globalSnapshot, make);
    // Exact-subset proof before the ignored global freeze can be discarded.
    const globalRecords = globalSnapshot.records.filter((record) => String(record.make).toLowerCase() === make.toLowerCase());
    assertSameSet(globalRecords.map((record) => record.id), source.records.map((record) => record.id), 'global/make-source records');
    const globalById = new Map(globalRecords.map((record) => [record.id, record]));
    for (const record of source.records) if (!sameJson(globalById.get(record.id), record)) throw new Error(`${record.id}: make source is not an exact global subset`);
    writeJsonAtomic(sourceFile, source);
    console.log(JSON.stringify({ output: path.relative(PROJECT_ROOT, sourceFile), recordCount: source.recordCount, makeSourceHash: source.makeSourceHash }, null, 2));
    if (!args.includes('--finalize')) return;
  }
  if (!args.includes('--finalize')) throw new Error('Specify --freeze-make-source and/or --finalize');
  const source = validateMakeSource(readJson(sourceFile), make);
  const files = {
    source: '00-make-source.json',
    ledger: '01-disposition-ledger.json',
    worklist: '02-fitment-worklist.json',
    evidence: '03-showmetheparts-evidence.json',
    proposals: '04-part-proposals.json',
    links: '05-direct-link-evidence.json',
    review: '06-independent-review.json',
    classification: 'classification-ledger.json',
    checkpoint: 'checkpoint.json',
    diagnosticEvidence: 'diagnostic-tool-evidence.json',
  };
  const inputSha256 = { [files.source]: sha256File(sourceFile) };
  const inputs = { source };
  for (const [key, file] of Object.entries(files)) {
    if (key === 'source') continue;
    inputs[key] = readJson(path.join(directory, file));
  }
  Object.assign(inputSha256, verifyReviewHashes(directory, inputs.review));
  inputSha256[files.review] = sha256File(path.join(directory, files.review));
  for (const file of DIAGNOSTIC_ARTIFACT_FILES) inputSha256[file] = sha256File(path.join(directory, file));
  const implementationSha256 = sha256Files(PROJECT_ROOT, DIAGNOSTIC_IMPLEMENTATION_FILES);
  const result = finalizePacket(inputs, { make, inputSha256, implementationSha256 });
  const patchFile = path.join(directory, '07-decision-patch.json');
  const manifestFile = path.join(directory, '08-guarded-manifest.json');
  writeJsonAtomic(patchFile, result.patch);
  writeJsonAtomic(manifestFile, result.manifest);

  // Re-read and recompute the entire packet before minting COMPLETE. This
  // makes 07/08 part of the proof rather than trusting the in-memory objects
  // that were about to be written.
  const diskJson = Object.fromEntries(
    [...PACKET_FILES, ...DIAGNOSTIC_ARTIFACT_FILES]
      .map((file) => [file, readJson(path.join(directory, file))]),
  );
  const diskInputs = {
    source: diskJson['00-make-source.json'],
    ledger: diskJson['01-disposition-ledger.json'],
    worklist: diskJson['02-fitment-worklist.json'],
    evidence: diskJson['03-showmetheparts-evidence.json'],
    proposals: diskJson['04-part-proposals.json'],
    links: diskJson['05-direct-link-evidence.json'],
    review: diskJson['06-independent-review.json'],
    classification: diskJson['classification-ledger.json'],
    checkpoint: diskJson['checkpoint.json'],
    diagnosticEvidence: diskJson['diagnostic-tool-evidence.json'],
  };
  const diskInputSha256 = sha256Files(directory, [...PACKET_FILES.slice(0, 7), ...DIAGNOSTIC_ARTIFACT_FILES]);
  verifyReviewHashes(directory, diskInputs.review);
  const recomputed = finalizePacket(diskInputs, { make, inputSha256: diskInputSha256, implementationSha256 });
  if (!sameJson(recomputed.patch, diskJson['07-decision-patch.json'])
    || !sameJson(recomputed.manifest, diskJson['08-guarded-manifest.json'])) {
    throw new Error('On-disk 07/08 do not exactly match deterministic reconciliation');
  }
  const artifactSha256 = sha256Files(directory, [...PACKET_FILES, ...DIAGNOSTIC_ARTIFACT_FILES]);
  const complete = buildCompletionArtifact({
    source: diskInputs.source,
    patch: diskJson['07-decision-patch.json'],
    manifest: diskJson['08-guarded-manifest.json'],
    artifactSha256,
    implementationSha256,
  });
  const completeFile = path.join(directory, 'COMPLETE.json');
  writeJsonAtomic(completeFile, complete);
  console.log(JSON.stringify({
    patch: path.relative(PROJECT_ROOT, patchFile),
    manifest: path.relative(PROJECT_ROOT, manifestFile),
    complete: path.relative(PROJECT_ROOT, completeFile),
    status: result.reconciliation.status,
    completionState: complete.completionState,
    counts: result.reconciliation.counts,
  }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

module.exports = {
  DIAGNOSTIC_ARTIFACT_FILES,
  DIAGNOSTIC_IMPLEMENTATION_FILES,
  PACKET_FILES,
  assertSameSet,
  buildCompletionArtifact,
  buildMakeSource,
  consolidateCandidates,
  finalizePacket,
  scopesOverlap,
  sha256File,
  validateDiagnosticInputs,
  validateMakeSource,
  verifyReviewHashes,
};
