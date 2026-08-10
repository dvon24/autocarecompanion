/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

const ids = Object.freeze({
  timingChain: 'opel-zafira-1-6-cdti-timing-chain-tensioner-failure-chain-stretch',
  waterPump: 'opel-zafira-1-8-petrol-coolant-leaks-water-pump-failure',
  swirlFlap: 'opel-zafira-1-9-cdti-swirl-flap-linkage-failure',
  blowerFire: 'opel-zafira-b-fire-risk-heater-blower',
  egrCooler: 'opel-zafira-c-1.6-cdti-egr-cooler',
  eps: 'opel-zafira-electric-power-steering-column-unit-failure',
  controlArm: 'opel-zafira-front-suspension-control-arm-bolt-corrosion-breakage',
  nox: 'opel-zafira-nox-sensor-scr-system-failure-euro-6-diesels',
  steeringShaft: 'opel-zafira-steering-column-intermediate-shaft-loose-press-fit',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.blowerFire]);
const reportCountCleanupIds = Object.freeze([]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'], commerceDecision }) {
  return Object.freeze({ description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations, commerceDecision: commerceDecision || 'failure path, equipment, component and VIN fitment remain unresolved; no universal retail part' });
}
function retained({ description, solution, symptoms, systems, evidence, summary, citations, commerceDecision }) {
  return Object.freeze({ description, solution, symptoms, affectedSystems: systems, evidence, conflict: null, summary, citations, commerceDecision });
}

const content = Object.freeze({
  [ids.timingChain]: held({
    description: 'No exact Opel/Vauxhall manufacturer communication or regulator record in the reviewed primary corpus establishes a 2014-2019 Zafira Tourer B16DTH/B16DTE/B16DTL timing-chain-failure population, a typical sub-100,000-mile onset, a missing-tensioner-gasket mechanism or a universal two-to-five-second cold-start signature. Repair-site articles about the engine family do not prove the indexed model-year scope.',
    solution: 'Record cold-start noise duration, oil level and specification, service history, DTCs and measured cam/crank correlation, then localize accessory, valvetrain and timing-drive noise under exact engine-code service information. If timing loss is suspected, stop cranking. Do not buy a chain kit, sprockets, tensioner or engine from this page; failure path, procedure and VIN fitment must be established first.',
    symptoms: ['cold-start noise timed and localized', 'oil and service history recorded', 'cam/crank correlation measured before timing work'], systems: ['1.6 CDTI timing drive', 'chain tensioning and lubrication', 'cam/crank timing control'],
    evidence: ['The complete NHTSA corpus contains zero Opel/Vauxhall Zafira rows.', 'Repair-site engine-family evidence does not establish the frozen Zafira population.', 'No exact source supports the mileage, gasket, labor or shortened oil-interval claims.'], conflict: 'The indexed identity turns engine-family repair articles into a six-year model defect with a specific mechanism, onset and repair policy.', summary: 'Held the unsupported Zafira 1.6 CDTI timing-chain identity and removed mileage, gasket, labor and oil-interval assumptions.',
  }),
  [ids.waterPump]: held({
    description: 'No exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2005-2014 Zafira Z18XER/A18XER water-pump-failure population or the frozen combination of pump seal, plastic pipes, hoses and oil-cooler leakage. A single owner report and generic engine article do not prove frequency, a shared mechanism or the full indexed year range.',
    solution: 'Stop for overheating or rapid coolant loss. Pressure-test the cold cooling system and inspect the pump, thermostat housing, pipes, hoses and oil-cooler area as separate leak paths under exact engine and VIN service information. Verify the timing-belt interval before related work. Do not buy a water pump, belt kit, housing, hose or oil-cooler seal from this page; the leak and fitment must be established first.',
    symptoms: ['coolant loss quantified and pressure-tested', 'pump and other leak paths separated', 'belt interval verified by engine and VIN'], systems: ['1.8 petrol cooling circuit', 'water pump and timing belt', 'thermostat, pipes, hoses and oil cooler'],
    evidence: ['The complete NHTSA corpus contains zero Opel/Vauxhall Zafira rows.', 'The frozen citations are secondary and do not establish a model-wide population.', 'No exact source supports a universal 60,000-mile combined service.'], conflict: 'The indexed identity merges several independent coolant-leak paths and a universal belt/pump interval across ten years.', summary: 'Held the conflated 1.8 coolant identity and replaced parts-first advice with leak localization and VIN-specific service information.',
  }),
  [ids.swirlFlap]: held({
    description: 'No exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2005-2014 Zafira 1.9 CDTI swirl-flap-linkage population, a 90,000-150,000-km onset or engine ingestion. The frozen page relies on an aftermarket repair-kit seller and forum discussion, then combines linkage wear, P2279/P2075, EGR and DPF conditions under one mechanism.',
    solution: 'Record DTCs and commanded versus measured runner position, then inspect linkage, actuator, manifold leakage, EGR flow, intake deposits and DPF state as separate paths under exact engine-code service information. Retain emissions equipment. Do not buy a linkage kit, intake manifold, EGR valve or DPF from this page; the failed path and exact fitment must be established first.',
    symptoms: ['runner command and position compared', 'linkage and manifold leakage separated', 'EGR and DPF paths diagnosed independently'], systems: ['intake runner and swirl-flap linkage', 'runner actuator and position sensing', 'EGR, intake and DPF contributors'],
    evidence: ['The complete NHTSA corpus contains zero Opel/Vauxhall Zafira rows.', 'A parts seller and forum do not prove the frozen population or mileage.', 'P2279 and P2075 do not identify every listed component as one fault.'], conflict: 'The indexed identity converts secondary commerce/community material into a ten-year defect and conflates several emissions paths.', summary: 'Held the unsupported swirl-flap identity and removed mileage, ingestion, delete and automatic repair-kit advice.',
  }),
  [ids.blowerFire]: retained({
    description: 'Official DVSA bulletin NCA/2015/026 covers right-hand-drive Vauxhall Zafira B model years 2005-2014 and states that an overheated heater-fan resistor can create a fire risk if the failed thermal fuse is manipulated or bypassed. Vauxhall then issued a second safety recall, 16-C-050, for Zafira B vehicles with manual air conditioning or without air conditioning, including vehicles already repaired under 15-C-097, because the resistor could degrade under specific circumstances and lead to fire.',
    solution: 'Check the VIN and heating/air-conditioning configuration with Vauxhall and complete every outstanding recall free of charge. The official second-recall repair uses a wax-fuse heater-fan resistor and water deflector and checks the blower motor for replacement. Until that repair, follow the current manufacturer instruction for the exact vehicle; the 2016 letter specifies fan setting 0 or 4 and setting 0 if speed 4 does not operate. Never bypass a thermal fuse. Do not buy or install a resistor, motor or wiring repair from this page; recall status and the authorized remedy are VIN-specific.',
    symptoms: ['VIN and recall completion verified', 'fan-speed loss treated as a recall warning', 'thermal fuse never bypassed'], systems: ['heater fan resistor and thermal fuse', 'blower motor and wiring', 'water deflector and HVAC configuration'],
    evidence: ['DVSA NCA/2015/026 identifies Zafira B MY2005-2014 RHD vehicles and the heater-resistor fire condition.', 'Vauxhall 16-C-050 is explicitly a second recall after 15-C-097 for manual-A/C or no-A/C vehicles.', 'The official remedy is a wax-fuse resistor, water deflector and blower-motor check.'], summary: 'Retained the exact Zafira B blower-fire recall identity and corrected its scope, cause, remedy and interim fan-setting instruction from primary sources.', citations: ['dvsa2015', 'vauxhall2016', 'govZafiraNews', 'vauxhallRecallCheck'], commerceDecision: 'safety-recall remedy is VIN-specific and performed free by an authorized repairer; no universal retail part',
  }),
  [ids.egrCooler]: held({
    description: 'No exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2013-2019 Zafira Tourer B16DTH EGR-cooler-failure population, an 80,000-150,000-km onset or the frozen hydrolock/head-gasket sequence. Similar symptoms on Astra or 2.0 CDTI applications do not prove one Zafira 1.6 CDTI mechanism.',
    solution: 'Stop for overheating, rapid coolant loss or suspected liquid ingestion. Pressure-test the cooling system and inspect EGR cooler, intake, cylinders and other coolant paths under exact engine-code service information before cranking when hydrolock is possible. Retain emissions equipment. Do not buy an EGR cooler, head gasket or engine from this page; the leak path and fitment must be established first.',
    symptoms: ['coolant loss pressure-tested', 'EGR cooler separated from other leak paths', 'hydrolock risk assessed before cranking'], systems: ['1.6 CDTI cooling circuit', 'EGR cooler and intake', 'combustion chambers and emissions controls'],
    evidence: ['The complete NHTSA corpus contains zero Opel/Vauxhall Zafira rows.', 'Cross-model symptom similarity is not exact Zafira evidence.', 'No exact source supports the mileage or automatic head-gasket/hydrolock claims.'], conflict: 'The indexed identity imports cross-model EGR-cooler claims into a seven-year Zafira population with fixed onset and repair cost.', summary: 'Held the unsupported EGR-cooler identity and replaced cross-model, mileage, cost and automatic damage assumptions.',
  }),
  [ids.eps]: held({
    description: 'No exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2005-2014 Zafira B Delphi column-mounted electric-power-steering-unit failure population. The frozen page names C1500 as a torque-position-sensor identifier and rules out hydraulic causes, while Vauxhall specifications describe electro-hydraulic assistance on this generation; the asserted architecture and component identity therefore require exact VIN evidence.',
    solution: 'Treat sudden loss of steering assistance as safety-critical and move out of traffic if control permits. Record warnings and exact codes, verify the installed steering architecture by VIN, then inspect power supply, wiring, pump/assist unit, column and steering gear under current service information. Do not buy a column, sensor, motor or pump from this page; architecture, failed component, coding and fitment must be established first.',
    symptoms: ['installed steering architecture verified', 'warnings and exact codes recorded', 'power supply, wiring and assist hardware separated'], systems: ['steering assistance architecture', 'power supply and control electronics', 'column, pump and steering gear'],
    evidence: ['The complete NHTSA corpus contains zero Opel/Vauxhall Zafira rows.', 'Official Vauxhall specifications identify electro-hydraulic steering for Zafira B.', 'The frozen Delphi column/C1500 identity is not supported by an exact manufacturer source.'], conflict: 'The indexed identity may describe the wrong steering architecture and turns a repair-service page into a ten-year failure population.', summary: 'Held the potentially wrong EPS architecture identity and replaced column-first advice with VIN-specific steering diagnosis.', citations: ['datasets', 'vauxhall2010Brochure'],
  }),
  [ids.controlArm]: held({
    description: 'Secondary recall summaries report a front-control-arm bushing/bolt corrosion campaign across several Stellantis vans, but the reviewed primary corpus does not establish that KBA reference 15411R itself applies to every 2020-2022 Opel Zafira row. Public reports associate 15411R with Peugeot and list separate references for related brands, so the frozen campaign identifier, Opel population and 76,778 count remain unverified.',
    solution: 'Check the VIN with Opel/Vauxhall or the relevant national recall authority and complete any open safety campaign before continued use. Stop driving after a sudden handling change, severe clunk or suspected control-arm movement and arrange recovery. Do not buy control-arm bolts, bushings or arms from this page; campaign status, official remedy and VIN fitment must be established first.',
    symptoms: ['VIN campaign status verified', 'handling change treated as a stop condition', 'official remedy confirmed before parts'], systems: ['front control arm and bushings', 'mounting bolts', 'front-axle directional control'],
    evidence: ['The complete NHTSA corpus contains zero Opel/Vauxhall Zafira rows.', 'Available secondary sources do not prove that KBA 15411R is the Opel campaign reference.', 'The frozen affected count and three-reference grouping lack an accessible exact primary record.'], conflict: 'The indexed identity assigns a Peugeot-associated KBA reference and a multi-brand population to Opel Zafira without exact primary proof.', summary: 'Held the Zafira front-control-arm recall identity pending an exact Opel/KBA campaign record and removed the unverified count/reference mapping.', citations: ['datasets', 'vauxhallRecallCheck'],
  }),
  [ids.nox]: held({
    description: 'No exact Opel/Vauxhall primary source in the reviewed corpus establishes a 2015-2019 Zafira Tourer 1.6/2.0 CDTI NOx-sensor-failure population, an 80,000-km onset or recurrent failure of aftermarket sensors. P20EE, P229F and P118B can involve sensor, wiring, dosing, exhaust leakage, software or SCR-catalyst performance and do not identify one failed component.',
    solution: 'Record exact DTC status and freeze-frame data, then compare upstream/downstream sensor readings, wiring, exhaust integrity, DEF quality/dosing, temperature and SCR efficiency under exact engine-code service information. Retain emissions equipment. Do not buy a NOx sensor, dosing component or SCR catalyst from this page; failed path, sensor position and VIN fitment must be established first.',
    symptoms: ['exact DTC and freeze-frame captured', 'sensor positions and wiring tested', 'DEF dosing and catalyst performance kept separate'], systems: ['NOx sensors and wiring', 'DEF dosing and exhaust integrity', 'SCR catalyst and control software'],
    evidence: ['The complete NHTSA corpus contains zero Opel/Vauxhall Zafira rows.', 'A forum and parts catalog do not establish failure frequency or onset.', 'The listed DTCs do not identify one universal replacement part.'], conflict: 'The indexed identity turns secondary anecdotes into a five-year two-engine sensor defect and a parts-quality prescription.', summary: 'Held the unsupported NOx/SCR identity and replaced mileage and sensor-first advice with measured emissions diagnosis.',
  }),
  [ids.steeringShaft]: held({
    description: 'Secondary recall listings describe Vauxhall campaign R/2010/032 for Zafira vehicles built from 16 November 2009 to 24 March 2010, with a loose press fit at the intermediate-shaft upper yoke. The reviewed primary corpus and accessible official pages do not provide the exact campaign record needed to validate the frozen 2009-2010 indexed population and approximately 8,854-vehicle count.',
    solution: 'Check the VIN directly with Vauxhall or the relevant national recall authority. Treat increasing steering free play or knocking as safety-critical; stop driving if steering response changes and arrange inspection/recovery. If the campaign applies, use the manufacturer recall remedy. Do not buy an intermediate shaft or column from this page; campaign status and VIN fitment must be established first.',
    symptoms: ['VIN campaign status verified', 'free play and knocking inspected promptly', 'steering response change treated as a stop condition'], systems: ['intermediate steering shaft', 'upper joint yoke press fit', 'steering column and gear connection'],
    evidence: ['The complete NHTSA corpus contains zero Opel/Vauxhall Zafira rows.', 'Secondary sources consistently describe R/2010/032 but are not the exact primary campaign record.', 'The frozen affected count is not retained without primary verification.'], conflict: 'The indexed identity and count rely on secondary recall reproductions while the exact regulator/manufacturer record is unavailable.', summary: 'Held the steering-shaft recall identity pending the exact campaign record while preserving the VIN-check and stop-driving safety boundary.', citations: ['datasets', 'vauxhallRecallCheck'],
  }),
});

const pdfSources = Object.freeze({
  dvsa2015: { title: 'DVSA Non-Coded Action Bulletin 7 - NCA/2015/026', type: 'government', url: 'https://assets.publishing.service.gov.uk/media/5a74fdc240f0b6399b2afcce/non-coded-action-bulletin-7.pdf', sha256: 'fa1fcb9d35eb48d1d6ea30e7af11e2a8e655beb27648e874d65c79dd9afce712', pageCount: 9, visuallyReviewedPages: [8] },
  vauxhall2016: { title: 'Vauxhall Zafira B Heating and Ventilation System Recall 16-C-50', type: 'manufacturer', url: 'https://www.vauxhall.co.uk/content/dam/vauxhall/Home/zafira-customer-advice/vauxhall-zafira-b-customer-letter.pdf', sha256: '11bb1be07123ab92d9f4488f92afafeba5967e903cbb376e3fab041d55be0828', pageCount: 2, visuallyReviewedPages: [1, 2] },
  vauxhall2010Brochure: { title: 'Vauxhall Zafira 2010 Models Edition 2', type: 'manufacturer', url: 'https://stage2-www.vauxhall.co.uk/content/dam/vauxhall/Home/PDFs/historical-brochures/discounted-models/zafira/Zafira_March_2010.pdf', sha256: '2aaec0c8c37050f29c61977b2c8976daf7b918cd8b9bfecea41333c51a116dbc', pageCount: 52, visuallyReviewedPages: [48] },
});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  govZafiraNews: { title: 'DVSA: Vauxhall Zafira owners affected by heating and ventilation issue', type: 'government', url: 'https://www.gov.uk/government/news/vauxhall-zafira-owners-affected-by-heating-and-ventilation-issue-what-to-do', contains: 'improper repair to heater blower motor resistors' },
  vauxhallRecallCheck: { title: 'Vauxhall Official Vehicle Recall Check', type: 'manufacturer', url: 'https://www.vauxhall.co.uk/owners/maintenance-and-repair/vehicle-recall-check.html', contains: 'Check safety recall campaigns for MY vehicle' },
});

