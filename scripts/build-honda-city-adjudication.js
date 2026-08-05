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
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-city-adjudication-2026-08-06.json');

const TAKATA_ID = 'honda-city-takata-airbag-inflator-recall-metal-fragment-risk';
const SENACON_2010_2011 = 'https://www.mpmg.mp.br/data/files/34/90/F7/5C/0A44A7109CEB34A7760849A8/20.06.2016%20-%20Ve_culos%20Honda%20Fit_%20City_%20Civic_%20CR-V%20e%20Accord.pdf';
const SENACON_DRIVER_2012_2014 = 'https://central3.to.gov.br/arquivo/280299/';
const HONDA_DRIVER_PROGRESS = 'https://mpce.mp.br/wp-content/uploads/2018/01/Dados-Campanhas_HAB_2019_02_PROCON.pdf';
const HONDA_PASSENGER_2012 = 'https://goias.gov.br/procon/wp-content/uploads/sites/19/2017/01/relatorio-tecnico-honda-automoveis.pdf';
const HONDA_RECALL_LOOKUP = 'https://www.honda.com.br/automoveis/recall';

const REWRITE_CARDS = {
  [TAKATA_ID]: {
    years: [2010, 2011, 2012, 2013, 2014],
    category: 'safety',
    title: 'Driver and Passenger Airbag Inflator Recalls - Metal Fragment Risk',
    description: 'Brazilian recall records cover VIN-specific Honda City populations across model years 2010-2014. Senacon identifies a passenger-airbag inflator campaign for 2010-2011 City vehicles; a Honda technical report covers the passenger inflator on certain 2012 City vehicles; and Senacon technical note 8/2016 covers the driver inflator on certain 2012-2014 City vehicles. An affected inflator can rupture during airbag deployment and project metal fragments, creating a risk of serious or fatal injury. Eligibility depends on the VIN and inflator position.',
    solution: 'Check the plate or VIN in Honda Brazil\'s recall lookup and ask a Honda dealer to check every open airbag campaign. Honda replaces the inflator for each applicable campaign free of charge. Do not assume that completion of a driver-side repair also closes a passenger-side campaign, or vice versa.',
    severity: 'high',
    confidence: 'high',
    symptoms: [
      'No warning symptoms before an affected airbag deploys',
      'An affected inflator can rupture during deployment',
      'Metal fragments may enter the passenger compartment',
      'The VIN or plate returns an open Honda airbag campaign',
    ],
    affectedSystems: ['driver airbag inflator', 'passenger airbag inflator', 'supplemental restraint system'],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'Brazilian Senacon/MPMG - 2010-2011 Honda City Passenger-Airbag Inflator Campaign',
        url: SENACON_2010_2011,
      },
      {
        type: 'recall',
        title: 'Brazilian Senacon Technical Note 8/2016 - 2012-2014 Honda City Driver-Airbag Inflator Campaign',
        url: SENACON_DRIVER_2012_2014,
      },
      {
        type: 'recall',
        title: 'Honda/MPCE Campaign Report - City Driver-Airbag Inflator Campaign 6ZV/6ZZ',
        url: HONDA_DRIVER_PROGRESS,
      },
      {
        type: 'recall',
        title: 'Honda Brazil Technical Report - 2012 Honda City Passenger-Airbag Inflator Campaign',
        url: HONDA_PASSENGER_2012,
      },
      {
        type: 'manufacturer',
        title: 'Honda Brazil Recall Lookup',
        url: HONDA_RECALL_LOOKUP,
      },
    ],
    identityTerms: ['airbag', 'inflator', 'fragment'],
    summary: 'Separated the VIN-specific driver- and passenger-inflator campaigns, removed an unrelated fuel-level-sensor recall citation, and removed unsupported global fatality and completion statistics.',
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
    model: 'City',
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

