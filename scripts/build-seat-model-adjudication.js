/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');
const { getContract } = require('./seat-model-adjudication-contracts');
const { assertSeatSnapshot } = require('./seat-snapshot-contract');
const { assertSeatEvidence } = require('./validate-seat-primary-evidence');

function argValue(flag) { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : ''; }
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function citationFor(contract, key) {
  const source = contract.pdfSources[key] || contract.otherSources[key];
  if (!source) throw new Error(`${contract.model}: unknown citation ${key}`);
  const citation = clone(source);
  delete citation.contains;
  delete citation.localVerification;
  return citation;
}

function retainedProposal(contract, record) {
  const content = contract.content[record.id];
  if (!content) throw new Error(`${contract.model}: missing retained content for ${record.id}`);
  const cleanReportCount = contract.reportCountCleanupIds.includes(record.id);
  return {
    ...clone(fullRecord(record)),
    description: content.description,
    solution: content.solution,
    confidence: content.confidence,
    symptoms: clone(content.symptoms),
    affectedSystems: clone(content.affectedSystems),
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: content.citations.map((key) => citationFor(contract, key)),
    communityRecommendations: clone(record.communityRecommendations),
    fixParts: clone(record.fixParts),
    humanApproved: false,
    reportCount: cleanReportCount ? 0 : record.reportCount,
    lastReportedByOwners: cleanReportCount ? '' : record.lastReportedByOwners,
    source: 'ai-researched',
    reviewedOn: contract.reviewDate,
    contentUpdatedOn: contract.reviewDate,
    contentUpdateSummary: content.summary,
  };
}

function buildPacket(contract, snapshot) {
  assertSeatEvidence();
  const seatRows = assertSeatSnapshot(snapshot, resolveRepo(contract.snapshotFile));
  const frozenRows = seatRows
    .filter((row) => row.model === contract.model)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== contract.allIds.length || frozenRows.map((row) => row.id).join('|') !== contract.allIds.join('|')) {
    throw new Error(`${contract.model}: frozen coverage mismatch`);
  }

  const rows = frozenRows.map((record) => {
    const before = fullRecord(record);
    const retained = contract.retainedIds.includes(record.id);
    const proposal = retained ? retainedProposal(contract, record) : clone(before);
    const content = contract.content[record.id];
    return {
      id: record.id,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_byte_identical_pending_identity_policy',
      identityReviewRequired: !retained,
      identityConflict: retained ? null : contract.holdReasons[record.id],
      reason: retained
        ? 'Exact primary evidence supports the frozen indexed identity after bounded body-and-evidence cleanup.'
        : 'The frozen identity exceeds exact evidence. The complete row remains byte-identical and published pending a separately approved identity policy.',
      evidence: retained
        ? { primaryEvidence: clone(content.evidence), limitations: 'No owner-frequency rate, universal fitment, price, DTC or unsupported production scope is inferred.' }
        : { primaryEvidence: [], limitations: contract.holdReasons[record.id] },
      commerceDecision: retained ? content.commerceDecision : 'No audit commerce action; the frozen row, including commerce fields, remains byte-identical.',
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });

  const blockers = rows.filter((row) => row.identityReviewRequired).map((row) => row.id);
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: contract.reviewDate,
    make: contract.make,
    model: contract.model,
    completionStatement: `All ${rows.length} frozen ${contract.make} ${contract.model} pages are accounted for; retained rewrites preserve identity and held rows are byte-identical.`,
    applicationGate: {
      status: blockers.length ? 'blocked' : 'pending-independent-approval',
      blockerRecordIds: blockers,
      reason: blockers.length
        ? `${blockers.length} identities require a separate identity decision; those rows authorize no write. Retained rows still require independent approval.`
        : 'Independent approval is required before any write.',
    },
    safetyContract: [
      'No archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change or related-link change is authorized.',
      'Every held row is a byte-identical no-op, including body, citations, approval state, owner fields and commerce.',
      'Every retained rewrite preserves the full indexed identity, status and all commerce fields.',
      'Unknown report counts remain internal zero and are never rendered or written as "0+ owners" social proof.',
      'A recall or manual instruction is not converted into an owner-report total, failure frequency or all-year population claim.',
      'A source proves only its exact vehicle, equipment, production window and condition; sibling-brand or platform similarity is not SEAT proof.',
      'Every retained solution has an explicit diagnosis/VIN gate and no-universal-retail-part boundary.',
    ],
    source: {
      snapshotFile: contract.snapshotFile,
      snapshotSha256: normalizedFileHash(resolveRepo(contract.snapshotFile)),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: frozenRows.length,
    },
    observations: clone(contract.observations),
    pdfSources: clone(contract.pdfSources),
    otherSources: clone(contract.otherSources),
    evidenceInventory: {
      ...clone(contract.evidenceInventory),
      aliases: clone(contract.modelAliases),
      searchTerms: clone(contract.searchTerms),
    },
    summary: {
      retain_indexed_identity_and_accuracy_cleanup: contract.retainedIds.length,
      hold_indexed_identity_byte_identical_pending_identity_policy: rows.length - contract.retainedIds.length,
      fabricated_report_counts_proposed_zero: contract.reportCountCleanupIds.length,
      pages_preserved_published: rows.length,
      total: rows.length,
    },
    rows,
  };
}

function buildForModel(model) {
  const contract = getContract(model);
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(contract.snapshotFile), 'utf8'));
  return { contract, snapshot, packet: buildPacket(contract, snapshot) };
}

if (require.main === module) {
  const model = argValue('--model');
  if (!model) throw new Error('--model is required');
  const { contract, packet } = buildForModel(model);
  const output = resolveRepo(contract.outputFile);
  fs.writeFileSync(output, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { buildForModel, buildPacket, retainedProposal };
