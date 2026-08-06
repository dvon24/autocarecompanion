/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-creta-adjudication-2026-08-06.json');

const IDS = {
  dct: 'hyundai-creta-7-speed-dry-dct-failures-1-4-t-gdi',
  brakeBooster: 'hyundai-creta-brake-booster-diaphragm-defect-official-brazil-recall',
  dpf: 'hyundai-creta-diesel-particulate-filter-clogging-city-only-driving',
  ac: 'hyundai-creta-intermittent-ac-cooling-loss-premature-compressor-failure',
  oilPump: 'hyundai-creta-ivt-electronic-oil-pump-controller-defect-official-india-rec',
  clutch: 'hyundai-creta-premature-clutch-wear-heavy-clutch-diesel-manuals',
};

const SOURCES = {
  brazilBrakeBoosterPdf: 'https://hyundai.com.br/content/dam/hmb/servicos/recall/pdf/DPDC-DOC4-Aviso%20de%20Risco.pdf',
  indiaRecallRegistry: 'https://www.siam.in/siam-voluntary-recall.aspx',
  indiaVinLookup: 'https://www.hyundai.com/in/en/connect-to-service/important-customer-notification',
};

const REWRITE_CARDS = {
  [IDS.brakeBooster]: {
    years: [2024, 2025],
    category: 'brakes',
    severity: 'high',
    confidence: 'high',
    title: 'Brake-Booster Diaphragm Can Shift and Reduce Brake Assist - Brazil Recall',
    description: 'Hyundai Motor Brasil recalled Creta 1.0 AT Turbo vehicles from model years 2024/2024 and 2024/2025 that were manufactured from March 12 through July 16, 2024. The brake-booster diaphragm can shift, reducing vacuum in the brake-assist system. The brake pedal can become harder to press, requiring more driver effort and increasing braking time and distance.',
    solution: 'Check the chassis range in Hyundai Motor Brasil\'s recall notice. If the brake pedal becomes hard, Hyundai advises stopping use of the vehicle and contacting an HMB dealer immediately. Dealers replace the brake booster free of charge; the notice estimates about two hours for the service.',
    symptoms: ['Brake pedal becomes harder to press', 'More driver force is required to brake', 'Braking time and distance can increase'],
    affectedSystems: ['Brake booster', 'Brake-assist vacuum system'],
    dtcCodes: [],
    citations: [
      { type: 'recall', title: 'Hyundai Motor Brasil - Creta Brake-Booster Recall Notice', url: SOURCES.brazilBrakeBoosterPdf },
    ],
    identityTerms: ['brake booster', 'diaphragm'],
    summary: 'Narrowed the existing Brazil brake-booster page to Hyundai Motor Brasil\'s exact model-year, production-period, diaphragm/vacuum mechanism, braking consequence and free booster-replacement remedy.',
  },
  [IDS.oilPump]: {
    years: [2023],
    category: 'transmission',
    severity: 'medium',
    confidence: 'high',
    title: 'G 1.5 IVT Electronic Oil-Pump Controller Recall - India',
    description: 'The Society of Indian Automobile Manufacturers voluntary-recall registry lists a Hyundai Motor India campaign dated February 21, 2024 for Creta and Verna G 1.5 IVT vehicles produced from February 13 through June 6, 2023. The combined campaign covers 7,698 vehicles for a potential electronic oil-pump controller issue that may affect electronic oil-pump performance.',
    solution: 'Enter the vehicle\'s VIN on Hyundai Motor India\'s official recall-campaign page. Hyundai states that affected customers are notified by the company or an authorized dealer and should follow the dealer\'s campaign instructions.',
    symptoms: ['VIN is included in Hyundai Motor India\'s Creta and Verna G 1.5 IVT recall campaign'],
    affectedSystems: ['Electronic oil-pump controller', 'Electronic oil pump'],
    dtcCodes: [],
    citations: [
      { type: 'recall', title: 'SIAM Voluntary Recall Registry - Hyundai Creta and Verna G 1.5 IVT', url: SOURCES.indiaRecallRegistry },
      { type: 'manufacturer', title: 'Hyundai Motor India - Recall Campaign VIN Lookup', url: SOURCES.indiaVinLookup },
    ],
    identityTerms: ['electronic oil-pump controller', 'G 1.5 IVT'],
    summary: 'Replaced secondary recall reporting and unsupported warning, hesitation, hydraulic-pressure and replacement claims with the SIAM registry\'s exact combined population, build window, variant and controller-performance statement plus Hyundai India\'s VIN lookup.',
  },
};

