/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-elantra-adjudication-2026-08-06.json');

const IDS = {
  dct: 'hyundai-elantra-dct-transmission-failure',
  abs251: 'hyundai-elantra-abs-module-fire',
  abs188: 'hyundai-elantra-abs-module-short-circuit-causing-engine-compartment-fire',
  airbag: 'hyundai-elantra-airbag-sensor-malfunction',
  speedSensor: 'hyundai-elantra-automatic-transmission-inputoutput-speed-2001',
  brakeSwitch: 'hyundai-elantra-brake-light-switch-failure-2001',
  crankSensor: 'hyundai-elantra-crankshaft-position-sensor',
  eps: 'hyundai-elantra-electronic-power-steering',
  purge: 'hyundai-elantra-evaporative-emissions-purge-valve-2001',
  coilSpring: 'hyundai-elantra-front-coil-spring-fracture-2001',
  controlArm: 'hyundai-elantra-front-lower-control-arm-2001',
  pretensioner: 'hyundai-elantra-front-seat-belt-pretensioner-may-explode-project-metal-fragm',
  wheelBearing: 'hyundai-elantra-front-wheel-bearing-premature-2001',
  fuelPump: 'hyundai-elantra-fuel-pump-module-and-2001',
  ivt: 'hyundai-elantra-ivt-cvt-failure',
  mdps: 'hyundai-elantra-mdps-rubber-coupler-wear-steering-clunk-knock-loss-assist',
  nuEngine: 'hyundai-elantra-nu-engine-failure',
  p0011: 'hyundai-elantra-p0011-intake-camshaft-timing-over-advanced-from-stuck-cvvt-o',
  p0016: 'hyundai-elantra-p0016-crank-cam-correlation-from-clogged-ocv-stretched-timin',
  p0128: 'hyundai-elantra-p0128-coolant-below-thermostat-regulating-temp-from-stuck-op',
  p0171: 'hyundai-elantra-p0171-system-too-lean-from-vacuum-leak-dirty-maf',
  p0420: 'hyundai-elantra-p0420-catalyst-efficiency-below-threshold-often-downstream-n',
  sunroof: 'hyundai-elantra-panoramic-sunroof-shatter',
  aeb: 'hyundai-elantra-phantom-false-automatic-emergency-braking-forward-collision',
  radiator: 'hyundai-elantra-radiator-end-tank-cracking-2001',
  theft: 'hyundai-elantra-theft-vulnerability-missing-engine-immobilizer',
  timingBelt: 'hyundai-elantra-timing-belt-neglect-leading-2000',
  valveCover: 'hyundai-elantra-valve-cover-gasket-oil-2001',
  paint: 'hyundai-elantra-white-pearl-paint-peeling-clear-coat-delamination',
};

const SOURCES = {
  dct: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10201468-0001.pdf',
  abs251: 'https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V651-3906.pdf',
  abs251Owner: 'https://static.nhtsa.gov/odi/rcl/2023/RCONL-23V651-4697.pdf',
  abs188: 'https://static.nhtsa.gov/odi/rcl/2020/RCAK-20V061-3624.pdf',
  airbag: 'https://static.nhtsa.gov/odi/rcl/2011/RCAK-11V143-5740.pdf',
  eps: 'https://static.nhtsa.gov/odi/rcl/2015/RCAK-15V100-7257.pdf',
  controlArm: 'https://static.nhtsa.gov/odi/rcl/2009/RCAK-09V125-3275.pdf',
  pretensioner: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V354-9759.PDF',
  mdps: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10110922-9999.pdf',
  nuEngine: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10186830-0001.pdf',
  p0128: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10138234-9999.pdf',
  theft: 'https://www.hyundaiantitheft.com/',
  theftGuide: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11000788-0001.pdf',
  paint: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11032529-0001.pdf',
};

function citation(type, title, url) { return { type, title, url }; }

