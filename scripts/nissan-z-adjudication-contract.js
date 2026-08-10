/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  automaticShift: 'nissan-z-9-speed-automatic-harsh-jerky-shifting-acceleration-hesitati',
  heatSoak: 'nissan-z-heat-soak-triggers-timing-pull-power-reduction-high-oil-temp',
  infotainment: 'nissan-z-infotainment-2023',
  parkingPawl: 'nissan-z-parking-pawl-may-not-engage-causing-rollaway-recall-22v-671',
  popUpHood: 'nissan-z-pop-up-engine-hood-may-not-deploy-pedestrian-crash-recalls-2',
  manualTransmission: 'nissan-z-transmission-issues-2023',
  wastegate: 'nissan-z-turbo-wastegate-2023',
  oilPressureSolenoid: 'nissan-z-vr30ddtt-oil-pressure-control-solenoid-failure-leading-to-sp',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.parkingPawl, ids.popUpHood].sort());
const reportCountCleanupIds = Object.freeze([ids.infotainment, ids.manualTransmission, ids.wastegate].sort());
const relevantDocumentIds = Object.freeze([
  '10218979', '10220253', '10220254', '10222872', '10226134', '10227268',
  '10229660', '10231531', '10231535', '10231536', '10231859', '10231862',
  '10231864', '10232652', '10235707', '10237571', '10243708', '11004962',
  '11006968', '11006978', '11014471', '11014472',
]);
const campaigns = Object.freeze(['23V725000', '24V798000']);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'] }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: 'failure path, population and exact VIN/component fitment remain unresolved; no universal retail part',
  });
}
function retained({ description, solution, symptoms, systems, evidence, summary, citations }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict: null, summary, citations,
    commerceDecision: 'recall status and VIN eligibility govern a no-charge dealer remedy; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.automaticShift]: held({
    description: 'The complete Nissan Z communication corpus contains automatic-transmission quality holds and the exact 22V-671 parking-pawl recall, but no Z-specific bulletin establishing hesitation from a stop, deceleration thump, broad low-speed shift shock or a 2023-2025 9-speed failure population. Similar-transmission bulletins for Frontier, Titan or Pathfinder cannot be transferred to the Z without Z applicability. The forum and law-firm citations do not establish one repairable indexed defect.',
    solution: 'Record the driving state, gear, transmission temperature, DTCs and current TCM calibration, and have a Nissan dealer distinguish normal adaptive shift behavior, recall status, software, fluid, valve-body and internal transmission causes. Do not buy fluid, a valve body, a TCM or a transmission from this page; the exact fault, service-information gate and VIN fitment must be established first.',
    symptoms: ['hesitation and shift shock reproduced under defined conditions', 'parking-pawl recall kept separate from shift-quality diagnosis', 'TCM calibration, fluid and internal faults separated'],
    systems: ['9-speed automatic transmission', 'TCM software and adaptive values', 'valve body, fluid and internal clutches'],
    evidence: ['The 49-row Z corpus contains a 2023 automatic-transmission hold and 22V-671 material.', 'No exact Z communication supports the frozen 2023-2025 harsh-shift identity.', 'Other Nissan models using a related transmission do not establish Z applicability.'],
    conflict: 'The indexed page imports defect and remedy claims from other Nissan models and secondary sources into every 2023-2025 automatic Z.',
    summary: 'Held the unsupported automatic shift-quality identity and separated it from the exact parking-pawl recall.',
    citations: ['parkingPawlRecall22V671', 'parkingPawlApi22V671', 'datasets'],
  }),
  [ids.heatSoak]: held({
    description: 'No Nissan communication or recall in the complete Z corpus establishes factory charge-cooler saturation, timing pull, limp mode near 270°F or a 2023-2025 high-oil-temperature defect population. The frozen page relies on forum reports, combines charge-air and engine-oil temperatures, and turns track-use observations into a model-wide defect. It also prescribes multiple aftermarket cooling modifications without an exact diagnosed failure or warranty boundary.',
    solution: 'If power falls during sustained high-load use, record ambient temperature, oil and coolant temperatures, charge-air temperature, boost, ignition correction and DTCs, then compare them with the owner manual and current Nissan service information. Stop if a warning or unsafe temperature occurs. Do not buy an oil cooler, heat exchanger, intercooler or tune from this page; the limiting system, intended use, warranty effect and exact fitment must be established first.',
    symptoms: ['power reduction correlated with measured temperatures', 'oil, coolant and charge-air temperatures kept separate', 'warning state and DTCs documented before modification'],
    systems: ['engine oil and coolant circuits', 'air-to-water charge-air cooling', 'ECM protection and ignition control'],
    evidence: ['No exact heat-soak or oil-temperature communication appears in the 49-row corpus.', 'The frozen 270°F threshold and timing-pull mechanism come from secondary discussion.', 'No primary source supports universal aftermarket cooling hardware as the remedy.'],
    conflict: 'The indexed page converts track-use anecdotes into a three-year defect and prescribes unverified hardware modifications.',
    summary: 'Held the unsupported heat-soak identity and replaced modification advice with measured, system-specific diagnosis.',
  }),
  [ids.infotainment]: held({
    description: 'The exact Z communication 11006978 explains the required reprogram, configuration and VIN-write sequence when an AV control unit is replaced; it does not establish frequent freezing, black screens, backup-camera loss or multiple Z-specific stability updates across 2023-2025. Communication 11006968 says the generic software-update pop-up bulletin is no longer active. The frozen 310-owner total, replacement price and claim of repeated Nissan software releases are unsupported.',
    solution: 'Document the screen state, audio/camera behavior, phone connection, software version and DTCs; confirm battery voltage and reproduce the condition before resetting or replacing hardware. A dealer should use current VIN-specific service information and complete all required programming/configuration steps if an AV control unit is replaced. Do not buy a head unit from this page; hardware-versus-software diagnosis, configuration and exact fitment must be established first.',
    symptoms: ['blank or frozen display reproduced and timed', 'camera, audio, phone and control functions tested separately', 'software version, DTCs and battery state recorded'],
    systems: ['AV control unit and display', 'infotainment software and configuration', 'TCU, camera, audio and vehicle networks'],
    evidence: ['11006978 is replacement-workflow information, not a Z failure bulletin.', '11006968 marks the generic software-update notification bulletin inactive.', 'No exact source supports 310 owners, repeated Z stability releases or universal head-unit replacement.'],
    conflict: 'The indexed page turns replacement instructions into a model-wide failure rate and unsupported software/remedy history.',
    summary: 'Held the unsupported infotainment identity and removed the fabricated 310-owner total, pricing and update claims.',
  }),
  [ids.parkingPawl]: retained({
    description: 'Nissan campaign R22B2 and NHTSA recall 22V-671 exactly cover 232 model-year 2023 Z vehicles equipped with the 9-speed automatic. Resistance between the parking rod and wedge can inhibit parking-pawl engagement, allowing movement after Park is selected with no preceding warning. Nissan directs VIN verification and TCM inspection/reprogramming at no charge; the 6-speed manual is outside this campaign.',
    solution: 'Check the VIN for campaign R22B2/22V-671. Until the recall is completed, select Park fully and apply the parking brake every time. An authorized Nissan dealer must inspect campaign status and, if required, reprogram the TCM free of charge. Do not buy a transmission, parking-pawl component or TCM from this page; campaign and VIN eligibility govern the remedy.',
    symptoms: ['vehicle movement after Park selected', 'no preceding warning documented', 'automatic-transmission and VIN eligibility confirmed'],
    systems: ['parking rod, wedge and parking pawl', '9-speed automatic transmission', 'TCM campaign calibration'],
    evidence: ['R22B2 exactly names 232 MY2023 automatic Z vehicles.', 'The campaign identifies resistance between the parking rod and wedge.', 'The remedy is VIN-gated TCM inspection/reprogramming with parking-brake use until complete.'],
    summary: 'Retained the exact 2023 automatic-Z parking-pawl recall identity and its campaign-specific remedy.',
    citations: ['parkingPawlRecall22V671', 'parkingPawlApi22V671'],
  }),
  [ids.popUpHood]: retained({
    description: 'NHTSA recalls 23V-725/R23C8 and 24V-798/R24B6 exactly support two separate pop-up-hood conditions on certain 2023-2024 Z vehicles. Under 23V-725, left front bumper reinforcement-clip fasteners may be under-torqued and loosen. Under 24V-798, right-side pedestrian-sensor connectors may be reversed in the front bumper harness. Either condition can prevent intended hood activation in a pedestrian collision; neither has a preceding warning.',
    solution: 'Check the VIN for both campaigns. A Nissan dealer re-torques the left bumper-reinforcement fasteners for eligible 23V-725 vehicles and replaces the front bumper harness for eligible 24V-798 vehicles, free of charge. Do not buy fasteners, sensors or a harness from this page; each recall has its own production population and VIN-gated remedy.',
    symptoms: ['no-warning pedestrian-protection condition', 'left fastener and right harness campaigns kept separate', 'both recalls checked independently by VIN'],
    systems: ['left front bumper reinforcement clip and fasteners', 'right pedestrian-detection sensors and front bumper harness', 'pop-up engine hood pedestrian protection'],
    evidence: ['23V-725 exactly covers specified 2023-2024 Z production and left-side fastener torque.', '24V-798 final Part 573 report exactly covers 2023-2024 Z and reversed right-side sensor connectors.', 'The remedies are re-torque versus harness replacement and must not be conflated.'],
    summary: 'Retained the combined two-recall title while preserving each campaign population, cause and remedy separately.',
    citations: ['popUpRecall23V725', 'popUpRecall24V798', 'popUpApi23V725', 'popUpApi24V798'],
  }),
  [ids.manualTransmission]: held({
    description: 'Nissan quality action P2A19 supports second-gear grinding only on 174 specific dealer-inventory model-year 2023 Z vehicles and directs replacement of the 6-speed manual transmission. A later PC950 action addresses difficult fifth-gear engagement caused by shift-lever-plate installation during the P2A19 repair. Neither establishes third- or fourth-gear synchro failure, clutch chatter or premature clutch wear across 2023-2025. The frozen NTB23-012 citation is false: NTB23-012 is a 2022-2023 Pathfinder infotainment software bulletin, not a Z transmission bulletin. A manual Z has no automatic-transmission TCM remedy. The frozen 220-owner total is unsupported.',
    solution: 'Verify whether the VIN was subject to P2A19 or PC950, reproduce the affected gear and inspect clutch release, fluid, linkage/shift-plate alignment and internal transmission condition through current Nissan service information. Do not apply an automatic-transmission TCM update to a manual car. Do not buy a clutch, synchro, shifter or transmission from this page; the exact gear, campaign status and failure path must be established first.',
    symptoms: ['second-gear grind kept separate from fifth-gear plate alignment', 'clutch release and linkage tested before internal repair', 'manual transmission not assigned an automatic TCM remedy'],
    systems: ['6-speed manual transmission and second gear', 'shift lever plate and fifth-gear selection', 'clutch release, fluid and linkage'],
    evidence: ['P2A19 covers 174 specific 2023 dealer-inventory Z vehicles and second-gear grinding.', 'PC950 concerns fifth-gear difficulty after P2A19 shift-plate installation.', 'NTB23-012 is Pathfinder infotainment software, not Z transmission service information.'],
    conflict: 'The indexed page expands a bounded inventory action into a three-year synchro/clutch defect, cites an unrelated bulletin and prescribes an impossible TCM remedy for the manual transmission.',
    summary: 'Held the conflated manual-transmission identity and removed the false NTB23-012 citation, automatic-TCM advice and fabricated 220-owner total.',
    citations: ['manualTransmissionP2A19', 'unrelatedNtb23012', 'datasets'],
  }),
  [ids.wastegate]: held({
    description: 'No Nissan communication or recall in the complete Z corpus establishes VR30DDTT wastegate-actuator play, a 2023-2025 rattle population, progression to turbo failure or a Nissan acknowledgement. The frozen page provides no citation, prices both turbo replacement and external-wastegate conversion, and recommends turbo blankets as a noise remedy without identifying the noise source or boost fault. The frozen 280-owner total is unsupported.',
    solution: 'Localize the noise cold and warm, record boost deviation and DTCs, and inspect exhaust shields, brackets, turbo linkage, actuator command, charge-air leaks and turbo bearing condition before any adjustment or replacement. Do not install blankets or an external-wastegate conversion from this page. Do not buy an actuator or turbocharger here; noise source, boost-control failure and exact turbo/VIN fitment must be established first.',
    symptoms: ['rattle localized before attributing it to a wastegate', 'boost deviation and DTCs recorded', 'heat shields, exhaust hardware and turbo condition separated'],
    systems: ['VR30DDTT turbochargers and wastegate actuators', 'boost control and charge-air system', 'exhaust heat shields and mounting hardware'],
    evidence: ['No wastegate-specific Z communication appears in the 49-row corpus.', 'No primary source supports a three-year failure population or Nissan acknowledgement.', 'No evidence supports blankets or external-wastegate conversion as universal remedies.'],
    conflict: 'The indexed page turns an uncited noise theory into a model-wide turbo defect and promotes unverified modifications.',
    summary: 'Held the unsupported wastegate identity and removed the fabricated 280-owner total, prices and modification advice.',
  }),
  [ids.oilPressureSolenoid]: held({
    description: 'No Nissan communication or recall in the complete Z corpus establishes an oil-pressure-control-solenoid failure population, stuck-open bypass mechanism or causal path to spun rod bearings on 2023-2025 Z vehicles. The frozen evidence is a tuner article plus a forum modification discussion. It asserts no warning, quotes catastrophic replacement costs and recommends preventive deletion or blockage of an engine oil-pressure control device without Nissan authorization.',
    solution: 'If low oil pressure, abnormal engine noise or bearing material is suspected, stop driving and verify oil level, specification, filter, mechanical oil pressure, DTCs and lubrication-system condition through current Nissan service information. Do not delete, block or electrically defeat the oil-pressure-control solenoid from this page. Do not buy a solenoid, pump or engine here; the measured failure path and exact VIN/engine fitment must be established first.',
    symptoms: ['low oil pressure measured rather than inferred', 'oil level, filter, DTCs and bearing evidence recorded', 'control-device modification explicitly prohibited'],
    systems: ['engine oil pump and pressure-control solenoid', 'oil galleries and pressure sensing', 'rod bearings and lubrication system'],
    evidence: ['No oil-pressure-control-solenoid communication appears in the exact Z corpus.', 'The frozen causal chain comes from secondary tuner/forum material.', 'No Nissan source authorizes preventive deletion or blockage.'],
    conflict: 'The indexed page presents an unverified catastrophic mechanism and potentially damaging lubrication-system modification as preventive maintenance.',
    summary: 'Held the unsupported oil-pressure-solenoid identity and removed delete/block-off advice and unverified catastrophe pricing.',
  }),
});

const pdfSources = Object.freeze({
  parkingPawlRecall22V671: {
    title: 'Nissan R22B2 - 2023 Z Parking Pawl Recall 22V-671',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2022/RCMN-22V671-8005.pdf',
    sha256: '46d3be324721ede1dadb5e7db104635ad823061067c7f43e3e6fe495aacb0dd4',
    pageCount: 4,
    visuallyReviewedPages: [1, 2, 3],
  },
  popUpRecall23V725: {
    title: 'NHTSA Part 573 Report 23V-725 - Z Left Bumper Fasteners',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V725-5094.PDF',
    sha256: '50f68931f27dbffcee53278411c2eb689ad7a4aa772056c1b16c21b23bc685bd',
    pageCount: 3,
    visuallyReviewedPages: [1, 2, 3],
  },
  popUpRecall24V798: {
    title: 'NHTSA Final Part 573 Report 24V-798 - Z Reversed Pedestrian Sensor Connectors',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V798-1656.PDF',
    sha256: 'c91b03baa2405a2638bf3575b931ba66d19c0f05bb333e1d74b9410fb6e9be76',
    pageCount: 3,
    visuallyReviewedPages: [1, 2, 3],
  },
  manualTransmissionP2A19: {
    title: 'Nissan P2A19 - 2023 Z Manual Transmission Quality Action',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10231864-0001.pdf',
    sha256: '8f62f9163badf92b79e83b568fd4d45c443124ad8962efd6c4de82ff6aef3ff5',
    pageCount: 61,
    visuallyReviewedPages: [1, 2, 3, 4, 60, 61],
  },
  unrelatedNtb23012: {
    title: 'Nissan NTB23-012 - Pathfinder Infotainment Software Update',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10231861-0001.pdf',
    sha256: '3146c39d162fdae8bc8d8c94894ed0e97e21afc165f914956221be0007b17c24',
    pageCount: 11,
    visuallyReviewedPages: [1, 11],
  },
});

