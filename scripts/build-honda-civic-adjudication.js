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
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-civic-adjudication-2026-08-06.json');

const IDS = {
  pistonPin: 'honda-civic-2-0l-engine-failure-from-missing-improper-piston-pin-snap-ri',
  brakeMaster: 'honda-civic-brake-master-cylinder-separation-loose-missing-booster-tie-r',
  lowPressureFuelPump: 'honda-civic-denso-low-density-impeller-fuel-pump-failure-engine-stall',
  driverSeat: 'honda-civic-driver-s-seat-cushion-frame-improperly-tightened-unsecured-s',
  parkingBrake: 'honda-civic-electric-parking-brake-fails-to-apply-recall-16v-725',
  stickySteeringLong: 'honda-civic-electric-power-steering-sticky-steering-internal-worm-gear-f',
  highPressureFuelPump: 'honda-civic-high-pressure-fuel-pump-may-crack-leak-fuel-fire-risk',
  stickySteeringShort: 'honda-civic-sticky-increased-effort-steering-from-defective-steering-gea',
  combinedAcLeak: 'honda-civic-c-condenser-compressor-refrigerant-leak',
  condenserLeak: 'honda-civic-c-condenser-refrigerant-leak-pinhole-corrosion-causing-warm',
  compressorLeak: 'honda-civic-ac-compressor-2016',
  frontDamper: 'honda-civic-front-suspension-damper-noise-while-turning-creak-knock-from',
  oilDilution: 'honda-civic-oil-dilution-2016',
  paint: 'honda-civic-9th-gen-paint-clearcoat-2012',
};

const SOURCES = {
  pistonPin: 'https://static.nhtsa.gov/odi/rcl/2016/RCRN-16V074-0915.pdf',
  brakeMaster: 'https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V458-8185.pdf',
  lowPressureFuelPump: 'https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V858-9680.pdf',
  lowPressureFuelPumpNotice: 'https://static.nhtsa.gov/odi/rcl/2023/RIONL-23V858-6970.pdf',
  driverSeatReport: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V859-7804.PDF',
  driverSeatBulletin: 'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V859-9544.pdf',
  parkingBrake: 'https://static.nhtsa.gov/odi/rcl/2016/RCAK-16V725-3551.pdf',
  parkingBrakeNotice: 'https://static.nhtsa.gov/odi/rcl/2016/RCRN-16V725-0835.pdf',
  stickySteering: 'https://static.nhtsa.gov/odi/rcl/2024/RCAK-24V744-1977.pdf',
  highPressureFuelPump: 'https://static.nhtsa.gov/odi/rcl/2024/RCAK-24V763-7158.pdf',
  highPressureFuelPumpBulletin: 'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V763-3099.pdf',
  condenser: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10199342-0001.pdf',
  compressor: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10249628-0001.pdf',
  frontDamper: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11015016-0001.pdf',
  oilDilution: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10152439-0001.pdf',
  oilDilutionRepairUpdate: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10152769-0001.pdf',
  paint: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10124263-9999.pdf',
};

function citation(type, title, url) {
  return { type, title, url };
}

const steeringCard = {
  years: [2022, 2023, 2024, 2025],
  category: 'steering',
  title: 'Sticky or Increased-Effort Steering - Recall 24V-744',
  description: 'Certain 2022-2025 Civic and Civic Hatchback vehicles are included in NHTSA recall 24V-744. An incorrectly manufactured steering gearbox assembly can develop excessive internal friction and make the vehicle more difficult to steer, increasing crash risk. Civic Type R is covered for model years 2023-2025, while 2025 Civic and Civic Hatchback Hybrid variants are also listed.',
  solution: 'Check the VIN for recall 24V-744. Honda dealers replace the worm-gear spring and redistribute or add grease as necessary, free of charge. Have increased, sticky, or inconsistent steering effort inspected promptly.',
  severity: 'high',
  confidence: 'high',
  symptoms: ['Sticky or notchy steering feel', 'Increased steering effort', 'Difficulty making small steering corrections'],
  affectedSystems: ['steering gearbox assembly', 'electric power steering'],
  dtcCodes: [],
  citations: [citation('recall', 'NHTSA Recall Acknowledgment 24V-744 - Difficulty Steering From Steering Gearbox Damage', SOURCES.stickySteering)],
  identityTerms: ['steering'],
  summary: 'Replaced secondary reporting with the exact NHTSA recall, retained the same steering-defect identity, and removed unsupported complaint counts, litigation, trim and engine claims.',
};

const REWRITE_CARDS = {
  [IDS.pistonPin]: {
    years: [2016],
    category: 'engine',
    title: '2.0L Piston-Pin Snap-Ring Defect - Recall 16V-074',
    description: 'Certain 2016 Civic vehicles equipped with a 2.0L engine have piston-pin snap rings that may be missing or improperly installed. Engine vibration can unseat the piston pin, causing engine seizure, unexpected deceleration and loss of motive power. Resulting engine-block damage can also allow an oil leak and increase fire risk near an ignition source.',
    solution: 'Check the VIN for recall 16V-074. Honda dealers inspect the engine and, when necessary, replace the defective piston assembly and any damaged engine components free of charge.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Engine seizure or sudden loss of motive power', 'Unexpected deceleration', 'Engine damage with possible oil leakage'],
    affectedSystems: ['piston assembly', 'piston pin snap ring', 'engine block'],
    dtcCodes: [],
    citations: [citation('recall', 'Honda Owner Notice - NHTSA Recall 16V-074', SOURCES.pistonPin)],
    identityTerms: ['piston pin'],
    summary: 'Replaced secondary sources with Honda\'s exact recall notice and removed unsupported production counts, build dates, trims and warning-symptom claims.',
  },
  [IDS.brakeMaster]: {
    years: [2020, 2021],
    category: 'brakes',
    title: 'Brake Master Cylinder May Separate From Booster - Recall 23V-458',
    description: 'Certain 2020-2021 Civic vehicles are included in NHTSA recall 23V-458. The tie-rod fastener connecting the brake booster and brake master cylinder may have been assembled improperly, allowing the master cylinder to separate from the booster. Separation can cause a loss of brake function and increase crash risk.',
    solution: 'Check the VIN for recall 23V-458. Honda dealers inspect and repair the brake-booster assembly as necessary, free of charge. Do not buy recall-repair hardware based on a generic parts search.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Loss of brake function', 'Brake master cylinder separation from the booster assembly'],
    affectedSystems: ['brake master cylinder', 'brake booster assembly', 'booster tie-rod fastener'],
    dtcCodes: [],
    citations: [citation('recall', 'NHTSA Recall Acknowledgment 23V-458 - Loose Brake-Booster Fastener', SOURCES.brakeMaster)],
    identityTerms: ['brake master cylinder'],
    summary: 'Bound the card to the exact 2020-2021 Civic recall and removed unverified symptoms, costs, parts and shopping links from a free recall remedy.',
  },
  [IDS.lowPressureFuelPump]: {
    years: [2018, 2019, 2020],
    category: 'fuel',
    title: 'In-Tank Fuel-Pump Impeller May Deform and Stop the Pump - Recall 23V-858',
    description: 'Certain 2018-2020 Civic and Civic Type R vehicles are included in NHTSA recall 23V-858. The fuel-pump module may contain an improperly molded impeller that can deform over time and make the pump inoperable. The engine may fail to start, lose drive power, or stall while driving, increasing crash or injury risk.',
    solution: 'Check the VIN for recall 23V-858. Honda dealers replace the fuel-pump module free of charge. This campaign concerns the in-tank module and is separate from the 2025 Civic high-pressure-pump leak recall.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Engine does not start', 'Loss of drive power', 'Engine stalls while driving', 'Malfunction indicator lamp may illuminate'],
    affectedSystems: ['in-tank fuel-pump module', 'fuel-pump impeller'],
    dtcCodes: [],
    citations: [
      citation('recall', 'NHTSA Recall Acknowledgment 23V-858 - Fuel Pump May Fail', SOURCES.lowPressureFuelPump),
      citation('recall', 'Honda Owner Notice - NHTSA Recall 23V-858', SOURCES.lowPressureFuelPumpNotice),
    ],
    identityTerms: ['fuel pump', 'impeller'],
    summary: 'Corrected the Civic start year from 2019 to 2018, replaced secondary sources with exact recall records, and removed unsupported DTC, trim, engine, cost and commerce claims.',
  },
  [IDS.driverSeat]: {
    years: [2023, 2024],
    category: 'safety',
    title: 'Driver Seat Cushion Frame May Be Unsecured - Recall 24V-859',
    description: 'Certain 2023-2024 Civic and Civic Hatchback vehicles are included in NHTSA recall 24V-859. Bolts in the driver-seat cushion frame may not have been tightened properly and can loosen or fall off, allowing the seat to rock or become unsecured. An unsecured seat may not adequately restrain the driver in a crash.',
    solution: 'Check the VIN for recall 24V-859. Honda dealers replace the driver-seat cushion frame with a properly assembled part free of charge.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Driver seat rocks or wobbles', 'Driver seat feels loose or unsecured'],
    affectedSystems: ['driver-seat cushion frame', 'seat height-adjuster links'],
    dtcCodes: [],
    citations: [
      citation('recall', 'NHTSA Part 573 Report 24V-859 - Driver Seat Cushion Frame', SOURCES.driverSeatReport),
      citation('tsb', 'Honda Service Bulletin 24-129 - Civic Driver Seat Lift-Link Bolt', SOURCES.driverSeatBulletin),
    ],
    identityTerms: ['seat cushion frame'],
    summary: 'Corrected the year scope to 2023-2024, replaced secondary pages with exact NHTSA/Honda records, and removed unsupported trim, cost and alternate-repair claims.',
  },
  [IDS.parkingBrake]: {
    years: [2016],
    category: 'brakes',
    title: 'Electric Parking Brake May Not Apply After Ignition Off - Recall 16V-725',
    description: 'Certain 2016 Civic two-door and four-door vehicles are included in NHTSA recall 16V-725. Vehicle Stability Assist control-unit software may prevent the electric parking brake from applying when it is commanded immediately after the ignition is turned off. If the brake does not apply, the vehicle can roll away and increase crash risk.',
    solution: 'Check the VIN for recall 16V-725. Honda dealers reprogram the VSA control unit with updated software free of charge. Until repaired, verify that the parking brake actually engaged before leaving the vehicle.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Electric parking brake does not apply immediately after ignition off', 'BRAKE indicator blinks for about 15 seconds', 'Vehicle is not held by the parking brake'],
    affectedSystems: ['electric parking brake', 'Vehicle Stability Assist control unit'],
    dtcCodes: [],
    citations: [
      citation('recall', 'NHTSA Recall Acknowledgment 16V-725 - Parking Brake May Not Apply', SOURCES.parkingBrake),
      citation('recall', 'Honda Owner Notice - NHTSA Recall 16V-725', SOURCES.parkingBrakeNotice),
    ],
    identityTerms: ['parking brake'],
    summary: 'Replaced secondary citations with exact NHTSA/Honda records and removed guessed trim, engine and repair-time claims while preserving the EPB software-defect identity.',
  },
  [IDS.stickySteeringLong]: steeringCard,
  [IDS.highPressureFuelPump]: {
    years: [2025],
    category: 'fuel',
    title: 'High-Pressure Fuel Pump May Crack and Leak - Recall 24V-763',
    description: 'Certain 2025 Civic and Civic Hybrid vehicles are included in NHTSA recall 24V-763. The high-pressure fuel pump may crack and leak fuel. A fuel leak near an ignition source increases fire risk.',
    solution: 'Check the VIN for recall 24V-763. Honda dealers inspect the high-pressure fuel pump and replace it as necessary, free of charge. Contact a Honda dealer promptly if a fuel leak or fuel odor is suspected.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Fuel leak from the high-pressure fuel pump', 'Fuel odor may prompt an inspection'],
    affectedSystems: ['high-pressure fuel pump', 'gasoline fuel-delivery system'],
    dtcCodes: [],
    citations: [
      citation('recall', 'NHTSA Recall Acknowledgment 24V-763 - High-Pressure Fuel Pump May Leak', SOURCES.highPressureFuelPump),
      citation('tsb', 'Honda Service Bulletin 24-124 - 2025 Civic High-Pressure Fuel-Pump Leak', SOURCES.highPressureFuelPumpBulletin),
    ],
    identityTerms: ['high pressure fuel pump'],
    summary: 'Bound the card to the exact 2025 Civic recall and removed unsupported warranty-claim totals, notification timing, trim, engine and cost claims.',
  },
  [IDS.stickySteeringShort]: steeringCard,
  [IDS.combinedAcLeak]: {
    years: [2016, 2017, 2018, 2019, 2020, 2021],
    category: 'hvac',
    title: 'A/C Condenser or Compressor Shaft-Seal Refrigerant Leak',
    description: 'Honda has separate warranty extensions for two refrigerant-leak sources on eligible 2016-2021 Civic vehicles. A condenser manufactured out of specification may develop tiny corrosion holes in its tube walls. Separately, swelling and abnormal wear of the compressor shaft seal may create a leak path. Either condition can cause the air conditioning to stop blowing cold air; eligibility and the leaking component must be confirmed by diagnosis and VIN.',
    solution: 'Ask a Honda dealer to check the VIN and diagnose the leak. Under Service Bulletin 19-091, an eligible factory-defect condenser is replaced under a 10-year, unlimited-mile warranty extension. Under Service Bulletin 23-039, an eligible leaking compressor shaft seal is replaced under a separate 10-year, unlimited-mile warranty extension.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['A/C does not blow cold air', 'Refrigerant leak from the condenser', 'Refrigerant or oil leak from the compressor shaft seal'],
    affectedSystems: ['A/C condenser', 'A/C compressor shaft seal', 'refrigerant system'],
    dtcCodes: [],
    citations: [
      citation('tsb', 'Honda Warranty Extension 19-091 - 2016-2021 Civic A/C Condenser', SOURCES.condenser),
      citation('tsb', 'Honda Service Bulletin 23-039 - Civic A/C Compressor Shaft-Seal Leak', SOURCES.compressor),
    ],
    identityTerms: ['condenser', 'compressor', 'leak'],
    summary: 'Separated the two verified leak mechanisms, replaced secondary sources with exact Honda warranty-extension records, and removed recurrence and installed-cost claims.',
  },
  [IDS.condenserLeak]: {
    years: [2016, 2017, 2018, 2019, 2020, 2021],
    category: 'hvac',
    title: 'A/C Condenser Refrigerant Leak - Warranty Extension 19-091',
    description: 'On eligible 2016-2021 Civic vehicles, an A/C condenser manufactured out of specification may develop corrosion in the form of tiny holes in the condenser tube walls, allowing refrigerant to leak and the air conditioning to stop blowing cold air. The warranty extension does not cover condenser leaks caused by foreign-object damage.',
    solution: 'Ask a Honda dealer to check VIN eligibility under Service Bulletin 19-091 and diagnose the leak. If an eligible leak is caused by the factory condenser defect, Honda replaces the condenser under a 10-year, unlimited-mile warranty extension.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['A/C does not blow cold air', 'Low refrigerant caused by a condenser leak'],
    affectedSystems: ['A/C condenser', 'refrigerant system'],
    dtcCodes: [],
    citations: [citation('tsb', 'Honda Warranty Extension 19-091 - 2016-2021 Civic A/C Condenser', SOURCES.condenser)],
    identityTerms: ['condenser', 'leak'],
    summary: 'Replaced a secondary bulletin copy with Honda\'s exact owner notice and removed installed-cost, trim, engine and broad symptom claims.',
  },
  [IDS.compressorLeak]: {
    years: [2016, 2017, 2018, 2019, 2020, 2021],
    category: 'hvac',
    title: 'A/C Compressor Shaft-Seal Refrigerant Leak - Warranty Extension 23-039',
    description: 'On eligible 2016-2021 Civic vehicles, refrigerant and oil requirements can cause the A/C compressor shaft seal to swell and wear abnormally. Increased gaps around the shaft can allow refrigerant to leak, causing the air conditioning to stop blowing cold air. This warranty extension covers the shaft seal, not every possible internal compressor failure.',
    solution: 'Ask a Honda dealer to check VIN eligibility under Service Bulletin 23-039 and perform the specified inspection. If directed by the inspection, the dealer replaces the compressor shaft seal under a 10-year, unlimited-mile warranty extension.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['A/C does not blow cold air', 'Oil or refrigerant leak at the compressor shaft seal'],
    affectedSystems: ['A/C compressor shaft seal', 'refrigerant system'],
    dtcCodes: [],
    citations: [citation('tsb', 'Honda Service Bulletin 23-039 - Civic A/C Compressor Shaft-Seal Leak', SOURCES.compressor)],
    identityTerms: ['compressor'],
    summary: 'Corrected the broad compressor-failure claim to the exact shaft-seal warranty extension, limited the year scope to 2016-2021, and removed unsupported system-replacement and cost claims.',
  },
  [IDS.frontDamper]: {
    years: [2022, 2023, 2024, 2025],
    category: 'suspension',
    title: 'Front Suspension Noise While Turning - Service Bulletin 23-094',
    description: 'Honda Service Bulletin 23-094 applies to 2022-2025 Civic vehicles except Type R. A dull creaking, rubbing, popping, or clicking noise may come from the front of the vehicle while turning at low speeds because the bump stop contacts the top of the front damper body.',
    solution: 'Have a Honda technician confirm that the noise matches Service Bulletin 23-094. The bulletin directs the technician to apply Shin-Etsu silicone grease to the front-damper bump stops; unrelated suspension noises require normal diagnosis.',
    severity: 'low',
    confidence: 'high',
    symptoms: ['Dull creaking while turning at low speed', 'Rubbing, popping, or clicking from the front while turning'],
    affectedSystems: ['front damper bump stops', 'front suspension'],
    dtcCodes: [],
    citations: [citation('tsb', 'Honda Service Bulletin 23-094 Version 2 - Front Suspension Noise While Turning', SOURCES.frontDamper)],
    identityTerms: ['suspension'],
    summary: 'Replaced forum indexes with the exact revised Honda bulletin and corrected applicability to all 2022-2025 Civic trims except Type R.',
  },
  [IDS.oilDilution]: {
    years: [2016, 2017, 2018],
    category: 'engine',
    title: '1.5L Engine Oil Dilution and Cold-Weather Driveability Campaign',
    description: 'Honda announced an engine-oil-dilution product update for certain 2016-2018 Civic vehicles with the 1.5L turbocharged engine in 21 cold-weather states. Depending on driving style and conditions, affected vehicles may lose power and set DTC P0300, P0301, P0302, P0303, P0304, or P0172. Honda identified control-unit software and threshold settings as part of the concern.',
    solution: 'Ask a Honda dealer to check the VIN for the applicable product update or warranty extension. Honda\'s revised procedure uses ECU, TCU, and A/C-control-unit software updates; later diagnostic bulletins govern any returning DTCs or related engine-component repairs.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Loss of power in cold-weather operation', 'Malfunction indicator lamp', 'Misfire or fuel-system-too-rich DTCs'],
    affectedSystems: ['engine oil', 'PGM-FI control software', 'transmission control software'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0172'],
    citations: [
      citation('tsb', 'Honda 2016-2018 Civic Engine Oil Dilution Product Update', SOURCES.oilDilution),
      citation('tsb', 'Honda Procedure Update - Civic Engine Oil Dilution Product Update', SOURCES.oilDilutionRepairUpdate),
    ],
    identityTerms: ['oil dilution'],
    summary: 'Corrected the campaign scope from 2016-2020 to 2016-2018 1.5L vehicles, replaced a generic NHTSA page with exact Honda records, and removed unsourced service intervals, costs and commerce.',
  },
  [IDS.paint]: {
    years: [2012, 2013],
    category: 'body',
    title: 'Factory Paint Cracking, Chalking, or Clouding - Warranty Extension 14-034',
    description: 'Certain 2012-2013 Civic vehicles in specified factory paint colors were included in Honda Service Bulletin 14-034. Eligible vehicles may develop paint cracking, chalking, or clouding on specified upper body panels, including the hood, front fenders, roof, trunk, upper quarter panels, or upper doors. Eligibility depends on paint color and VIN, and the extension does not cover chips, scratches, bird droppings, sap, collision repair, or other external damage.',
    solution: 'Ask a Honda dealer to check the VIN and paint code against Service Bulletin 14-034. For eligible factory-applied paint, Honda extended coverage to seven years from the original purchase date with no mileage limit; the dealer determines which specified panels qualify.',
    severity: 'low',
    confidence: 'high',
    symptoms: ['Factory paint cracks', 'Paint becomes chalky or cloudy', 'Clear coat or finish deteriorates on specified upper body panels'],
    affectedSystems: ['factory-applied exterior paint', 'upper body panels'],
    dtcCodes: [],
    citations: [citation('tsb', 'Honda Service Bulletin 14-034 - 2006-2013 Civic Paint Warranty Extension', SOURCES.paint)],
    identityTerms: ['paint'],
    summary: 'Removed the unrelated Taffeta White bulletin claim and corrected this 9th-generation page to the source-supported 2012-2013 intersection, with VIN-, color-, and panel-specific eligibility.',
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
    model: 'Civic',
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
  const card = REWRITE_CARDS[id];
  if (!card) return [];
  return card.citations.map((item) => ({
    kind: item.type === 'recall' ? 'government-or-manufacturer-recall' : 'manufacturer-service-bulletin',
    url: item.url,
    verifiedOn: '2026-08-06',
    observation: `${item.title} supports the proposed same-identity scope, mechanism, consequence or remedy; the proposal is limited to statements in the cited primary record.`,
  }));
}

function keepReason(current) {
  if (current.id === 'honda-civic-1-5t-cold-weather-misfire-from-fuel-injector-leakage-pgm-fi') {
    return 'The cited Honda bulletin is 19-038, not A19-033, and it does not attribute the DTCs to leaking injectors or prescribe injector replacement. The row stays byte-for-byte unchanged pending a same-identity primary source.';
  }
  if (current.id === 'honda-civic-brake-squeal-2016') {
    return 'The frozen row names Service Bulletin 19-011 without a source, and no same-identity Honda Civic bulletin was verified in this pass. The row stays byte-for-byte unchanged.';
  }
  if (current.id === 'honda-civic-cvt-lower-valve-body-rattle-grinding-noise-hot-start') {
    return 'The frozen row names an unspecified 10th-generation TSB but cites only secondary pages. No exact Honda bulletin was verified, so the row stays byte-for-byte unchanged.';
  }
  if (current.id === 'honda-civic-egr-port-carbon-clogging-p0401-p0402-check-engine-light-roug') {
    return 'The frozen row attributes Civic scope to TSB 99-085 but cites only secondary pages. No exact same-identity Honda bulletin was verified, so the row stays byte-for-byte unchanged.';
  }
  return 'No exact same-identity manufacturer or government source was completed in this pass. The existing published row remains byte-for-byte unchanged; missing evidence is not authorization to rewrite, archive or remove it.';
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const civicRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Civic');
  if (civicRows.length !== 69) throw new Error(`expected 69 Honda Civic rows, found ${civicRows.length}`);

  const rows = civicRows.map((current) => {
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
    model: 'Civic',
    completionStatement: 'This packet reconciles all 69 frozen Honda Civic rows. Fourteen same-identity primary-source corrections are proposed; 55 rows remain byte-for-byte unchanged pending exact primary sources.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All 69 rows remain published. Fifty-five are byte-for-byte unchanged.',
      'An unrelated campaign, bulletin or generic data page may never replace the component, symptom or remedy named by an existing issue.',
      'Every rewrite contains zero commerce, zero cost claims, and empty trim and engine arrays so guessed filters cannot hide the issue.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      civicRecordCount: civicRows.length,
    },
    observations: [
      {
        code: 'duplicate-steering-recall-pages',
        severity: 'independent-review-required',
        recordIds: [IDS.stickySteeringLong, IDS.stickySteeringShort],
        detail: 'Both indexed IDs describe NHTSA recall 24V-744. Both receive the same exact-source correction, but neither is redirected or removed in this proposal.',
      },
      {
        code: 'overlapping-ac-pages',
        severity: 'independent-review-required',
        recordIds: [IDS.combinedAcLeak, IDS.condenserLeak, IDS.compressorLeak],
        detail: 'Three indexed pages overlap the two verified A/C leak mechanisms. Each is corrected within its existing identity; deduplication or canonicalization is left to independent SEO review.',
      },
      {
        code: 'misfire-citation-causal-mismatch',
        severity: 'independent-review-required',
        recordIds: ['honda-civic-1-5t-cold-weather-misfire-from-fuel-injector-leakage-pgm-fi'],
        detail: 'Honda bulletin 19-038 supports 2016-2018 1.5L driveability DTCs and a warranty extension but not the frozen row\'s leaking-injector cause or injector-replacement remedy. The row stays byte-equivalent.',
      },
      {
        code: 'unsupported-bulletin-labels',
        severity: 'follow-up-source-research',
        recordIds: [
          'honda-civic-brake-squeal-2016',
          'honda-civic-cvt-lower-valve-body-rattle-grinding-noise-hot-start',
          'honda-civic-egr-port-carbon-clogging-p0401-p0402-check-engine-light-roug',
        ],
        detail: 'The frozen cards name or imply Honda bulletins that were not verified from exact same-identity primary records. They remain byte-for-byte unchanged.',
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
