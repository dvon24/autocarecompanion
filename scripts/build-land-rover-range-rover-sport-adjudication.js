/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./land-rover-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_land-rover-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-land-rover-range-rover-sport-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const IDS = Object.freeze({
  air: 'land-rover-range-rover-sport-air-suspension-2005',
  crank: 'land-rover-range-rover-sport-crankshaft-sensor-2005',
  dpf: 'land-rover-range-rover-sport-dpf-regen-2014',
  epb: 'land-rover-range-rover-sport-epb-actuator-2014',
  rearDiff: 'land-rover-range-rover-sport-rear-diff-leak-2005',
  transfer: 'land-rover-range-rover-sport-transfer-case-2005',
  transmission: 'land-rover-range-rover-sport-zf-valve-body-2014',
  hybrid: 'landrover-rangeroversport-48v-mild-hybrid-battery--2023',
  pivi: 'landrover-rangeroversport-pivi-pro-infotainment-freezing-2023',
  camera: 'landrover-rangeroversport-rearview-camera-360-degree-2023',
  water: 'landrover-rangeroversport-water-intrusion-from-tailgate-2023',
});
const REWRITE_IDS = Object.freeze([IDS.air, IDS.camera, IDS.epb, IDS.hybrid].sort());
const BLOCKER_IDS = Object.freeze([IDS.crank, IDS.dpf, IDS.pivi, IDS.rearDiff, IDS.transfer, IDS.transmission, IDS.water].sort());
const PDF_SOURCES = Object.freeze({
  airCompressor: { url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10116218-9999.pdf', nhtsaDocumentId: '10116218', sha256: 'a5b2d17ceba068f088386b804f46dfea5ed8f34ac4e9f1161adb6b7c8f771fff', bytes: 65857 },
  dpf: { url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10158993-9999.pdf', nhtsaDocumentId: '10158993', sha256: '503cf8c1cb5498c627421ffe546b23ae082a79827c775cbccf85204dbdabcb49', bytes: 61793 },
  hybridRecall: { url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V248-5125.pdf', campaign: '26V248000', sha256: 'c9214169c2ee1fe4a61bd8c050859862a1e5a3ccd5be2f5549e5ae7cd0f440f8', bytes: 649628 },
  water: { url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10231451-0001.pdf', nhtsaDocumentId: '10231451', sha256: 'b9a58110a60775168ae322894a0ca8d94d622fc40d0a351fde2cb27e8ec69c68', bytes: 49066 },
});
const SOURCE_FILES = Object.freeze([
  { period: '1995-1999', path: 'C:/tmp/nhtsa-metro-mfrcomms-1995-2004/1995-1999/MFR_COMMS_RECEIVED_1995-1999.csv', length: 3443097, sha256: '409a86bb7bb37a6313eae9212fb90a5ab45029fdcf2a69d0c0378eab080503db' },
  { period: '2000-2004', path: 'C:/tmp/nhtsa-metro-mfrcomms-1995-2004/2000-2004/MFR_COMMS_RECEIVED_2000-2004.csv', length: 8952754, sha256: '5c755be52d35e060626402ebe6dfcccdf350ae379df5c06b49c71d08497e2264' },
  { period: '2005-2009', path: 'C:/tmp/nhtsa-mfr-2005-2009/MFR_COMMS_RECEIVED_2005-2009.csv', length: 5457880, sha256: '04f72a7bf95530d116b1500c976a9e4d365e1c9a8b0433f58d60dbb36a58679b' },
  { period: '2010-2014', path: 'C:/tmp/MFR_COMMS_RECEIVED_2010-2014/MFR_COMMS_RECEIVED_2010-2014.csv', length: 17332775, sha256: '41e66a9d81a859d469d51c6cdcbc107fc6284c64ed24065ccaf1fe02a52e4387' },
  { period: '2015-2019', path: 'C:/tmp/MFR_COMMS_RECEIVED_2015-2019/MFR_COMMS_RECEIVED_2015-2019.csv', length: 144450847, sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e' },
  { period: '2020-2024', path: 'C:/tmp/MFR_COMMS_RECEIVED_2020-2024/MFR_COMMS_RECEIVED_2020-2024.csv', length: 125521629, sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf' },
  { period: '2025-2026', path: 'C:/tmp/MFR_COMMS_RECEIVED_2025-2026/MFR_COMMS_RECEIVED_2025-2026.csv', length: 77786229, sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c' },
]);
const CANDIDATE_DOCUMENT_COUNTS = Object.freeze({ air: 59, crankExact: 0, dpf: 3, epbFrozen: 9, rearDifferentialPinion: 3, transferActuatorOrChainExact: 0, valveBodyOrMechatronicExact: 0, hybrid48v: 76, piviNewGeneration: 27, camera: 18, water: 30 });
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: ['RANGE ROVER SPORT'],
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 14, '2010-2014': 64, '2015-2019': 1676, '2020-2024': 1109, '2025-2026': 410 },
  totalRows: 3273,
  candidateDocumentCounts: CANDIDATE_DOCUMENT_COUNTS,
  sourceFiles: SOURCE_FILES.map(({ path: _path, ...source }) => source),
});
const CAMPAIGNS = Object.freeze([
  '05V501000','05V502000','06V131000','06V135000','07E047000','08V248000','14V618000','15V042000','15V069000','15V092000','15V093000','15V385000','15V571000','15V600000','16V941000','16V942000','17V154000','17V679000','18V337000','18V625000','19V040000','19V350000','19V390000','19V392000','19V603000','20V325000','20V387000','20V585000','20V586000','20V623000','21V117000','21V635000','21V668000','22V219000','22V523000','23V044000','23V251000','23V324000','23V871000','23V872000','24V023000','24V364000','24V380000','24V450000','24V678000','25V155000','25V514000','25V705000','26V005000','26V097000','26V248000','26V297000',
]);
const MAPPED_CAMPAIGNS = Object.freeze([
  { campaignNumber: '24V678000', recordId: IDS.camera, scope: 'certain 2024 Range Rover Sport vehicles; overheating NFSM may suppress 3D surround/rearview images' },
  { campaignNumber: '26V248000', recordId: IDS.hybrid, scope: 'certain 2019-2024 Range Rover Sport MHEVs; DC-DC converter internal fault may cause loss of 12V charging and drive power' },
]);
const DEFERRED_CAMPAIGNS = Object.freeze(CAMPAIGNS.filter((campaign) => !MAPPED_CAMPAIGNS.some((item) => item.campaignNumber === campaign)));
const RECALL_FILES = Object.freeze([
  { period: 'pre', path: 'C:/tmp/nhtsa-flat-rcl-pre-2010/FLAT_RCL_PRE_2010.txt', rows: 9, length: 83786245, sha256: '71e6e325e2d69d204776fb32d83dad4fd95436a2f7890da54d49622d77a36232' },
  { period: 'post', path: 'C:/tmp/nhtsa-flat-rcl-post-2010/FLAT_RCL_POST_2010.txt', rows: 541, length: 309278972, sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70' },
]);
const RECALL_INVENTORY = Object.freeze({ source: RECALL_DATASET_URL, modelAliases: BULLETIN_INVENTORY.modelAliases, totalRows: 550, uniqueCampaignYearModelRows: 98, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, mappedCampaigns: MAPPED_CAMPAIGNS, deferredCampaigns: DEFERRED_CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ path: _path, ...source }) => source) });
const DOCUMENTS = Object.freeze({
  air: ['10034985','10037628','10043560','10101224','10102127','10105736','10116218','10160439','10162652'],
  crank: [],
  dpf: ['10138760','10158993','10168946'],
  epb: ['10032667','10145926','10146366','10147490','10147488','10147482','10149107','10167318','10182165'],
  rearDiff: ['10106163','10106347','10203408'],
  transfer: ['10101141','10101282','10106254','10116942','10185313','10191297','10214051','10224529'],
  transmission: ['10236697','10103145','10104521','10142563','10169923','10171140','10177159','10200772','10210108'],
  hybrid: ['10219236','10251549','10252754','11006133','11007423','11012408','11028601','11029576','11029598','11029600'],
  pivi: ['10239013','10240206','11006064','11008611','11015288','11017945','11029853','11033428','11034887'],
  camera: ['10248645'],
  water: ['10229591','10229592','10231451','10231452','10231453'],
});

function datasetCitation(title) { return { type: 'nhtsa', title, url: NHTSA_DATASET_URL }; }
function campaignUrl(campaignNumber) { return `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaignNumber}`; }
function contentFor(id) {
  if (id === IDS.air) return {
    description: 'JLR communications document multiple air-suspension conditions across L320 and L494 Range Rover Sport vehicles, including compressor delivery or exhaust-valve faults, compressor campaigns and valve-block diagnostics. They do not support the frozen blanket claim that air-spring leaks, lower ride height or sportier driving causes every compressor and valve-block failure across 2005-2022.',
    solution: 'Record the warning, ride-height behavior and DTCs, then follow the current VIN-specific JLR diagnostic path for leaks, compressor output, delivery or exhaust valves and the applicable valve block. Do not replace a compressor, valve block or air spring, install an AMK conversion, or convert to coils from this page; the documented causes and hardware vary, so no universal retail part is linked.',
    citations: [{ type: 'tsb', title: 'JLR Service Action Q590 — air-suspension compressor', url: PDF_SOURCES.airCompressor.url }, datasetCitation('NHTSA Manufacturer Communications — Range Rover Sport air-suspension inventory')],
    summary: 'Bounded the air-suspension identity to documented JLR conditions and removed the unproven driving-style cause, blanket parts and coil-conversion advice.',
  };
  if (id === IDS.crank) return {
    description: 'The complete JLR communication and recall inventory contains no Range Rover Sport record that identifies a crankshaft-position sensor as the cause of the frozen 2005-2013 hot-stall pattern. Other JLR records document stalling from different causes. Those symptoms cannot be reassigned to this sensor without a matching primary source.',
    solution: 'Treat an engine stall as a safety concern and record the conditions, DTCs, RPM signal and restart behavior for a qualified diagnostic inspection. Do not replace a crankshaft-position sensor or select a Bosch/JLR part from this page; the retrieved primary inventory does not identify one verified retail part for this frozen identity.',
    citations: [datasetCitation('NHTSA Manufacturer Communications — complete Range Rover Sport inventory; no exact crankshaft-position-sensor record')],
    summary: 'Removed the unsupported hot-failure mechanism, sensor prescription, brand recommendation and location claim.',
  };
  if (id === IDS.dpf) return {
    description: 'JLR records document P2002-00 DPF-efficiency concerns on specified 2016-2019 3.0L diesel Range Rover Sport vehicles. The 2017-2019 bulletin says the code is usually not paired with warnings for unsuccessful regeneration and directs leak and related-code diagnosis. It does not establish short-trip driving as the cause across 2014-2022.',
    solution: 'Record the warning and all exhaust or pressure-sensor DTCs, then follow the VIN-specific JLR diagnostic path, including leak checks, before any forced regeneration or DPF replacement. Do not prescribe weekly highway drives, fuel additives or a replacement DPF from this page; no universal retail part is supported for the frozen identity.',
    citations: [{ type: 'tsb', title: 'JLR latest vehicle concern fix — P2002 DPF efficiency below threshold', url: PDF_SOURCES.dpf.url }, datasetCitation('NHTSA Manufacturer Communications — Range Rover Sport DPF records 10138760, 10158993 and 10168946')],
    summary: 'Corrected the unsupported short-trip/regeneration cause and removed highway-drive, additive and premature replacement prescriptions.',
  };
  if (id === IDS.epb) return {
    description: 'JLR communications for specified 2014-2020 Range Rover Sport vehicles document a Park Brake Needs Calibration warning, temporary failure to release, EPB warnings and actuator-stuck DTCs C2005-71, C2006-71, C2007-72 and C2008-72. They do not establish road salt, connector corrosion, motor burnout, auto-hold impact or a universal one-motor-per-caliper failure across 2014-2022.',
    solution: 'Secure the vehicle if the parking brake will not apply or release, record the warning and DTCs, and follow the current VIN-specific JLR EPB diagnostic and calibration procedure. Do not replace an actuator motor or caliper or apply grease from this page; the fault must be isolated first and no universal retail part is linked.',
    citations: [datasetCitation('NHTSA Manufacturer Communications — Range Rover Sport EPB records 10145926, 10147482, 10147490 and 10182165')],
    summary: 'Bounded the EPB identity to exact JLR warnings and DTCs and removed unsupported corrosion, auto-hold and blanket motor-replacement claims.',
  };
  if (id === IDS.rearDiff) return {
    description: 'JLR communications identify differential pinion-oil-seal leaks and newly available seal kits on specified 2014-2016 Range Rover Sport vehicles. They do not establish a rear pinion-seal failure across every 2005-2022 vehicle, or the frozen heat-cycle and driveshaft-vibration cause.',
    solution: 'Identify the exact leak source and differential type, verify the VIN range and follow current JLR seal-replacement, preload and fluid procedures. Do not remove the driveshaft, set preload or select 75W-90 or another fluid from this page; the retrieved records do not identify one universal retail part or specification for the frozen scope.',
    citations: [datasetCitation('NHTSA Manufacturer Communications — differential pinion-seal records 10106163, 10106347 and 10203408')],
    summary: 'Limited the evidence to specified 2014-2016 pinion-seal records and removed the broad cause, procedure and generic fluid prescription.',
  };
  if (id === IDS.transfer) return {
    description: 'The complete JLR inventory documents transfer-case output-flange leaks, judder and high-speed whine on parts of the frozen L320 range, but no record identifies the combined actuator-motor and stretched-chain failure claimed by this page. Later-generation transfer-case pump, clutch and flange records are separate identities.',
    solution: 'Record the exact range-selection fault, DTCs, leak location and noise conditions, then follow the current VIN-specific JLR transfer-case diagnostic path. Do not replace an actuator motor or chain, use IYK500010 fluid on a blanket interval, or order rebuild parts from this page; no verified retail part supports the frozen identity.',
    citations: [datasetCitation('NHTSA Manufacturer Communications — Range Rover Sport transfer-case inventory, including 10214051 and 10224529')],
    summary: 'Removed the unsupported actuator/chain aggregation, damage progression, fluid interval and rebuild recommendation.',
  };
  if (id === IDS.transmission) return {
    description: 'JLR records document harsh shifting and transmission faults from detached filters, software, sensors, leaks and coolant-contaminated fluid on specified Range Rover Sport vehicles. The complete inventory does not identify a ZF 8HP70 valve-body or mechatronic-solenoid wear condition matching the frozen 2014-2022 identity.',
    solution: 'Record the exact shift symptom, DTCs, fluid condition and installed transmission, then use the current VIN-specific JLR diagnostic path. Do not replace or rebuild a valve body, mechatronic unit or solenoid, reset adaptations, or select ZF fluid from this page; the documented causes differ and no verified retail part supports the frozen identity.',
    citations: [datasetCitation('NHTSA Manufacturer Communications — Range Rover Sport transmission records 10236697, 10104521, 10142563, 10200772 and 10210108')],
    summary: 'Removed the unsupported valve-body/mechatronic diagnosis, solenoid-wear progression, fluid and rebuilt-part prescription.',
  };
  if (id === IDS.hybrid) return {
    description: 'NHTSA recall 26V248 identifies an internal DC-DC-converter boost-control microchip fault on certain 2019-2024 Range Rover Sport MHEVs that can stop 12V charging and lead to loss of drive power and exterior lighting. JLR communications also document 2023-2024 DC-DC warnings and 48V charging concerns. The primary evidence does not extend that recall population to 2025 or make the 48V battery, BECM and converter interchangeable causes.',
    solution: 'Check the VIN for recall D126/H575 and current JLR campaigns. If a Stop Safely warning, charging loss, lighting loss or reduced drive occurs, stop in a safe place and contact an authorized repairer. Do not replace a 48V battery, DC-DC converter or control module from this page; the recall remedy is VIN-specific and no universal retail part is linked.',
    citations: [{ type: 'recall', title: 'NHTSA Part 573 report — campaign 26V248 / JLR D126 and H575', url: PDF_SOURCES.hybridRecall.url }, { type: 'recall', title: 'NHTSA campaign API — 26V248000', url: campaignUrl('26V248000') }, datasetCitation('NHTSA Manufacturer Communications — Range Rover Sport 48V/MHEV inventory')],
    summary: 'Bounded the 48V identity to the official DC-DC recall and JLR charging records, added stop-safely guidance and removed indiscriminate component replacement.',
  };
  if (id === IDS.pivi) return {
    description: 'JLR communications for 2023-2025 Range Rover Sport vehicles document specific Pivi update, GPS/clock, app, login, wireless-projection and satellite-radio conditions. They do not establish the frozen aggregation of frequent freezing, black screens, camera dropout, HVAC loss and aging hardware. The 2024 rear-camera recall is a separate NFSM identity.',
    solution: 'Record the exact Pivi symptom, installed software level and any camera or network DTCs, then follow the current VIN-specific JLR software and module workflow. Do not perform repeated hard resets or replace a display, infotainment controller or camera module from this page; no universal retail part is supported for the frozen identity.',
    citations: [datasetCitation('NHTSA Manufacturer Communications — 27 new-generation Range Rover Sport Pivi candidates, including 11006064 and 11008611')],
    summary: 'Separated documented Pivi software conditions from the unsupported freeze/black-screen/camera/HVAC aggregation and removed blanket module replacement.',
  };
  if (id === IDS.camera) return {
    description: 'NHTSA recall 24V678 covers certain 2024 Range Rover Sport vehicles whose Near Field Sensing Module may overheat and suppress 3D surround-camera images, including the rearview image. The retrieved primary record does not establish the same cause for every 2023 or 2025 vehicle, or a universal delayed-image, harness or tailgate-connector failure.',
    solution: 'Check the VIN for JLR recall N927. If the rearview image is unavailable, use direct visual checks and do not rely on the surround-view display until repaired. The recall remedy is dealer replacement of the NFSM on affected vehicles; do not order a camera or module from this page, because no universal retail part is linked.',
    citations: [{ type: 'recall', title: 'NHTSA campaign API — 24V678000 / JLR N927', url: campaignUrl('24V678000') }, datasetCitation('NHTSA Manufacturer Communications — Range Rover Sport camera inventory')],
    summary: 'Anchored the camera identity to recall 24V678/N927 and removed unsupported years, delayed-image and generic harness/module prescriptions.',
  };
  if (id === IDS.water) return {
    description: 'JLR communications for 2023 Range Rover Sport vehicles document water entry around the roof-rail attachment area and roof-panel sealant that can wet the headlining, grab handles or carpet. They do not identify the frozen tailgate/rear-body-seal path or rear-mounted-module damage across 2023-2025. Tailgate-lamp moisture recall 23V871 is a separate exterior-light identity.',
    solution: 'Document where moisture first appears and have the vehicle water-tested using the current VIN-specific JLR body-sealing procedure. Do not replace tailgate weatherstrips, lamp seals, grommets or modules from this page; the retrieved primary record points to a different leak path and identifies no universal retail part.',
    citations: [{ type: 'tsb', title: 'JLR SSM75903 — water leak in cabin/headlining, grab handles or carpet', url: PDF_SOURCES.water.url }, datasetCitation('NHTSA Manufacturer Communications — Range Rover Sport water records 10229591-10229592 and 10231451-10231453')],
    summary: 'Corrected the unsupported tailgate/rear-body leak path to the documented roof-area evidence and removed generic seals and module replacement.',
  };
  throw new Error(`Unexpected Range Rover Sport record ${id}`);
}
function actionFor(id) { return REWRITE_IDS.includes(id) ? 'rewrite_same_identity' : 'targeted_safety_cleanup_pending_source'; }
function proposalFor(row) {
  const proposal = clone(fullRecord(row)); const content = contentFor(row.id);
  proposal.description = content.description; proposal.solution = content.solution; proposal.confidence = REWRITE_IDS.includes(row.id) ? 'high' : 'low';
  proposal.symptoms = []; proposal.affectedSystems = []; proposal.dtcCodes = []; proposal.estimatedCostLow = null; proposal.estimatedCostHigh = null; proposal.typicalMileageLow = null; proposal.typicalMileageHigh = null;
  proposal.citations = content.citations; proposal.communityRecommendations = []; proposal.fixParts = []; proposal.humanApproved = false; proposal.reportCount = 0; proposal.source = 'manual'; proposal.lastReportedByOwners = '';
  proposal.reviewedOn = REVIEW_DATE; proposal.contentUpdatedOn = REVIEW_DATE; proposal.contentUpdateSummary = content.summary; proposal.relatedIssueIds = [];
  return proposal;
}
function evidenceFor(row) {
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} Range Rover Sport manufacturer-communication rows and ${RECALL_INVENTORY.totalRows} recall rows were searched.`;
  const byId = {
    [IDS.air]: [common, `Fifty-nine air-suspension candidates were reviewed; representative exact documents are ${DOCUMENTS.air.join(', ')}.`, 'The records support component-specific compressor and valve conditions, not the frozen universal cause or conversion advice.'],
    [IDS.crank]: [common, 'Zero exact crankshaft-position-sensor records were found for the frozen identity.', 'Other stall records identify different conditions, so symptom overlap cannot establish the sensor diagnosis.'],
    [IDS.dpf]: [common, `Three DPF records were found: ${DOCUMENTS.dpf.join(', ')}.`, 'The primary bulletin says P2002 is usually not paired with unsuccessful-regeneration warnings and does not validate the short-trip cause.'],
    [IDS.epb]: [common, `Nine frozen-scope EPB records were reviewed: ${DOCUMENTS.epb.join(', ')}.`, 'The JLR records support exact stuck-actuator DTCs and release/calibration symptoms, not the frozen corrosion and blanket motor diagnosis.'],
    [IDS.rearDiff]: [common, `Three pinion-seal records were found: ${DOCUMENTS.rearDiff.join(', ')}.`, 'The records apply to specified 2014-2016 vehicles and do not validate the full 2005-2022 cause and service prescription.'],
    [IDS.transfer]: [common, `Transfer-case candidate records included ${DOCUMENTS.transfer.join(', ')}.`, 'No exact JLR record in the complete inventory identifies the frozen actuator-motor plus stretched-chain aggregation.'],
    [IDS.transmission]: [common, `Transmission candidates included ${DOCUMENTS.transmission.join(', ')}.`, 'No exact JLR record identifies frozen ZF 8HP70 valve-body/mechatronic-solenoid wear; documented causes differ.'],
    [IDS.hybrid]: [common, `Seventy-six MHEV/48V candidates were reviewed; representative documents are ${DOCUMENTS.hybrid.join(', ')}.`, 'Recall 26V248 exactly supports DC-DC internal failure and loss-of-drive risk on certain 2019-2024 Range Rover Sport MHEVs.'],
    [IDS.pivi]: [common, `Twenty-seven new-generation Pivi candidates were reviewed; representative records are ${DOCUMENTS.pivi.join(', ')}.`, 'They support specific Pivi software conditions, not the frozen freeze/black-screen/camera/HVAC aggregation.'],
    [IDS.camera]: [common, `Eighteen camera candidates were reviewed; representative communication ${DOCUMENTS.camera[0]} supplements recall 24V678.`, 'Recall 24V678 exactly supports missing 3D/rearview images on certain 2024 vehicles from NFSM overheating.'],
    [IDS.water]: [common, `Thirty water candidates were reviewed; exact 2023 roof/cabin records are ${DOCUMENTS.water.join(', ')}.`, 'The documented roof-area leak path does not validate the frozen tailgate/rear-body-seal identity.'],
  };
  return byId[row.id];
}
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Land Rover' && row.model === 'Range Rover Sport').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(row); return { id: row.id, action: actionFor(row.id), commerceDecision: 'diagnostic-or-recall-remedy-no-universal-retail-part', evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: REVIEW_DATE, make: 'Land Rover', model: 'Range Rover Sport',
    completionStatement: 'All eleven frozen Range Rover Sport records receive complete primary-inventory adjudication: four supported identities receive bounded rewrites and seven unsupported or overbroad identities remain corrective holds while every indexed page identity stays published and unchanged.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Seven rows lack exact primary support for the frozen part, cause or year scope. Independent review is also required for all four bounded rewrites before application.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change or new issue is authorized.',
      'All eleven IDs, titles, categories, indexed year sets, trim sets, engine sets and publication states remain unchanged.',
      'No part is linked without exact component, generation and recall/fitment support; every proposal explicitly states why no universal retail part is offered.',
      'All 3,273 manufacturer-communication rows and all 550 recall rows / 52 campaigns are accounted for; only 24V678 and 26V248 map to frozen identities and the other 50 remain deferred.',
    ],
    source: { snapshotFile: 'data/_land-rover-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'sport-four-identities-bounded', severity: 'exact-rewrite', recordIds: REWRITE_IDS, detail: 'Air-suspension, EPB, 48V/DC-DC and 2024 surround-camera identities have enough primary support for bounded same-title rewrites.' },
      { code: 'sport-seven-identities-held', severity: 'critical-correction', recordIds: BLOCKER_IDS, detail: 'Crank sensor, short-trip DPF, broad rear-differential, transfer-chain/actuator, valve-body/mechatronic, Pivi aggregation and tailgate water-path claims lack exact frozen-scope support.' },
      { code: 'sport-dpf-regeneration-claim-corrected', severity: 'safety-correction', recordIds: [IDS.dpf], detail: 'JLR says P2002 is usually not paired with unsuccessful-regeneration warnings; weekly-drive and additive prescriptions are removed.' },
      { code: 'sport-two-campaign-identities-mapped', severity: 'primary-recall-evidence', recordIds: [IDS.camera, IDS.hybrid], campaignNumbers: MAPPED_CAMPAIGNS.map((item) => item.campaignNumber), detail: '24V678 maps to the 2024 NFSM/camera condition and 26V248 maps to the MHEV DC-DC condition.' },
      { code: 'sport-fifty-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'Fifty separate recall identities remain deferred until the remaining-make audit is complete.' },
      { code: 'sport-no-unverified-commerce', severity: 'commerce-safety', recordIds: rows.map((row) => row.id), detail: 'All guessed parts, brands, fluids, kits and conversion recommendations are removed; no search or guessed deep link is introduced.' },
      { code: 'all-range-rover-sport-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'Every Range Rover Sport ID, title, category, indexed year set, trim set, engine set and publication state remains preserved.' },
    ],
    pdfSources: PDF_SOURCES, manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY, documentIds: DOCUMENTS, mappedCampaigns: MAPPED_CAMPAIGNS, deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { rewrite_same_identity: 4, targeted_safety_cleanup_pending_source: 7, total: 11 }, rows: decisions,
  };
}
if (require.main === module) { const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, CANDIDATE_DOCUMENT_COUNTS, DEFERRED_CAMPAIGNS, DOCUMENTS, IDS, MAPPED_CAMPAIGNS, OUTPUT, PDF_SOURCES, RECALL_FILES, RECALL_INVENTORY, REVIEW_DATE, REWRITE_IDS, SNAPSHOT, SOURCE_FILES, actionFor, buildPacket, contentFor, evidenceFor, proposalFor };
