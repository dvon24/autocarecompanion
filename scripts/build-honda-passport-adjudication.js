/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-honda-passport-adjudication-2026-08-06.json');

const IDS = {
  nineSpeed: 'honda-passport-9speed-transmission-problems-2019',
  abs: 'honda-passport-abs-hydraulic-unit--2000',
  acCompressor: 'honda-passport-ac-compressor-failure-2019',
  automaticTransmission: 'honda-passport-automatic-transmission-torque-converter-2000',
  batteryDrain: 'honda-passport-battery-drain-2019',
  brakeBooster: 'honda-passport-brake-booster-recall-2019',
  exhaustStud: 'honda-passport-exhaust-manifold-stud-breakage-2000',
  frameRust: 'honda-passport-frame-rust-and-rear-2000',
  fuelPump: 'honda-passport-fuel-pump-recall-2019',
  idleStop: 'honda-passport-idle-stop-stalling-2019',
  ignitionSwitch: 'honda-passport-ignition-switch-failure-causing-2000',
  infotainment: 'honda-passport-infotainment-fakra-connector-2019',
  paint: 'honda-passport-paint-clearcoat-peeling-2019',
  powerWindow: 'honda-passport-power-window-regulator-and-2000',
  rearDifferential: 'honda-passport-rear-differential-binding-and-2000',
  suspensionNoise: 'honda-passport-suspension-noise-clunk-2019',
  airbag: 'honda-passport-takata-front-airbag-inflator-2000',
  timingBelt: 'honda-passport-timing-belt-and-water-2000',
  valveCover: 'honda-passport-valve-cover-gasket-and-2000',
  vibration: 'honda-passport-vibration-highway-2019',
  wheelBearing: 'honda-passport-wheel-bearing-noise-2019',
};

const SOURCES = {
  nineSpeed: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10181389-0001.pdf',
  frameRust: 'https://static.nhtsa.gov/odi/rcl/2010/RCAK-10V436-9651.pdf',
  fuelPump2021: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V215-7994.PDF',
  fuelPump2023: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V858-4916.PDF',
  idleSoftware: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10245550-0001.pdf',
  idleWarranty: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10229676-0001.pdf',
  idleInvestigation: 'https://static.nhtsa.gov/odi/inv/2025/INOA-EA25004-10033.pdf?pubDate=20250404',
  infotainment: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V431-2199.PDF',
  airbagRupture: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=01V055000',
};

const MISMATCH_SOURCES = {
  frozenNineSpeedBulletin: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10108688-9999.pdf',
  unrelatedBrakeBoosterRecall: 'https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V458-8185.pdf',
  separateAirbagCheckValveRecall: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=02V213001',
  distinctModernRearSubframeRecall: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=26V365000',
};

const REWRITE_CARDS = {
  [IDS.nineSpeed]: {
    years: [2019], category: 'transmission', severity: 'medium', confidence: 'high', title: '9-Speed Automatic Intermittent Hard Upshift - Bulletin 20-029',
    description: 'Honda Service Bulletin 20-029 applies to all 2019 Passport vehicles. Abnormal transmission-control-module adaptation values can cause intermittent harsh or jerky upshifts during steady acceleration.',
    solution: 'Have a Honda dealer confirm the symptom and update the TCM software under Bulletin 20-029. Honda says the vehicle should have at least 500 miles before this condition is diagnosed and that TCM adaptation can take about 500 miles after the update.',
    symptoms: ['Intermittent harsh or jerky upshift during steady acceleration'], affectedSystems: ['9-speed automatic transmission control module'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 20-029 - 2019 Passport 9-Speed Hard Upshift', url: SOURCES.nineSpeed }], identityTerms: ['9-speed', 'upshift'],
    summary: 'Narrowed the unsupported 2019-2023 multi-failure narrative to Honda Bulletin 20-029\'s exact 2019 Passport hard-upshift condition, TCM cause and software remedy; removed the Pilot-only 17-014 citation, litigation, costs, DTCs and commerce.',
  },
  [IDS.frameRust]: {
    years: [1998, 1999, 2000, 2001, 2002], category: 'suspension', severity: 'critical', confidence: 'high', title: 'Rear Suspension Lower-Link Bracket Corrosion Recall 10V436',
    description: 'Recall 10V436 covers certain 1998-2002 Honda Passport vehicles originally sold or currently registered in specified salt-belt jurisdictions. Sustained exposure to road-deicing material can cause excessive corrosion near the forward mounting-point bracket for a left or right rear-suspension lower link. The bracket can detach from the frame and affect vehicle handling.',
    solution: 'Have a Honda dealer verify VIN and campaign eligibility and inspect the rear lower-link bracket area. The recall remedy varies with the inspection result and may include anti-corrosion treatment, installation of a reinforcement bracket or another appropriate remedy when corrosion is severe.',
    symptoms: ['Excessive corrosion near a rear lower-link forward mounting bracket', 'Rear lower-link bracket may detach from the frame', 'Vehicle handling may be affected'], affectedSystems: ['Rear suspension lower-link brackets', 'Frame mounting points'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall 10V436 - 1998-2002 Passport Rear Suspension Lower-Link Brackets', url: SOURCES.frameRust }], identityTerms: ['corrosion', 'rear suspension', 'frame'],
    summary: 'Replaced broad complaint-based rust claims with recall 10V436\'s exact 1998-2002 salt-jurisdiction scope, lower-link bracket mechanism, handling risk and inspection-based remedy; removed unsupported welding advice, commerce and costs.',
  },
  [IDS.fuelPump]: {
    years: [2019, 2020, 2021], category: 'fuel', severity: 'high', confidence: 'high', title: 'In-Tank Fuel Pump Motor Recalls 21V215 and 23V858',
    description: 'Two Honda fuel-pump campaigns apply to VIN-eligible Passport vehicles. Recall 21V215 includes certain 2019 vehicles with lower-density impellers, and Bulletin 24-028 for recall 23V858 covers certain 2019-2021 vehicles with defective impellers. An impeller can swell and interfere with the pump body, making the fuel pump inoperative and causing a stall or loss of motive power.',
    solution: 'Have a Honda dealer check the VIN for open campaigns. The prescribed recall repair replaces the affected in-tank fuel pump assembly or fuel pump motor, depending on the campaign.',
    symptoms: ['Engine may stall while driving', 'Loss of motive power', 'Engine may not start if the fuel pump becomes inoperative'], affectedSystems: ['In-tank fuel pump motor', 'Fuel pump impeller'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'Honda Recall 21V215 - Certain 2019 Passport Fuel Pump Assemblies', url: SOURCES.fuelPump2021 }, { type: 'recall', title: 'Honda Service Bulletin 24-028 - 2019-2021 Passport Fuel Pump Motor Recall 23V858', url: SOURCES.fuelPump2023 }], identityTerms: ['fuel', 'pump'],
    summary: 'Preserved the multiple-recall fuel-pump identity while replacing generic recall-search links with exact Honda/NHTSA records for 21V215 and 23V858, correcting scope to VIN-eligible 2019-2021 vehicles and removing unsupported DTCs, emergency instructions, phone claims and commerce.',
  },
  [IDS.idleStop]: {
    years: [2019, 2020, 2021, 2022], category: 'electrical', severity: 'high', confidence: 'high', title: 'Auto Idle Stop May Not Restart - Bulletins 23-008 and 23-009',
    description: 'Honda Bulletin 23-008 covers VIN-eligible 2019-2022 Passport vehicles whose engine may not automatically restart after Auto Idle Stop engages. Honda says the vehicle can typically be restarted by selecting Park and pressing the ENGINE START/STOP button. Bulletin 23-009 provides a second-stage repair for eligible 2019-2021 vehicles when the software update does not resolve the condition. NHTSA Engineering Analysis EA25004 remains open and is not a final defect determination.',
    solution: 'Have a Honda dealer verify VIN eligibility and complete the PGM-FI software update under Bulletin 23-008. If the condition persists on a vehicle eligible for Bulletin 23-009, Honda directs replacement of the starter assembly and starter relays plus a valve adjustment.',
    symptoms: ['Engine may not automatically restart after Auto Idle Stop', 'Vehicle may require selecting Park and pressing the start/stop button to restart'], affectedSystems: ['Auto Idle Stop', 'PGM-FI software', 'Starter assembly and relays'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 23-008 - 2019-2022 Passport PGM-FI Idle Stop Software Update', url: SOURCES.idleSoftware }, { type: 'tsb', title: 'Honda Service Bulletin 23-009 - 2019-2021 Passport No-Restart Warranty Extension', url: SOURCES.idleWarranty }, { type: 'investigation', title: 'NHTSA Engineering Analysis EA25004 - No Restart After Auto Start/Stop Engages', url: SOURCES.idleInvestigation }], identityTerms: ['idle', 'stop', 'restart'],
    summary: 'Replaced the uncited 2019-2023 narrative, aftermarket bypass and unsupported rollaway/DTC claims with Honda Bulletins 23-008 and 23-009\'s exact 2019-2022 scope and staged remedy; labels NHTSA EA25004 as an open investigation rather than a final defect finding.',
  },
  [IDS.infotainment]: {
    years: [2019, 2020, 2021, 2022, 2023], category: 'electrical', severity: 'high', confidence: 'high', title: 'MOST/FAKRA Connector Rearview Camera Recall 23V431',
    description: 'Honda Bulletin 23-047 for recall 23V431 covers VIN-eligible 2019-2023 Passport vehicles. A coaxial-cable terminal in the Media Oriented Systems Transport network may have been manufactured out of specification, causing poor communication that can affect audio quality and make the rearview camera work intermittently or go blank in Reverse. The current bulletin covers 2019-2020 vehicles except Sport and all 2021-2023 trims.',
    solution: 'Have a Honda dealer verify VIN eligibility. The recall repair installs FAKRA splice repair service cables and splice boxes in the MOST network.',
    symptoms: ['Rearview camera may work intermittently', 'Rearview camera may go blank in Reverse', 'Audio quality may be affected'], affectedSystems: ['MOST bus network', 'FAKRA coaxial connectors', 'Rearview camera display', 'Audio network'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'Honda Service Bulletin 23-047 - 2019-2023 Passport MOST/FAKRA Recall 23V431', url: SOURCES.infotainment }], identityTerms: ['FAKRA', 'MOST', 'infotainment'],
    summary: 'Preserved the FAKRA/MOST identity while replacing a single complaint with exact recall 23V431 scope, symptoms and cable remedy; removed unsupported corrosion, head-unit replacement, connectivity, pricing and DIY claims.',
  },
  [IDS.airbag]: {
    years: [2001], category: 'safety', severity: 'critical', confidence: 'high', title: 'Passenger Airbag Inflator Rupture Recall 01V055',
    description: 'Recall 01V055 covers certain 2001 Honda Passport vehicles whose passenger-side airbag inflator contained the wrong amount of generant. In a crash that triggers passenger-airbag deployment, too much generant can make the inflator module explode and send metal or plastic debris toward occupants.',
    solution: 'Confirm campaign completion for the VIN. The recall remedy replaces the passenger-side airbag unit.',
    symptoms: ['Open recall 01V055 for the VIN', 'Passenger airbag inflator may explode during a deployment event'], affectedSystems: ['Passenger frontal airbag inflator'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall 01V055 - 2001 Passport Passenger Airbag Inflator Generant', url: SOURCES.airbagRupture }], identityTerms: ['airbag', 'inflator', 'rupture'],
    summary: 'Retained the indexed airbag-inflator rupture identity but corrected the false Takata and 2000-2002 claims to exact recall 01V055 for certain 2001 Passport passenger airbags; removed driver-airbag, SRS-light and unrelated diagnostic claims.',
  },
};

const KEEP_REASONS = {
  [IDS.abs]: 'Complaint and aggregator pages do not establish one ABS hydraulic-unit or wheel-speed-sensor defect, exact 2000-2002 scope, DTC list, corrosion mechanism or repair cost. The row remains unchanged.',
  [IDS.acCompressor]: 'A generic vehicle page plus inaccessible or fabricated-looking forum/video paths do not establish premature compressor failure, the stated mileage band, refrigerant-oil specification or brand recommendations. The row remains unchanged.',
  [IDS.automaticTransmission]: 'Complaint aggregations do not establish one torque-converter, second-gear and hard-part failure mechanism or the proposed rebuild/maintenance path across 2000-2002 vehicles. No exact primary source was found, so the row remains unchanged.',
  [IDS.batteryDrain]: 'The row merges infotainment, door-lock, sensing, battery-age and idle-stop theories without an exact Honda source that establishes one parasitic-draw defect or the stated electrical thresholds. It remains unchanged.',
  [IDS.brakeBooster]: 'Recall 23V458 concerns a brake-booster/master-cylinder tie-rod fastener on certain 2021-2023 Passports, not the indexed electric vacuum-pump failure. An unrelated recall cannot replace this identity, so the row remains unchanged.',
  [IDS.exhaustStud]: 'A generic complaint page does not establish exhaust-manifold stud breakage, an exact 2000-2002 population, the claimed 3.2L mechanism or repair procedure. The row remains unchanged.',
  [IDS.ignitionSwitch]: 'The generic recall-search citation does not identify a Passport ignition-switch campaign, and the official 2000-2002 Passport recall set contains no matching campaign. A complaint page cannot establish this aggregation, so the row remains unchanged.',
  [IDS.paint]: 'One complaint and a forum thread do not establish a manufacturing paint defect, exact hood/roof mechanism or complete 2019-2022 population. The row remains unchanged.',
  [IDS.powerWindow]: 'An aggregator landing page does not establish one regulator-and-lock-actuator defect, year scope, failure mechanism or repair path. The row remains unchanged.',
  [IDS.rearDifferential]: 'This card merges first-generation and current-generation drivetrains and has no citations. No single Honda source establishes a common dual-pump-fluid mechanism across 2000-2002 and 2019-2022 Passports, so it remains unchanged.',
  [IDS.suspensionNoise]: 'A generic vehicle page and an unverified forum path do not establish one strut, sway-bar-link or bushing defect across 2019-2023 vehicles. The row remains unchanged.',
  [IDS.timingBelt]: 'A manufacturer home page does not establish the indexed neglect/failure claim, service interval, interference-damage outcome or bundled repair scope for 2000-2002 Passports. The row remains unchanged.',
  [IDS.valveCover]: 'A generic complaint page does not establish one valve-cover/tube-seal defect, misfire codes, mileage range or repair procedure. The row remains unchanged.',
  [IDS.vibration]: 'The page combines tire balance, driveline, torque-converter and suspension causes, while two citations appear fabricated and the generic NHTSA page cannot establish the stated frequency or fixes. It remains unchanged.',
  [IDS.wheelBearing]: 'A generic NHTSA page and an unverified video do not establish premature bearing failure, the stated mileage band, DTCs, catastrophic outcomes or replacement advice. The row remains unchanged.',
};

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function rewriteProposal(current, card) {
  return fullRecord({ ...current, ...card, make: 'Honda', model: 'Passport', trims: [], engines: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: card.summary, relatedIssueIds: [] });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Passport');
  if (modelRows.length !== 21) throw new Error(`expected 21 Honda Passport rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const proposal = card ? rewriteProposal(before, card) : before;
    return { id: current.id, model: current.model, action, reason: card ? card.summary : KEEP_REASONS[current.id], identityRule: card ? 'The indexed issue identity stays on the same ID; only exact Honda/NHTSA scope, mechanism, symptoms and remedy replace unsupported claims.' : 'No content or publication-state changes; partial, generic, secondary or overlapping evidence cannot replace this indexed issue.', commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit', changedFields: diffFields(before, proposal), evidence: card ? card.citations.map((item) => ({ kind: item.type === 'investigation' ? 'open-investigation' : 'manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, mechanism and remedy.` })) : [], beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const actions = ['rewrite_same_identity', 'keep_published_pending_source'];
  const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length]));
  summary.total = rows.length;
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Honda', model: 'Passport',
    completionStatement: 'This packet reconciles all 21 frozen Honda Passport rows. Six same-identity Honda/NHTSA corrections are proposed; fifteen rows remain byte-for-byte unchanged pending exact evidence or independent disposition.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.', 'All 21 rows remain published. Fifteen are byte-for-byte unchanged.', 'An unrelated campaign, bulletin, component, generation or model may never replace the issue named by an existing indexed page.', 'Each rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.', 'Open investigations are identified as allegations under review, not final defect findings.', 'Independent row-by-row approval is required before a separate guarded apply path may be created.'],
    source: { snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, passportRecordCount: modelRows.length },
    observations: [
      { code: 'pilot-only-transmission-bulletin-corrected', severity: 'independent-review-required', recordIds: [IDS.nineSpeed], detail: 'The frozen 17-014 citation is a 2016-2017 Pilot 6-speed torque-converter bulletin, not a Passport 9-speed bulletin. Honda Bulletin 20-029 is the exact 2019 Passport source.' },
      { code: 'false-takata-label-corrected', severity: 'independent-review-required', recordIds: [IDS.airbag], detail: 'The official 2001 Passport recall set does not identify a Takata campaign. Recall 01V055 is the exact passenger-inflator rupture campaign; separate 02V213 concerns a missing check-valve pin and insufficient inflation, not rupture.' },
      { code: 'brake-booster-recall-not-substituted', severity: 'independent-review-required', recordIds: [IDS.brakeBooster], detail: 'Recall 23V458 covers a tie-rod fastener between the booster and master cylinder, not the frozen electric vacuum-pump identity. The row stays byte-for-byte unchanged.' },
      { code: 'open-idle-stop-investigation-labeled', severity: 'independent-review-required', recordIds: [IDS.idleStop], detail: 'NHTSA EA25004 remains open. The proposal states that status explicitly and relies on Honda Bulletins 23-008 and 23-009 for the staged service path.' },
      { code: 'modern-rear-subframe-recall-not-merged', severity: 'independent-review-required', recordIds: [IDS.frameRust], detail: 'Recall 26V365 covers a distinct 2019-2023 Passport rear-subframe corrosion population. It is not merged into the indexed first-generation 10V436 page and should be considered as a separate new-issue candidate.' },
      { code: 'broad-multi-mechanism-pages-frozen', severity: 'independent-review-required', recordIds: [IDS.automaticTransmission, IDS.batteryDrain, IDS.rearDifferential, IDS.vibration], detail: 'These rows combine several possible systems or generations without one exact primary source. None is rewritten, archived or redirected.' },
    ],
    mismatchSources: MISMATCH_SOURCES,
    summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { FULL_RECORD_FIELDS, IDS, KEEP_REASONS, MISMATCH_SOURCES, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteProposal };
