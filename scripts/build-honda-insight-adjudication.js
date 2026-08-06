/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-honda-insight-adjudication-2026-08-06.json');

const IDS = {
  battery12v: 'honda-insight-12v-battery-issues-2010', bcm: 'honda-insight-bcm-communication-errors-2019', catalytic: 'honda-insight-catalytic-converter-failure-2000', cvt: 'honda-insight-cvt-transmission-judder-2010', dcDc: 'honda-insight-dcdc-converter-shutdown-2020', egr: 'honda-insight-egr-system-clogging-2000', fuelPump: 'honda-insight-fuel-pump-recall-2019', groundCable: 'honda-insight-ground-cable-corrosion-2010', imaBattery: 'honda-insight-ima-battery-failure-2000', rearSuspension: 'honda-insight-rear-suspension-noise-2010',
};
const SOURCES = {
  bcm: 'https://static.nhtsa.gov/odi/rcl/2020/RCRN-20V771-7293.pdf',
  dcDc: 'https://static.nhtsa.gov/odi/rcl/2020/RCAK-20V798-1007.pdf',
  fuelPump: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V858-4964.pdf',
};
const MISMATCH_SOURCES = {
  bulletin21079: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10202028-0001.pdf',
  bulletin15086: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10108735-9999.pdf',
};

const REWRITE_CARDS = {
  [IDS.bcm]: {
    years: [2019, 2020], category: 'electrical', severity: 'high', confidence: 'high', title: 'Body Control Module Software Recall 20V771',
    description: 'Honda recall 20V771 covers VIN-eligible 2019-2020 Insight vehicles. A software error can disrupt communication between the body control module and other components, illuminate warning indicators, and disable functions including the windshield wipers, defroster, rearview camera or exterior lighting. The vehicle may also fail to engage Park automatically under some conditions.',
    solution: 'Have a Honda dealer check VIN eligibility and update the body control module software under recall 20V771.',
    symptoms: ['Multiple warning indicators may illuminate', 'Windshield wipers or defroster may become inoperative', 'Rearview camera or exterior lighting may malfunction', 'Vehicle may not automatically engage Park under some conditions'], affectedSystems: ['Body control module software', 'Vehicle communication network'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'Honda Recall Notice 20V771 - 2019-2020 Insight Body Control Module Software', url: SOURCES.bcm }], identityTerms: ['body', 'control', 'module'],
    summary: 'Retained the BCM identity and exact 2019-2020 scope while replacing generic pages and fabricated-looking forum material with Honda recall 20V771, its supported effects and software remedy; removed unrelated commerce.',
  },
  [IDS.dcDc]: {
    years: [2020, 2021], category: 'electrical', severity: 'high', confidence: 'high', title: 'DC-DC Converter Shutdown Recall 20V798',
    description: 'Honda recall 20V798 covers VIN-eligible 2020-2021 Insight vehicles. The DC-DC converter may shut down and stop recharging the 12-volt battery, which can result in a loss of drive power and increase crash risk.',
    solution: 'Have a Honda dealer check VIN eligibility and update the power converter unit software under recall 20V798.',
    symptoms: ['12-volt battery may stop charging', 'Drive power may be lost'], affectedSystems: ['DC-DC converter', 'Power converter unit software', '12-volt charging system'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall Acknowledgment 20V798 - 2020-2021 Insight DC-DC Converter', url: SOURCES.dcDc }], identityTerms: ['dc-dc', 'converter'],
    summary: 'Replaced generic complaints, forum and video claims with the exact 2020-2021 Honda/NHTSA DC-DC shutdown recall and its PCU software remedy, with all unrelated battery commerce removed.',
  },
  [IDS.fuelPump]: {
    years: [2019, 2020, 2022], category: 'fuel', severity: 'high', confidence: 'high', title: 'In-Tank Fuel Pump Motor Recall 23V858',
    description: 'Honda Bulletin 24-024 covers VIN-eligible 2019-2020 and 2022 Insight vehicles. A defective fuel-pump impeller can swell, interfere with the pump body and make the pump inoperative. The engine may not start or may stall while driving, increasing crash risk.',
    solution: 'Have a Honda dealer check VIN eligibility. The campaign remedy is replacement of the in-tank fuel pump motor under recall 23V858.',
    symptoms: ['Difficulty starting', 'Engine hesitation while driving', 'Malfunction indicator lamp may illuminate', 'Engine may stall while driving', 'DTC P0087 may be stored'], affectedSystems: ['In-tank fuel pump motor', 'Fuel pump impeller'], dtcCodes: ['P0087'],
    citations: [{ type: 'recall', title: 'Honda Bulletin 24-024 - 2019-2020 and 2022 Insight Fuel Pump Motor Recall', url: SOURCES.fuelPump }], identityTerms: ['fuel', 'pump'],
    summary: 'Corrected the continuous 2019-2022 scope to Honda Bulletin 24-024\'s VIN-eligible 2019-2020 and 2022 vehicles, and removed unsupported 2021 coverage, extra symptoms, timing, loaner and aftermarket commerce claims.',
  },
};

const KEEP_REASONS = {
  [IDS.battery12v]: 'The frozen Bulletin 21-079 citation is false for this identity: Honda Bulletin 21-079 is a 2022 Civic key-fob campaign, not an Insight battery-management update. One complaint cannot support the thirteen-year battery narrative, so the row remains unchanged.',
  [IDS.catalytic]: 'The row has no citations and combines model-wide failure frequency, lean-burn causation, prices, brand durability and EGR causation without an exact primary source. It remains byte-for-byte unchanged.',
  [IDS.cvt]: 'The frozen Bulletin 15-086 citation is false for this identity: Honda Bulletin 15-086 covers 2012-2014 CR-V light-acceleration vibration, not Insight CVT belt deterioration. One complaint cannot support the broad warranty and failure narrative.',
  [IDS.egr]: 'The row has no citations and combines an all-year defect, lean-burn causation, maintenance interval, catalyst consequence and repair claims without an exact Honda source. It remains unchanged.',
  [IDS.groundCable]: 'A generic model page and fabricated-looking video path do not establish three specific internally corroding ground cables across 2010-2014 Insight vehicles or the claimed remedy. The row remains unchanged.',
  [IDS.imaBattery]: 'Generic pages, a fabricated-looking forum path and video do not establish one failure mechanism, mileage range, warranty rule or repair hierarchy across three materially different Insight generations. The row remains unchanged.',
  [IDS.rearSuspension]: 'One generic complaint page does not establish premature rear-shock failure, hybrid-battery causation, pricing or brand recommendations across 2010-2014 Insight vehicles. The row remains unchanged.',
};

function normalizedFileHash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex'); }
function rewriteProposal(current, card) { return fullRecord({ ...current, ...card, make: 'Honda', model: 'Insight', trims: [], engines: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: card.summary, relatedIssueIds: [] }); }
function mismatchEvidence(id) {
  if (id === IDS.battery12v) return [{ kind: 'citation-model-and-identity-mismatch', url: MISMATCH_SOURCES.bulletin21079, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 21-079 is a 2022 Civic key-fob campaign; it does not cover Insight 12-volt battery management.' }];
  if (id === IDS.cvt) return [{ kind: 'citation-model-and-identity-mismatch', url: MISMATCH_SOURCES.bulletin15086, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 15-086 covers 2012-2014 CR-V light-acceleration vibration; it does not cover Insight CVT belt deterioration.' }];
  return [];
}
function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Insight');
  if (modelRows.length !== 10) throw new Error(`expected 10 Honda Insight rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => { const before = fullRecord(current); const card = REWRITE_CARDS[current.id]; const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source'; const proposal = card ? rewriteProposal(before, card) : before; return { id: current.id, model: current.model, action, reason: card ? card.summary : KEEP_REASONS[current.id], identityRule: card ? 'The indexed issue identity remains on the same ID; exact Honda/NHTSA scope, mechanism and remedy replace unsupported generalizations.' : 'No content or publication-state changes; a generic page, complaint, forum, video or unrelated bulletin cannot replace this issue.', commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit', changedFields: diffFields(before, proposal), evidence: card ? card.citations.map((item) => ({ kind: 'manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, mechanism and remedy.` })) : mismatchEvidence(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal }; });
  const actions = ['rewrite_same_identity', 'keep_published_pending_source']; const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length])); summary.total = rows.length;
  const packet = { schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Honda', model: 'Insight', completionStatement: 'This packet reconciles all 10 frozen Honda Insight rows. Three same-identity Honda/NHTSA recall corrections are proposed; seven rows remain byte-for-byte unchanged pending exact evidence or independent disposition.', safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.', 'All 10 rows remain published. Seven are byte-for-byte unchanged.', 'An unrelated campaign, bulletin, component or model may never replace the issue named by an existing indexed page.', 'Each rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.', 'Independent row-by-row approval is required before a separate guarded apply path may be created.'], source: { snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, insightRecordCount: modelRows.length }, observations: [
    { code: 'two-false-bulletin-identities-frozen', severity: 'independent-review-required', recordIds: [IDS.battery12v, IDS.cvt], detail: 'Bulletin 21-079 is a 2022 Civic key-fob campaign and Bulletin 15-086 is a 2012-2014 CR-V vibration bulletin. Neither supports its frozen Insight card.' },
    { code: 'fuel-pump-year-gap-corrected', severity: 'independent-review-required', recordIds: [IDS.fuelPump], detail: 'Honda Bulletin 24-024 covers VIN-eligible 2019-2020 and 2022 Insight vehicles, not every 2019-2022 model year.' },
    { code: 'three-generation-ima-overaggregation', severity: 'independent-review-required', recordIds: [IDS.imaBattery], detail: 'The frozen card merges three different Insight generations, warranty claims and repair paths without an exact primary source; it remains unchanged.' },
    { code: 'uncited-first-generation-cluster', severity: 'independent-review-required', recordIds: [IDS.catalytic, IDS.egr], detail: 'The catalytic-converter and EGR cards contain broad causation, frequency, maintenance and commerce claims with no citations.' },
    { code: 'generic-source-cluster', severity: 'independent-review-required', recordIds: [IDS.groundCable, IDS.rearSuspension], detail: 'Generic vehicle pages and a fabricated-looking video path do not establish the exact model-wide mechanisms or remedies.' },
  ], summary, rows };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}
if (require.main === module) main();
module.exports = { FULL_RECORD_FIELDS, IDS, KEEP_REASONS, MISMATCH_SOURCES, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteProposal };
