/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  aos: 'porsche-boxster-aos-failure-1997',
  boreScoring: 'porsche-boxster-bore-scoring-2005',
  convertibleTop: 'porsche-boxster-convertible-top-hydraulic-1997',
  ims: 'porsche-boxster-ims-bearing-1997',
  imsEndPlay: 'porsche-boxster-intermediate-shaft-bearing-play-2005',
  rms: 'porsche-boxster-rms-oil-leak-1997',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([...allIds]);
function issue(value) { return Object.freeze(value); }

const content = Object.freeze({
  [ids.aos]: issue({
    description: 'Porsche bulletin 05/14 supports a different, bounded Boxster/Cayman oil-separator condition on 2009-2016 sports cars: a high-frequency pulsating engine-compartment noise caused by excessive spring-force tolerance, with replacement controlled by the installed part number. It does not establish diaphragm rupture, rough idle, plug fouling or oil consumption across the frozen 1997-2008 M96 population. The complete 732-row Boxster communications corpus contains no exact source proving that frozen identity or its owner total.',
    solution: 'Record when smoke or noise occurs, verify oil level, measure crankcase pressure, inspect intake plumbing for oil, and check fuel-trim, misfire and cylinder-sealing evidence. Separate crankcase ventilation, overfill, ignition, fueling and internal-engine paths before replacement. Bulletin 05/14 applies only when its model-year, symptom and installed-part criteria match. Do not buy an air-oil separator, hose, spark plugs or an engine part from this page; the oil-entry or vacuum path, failed component, part number and VIN fitment must be established first.',
    symptoms: ['smoke or pulsating-noise timing documented', 'oil level and crankcase pressure checked', 'intake oil, fuel trims and misfires assessed', 'ventilation and internal-engine paths separated'],
    affectedSystems: ['crankcase ventilation and oil separation', 'intake manifold and vacuum control', 'ignition, fueling and cylinder sealing'],
    evidence: ['Bulletin 05/14 is limited to a 2009-2016 pulsating-noise condition and installed part numbers.', 'It does not support the frozen 1997-2008 diaphragm-rupture identity.', 'The frozen owner total is not a manufacturer-report count.'],
    conflict: 'The indexed identity predates and materially differs from the exact Porsche oil-separator bulletin.',
    summary: 'Held the unsupported Boxster AOS identity, removed invented social proof and restored crankcase and engine fault isolation.',
    citations: ['aos2018', 'vehicle1997', 'datasets'],
    commerceDecision: 'smoke or vacuum path, separator condition, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.boreScoring]: issue({
    description: 'The frozen 2005-2012 row combines several M96/M97 engine and model-year configurations, while the complete 732-row Porsche Boxster communications corpus contains no exact bore-scoring condition establishing cylinders 1 and 6, uneven oil distribution, one symptom progression or the full Base/S population. No primary source establishes iron-sleeve replacement, a complete-engine remedy or extended warm-up and short-trip avoidance as a universal prevention rule. The frozen owner total is not a manufacturer-report count.',
    solution: 'For oil consumption, smoke, noise or misfire, confirm the exact engine and maintenance history, document oil use, inspect filters and drained oil, scan misfire data, perform compression and leak-down testing, and borescope all cylinders under a consistent procedure. A Porsche engine specialist should interpret any scoring and separate cylinder, piston, ring, valve, fueling and lubrication paths before repair. Do not buy sleeves, pistons, a short block, a replacement engine or a rebuild service from this page; the engine, damage mechanism, repair dimensions, part number and VIN fitment must be established first.',
    symptoms: ['exact engine and oil-use history confirmed', 'filter and drained oil inspected', 'compression, leak-down and misfire data recorded', 'all cylinders borescoped before repair'],
    affectedSystems: ['cylinder bores, pistons and rings', 'engine lubrication and filtration', 'ignition, fueling and cylinder sealing'],
    evidence: ['No exact communication matches the frozen 2005-2012 bore-scoring identity.', 'No source proves one cylinder pattern and mechanism across every listed engine.', 'No primary source supports one sleeving or replacement-engine remedy for the full population.'],
    conflict: 'The indexed identity universalizes a cylinder pattern, cause and repair across distinct engines without exact primary support.',
    summary: 'Held the unsupported Boxster bore-scoring identity, removed invented social proof and restored engine-specific measurement.',
    citations: ['vehicle2005', 'datasets'],
    commerceDecision: 'engine family, cylinder damage, repair dimensions, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.convertibleTop]: issue({
    description: 'Porsche bulletin 40/22 describes replacement convertible-top mechanisms for 1999-2004 Boxster (986) and 2005-2006 Boxster (987) with drive shafts that may need to be secured before installation. The communications corpus also contains a 2005 convertible-top gear clicking condition and later top-covering, coding and frame conditions. These exact sources do not establish hydraulic rams, lines, a pump, latch cylinders or a five-year hydraulic-fluid interval. They also do not support one hydraulic identity across the frozen 1997-2016 986, 987 and 981 population.',
    solution: 'Confirm the Boxster generation and reproduce the failure while observing warning messages and each stage of top movement. Inspect electrical supply, switches, control coding, transmissions or gears, drive cables or shafts, linkages, frame, latches and covering under the exact model procedure. Keep the 986/987 drive-mechanism evidence separate from later 981 conditions. Do not buy hydraulic cylinders, lines, a pump, convertible-top mechanisms, transmissions, cables or fluid from this page; the generation, drive system, failed component, part number and VIN fitment must be established first.',
    symptoms: ['generation and drive system confirmed', 'top movement and messages recorded by stage', 'electrical, gear, shaft, linkage and frame paths separated', 'covering and latch condition inspected'],
    affectedSystems: ['convertible-top drive mechanisms and shafts', 'motors, transmissions, switches and control coding', 'linkages, frame, latches and fabric covering'],
    evidence: ['Bulletin 40/22 identifies drive-shaft convertible-top mechanisms on bounded 986 and 987 populations.', 'Exact communications do not establish hydraulic rams, lines or a pump as the Boxster-wide drive system.', 'No source supports a five-year hydraulic-fluid interval or one 1997-2016 failure identity.'],
    conflict: 'The indexed title and repair advice assert a hydraulic system across three generations while the exact Porsche evidence identifies distinct mechanical, electrical, covering and coding paths.',
    summary: 'Held the contradicted hydraulic-top identity, removed invented social proof and restored generation-specific roof diagnosis.',
    citations: ['top986', 'top987', 'vehicle2013', 'datasets'],
    commerceDecision: 'Boxster generation, top drive system, failed component, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.ims]: issue({
    description: 'The complete Porsche Boxster manufacturer-communications and recall corpus contains no exact source establishing universal intermediate-shaft-bearing failure across every frozen 1997-2008 Base and S configuration. It does not support the claim that Boxster is the most commonly affected Porsche because of production volume or deferred maintenance, and it does not authorize one ceramic-hybrid product for every listed engine. Engine and bearing configurations are VIN- and build-specific, and the frozen owner total is not a manufacturer-report count.',
    solution: 'Confirm the exact engine, build date, VIN, transmission and documented prior engine or intermediate-shaft work. Review oil-filter and drained-oil debris, oil pressure and noise evidence and have a Porsche engine specialist determine the installed bearing configuration and current Porsche procedure. Do not assume an in-car replacement or combine it automatically with a clutch job. Do not buy an IMS bearing, ceramic retrofit, clutch, flywheel or replacement engine from this page; the installed configuration, condition, approved procedure, part number and VIN fitment must be established first.',
    symptoms: ['engine, build date and VIN confirmed', 'prior engine and IMS work documented', 'filter, drained oil and noise evidence assessed', 'installed bearing configuration verified before repair'],
    affectedSystems: ['intermediate shaft and bearing support', 'camshaft drive chains and engine timing', 'engine lubrication, clutch and flywheel service access'],
    evidence: ['No exact communication or recall matches the full frozen 1997-2008 identity.', 'No primary source supports the Boxster prevalence and deferred-maintenance claims.', 'No exact source authorizes one aftermarket ceramic product for every listed car.'],
    conflict: 'The indexed identity combines an overbroad population, unsupported prevalence story and product-specific remedy.',
    summary: 'Held the overbroad Boxster IMS identity, removed invented social proof and restored VIN and installed-configuration verification.',
    citations: ['vehicle1997', 'datasets'],
    commerceDecision: 'engine and bearing configuration, condition, approved procedure, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.imsEndPlay]: issue({
    description: 'The complete 732-row Porsche Boxster communications corpus contains no exact 2005-2008 intermediate-shaft end-play condition, no 0.10 mm failure threshold and no approved dial-indicator-through-an-inspection-plug procedure. It also does not establish intermittent noise from chain-tension variation or prove that every frozen engine used one especially vulnerable single-row bearing. The frozen owner total is not a manufacturer-report count.',
    solution: 'Confirm the exact engine, build date, VIN, transmission and installed intermediate-shaft configuration before measurement. Record noise and timing evidence, inspect the oil filter and drained oil, and use only the current Porsche engine procedure and specified measurement points. A Porsche engine specialist should determine whether shaft, bearing, timing-drive or another engine path is involved. Do not buy an IMS bearing, dial indicator, inspection plug, timing parts or replacement engine from this page; the configuration, valid measurement method, condition, part number and VIN fitment must be established first.',
    symptoms: ['engine, build date and IMS configuration confirmed', 'noise and timing evidence documented', 'filter and drained oil inspected', 'measurement method and specification verified before use'],
    affectedSystems: ['intermediate shaft and bearing support', 'cam-chain timing and tension control', 'engine lubrication and diagnostic access'],
    evidence: ['No exact communication matches the frozen end-play identity.', 'No primary source establishes the 0.10 mm threshold or inspection-plug procedure.', 'No exact source proves one bearing configuration across every frozen 2005-2008 car.'],
    conflict: 'The indexed identity gives an exact measurement threshold and urgent remedy without an exact Porsche procedure or population.',
    summary: 'Held the unsupported IMS end-play identity, removed invented social proof and restored configuration and procedure verification.',
    citations: ['vehicle2005', 'datasets'],
    commerceDecision: 'IMS configuration, valid measurement method, condition, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.rms]: issue({
    description: 'Porsche communications include a 1997 Boxster crankshaft-seal oil-leak condition, a replacement sealing-ring notice and later PTFE seal handling and measurement procedures. That bounded evidence does not establish rear-main-seal failure across every frozen 1997-2012 M96/M97 engine, oil contamination of every clutch or universal bundling with clutch and IMS work. The source corpus also contains separate cylinder-head and other oil-leak identities, so leak location must be proven. The frozen owner total is not a manufacturer-report count.',
    solution: 'Clean the engine and transmission joint area, verify oil level, and use approved tracing to identify the highest fresh source before transmission removal. Separate crankshaft sealing from cylinder-head, cover, sump, oil-separator and transmission-fluid paths. If a crankshaft seal is confirmed, follow the exact engine and seal installation procedure and inspect clutch contamination separately. Do not buy a rear main seal, clutch, flywheel, IMS bearing or transmission-removal service from this page; the fluid and leak source, engine, procedure, part number and VIN fitment must be established first.',
    symptoms: ['fluid type and oil level confirmed', 'engine and transmission joint cleaned before tracing', 'highest fresh leak source located', 'clutch contamination assessed separately'],
    affectedSystems: ['crankshaft and PTFE seal interface', 'engine covers, cylinder-head and adjacent oil paths', 'clutch, flywheel and transmission bellhousing'],
    evidence: ['Exact communications support a bounded 1997 crankshaft-seal leak and seal-handling procedures.', 'They do not establish a universal 1997-2012 M96/M97 failure population.', 'No source requires automatic clutch and IMS bundling for every confirmed seal leak.'],
    conflict: 'The indexed identity extends bounded seal evidence across 16 years and adds universal clutch/IMS bundling.',
    summary: 'Held the overbroad Boxster RMS identity, removed invented social proof and restored fluid and leak-source tracing.',
    citations: ['literature2019', 'vehicle1997', 'datasets'],
    commerceDecision: 'fluid and leak source, engine-specific seal procedure, part number and VIN fitment remain unresolved; no universal retail part',
  }),
});

const pdfSources = Object.freeze({
  aos2018: { title: 'Porsche 05/14 - Pulsating Noise / Oil Separator', type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10148789-9999.pdf', contains: ['As of 2009 up to 2016', 'Boxster/Cayman (987/981)', 'excessive spring force tolerance'] },
  top986: { title: 'Porsche 40/22 - Boxster 986 Convertible Top Mechanism Rework', type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10209899-0001.pdf', contains: ['Boxster (986)', 'As of 1999 up to 2004', 'drive shaft'] },
  top987: { title: 'Porsche 40/22 - Boxster 987 Convertible Top Mechanism Rework', type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10209898-0001.pdf', contains: ['Boxster (987)', 'As of 2005 up to 2006', 'drive shaft'] },
  literature2019: { title: 'Porsche 1902 - Valid Advanced Technical Information Bulletins', type: 'nhtsa', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10168693-0001.pdf', contains: ['Handling PTFE Crankshaft Seals', '9x6/9x7', 'Crankshaft Measurement'] },
});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL },
  vehicle1997: { title: 'NHTSA Vehicle Detail - 1997 Porsche Boxster', type: 'nhtsa', url: 'https://www.nhtsa.gov/vehicle/1997/PORSCHE/BOXSTER' },
  vehicle2005: { title: 'NHTSA Vehicle Detail - 2005 Porsche Boxster', type: 'nhtsa', url: 'https://www.nhtsa.gov/vehicle/2005/PORSCHE/BOXSTER' },
  vehicle2013: { title: 'NHTSA Vehicle Detail - 2013 Porsche Boxster', type: 'nhtsa', url: 'https://www.nhtsa.gov/vehicle/2013/PORSCHE/BOXSTER' },
});

module.exports = Object.freeze({
  make: 'Porsche', model: 'Boxster', slug: 'boxster', reviewDate: '2026-08-10', snapshotFile: 'data/_porsche-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-porsche-boxster-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PORSCHE'], modelAliases: ['BOXSTER'], searchTerms: ['air oil separator', 'oil separator', 'AOS', 'bore scoring', 'convertible top', 'top mechanism', 'hydraulic', 'IMS', 'intermediate shaft', 'end-play', 'rear main seal', 'crankshaft seal', 'oil leak'],
  relevantDocumentIds: ['10007479', '10008061', '10008757', '10015587', '10017727', '10018051', '10018155', '10028751', '10052188', '10055657', '10109343', '10117473', '10120793', '10143286', '10143510', '10148789', '10169776', '10185133', '10187875', '10189933', '10200881', '10200926', '10209898', '10209899', '10219463', '10238810', '10246366', '11002958', '11011201', '11011572', '11018799', '11021349', '11022825', '11022991', '11023948', '11026342', '601947', '601948', '605773', '616457'],
  campaigns: ['03V004000', '09E012000', '09E025000', '11V409000', '13V502000', '14V698000', '19V533000', '21V157000', '21V200000', '21V679000', '22V656000', '24V343000', '98E005000', '98V112000', '98V113000'],
  pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 11, '2000-2004': 53, '2005-2009': 34, '2010-2014': 16, '2015-2019': 66, '2020-2024': 363, '2025-2026': 189 }, totalRows: 732, relevantRowCount: 40, uniqueRelevantCommunications: 40, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete 732-row exact Porsche Boxster corpus was searched. Forty broad term-matched rows were reviewed, including lexical false positives and unrelated conditions. Exact sources support bounded oil-separator, convertible-top-mechanism and crankshaft-seal procedures, but none of the six frozen identities at full title, population and remedy scope.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 27, post: 26 }, totalRows: 53, campaignCount: 15, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'All 53 exact Porsche Boxster recall rows across 15 campaigns were reconciled. None establishes the six frozen AOS, bore-scoring, hydraulic-top, IMS, IMS-end-play or RMS identities at full scope.' },
  content,
  requiredProse: [
    { id: ids.aos, field: 'description', patterns: ['05/14', '2009-2016', 'does not establish diaphragm'] },
    { id: ids.boreScoring, field: 'description', patterns: ['732-row', 'no exact bore-scoring', 'frozen owner total'] },
    { id: ids.convertibleTop, field: 'description', patterns: ['40/22', 'drive shafts', 'do not establish hydraulic', '1997-2016'] },
    { id: ids.ims, field: 'description', patterns: ['no exact source', 'most commonly affected', 'frozen owner total'] },
    { id: ids.imsEndPlay, field: 'description', patterns: ['no 0.10 mm', 'inspection-plug', 'frozen owner total'] },
    { id: ids.rms, field: 'description', patterns: ['1997', 'PTFE', 'does not establish', 'frozen owner total'] },
  ],
  observations: [
    { code: 'coverage-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All six frozen Porsche Boxster rows are represented exactly once.' },
    { code: 'all-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All six overbroad or contradicted identities remain published holds; none is silently archived, redirected or relabeled.' },
    { code: 'communications-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 732 exact Porsche Boxster communication rows were searched; 40 broad term-matched rows representing 40 unique document IDs were adjudicated, including lexical false positives.' },
    { code: 'recall-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 53 exact recall rows across 15 campaigns were reconciled.' },
    { code: 'convertible-top-hydraulic-identity-rejected', severity: 'technical-accuracy', recordIds: [ids.convertibleTop], detail: 'Exact 986/987 Porsche bulletins identify drive-shaft convertible-top mechanisms; hydraulic rams, a pump and a fluid interval are not inferred across 1997-2016.' },
    { code: 'oil-separator-generation-boundary', severity: 'technical-accuracy', recordIds: [ids.aos], detail: 'The exact 2009-2016 pulsating-noise bulletin is not extrapolated backward into a 1997-2008 diaphragm-rupture population.' },
    { code: 'crankshaft-seal-evidence-bounded', severity: 'technical-accuracy', recordIds: [ids.rms], detail: 'Bounded 1997 seal-leak evidence and PTFE handling procedures are not converted into a universal 1997-2012 failure or clutch/IMS bundle.' },
    { code: 'ims-threshold-rejected', severity: 'technical-accuracy', recordIds: [ids.imsEndPlay], detail: 'No exact Porsche source establishes the frozen 0.10 mm end-play threshold or inspection-plug procedure.' },
    { code: 'invented-owner-counts-zeroed', severity: 'consumer-accuracy', recordIds: reportCountCleanupIds, detail: 'Six unsupported owner totals are proposed as unknown zero and never rendered as 0+ owners.' },
    { code: 'unsupported-dtcs-costs-mileage-removed', severity: 'consumer-accuracy', recordIds: allIds, detail: 'The proposals carry no inferred DTC arrays, prices or mileage ranges.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No buy link, fixParts record or community recommendation is introduced.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Titles, model, years, trims, engines, categories, severities, statuses and routing remain frozen.' },
  ],
});
