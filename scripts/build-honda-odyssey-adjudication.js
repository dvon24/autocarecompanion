/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-honda-odyssey-adjudication-2026-08-06.json');

const IDS = {
  nineSpeed: 'honda-odyssey-9speed-transmission-2018',
  acCompressor: 'honda-odyssey-ac-compressor-failure-2005',
  idleStop: 'honda-odyssey-auto-idle-stop-failure-to-restart-unexpected-stalling',
  backupCamera: 'honda-odyssey-backup-camera-recall-2018',
  batteryDrain: 'honda-odyssey-battery-drain-2011',
  cabinWatch: 'honda-odyssey-cabinwatch-rear-entertainment-camera-system-freeze',
  doorLatch: 'honda-odyssey-door-latch-recall-2018',
  engineMount: 'honda-odyssey-engine-mount-failure-2005',
  fuelPump: 'honda-odyssey-fuel-pump-recall-2018',
  blendDoor: 'honda-odyssey-hvac-blend-door-actuator-failure',
  ignitionInterlock: 'honda-odyssey-ignition-interlock-2003',
  infotainment: 'honda-odyssey-infotainment-black-screen-2014',
  tailgate: 'honda-odyssey-power-tailgate-sags-drops-due-to-support-strut-failure',
  seatbelt: 'honda-odyssey-seatbelt-defects-2018',
  slidingDoor: 'honda-odyssey-sliding-door-failure-2005',
  timingBelt: 'honda-odyssey-timing-belt-2005',
  torqueConverter: 'honda-odyssey-torque-converter-shudder-2011',
  transmission: 'honda-odyssey-transmission-failure-1999',
  vcm: 'honda-odyssey-vcm-oil-consumption-2005',
  spoolValve: 'honda-odyssey-vcm-spool-valve-gasket-oil-leak-causing-repeated-alternator',
  whitePaint: 'honda-odyssey-white-paint-clear-coat-peeling-delamination',
};

const SOURCES = {
  nineSpeed: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10169956-0001.pdf',
  idleStop: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10240336-0001.pdf',
  backupCamera: 'https://static.nhtsa.gov/odi/rcl/2023/RCMN-23V431-2339.pdf',
  cabinWatch: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10158720-0001.pdf',
  doorLatch: 'https://static.nhtsa.gov/odi/rcl/2018/RCRIT-18V795-2903.pdf',
  fuelPump: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V858-2592.pdf',
  ignitionInterlock: 'https://static.nhtsa.gov/odi/rcl/2012/RCRIT-12V573-9457.pdf',
  tailgate: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10216878-0001.pdf',
  seatbeltFront: 'https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V158-6827.pdf',
  seatbeltThirdRow: 'https://static.nhtsa.gov/odi/rcl/2017/RCRIT-17V397-6464.pdf',
  torqueConverterEarly: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10084344-2280.pdf',
  torqueConverterLate: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10129797-9999.pdf',
  transmission: 'https://static.nhtsa.gov/odi/rcl/2004/RCRIT-04V176-3885.pdf',
  vcmEarly: 'https://static.nhtsa.gov/odi/tsbs/2013/SB-10053787-4085.pdf',
  vcmLate: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10129411-9999.pdf',
};

const MISMATCH_SOURCES = {
  frozenNineSpeedBulletin: SOURCES.torqueConverterLate,
  frozenDoorCampaign: 'https://static.nhtsa.gov/odi/rcl/2020/RCAK-20V027-4470.pdf',
};

