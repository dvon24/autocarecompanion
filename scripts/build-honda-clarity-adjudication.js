/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  FULL_RECORD_FIELDS,
  diffFields,
  fullRecord,
  hashValue,
} = require('./build-honda-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-clarity-adjudication-2026-08-06.json');

const IDS = {
  batteryDrain: 'honda-clarity-12v-battery-drain-2017',
  condenserLeak: 'honda-clarity-ac-condenser-leak-2018',
  chargingFailure: 'honda-clarity-charging-failure-2017',
  powerLoss: 'honda-clarity-power-loss-highway-2017',
};

const SOURCES = {
  condenserLeak: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10194957-0001.pdf',
  condenserOwnerNotice: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10199344-0001.pdf',
  chargingFailure: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10147178-9999.pdf',
};

const REWRITE_CARDS = {
  [IDS.condenserLeak]: {
    years: [2018, 2019, 2020, 2021],
    category: 'hvac',
    title: 'A/C Condenser Refrigerant Leak - Warranty Extension 21-017',
    description: 'On eligible 2018-2021 Clarity Plug-In Hybrid vehicles, an A/C condenser manufactured out of specification may develop corrosion in the form of tiny holes in the condenser tube walls. Refrigerant can then leak and the air conditioning may stop cooling. The warranty extension does not cover leaks caused by foreign-object damage.',
    solution: 'Ask a Honda dealer to check VIN eligibility under Service Bulletin 21-017 and diagnose the leak. If the condenser leak is caused by corrosion or another manufacturing condition covered by the bulletin, Honda replaces it under a 10-year, unlimited-mile warranty extension.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['A/C does not blow cold air', 'Refrigerant leak from the A/C condenser'],
    affectedSystems: ['A/C condenser', 'refrigerant system'],
    dtcCodes: [],
    citations: [
      { type: 'tsb', title: 'Honda Service Bulletin 21-017 - Clarity Plug-In Hybrid A/C Condenser', url: SOURCES.condenserLeak },
      { type: 'manufacturer', title: 'Honda Owner Notice - Clarity Plug-In Hybrid A/C Condenser Warranty Extension', url: SOURCES.condenserOwnerNotice },
    ],
    identityTerms: ['condenser', 'leak'],
    summary: 'Replaced secondary owner/complaint pages with exact Honda warranty-extension records and removed unsupported heating, battery-thermal-management, road-guard, cost and commerce claims.',
  },
  [IDS.chargingFailure]: {
    years: [2018],
    category: 'electrical',
    title: 'Fails to Start or Finish Charging - Service Bulletin 18-097',
    description: 'Honda Service Bulletin 18-097 applies to 2018 Clarity Plug-In Hybrid and Clarity Electric vehicles. The vehicle may fail to start charging when plugged in or may stop before the high-voltage battery is full because battery-charger software can react incorrectly to poor or fluctuating power quality.',
    solution: 'Have a Honda dealer diagnose the charging concern and apply the battery-charger software update in Service Bulletin 18-097. After the update, charging can take up to one and a half times longer depending on local power quality.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Charging does not start when the vehicle is plugged in', 'Charging stops before the high-voltage battery is full'],
    affectedSystems: ['battery charger software', 'high-voltage battery charging system'],
    dtcCodes: ['P0D28', 'P0D2A', 'P0D3D', 'P1D23', 'P1D22'],
    citations: [
      { type: 'tsb', title: 'Honda Service Bulletin 18-097 - Clarity Fails to Charge or Finish Charging', url: SOURCES.chargingFailure },
    ],
    identityTerms: ['charging'],
    summary: 'Corrected applicability to 2018, bound the card to Honda Service Bulletin 18-097, and removed unsupported range-degradation, battery-warranty, reset, EVSE-brand, cost and commerce claims.',
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
    model: 'Clarity',
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
  if (current.id === IDS.batteryDrain) {
    return 'The frozen 12V-drain card cites only a secondary article and an owner forum. No same-identity Honda defect bulletin or campaign was verified, so the row stays byte-for-byte unchanged.';
  }
  return 'The frozen highway-power-loss card cites a generic NHTSA vehicle page and an owner forum. Honda records found for P1D8D and P0010 concern a PCU internal failure and PCM emissions DTCs, not the claimed highway transition behavior or the named 19-056/20-008 updates. The row stays byte-for-byte unchanged.';
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const clarityRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Clarity');
  if (clarityRows.length !== 4) throw new Error(`expected 4 Honda Clarity rows, found ${clarityRows.length}`);

  const rows = clarityRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action,
      reason: card ? card.summary : keepReason(current),
      identityRule: card
        ? 'The existing component and failure-mode identity remains on the same ID; only primary-source-backed scope and guidance change.'
        : 'No content or publication-state changes; an unrelated official source cannot replace this issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card ? card.citations.map((item) => ({
        kind: 'manufacturer-service-bulletin',
        url: item.url,
        verifiedOn: '2026-08-06',
        observation: `${item.title} supports the proposed same-identity scope, mechanism and remedy.`,
      })) : [],
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
    model: 'Clarity',
    completionStatement: 'This packet reconciles all four frozen Honda Clarity rows. Two same-identity primary-source corrections are proposed; two rows remain byte-for-byte unchanged pending exact primary sources.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All four rows remain published. Two are byte-for-byte unchanged.',
      'An unrelated campaign, bulletin or generic data page may never replace the component, symptom or remedy named by an existing issue.',
      'Both rewrites contain zero commerce, zero cost claims, and empty trim and engine arrays.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      clarityRecordCount: clarityRows.length,
    },
    observations: [
      {
        code: 'battery-drain-primary-source-gap',
        severity: 'independent-review-required',
        recordIds: [IDS.batteryDrain],
        detail: 'The 12V-drain aggregation and its extensive commerce remain byte-equivalent because no same-identity Honda defect record was verified.',
      },
      {
        code: 'power-loss-source-identity-mismatch',
        severity: 'independent-review-required',
        recordIds: [IDS.powerLoss],
        detail: 'Honda bulletins for DTC P1D8D and P0010 do not substantiate the frozen high-speed power-loss/over-rev narrative or its named 19-056/20-008 software remedy. No substitution is proposed.',
      },
    ],
    summary,
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();

module.exports = {
  FULL_RECORD_FIELDS,
  IDS,
  REWRITE_CARDS,
  SOURCES,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewriteProposal,
};
