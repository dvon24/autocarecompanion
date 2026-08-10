/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  strutRub: 'pontiac-gto-front-strut-to-tire-rub-destroying-inner-front-tire-sidewall',
  ignitionLock: 'pontiac-gto-ignition-lock-cylinder-housing-binding-key-will-not-turn',
  clusterLcd: 'pontiac-gto-instrument-cluster-lcd-odometer-pixel-display-failure',
  clutchSlave: 'pontiac-gto-internal-clutch-slave-cylinder-throwout-bearing-failure',
  diffMount: 'pontiac-gto-rear-differential-mount-bushing-deterioration-driveline-clun',
  rearShockMount: 'pontiac-gto-rear-shock-upper-mount-bushing-wear-rear-end-clunk',
  rearTireRub: 'pontiac-gto-rear-tire-rub-2005-2006',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);

const content = Object.freeze({
  [ids.strutRub]: Object.freeze({
    description: 'A complete search of 821 exact GTO manufacturer communications found three nearby but different conditions: 10011196 covers a front-suspension knock over low-speed bumps for 2004-2006, 10017367 covers diagnosis of a suspected front control-arm rod-bushing leak or clunk for 2004-2006, and 10020224 covers front-strut oil leakage for 2006. None identifies tire-to-spring-perch or tire-to-strut contact, a 245-width clearance defect, upper-mount/bearing or radius-rod sag, a 10,000-20,000-mile pattern, or the frozen complaint/crash totals. The indexed tire-sidewall identity therefore exceeds the exact primary evidence.',
    solution: 'Treat any inner-sidewall cord exposure, bulge, cut or active rubbing as a tire-safety condition and stop driving until inspected. Verify wheel and tire specification, pressure, ride height, alignment, suspension damage and loaded clearances; separately inspect the strut/spring/perch, upper mount and bearing, front control-arm rod bushing and steering sweep. Do not buy tires, struts, upper mounts, bearings, radius-rod bushings or eccentric bolts from this page; the contact point, geometry, part number and VIN fitment must be established first.',
    symptoms: ['inner front sidewalls inspected safely', 'wheel and tire specification verified', 'ride height and alignment measured', 'contact point and suspension path identified'],
    affectedSystems: ['front tire inner sidewall', 'strut, spring perch and upper mounting', 'front control-arm rod bushing and alignment geometry'],
    evidence: ['Record 10011196 supports a 2004-2006 front-suspension knock, not tire rub.', 'Record 10017367 supports control-arm rod-bushing diagnosis, not universal replacement.', 'Record 10020224 supports a 2006 strut-oil-leak condition, not sidewall contact.'],
    conflict: 'The indexed identity converts separate suspension communications and complaint narratives into a three-year tire-clearance mechanism, mileage range and parts recipe that no exact primary source states.',
    summary: 'Held the unsupported tire-to-strut mechanism and restored tire-safety, geometry and contact-point diagnosis.',
    citations: ['gto2004', 'gto2006', 'datasets'],
    commerceDecision: 'wheel/tire specification, contact point, suspension geometry, failed component, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.ignitionLock]: Object.freeze({
    description: 'No exact GTO manufacturer communication in the complete 821-row corpus identifies a 2004-2006 ignition-lock housing, locking-pin ramp, revised material/profile or reusable-barrel repair. The close records are different identities: 10005537 is a 2004 replacement-key cutting procedure, 10005390 is theft-deterrent communication diagnosis, 10006415 is an LS1 no-start condition, and 10011241 is a 2004 front-door lock condition. Complaint and aftermarket narratives cannot establish one housing mechanism or revised GM part for all three years.',
    solution: 'Secure the vehicle and do not force the key. Separate a key-cut/wear issue, steering-column load, ignition cylinder or housing binding, theft-deterrent authorization, electrical switch, battery/starting and transmission interlock path using the exact service procedure. Do not press or modify the barrel based on this page. Do not buy a cylinder, housing, key, switch or tumbler kit from this page; the failed path, coding requirement, part number and VIN fitment must be established first.',
    symptoms: ['key condition and cut checked', 'steering-column load separated from cylinder binding', 'theft-deterrent and starting paths tested', 'housing, cylinder, switch and interlock paths distinguished'],
    affectedSystems: ['ignition key, cylinder and housing', 'steering-column lock load', 'theft-deterrent, starting and interlock circuits'],
    evidence: ['The complete exact corpus contains no ignition-housing/ramp communication for 2004-2006 GTO.', 'Record 10005537 concerns key cutting only.', 'Records 10005390, 10006415 and 10011241 concern different theft-deterrent, no-start and door-lock identities.'],
    conflict: 'The indexed identity asserts a worn ramp, revised housing and no-recoding remedy without an exact GM or regulator source.',
    summary: 'Held the unsupported ignition-housing mechanism and restored key, column, security, electrical and interlock diagnosis.',
    citations: ['gto2004', 'gto2005', 'gto2006', 'datasets'],
    commerceDecision: 'key/cylinder/housing/security/interlock path, coding requirement, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.clusterLcd]: Object.freeze({
    description: 'Exact GTO communications support bounded instrument-cluster service but not the frozen three-year LCD mechanism. Record 10006437 identifies a horizontal line across the DIC on 2004 vehicles; 10010267 gives a 2004 cluster-replacement procedure; and 10113074/10116536 address odometer programming after cluster replacement for 2004-2006. None proves widespread 2005-2006 pixel loss, a heat-stressed power-supply circuit, cracked solder joints, ribbon-bond degradation or 2006 prevalence.',
    solution: 'Document the exact failed display area and operating conditions, then test cluster power, grounds, connectors, illumination/dimming, network communication and relevant diagnostics before condemning the cluster. If replacement or specialist repair is warranted, follow applicable odometer-disclosure and programming procedures. Do not buy a used cluster, LCD, ribbon, power-supply component or repair service from this page; failure mode, legal mileage handling, part number and VIN fitment must be established first.',
    symptoms: ['failed display area documented', 'power, ground, illumination and communication checked', '2004 horizontal-line condition kept distinct', 'odometer programming and disclosure requirements verified'],
    affectedSystems: ['instrument panel cluster and DIC display', 'cluster power, grounds and communication', 'odometer programming and disclosure'],
    evidence: ['Record 10006437 supports a 2004 horizontal DIC line.', 'Record 10010267 supports a 2004 IPC replacement procedure.', 'Records 10113074 and 10116536 support programming policy, not a pixel-failure mechanism.'],
    conflict: 'The indexed identity projects a 2004 display symptom across 2004-2006 and adds unsupported circuit/ribbon causes and prevalence.',
    summary: 'Held the cross-year LCD mechanism and restored circuit, display and odometer-programming boundaries.',
    citations: ['gto2004', 'gto2006', 'datasets'],
    commerceDecision: 'display failure mode, repair versus replacement path, odometer handling, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.clutchSlave]: Object.freeze({
    description: 'Several exact communications support a bounded 2004 manual-clutch hydraulic/service condition: 10007282 and 10008805 describe pressure-plate bolt torque and a slave-cylinder change, 10008758 describes hard pedal or hydraulic failure after pressure-plate service, 10011218 covers bleeder alignment, 10012125 covers low pedal and incomplete release, and 10012674 covers contaminated reservoir fluid. They do not establish the frozen 2005-2006 scope, GM part 24264183, a plastic bearing-support failure, fluid contamination of the clutch disc, 10,000-mile onset, or universal OEM/billet/remote-bleeder recommendations.',
    solution: 'Confirm manual-transmission equipment and reproduce the pedal/release condition. Inspect fluid condition and leakage; test master cylinder, line/restriction, bleeder setup, concentric slave/release bearing, pressure plate, clutch disc and mechanical release before transmission removal or parts selection. Follow the exact service procedure and applicable pressure-plate/slave revision. Do not buy a slave cylinder, release bearing, clutch, billet support or remote bleeder from this page; model year, failed path, part number and VIN fitment must be established first.',
    symptoms: ['manual-transmission equipment verified', 'pedal and release condition reproduced', 'fluid, master, line and slave paths tested', 'pressure-plate and clutch damage assessed separately'],
    affectedSystems: ['clutch hydraulic master, line and bleeder', 'concentric slave cylinder and release bearing', 'pressure plate, clutch disc and manual transmission'],
    evidence: ['Records 10007282 and 10008805 support a 2004 slave-cylinder/pressure-plate service change.', 'Records 10008758 and 10012125 support bounded 2004 hydraulic/pedal symptoms.', 'No exact row proves the frozen 2005-2006 mechanism, part number or mileage claim.'],
    conflict: 'The indexed identity extends 2004 service evidence through 2006 and adds an unsupported plastic-support mechanism, early-failure rate and parts package.',
    summary: 'Held the cross-year slave/bearing mechanism and restored hydraulic, pressure-plate and clutch diagnosis.',
    citations: ['gto2004', 'gto2005', 'gto2006', 'datasets'],
    commerceDecision: 'model year, hydraulic/release/clutch path, transmission-removal need, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.diffMount]: Object.freeze({
    description: 'The exact rear-knock evidence identifies a different bounded repair. Records 10007831 and 10008656 describe a 2004 rear-suspension clunk or knock under hard acceleration/wheel hop; 10009193 states that bulletin 04-03-09-003 installs two rubber insulators above the rear crossmember. Record 10016710 is a 2004-2006 Dana rear-axle exchange/parts-availability communication, not proof of mount deterioration. No exact row identifies a failed differential-mount bushing across all years, differential rotation, loosened/sheared driveshaft bolts, half-shaft damage or a polyurethane insert remedy.',
    solution: 'Reproduce the clunk safely and inspect the rear crossmember/insulators, differential mounts, fasteners, driveshaft attachments, axle, half-shafts, suspension bushings and exhaust/body contacts. Check service history and use the exact torque and repair procedure for the identified path. Do not buy a differential insert, mount, crossmember bushing, bolt or half-shaft from this page; noise source, damage, part number and VIN fitment must be established first.',
    symptoms: ['clunk operating condition reproduced safely', 'crossmember insulators and mounts inspected separately', 'driveshaft, axle and half-shaft fasteners checked', 'wheel-hop and unrelated contact paths distinguished'],
    affectedSystems: ['rear crossmember and rubber insulators', 'differential mounts and rear axle', 'driveshaft, half-shafts and suspension bushings'],
    evidence: ['Records 10007831 and 10008656 support a 2004 acceleration-related rear knock.', 'Record 10009193 prescribes crossmember insulators, not a differential insert.', 'Record 10016710 is an axle exchange/availability program and does not prove mount failure.'],
    conflict: 'The indexed identity converts a 2004 crossmember-insulator condition into a 2004-2006 differential-mount mechanism and aftermarket remedy.',
    summary: 'Held the unsupported differential-mount identity and restored crossmember, mount, fastener and axle diagnosis.',
    citations: ['gto2004', 'gto2006', 'datasets'],
    commerceDecision: 'rear-noise source, crossmember/differential/fastener path, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.rearShockMount]: Object.freeze({
    description: 'No exact communication in the complete 821-row GTO corpus identifies rear shock upper/pedestal bushing wear, body contact or a three-year rear-clunk pattern. The nearby records are different: 10011196 covers a front-suspension knock over bumps for 2004-2006; 10020224 covers a leaking front strut on 2006; and later generic GM guidance such as 10126308 distinguishes acceptable shock/strut residue from shaft-seal leakage. None proves the frozen rear upper-mount mechanism, commonality, access path, torque cure or Whiteline kit.',
    solution: 'Reproduce and localize the rear noise before disturbing fasteners. Inspect upper and lower shock attachments, bushings, shock condition, rear crossmember/insulators, springs, sway-bar links, exhaust/body contacts, cargo/spare equipment and other suspension joints. Tighten only to the exact service procedure. Do not buy upper bushings, shocks or a kit from this page; the noise source, torque procedure, part number and VIN fitment must be established first.',
    symptoms: ['rear noise reproduced and localized', 'upper and lower shock attachments inspected', 'crossmember, spring, bar and exhaust paths checked', 'seepage distinguished from a failed shock'],
    affectedSystems: ['rear shock upper and lower attachments', 'rear suspension and crossmember', 'springs, stabilizer links and exhaust/body contacts'],
    evidence: ['No exact GTO communication identifies the frozen rear pedestal-bushing mechanism.', 'Record 10011196 concerns the front suspension.', 'Generic shock/strut leakage guidance does not prove a rear upper-mount failure.'],
    conflict: 'The indexed identity promotes forum diagnosis and a retail kit into a three-year manufacturer-level rear-shock defect without exact primary support.',
    summary: 'Held the unsupported rear-shock-mount mechanism and restored full rear-noise localization.',
    citations: ['gto2004', 'gto2005', 'gto2006', 'datasets'],
    commerceDecision: 'rear-noise source, shock/mount/crossmember path, torque procedure, part number and VIN fitment remain unresolved; no universal retail part',
  }),
  [ids.rearTireRub]: Object.freeze({
    description: 'The complete manufacturer-communication and recall inventories contain no exact 2005-2006 GTO rear-tire-to-fender/liner rub condition. Record 10011058 discusses rear-wheel-drive characteristics and winter tires for 2004-2005; later communications address approved tire sizing, bead-seat leaks, radial-force variation and wheel slip, while 10017367 concerns a front control-arm rod bushing. None proves an LS2/Holden-VZ-specific travel defect, passenger/cargo trigger, sidewall cutting or a roll-and-trim remedy.',
    solution: 'Inspect both rear tires and wheel wells for a verified contact witness mark; stop driving if a sidewall is cut, bulged or shows cord. Confirm factory or modified wheel width/offset, tire size, pressure, ride height, alignment, spring/shock condition, suspension travel, load and prior body work before choosing a repair. Fender rolling and liner trimming are irreversible body modifications and are not authorized by this page. Do not buy tires, springs, spacers or body tools from this page; contact point, geometry, part number and VIN fitment must be established first.',
    symptoms: ['rear sidewalls and liners inspected safely', 'contact witness mark verified', 'wheel width, offset and tire size confirmed', 'ride height, alignment, load and modifications documented'],
    affectedSystems: ['rear tire sidewall and wheel specification', 'rear fender lip and inner liner', 'rear suspension travel, ride height and alignment'],
    evidence: ['No exact 2005-2006 GTO communication identifies rear tire rub.', 'Record 10011058 concerns general RWD/winter-tire behavior.', 'Approved-size and tire-service bulletins do not establish a fender-clearance defect.'],
    conflict: 'The indexed identity asserts a model-specific rear-clearance mechanism and irreversible body remedy without an exact manufacturer or regulator source.',
    summary: 'Held the unsupported rear-tire-rub mechanism and restored tire-safety, wheel-offset, load and body-clearance diagnosis.',
    citations: ['gto2005', 'gto2006', 'datasets'],
    commerceDecision: 'contact point, wheel/tire geometry, suspension/load condition, body-work need, part number and VIN fitment remain unresolved; no universal retail part',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL },
  gto2004: { title: 'NHTSA Vehicle Detail — 2004 Pontiac GTO', type: 'nhtsa', url: 'https://www.nhtsa.gov/vehicle/2004/PONTIAC/GTO' },
  gto2005: { title: 'NHTSA Vehicle Detail — 2005 Pontiac GTO', type: 'nhtsa', url: 'https://www.nhtsa.gov/vehicle/2005/PONTIAC/GTO' },
  gto2006: { title: 'NHTSA Vehicle Detail — 2006 Pontiac GTO', type: 'nhtsa', url: 'https://www.nhtsa.gov/vehicle/2006/PONTIAC/GTO' },
});

module.exports = Object.freeze({
  make: 'Pontiac', model: 'GTO', slug: 'gto', reviewDate: '2026-08-10', snapshotFile: 'data/_pontiac-deeplink-snapshot-2026-08-10.json', outputFile: 'data/known-issue-pontiac-gto-adjudication-2026-08-10.json', ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['PONTIAC'], modelAliases: ['GTO'], searchTerms: ['strut', 'tire', 'sidewall', 'ignition lock', 'lock cylinder', 'instrument cluster', 'odometer', 'LCD', 'display', 'clutch', 'slave cylinder', 'release bearing', 'differential', 'driveline', 'wheel hop', 'rear shock', 'bushing', 'fender'],
  relevantDocumentIds: ['10005390', '10005537', '10006415', '10006437', '10007282', '10007831', '10008656', '10008758', '10008805', '10009193', '10010267', '10011196', '10011218', '10012125', '10012674', '10016710', '10017367', '10020224', '10113074', '10116536', '10126308'],
  campaigns: ['66V032002', '68V009000'],
  pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 44, '2005-2009': 76, '2010-2014': 12, '2015-2019': 538, '2020-2024': 146, '2025-2026': 5 }, totalRows: 821, relevantRowCount: 83, uniqueRelevantCommunications: 83, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The complete corpus contains 821 exact Pontiac GTO rows. It supports bounded 2004 clutch-hydraulic, crossmember-insulator and DIC conditions plus other distinct suspension service paths, but none of the seven frozen identities at its full indexed mechanism and year scope.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 2, post: 0 }, totalRows: 2, campaignCount: 2, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'The two exact GTO recall rows are campaigns 66V032002 and 68V009000 for 1967 and 1968 vehicles; neither applies to the frozen 2004-2006 pages.' },
  content,
  requiredProse: [
    { id: ids.strutRub, field: 'description', patterns: ['10011196', '10017367', '10020224', 'None identifies tire-to-spring-perch'] },
    { id: ids.ignitionLock, field: 'description', patterns: ['No exact GTO manufacturer communication', '10005537', '10005390'] },
    { id: ids.clusterLcd, field: 'description', patterns: ['10006437', '10010267', '10113074', 'None proves widespread 2005-2006'] },
    { id: ids.clutchSlave, field: 'description', patterns: ['10007282', '10008805', '10012125', '2005-2006 scope'] },
    { id: ids.diffMount, field: 'description', patterns: ['10007831', '10009193', 'rubber insulators above the rear crossmember'] },
    { id: ids.rearShockMount, field: 'description', patterns: ['No exact communication', '10011196', '10126308'] },
    { id: ids.rearTireRub, field: 'description', patterns: ['no exact 2005-2006 GTO rear-tire', '10011058', '10017367'] },
  ],
  observations: [
    { code: 'coverage-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 7/7 frozen GTO rows are represented exactly once.' },
    { code: 'seven-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All seven pages remain published and held pending independent identity review.' },
    { code: 'communications-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All 821 exact GTO communications were searched.' },
    { code: 'recall-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'Both exact GTO recall rows were reconciled and are irrelevant 1967-1968 campaigns.' },
    { code: 'front-tire-contact-not-inferred', severity: 'technical-accuracy', recordIds: [ids.strutRub], detail: 'Knock, bushing and strut-leak communications are not converted into tire-to-strut contact.' },
    { code: 'ignition-mechanism-not-inferred', severity: 'technical-accuracy', recordIds: [ids.ignitionLock], detail: 'Key cutting, theft deterrence, no-start and door-lock records remain separate from ignition-housing binding.' },
    { code: 'cluster-symptom-year-bounded', severity: 'source-integrity', recordIds: [ids.clusterLcd], detail: 'The 2004 horizontal-DIC-line record is not projected through 2006 as one LCD circuit failure.' },
    { code: 'clutch-evidence-year-bounded', severity: 'source-integrity', recordIds: [ids.clutchSlave], detail: 'The 2004 slave/pressure-plate communications are not projected through 2006.' },
    { code: 'crossmember-not-differential-mount', severity: 'technical-accuracy', recordIds: [ids.diffMount], detail: 'The exact 2004 rubber-insulator remedy stays distinct from differential-mount failure.' },
    { code: 'rear-shock-mount-not-inferred', severity: 'technical-accuracy', recordIds: [ids.rearShockMount], detail: 'Front-suspension and generic leakage guidance do not establish a rear pedestal-bushing defect.' },
    { code: 'rear-tire-rub-not-inferred', severity: 'technical-accuracy', recordIds: [ids.rearTireRub], detail: 'General tire and front-bushing communications do not establish rear-fender contact.' },
    { code: 'irreversible-body-work-not-prescribed', severity: 'consumer-accuracy', recordIds: [ids.rearTireRub], detail: 'Fender rolling and liner trimming are not prescribed without exact diagnosis.' },
    { code: 'complaint-totals-rejected', severity: 'source-integrity', recordIds: [ids.strutRub], detail: 'Complaint API totals are not converted into exact defect frequency, crash or owner counts.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No buy link, fixParts record or recommendation is introduced.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'Unknown owner counts remain zero and never render as 0+ owners.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Title, model, years, trims, engines, category, severity, status and routing remain frozen.' },
  ],
});