const REWRITE_CARDS = {
  [IDS.nineSpeed]: {
    years: [2018, 2019], category: 'transmission', severity: 'medium', confidence: 'high', title: '9-Speed Automatic Hard Upshift / DTC P0716',
    description: 'Honda Service Bulletin 19-124 applies to 2018-2019 Odyssey LX, EX and EX-L vehicles equipped with the 9-speed automatic transmission. Abnormal transmission-control adaptation values or a TCM software calculation error can cause intermittent harsh or jerky upshifts during steady acceleration or illuminate the malfunction indicator with DTC P0716.',
    solution: 'Have a Honda dealer confirm the symptom and update the transmission control module software under Bulletin 19-124. Honda notes that the vehicle should have at least 500 miles before diagnosing the hard-upshift condition and that TCM adaptation may take about 500 miles after the update.',
    symptoms: ['Intermittent harsh or jerky upshift during steady acceleration', 'Malfunction indicator may illuminate', 'DTC P0716 may be stored'], affectedSystems: ['9-speed automatic transmission control module'], dtcCodes: ['P0716'],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 19-124 - 2018-2019 Odyssey 9-Speed Hard Upshift / P0716', url: SOURCES.nineSpeed }], identityTerms: ['9-speed', 'upshift'],
    summary: 'Retained the 2018-2019 9-speed transmission identity but replaced the false 17-043 citation and unsupported shudder, dog-clutch, lawsuit and fluid-flush narrative with exact Honda Bulletin 19-124 scope, symptom, cause and TCM remedy.',
  },
  [IDS.idleStop]: {
    years: [2018, 2019, 2020, 2021, 2022, 2023], category: 'electrical', severity: 'high', confidence: 'high', title: 'Auto Idle Stop May Not Restart - Bulletin 23-027',
    description: 'Honda Service Bulletin 23-027 covers VIN-eligible 2018-2019 Odyssey Touring and Elite vehicles, all 2020-2022 Odyssey vehicles, and a specified 2023 VIN range. Under certain conditions, the engine may not automatically restart after idle stop engages. Honda identifies an aging 12-volt battery and insufficient starter torque at a high-resistance engine position as the possible cause.',
    solution: 'Have a Honda dealer confirm bulletin applicability and update the PGM-FI software. Honda states that selecting Park and pressing the ENGINE START/STOP button will typically restart the vehicle when the condition occurs.',
    symptoms: ['Engine may not automatically restart after idle stop', 'Vehicle may require Park and the start/stop button to restart'], affectedSystems: ['Auto Idle Stop', 'PGM-FI software', '12-volt starting system'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 23-027 - After Idle Stop Engages, Vehicle Does Not Auto Restart', url: SOURCES.idleStop }], identityTerms: ['idle', 'stop', 'restart'],
    summary: 'Narrowed the unsupported 2018-2025 litigation narrative to Honda Bulletin 23-027\'s exact 2018-2023 applicability, supported possible cause, restart behavior and software remedy; removed costs, workarounds and claims not stated by Honda.',
  },
  [IDS.backupCamera]: {
    years: [2018, 2019, 2020, 2021, 2022, 2023], category: 'electrical', severity: 'high', confidence: 'high', title: 'MOST Network Rearview Camera Recall 23V431',
    description: 'Honda recall 23V431 covers VIN-eligible 2018-2023 Odyssey vehicles. A coaxial-cable terminal in the Media Oriented Systems Transport network may have been manufactured out of specification, causing poor communication that can affect audio quality and make the rearview camera work intermittently or go blank in Reverse.',
    solution: 'Have a Honda dealer check VIN eligibility. The recall repair replaces the affected female harness terminal and installs a terminal-straightening cover.',
    symptoms: ['Rearview camera may work intermittently', 'Rearview camera may go blank in Reverse', 'Audio quality may be affected'], affectedSystems: ['MOST bus network', 'Rearview camera display', 'Audio network'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'Honda Recall 23V431 - 2018-2023 Odyssey MOST Communication Error', url: SOURCES.backupCamera }], identityTerms: ['camera', 'MOST'],
    summary: 'Replaced generic NHTSA search pages, an unsupported warranty-count claim and unrelated commerce with Honda recall 23V431\'s exact 2018-2023 MOST-terminal defect and remedy.',
  },
  [IDS.cabinWatch]: {
    years: [2018, 2019], category: 'electrical', severity: 'low', confidence: 'high', title: 'CabinWatch / Rear Entertainment System Freeze',
    description: 'Honda Tech Line article ATS190403 applies to 2018-2019 Odyssey Touring and Elite vehicles. When CabinWatch is used while the rear entertainment system streams an application or plays a DVD for about 10 minutes or more, the Display Audio screen may show “Camera System Problem. Image cannot be displayed,” while the overhead screen freezes and audio continues.',
    solution: 'Honda identified the condition as software-related and instructed technicians not to replace components while an over-the-air software correction was being prepared. Owners should ask a Honda dealer to confirm the latest applicable software and diagnosis for their VIN.',
    symptoms: ['CabinWatch image cannot be displayed message', 'Rear entertainment overhead screen freezes', 'Audio continues while the image is frozen'], affectedSystems: ['CabinWatch camera', 'Rear entertainment system', 'Display Audio software'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Tech Line ATS190403 - RES Freezes with CabinWatch Error Message', url: SOURCES.cabinWatch }], identityTerms: ['CabinWatch', 'freeze'],
    summary: 'Preserved the exact CabinWatch/RES identity and 2018-2019 Touring/Elite scope while removing forum, settlement, reimbursement, price and completed-fix claims not established by Honda\'s source.',
  },
  [IDS.doorLatch]: {
    years: [2018, 2019], category: 'body', severity: 'critical', confidence: 'high', title: 'Power Sliding Door Rear Latch Recall 18V795',
    description: 'Honda recall 18V795 covers VIN-eligible 2018-2019 Odyssey vehicles with power sliding doors. Higher-than-normal friction can make the rear latch mechanism stick, prevent the door from fully closing and allow it to open unexpectedly while the vehicle is moving.',
    solution: 'Have a Honda dealer check VIN eligibility and replace both left and right power-sliding-door rear latch assemblies under recall 18V795.',
    symptoms: ['Power sliding door may not fully latch', 'Door Open warning or beeper may remain active', 'Power sliding door may open unexpectedly while driving'], affectedSystems: ['Power sliding door rear latch assemblies'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'Honda Service Bulletin 18-128 / Recall 18V795 - Power Sliding Door Rear Latches', url: SOURCES.doorLatch }], identityTerms: ['door', 'latch'],
    summary: 'Corrected the false 20V027 campaign number to Honda recall 18V795 and retained the exact 2018-2019 rear-latch identity, supported risk and both-latch remedy; removed commerce and generalized advice.',
  },
  [IDS.fuelPump]: {
    years: [2018, 2019, 2020, 2021, 2022, 2023], category: 'fuel', severity: 'high', confidence: 'high', title: 'In-Tank Fuel Pump Motor Recall 23V858',
    description: 'Honda Service Bulletin 24-022 covers VIN-eligible 2018-2023 Odyssey vehicles. A defective fuel-pump impeller can swell, interfere with the pump body and make the pump inoperative, which may prevent the engine from starting or cause a stall and loss of motive power while driving.',
    solution: 'Have a Honda dealer check VIN eligibility. The recall remedy is replacement of the in-tank fuel pump motor under campaign 23V858.',
    symptoms: ['Difficulty starting', 'Engine hesitation while driving', 'Malfunction indicator may illuminate', 'Engine may stall while driving', 'DTC P0087 may be stored'], affectedSystems: ['In-tank fuel pump motor', 'Fuel pump impeller'], dtcCodes: ['P0087'],
    citations: [{ type: 'recall', title: 'Honda Service Bulletin 24-022 - 2018-2023 Odyssey Fuel Pump Motor Recall 23V858', url: SOURCES.fuelPump }], identityTerms: ['fuel', 'pump'],
    summary: 'Updated the older and mismatched campaign links to Honda Bulletin 24-022 for recall 23V858, expanded only to its exact 2018-2023 VIN-eligible scope, and removed unsupported commerce and reimbursement claims.',
  },
  [IDS.ignitionInterlock]: {
    years: [2003, 2004], category: 'electrical', severity: 'high', confidence: 'high', title: 'Ignition Shift-Interlock Recall 12V573',
    description: 'Honda recall 12V573 covers certain 2003-2004 Odyssey vehicles. The ignition-switch interlock lever may deform and allow the key to be removed when the automatic transmission is not in Park. If the parking brake is not engaged, the vehicle can roll away.',
    solution: 'Have a Honda dealer check recall eligibility and install the updated shift-interlock lever; the ignition switch is replaced if inspection shows it is necessary.',
    symptoms: ['Ignition key may be removable when the selector is not in Park', 'Vehicle may roll away if the parking brake is not engaged'], affectedSystems: ['Ignition switch interlock', 'Automatic-transmission shift interlock'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'Honda Service Bulletin 13-011 / Recall 12V573 - Key Removable Out of Park', url: SOURCES.ignitionInterlock }], identityTerms: ['ignition', 'interlock'],
    summary: 'Replaced a generic vehicle page and fabricated-looking forum URL with Honda recall 12V573\'s exact 2003-2004 interlock defect, rollaway risk and repair.',
  },
  [IDS.tailgate]: {
    years: [2018, 2019, 2020, 2021, 2022], category: 'body', severity: 'medium', confidence: 'high', title: 'Power Tailgate Sags or Closes - Bulletin 22-018',
    description: 'Honda Service Bulletin 22-018 covers 2018-2021 Odyssey trims with a power tailgate except LX and EX, plus a specified 2022 VIN range. A damaged internal damper in the right tailgate spring may provide insufficient pressure, allowing the open tailgate to sag or causing the control unit to sound a warning and power the tailgate closed.',
    solution: 'Have a Honda dealer confirm bulletin applicability and replace the right power-tailgate spring assembly.',
    symptoms: ['Open power tailgate slowly sags down', 'Warning tone sounds before the tailgate powers closed'], affectedSystems: ['Right power-tailgate spring assembly'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 22-018 - Power Tailgate Won’t Stay Open', url: SOURCES.tailgate }], identityTerms: ['tailgate', 'sag'],
    summary: 'Narrowed the 2018-2024 vendor/forum narrative to Honda Bulletin 22-018\'s exact 2018-2022 applicability, right-spring damper cause and replacement remedy; removed costs and aftermarket claims.',
  },
  [IDS.seatbelt]: {
    years: [2018, 2019, 2020], category: 'safety', severity: 'critical', confidence: 'high', title: 'Seat Belt Buckle and 2018 Third-Row Tongue Recalls',
    description: 'Two Honda recalls affect this indexed seat-belt page. Recall 23V158 covers certain 2018-2020 Odyssey vehicles whose front buckle channel can interfere with the release button and prevent latching. Recall 17V397 covers certain 2018 Odyssey vehicles whose third-row center belt may have an incorrect tongue that will not latch in the center buckle.',
    solution: 'Have a Honda dealer check the VIN for each campaign. Recall 23V158 replaces the front buckle release buttons or buckle assemblies as needed. Recall 17V397 inspects the third-row belts and replaces the center retractor assembly if the center belt will not latch.',
    symptoms: ['Front seat belt buckle may not latch', '2018 third-row center seat belt may not latch with the center buckle'], affectedSystems: ['Front seat belt buckle assemblies', 'Third-row center seat belt assembly'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall 23V158 - 2018-2020 Odyssey Front Seat Belt Buckles', url: SOURCES.seatbeltFront }, { type: 'recall', title: 'Honda Service Bulletin 17-055 / Recall 17V397 - 2018 Odyssey Third-Row Center Seat Belt', url: SOURCES.seatbeltThirdRow }], identityTerms: ['seat', 'belt'],
    summary: 'Corrected the false 23V782/23V783 campaign numbers to 23V158 and 17V397 while retaining the existing two-part seat-belt identity and exact 2018-2020 scope; removed commerce and unsupported totals.',
  },
  [IDS.torqueConverter]: {
    years: [2011, 2012, 2014, 2015, 2016, 2017], category: 'transmission', severity: 'medium', confidence: 'high', title: 'Torque Converter Lock-Up Clutch Judder',
    description: 'Honda documents lock-up-clutch judder in VIN-eligible 2011-2012 Odyssey Touring and Touring Elite vehicles and in all 2014-2017 Odyssey trims. It may be felt at about 20-45 mph on the earlier vehicles or 20-60 mph on 2014-2017 vehicles. Honda attributes the later condition to transmission fluid deterioration under intermittent high heat loads.',
    solution: 'For 2011-2012 vehicles, Honda Bulletin 16-046 calls for the applicable transmission software update and ATF replacement; a returning confirmed judder may require the Bulletin 16-052 torque-converter procedure. For 2014-2017 vehicles, Bulletin 17-043 requires diagnostic snapshot confirmation, the applicable software update and its ATF flush procedure.',
    symptoms: ['Judder or vibration during light acceleration', 'Condition may occur between approximately 20 and 60 mph'], affectedSystems: ['Torque converter lock-up clutch', 'Automatic-transmission software', 'Automatic transmission fluid'], dtcCodes: [],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 16-046 - 2011-2012 Odyssey Lock-Up Clutch Function', url: SOURCES.torqueConverterEarly }, { type: 'tsb', title: 'Honda Service Bulletin 17-043 - 2014-2017 Odyssey Torque Converter Judder', url: SOURCES.torqueConverterLate }], identityTerms: ['torque', 'converter', 'judder'],
    summary: 'Corrected the falsely labeled blank 17-043 citation and unsupported continuous 2011-2017 scope by documenting only exact 2011-2012 and 2014-2017 Honda programs, their distinct eligibility and required diagnostic/remedy paths.',
  },
  [IDS.transmission]: {
    years: [2002, 2003, 2004], category: 'transmission', severity: 'critical', confidence: 'high', title: 'Automatic Transmission Second-Gear Safety Recall 04V176',
    description: 'Honda recall 04V176 covers all 2002-2003 Odyssey vehicles and specified early-production 2004 vehicles. Under certain operating conditions, insufficient oil flow can allow heat to build between the countershaft and secondary-shaft second gears, leading to heat damage, gear-tooth chipping or, rarely, gear breakage and transmission lockup.',
    solution: 'Have a Honda dealer verify VIN eligibility. Honda\'s campaign installed an ATF oil-jet kit on lower-mileage or undamaged vehicles and required inspection, with remanufactured transmission replacement when the specified heat damage was found.',
    symptoms: ['Transmission noise may precede damage', 'Second-gear heat damage may occur', 'Transmission may lock in rare cases'], affectedSystems: ['Automatic-transmission second gears', 'Transmission lubrication'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'Honda Service Bulletin 04-021 / Recall 04V176 - Automatic Transmission Second-Gear Inspection', url: SOURCES.transmission }], identityTerms: ['transmission', 'gear'],
    summary: 'Narrowed the broad 1999-2004 failure and class-action narrative to the exact 2002-2004 Honda second-gear safety recall, replacing the false 99V123 citation and removing unsupported failure modes, warranty terms and commerce.',
  },
  [IDS.vcm]: {
    years: [2008, 2009, 2010, 2011, 2012, 2013], category: 'engine', severity: 'high', confidence: 'high', title: 'Piston Ring Rotation, Spark Plug Fouling and Misfire',
    description: 'Honda Bulletins 13-080 and 13-081 cover VIN-eligible 2008-2010 and 2011-2013 Odyssey vehicles. Piston rings on certain cylinders can rotate and align, leading to spark-plug fouling, an illuminated malfunction indicator and cylinder misfire DTCs P0301 through P0304.',
    solution: 'Have a Honda dealer verify VIN and bulletin eligibility. The Honda procedures diagnose fouled plugs, update applicable 2008-2011 PCM software, and clean pistons and replace affected piston rings and spark plugs when the bulletin criteria are met.',
    symptoms: ['Malfunction indicator may illuminate', 'Spark plugs may foul', 'Cylinder misfire may occur', 'DTC P0301, P0302, P0303 or P0304 may be stored'], affectedSystems: ['Piston rings', 'Spark plugs', 'PCM software'], dtcCodes: ['P0301', 'P0302', 'P0303', 'P0304'],
    citations: [{ type: 'tsb', title: 'Honda Service Bulletin 13-080 - 2008-2010 Odyssey Piston Ring / Misfire Warranty Extension', url: SOURCES.vcmEarly }, { type: 'tsb', title: 'Honda Service Bulletin 13-081 - 2011-2013 Odyssey Piston Ring / Misfire Warranty Extension', url: SOURCES.vcmLate }], identityTerms: ['piston', 'ring'],
    summary: 'Replaced the unsupported 2005-2017 oil-consumption, catalyst, VCM-disable and commerce narrative with Honda Bulletins 13-080/13-081\'s exact 2008-2013 piston-ring, plug-fouling and misfire condition and prescribed repair.',
  },
};