module.exports = Object.freeze({
  make: 'Opel', model: 'Zafira', slug: 'zafira', reviewDate: '2026-08-10', snapshotFile: 'data/_opel-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-opel-zafira-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds, sourceMakes: ['OPEL', 'VAUXHALL'], modelAliases: ['ZAFIRA', 'ZAFIRA TOURER', 'ZAFIRA C', 'ZAFIRA B', 'ZAFIRA LIFE'],
  searchTerms: ['timing chain', 'water pump', 'swirl flap', 'blower', 'fire', 'EGR cooler', 'power steering', 'control arm', 'NOx', 'SCR', 'steering shaft', 'steering column'], relevantDocumentIds: [], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 }, totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA communication corpus contains zero OPEL or VAUXHALL ZAFIRA variants; exact UK recall evidence is separately cited and the U.S.-corpus limitation is explicit.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete NHTSA flat recall corpus contains zero OPEL or VAUXHALL ZAFIRA variants; exact DVSA/Vauxhall heater-blower evidence is separately verified and other European recall identities remain held.' },
  content,
  requiredProse: [
    { id: ids.timingChain, field: 'description', patterns: ['missing-tensioner-gasket mechanism', 'sub-100,000-mile onset'] },
    { id: ids.waterPump, field: 'solution', patterns: ['separate leak paths', 'Do not buy a water pump'] },
    { id: ids.swirlFlap, field: 'description', patterns: ['aftermarket repair-kit seller', 'P2279/P2075'] },
    { id: ids.blowerFire, field: 'description', patterns: ['NCA/2015/026', '16-C-050', '15-C-097'] },
    { id: ids.blowerFire, field: 'solution', patterns: ['fan setting 0 or 4', 'Never bypass a thermal fuse'] },
    { id: ids.egrCooler, field: 'solution', patterns: ['suspected liquid ingestion', 'Do not buy an EGR cooler'] },
    { id: ids.eps, field: 'description', patterns: ['electro-hydraulic assistance', 'architecture and component identity'] },
    { id: ids.controlArm, field: 'description', patterns: ['15411R itself applies', 'separate references for related brands'] },
    { id: ids.nox, field: 'description', patterns: ['P20EE, P229F and P118B', 'do not identify one failed component'] },
    { id: ids.steeringShaft, field: 'description', patterns: ['16 November 2009 to 24 March 2010', 'approximately 8,854-vehicle count'] },
  ],
  observations: [
    { code: 'one-exact-recall-eight-holds', severity: 'identity-safety', recordIds: allIds, detail: 'Only the heater-blower fire recall has exact primary support; eight broader or secondary-source identities remain published and held.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero OPEL/VAUXHALL ZAFIRA rows; exact UK evidence is cited separately and absence is not treated as disproof.' },
    { code: 'blower-recall-primary-supported', severity: 'source-integrity', recordIds: [ids.blowerFire], detail: 'DVSA NCA/2015/026 and Vauxhall 16-C-050 support the frozen recall identity and MY2005-2014 RHD boundary.' },
    { code: 'blower-remedy-corrected', severity: 'safety-accuracy', recordIds: [ids.blowerFire], detail: 'The proposal uses the official wax-fuse resistor, water deflector, blower check and interim setting 0-or-4 instruction.' },
    { code: 'timing-chain-claims-bounded', severity: 'technical-accuracy', recordIds: [ids.timingChain], detail: 'Mileage, gasket, labor and shortened oil-interval claims lack exact Zafira evidence.' },
    { code: 'coolant-paths-separated', severity: 'technical-accuracy', recordIds: [ids.waterPump], detail: 'Pump, housing, pipes, hoses and oil-cooler paths are not treated as one failure.' },
    { code: 'swirl-commerce-source-rejected', severity: 'source-integrity', recordIds: [ids.swirlFlap], detail: 'A repair-kit seller and forum do not establish a ten-year defect population.' },
    { code: 'egr-cross-model-transfer-bounded', severity: 'technical-accuracy', recordIds: [ids.egrCooler], detail: 'Astra and 2.0 CDTI similarity does not prove the Zafira 1.6 identity.' },
    { code: 'eps-architecture-conflict', severity: 'technical-accuracy', recordIds: [ids.eps], detail: 'The frozen Delphi column identity conflicts with official electro-hydraulic Zafira B specifications and needs VIN proof.' },
    { code: 'kba-reference-unverified', severity: 'source-integrity', recordIds: [ids.controlArm], detail: 'KBA 15411R appears Peugeot-associated; exact Opel reference and count remain unverified.' },
    { code: 'nox-dtc-paths-separated', severity: 'technical-accuracy', recordIds: [ids.nox], detail: 'Sensor, wiring, dosing, exhaust, software and catalyst paths are separated.' },
    { code: 'steering-recall-secondary-only', severity: 'source-integrity', recordIds: [ids.steeringShaft], detail: 'R/2010/032 is consistently reproduced but held without the exact primary campaign record.' },
    { code: 'no-commerce-or-social-proof', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; all pages and indexed identity fields remain preserved.' },
  ],
});
