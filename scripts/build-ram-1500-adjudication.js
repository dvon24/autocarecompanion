/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const contract = require('./ram-1500-adjudication-contract');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');

function resolveRepo(file) {
  return path.resolve(__dirname, '..', file);
}

function citationFor(key) {
  const source = contract.pdfSources[key] || contract.otherSources[key];
  if (!source) throw new Error(`${contract.model}: unknown citation ${key}`);
  const citation = clone(source);
  delete citation.contains;
  return citation;
}

function citationsFor(id) {
  return contract.content[id].citations.map(citationFor);
}

function commerceDecisionFor(id) {
  return contract.content[id].commerceDecision || 'failure path, component, part number and VIN fitment remain unresolved; no universal retail part';
}

function proposalFor(record) {
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
    citations: citationsFor(record.id),
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

function frozenRows(snapshot) {
  return snapshot.records
    .filter((row) => contract.frozenMakeValues.includes(row.make) && row.model === contract.model)
    .sort((left, right) => left.id.localeCompare(right.id));
}

function buildPacket(snapshot, liveRecallInventory) {
  const records = frozenRows(snapshot);
  if (records.length !== contract.allIds.length || records.map((row) => row.id).join('|') !== contract.allIds.join('|')) {
    throw new Error(`${contract.model}: frozen coverage mismatch`);
  }
  const rows = records.map((record) => {
    const before = fullRecord(record);
    const proposal = proposalFor(record);
    const retained = contract.retainedIds.includes(record.id);
    return {
      id: record.id,
      frozenMake: record.make,
      action: retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy',
      identityReviewRequired: !retained,
      identityConflict: retained ? null : contract.content[record.id].conflict,
      reason: retained
        ? 'Exact primary evidence supports the frozen indexed identity after bounded technical cleanup.'
        : 'The frozen indexed identity materially exceeds exact manufacturer and regulator evidence and remains published pending independent review.',
      evidence: {
        primaryEvidence: clone(contract.content[record.id].evidence),
        limitations: 'A communication proves only its stated condition and population; no owner-frequency rate, universal mechanism, repair price or retail fitment is inferred.',
      },
      commerceDecision: commerceDecisionFor(record.id),
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });
  const blockers = rows.filter((row) => row.identityReviewRequired).map((row) => row.id);
  const makeCounts = Object.fromEntries(contract.frozenMakeValues.map((make) => [make, records.filter((row) => row.make === make).length]));
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: contract.reviewDate,
    make: contract.make,
    frozenMakeValues: clone(contract.frozenMakeValues),
    frozenMakeCounts: makeCounts,
    model: contract.model,
    completionStatement: `All ${rows.length} frozen RAM/Ram ${contract.model} pages are accounted for with make casing, indexed identities and vehicle metadata preserved pending review.`,
    applicationGate: {
      status: blockers.length ? 'blocked' : 'pending-independent-approval',
      blockerRecordIds: blockers,
      reason: blockers.length ? `${blockers.length} frozen identities exceed exact evidence; no production content write is authorized.` : 'Independent approval is required before any write.',
    },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, make-casing change, category change, indexed-year change, trim change, engine change, severity change, status change, related-link change or new issue is authorized.',
      `All ${rows.length} pages remain published with exact frozen identity and vehicle metadata.`,
      'Unsupported report counts remain unknown zero, and unknown totals are never rendered or written as "0+ owners" social proof.',
      'Manufacturer communications and recalls are not converted into owner-report totals or recurrence rates.',
      'A source proves only its exact production window and condition; similar symptoms are not cross-generation proof.',
      'Every named replaceable item has an explicit no-universal-retail-part diagnostic and VIN-fitment boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: {
      snapshotFile: contract.snapshotFile,
      snapshotSha256: normalizedFileHash(resolveRepo(contract.snapshotFile)),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      liveRecallFile: contract.liveRecallFile,
      liveRecallSha256: normalizedFileHash(resolveRepo(contract.liveRecallFile)),
      liveRecallGeneratedAt: liveRecallInventory.generatedOn,
      liveRecallInventorySha256: liveRecallInventory.inventorySha256,
      modelRecordCount: records.length,
    },
    observations: clone(contract.observations),
    pdfSources: clone(contract.pdfSources),
    otherSources: clone(contract.otherSources),
    manufacturerCommunications: {
      ...clone(contract.bulletinInventory),
      makes: clone(contract.sourceMakes),
      aliases: clone(contract.modelAliases),
      searchTerms: clone(contract.searchTerms),
    },
    recallInventory: {
      ...clone(contract.recallInventory),
      makes: clone(contract.sourceMakes),
      aliases: clone(contract.modelAliases),
      campaigns: clone(contract.campaigns),
      liveRequests: clone(liveRecallInventory.requests),
    },
    summary: {
      retain_indexed_identity_and_accuracy_cleanup: contract.retainedIds.length,
      hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: rows.length - contract.retainedIds.length,
      fabricated_report_counts_proposed_zero: contract.reportCountCleanupIds.length,
      frozen_make_counts: makeCounts,
      pages_preserved_published: rows.length,
      total: rows.length,
    },
    rows,
  };
}

function build() {
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(contract.snapshotFile), 'utf8'));
  const liveRecallInventory = JSON.parse(fs.readFileSync(resolveRepo(contract.liveRecallFile), 'utf8'));
  return { snapshot, liveRecallInventory, packet: buildPacket(snapshot, liveRecallInventory) };
}

if (require.main === module) {
  const { packet } = build();
  const output = resolveRepo(contract.outputFile);
  fs.writeFileSync(output, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { build, buildPacket, citationsFor, commerceDecisionFor, frozenRows, proposalFor };