const KEEP_REASONS = {
  [IDS.acCompressor]: 'A blank Bulletin 09-076 citation and one generic complaint do not establish one compressor/clutch defect, cause, recurrence interval, repair path or price across 2005-2023 Odyssey vehicles. The row remains unchanged.',
  [IDS.batteryDrain]: 'The frozen 19-140 citation has no URL and describes a 2018-2019 sliding-door rear latch rather than proving the model-wide 2011-2023 parasitic-draw mechanisms and amperage thresholds. The row remains unchanged.',
  [IDS.engineMount]: 'This uncited row combines normal wear, VCM causation, all-mount replacement advice, aftermarket durability and component-damage claims across nineteen model years. It remains unchanged.',
  [IDS.blendDoor]: 'Repair-cost pages and forum anecdotes do not establish one blend-door actuator defect, exact year scope, module-reset remedy or pricing across 2011-2022 Odyssey vehicles. The row remains unchanged.',
  [IDS.infotainment]: 'A generic complaint page and fabricated-looking Reddit path do not establish one infotainment failure mechanism across 2014-2023 vehicles. The later MOST recall overlaps only part of this scope and already has its own indexed card, so no substitution is proposed.',
  [IDS.slidingDoor]: 'The broad 2005-2023 card merges latches, rollers, tracks, motors and control modules. Bulletin 18-031 covers a narrower 2018 latch condition that overlaps the dedicated recall card; it cannot support or replace this multi-mechanism page.',
  [IDS.timingBelt]: 'This is a maintenance-advice page supported only by a generic complaint page, secondary TSB listing and forum. No exact Honda primary source in this audit establishes its year limit, interval, claimed engine change, prices or DTC list.',
  [IDS.spoolValve]: 'Honda Bulletin 20-023 verifies a front rocker-arm oil-control-valve leak, but it does not establish the indexed page\'s repeated-alternator-failure causation, DTC claims or costs. Because that consequence is central to the slug and title, the row remains unchanged.',
  [IDS.whitePaint]: 'A lawsuit article, forum and complaint aggregator do not establish an adjudicated manufacturing defect, exact paint-code scope, plant causation, coverage rule or repair cost. The row remains unchanged.',
};

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function rewriteProposal(current, card) {
  return fullRecord({ ...current, ...card, make: 'Honda', model: 'Odyssey', trims: [], engines: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, communityRecommendations: [], fixParts: [], humanApproved: false, reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '', reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: card.summary, relatedIssueIds: [] });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Odyssey');
  if (modelRows.length !== 21) throw new Error(`expected 21 Honda Odyssey rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const proposal = card ? rewriteProposal(before, card) : before;
    return { id: current.id, model: current.model, action, reason: card ? card.summary : KEEP_REASONS[current.id], identityRule: card ? 'The indexed issue identity stays on the same ID; only exact Honda/NHTSA scope, mechanism, symptoms and remedy replace unsupported claims.' : 'No content or publication-state changes; partial, generic, secondary or overlapping evidence cannot replace this indexed issue.', commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit', changedFields: diffFields(before, proposal), evidence: card ? card.citations.map((item) => ({ kind: 'manufacturer-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, mechanism and remedy.` })) : [], beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const actions = ['rewrite_same_identity', 'keep_published_pending_source'];
  const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length]));
  summary.total = rows.length;
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Honda', model: 'Odyssey',
    completionStatement: 'This packet reconciles all 21 frozen Honda Odyssey rows. Twelve same-identity Honda/NHTSA corrections are proposed; nine rows remain byte-for-byte unchanged pending exact evidence or independent disposition.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.', 'All 21 rows remain published. Nine are byte-for-byte unchanged.', 'An unrelated campaign, bulletin, component or model may never replace the issue named by an existing indexed page.', 'Each rewrite contains zero commerce, zero cost or mileage claims, and empty trim and engine arrays.', 'Independent row-by-row approval is required before a separate guarded apply path may be created.'],
    source: { snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, odysseyRecordCount: modelRows.length },
    observations: [
      { code: 'two-false-campaign-identities-corrected', severity: 'independent-review-required', recordIds: [IDS.nineSpeed, IDS.doorLatch], detail: 'The frozen 9-speed card cites 17-043, which applies to 2014-2017 torque-converter judder; the frozen door card cites 20V027, an airbag-inflator recall. Exact Honda sources 19-124 and 18V795 replace them.' },
      { code: 'seatbelt-campaign-numbers-corrected', severity: 'independent-review-required', recordIds: [IDS.seatbelt], detail: 'The frozen 23V782/23V783 citations do not support Odyssey. Exact campaigns are 23V158 for 2018-2020 front buckles and 17V397 for the 2018 third-row center tongue.' },
      { code: 'transmission-campaign-corrected', severity: 'independent-review-required', recordIds: [IDS.transmission], detail: 'The frozen 99V123 citation does not support the stated Odyssey transmission issue. The exact second-gear safety campaign is 04V176 for 2002-2004 vehicles.' },
      { code: 'fuel-pump-scope-updated', severity: 'independent-review-required', recordIds: [IDS.fuelPump], detail: 'Honda Bulletin 24-022 for recall 23V858 supplies exact VIN-eligible 2018-2023 Odyssey scope and supersedes the frozen mixed campaign references.' },
      { code: 'broad-multi-mechanism-pages-frozen', severity: 'independent-review-required', recordIds: [IDS.acCompressor, IDS.batteryDrain, IDS.engineMount, IDS.blendDoor, IDS.infotainment, IDS.slidingDoor, IDS.timingBelt], detail: 'These rows span many years or mechanisms without one exact primary source. None is rewritten, archived or redirected.' },
      { code: 'partial-spool-valve-evidence-frozen', severity: 'independent-review-required', recordIds: [IDS.spoolValve], detail: 'Honda Bulletin 20-023 verifies the oil-control-valve leak but not the page-defining repeated-alternator-failure consequence. The full row remains unchanged.' },
      { code: 'distinct-2026-rear-camera-recall-not-merged', severity: 'independent-review-required', recordIds: [IDS.backupCamera], detail: 'Recall 26V423 concerns water intrusion into certain 2018-2020 rear cameras and is a distinct mechanism from the existing MOST-network card. It is not merged into this indexed issue.' },
    ],
    mismatchSources: MISMATCH_SOURCES,
    summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { FULL_RECORD_FIELDS, IDS, KEEP_REASONS, MISMATCH_SOURCES, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash, rewriteProposal };