const REWRITE_CARDS = {
  [IDS.dct]: {
    years: [2017, 2018], category: 'transmission', severity: 'medium', confidence: 'high',
    title: '7-Speed DCT Low-Speed Vibration and Double-Clutch Service',
    description: 'Hyundai TSB 21-AT-013H covers certain 2017-2018 Elantra Sport 1.6L Turbo and Elantra 1.4L Turbo vehicles equipped with the 7-speed dual-clutch transmission. The bulletin states that these vehicles may exhibit abnormal vibration at low speeds and provides a GDS clutch-judder inspection procedure.',
    solution: 'Have a Hyundai dealer identify the vehicle and transmission by VIN and perform the bulletin\'s GDS clutch-judder measurement. If the test reports no judder, the procedure ends. If it reports that the double clutch should be replaced, the bulletin directs replacement of the double-clutch assembly and a TCU software update when applicable.',
    symptoms: ['Abnormal vibration at low speeds', 'GDS clutch-judder test reports that the double clutch should be replaced'], affectedSystems: ['7-speed dual-clutch transmission', 'Double-clutch assembly', 'Transmission control unit'], dtcCodes: [],
    citations: [citation('tsb', 'Hyundai TSB 21-AT-013H - Dual Clutch Replacement and TCU Software Update', SOURCES.dct)],
    summary: 'Narrowed the broad DCT-failure narrative to Hyundai\'s exact 2017-2018 Elantra 1.4T/1.6T low-speed-vibration bulletin, diagnostic gate and conditional clutch/TCU remedy.',
  },
  [IDS.abs251]: {
    years: [2011, 2012, 2013, 2014, 2015], category: 'brakes', severity: 'high', confidence: 'high',
    title: 'ABS Module Internal Brake-Fluid Leak and Fire Risk - Recall 23V651',
    description: 'NHTSA recall 23V651 covers certain 2011-2015 Hyundai Elantra vehicles. The ABS module may leak brake fluid internally and develop an electrical short, creating an engine-compartment fire risk while the vehicle is parked or being driven.',
    solution: 'Check the VIN for Hyundai Recall 251 and arrange the free dealer remedy. Hyundai instructs owners to park outside and away from structures until the recall is completed. Dealers replace the ABS fuse with a lower-amperage fuse.',
    symptoms: ['ABS or malfunction-indicator warning light may illuminate', 'Engine-compartment fire can occur while parked or driving'], affectedSystems: ['Anti-lock brake system module', 'ABS electrical circuit', 'ABS fuse'], dtcCodes: [],
    citations: [citation('recall', 'NHTSA Recall 23V651 - ABS Unit May Cause Engine Compartment Fire', SOURCES.abs251), citation('manufacturer', 'Hyundai Recall 251 Owner Notice - ABS Fuse Remedy', SOURCES.abs251Owner)],
    summary: 'Replaced secondary reporting with NHTSA and Hyundai recall records for the exact 2011-2015 Elantra population, internal brake-fluid leak, fire risk, parking instruction and fuse remedy.',
  },
  [IDS.abs188]: {
    years: [2006, 2007, 2008, 2009, 2010, 2011], category: 'brakes', severity: 'high', confidence: 'high',
    title: 'Key-Off ABS Module Short-Circuit Fire Risk - Recall 20V061',
    description: 'NHTSA recall 20V061 covers certain 2006-2011 Hyundai Elantra and 2007-2011 Elantra Touring vehicles. Their ABS module remains energized after the vehicle is turned off; if moisture enters its electrical circuit, a short can gradually develop and cause an engine-compartment fire even with the car off.',
    solution: 'Check the VIN for Hyundai Recall 188. Hyundai dealers install a relay in the main junction box, free of charge, to prevent an ABS short circuit while the vehicle is turned off.',
    symptoms: ['An ABS-module short circuit may occur without advance warning', 'Engine-compartment fire can occur while the vehicle is turned off'], affectedSystems: ['Anti-lock brake system module', 'Main junction box relay'], dtcCodes: [],
    citations: [citation('recall', 'NHTSA Recall 20V061 - ABS Module May Short Circuit', SOURCES.abs188)],
    summary: 'Bound the page to NHTSA recall 20V061\'s exact Elantra/Elantra Touring years, key-off moisture short, fire consequence and relay remedy.',
  },
  [IDS.airbag]: {
    years: [2007, 2008, 2009], category: 'safety', severity: 'high', confidence: 'high',
    title: 'Passenger Weight-Sensor Connector Contamination - Recall 11V143',
    description: 'NHTSA recall 11V143 covers certain 2007-2009 Hyundai Elantra vehicles. Contamination can cause the electrical connector for the front-passenger weight-classification sensor to malfunction, allowing the passenger airbag to deploy regardless of occupant weight.',
    solution: 'Check the VIN for Hyundai Campaign 099. Dealers install a protective cover over the weight-classification-system connector to prevent contamination, free of charge.',
    symptoms: ['The passenger-airbag classification system may not respond correctly to occupant weight', 'The passenger airbag may deploy in a crash when it should remain suppressed'], affectedSystems: ['Passenger weight-classification sensor', 'Front passenger airbag'], dtcCodes: [],
    citations: [citation('recall', 'NHTSA Recall 11V143 - Passenger Weight-Sensor Connector', SOURCES.airbag)],
    summary: 'Removed a blended multi-recall airbag narrative and retained only NHTSA recall 11V143\'s exact 2007-2009 passenger-weight-sensor connector condition and protective-cover remedy.',
  },
  [IDS.eps]: {
    years: [2008, 2009, 2010], category: 'steering', severity: 'high', confidence: 'high',
    title: 'Electronic Power-Steering Assist May Be Disabled - Recall 15V100',
    description: 'NHTSA recall 15V100 covers certain 2008-2010 Hyundai Elantra and 2009-2010 Elantra Touring vehicles. The EPS control unit may sense a discrepancy in steering-input signals and disable power assist. Manual steering remains, but greater effort is required at low speeds.',
    solution: 'Check the VIN for Hyundai Recall 127. Dealers verify EPS operation and update the EPS control unit, free of charge.',
    symptoms: ['Power-steering assist may be disabled', 'Greater steering effort is required at low speeds'], affectedSystems: ['Electronic power steering', 'EPS control unit'], dtcCodes: [],
    citations: [citation('recall', 'NHTSA Recall 15V100 - Electric Power Steering Assist May Be Disabled', SOURCES.eps)],
    summary: 'Separated the safety recall from the unrelated rubber-coupler issue and narrowed the page to recall 15V100\'s exact years, signal-discrepancy mechanism and ECU-update remedy.',
  },
  [IDS.controlArm]: {
    years: [2001, 2002, 2003], category: 'suspension', severity: 'high', confidence: 'high',
    title: 'Salt-Belt Front Lower-Control-Arm Corrosion - Recall 09V125',
    description: 'NHTSA recall 09V125 covers certain 2001-2003 Hyundai Elantra vehicles originally sold in or currently registered in listed salt-belt states and the District of Columbia. Road salt can cause internal corrosion and perforation of a front lower control arm, which may fracture and reduce control of the front wheel direction.',
    solution: 'Check the VIN for Hyundai Recall 091. Dealers inspect both front lower control arms. Arms with specified corrosion damage are replaced; otherwise dealers add drainage holes and apply rust-proofing material. The recall work is free.',
    symptoms: ['Internal corrosion or perforation of a front lower control arm', 'A corroded lower control arm may fracture', 'Front-wheel directional control may be reduced'], affectedSystems: ['Front lower control arms', 'Front suspension'], dtcCodes: [],
    citations: [citation('recall', 'NHTSA Recall 09V125 - Front Lower Control Arm Corrosion', SOURCES.controlArm)],
    summary: 'Corrected the page to recall 09V125 only, including the exact 2001-2003 salt-belt scope and inspection, replacement or drainage/rust-proofing remedies.',
  },
  [IDS.pretensioner]: {
    years: [2021, 2022, 2023], category: 'safety', severity: 'high', confidence: 'high',
    title: 'Seat-Belt Pretensioner May Project Metal Fragments - Recall 22V354',
    description: 'NHTSA recall 22V354 includes certain 2021-2023 Hyundai Elantra vehicles and certain 2021-2022 Elantra HEV vehicles. A driver- or passenger-side pyrotechnic pretensioner may deploy abnormally in a crash because its pipe can over-pressurize, allowing metal fragments to enter the occupant compartment and injure occupants.',
    solution: 'Check the VIN for the applicable Hyundai seat-belt recall and arrange the free dealer repair. Hyundai\'s remedy secures the pretensioner\'s micro gas generator and delivery pipe with a cap; vehicles repaired under superseded campaigns may require the newer remedy.',
    symptoms: ['The condition may have no warning before a crash', 'An abnormal pretensioner deployment can send metal fragments into the cabin'], affectedSystems: ['Front seat-belt pretensioners', 'Micro gas generator and pretensioner pipe'], dtcCodes: [],
    citations: [citation('recall', 'NHTSA Recall 22V354 - Seat-Belt Pretensioner Abnormal Deployment', SOURCES.pretensioner)],
    summary: 'Replaced secondary articles with NHTSA\'s defect report and retained the exact Elantra/Elantra HEV scope, over-pressure mechanism, injury risk and cap remedy.',
  },
  [IDS.mdps]: {
    years: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015], category: 'steering', severity: 'low', confidence: 'high',
    title: 'MDPS Flexible-Coupling Wear and Steering Click or Thud - TSB 17-ST-002',
    description: 'Hyundai TSB 17-ST-002 covers 2007-2010 Elantra, 2009-2012 Elantra Touring and specified-production 2011-2015 Elantra vehicles. The flexible rubber coupling in the motor-driven power-steering assembly may wear and produce a slight clicking or thud noise while the steering wheel is turned. Hyundai states that this wear does not affect steering control and is not a safety issue.',
    solution: 'Have a Hyundai dealer confirm vehicle eligibility and diagnose the noise. The bulletin extends coupling coverage to 10 years or 100,000 miles, whichever occurs first, and describes replacement of the MDPS flexible coupling when required.',
    symptoms: ['Slight clicking noise while turning the steering wheel', 'Slight thud while turning the steering wheel'], affectedSystems: ['Motor-driven power steering', 'MDPS flexible coupling'], dtcCodes: [],
    citations: [citation('tsb', 'Hyundai TSB 17-ST-002 - MDPS Coupling Warranty Extension', SOURCES.mdps)],
    summary: 'Removed unsupported loss-of-assist, fault-code, calibration and cost claims; retained only Hyundai\'s exact coupling-noise condition, model scope, non-safety statement and warranty remedy.',
  },
  [IDS.nuEngine]: {
    years: [2011, 2012, 2013, 2014, 2015, 2016], category: 'engine', severity: 'medium', confidence: 'high',
    title: '1.8L Nu Piston-Slap Short-Block Warranty Extension',
    description: 'Hyundai TSB 21-EM-002H covers certain 2011-2016 Elantra vehicles equipped with the 1.8L Nu engine. It extends short-block warranty coverage for damage related to piston-slap noise in the upper engine, ordinarily most noticeable in cold weather. The covered short block includes the engine block, crankshaft, connecting rods and pistons.',
    solution: 'Ask a Hyundai dealer to confirm eligibility under warranty extension TXXK and diagnose the engine noise using the related Hyundai service procedure. Coverage terms depend on ownership and cold-weather-state eligibility; owners outside those states may qualify under specified conditions.',
    symptoms: ['Piston-slap noise from the upper engine', 'Noise is ordinarily most noticeable in cold weather'], affectedSystems: ['1.8L Nu engine short block', 'Pistons', 'Crankshaft and connecting rods'], dtcCodes: [],
    citations: [citation('tsb', 'Hyundai TSB 21-EM-002H - 1.8L Nu Engine Warranty Extension', SOURCES.nuEngine)],
    summary: 'Removed unsupported bearing, debris, KSDS, oil-change and blanket seizure claims; retained Hyundai\'s exact 1.8L Nu piston-slap short-block warranty scope.',
  },
  [IDS.p0128]: {
    years: [2017], category: 'cooling', severity: 'low', confidence: 'high',
    title: 'P0128 from Thermostat Malfunction - Service Campaign TLL',
    description: 'Hyundai TSB 18-01-012 covers certain 2017 Elantra AD/ADa vehicles with the 2.0L Nu MPI engine. The thermostat may not function properly and may set DTC P0128. Hyundai states that no drivability issues are associated with this campaign condition.',
    solution: 'Have a Hyundai dealer check the VIN for Service Campaign TLL. The bulletin requires thermostat replacement even when P0128 is not present, followed by the specified coolant refill and air-bleeding procedure.',
    symptoms: ['DTC P0128 may be stored', 'The campaign condition may be present without DTC P0128'], affectedSystems: ['Engine thermostat', 'Engine cooling system'], dtcCodes: ['P0128'],
    citations: [citation('tsb', 'Hyundai TSB 18-01-012 - Engine Thermostat Replacement P0128', SOURCES.p0128)],
    summary: 'Narrowed the generic ten-year DTC narrative to Hyundai\'s exact 2017 2.0L Nu MPI campaign, no-drivability statement and required thermostat remedy.',
  },
  [IDS.theft]: {
    years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022], category: 'security', severity: 'high', confidence: 'high',
    title: 'Turn-Key Vehicles Without an Engine Immobilizer - Anti-Theft Campaign 993',
    description: 'Hyundai identifies certain 2011-2022 Elantra vehicles with traditional turn-key ignitions and without engine immobilizers as affected by theft methods that bypass the vehicles\' security features. Vehicles with push-button start or an immobilizer indicator are not in this software-upgrade population, and eligibility must be confirmed by VIN.',
    solution: 'Use Hyundai\'s official VIN lookup or contact a dealer. Eligible vehicles receive Campaign 993\'s free body-control-module anti-theft software and window decals. The key fob must be used as directed to arm the ignition-kill feature. Hyundai provides other remedies, including steering-wheel locks, for certain vehicles that cannot receive the software.',
    symptoms: ['Vehicle has a traditional turn-key ignition', 'Vehicle has no push-button start or immobilizer indicator', 'VIN is eligible for a Hyundai anti-theft campaign'], affectedSystems: ['Factory burglar-alarm system', 'Body control module', 'Ignition-start logic'], dtcCodes: [],
    citations: [citation('manufacturer', 'Hyundai Anti-Theft Software Upgrade - Affected Vehicles', SOURCES.theft), citation('tsb', 'Hyundai Campaign 993 Dealer Best Practices', SOURCES.theftGuide)],
    summary: 'Replaced viral, insurance, method and aftermarket-cost claims with Hyundai\'s exact 2011-2022 Elantra applicability conditions, VIN gate, software behavior and alternative remedies.',
  },
  [IDS.paint]: {
    years: [2015, 2016, 2017, 2018], category: 'exterior', severity: 'low', confidence: 'high',
    title: 'Quartz White Pearl Paint Peeling or Bubbling - Warranty Extension Z05',
    description: 'Hyundai TSB 26-BD-002H covers certain 2015-2016 Elantra UD and 2017-2018 HMMA-built Elantra ADa vehicles finished in Quartz White Pearl paint code W8 or WW8. White paint may peel or bubble on metal body panels including the hood, fenders, roof, doors, quarter panels and trunk. Plastic body panels are not covered.',
    solution: 'Have a Hyundai dealer verify the VIN, paint code, title history and condition under warranty extension Z05. Coverage is extended to 10 years with unlimited miles for eligible original and subsequent owners. The bulletin directs documented paint repair of covered metal panels and excludes repainting plastic panels for matching or blending.',
    symptoms: ['Quartz White Pearl paint peels on a metal body panel', 'Quartz White Pearl paint bubbles on a metal body panel'], affectedSystems: ['Exterior paint on covered metal body panels'], dtcCodes: [],
    citations: [citation('tsb', 'Hyundai TSB 26-BD-002H - White Paint Warranty Extension', SOURCES.paint)],
    summary: 'Removed unsupported colors, clear-coat mechanism, mileage, class-action and cost claims; retained Hyundai\'s exact model years, W8/WW8 paint, factory scope, covered panels and warranty terms.',
  },
};

const KEEP_REASONS = {
  [IDS.speedSensor]: 'The frozen 2001-2006 sensor narrative has no citation and combines input/output sensor failure, limp mode, DTCs and replacement guidance without one exact Hyundai primary source. It remains byte-for-byte unchanged.',
  [IDS.brakeSwitch]: 'Recall 13V113 covers 2007-2010 Elantra and 2009-2011 Elantra Touring, not the 2001-2006 identity encoded in this URL and row. Replacing this indexed page with the later recall would create slug/content drift, so it remains unchanged.',
  [IDS.crankSensor]: 'No exact Hyundai campaign or bulletin was found for the frozen 2011-2017 crank-sensor failure population, heat mechanism, stalling pattern and remedy. The row remains byte-for-byte unchanged.',
  [IDS.purge]: 'The frozen 2001-2006 page combines purge-valve and fuel-tank-pressure-sensor conditions without an exact Hyundai primary source establishing one defect and remedy. It remains unchanged.',
  [IDS.coilSpring]: 'Hyundai Campaign 133 concerns certain 2011 Elantra vehicles, while this indexed URL and frozen row encode 2001-2006. Rewriting it with the later campaign would change the page identity, so it remains byte-for-byte unchanged.',
  [IDS.wheelBearing]: 'Owner reports do not establish one 2001-2006 Elantra front-bearing defect, failure interval or remedy, and no exact Hyundai primary document was found. The row remains unchanged.',
  [IDS.fuelPump]: 'The row combines fuel-pump and sender failures across 2001-2006 without one exact Hyundai primary source. It remains byte-for-byte unchanged.',
  [IDS.ivt]: 'No exact Hyundai primary document was found that supports the frozen 2019-2023 IVT failure, overheating, power-loss, replacement and cost narrative as one issue. The row remains unchanged.',
  [IDS.p0011]: 'The generic multi-year P0011 diagnosis is not tied to one exact Hyundai Elantra campaign or bulletin and cannot be rewritten from generic DTC guidance. The row remains unchanged.',
  [IDS.p0016]: 'The generic multi-year P0016 page combines clogged OCV and stretched-chain causes without one exact Hyundai primary source for this scope. The row remains unchanged.',
  [IDS.p0171]: 'The generic P0171 page combines multiple possible causes and repairs without an exact Hyundai campaign or bulletin for the frozen Elantra scope. It remains unchanged.',
  [IDS.p0420]: 'The frozen P0420 page links catalyst efficiency to broad Nu-engine oil-consumption claims without one exact Hyundai primary document supporting the complete identity. It remains unchanged.',
  [IDS.sunroof]: 'Hyundai TSB 19-BD-007H confirms a 2013-2016 Elantra GT panoramic moving-glass warranty extension but does not establish the frozen spontaneous-shattering mechanism, 2011-2018 Elantra population or symptom claims. The row remains unchanged.',
  [IDS.aeb]: 'Complaints and legal summaries do not establish one 2021-2024 Elantra false-AEB defect and remedy, and no exact Hyundai campaign or bulletin was found for the frozen identity. The row remains unchanged.',
  [IDS.radiator]: 'No exact Hyundai primary document was found for the frozen 2001-2006 radiator end-tank failure population, aging mechanism and repair guidance. The row remains unchanged.',
  [IDS.timingBelt]: 'This maintenance-risk narrative is not one Hyundai defect campaign and the frozen service interval and bent-valve claims were not established by an exact Hyundai primary document. It remains unchanged.',
  [IDS.valveCover]: 'No exact Hyundai primary document was found for the frozen 2001-2006 valve-cover-gasket leak population, leak path and remedy. The row remains unchanged.',
};

function rewriteProposal(current, card) {
  return fullRecord({
    ...current, ...card, make: 'Hyundai', model: 'Elantra', trims: [], engines: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0,
    source: 'manual', status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06',
    contentUpdatedOn: '2026-08-06', contentUpdateSummary: card.summary, relatedIssueIds: [],
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Elantra');
  if (modelRows.length !== 29) throw new Error(`expected 29 Hyundai Elantra rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) throw new Error(`missing Elantra decision: ${current.id}`);
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id, model: current.model,
      action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card ? 'The existing indexed issue stays on the same ID; an exact official same-identity scope and remedy replace unsupported claims.' : 'No content or publication-state changes; nearby campaigns, complaints and shared symptoms cannot replace this indexed identity.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card ? card.citations.map((item) => ({ kind: item.type === 'recall' ? 'official-recall-record' : 'official-manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope or remedy.` })) : [],
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const summary = {
    rewrite_same_identity: rows.filter((row) => row.action === 'rewrite_same_identity').length,
    keep_published_pending_source: rows.filter((row) => row.action === 'keep_published_pending_source').length,
    total: rows.length,
  };
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Hyundai', model: 'Elantra',
    completionStatement: 'This packet reconciles all 29 frozen Hyundai Elantra rows. Twelve exact same-identity official-source rewrites are proposed; seventeen rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All 29 rows remain published. Seventeen are byte-for-byte unchanged.',
      'An unrelated campaign, component, symptom group, generation or model may never replace the issue named by an existing indexed page.',
      'Each rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: { snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, elantraRecordCount: modelRows.length },
    observations: [
      { code: 'two-distinct-abs-identities-preserved', severity: 'independent-review-required', recordIds: [IDS.abs251, IDS.abs188], detail: 'Recall 251 and Recall 188 stay separate because their defect mechanisms, populations and remedies differ.' },
      { code: 'eps-recall-separated-from-mdps-coupler', severity: 'independent-review-required', recordIds: [IDS.eps, IDS.mdps], detail: 'The EPS signal-discrepancy recall and the non-safety flexible-coupler noise bulletin remain distinct same-identity pages.' },
      { code: 'misleading-year-slugs-frozen', severity: 'independent-review-required', recordIds: [IDS.brakeSwitch, IDS.coilSpring], detail: 'Later official campaigns were not written into URLs that encode 2001 because that would create content/slug identity drift.' },
      { code: 'broad-diagnostics-frozen', severity: 'independent-review-required', recordIds: [IDS.p0011, IDS.p0016, IDS.p0171, IDS.p0420], detail: 'Generic diagnostic-code narratives remain unchanged without one exact Hyundai source for their complete scope.' },
    ],
    summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { IDS, KEEP_REASONS, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteProposal };
