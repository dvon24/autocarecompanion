/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(
  ROOT,
  'data',
  'known-issue-hyundai-nexo-adjudication-2026-08-06.json',
);

const IDS = {
  stack: 'hyundai-nexo-fuel-cell-stack-degradation-2019',
  tankFill: 'hyundai-nexo-hydrogen-tank-fill-2019',
  infrastructure: 'hyundai-nexo-limited-service-infrastructure-2019',
  parking: 'hyundai-nexo-parking-sensor-failure-2019',
};

const SOURCES = {
  infrastructure: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10225467-0001.pdf',
  authorizedService: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10227324-0001.pdf',
};

const KEEP_REASONS = {
  [IDS.stack]:
    'A law-firm article and owner discussion do not establish one Hyundai-defined 2019-2024 fuel-cell-stack degradation defect, fleet replacement rate, acceleration mechanism, warning behavior, conditioning remedy, warranty outcome or cost. Hyundai campaign T9C concerns stack pressure sensors, not degradation of the fuel-cell stack, so the row remains byte-for-byte unchanged.',
  [IDS.tankFill]:
    'Two owner discussions do not establish a vehicle defect that prevents an 85-percent-plus hydrogen fill, attribute fill percentage between the station and vehicle, or validate the frozen refueling timing and range advice. Hyundai infrastructure guidance does not support the tank-capacity identity, so the row remains byte-for-byte unchanged.',
  [IDS.parking]:
    'This row has no citations, and no exact Hyundai Nexo bulletin was found establishing silent parking-sensor shutdown, false alarms, moisture or connector causes, recalibration outcomes, module replacement or the stated costs across 2019-2024 vehicles. The row remains byte-for-byte unchanged.',
};

const CARDS = {
  [IDS.infrastructure]: {
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    severity: 'medium',
    confidence: 'high',
    description:
      'Hyundai Nexo repair guidance states that some repairs require the vehicle to be defueled, transported to a local hydrogen station, refueled and returned to the shop. The same guidance says hydrogen fueling stations are very limited and may be empty or down for repairs. A separate Hyundai campaign requires covered fuel-cell work to be performed at an authorized Hyundai Nexo fuel-cell vehicle dealer by a specially trained Hyundai technician.',
    solution:
      'Before driving or towing a Nexo for hydrogen, use the station-status map identified in Hyundai\'s guidance to confirm local availability. For fuel-cell-system service, contact an authorized Hyundai Nexo dealer and confirm that a trained technician can perform the repair. If a covered repair requires defueling and refueling, ask the dealer which campaign or warranty claim instructions apply to transportation and fuel.',
    symptoms: [
      'Local hydrogen station is empty or offline for repairs',
      'Fuel-cell repair requires an authorized Hyundai Nexo dealer',
      'Some repairs require defueling, transport to a hydrogen station and refueling',
    ],
    affectedSystems: ['Hydrogen fueling access', 'Fuel-cell service access'],
    dtcCodes: [],
    citations: [
      {
        type: 'tsb',
        title: 'Hyundai Nexo Hydrogen Defuel/Refuel During Repair Completion',
        url: SOURCES.infrastructure,
      },
      {
        type: 'tsb',
        title: 'Hyundai Campaign T9C - Authorized Nexo Fuel-Cell Service Requirement',
        url: SOURCES.authorizedService,
      },
    ],
    summary:
      'Kept the indexed service-and-hydrogen-infrastructure identity, replaced law-firm and forum citations with two exact Hyundai documents, and removed unsupported dealer counts, wait times, distance, parts-delay, lawsuit, resale and purchase advice.',
  },
};

function rewrite(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Hyundai',
    model: 'Nexo',
    title: current.title,
    category: current.category,
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

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Hyundai' && row.model === 'Nexo',
  );
  if (modelRows.length !== 4) {
    throw new Error(`expected 4 Hyundai Nexo rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) {
      throw new Error(`missing Nexo decision: ${current.id}`);
    }
    const proposal = card ? rewrite(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card
        ? 'The same indexed service-network and hydrogen-infrastructure identity stays on the existing ID, title and category; only facts from exact Hyundai documents remain.'
        : 'No content or publication-state changes; secondary or different-component evidence cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card
        ? card.citations.map((item) => ({
            kind: 'official-record-specific-tsb',
            url: item.url,
            verifiedOn: '2026-08-06',
            observation: `${item.title} supports the proposed infrastructure and service-access statements.`,
          }))
        : [],
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });

  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Hyundai',
    model: 'Nexo',
    completionStatement:
      'This packet reconciles all four frozen Hyundai Nexo rows. One same-identity infrastructure rewrite is proposed; three rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All four rows remain published. Three are byte-for-byte unchanged.',
      'The one rewrite preserves the indexed title and category and uses two exact Hyundai documents.',
      'The rewrite contains zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no diagnostic codes.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      nexoRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'one-exact-infrastructure-rewrite',
        severity: 'independent-review-required',
        recordIds: [IDS.infrastructure],
        detail:
          'Two exact Hyundai documents support the specialized-service and limited-station identity without the frozen numeric and purchasing claims.',
      },
      {
        code: 'stack-campaigns-are-mismatches',
        severity: 'independent-review-required',
        recordIds: [IDS.stack],
        detail:
          'Hyundai campaign T9C addresses deformed hydrogen stack pressure sensors and MIL illumination; it does not establish fuel-cell-stack degradation, fleet replacement rates or power-loss progression.',
        sourceUrls: [SOURCES.authorizedService],
      },
      {
        code: 'three-secondary-rows-frozen',
        severity: 'independent-review-required',
        recordIds: Object.keys(KEEP_REASONS),
        detail:
          'The stack-degradation, tank-fill and parking-sensor narratives remain byte-for-byte unchanged without exact same-identity Hyundai evidence.',
      },
    ],
    publicSources: SOURCES,
    summary: {
      rewrite_same_identity: 1,
      keep_published_pending_source: 3,
      total: 4,
    },
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(
    JSON.stringify(
      { output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary },
      null,
      2,
    ),
  );
}

if (require.main === module) main();

module.exports = {
  CARDS,
  IDS,
  KEEP_REASONS,
  SOURCES,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewrite,
};