function evidenceFor(id) {
  if (id !== TAKATA_ID) return [];
  return [
    {
      kind: 'government-recall-notice',
      url: SENACON_2010_2011,
      verifiedOn: '2026-08-06',
      observation: 'Senacon identifies Honda City passenger-airbag inflators, 2010-2011 model years, chassis AZ100032 through BZ213443, rupture and metal-fragment risk, and a free remedy.',
    },
    {
      kind: 'government-technical-note',
      url: SENACON_DRIVER_2012_2014,
      verifiedOn: '2026-08-06',
      observation: 'Senacon technical note 8/2016 identifies 2012-2014 City driver-airbag inflators, chassis C*209151 through E*307830, and replacement of the inflator.',
    },
    {
      kind: 'manufacturer-government-campaign-report',
      url: HONDA_DRIVER_PROGRESS,
      verifiedOn: '2026-08-06',
      observation: 'Honda campaign reporting published by MPCE identifies protocol 08012.000409/2016-74 as the Fit and City driver-airbag inflator campaign, factory codes 6ZV/6ZZ.',
    },
    {
      kind: 'manufacturer-technical-report',
      url: HONDA_PASSENGER_2012,
      verifiedOn: '2026-08-06',
      observation: 'Honda Brazil technical-report pages 1, 3, 5-8, 12 and 15-17 identify certain 2012 City passenger inflators, chassis CZ200001 through CZ214820, rupture/fragment risk and free replacement.',
    },
    {
      kind: 'manufacturer-recall-lookup',
      url: HONDA_RECALL_LOOKUP,
      verifiedOn: '2026-08-06',
      observation: 'Honda Brazil directs City owners to check the chassis, schedule the free repair and replace the applicable airbag activation device.',
    },
    {
      kind: 'citation-mismatch-removal',
      url: 'https://goias.gov.br/procon/recall-no-08012-0018042015-93-2/',
      verifiedOn: '2026-08-06',
      observation: 'The existing campaign 08012.001804/2015-93 record is a fuel-level-sensor recall, not an airbag campaign. It is excluded from the Takata proposal.',
    },
  ];
}

function reasonFor(current, action) {
  if (action === 'rewrite_same_identity') {
    return 'The existing card has the correct airbag-inflator identity, but it merges campaign scope, cites an unrelated fuel-level-sensor recall, and includes unsupported global statistics. The proposal keeps the 2010-2014 page scope while separating the exact VIN- and position-dependent recall evidence.';
  }
  if (current.id === 'honda-city-high-pressure-fuel-pump-failure-sudden-power-loss-p0087') {
    return 'The current PROCON-SP citation is a fuel-level-sensor recall and the generic Honda recall lookup does not substantiate the high-pressure-pump diagnosis. Secondary reporting refers to Honda technical tips 010/22 and 004/23, but the primary documents were not found. Keep byte-for-byte pending primary-source review.';
  }
  if (current.id === 'honda-city-starter-motor-brush-holder-failure') {
    return 'The current SENACON and Honda recall citations concern airbags, not the starter brush holder. No same-identity primary document was found. Keep byte-for-byte pending primary-source review.';
  }
  return 'No exact same-identity manufacturer or government source was completed in this pass. The existing published row remains byte-for-byte unchanged; missing evidence is not authorization to rewrite, archive or remove it.';
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const cityRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'City');
  if (cityRows.length !== 6) throw new Error(`expected 6 Honda City rows, found ${cityRows.length}`);

  const rows = cityRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action,
      reason: reasonFor(current, action),
      identityRule: action === 'rewrite_same_identity'
        ? 'The same Honda City airbag-inflator hazard remains on the same slug; only evidence-backed campaign scope and guidance change.'
        : 'No content or publication-state changes; an unrelated official source cannot replace this issue.',
      commerceDecision: action === 'rewrite_same_identity' ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: evidenceFor(current.id),
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
    model: 'City',
    completionStatement: 'This packet reconciles all six frozen Honda City rows. One same-identity recall correction is proposed; five rows remain byte-for-byte unchanged pending exact primary sources.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All six rows remain published. Five are byte-for-byte unchanged.',
      'An unrelated campaign or generic data page may never replace the component, symptom or remedy named by an existing issue.',
      'The single rewrite contains zero commerce and keeps trim and engine arrays empty.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      cityRecordCount: cityRows.length,
    },
    observations: [
      {
        code: 'fuel-pump-primary-source-gap',
        severity: 'independent-review-required',
        recordIds: ['honda-city-high-pressure-fuel-pump-failure-sudden-power-loss-p0087'],
        detail: 'The high-pressure fuel-pump card currently cites a fuel-level-sensor recall and a generic lookup. Secondary reports name Honda tips 010/22 and 004/23, but neither primary document was located; the row stays byte-equivalent.',
      },
      {
        code: 'starter-citation-identity-mismatch',
        severity: 'independent-review-required',
        recordIds: ['honda-city-starter-motor-brush-holder-failure'],
        detail: 'The starter card currently cites an airbag campaign and a generic lookup. No same-identity Honda starter document was located; the row stays byte-equivalent.',
      },
      {
        code: 'four-unverified-aggregations',
        severity: 'follow-up-source-research',
        recordIds: [
          'honda-city-cvt-judder-premature-transmission-failure',
          'honda-city-premature-hood-rust-paint-blistering',
          'honda-city-starter-motor-brush-holder-failure',
          'honda-city-steering-rack-noise-play',
        ],
        detail: 'These cards lack a matching primary source in the frozen state. They are not rewritten, archived or removed in this proposal.',
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
  HONDA_DRIVER_PROGRESS,
  HONDA_PASSENGER_2012,
  HONDA_RECALL_LOOKUP,
  REWRITE_CARDS,
  SENACON_2010_2011,
  SENACON_DRIVER_2012_2014,
  TAKATA_ID,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewriteProposal,
};
