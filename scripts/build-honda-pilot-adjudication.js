/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-honda-pilot-adjudication-2026-08-06.json');

const IDS = {
  fiveSpeed: 'honda-pilot-5-speed-automatic-torque-converter-lockup-shudder',
  nineSpeed: 'honda-pilot-9speed-transmission-2016',
  acRelay: 'honda-pilot-ac-compressor-clutch-relay-2016',
  idleStop: 'honda-pilot-auto-idle-stop-engine-fails-to-auto-restart',
  secondGear: 'honda-pilot-automatic-transmission-2nd-gear-overheating-2003',
  batteryDrain: 'honda-pilot-battery-drain-2016',
  brakeBooster: 'honda-pilot-brake-booster-recall-2019',
  catalyst: 'honda-pilot-catalytic-converter-efficiency-failure-triggering-p0420-p043',
  condenser: 'honda-pilot-c-condenser-leak-receiver-dryer-cap-no-cold-air',
  engineMount: 'honda-pilot-engine-mount-failure-2016',
  fuelInjectors: 'honda-pilot-fuel-injector-catalyst-2016',
  fuelPump: 'honda-pilot-fuel-pump-recall-2017',
  aeb: 'honda-pilot-honda-sensing-collision-mitigation-braking-system-phantom-un',
  ignitionSwitch: 'honda-pilot-ignition-switch-internal-wear-2003',
  infotainment: 'honda-pilot-infotainment-black-screen-2016',
  paint: 'honda-pilot-paint-peeling-2014',
  rearDifferentialLeak: 'honda-pilot-rear-differential-leak-2016',
  backupCamera: 'honda-pilot-rearview-backup-camera-failure-black-flickering-distorted-sc',
  vcm: 'honda-pilot-vcm-oil-consumption-2016',
  vtm4: 'honda-pilot-vtm-4-rear-differential-clutch-judder-noise-when-turning',
};

const SOURCES = {
  nineSpeed: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10181389-0001.pdf',
  idleSoftware: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10245550-0001.pdf',
  idleWarranty: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10229676-0001.pdf',
  idleInvestigation: 'https://static.nhtsa.gov/odi/inv/2025/INOA-EA25004-10033.pdf?pubDate=20250404',
  secondGear: 'https://static.nhtsa.gov/odi/rcl/2004/RCRIT-04V176-3885.pdf',
  brakeBooster: 'https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V458-8185.pdf',
  condenser: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10164149-0001.pdf',
  injectors2016: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10187006-0001.pdf',
  injectors2017: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10187008-0001.pdf',
  fuelPump: 'https://static.nhtsa.gov/odi/rcl/2023/RCONL-23V858-3849.PDF',
  paintTaffeta: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10164449-0001.pdf',
  paintWhiteDiamond: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10161240-0001.pdf',
  rearDifferentialLeak: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10108760-9999.pdf',
  backupCameraSoftware: 'https://static.nhtsa.gov/odi/rcl/2020/RCAK-20V440-3616.pdf',
  backupCameraMost: 'https://static.nhtsa.gov/odi/rcl/2023/RCMN-23V431-2339.pdf',
  vcmMisfire: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11020824-0001.pdf',
};

const MISMATCH_SOURCES = {
  acBulletinIsCivicTypeR: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10194978-0001.pdf',
  batteryBulletinIsCrv: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10108868-9999.pdf',
  engineMountRecallIsLionBus: 'https://static.nhtsa.gov/odi/rcl/2020/RCLRPT-20V123-8773.PDF',
  ignitionRecallExcludesPilot: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=02V120000',
  pilotShiftInterlockIsDifferentIdentity: 'https://static.nhtsa.gov/odi/rcl/2012/RCRIT-12V573-9457.pdf',
  aebInvestigationExcludesPilot: 'https://static.nhtsa.gov/odi/inv/2025/INOA-EA25002-10006.pdf',
  differentialConnectorCorrosionIsDifferentIdentity: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011045-0001.pdf',
};

const REWRITE_CARDS = {
  [IDS.nineSpeed]: {
    years: [2016, 2017, 2018, 2019, 2020], category: 'transmission', severity: 'medium', confidence: 'high',
    title: '9-Speed Automatic Intermittent Hard Upshift - Bulletin 20-029',
    description: 'Honda Service Bulletin 20-029 applies to 2016-2019 Pilot Touring and Elite vehicles and specified 2020 Pilot Touring and Elite VIN ranges. Abnormal transmission-control-module adaptation values can cause an intermittent harsh or jerky upshift during steady acceleration.',
    solution: 'Have a Honda dealer confirm the symptom and vehicle eligibility, then update the TCM software under Bulletin 20-029. Honda says the vehicle should have at least 500 miles before diagnosis and that transmission adaptation can take about 500 miles after the update.',
    symptoms: ['Intermittent harsh or jerky upshift during steady acceleration'], affectedSystems: ['9-speed automatic transmission control module'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 20-029 - 2016-2020 Pilot 9-Speed Hard Upshift', url: SOURCES.nineSpeed }], identityTerms: ['9-speed', 'hard upshift'],
    summary: 'Narrowed the broad ZF 9-speed narrative to Honda Bulletin 20-029\'s exact hard-upshift symptom, applicability and TCM-software remedy; removed litigation, costs, unsupported failure modes and commerce.',
  },
  [IDS.idleStop]: {
    years: [2016, 2017, 2018, 2019, 2020, 2021, 2022], category: 'electrical', severity: 'high', confidence: 'high',
    title: 'Auto Idle Stop May Not Restart - Bulletins 23-008 and 23-009',
    description: 'Honda Bulletin 23-008 covers VIN-eligible 2016-2022 Pilot vehicles whose engine may not automatically restart after Auto Idle Stop engages. Honda says the vehicle can typically be restarted by selecting Park and pressing the ENGINE START/STOP button. Bulletin 23-009 provides a second-stage repair for eligible 2016-2021 vehicles when the software update does not resolve the condition. NHTSA Engineering Analysis EA25004 remains open and is not a final defect determination.',
    solution: 'Have a Honda dealer verify VIN eligibility and complete the PGM-FI software update under Bulletin 23-008. If the condition persists on a vehicle eligible for Bulletin 23-009, Honda directs replacement of the starter assembly and starter relays plus a valve adjustment.',
    symptoms: ['Engine may not automatically restart after Auto Idle Stop', 'Vehicle may require selecting Park and pressing the start/stop button to restart'], affectedSystems: ['Auto Idle Stop', 'PGM-FI software', 'Starter assembly and relays'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 23-008 - 2016-2022 Pilot PGM-FI Idle Stop Software Update', url: SOURCES.idleSoftware }, { type: 'tsb', title: 'Honda Service Bulletin 23-009 - 2016-2021 Pilot No-Restart Warranty Extension', url: SOURCES.idleWarranty }, { type: 'investigation', title: 'NHTSA Engineering Analysis EA25004 - No Restart After Auto Start/Stop Engages', url: SOURCES.idleInvestigation }], identityTerms: ['idle stop', 'restart'],
    summary: 'Replaced secondary sources with Honda Bulletins 23-008 and 23-009, corrected scope to VIN-eligible 2016-2022 vehicles and labeled EA25004 as an open investigation rather than a final finding.',
  },
  [IDS.secondGear]: {
    years: [2003, 2004], category: 'transmission', severity: 'critical', confidence: 'high',
    title: 'Automatic Transmission Second-Gear Overheating Recall 04V176',
    description: 'Recall 04V176 covers certain 2003-2004 Honda Pilot vehicles. Heat can build up between the countershaft and secondary-shaft second gears because of insufficient lubrication, which may lead to gear chipping or breakage. In severe cases, the transmission can lock up and increase crash risk.',
    solution: 'Have a Honda dealer verify campaign completion for the VIN. The recall remedy revises the oil-cooler return line on lower-mileage vehicles; higher-mileage vehicles are inspected and receive the appropriate repair, including transmission replacement when inspection shows heat damage.',
    symptoms: ['Open recall 04V176 for the VIN', 'Transmission noise or abnormal operation if second-gear damage develops', 'Potential transmission lockup in severe cases'], affectedSystems: ['Automatic transmission countershaft second gear', 'Automatic transmission secondary-shaft second gear', 'Oil-cooler return line'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'Honda Recall 04V176 - 2003-2004 Pilot Automatic Transmission Second-Gear Lubrication', url: SOURCES.secondGear }], identityTerms: ['second gear', 'overheating'],
    summary: 'Preserved the second-gear-overheating identity while replacing generic recall navigation with Honda recall 04V176\'s exact 2003-2004 mechanism, safety consequence and mileage-dependent remedy; removed unsupported torque-converter claims and commerce.',
  },
  [IDS.brakeBooster]: {
    years: [2021, 2022], category: 'brakes', severity: 'critical', confidence: 'high',
    title: 'Brake Master Cylinder Can Separate From Booster - Recall 23V458',
    description: 'Recall 23V458 covers certain 2021-2022 Honda Pilot vehicles. A tie-rod fastener connecting the brake booster and brake master cylinder may have been improperly assembled, allowing the master cylinder to separate from the booster and potentially causing a loss of brake function.',
    solution: 'Have a Honda dealer check the VIN for recall 23V458. The recall repair inspects the brake-booster assembly and repairs or replaces affected components as necessary.',
    symptoms: ['Open recall 23V458 for the VIN', 'Potential brake master-cylinder separation', 'Potential loss of brake function'], affectedSystems: ['Brake booster assembly', 'Brake master cylinder', 'Booster tie-rod fastener'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall 23V458 - 2021-2022 Pilot Brake Booster Fastener', url: SOURCES.brakeBooster }], identityTerms: ['brake master cylinder', 'brake booster', 'separate'],
    summary: 'Replaced fabricated-looking secondary links with exact recall 23V458, correcting scope from 2019-2022 to VIN-eligible 2021-2022 vehicles and retaining the indexed master-cylinder separation identity.',
  },
  [IDS.condenser]: {
    years: [2016, 2017, 2018, 2019], category: 'hvac', severity: 'low', confidence: 'high',
    title: 'A/C Condenser Leak at Receiver/Dryer Cap - Bulletin 18-080',
    description: 'Honda Service Bulletin 18-080 applies to all 2016-2018 Pilot vehicles and specified 2019 Pilot VIN ranges. The A/C may stop blowing cold air and refrigerant-oil staining may appear around the receiver/dryer cap because the receiver/dryer O-ring is not sufficiently compressed.',
    solution: 'Have a Honda dealer or qualified A/C technician confirm the leak. Bulletin 18-080 directs removal of the condenser, replacement of the filter sub-assembly and specified seals, and evacuation and recharge of the A/C system.',
    symptoms: ['A/C does not blow cold air', 'Refrigerant-oil staining around the receiver/dryer cap'], affectedSystems: ['A/C condenser', 'Receiver/dryer cap and O-ring', 'A/C filter sub-assembly'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 18-080 - 2016-2019 Pilot Receiver/Dryer Cap Leak', url: SOURCES.condenser }], identityTerms: ['condenser', 'receiver/dryer cap', 'cold air'],
    summary: 'Replaced secondary sources with Honda Bulletin 18-080, corrected scope to all 2016-2018 and specified 2019 VINs, and limited the page to the exact receiver/dryer-cap leak and prescribed repair.',
  },
  [IDS.fuelInjectors]: {
    years: [2016, 2017, 2018, 2019], category: 'engine', severity: 'medium', confidence: 'high',
    title: 'Fuel Injector Debris Can Cause Misfires and Catalyst Codes - Bulletins 20-100 and 21-010',
    description: 'Honda Bulletins 20-100 and 21-010 cover VIN-eligible 2016-2019 Pilot vehicles with certain misfire, catalyst-efficiency and air-fuel-imbalance DTCs. Honda states that machining debris from the high-pressure pump or injector can wear or clog an injector, while PCM logic can also misinterpret sensor inputs as a deteriorated catalyst.',
    solution: 'Have a Honda dealer confirm VIN eligibility and diagnose the listed DTCs under the applicable bulletin. The procedures include a PCM software update where specified and replacement of the fuel injectors when the bulletin diagnosis confirms the injector condition.',
    symptoms: ['Malfunction indicator lamp on', 'Engine misfire or rough running', 'Catalyst-efficiency or air-fuel-imbalance DTCs'], affectedSystems: ['Direct fuel injectors', 'High-pressure fuel pump', 'PCM catalyst-monitoring logic'], dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0420', 'P0430', 'P219A', 'P219B'],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 20-100 - 2016-2017 Pilot Fuel Injector Warranty Extension', url: SOURCES.injectors2016 }, { type: 'tsb', title: 'Honda Service Bulletin 21-010 - 2017-2019 Pilot Fuel Injector Warranty Extension', url: SOURCES.injectors2017 }], identityTerms: ['fuel injector', 'misfire', 'catalyst'],
    summary: 'Replaced generic and social sources with Honda Bulletins 20-100 and 21-010, expanded only to their exact 2016-2019 VIN-eligible scope, and retained the indexed injector-debris, misfire and catalyst-code identity without costs or commerce.',
  },
  [IDS.fuelPump]: {
    years: [2016, 2017, 2018, 2019, 2020, 2021], category: 'fuel', severity: 'high', confidence: 'high',
    title: 'Fuel Pump Impeller Failure Recall 23V858',
    description: 'Recall 23V858 covers certain 2016-2021 Honda Pilot vehicles. An improperly molded fuel-pump impeller can deform over time and interfere with the pump body, making the fuel pump inoperative and causing a no-start, loss of drive power or stall.',
    solution: 'Have a Honda dealer check the VIN for recall 23V858. The recall remedy replaces the affected fuel pump module.',
    symptoms: ['Engine may not start', 'Loss of drive power', 'Engine may stall while driving', 'Check-engine light may illuminate'], affectedSystems: ['Fuel pump module', 'Fuel pump impeller'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'Honda Recall 23V858 - 2016-2021 Pilot Fuel Pump Module', url: SOURCES.fuelPump }], identityTerms: ['fuel pump', 'impeller', 'stall'],
    summary: 'Replaced generic recall navigation with Honda\'s exact 23V858 owner notice, corrected scope to VIN-eligible 2016-2021 vehicles and removed unsupported codes, emergency procedures and commerce.',
  },
  [IDS.paint]: {
    years: [2013, 2014, 2015, 2016], category: 'body', severity: 'low', confidence: 'high',
    title: 'Taffeta White or White Diamond Pearl Paint Peeling - Bulletins 19-055 and 19-057',
    description: 'Honda Bulletins 19-055 and 19-057 cover specified white-paint populations: 2013-2015 Pilot vehicles in Taffeta White and 2013-2016 Pilot vehicles in White Diamond Pearl. Insufficient paint thickness at parts of the roof and around the tailgate can allow ultraviolet exposure to oxidize the underlayer and cause peeling.',
    solution: 'Confirm the paint code, model year and VIN eligibility with a Honda dealer. The bulletins prescribe inspection of the roof and tailgate and repainting qualifying affected panels through an approved body shop. The original seven-year warranty-extension periods may have expired, so current coverage must be confirmed rather than assumed.',
    symptoms: ['White paint peeling on the roof', 'White paint peeling around the tailgate'], affectedSystems: ['Exterior roof paint', 'Tailgate paint'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 19-055 - 2013-2015 Pilot Taffeta White Paint', url: SOURCES.paintTaffeta }, { type: 'tsb', title: 'Honda Service Bulletin 19-057 - 2013-2016 Pilot White Diamond Pearl Paint', url: SOURCES.paintWhiteDiamond }], identityTerms: ['white', 'paint', 'peeling', 'roof', 'tailgate'],
    summary: 'Corrected the unsupported 2014-2022 scope to Honda Bulletins 19-055 and 19-057\'s exact 2013-2016 white-paint populations, mechanism and affected panels; explicitly avoids promising expired warranty coverage.',
  },
  [IDS.rearDifferentialLeak]: {
    years: [2016, 2017], category: 'drivetrain', severity: 'medium', confidence: 'high',
    title: 'AWD Rear Differential Fluid Leak From Pressure Sensor or Check Port',
    description: 'Honda ServiceNews Article A17050C applies to 2016-2017 Pilot AWD vehicles. Fluid that appears to come from an axle seal or pinion seal may instead be dripping from a loose or damaged fluid-pressure sensor or a loose pressure-check port located above it.',
    solution: 'Have a qualified technician identify the source before replacing the differential or its seals. Honda directs checking the fluid-pressure sensor and pressure-check port first; the repair may be tightening the port or tightening or replacing the sensor.',
    symptoms: ['Rear differential fluid near an axle seal', 'Rear differential fluid near the pinion seal'], affectedSystems: ['AWD rear differential', 'Differential fluid-pressure sensor', 'Differential pressure-check port'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda ServiceNews A17050C - 2016-2017 Pilot AWD Rear Differential Leaks', url: SOURCES.rearDifferentialLeak }], identityTerms: ['rear differential', 'fluid leak', 'sensor'],
    summary: 'Narrowed the broad 2016-2023 leak narrative to Honda ServiceNews A17050C\'s exact 2016-2017 AWD pressure-sensor and check-port leak diagnosis; removed unsupported case deterioration, intervals, costs, capacities and commerce.',
  },
  [IDS.backupCamera]: {
    years: [2019, 2020, 2021, 2022], category: 'electrical', severity: 'high', confidence: 'high',
    title: 'Rearview Camera May Be Delayed, Intermittent, or Blank - Recalls 20V440 and 23V431',
    description: 'Two Honda safety recalls cover VIN-eligible Pilot rearview-camera failures. Recall 20V440 covers certain 2019-2021 vehicles whose central-network software can delay or prevent the image from displaying. Recall 23V431 covers certain 2019-2022 vehicles whose out-of-spec MOST coaxial-cable terminal can cause poor communication and make the rearview camera intermittent or blank in Reverse.',
    solution: 'Have a Honda dealer check the VIN for both campaigns. Recall 20V440 provides a central-network software update. Recall 23V431 repairs the affected MOST/FAKRA cable connections.',
    symptoms: ['Rearview image may be delayed', 'Rearview image may work intermittently', 'Rearview image may be blank in Reverse', 'Audio quality may also be affected by a poor MOST connection'], affectedSystems: ['Rearview camera display', 'Central network software', 'MOST bus coaxial connections'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall 20V440 - 2019-2021 Pilot Rearview Camera Software', url: SOURCES.backupCameraSoftware }, { type: 'recall', title: 'Honda Recall 23V431 - 2019-2022 Pilot MOST/FAKRA Communication', url: SOURCES.backupCameraMost }], identityTerms: ['rearview camera', 'blank', 'intermittent'],
    summary: 'Preserved the indexed backup-camera failure identity while replacing secondary claims with recalls 20V440 and 23V431, correcting scope to VIN-eligible 2019-2022 vehicles and removing unsupported first-generation water-intrusion claims.',
  },
  [IDS.vcm]: {
    years: [2013, 2014, 2015], category: 'engine', severity: 'high', confidence: 'high',
    title: 'VCM-Related Piston Ring Wear, Spark-Plug Fouling, and Misfire - Bulletin 25-060',
    description: 'Honda Service Bulletin 25-060 applies to VIN-eligible 2013-2015 Pilot vehicles. Honda says piston-ring function can deteriorate because of low wear toughness and sticking from sludge, allowing oil to adhere to a spark plug, cause carbon fouling and trigger cylinder-misfire DTCs P0301 through P0304.',
    solution: 'Have a Honda dealer confirm VIN eligibility and diagnose the listed misfire codes. Bulletin 25-060 directs a PCM update and, depending on inspection results, replacement of affected spark plugs, piston cleaning and ring replacement, or short-block replacement. The bulletin\'s temporary coverage ended January 31, 2026, so current coverage must be confirmed rather than assumed.',
    symptoms: ['Malfunction indicator lamp on', 'Cylinder misfire', 'Carbon-fouled spark plug'], affectedSystems: ['Piston rings', 'Spark plugs', 'PCM calibration'], dtcCodes: ['P0301', 'P0302', 'P0303', 'P0304'],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 25-060 - 2013-2015 Pilot VCM Misfire Warranty Extension', url: SOURCES.vcmMisfire }], identityTerms: ['VCM', 'oil', 'misfire'],
    summary: 'Corrected the false 2016-2022 scope to Bulletin 25-060\'s exact VIN-eligible 2013-2015 population and documented mechanism; removed aftermarket VCM-disabler recommendations, consumption rates, litigation, costs and unsupported downstream failures.',
  },
};

const SPECIFIC_KEEP_REASONS = {
  [IDS.fiveSpeed]: 'Honda Bulletin 14-078 documents a distinct 2012-2015 VCM/lockup-calibration vibration and explicitly separates torque-converter shudder during diagnosis. The generic all-model job aid does not prove this page\'s 2009-2015 defect population, DTC or repair claims, so the row remains unchanged.',
  [IDS.acRelay]: 'The previously associated Bulletin 21-014 is a 2017-2021 Civic Type R A/C-condenser warranty extension, not a Pilot compressor-clutch relay bulletin. No exact Pilot primary source establishes the relay part, failure modes or remedy, so the row remains unchanged.',
  [IDS.batteryDrain]: 'Bulletin 17-032 applies only to specified 2017 CR-V vehicles with a VSA-modulator software draw, not the Pilot. No exact primary source establishes this row\'s merged radio, Bluetooth, relay and battery claims, so it remains unchanged.',
  [IDS.engineMount]: 'Recall 20V123 belongs to Lion Electric buses and concerns steering fasteners, not Honda Pilot engine mounts. No exact Honda source establishes this row\'s 2016-2022 active-mount population, DTCs or VCM claims, so it remains unchanged.',
  [IDS.aeb]: 'NHTSA EA25002 covers 2019-2022 Insight and 2019-2023 Passport, not Pilot. The frozen secondary sources cannot establish a Pilot-wide 2016-2022 CMBS defect, so the row remains unchanged.',
  [IDS.ignitionSwitch]: 'Recall 02V120 covers older Accord, Civic, CR-V and other pre-Pilot products; it does not include the 2003-2004 Pilot. Recall 12V573 does cover those Pilot years but concerns a shift-interlock/key-removal rollaway condition, not worn ignition contacts causing stall or no-start. The row remains unchanged.',
  [IDS.infotainment]: 'Recalls 20V440 and 23V431 establish narrower rearview-camera software and MOST-cable defects, not a single 2016-2022 touchscreen black-screen defect. Those exact camera identities are handled on the existing backup-camera page, so this broader row remains unchanged.',
  [IDS.catalyst]: 'The injector bulletins describe specific false catalyst codes and injector debris on 2016-2019 vehicles, but this card claims a broad 2003-2018 catalytic-converter failure population. Replacing it would merge a different mechanism and duplicate the dedicated injector page, so it remains unchanged.',
  [IDS.vtm4]: 'Secondary repair articles and forum posts do not establish one VTM-4 clutch-fluid breakdown defect across 2009-2022 vehicles. Honda Bulletin 24-048 concerns connector corrosion and AWD DTCs, which is a different identity, so the row remains unchanged.',
};

function keepReason(row) {
  return SPECIFIC_KEEP_REASONS[row.id] || `No exact Honda/NHTSA primary source was found that establishes one ${row.title} defect with the frozen year scope, mechanism and remedy. The indexed row remains published and byte-for-byte unchanged pending independent review.`;
}

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function rewriteProposal(current, card) {
  return fullRecord({ ...current, ...card, make: 'Honda', model: 'Pilot', trims: [], engines: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: card.summary, relatedIssueIds: [] });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Pilot');
  if (modelRows.length !== 40) throw new Error(`expected 40 Honda Pilot rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id, model: current.model, action,
      reason: card ? card.summary : keepReason(current),
      identityRule: card ? 'The indexed issue identity stays on the same ID; only exact Honda/NHTSA scope, mechanism, symptoms and remedy replace unsupported claims.' : 'No content or publication-state changes; partial, generic, secondary or overlapping evidence cannot replace this indexed issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: card ? card.citations.map((item) => ({ kind: item.type === 'investigation' ? 'open-investigation' : 'manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, mechanism and remedy.` })) : [],
      beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const actions = ['rewrite_same_identity', 'keep_published_pending_source'];
  const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length]));
  summary.total = rows.length;
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Honda', model: 'Pilot',
    completionStatement: 'This packet reconciles all 40 frozen Honda Pilot rows. Eleven same-identity Honda/NHTSA corrections are proposed; twenty-nine rows remain byte-for-byte unchanged pending exact evidence or independent disposition.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All 40 rows remain published. Twenty-nine are byte-for-byte unchanged.',
      'An unrelated campaign, bulletin, component, generation or model may never replace the issue named by an existing indexed page.',
      'Each rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.',
      'Open investigations are identified as allegations under review, not final defect findings.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: { snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, pilotRecordCount: modelRows.length },
    observations: [
      { code: 'unrelated-campaigns-exposed-not-substituted', severity: 'independent-review-required', recordIds: [IDS.acRelay, IDS.batteryDrain, IDS.engineMount, IDS.ignitionSwitch], detail: 'Bulletin 21-014 is Civic Type R, Bulletin 17-032 is CR-V, recall 20V123 is a Lion Electric bus campaign and recall 02V120 excludes Pilot. All four Pilot rows stay byte-for-byte unchanged.' },
      { code: 'pilot-aeb-source-mismatch', severity: 'independent-review-required', recordIds: [IDS.aeb], detail: 'NHTSA EA25002 covers Insight and Passport, not Pilot. It is not used to rewrite the frozen Pilot CMBS page.' },
      { code: 'camera-identities-kept-separate', severity: 'independent-review-required', recordIds: [IDS.backupCamera, IDS.infotainment], detail: 'Recalls 20V440 and 23V431 support the same-identity backup-camera page. They do not establish the broader 2016-2022 touchscreen-failure page, which remains unchanged.' },
      { code: 'vcm-scope-corrected-and-coverage-expiry-stated', severity: 'independent-review-required', recordIds: [IDS.vcm], detail: 'Bulletin 25-060 applies to VIN-eligible 2013-2015 Pilot vehicles, not 2016-2022. Its January 31, 2026 coverage end is stated so the proposal does not promise current warranty coverage.' },
      { code: 'differential-identities-kept-separate', severity: 'independent-review-required', recordIds: [IDS.rearDifferentialLeak, IDS.vtm4], detail: 'ServiceNews A17050C supports the exact 2016-2017 AWD leak diagnosis. Bulletin 24-048 concerns connector corrosion and AWD DTCs, not the frozen VTM-4 clutch-judder page.' },
      { code: 'new-safety-campaigns-not-silently-merged', severity: 'independent-review-required', recordIds: [], detail: 'Newer Pilot campaigns such as rear-subframe corrosion, passenger-seat weight-sensor faults and connecting-rod-bearing investigations are separate candidate issues; this model packet does not merge them into unrelated indexed pages.' },
    ],
    mismatchSources: MISMATCH_SOURCES,
    summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { FULL_RECORD_FIELDS, IDS, MISMATCH_SOURCES, REWRITE_CARDS, SOURCES, fullRecord, hashValue, keepReason, normalizedFileHash, rewriteProposal };