function recallApi(campaign, title, contains = campaign) {
  return Object.freeze({ title, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`, contains });
}
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  parkingPawlApi22V671: recallApi('22V671000', 'NHTSA Recall 22V671000 - 2023 Z Parking Pawl', '2023 Z vehicles: reprogram TCM'),
  popUpApi23V725: recallApi('23V725000', 'NHTSA Recall 23V725000 - Z Pop-Up Hood Fasteners'),
  popUpApi24V798: recallApi('24V798000', 'NHTSA Recall 24V798000 - Z Pedestrian Sensor Harness'),
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Z', slug: 'z', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-z-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['Z'],
  searchTerms: ['transmission', 'shift', 'shifting', 'hesitation', 'jerk', 'parking pawl', 'park', 'rollaway', 'pop-up hood', 'pedestrian', 'bumper', 'sensor', 'infotainment', 'black screen', 'AV control', 'software', 'manual transmission', 'synchro', 'clutch', 'rev matching', 'rev match', 'turbo', 'wastegate', 'rattle', 'oil pressure', 'solenoid', 'rod bearing', 'heat soak', 'oil temperature', 'cooling', 'intercooler', 'engine', 'fire', 'brake', 'steering', 'air bag', 'camera'],
  relevantDocumentIds,
  campaigns,
  pdfSources,
  otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 45, '2025-2026': 4 },
    totalRows: 49,
    relevantRowCount: 22,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 14 },
    totalRows: 14,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The flat model-indexed corpus contains 23V-725 and 24V-798. It omits a separate Z vehicle row for 22V-671 even though the campaign text and exact Nissan R22B2 bulletin include 232 MY2023 automatic Z vehicles; the packet preserves that disclosed dataset limitation and verifies 22V-671 independently.',
  },
  content,
  requiredProse: [
    { id: ids.automaticShift, field: 'description', patterns: ['no Z-specific bulletin', 'Similar-transmission bulletins.*cannot be transferred'] },
    { id: ids.heatSoak, field: 'description', patterns: ['No Nissan communication or recall', 'track-use observations'] },
    { id: ids.infotainment, field: 'description', patterns: ['11006978', 'does not establish frequent freezing', '310-owner total'] },
    { id: ids.parkingPawl, field: 'description', patterns: ['232 model-year 2023 Z', 'parking rod and wedge', 'no preceding warning'] },
    { id: ids.popUpHood, field: 'description', patterns: ['23V-725/R23C8 and 24V-798/R24B6', 'two separate'] },
    { id: ids.manualTransmission, field: 'description', patterns: ['174 specific', 'NTB23-012 is a 2022-2023 Pathfinder', 'manual Z has no automatic-transmission TCM'] },
    { id: ids.wastegate, field: 'description', patterns: ['No Nissan communication or recall', '280-owner total'] },
    { id: ids.oilPressureSolenoid, field: 'description', patterns: ['No Nissan communication or recall', 'preventive deletion or blockage'] },
  ],
  observations: [
    { code: 'two-retained-six-held', severity: 'identity-safety', recordIds: allIds, detail: 'Only the exact parking-pawl and two-pop-up-hood recall identities clear the indexed gate; six pages remain published but held.' },
    { code: 'parking-pawl-exact', severity: 'safety-accuracy', recordIds: [ids.parkingPawl], detail: 'R22B2/22V-671 exactly covers 232 MY2023 automatic Z vehicles and a VIN-gated TCM remedy.' },
    { code: 'flat-recall-dataset-omission-disclosed', severity: 'source-integrity', recordIds: [ids.parkingPawl], detail: 'The local flat recall corpus omits a separate Z row for 22V-671; exact campaign text and Nissan R22B2 independently establish Z inclusion.' },
    { code: 'two-pop-up-recalls-separated', severity: 'safety-accuracy', recordIds: [ids.popUpHood], detail: '23V-725 concerns left fastener torque; 24V-798 concerns reversed right sensor connectors and harness replacement.' },
    { code: 'automatic-shift-transfer-invalid', severity: 'technical-accuracy', recordIds: [ids.automaticShift], detail: 'Frontier/Titan/Pathfinder shift bulletins cannot establish a Z-specific 2023-2025 harsh-shift identity.' },
    { code: 'manual-action-overextended', severity: 'technical-accuracy', recordIds: [ids.manualTransmission], detail: 'P2A19 is limited to 174 inventory vehicles, MY2023 and second-gear grind; it does not prove 2023-2025 synchro/clutch failure.' },
    { code: 'ntb23-012-false-citation', severity: 'source-integrity', recordIds: [ids.manualTransmission], detail: 'NTB23-012 is a Pathfinder infotainment bulletin, not Z transmission service information.' },
    { code: 'manual-tcm-advice-impossible', severity: 'safety-accuracy', recordIds: [ids.manualTransmission], detail: 'The frozen solution prescribes an automatic-transmission TCM update for a manual-transmission complaint.' },
    { code: 'infotainment-workflow-not-defect-proof', severity: 'technical-accuracy', recordIds: [ids.infotainment], detail: 'AV-unit replacement programming instructions do not establish frequent Z black-screen failures or multiple Z updates.' },
    { code: 'lubrication-delete-advice-blocked', severity: 'safety-accuracy', recordIds: [ids.oilPressureSolenoid], detail: 'No primary evidence supports preventive deletion/blockage of the engine oil-pressure control device.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Three unsupported owner totals totaling 810 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-z-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Z page is removed, archived, merged, redirected or allowed to lose its frozen indexed identity.' },
  ],
});
