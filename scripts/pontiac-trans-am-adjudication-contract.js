/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  transmission: 'pontiac-trans-am-4l60e-automatic-transmission-3-4-clutch-pack-failure',
  piston: 'pontiac-trans-am-early-ls1-piston-slap-high-oil-consumption',
  optispark: 'pontiac-trans-am-lt1-optispark-distributor-failure-from-moisture-ozone-contam',
  waterPump: 'pontiac-trans-am-lt1-water-pump-failure-weep-hole-coolant-leak-onto-optispark',
  headlight: 'pontiac-trans-am-pop-up-headlight-motor-nylon-gear-stripping',
  ttop: 'pontiac-trans-am-t-top-roof-weatherstrip-leaks',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);

const content = Object.freeze({
  [ids.transmission]: Object.freeze({
    description: 'The frozen page asserts a prevalent 3-4 clutch-pack failure across 1994-1999 Trans Am 4L60E units and prescribes named performance rebuild parts. Exact Firebird/Trans Am communications are narrower and later: 619765 investigates 2-4 band or 3-4 clutch damage on 2001 4L60E; 628934 and 10005162 cover no third/fourth or loss of drive on 1999-2002; 10005476 covers a 2002 slip with possible band/clutch damage; and 10112523 concerns leakage after input-housing replacement on 1999-2002. They do not prove every frozen year, high-mileage or modified-car prevalence, a single spring/checkball/backing-plate cause, or one rebuild recipe.',
    solution: 'Identify the transmission by VIN/RPO and reproduce the exact gear, temperature, load and shift condition. Scan supported codes, inspect fluid and debris, verify commanded and actual gear, line pressure and electrical inputs, then separate converter/valve-body, servo/band, 3-4 clutch, hydraulic-leak and hard-part paths under the year-specific procedure. Do not buy a clutch pack, backing plate, valve-body kit, cooler or replacement transmission from this page; unit identity, failed path, calibration, part number and VIN fitment must be established first.',
    symptoms: ['transmission identity and RPO confirmed', 'affected gear and operating condition reproduced', 'fluid, debris, pressure and electrical inputs checked', 'band, clutch, valve-body, converter and hard-part paths separated'],
    affectedSystems: ['4L60E hydraulic and electronic controls', '2-4 band and 3-4 clutch circuits', 'converter, valve body, input housing and hard parts'],
    evidence: ['Records 619765, 628934, 10005162 and 10005476 support bounded late 4L60E conditions.', 'Record 10112523 concerns a post-repair input-housing leak path, not baseline prevalence.', 'No exact source supports the full 1994-1999 population or the named universal rebuild parts.'],
    conflict: 'The indexed identity turns bounded late-year transmission communications and aftermarket advice into a six-year 3-4 clutch weak point.',
    summary: 'Held the overbroad 4L60E clutch identity and restored RPO-, pressure-, code- and failure-path diagnosis.',
    citations: ['firebird1999', 'datasets'],
    commerceDecision: 'transmission RPO, hydraulic or electronic failure path, calibration, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.piston]: Object.freeze({
    description: 'Records 627622 and 634829 support higher-than-expected oil consumption on 1999-2001 Firebird, overlapping only the frozen 1999 year. Later versions 10112116, 10112331, 10114831, 10137727, 10144451 and 10190437 direct inspection for cylinder scoring, out-of-round bores, dirt intrusion and related damage on 2000-2002. No exact source in the 510-row corpus establishes 1998-1999 piston slap as the same defect, the frozen sleeve-expansion mechanism, 400-600 miles per quart, harmlessness, hard-driving prevalence, updated ring composition, a ring job or short-block replacement for every case.',
    solution: 'Separate a brief cold noise from measurable oil consumption. Record oil level and distance under the applicable consumption-test procedure, inspect external leaks and crankcase ventilation, verify oil grade, and evaluate combustion, cylinder leakage, bore condition and other noise sources before internal repair. Do not buy pistons, rings, bearings, a short block or oil additives from this page; the noise source, measured consumption, engine condition, part number and VIN fitment must be established first.',
    symptoms: ['cold noise duration and warm behavior recorded', 'oil consumption measured over a controlled interval', 'external leaks and ventilation checked', 'combustion, leakage and bore condition tested before teardown'],
    affectedSystems: ['LS1 pistons, rings and cylinder bores', 'crankcase ventilation and external oil paths', 'engine lubrication and combustion sealing'],
    evidence: ['Records 627622 and 634829 support 1999-2001 oil-consumption guidance.', 'Later bore-inspection communications apply to 2000-2002 and do not prove the frozen 1998 scope.', 'No exact communication merges cold piston noise and consumption into the frozen two-year mechanism and remedy.'],
    conflict: 'The indexed title combines a partly supported 1999 oil-consumption condition with unsupported two-year piston-slap causation and engine-rebuild advice.',
    summary: 'Held the combined piston-slap/oil-consumption identity and restored measured consumption, leak and engine-condition diagnosis.',
    citations: ['firebird1999', 'datasets'],
    commerceDecision: 'noise source, measured consumption, bore or ring condition, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.optispark]: Object.freeze({
    description: 'The complete 510-row Firebird/Trans Am communications search found no 1993-1997 LT1 Optispark or distributor condition. The frozen page converts community reputation into a five-year moisture/ozone failure population, says early non-vented units are worst, lists legacy numeric codes, and prescribes a vented distributor, water pump, weep hose and plug wires together. Other no-start, misfire, moisture and cooling communications concern different years or systems and cannot establish that identity.',
    solution: 'Confirm the LT1 engine and distributor generation, reproduce the wet/dry or temperature condition, capture supported codes and misfire data, and test spark, injector operation, fuel pressure, coil/module supply, reference signals, distributor output and wiring under the exact procedure. Inspect the water pump and front-engine area independently for leakage. Do not buy an Optispark distributor, water pump, vent kit, plug wires or ignition parts from this page; the failed path, leak source, part number and VIN fitment must be established first.',
    symptoms: ['LT1 engine and distributor generation confirmed', 'spark, fuel and reference signals tested', 'wet or temperature condition reproduced without assumption', 'water-pump leakage diagnosed separately'],
    affectedSystems: ['LT1 distributor and optical reference path', 'coil, ignition module, injectors and fuel supply', 'water pump and front-engine leak paths'],
    evidence: ['No exact Firebird/Trans Am communication matched an Optispark or distributor failure identity.', 'Adjacent misfire, no-start and moisture communications concern different years or systems.', 'Universal causation, legacy code list, paired replacement and vented-unit advice lack exact primary support.'],
    conflict: 'The indexed page converts community discussion into a five-year universal Optispark/moisture condition and bundled-parts prescription.',
    summary: 'Held the unsupported Optispark identity and restored engine-, signal- and leak-path diagnosis.',
    citations: ['firebird1994', 'datasets'],
    commerceDecision: 'distributor generation, ignition or fuel failure path, leak source, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.waterPump]: Object.freeze({
    description: 'The complete Firebird/Trans Am corpus contains no exact 1993-1997 LT1 water-pump shaft-bearing/seal condition or communication proving that the weep hole directs coolant onto the Optispark. The frozen page adds a typical 80,000-145,000-mile range, repeated warranty replacements, paired pump/distributor replacement, a diverter hose and drive-seal inspection from forum material. Those claims are not established by any exact manufacturer communication or recall.',
    solution: 'If the engine overheats or rapidly loses coolant, stop driving and tow it. Pressure-test the cooling system and cap, identify the highest leak point, inspect the pump vent/weep path, shaft play, hoses, radiator, thermostat, fan operation and front-engine area, and evaluate ignition symptoms separately. Do not buy a water pump, Optispark distributor, diverter kit, thermostat or sealing parts from this page; the leak source, pump condition, distributor exposure, part number and VIN fitment must be established first.',
    symptoms: ['cooling system pressure-tested and leak source traced', 'pump vent path and shaft condition inspected', 'fan, circulation and thermostat paths checked', 'ignition symptoms separated from coolant leakage'],
    affectedSystems: ['LT1 water pump and front-engine cooling paths', 'cooling-system pressure and circulation', 'Optispark and adjacent ignition components'],
    evidence: ['No exact communication matched the frozen LT1 pump/weep-hole identity.', 'No recall establishes a 1993-1997 Trans Am pump population or paired Optispark damage.', 'Mileage, repeated warranty history and bundled replacement advice come from non-primary material.'],
    conflict: 'The indexed identity turns individual wear and forum repair practice into a five-year pump-to-distributor defect population.',
    summary: 'Held the unsupported LT1 pump/Optispark identity and restored leak-source, overheat and ignition-separation diagnosis.',
    citations: ['firebird1994', 'datasets'],
    commerceDecision: 'coolant leak source, pump condition, distributor exposure, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.headlight]: Object.freeze({
    description: 'The complete exact-model corpus found no 1993-1999 pop-up-headlight motor or nylon-gear communication. Records 629625, 10232136 and 10249011 concern sealed-beam condensation, exterior-lamp water guidance or general lamp damage, not the door actuator. They cannot prove a when-not-if nylon-gear failure, loose-housing cause, motor-versus-gear diagnosis, two-motor rebuild, metal-gear fitment or a safe 180-degree gear rotation.',
    solution: 'Treat a lamp that will not expose at night as a visibility hazard and use only the owner-manual emergency/manual procedure. Separate lamp illumination from door movement; verify the failed side, fuses, switch command, relay/module operation, power, ground, wiring, linkage, binding and the exact actuator/motor design before opening it. Do not buy a gear kit, motor or module from this page and do not rotate an internal gear without the exact service procedure; the failed mechanism, part number and VIN fitment must be established first.',
    symptoms: ['lamp illumination separated from door movement', 'failed side and mechanism identified', 'power, ground, command and linkage checked', 'manual emergency procedure followed safely'],
    affectedSystems: ['headlamp door actuator and gear mechanism', 'switch, relay/module, power and grounds', 'door linkage, stops and lamp visibility'],
    evidence: ['No exact communication matched the pop-up-headlight motor/gear identity.', 'Records 629625, 10232136 and 10249011 concern other exterior-lamp conditions.', 'The when-not-if, metal-kit and rotate-180-degrees claims lack exact primary support.'],
    conflict: 'The indexed page turns vendor/community repair material into a seven-year universal nylon-gear failure and DIY prescription.',
    summary: 'Held the unsupported headlamp-gear identity and restored electrical, linkage and visibility-safe diagnosis.',
    citations: ['firebird1999', 'datasets'],
    commerceDecision: 'electrical or mechanical failure path, affected side, actuator design, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.ttop]: Object.freeze({
    description: 'Communication 619720 supports only various wind-noise/water-leak conditions on 1998-2001 Firebird; its available summary does not identify T-tops, a U-shaped rear-corner seal or deteriorated weatherstripping as the cause. No exact communication supports the frozen 1990-1999 all-T-top population, near-universal high-mileage failure, wet-shoulder mechanism, floor-pan progression or reproduction-seal remedy. Third- and fourth-generation roof, glass, latch, weatherstrip, drain, windshield, hatch and seam paths cannot be collapsed into one diagnosis.',
    solution: 'Confirm the roof option and reproduce the leak with controlled low-pressure water while protecting electronics and interior. Trace entry from the highest point, checking panel seating, latches, glass adjustment, weatherstrip condition, drains, windshield/header, hatch and body seams before disturbing seals. Use only material-compatible cleaning and sealing procedures. Do not buy weatherstrip, seal kits, adhesive or lubricant from this page; generation, roof configuration, entry path, material, part number and VIN fitment must be established first.',
    symptoms: ['roof option and generation confirmed', 'leak reproduced and traced to the highest entry point', 'panel, glass, weatherstrip, drain and body-seam paths separated', 'interior moisture and electrical exposure assessed'],
    affectedSystems: ['removable roof panels, latches and weatherstrip', 'door glass, windshield/header and hatch sealing', 'drains, body seams and interior electronics'],
    evidence: ['Record 619720 supports only a bounded 1998-2001 generic wind-noise/water-leak condition.', 'Its summary does not identify T-tops or deteriorated weatherstripping as the cause.', 'The ten-year population, near-universal rate, exact seal mechanism and parts remedy lack exact primary support.'],
    conflict: 'The indexed identity turns one bounded generic leak communication and secondary material into a cross-generation T-top weatherstrip defect.',
    summary: 'Held the cross-generation T-top identity and restored roof-option and leak-tracing diagnosis without seal commerce.',
    citations: ['firebird1999', 'datasets'],
    commerceDecision: 'roof generation, configuration, entry path, material compatibility, part number and VIN fitment remain unresolved; no universal retail part',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL },
  firebird1994: { title: 'NHTSA Vehicle Detail — 1994 Pontiac Firebird', type: 'nhtsa', url: 'https://www.nhtsa.gov/vehicle/1994/PONTIAC/FIREBIRD' },
  firebird1999: { title: 'NHTSA Vehicle Detail — 1999 Pontiac Firebird', type: 'nhtsa', url: 'https://www.nhtsa.gov/vehicle/1999/PONTIAC/FIREBIRD' },
});

module.exports = Object.freeze({
  make: 'Pontiac', model: 'Trans Am', slug: 'trans-am', reviewDate: '2026-08-10', snapshotFile: 'data/_pontiac-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-pontiac-trans-am-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PONTIAC'], modelAliases: ['TRANS AM', 'FIREBIRD'], searchTerms: ['3-4 clutch', '4L60E', 'no third', 'loss of drive', 'oil consumption', 'piston slap', 'Optispark', 'distributor', 'water pump', 'weep hole', 'headlight', 'headlamp', 'T-top', 'weatherstrip', 'water leak', 'roof'],
  relevantDocumentIds: ['619720', '619765', '627622', '628934', '629625', '634829', '10005162', '10005476', '10112116', '10112523', '10232136', '10249011'],
  campaigns: ['01V381000', '06E043000', '06E065000', '07E021000', '07E088000', '67V041000', '68V085000', '69V046000', '69V107000', '69V148000', '70V077000', '70V143000', '72V076000', '73V186000', '73V232000', '73V250000', '74V027000', '75V094000', '75V137000', '76V070000', '76V132000', '78V139000', '79V056000', '79V142000', '80V049000', '80V108000', '81V060000', '82V076000', '82V089000', '84V011000', '84V093000', '85V018000', '85V169000', '90V105000', '90V114000', '90V115000', '91V031000', '91V055000', '91V067000', '92V154000', '93V199000', '94V077000', '95V046000', '96V219000', '99V239000'],
  pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 50, '2000-2004': 120, '2005-2009': 13, '2010-2014': 10, '2015-2019': 212, '2020-2024': 102, '2025-2026': 3 }, totalRows: 510, relevantRowCount: 31, uniqueRelevantCommunications: 29, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete corpus contains 510 exact Firebird/Trans Am rows. It supports bounded late-year transmission, oil-consumption and generic leak conditions but none of the six frozen identities at full indexed scope.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 97, post: 0 }, totalRows: 97, campaignCount: 45, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'All 97 exact Firebird/Trans Am recall rows across 45 campaigns were reconciled; none establishes one of the six frozen identities.' },
  content,
  requiredProse: [
    { id: ids.transmission, field: 'description', patterns: ['619765', '628934', '10005162', '10005476', '10112523'] },
    { id: ids.piston, field: 'description', patterns: ['627622', '634829', 'overlapping only the frozen 1999 year', 'No exact source'] },
    { id: ids.optispark, field: 'description', patterns: ['complete 510-row', 'no 1993-1997 LT1 Optispark', 'legacy numeric codes'] },
    { id: ids.waterPump, field: 'description', patterns: ['no exact 1993-1997 LT1 water-pump', '80,000-145,000-mile', 'not established'] },
    { id: ids.headlight, field: 'description', patterns: ['no 1993-1999 pop-up-headlight', '629625', '10232136', '10249011'] },
    { id: ids.ttop, field: 'description', patterns: ['619720', 'does not identify T-tops', '1990-1999 all-T-top population'] },
  ],
  observations: [
    { code: 'coverage-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All six frozen Trans Am rows are represented exactly once.' },
    { code: 'identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All pages remain published and held pending independent identity review.' },
    { code: 'firebird-alias-reconciled', severity: 'source-integrity', recordIds: allIds, detail: 'Both NHTSA TRANS AM and FIREBIRD labels were reconciled because Trans Am is filed under both.' },
    { code: 'communications-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 510 exact Firebird/Trans Am communications were searched.' },
    { code: 'recall-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 97 exact recall rows were reconciled.' },
    { code: 'bounded-evidence-not-expanded', severity: 'technical-accuracy', recordIds: [ids.transmission, ids.piston, ids.ttop], detail: 'Late-year and generic communications are not expanded to each frozen year or mechanism.' },
    { code: 'adjacent-systems-not-failure-proof', severity: 'technical-accuracy', recordIds: [ids.optispark, ids.waterPump, ids.headlight], detail: 'Other ignition, cooling and exterior-lamp records are not converted into the frozen parts failures.' },
    { code: 'unsupported-dtcs-costs-mileage-removed', severity: 'consumer-accuracy', recordIds: allIds, detail: 'The proposals carry no inferred DTC arrays, price ranges or mileage ranges.' },
    { code: 'safety-guidance-preserved', severity: 'consumer-accuracy', recordIds: allIds, detail: 'Overheating and unavailable nighttime headlamps receive explicit stop/tow or visibility guidance.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No buy link, fixParts record or recommendation is introduced.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'Unknown owner counts remain zero and never render as 0+ owners.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Titles, model, years, trims, engines, categories, severities, statuses and routing remain frozen.' },
  ],
});
