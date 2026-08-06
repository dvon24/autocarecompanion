/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-hrv-adjudication-2026-08-06.json');

const IDS = {
  doorLock: 'honda-hr-v-door-lock-actuator-failure-clicking-erratic-locking',
  seatBelt: 'honda-hr-v-front-seat-belt-pretensioner-missing-rivet',
  fuelPump: 'honda-hr-v-fuel-pump-impeller-swelling-causing-engine-stall',
  acCompressor: 'honda-hrv-ac-compressor-failure-2016',
  cvt: 'honda-hrv-cvt-transmission-shudder-2016',
  driveBelt: 'honda-hrv-drive-belt-tensioner-rattle-2016',
  batteryDrain: 'honda-hrv-electrical-battery-drain-2016',
  infotainment: 'honda-hrv-infotainment-freezing-2016',
  oilLeaks: 'honda-hrv-oil-leaks-engine-2016',
  paint: 'honda-hrv-paint-peeling-2016',
  rearCamera: 'honda-hrv-rear-camera-failure-2023',
  rearWindow: 'honda-hrv-rear-window-shattering-2023',
  steering: 'honda-hrv-steering-gearbox-recall-2023',
  wheelBearing: 'honda-hrv-wheel-bearing-noise-2016',
  windowGasket: 'honda-hrv-window-gasket-failure-2016',
};

const SOURCES = {
  seatBelt: 'https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V782-7406.pdf',
  fuelPumpAwd: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V858-1142.PDF',
  fuelPump2wd: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V858-5560.pdf',
  cvt: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10198210-0001.pdf',
  paint: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10163811-0001.pdf',
  rearCamera: 'https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V046-6684.pdf',
  rearWindow: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11005188-0001.pdf',
  steering: 'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V744-9180.pdf',
};

const MISMATCH_SOURCES = {
  bulletin23010: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10229677-0001.pdf',
  bulletin23017: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10231545-0001.pdf',
};

const REWRITE_CARDS = {
  [IDS.seatBelt]: {
    years: [2023, 2024], category: 'safety', severity: 'high', confidence: 'high',
    title: 'Front Seat Belt Pretensioner Missing Rivet Recall 23V782',
    description: 'Honda recall 23V782 covers VIN-eligible 2023-2024 HR-V vehicles. Some front seat belt pretensioners were assembled without the rivet securing the quick connector and wire plate, so the belt may not properly restrain an occupant in a crash.',
    solution: 'Have a Honda dealer check VIN eligibility. The recall remedy is to inspect the front seat belt pretensioners and replace affected assemblies as necessary, free of charge.',
    symptoms: ['No driver-visible warning is expected', 'A missing rivet can prevent the pretensioner from properly restraining an occupant in a crash'], affectedSystems: ['Front seat belt pretensioners'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall Acknowledgment 23V782 - 2023-2024 HR-V Seat Belt Pretensioners', url: SOURCES.seatBelt }],
    identityTerms: ['seat', 'belt', 'pretensioner'],
    summary: 'Retained the seat-belt-pretensioner identity and exact 2023-2024 scope while replacing secondary-source counts with NHTSA recall 23V782 and its inspection/replacement remedy.',
  },
  [IDS.fuelPump]: {
    years: [2018, 2019, 2020], category: 'fuel', severity: 'high', confidence: 'high',
    title: 'In-Tank Fuel Pump Motor Recall 23V858',
    description: 'Honda Bulletins 24-015 and 24-026 cover VIN-eligible 2018-2020 HR-V AWD and 2WD vehicles. A low-density fuel-pump impeller can absorb fuel and deform, interfere with the pump body and make the pump inoperative. The engine may not start or may stall while driving, increasing crash risk.',
    solution: 'Have a Honda dealer check VIN eligibility. The recall remedy is replacement of the in-tank fuel pump motor under recall 23V858.',
    symptoms: ['Difficulty starting', 'Engine hesitation while driving', 'Malfunction indicator lamp may illuminate', 'Engine may stall while driving', 'DTC P0087 may be stored'], affectedSystems: ['In-tank fuel pump motor', 'Fuel pump impeller'], dtcCodes: ['P0087'],
    citations: [
      { type: 'recall', title: 'Honda Bulletin 24-015 - 2018-2020 HR-V AWD Fuel Pump Motor Recall', url: SOURCES.fuelPumpAwd },
      { type: 'recall', title: 'Honda Bulletin 24-026 - 2018-2020 HR-V 2WD Fuel Pump Motor Recall', url: SOURCES.fuelPump2wd },
    ],
    identityTerms: ['fuel', 'pump'],
    summary: 'Corrected the mixed 20V314/23V858 narrative to the exact 2018-2020 AWD and 2WD HR-V recall bulletins and removed unsupported supplier, pricing, sound and out-of-recall repair claims.',
  },
  [IDS.cvt]: {
    years: [2016, 2017, 2018, 2019, 2020], category: 'transmission', severity: 'high', confidence: 'high',
    title: 'CVT Software Update and Premature Belt Deterioration - Bulletins 21-046/21-047',
    description: 'Honda product update 21-046 and warranty extension 21-047 apply to VIN-eligible 2016-2020 HR-V vehicles. The original CVT software may not properly monitor internal fluid pressure or detect early belt failure. Early belt deterioration can eventually cause the vehicle not to move when accelerating.',
    solution: 'Have a Honda dealer check VIN eligibility and campaign completion. Honda directs a CVT software update followed by inspection; a CVT that fails the inspection is replaced under the campaign. Honda announced coverage of 7 years from original purchase or 150,000 miles, whichever comes first, after the product update is completed.',
    symptoms: ['Malfunction indicator lamp may illuminate', 'Vehicle may not move when accelerating', 'DTC P721E may be stored after the software update'], affectedSystems: ['Continuously variable transmission software', 'CVT belt'], dtcCodes: ['P721E'],
    citations: [{ type: 'tsb', title: 'Honda 2016-2020 HR-V CVT Product Update and Warranty Extension Notice', url: SOURCES.cvt }],
    identityTerms: ['cvt', 'transmission'],
    summary: 'Narrowed the 2016-2022 shudder aggregation to Honda\'s VIN-eligible 2016-2020 CVT software and premature-belt-deterioration campaigns and removed unsupported fluid intervals, towing rules, pricing and extra DTCs.',
  },
  [IDS.paint]: {
    years: [2016, 2017, 2018], category: 'body', severity: 'low', confidence: 'high',
    title: 'White Orchid Pearl Paint Peeling - Bulletin 19-064',
    description: 'Honda Bulletin 19-064 applies to VIN-eligible 2016-2018 HR-V vehicles originally painted White Orchid Pearl. Insufficient paint thickness in areas including the roof and around the tailgate can allow ultraviolet light to reach the underlayer, causing oxidation and peeling.',
    solution: 'Have a Honda dealer check VIN eligibility and inspect the peeling. Honda announced a 7-year, unlimited-mileage paint warranty extension; qualifying factory-application peeling is repaired by repainting the affected panels.',
    symptoms: ['White Orchid Pearl paint peels', 'Peeling may appear on the roof or around the tailgate'], affectedSystems: ['Exterior paint finish'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Bulletin 19-064 - White Orchid Pearl Paint Warranty Extension', url: SOURCES.paint }],
    identityTerms: ['paint', 'peeling'],
    summary: 'Restricted the paint card to Honda\'s exact 2016-2018 White Orchid Pearl campaign and removed unsupported Bellanova White, other-color, rust, class-action, pricing and material claims.',
  },
  [IDS.rearCamera]: {
    years: [2019, 2020, 2021, 2022], category: 'safety', severity: 'high', confidence: 'high',
    title: 'Inoperative Rearview Camera Display Recall 23V046',
    description: 'Honda recall 23V046 covers VIN-eligible 2019-2022 HR-V vehicles. A design error in the display-audio power circuit can prevent the unit from booting when the engine is started with a key, so the rearview camera image may not appear. The vehicles may fail the federal rear-visibility standard.',
    solution: 'Have a Honda dealer check VIN eligibility and update the display-audio-unit software under recall 23V046.',
    symptoms: ['Rearview camera image may not display after a keyed engine start', 'Display audio unit may fail to boot'], affectedSystems: ['Display audio unit', 'Rearview camera display function'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall Acknowledgment 23V046 - 2019-2022 HR-V Rearview Camera Display', url: SOURCES.rearCamera }],
    identityTerms: ['rear', 'camera'],
    summary: 'Corrected the page from unsupported 2023 scope and unrelated recall 23V782 to Honda recall 23V046 for VIN-eligible 2019-2022 HR-V vehicles and its software-update remedy.',
  },
  [IDS.rearWindow]: {
    years: [2023], category: 'body', severity: 'high', confidence: 'high',
    title: 'Rear Window Defroster Hot-Spot and Glass Weakening - Bulletin 24-012',
    description: 'Honda Bulletin 24-012 applies to VIN-eligible 2023 HR-V vehicles. During assembly, rear-glass sealer may have contacted the defroster heating elements, creating a hot spot that can weaken the glass over time as the defroster is used.',
    solution: 'Have a Honda dealer check VIN eligibility and inspect the rear glass. Bulletin 24-012 directs replacement of the rear windshield glass when inspection shows the affected condition.',
    symptoms: ['Rear glass may weaken over time', 'Rear glass may shatter as the defroster is used'], affectedSystems: ['Rear windshield glass', 'Rear defroster heating elements', 'Rear-glass sealer'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Bulletin 24-012 - 2023 HR-V Rear Window Inspection', url: SOURCES.rearWindow }],
    identityTerms: ['rear', 'window'],
    summary: 'Replaced the complaint-count, cold-weather, recall-status, pricing and goodwill narrative with Honda\'s exact 2023 HR-V product update, sealer/defroster mechanism and inspect-or-replace remedy.',
  },
  [IDS.steering]: {
    years: [2023, 2024, 2025], category: 'steering', severity: 'high', confidence: 'high',
    title: 'Sticky Steering From Steering Gearbox Friction - Recall 24V744',
    description: 'Honda recall 24V744 covers VIN-eligible 2023-2025 HR-V vehicles. An improperly produced steering-gearbox worm wheel can swell during use, and excessive worm-gear spring preload can increase friction between the worm wheel and gear. The resulting increased steering effort or difficulty raises crash risk.',
    solution: 'Have a Honda dealer check VIN eligibility. Honda Bulletin 24-118 directs repair of the EPS gearbox with an updated end cap, spring and spring seat plus grease, using the campaign procedure.',
    symptoms: ['Increased steering effort', 'Steering may feel sticky or difficult'], affectedSystems: ['Electric power steering gearbox', 'Worm wheel', 'Worm gear spring'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'Honda Bulletin 24-118 - 2023-2025 HR-V Steering Gearbox Recall', url: SOURCES.steering }],
    identityTerms: ['steering', 'gearbox'],
    summary: 'Corrected the 2023-only generic recall card to Honda recall 24V744/Bulletin 24-118 for VIN-eligible 2023-2025 HR-V vehicles, the exact friction mechanism and campaign repair, with unrelated transmission commerce removed.',
  },
};

const KEEP_REASONS = {
  [IDS.doorLock]: 'A forum thread and cost estimator do not establish a 2016-2020 HR-V door-lock-actuator defect, system-wide mechanism, part family or Honda remedy. The row remains byte-for-byte unchanged.',
  [IDS.acCompressor]: 'Two complaints do not establish a 2016-2023 HR-V compressor defect, mileage range, clutch-first progression, system contamination or Honda remedy. The row remains unchanged.',
  [IDS.driveBelt]: 'The citations include fabricated-looking forum and video paths plus a generic model page; they do not establish an HR-V tensioner defect or the claimed accessory-loss consequences. The row remains unchanged.',
  [IDS.batteryDrain]: 'A generic model page and forum path do not establish the combined door-lock, infotainment, stability-module and battery-drain narrative or the claimed fuse diagnosis. The row remains unchanged.',
  [IDS.infotainment]: 'The frozen Bulletin 23-010 citation is false for this identity: Honda Bulletin 23-010 covers idle-stop restart on Passport, Pilot and Ridgeline, not HR-V infotainment. A complaint cannot support the broad multi-generation aggregation, so the row remains unchanged.',
  [IDS.oilLeaks]: 'The frozen Bulletin 23-017 citation is false for this identity: Honda Bulletin 23-017 covers 2023 CR-V Hybrid active-grille software, not HR-V crankshaft-seal leakage. A complaint cannot support the broad multi-seal aggregation, so the row remains unchanged.',
  [IDS.wheelBearing]: 'One complaint and a forum thread do not establish a 2016-2023 premature front-wheel-bearing defect, mileage range, catastrophic outcome or Honda remedy. The row remains unchanged.',
  [IDS.windowGasket]: 'A forum thread and one complaint do not establish a 2016-2022 all-window gasket design defect, adhesive remedy or durability claim. The row remains unchanged.',
};

function normalizedFileHash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex'); }
function rewriteProposal(current, card) {
  return fullRecord({ ...current, ...card, make: 'Honda', model: 'HR-V', trims: [], engines: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: card.summary, relatedIssueIds: [] });
}
function mismatchEvidence(id) {
  if (id === IDS.infotainment) return [{ kind: 'citation-model-and-identity-mismatch', url: MISMATCH_SOURCES.bulletin23010, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 23-010 covers auto-idle-stop restart on Passport, Pilot and Ridgeline; it does not cover HR-V infotainment.' }];
  if (id === IDS.oilLeaks) return [{ kind: 'citation-model-and-identity-mismatch', url: MISMATCH_SOURCES.bulletin23017, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 23-017 covers a 2023 CR-V Hybrid active-grille software update; it does not cover HR-V oil leakage.' }];
  return [];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'HR-V');
  if (modelRows.length !== 15) throw new Error(`expected 15 Honda HR-V rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const proposal = card ? rewriteProposal(before, card) : before;
    return { id: current.id, model: current.model, action, reason: card ? card.summary : KEEP_REASONS[current.id], identityRule: card ? 'The indexed issue identity remains on the same ID; official Honda/NHTSA scope, mechanism and remedy replace unsupported generalizations.' : 'No content or publication-state changes; a complaint, forum, video or unrelated bulletin cannot replace this issue.', commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit', changedFields: diffFields(before, proposal), evidence: card ? card.citations.map((item) => ({ kind: 'manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, mechanism and remedy.` })) : mismatchEvidence(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const actions = ['rewrite_same_identity', 'keep_published_pending_source'];
  const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length])); summary.total = rows.length;
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Honda', model: 'HR-V',
    completionStatement: 'This packet reconciles all 15 frozen Honda HR-V rows. Seven same-identity Honda/NHTSA corrections are proposed; eight rows remain byte-for-byte unchanged pending exact evidence or independent disposition.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.', 'All 15 rows remain published. Eight are byte-for-byte unchanged.', 'An unrelated campaign, bulletin, component or model may never replace the issue named by an existing indexed page.', 'Each rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.', 'Independent row-by-row approval is required before a separate guarded apply path may be created.'],
    source: { snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, hrvRecordCount: modelRows.length },
    observations: [
      { code: 'camera-recall-number-and-years-corrected', severity: 'independent-review-required', recordIds: [IDS.rearCamera], detail: 'The frozen page says 2023 and cites seat-belt recall 23V782. The exact rear-camera recall is 23V046 for VIN-eligible 2019-2022 HR-V vehicles.' },
      { code: 'two-false-bulletin-identities-frozen', severity: 'independent-review-required', recordIds: [IDS.infotainment, IDS.oilLeaks], detail: 'Bulletin 23-010 is an idle-stop restart bulletin for other Honda models; Bulletin 23-017 is a 2023 CR-V Hybrid active-grille software update. Neither supports its frozen HR-V card.' },
      { code: 'cvt-scope-narrowed', severity: 'independent-review-required', recordIds: [IDS.cvt], detail: 'Honda supports VIN-eligible 2016-2020 HR-V CVT software monitoring and premature belt deterioration, not the broader 2016-2022 shudder/maintenance aggregation.' },
      { code: 'paint-color-scope-corrected', severity: 'independent-review-required', recordIds: [IDS.paint], detail: 'Honda Bulletin 19-064 covers 2016-2018 White Orchid Pearl HR-V vehicles; Bellanova White and other colors are not included by this source.' },
      { code: 'rear-glass-product-update-added', severity: 'independent-review-required', recordIds: [IDS.rearWindow], detail: 'Honda Bulletin 24-012 now provides the exact 2023 sealer/defroster mechanism and inspect-or-replace product-update remedy.' },
      { code: 'generic-source-cluster', severity: 'independent-review-required', recordIds: [IDS.doorLock, IDS.acCompressor, IDS.driveBelt, IDS.batteryDrain, IDS.wheelBearing, IDS.windowGasket], detail: 'Generic pages, complaints, forums and videos do not establish the exact model-wide defect, mechanism, scope and remedy claims.' },
    ], summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { FULL_RECORD_FIELDS, IDS, KEEP_REASONS, MISMATCH_SOURCES, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteProposal };
