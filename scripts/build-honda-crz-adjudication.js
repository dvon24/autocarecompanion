/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-crz-adjudication-2026-08-06.json');

const IDS = {
  acCompressor: 'honda-crz-ac-compressor-2011',
  clutchSlave: 'honda-crz-clutch-slave-cylinder-2011',
  imaBattery: 'honda-crz-ima-battery-degradation-2011',
};

const SOURCES = {
  imaBattery: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10118170-9999.pdf',
};

const REWRITE_CARDS = {
  [IDS.imaBattery]: {
    years: [2011, 2012],
    category: 'electrical',
    title: 'IMA Battery Memory Effect and Apparent Capacity Loss - Bulletin 14-064',
    description: 'Honda Service Bulletin 14-064 applies to VIN-eligible 2011-2012 CR-Z vehicles. Incorrect IMA battery-control software can allow a memory effect that appears as reduced battery capacity, and DTC P0A7F (Battery Module Deterioration) may be stored. Honda states that this memory effect is not permanent battery degradation.',
    solution: 'Have a Honda dealer check VIN eligibility and the IMA battery-control software. Bulletin 14-064 directs an IMA battery-control-module software update; Honda states that the apparent capacity should recover over subsequent driving cycles.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['IMA battery charge indicator may jump', 'Malfunction indicator lamp may illuminate', 'DTC P0A7F may be stored', 'Apparent reduction in IMA battery capacity'],
    affectedSystems: ['IMA battery control module software', 'IMA battery state-of-charge management'],
    dtcCodes: ['P0A7F'],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 14-064 - CR-Z IMA Battery Software Update', url: SOURCES.imaBattery }],
    identityTerms: ['ima', 'battery'],
    summary: 'Corrected the broad 2011-2016 permanent-degradation card to Honda\'s exact VIN-eligible 2011-2012 IMA memory-effect campaign, used DTC P0A7F, and removed unsupported pack replacement, pricing, vendor, recalibration and unrelated 12-volt commerce claims.',
  },
};

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function rewriteProposal(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Honda',
    model: 'CR-Z',
    trims: [],
    engines: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    status: 'published',
    lastReportedByOwners: '',
    reviewedOn: '2026-08-06',
    contentUpdatedOn: '2026-08-06',
    contentUpdateSummary: card.summary,
    relatedIssueIds: [],
  });
}

function keepReason(current) {
  const reasons = {
    [IDS.acCompressor]: 'The frozen A/C card relies on forum summaries and an Amazon search URL. No exact Honda or NHTSA record establishes a CR-Z-specific compressor clutch/bearing defect, mechanism or remedy, so the row remains byte-for-byte unchanged.',
    [IDS.clutchSlave]: 'The generic NHTSA vehicle page and repair video do not establish a CR-Z clutch-slave-cylinder defect rate, failure mechanism or Honda remedy. No unrelated hydraulic-clutch bulletin is substituted, so the row remains byte-for-byte unchanged.',
  };
  return reasons[current.id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const crzRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'CR-Z');
  if (crzRows.length !== 3) throw new Error(`expected 3 Honda CR-Z rows, found ${crzRows.length}`);
  const rows = crzRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action,
      reason: card ? card.summary : keepReason(current),
      identityRule: card ? 'The indexed IMA-battery identity remains on the same ID; Honda-backed scope and mechanism replace unsupported generalizations.' : 'No content or publication-state changes; a generic vehicle page, video or unrelated bulletin cannot replace this issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card ? card.citations.map((item) => ({ kind: 'manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, mechanism and remedy.` })) : [],
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });
  const actions = ['rewrite_same_identity', 'keep_published_pending_source'];
  const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length]));
  summary.total = rows.length;
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Honda',
    model: 'CR-Z',
    completionStatement: 'This packet reconciles all three frozen Honda CR-Z rows. One same-identity Honda correction is proposed; two rows remain byte-for-byte unchanged pending exact evidence or independent disposition.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All three rows remain published. Two are byte-for-byte unchanged.',
      'An unrelated campaign, bulletin, component or model may never replace the issue named by an existing indexed page.',
      'The one rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      crzRecordCount: crzRows.length,
    },
    observations: [
      { code: 'ima-memory-effect-not-permanent-degradation', severity: 'independent-review-required', recordIds: [IDS.imaBattery], detail: 'Honda says the 2011-2012 software-related memory effect is not permanent battery degradation. The proposed rewrite removes the unsupported 2011-2016 pack-replacement narrative.' },
      { code: 'ac-primary-source-gap', severity: 'independent-review-required', recordIds: [IDS.acCompressor], detail: 'No CR-Z-specific Honda/NHTSA compressor-clutch or bearing defect record was verified; the row and its current commerce remain byte-equivalent pending disposition.' },
      { code: 'clutch-primary-source-gap', severity: 'independent-review-required', recordIds: [IDS.clutchSlave], detail: 'No CR-Z-specific Honda/NHTSA clutch-slave-cylinder defect record was verified; no unrelated source is substituted.' },
    ],
    summary,
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { FULL_RECORD_FIELDS, IDS, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteProposal };
