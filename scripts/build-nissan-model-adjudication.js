/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');
const { getContract } = require('./nissan-model-adjudication-contracts');

function argValue(flag) { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : ''; }
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function citationFor(contract, key) {
  const source = contract.pdfSources[key] || contract.otherSources[key];
  if (!source) throw new Error(`${contract.model}: unknown citation key ${key}`);
  const citation = clone(source);
  delete citation.contains;
  return citation;
}
function citationsFor(contract, id) { return contract.content[id].citations.map((key) => citationFor(contract, key)); }
function commerceDecisionFor(contract, id) {
  const content = contract.content[id];
  return content.commerceDecision || 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part';
}
function proposalFor(contract, record) {
  const content = contract.content[record.id];
  if (!content) throw new Error(`${contract.model}: missing content for ${record.id}`);
  return {
    ...clone(fullRecord(record)),
    description: content.description,
    solution: content.solution,
    confidence: contract.retainedIds.includes(record.id) ? 'high' : 'low',
    symptoms: clone(content.symptoms),
    affectedSystems: clone(content.affectedSystems),
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(contract, record.id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    lastReportedByOwners: '',
    source: 'ai-researched',
    reviewedOn: contract.reviewDate,
    contentUpdatedOn: contract.reviewDate,
    contentUpdateSummary: content.summary,
  };
}
function buildPacket(contract, snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === contract.make && row.model === contract.model).sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== contract.allIds.length || frozenRows.map((row) => row.id).join('|') !== contract.allIds.join('|')) throw new Error(`${contract.model}: frozen coverage does not match ${contract.allIds.length}-row contract`);
  const rows = frozenRows.map((record) => {
    const before = fullRecord(record);
    const proposal = proposalFor(contract, record);
    const retained = contract.retainedIds.includes(record.id);
    return {
      id: record.id,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained,
      identityConflict: retained ? null : contract.content[record.id].conflict,
      reason: retained ? 'Exact primary evidence supports the frozen indexed identity after bounded technical cleanup.' : 'The frozen indexed identity materially exceeds exact manufacturer and federal evidence and remains published pending independent review.',
      evidence: { primaryEvidence: clone(contract.content[record.id].evidence), limitations: 'No owner-frequency rate, universal mechanism, repair price or retail fitment is inferred.' },
      commerceDecision: commerceDecisionFor(contract, record.id),
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });
  const blockerRecordIds = rows.filter((row) => row.identityReviewRequired).map((row) => row.id);
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: contract.reviewDate,
    make: contract.make,
    model: contract.model,
    completionStatement: `All ${rows.length} frozen ${contract.make} ${contract.model} pages are accounted for with indexed identities and vehicle metadata preserved pending review.`,
    applicationGate: { status: blockerRecordIds.length ? 'blocked' : 'pending-independent-approval', blockerRecordIds, reason: blockerRecordIds.length ? `${blockerRecordIds.length} frozen identities exceed exact evidence; no production content write is authorized.` : 'No identity blocker remains, but independent approval is still required before any write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      `All ${rows.length} pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.`,
      'Unsupported report counts are reduced to unknown zero in the proposal, and unknown totals are never rendered or written as "0+ owners" social proof.',
      'Manufacturer communications and recall populations are not converted into owner-report totals or recurrence rates.',
      'A manufacturer bulletin proves only its exact chassis, production window and condition; similar symptoms are not cross-generation proof.',
      'Every named replaceable item has an explicit no-universal-retail-part diagnostic and fitment boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: contract.snapshotFile, snapshotSha256: normalizedFileHash(resolveRepo(contract.snapshotFile)), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: clone(contract.observations),
    pdfSources: clone(contract.pdfSources),
    otherSources: clone(contract.otherSources),
    manufacturerCommunications: { ...clone(contract.bulletinInventory), aliases: clone(contract.modelAliases), searchTerms: clone(contract.searchTerms), requiredDocumentIds: clone(contract.relevantDocumentIds) },
    recallInventory: { ...clone(contract.recallInventory), aliases: clone(contract.modelAliases), campaigns: clone(contract.campaigns) },
    summary: { retain_indexed_identity_and_accuracy_cleanup: contract.retainedIds.length, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: rows.length - contract.retainedIds.length, fabricated_report_counts_proposed_zero: contract.reportCountCleanupIds.length, pages_preserved_published: rows.length, total: rows.length },
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
module.exports = { buildForModel, buildPacket, citationsFor, commerceDecisionFor, proposalFor };