const KEEP_REASONS = {
  [IDS.dct]: 'Owner threads and secondary summaries do not establish one 2020-2023 Creta 1.4 T-GDI dry-DCT defect spanning actuator failure, even-gear loss, overheating, judder, DTC P060194, repeat repairs and the frozen replacement-cost range. No exact Hyundai campaign or service document was found, so the row remains byte-for-byte unchanged.',
  [IDS.dpf]: 'Owner reports do not establish the frozen claim that the Creta DPF lacks an active heater, one 2020-2024 failure population, a universal speed/time regeneration procedure, limp-mode progression or the stated replacement cost. No exact Hyundai primary document was found for the complete identity, so the row remains byte-for-byte unchanged.',
  [IDS.ac]: 'The frozen row combines evaporator icing, thermistor/expansion-valve control and unrelated compressor wear across multiple markets and model years using owner reports. No exact Hyundai primary document establishes one same-identity defect, mileage threshold or remedy, so the row remains byte-for-byte unchanged.',
  [IDS.clutch]: 'Owner reviews and a used-car cost article do not establish one 2015-2024 Creta diesel-manual clutch defect, frequency, mileage band, driving-stress mechanism, repair scope or cost. No exact Hyundai primary document was found, so the row remains byte-for-byte unchanged.',
};

function rewriteProposal(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Hyundai',
    model: 'Creta',
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
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Creta');
  if (modelRows.length !== 6) throw new Error(`expected 6 Hyundai Creta rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card ? 'The existing indexed issue stays on the same ID; only the official same-identity scope, mechanism, consequence and campaign guidance replace unsupported claims.' : 'No content or publication-state changes; owner reports and overlapping symptoms cannot establish or replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card ? card.citations.map((item) => ({ kind: item.type === 'recall' ? 'official-recall-record' : 'manufacturer-recall-lookup', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope or owner lookup path.` })) : [],
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });
  const summary = {
    rewrite_same_identity: rows.filter((row) => row.action === 'rewrite_same_identity').length,
    keep_published_pending_source: rows.filter((row) => row.action === 'keep_published_pending_source').length,
    total: rows.length,
  };
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Hyundai',
    model: 'Creta',
    completionStatement: 'This packet reconciles all six frozen Hyundai Creta rows. Two exact same-identity recall rewrites are proposed from Hyundai Brazil and the SIAM/Hyundai India recall records; four rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All six rows remain published. Four are byte-for-byte unchanged.',
      'An unrelated campaign, component, symptom group, generation or model may never replace the issue named by an existing indexed page.',
      'Each rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      cretaRecordCount: modelRows.length,
    },
    observations: [
      { code: 'brazil-brake-booster-scope-narrowed', severity: 'independent-review-required', recordIds: [IDS.brakeBooster], detail: 'The proposal uses Hyundai Motor Brasil\'s direct recall PDF and retains only its exact vehicle, production, diaphragm/vacuum, risk and remedy statements.' },
      { code: 'india-oil-pump-unsupported-effects-removed', severity: 'independent-review-required', recordIds: [IDS.oilPump], detail: 'The SIAM entry confirms G 1.5 IVT, the combined 7,698 population, build dates and potential oil-pump performance effect; it does not claim warning lights, hesitation, harsh engagement or a replacement remedy.' },
      { code: 'multi-failure-narratives-frozen', severity: 'independent-review-required', recordIds: [IDS.dct, IDS.dpf, IDS.ac, IDS.clutch], detail: 'Four owner/secondary-source narratives remain unchanged rather than being consolidated, archived or rewritten without an exact OEM source.' },
    ],
    summary,
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { IDS, KEEP_REASONS, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteProposal };
