/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-hb20-adjudication-2026-08-06.json');

const IDS = {
  timingChain: 'hyundai-hb20-1-0-kappa-three-cylinder-timing-chain-tensioner-rattle-cold',
  tgdiInjection: 'hyundai-hb20-1-0-tgdi-direct-injection-failure-causing-sudden-loss-power',
  infotainment: 'hyundai-hb20-bluemedia-bluenav-infotainment-unit-freezing-total-failure',
  clutchJudder: 'hyundai-hb20-clutch-judder-vibration-when-pulling-away',
  oilPumpRecall: 'hyundai-hb20-recall-automatic-transmission-electric-oil-pump-control-modu',
  brakeBoosterRecall: 'hyundai-hb20-recall-brake-booster-vacuum-control-valve-can-dry-out-harden',
};

const SOURCES = {
  oilPumpPdf: 'https://www.hyundai.com.br/content/dam/hmb/servicos/recall/pdf/AF_Comunicado_recall_Hyundai_2023_146x246.pdf',
  brakeBoosterPdf: 'https://www.hyundai.com.br/content/dam/hmb/servicos/recall/pdf/Aviso%20de%20Recall%2008012_000624_2018_37.pdf',
  recallIndex: 'https://www.hyundai.com.br/manutencao',
};

const KEEP_REASONS = {
  [IDS.timingChain]: 'The frozen row generalizes a model-wide timing-chain/tensioner defect across both naturally aspirated and TGDI HB20 engines, assigns causes, prevention intervals and repair costs, and relies on articles and owner forums. No exact Hyundai recall, campaign or service document was found, so the row remains byte-for-byte unchanged.',
  [IDS.tgdiInjection]: 'Individual complaints and secondary articles do not establish a single 2020-2023 HB20 TGDI defect identity, the claimed affected components, recurrence rate, warranty position or repair path. No exact Hyundai primary record was found, so the row remains byte-for-byte unchanged.',
  [IDS.infotainment]: 'The frozen row combines several BlueMedia/BlueNav symptoms, alleged nationwide acknowledgment, discontinued support, warranty terms and replacement costs without an exact Hyundai campaign or bulletin. Product pages establish equipment, not the claimed defect, so the row remains byte-for-byte unchanged.',
  [IDS.clutchJudder]: 'Technical articles and owner complaints do not establish a Hyundai-defined 2012-2019 HB20 1.0 manual clutch defect, the claimed ninety-percent cause rate, warranty treatment or repair cost. No exact Hyundai primary record was found, so the row remains byte-for-byte unchanged.',
};

const OIL_PUMP_CARD = {
  years: [2023, 2024],
  category: 'transmission',
  severity: 'critical',
  confidence: 'high',
  title: 'Recall: Automatic-Transmission Electric Oil-Pump Control Module Short Circuit',
  description: 'Hyundai Motor Brasil recalled 2023-2024 HB20 and HB20S vehicles manufactured from December 20, 2022 through September 27, 2023. Hyundai says a nonconformity in the automatic transmission electric oil-pump control module can cause an internal short circuit. In an extreme case, that can cause a fire and property damage or serious or fatal injury to occupants or other people.',
  solution: 'Schedule the free recall inspection with a Hyundai Motor Brasil dealer. Hyundai says the dealer will inspect the vehicle and replace the automatic-transmission electric oil-pump control module if necessary; the service takes about two hours. The notice identifies the non-sequential last-eight-digit chassis range PP395536 through RP509630 for HB20 and HB20S.',
  symptoms: [],
  affectedSystems: ['Automatic-transmission electric oil-pump control module'],
  dtcCodes: [],
  citations: [
    { type: 'manufacturer', title: 'Hyundai Motor Brasil - Recall of the Automatic-Transmission Electric Oil-Pump Control Module', url: SOURCES.oilPumpPdf },
  ],
  summary: 'Kept the same HB20 electric-oil-pump control-module recall identity and 2023-2024 scope, replaced secondary coverage with Hyundai\'s exact recall PDF, and removed invented warning symptoms, secondary citations, commerce, cost and diagnostic claims.',
};

const BRAKE_BOOSTER_CARD = {
  years: [2016, 2017, 2018],
  category: 'brakes',
  severity: 'high',
  confidence: 'high',
  title: 'Recall: Brake-Booster Vacuum Control Valve Can Dry Out and Reduce Brake Assist',
  description: 'Hyundai Motor Brasil recalled 2016-2018 HB20 and HB20S vehicles with the 1.0 Turbo engine and six-speed manual transmission, manufactured from January 28, 2016 through February 5, 2018. Hyundai says heat exposure near the catalytic converter can dry the brake-booster vacuum control valve. A whistle and unstable idle can precede reduced brake-booster vacuum, a harder brake pedal, greater required pedal force and increased stopping time and distance. The brakes continue to operate, but the condition increases crash risk.',
  solution: 'Hyundai advises stopping use and contacting a dealer immediately if a whistle from the engine area and unstable idle occur. The free recall service inspects the brake-booster vacuum control valve. If the valve is undamaged, the dealer adds a thermal insulator; if it is damaged, the dealer replaces it and adds the insulator. Hyundai estimates about 30 minutes for the service.',
  symptoms: ['Whistling noise from the engine area', 'Unstable or oscillating idle', 'Harder brake pedal', 'More pedal force required to stop', 'Increased stopping time and distance'],
  affectedSystems: ['Brake-booster vacuum control valve', 'Brake-booster vacuum assistance'],
  dtcCodes: [],
  citations: [
    { type: 'manufacturer', title: 'Hyundai Motor Brasil - HB20 and HB20S Brake-Booster Vacuum Control Valve Recall', url: SOURCES.brakeBoosterPdf },
  ],
  summary: 'Kept the same HB20 brake-booster vacuum-control-valve recall identity and 2016-2018 scope, replaced the dead regulator and secondary links with Hyundai\'s exact recall PDF, and removed commerce, cost and unsupported diagnostic claims.',
};

function rewrite(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Hyundai',
    model: 'HB20',
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

function rewriteOilPump(current) { return rewrite(current, OIL_PUMP_CARD); }
function rewriteBrakeBooster(current) { return rewrite(current, BRAKE_BOOSTER_CARD); }

function evidenceFor(id) {
  if (id === IDS.oilPumpRecall) return [{
    kind: 'official-manufacturer-recall',
    url: SOURCES.oilPumpPdf,
    verifiedOn: '2026-08-06',
    visualReview: 'One-page Hyundai recall notice visually inspected after rendering at 160 DPI.',
    facts: { models: 'HB20 and HB20S 2023-2024', productionPeriod: '2022-12-20 through 2023-09-27', chassis: 'PP395536 through RP509630, non-sequential', defect: 'Electric oil-pump control-module nonconformity may cause an internal short circuit.', risk: 'Fire in an extreme case, with property damage and serious or fatal injury.', remedy: 'Inspect and replace the module if necessary.', duration: 'Approximately two hours', campaignStart: '2023-10-02' },
  }];
  if (id === IDS.brakeBoosterRecall) return [
    { kind: 'official-manufacturer-recall', url: SOURCES.brakeBoosterPdf, verifiedOn: '2026-08-06', visualReview: 'One-page Hyundai recall notice visually inspected after rendering at 160 DPI.', facts: { models: 'HB20 and HB20S 1.0 Turbo, six-speed manual, 2016-2018', productionPeriod: '2016-01-28 through 2018-02-05', chassis: '561697 through 870541, non-sequential', defect: 'Heat near the catalytic converter can dry the brake-booster vacuum control valve.', remedy: 'Inspect; add a thermal insulator when undamaged or replace the valve and add the insulator when damaged.', duration: 'Approximately 30 minutes', campaignStart: '2018-03-29' } },
  ];
  return [];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'HB20');
  if (modelRows.length !== 6) throw new Error(`expected 6 Hyundai HB20 rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    let proposal = before;
    if (current.id === IDS.oilPumpRecall) proposal = rewriteOilPump(before);
    else if (current.id === IDS.brakeBoosterRecall) proposal = rewriteBrakeBooster(before);
    else if (!KEEP_REASONS[current.id]) throw new Error(`missing HB20 decision: ${current.id}`);
    const isRewrite = proposal !== before;
    const reason = current.id === IDS.oilPumpRecall ? OIL_PUMP_CARD.summary : current.id === IDS.brakeBoosterRecall ? BRAKE_BOOSTER_CARD.summary : KEEP_REASONS[current.id];
    return {
      id: current.id,
      model: current.model,
      action: isRewrite ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason,
      identityRule: isRewrite ? 'The same indexed recall stays on the existing ID and year scope; only claims proven by exact official sources remain.' : 'No content or publication-state changes; secondary or owner material cannot establish a broad model-wide issue identity.',
      commerceDecision: isRewrite ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: evidenceFor(current.id),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });
  const summary = { rewrite_same_identity: 2, keep_published_pending_source: 4, total: 6 };
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Hyundai',
    model: 'HB20',
    completionStatement: 'This packet reconciles all six frozen Hyundai HB20 rows. Two exact same-identity official-recall rewrites are proposed; four broad rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All six rows remain published and all four holds remain byte-for-byte unchanged.',
      'The two rewrites use exact record-specific official deep links and contain no secondary citations.',
      'Both rewrites contain zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no unsupported DTC.',
      'The Hyundai recall index conflict is disclosed as review metadata; the signed-format recall PDF controls the proposed oil-pump scope.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: { snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, hb20RecordCount: modelRows.length },
    observations: [
      { code: 'oil-pump-index-pdf-conflict-pdf-controls', severity: 'independent-review-required', recordIds: [IDS.oilPumpRecall], detail: 'Hyundai\'s recall index currently displays model years 2022-2023 and a production start of 2022-12-10, while its exact linked recall PDF states HB20/HB20S model years 2023-2024 and production from 2022-12-20. The proposal uses the exact PDF and does not cite the inconsistent index.', indexUrl: SOURCES.recallIndex, officialPdfUrl: SOURCES.oilPumpPdf, processNumber: '08084.006071/2023-40' },
      { code: 'four-broad-secondary-only-rows-frozen', severity: 'independent-review-required', recordIds: [IDS.timingChain, IDS.tgdiInjection, IDS.infotainment, IDS.clutchJudder], detail: 'Hyundai product and owner-manual pages establish equipment only. No exact recall, campaign or service document was found for the four broad narratives, so none was rewritten.' },
      { code: 'oil-pump-warning-symptoms-removed', severity: 'independent-review-required', recordIds: [IDS.oilPumpRecall], detail: 'The official notice does not state warning-light, burning-smell or no-warning behavior. The proposed symptom list is empty.' },
      { code: 'brake-booster-use-warning-preserved', severity: 'independent-review-required', recordIds: [IDS.brakeBoosterRecall], detail: 'The manufacturer notice explicitly advises stopping use and contacting a dealer when a whistle and unstable idle are observed.' },
      { code: 'dead-procon-link-removed', severity: 'independent-review-required', recordIds: [IDS.brakeBoosterRecall], detail: 'The previously cited PROCON-SP page returned HTTP 404 on 2026-08-06 and is not retained in the proposal. Hyundai\'s exact recall PDF remains live.', removedUrl: 'https://www.procon.sp.gov.br/recall-hyundai-hb20-e-hb20s/' },
    ],
    publicSources: SOURCES,
    summary,
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { BRAKE_BOOSTER_CARD, IDS, KEEP_REASONS, OIL_PUMP_CARD, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteBrakeBooster, rewriteOilPump };
