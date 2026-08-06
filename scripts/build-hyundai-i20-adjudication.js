/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-i20-adjudication-2026-08-06.json');

const IDS = {
  timingChain: 'hyundai-i20-1-2-kappa-timing-chain-stretch-tensioner-rattle',
  dct: 'hyundai-i20-7-speed-dual-clutch-judder-hesitation-overheating',
  ac: 'hyundai-i20-air-conditioning-compressor-evaporator-failures',
  clutch: 'hyundai-i20-clutch-judder-premature-clutch-wear',
  fuelPump: 'hyundai-i20-fuel-pump-impeller-failure-engine-stall-recall',
};

const SOURCES = {
  safetyGate: 'https://ec.europa.eu/safety-gate-alerts/screen/webReport/alertDetail/10096118',
  hyundaiSlovenia: 'https://www.hyundai.si/lastnistvo/vpoklic-vozila/servisni-vpoklic-vozil-hyundai-ioniq-i20-bayon',
  traficomFinland: 'https://takaisinkutsut.traficom.fi/recall/17844',
};

const KEEP_REASONS = {
  [IDS.timingChain]: 'A repair-shop case study, articles and owner forums do not establish one Hyundai-defined 2009-2018 i20 1.2 Kappa timing-chain defect, the claimed causes, progression, engine-damage risk or preventive interval. No exact Hyundai campaign or bulletin was found, so the row remains byte-for-byte unchanged.',
  [IDS.dct]: 'The cited Hyundai TSB applies to Tucson and Sonata, not i20. A generic DCT owner-manual warning explains operating behavior but does not establish the frozen multi-generation i20 defect, calibration history, warranty treatment or clutch-replacement remedy. The row remains byte-for-byte unchanged.',
  [IDS.ac]: 'Owner and forum reports do not establish one 2009-2020 i20 air-conditioning defect combining compressor valves, thermistors, evaporator icing and compressor seizure across markets. No exact Hyundai primary campaign was found, so the row remains byte-for-byte unchanged.',
  [IDS.clutch]: 'Forum cases do not establish one Hyundai-defined 2009-2019 i20 input-shaft-seal/clutch defect, incidence, warranty position, mileage range or preferred aftermarket kit. No exact Hyundai primary document was found, so the row remains byte-for-byte unchanged.',
};

const FUEL_PUMP_CARD = {
  years: [2021, 2022, 2023],
  category: 'fuel',
  severity: 'high',
  confidence: 'high',
  title: 'Fuel Pump Impeller Failure - Engine Stall Recall (51DT07)',
  description: 'EU Safety Gate alert SR/03401/25 covers Hyundai i20, i20 N and Bayon vehicles under campaign 51DT07. The alert says the fuel-pump impeller can swell from fuel exposure and high operating temperatures until it contacts the pump housing. Fuel delivery can then fall, causing loss of engine power or the vehicle to stop and increasing injury risk.',
  solution: 'Ask an authorized Hyundai dealer to check the VIN for campaign 51DT07. Hyundai\'s Slovenia recall notice says the free remedy replaces the fuel pump and tube assembly. It lists regular i20 and Bayon production from April 1, 2021 through December 3, 2022, and i20 N production from June 1, 2021 through January 4, 2023.',
  symptoms: ['Loss of engine power', 'Vehicle may stop because fuel-pump performance is reduced'],
  affectedSystems: ['Fuel pump', 'Fuel-pump impeller', 'Fuel-pump tube assembly'],
  dtcCodes: [],
  citations: [
    { type: 'recall', title: 'EU Safety Gate Alert SR/03401/25 - Hyundai i20, i20 N and Bayon Fuel Pump', url: SOURCES.safetyGate },
    { type: 'recall', title: 'Hyundai Slovenia - Service Recall 51DT07 for i20, Bayon and i20 N', url: SOURCES.hyundaiSlovenia },
    { type: 'recall', title: 'Traficom Finland - Hyundai i20 / i20 N Fuel Pump Recall 51DT07', url: SOURCES.traficomFinland },
  ],
  summary: 'Kept the same indexed 51DT07 fuel-pump-impeller identity and 2021-2023 span, replaced aggregator/forum links with exact EU, Hyundai and Finnish-regulator deep links, distinguished regular-i20 and i20-N production windows, and removed the unsupported worldwide count, no-start, hesitation, warning-light, DTC and cost claims.',
};

function rewriteFuelPump(current) {
  return fullRecord({
    ...current,
    ...FUEL_PUMP_CARD,
    make: 'Hyundai',
    model: 'i20',
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
    contentUpdateSummary: FUEL_PUMP_CARD.summary,
    relatedIssueIds: [],
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'i20');
  if (modelRows.length !== 5) throw new Error(`expected 5 Hyundai i20 rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const isFuelPump = current.id === IDS.fuelPump;
    if (!isFuelPump && !KEEP_REASONS[current.id]) throw new Error(`missing i20 decision: ${current.id}`);
    const proposal = isFuelPump ? rewriteFuelPump(before) : before;
    return {
      id: current.id,
      model: current.model,
      action: isFuelPump ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: isFuelPump ? FUEL_PUMP_CARD.summary : KEEP_REASONS[current.id],
      identityRule: isFuelPump ? 'The same indexed 51DT07 i20 fuel-pump identity stays on the existing ID, title and category; only facts from exact official sources remain.' : 'No content or publication-state changes; secondary material or a bulletin for another model cannot replace this indexed issue.',
      commerceDecision: isFuelPump ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: isFuelPump ? FUEL_PUMP_CARD.citations.map((item) => ({ kind: 'official-record-specific-recall', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed defect, scope or remedy.` })) : [],
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });
  const summary = { rewrite_same_identity: 1, keep_published_pending_source: 4, total: 5 };
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Hyundai',
    model: 'i20',
    completionStatement: 'This packet reconciles all five frozen Hyundai i20 rows. One same-identity fuel-pump recall rewrite is proposed; four broad rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All five rows remain published. Four are byte-for-byte unchanged.',
      'The single rewrite preserves the indexed title and category and uses only exact record-specific official recall links.',
      'The rewrite contains zero commerce, zero cost or mileage claims, empty trim and engine arrays, and no unsupported DTC.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: { snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, i20RecordCount: modelRows.length },
    observations: [
      { code: 'regular-i20-and-i20n-windows-separated', severity: 'independent-review-required', recordIds: [IDS.fuelPump], detail: 'The proposal distinguishes regular i20/Bayon production through 2022-12-03 from i20 N production through 2023-01-04 instead of presenting one imprecise early-2023 window.' },
      { code: 'fuel-pump-secondary-claims-removed', severity: 'independent-review-required', recordIds: [IDS.fuelPump], detail: 'The worldwide population, no-start, hesitation, sputtering, check-engine and low-fuel-pressure-code claims are not retained.' },
      { code: 'dct-other-model-tsb-rejected', severity: 'independent-review-required', recordIds: [IDS.dct], detail: 'TSB 21-AT-014H applies to Tucson and Sonata and cannot be used to rewrite an i20 page.' },
      { code: 'three-broad-owner-narratives-frozen', severity: 'independent-review-required', recordIds: [IDS.timingChain, IDS.ac, IDS.clutch], detail: 'The timing-chain, air-conditioning and clutch narratives remain unchanged without exact Hyundai primary evidence.' },
    ],
    publicSources: SOURCES,
    summary,
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { FUEL_PUMP_CARD, IDS, KEEP_REASONS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteFuelPump };
