/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-mazdaspeed6-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['MAZDASPEED6', 'MAZDASPEED 6', 'MAZDA SPEED6', 'MAZDA SPEED 6']);

const IDS = Object.freeze({
  fuelRing: 'mazda-mazdaspeed6-fuel-pump-mounting-ring-leak-recall',
  hpfp: 'mazda-mazdaspeed6-high-pressure-fuel-pump-cannot-hold-pressure-under-load',
  carbon: 'mazda-mazdaspeed6-intake-valve-carbon-buildup',
  clutch: 'mazda-mazdaspeed6-notchy-manual-transmission-clutch-engagement-problems',
  pcv: 'mazda-mazdaspeed6-pcv-system-failure-causing-oil-consumption-smoking-turbo',
  rearFluid: 'mazda-mazdaspeed6-rear-differential-wear-2006',
  takata: 'mazda-mazdaspeed6-takata-airbag-inflator-recalls',
  turboStarvation: 'mazda-mazdaspeed6-turbo-oil-starvation-2006',
  vvt: 'mazda-mazdaspeed6-vvt-actuator-timing-chain-noise-cold-start',
  diffMount: 'mazda-mazdaspeed6-weak-rear-differential-mount-sheared-mount-bolts',
  rod: 'mazda-speed6-connecting-rod-failure-2006',
  transfer: 'mazda-speed6-transfer-case-failure-2006',
  turboOil: 'mazda-speed6-turbo-oil-leak-2006',
});
const ALL_IDS = Object.freeze(Object.values(IDS).sort());
const RETAIN_IDS = Object.freeze([IDS.fuelRing, IDS.takata].sort());
const BLOCKER_IDS = Object.freeze(ALL_IDS.filter((id) => !RETAIN_IDS.includes(id)));
const IDENTITY_REVIEW_IDS = BLOCKER_IDS;
const FABRICATED_REPORT_COUNT_IDS = Object.freeze([IDS.rod, IDS.transfer, IDS.turboOil].sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10021571', '10028524', '10034634', '10039250', '10039251', '10041267',
  '10043874', '10043875', '10044209', '10085405', '10120381', '10186693',
]);
const CAMPAIGNS = Object.freeze(['17V474000', '18V402000', '19V781000', '21V744000']);

const PDF_SOURCES = Object.freeze({
  fuelRingRecall: {
    title: 'Mazda Part 573 Report: Recall 5121I / NHTSA 21V744 Fuel-Pump Mounting Rings',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V744-1366.PDF',
    localPath: 'C:/tmp/mazda-mazdaspeed6-sources/RCLRPT-21V744-1366.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 215482,
    sha256: '11c3142e7647f38a3f2c3223d05467447a6cc6c2d3561a80763efe16bdea8f6f',
  },
  driverTakata: {
    title: 'Mazda Part 573 Report: Recall 1417G / NHTSA 17V474 Driver Inflator',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2017/RCLRPT-17V474-7530.PDF',
    localPath: 'C:/tmp/mazda-mazdaspeed6-sources/RCLRPT-17V474-7530.pdf',
    pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 218736,
    sha256: 'e114ff37a1129145bf157d34f7ee83afafbb543659ce408d8eb797d6408afb46',
  },
  passengerTakata: {
    title: 'Mazda Part 573 Report: Recall 2618F / NHTSA 18V402 Passenger Inflator',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/rcl/2018/RCLRPT-18V402-4102.PDF',
    localPath: 'C:/tmp/mazda-mazdaspeed6-sources/RCLRPT-18V402-4102.pdf',
    pages: 7, visualPages: [1, 2, 3, 4, 5, 6, 7], bytes: 224724,
    sha256: 'cb37d023d0b4ada1e6997f06960227caa191a19e8bc593e3b47a77813356413f',
  },
  ssp86: {
    title: 'Mazda SSP86: Heavy White Exhaust Smoke Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10043874-3140.pdf',
    localPath: 'C:/tmp/mazda-mazdaspeed6-sources/SB-10043874-3140.pdf',
    pages: 8, visualPages: [1, 2, 3, 4, 5, 6, 7, 8], bytes: 89100,
    sha256: 'c9ca053d62ecdb92254e4583d864563eea24a86d1c296a9ce37a32d47f764de6',
  },
  ssp87: {
    title: 'Mazda SSP87: VVT and Timing-Chain Noise Warranty Extension',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10043875-3697.pdf',
    localPath: 'C:/tmp/mazda-mazdaspeed6-sources/SB-10043875-3697.pdf',
    pages: 7, visualPages: [1, 2, 3, 4, 5, 6, 7], bytes: 93082,
    sha256: 'c49f0e28b55db4dd5fda14ab31e8ead69b1028d44fed689d967abad35fa83cb8',
  },
});
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: NHTSA_DATASET_URL },
  takataDnd: { title: 'NHTSA Consumer Alert: Mazda Takata Do Not Drive Warning', type: 'nhtsa', url: 'https://www.nhtsa.gov/press-releases/consumer-alert-ford-mazda-issue-do-not-drive-warnings-more-457000-vehicles-recalled' },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 7, '2010-2014': 9, '2015-2019': 10, '2020-2024': 14, '2025-2026': 0 },
  totalRows: 40,
  requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  aliases: MODEL_ALIASES,
  periodCounts: { pre: 0, post: 8 },
  totalRows: 8,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.fuelRing]: [PDF_SOURCES.fuelRingRecall],
    [IDS.hpfp]: [OTHER_SOURCES.datasets],
    [IDS.carbon]: [OTHER_SOURCES.datasets],
    [IDS.clutch]: [OTHER_SOURCES.datasets],
    [IDS.pcv]: [PDF_SOURCES.ssp86],
    [IDS.rearFluid]: [OTHER_SOURCES.datasets],
    [IDS.takata]: [PDF_SOURCES.driverTakata, PDF_SOURCES.passengerTakata, OTHER_SOURCES.takataDnd],
    [IDS.turboStarvation]: [OTHER_SOURCES.datasets, PDF_SOURCES.ssp86],
    [IDS.vvt]: [PDF_SOURCES.ssp87],
    [IDS.diffMount]: [OTHER_SOURCES.datasets],
    [IDS.rod]: [OTHER_SOURCES.datasets],
    [IDS.transfer]: [OTHER_SOURCES.datasets],
    [IDS.turboOil]: [OTHER_SOURCES.datasets, PDF_SOURCES.ssp86],
  };
  if (!map[id]) throw new Error(`Unexpected Mazdaspeed6 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.fuelRing]: { confidence: 'high', reportCount: 0,
      description: 'Mazda recall 5121I / NHTSA 21V744 covers certain 2006-2007 Mazdaspeed6 vehicles. Improper installation of a fuel-pump mounting ring can lead to ring cracking and fuel leakage. Fuel odor or fuel beneath the vehicle may be warning signs, and leaked fuel near an ignition source increases fire risk.',
      solution: 'Check the VIN for recall 5121I. Mazda dealers install new fuel-pump mounting rings correctly and perform the remedy free of charge. If fuel odor or visible leakage is present, shut the vehicle off away from ignition sources and arrange service rather than driving it. Do not buy mounting ring BN8F-42-167 or other fuel-tank parts from this page; recall eligibility and the dealer remedy must be confirmed by VIN.',
      symptoms: ['fuel odor', 'fuel visible beneath the vehicle near the tank'], summary: 'Replaced a secondary recall citation with Mazda/NHTSA 21V744 and its exact Mazdaspeed6 cause, warning, fire risk and free remedy.' },
    [IDS.hpfp]: { confidence: 'low', reportCount: 0,
      description: 'The complete reviewed 40-row Mazdaspeed6 communication inventory did not establish recurring high-pressure fuel-pump inability under load, worn upgradeable internals, a spill-valve defect or an Accessport-based pressure threshold. Communication 10041267 provides fuel-pump and pressure-line installation/removal information; it is not evidence of pump failure or a model-wide defect.',
      solution: 'Preserve codes and freeze-frame data, compare commanded and actual fuel pressure with Mazda-compatible diagnostic equipment, and inspect low-pressure supply, electrical control, pressure sensor, lines, injector leakage and the high-pressure pump before selecting a repair. Do not buy HPFP internals, a pump housing, spill valve, relief valve or tuning device from this page; the failed component and stock/modified configuration must be verified first.',
      symptoms: ['loss of power or hesitation under load requires fuel-pressure diagnosis', 'lean or pressure-related codes require exact code review'], summary: 'Removed forum/tuning prescriptions and held an HPFP-failure identity unsupported by Mazda communication 10041267 or the complete inventory.' },
    [IDS.carbon]: { confidence: 'low', reportCount: 0,
      description: 'The complete reviewed inventory did not establish recurring Mazdaspeed6 intake-valve carbon buildup, a 40,000-mile walnut-blasting interval or catch-can/EGR prevention. Communication 10028524 documents carbon inside the electronic throttle body causing unstable idle or rare stalling, which is a different component and condition from intake-valve deposits.',
      solution: 'For unstable idle, stalling, misfire or loss of power, preserve codes and inspect the exact air, throttle, ignition, fuel and compression path before removing the intake manifold. Apply the throttle-body communication only to its stated condition. Do not buy walnut-blasting tools, intake-manifold gaskets, a catch can, PCV parts or EGR modifications from this page; intake-valve buildup has not been established.',
      symptoms: ['unstable idle or rare stalling may require throttle-body diagnosis', 'misfire or power loss requires system-specific diagnosis'], summary: 'Separated Mazda\'s throttle-body carbon communication from the frozen intake-valve identity and removed unsupported cleaning intervals and modifications.' },
    [IDS.clutch]: { confidence: 'medium', reportCount: 0,
      description: 'Mazda communication 10021571 / TSB 05-003/07 documents a difficult-to-operate clutch pedal on 2006-2007 Mazdaspeed6 vehicles. The available primary inventory does not establish the frozen combined identity of notchy manual-transmission shifting, clutch-disc failure, hydraulic-cylinder failure and broken pedal assemblies, nor does it support track-use causation.',
      solution: 'Reproduce the exact concern and separate pedal effort or engagement height from gear-selection resistance, clutch slip, incomplete release and hydraulic leakage. Ask Mazda for the VIN-applicable version of TSB 05-003/07 or its superseding bulletin before changing parts. Do not buy a clutch kit, flywheel, master cylinder, slave cylinder, pedal assembly or transmission fluid from this page; the bulletin applicability and failed system must be verified first.',
      symptoms: ['clutch pedal is difficult or awkward to operate', 'notchy shifting or incomplete release requires a separate diagnosis'], summary: 'Bounded the page to the documented difficult clutch pedal and held the broader transmission, clutch-wear and hydraulic identity.' },
    [IDS.pcv]: { confidence: 'high', reportCount: 0,
      description: 'Mazda SSP86 covered certain Federal-emissions 2006-2007 Mazdaspeed6 vehicles with heavy white exhaust smoke after long idle or slow driving in heavy traffic. Mazda associated the condition with insufficient crankcase ventilation and oil leaking past the exhaust turbine shaft seal. SSP86 does not establish generic PCV-valve failure, blue smoke, model-wide oil consumption or an aftermarket catch-can remedy.',
      solution: 'Verify the VIN, build date, Federal-emissions application and exact heavy-white-smoke condition. SSP86 directed dealer inspection and turbocharger replacement for an eligible Mazdaspeed6 only when the documented cause was verified. Its seven-year/70,000-mile extension was historical and may be expired. Do not buy a PCV valve, catch can, hose kit, turbocharger or oil product from this page; SSP86 applicability and the smoke source must be confirmed first.',
      symptoms: ['heavy white exhaust smoke after a long idle', 'heavy white exhaust smoke during slow driving in heavy traffic'], summary: 'Replaced generic PCV/catch-can advice with SSP86\'s exact Federal-emissions white-smoke population, mechanism and inspection-led remedy.' },
    [IDS.rearFluid]: { confidence: 'low', reportCount: 0,
      description: 'The complete reviewed inventory did not establish recurring transfer-case or rear-differential damage from fluid neglect, a universal 30,000-mile interval, the frozen FE-LS ATF specification, fixed capacities or a required friction modifier. Mazda communication 10186693 instead directs dealers to follow the vehicle-specific owner or workshop manual and states that services outside factory schedules are not recommended.',
      solution: 'Use the VIN-specific Mazda owner/workshop manual to identify the correct transfer-unit and rear-differential fluid, level/check procedure, capacity and service interval. Investigate noise, leakage, metal debris or binding before assuming neglect damage. Do not buy ATF, 75W-90, friction modifier, drain plugs or drivetrain units from this page; the current Mazda specification and diagnosed condition must be verified first.',
      symptoms: ['drivetrain noise, leakage or binding requires unit-specific inspection'], summary: 'Removed an unsupported 30,000-mile schedule, fluid specifications, capacities and repair-cost claim; held the fluid-neglect damage identity.' },
    [IDS.takata]: { confidence: 'high', reportCount: 0,
      description: 'Mazda/NHTSA recalls 17V474 and 18V402 cover driver and passenger frontal Takata inflators in 2006-2007 Mazdaspeed6 vehicles; recall 19V781 covers certain passenger inflators previously replaced with the same design. Degraded propellant can cause an inflator to rupture during deployment and send metal fragments into the cabin, risking serious injury or death. NHTSA and Mazda issued a Do Not Drive warning for unrepaired affected vehicles.',
      solution: 'Check the VIN immediately for open Takata campaigns. If an affected recall remains unrepaired, follow the Do Not Drive warning and contact Mazda for the urgent free dealer repair; do not drive the vehicle to the dealer unless Mazda specifically arranges or authorizes safe transport. The dealer replaces the applicable inflator with the permanent remedy. Do not buy an airbag, inflator or used module from this page; this is a VIN-specific safety recall remedy.',
      symptoms: ['there may be no warning before an inflator rupture during a crash'], summary: 'Replaced secondary citations with the exact driver/passenger Part 573 reports and current NHTSA Do Not Drive instruction.' },
    [IDS.turboStarvation]: { confidence: 'low', reportCount: 0,
      description: 'The complete reviewed inventory did not establish Mazdaspeed6 turbocharger oil starvation from a banjo-bolt screen, a 15,000-20,000-mile cleaning interval or a preventive screen-deletion remedy. SSP86 documents a distinct white-smoke condition on certain Federal-emissions 2006-2007 vehicles from insufficient crankcase ventilation and oil leakage past the exhaust turbine shaft seal after long idle or slow traffic.',
      solution: 'Separate white smoke, oil leakage, low boost and abnormal turbo noise, then inspect crankcase ventilation, oil supply and return, charge-air plumbing and turbocharger condition as the evidence directs. Apply SSP86 only to its exact population and smoke condition. Do not buy a K04, upgraded turbo, feed line or oil product from this page or remove a banjo screen; the frozen oil-starvation identity has not been established.',
      symptoms: ['heavy white smoke after long idle may match SSP86', 'low boost or abnormal turbo noise requires separate diagnosis'], summary: 'Held the unsupported oil-starvation/banjo-screen identity and separated it from SSP86\'s exact white-smoke condition.' },
    [IDS.vvt]: { confidence: 'high', reportCount: 0,
      description: 'Mazda SSP87 covered certain 2006-2007 Mazdaspeed6 vehicles with the L3T engine and defined VIN/build ranges. Mazda describes a loud cold-start tick from wear at the VVT-rotor lock-pin hole or VVT-case breakage, and a separate warm knock or rattle below 2,000 rpm from excessive timing-chain stretch. The frozen title can imply that both conditions occur on cold start, while Mazda separates them.',
      solution: 'Have Mazda reproduce and localize the noise, verify the L3T engine and VIN/build range, and distinguish the cold-start VVT tick from the warm sub-2,000-rpm chain rattle. SSP87 directed VVT-actuator replacement, or actuator plus timing-chain replacement, only after inspection verified the cause. Its seven-year/70,000-mile extension was historical and may be expired. Do not buy a VVT actuator, timing chain, tensioner, guide set or oil product from this page; applicability and the failed path must be confirmed first.',
      symptoms: ['loud ticking immediately after a cold start', 'warm knock or rattle below 2,000 rpm from the timing-cover area'], summary: 'Bounded VVT and timing-chain advice to SSP87 and held the title because it can misstate the timing-chain symptom as a cold-start condition.' },
    [IDS.diffMount]: { confidence: 'low', reportCount: 0,
      description: 'The complete reviewed communication inventory did not establish a weak rear-differential mount, bolts backing out or shearing, axle damage, or a need for an aftermarket brace on 2006-2007 Mazdaspeed6 vehicles. The frozen page relies on forum discussions and aftermarket installation instructions, which cannot establish a Mazda defect or universal remedy.',
      solution: 'If there is a rear driveline clunk, movement or vibration, inspect the differential mounts, bushings, fasteners, subframe, propeller shaft and axles and compare findings with the Mazda workshop manual. Do not buy a differential brace, mount, bushing or axle from this page or re-torque unknown fasteners; the failure location, fastener specification and fitment have not been established.',
      symptoms: ['rear driveline clunk, movement or vibration requires full mount and driveline inspection'], summary: 'Removed forum/aftermarket defect claims and held the unsupported rear-differential-mount/sheared-bolt identity.' },
    [IDS.rod]: { confidence: 'low', reportCount: 0,
      description: 'The complete reviewed Mazda communication inventory did not establish recurring connecting-rod failure caused by full boost below 3,000 rpm, injector-seal intervals, a catch-can prevention strategy or the frozen oil-pressure threshold. No reviewed primary source supports the 120-owner total or converts modified-vehicle anecdotes into a model-wide defect.',
      solution: 'For knock, low oil pressure, misfire, oil consumption or loss of compression, stop loading the engine and obtain mechanical oil-pressure, compression/leak-down, oil/debris and calibration checks before disassembly. Record modifications and fuel used. Do not buy forged rods, head studs, injector seals, a catch can or an engine assembly from this page; the failure and cause must be established first.',
      symptoms: ['engine knock, low oil pressure, misfire or loss of compression requires immediate diagnosis'], summary: 'Proposed the unsupported 120-owner count as zero and held a low-rpm/boost connecting-rod identity without Mazda primary support.' },
    [IDS.transfer]: { confidence: 'low', reportCount: 0,
      description: 'The complete reviewed inventory includes eight recall rows across four campaigns: Takata driver inflator, Takata passenger inflator and fuel-pump mounting rings. It contains no Mazdaspeed6 transfer-case seal or internal-destruction recall. The manufacturer-communication inventory also does not establish the frozen model-wide seal-failure identity, costs or a magnetic-drain-plug remedy.',
      solution: 'For transfer-unit leakage, noise, binding or metal debris, confirm the leak source and fluid level using the Mazda workshop procedure before operation. Inspect nearby engine, transmission and axle-seal sources rather than assuming the transfer case is internally damaged. Do not buy seals, a used/rebuilt transfer unit, fluid or a magnetic plug from this page; the failed unit and current Mazda parts fitment must be verified first.',
      symptoms: ['fluid leakage near the center driveline requires source localization', 'noise, binding or metal debris requires transfer-unit inspection'], summary: 'Proposed the unsupported 150-owner count as zero, removed the false recall implication and held the transfer-case failure identity.' },
    [IDS.turboOil]: { confidence: 'low', reportCount: 0,
      description: 'The complete reviewed inventory did not establish recurring Mazdaspeed6 turbo oil-feed-line O-ring leakage, a 50,000-mile preventive replacement interval or oil coking from shutdown behavior. SSP86 documents insufficient crankcase ventilation and heavy white exhaust smoke with oil leakage past the exhaust turbine shaft seal; it does not identify an oil-feed-line O-ring or validate the frozen combined feed-line/turbo-failure identity.',
      solution: 'Localize any oil leak and separate feed, return, crankcase-ventilation and turbo-seal paths before repair. For the exact SSP86 white-smoke condition, verify VIN/build/emissions applicability and use Mazda\'s inspection path. Do not buy an oil-feed line, O-ring, return line, turbocharger, seal kit or oil product from this page; the leak source and fitment have not been established.',
      symptoms: ['oil leakage near the turbocharger requires source localization', 'heavy white smoke after long idle may match SSP86'], summary: 'Proposed the unsupported 100-owner count as zero and held the oil-feed-line/turbo-failure identity against SSP86 and the complete inventory.' },
  };
  if (!content[id]) throw new Error(`Unexpected Mazdaspeed6 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const evidence = {
    [IDS.fuelRing]: ['Part 573 report 21V744 identifies 2006-2007 Mazdaspeed6 mounting-ring cracking from improper installation and a free new-ring remedy.'],
    [IDS.hpfp]: ['Communication 10041267 is installation/removal information, not a pump-failure finding; no exact failure communication exists in the 40-row inventory.'],
    [IDS.carbon]: ['Communication 10028524 concerns electronic-throttle-body carbon, not intake-valve deposits or a walnut-blasting interval.'],
    [IDS.clutch]: ['Communication 10021571 supports a difficult clutch pedal; it does not establish the frozen combined transmission/clutch/hydraulic failure identity.'],
    [IDS.pcv]: ['SSP86 supports a defined Federal-emissions white-smoke/insufficient-ventilation condition but not generic PCV failure or catch-can advice.'],
    [IDS.rearFluid]: ['Communication 10186693 requires the vehicle-specific factory schedule and rejects unscheduled services; no exact 30,000-mile fluid-damage record was found.'],
    [IDS.takata]: ['Part 573 reports 17V474 and 18V402 establish driver/passenger inflator rupture risk; NHTSA identifies 2006-2007 Mazdaspeed6 in the current Do Not Drive warning.'],
    [IDS.turboStarvation]: ['No communication establishes banjo-screen starvation or deletion; SSP86 is a distinct white-smoke condition.'],
    [IDS.vvt]: ['SSP87 separates cold-start VVT noise from warm timing-chain rattle on defined 2006-2007 L3T vehicles.'],
    [IDS.diffMount]: ['No exact mount/bolt defect communication was found; forum and aftermarket installation material are not defect evidence.'],
    [IDS.rod]: ['No exact Mazda communication supports the low-rpm boost causation or owner count.'],
    [IDS.transfer]: ['None of the eight recall rows or 40 communications establishes a transfer-case seal/internal-destruction recall or defect.'],
    [IDS.turboOil]: ['No exact feed-line/O-ring communication was found; SSP86 instead addresses ventilation and turbine-shaft-seal white smoke.'],
  };
  return { primaryEvidence: evidence[id], limitations: 'No owner-frequency rate, retail fitment, current campaign/warranty eligibility or failed component is inferred beyond the cited primary source.' };
}

function commerceDecisionFor(id) {
  if (id === IDS.fuelRing || id === IDS.takata) return 'Dealer-only or VIN-specific remedy; recall status and the applicable campaign must be verified before repair.';
  return `No universal retail part; the exact vehicle configuration, source applicability and failed component must be verified before replacement (${id}).`;
}

function identityConflictFor(id) {
  const map = {
    [IDS.hpfp]: 'The frozen title asserts HPFP inability under load, while the only fuel-pump communication is installation/removal information and the full inventory contains no matching failure record.',
    [IDS.carbon]: 'The frozen title asserts intake-valve carbon buildup, while Mazda documents carbon in the electronic throttle body, a different component and condition.',
    [IDS.clutch]: 'The frozen title combines notchy transmission and clutch engagement failures, while Mazda communication 10021571 establishes only a difficult clutch pedal.',
    [IDS.pcv]: 'The frozen title asserts PCV-system failure causing oil consumption and smoking turbo, while SSP86 establishes a defined white-smoke/insufficient-ventilation condition without generic oil-consumption or PCV-valve failure.',
    [IDS.rearFluid]: 'The frozen title asserts neglect damage and a universal maintenance prescription, while Mazda directs use of the vehicle-specific factory schedule and provides no matching damage record.',
    [IDS.turboStarvation]: 'The frozen title asserts turbo oil starvation/failure, while SSP86 documents oil entering the exhaust side of the turbine from a distinct ventilation condition and does not identify banjo-screen starvation.',
    [IDS.vvt]: 'The frozen title can place both VVT and timing-chain noise on cold start, while SSP87 separates cold-start VVT tick from warm sub-2,000-rpm timing-chain rattle.',
    [IDS.diffMount]: 'The frozen title asserts a weak differential mount and sheared bolts without matching Mazda primary evidence.',
    [IDS.rod]: 'The frozen title asserts a low-rpm boost connecting-rod defect without matching Mazda primary evidence.',
    [IDS.transfer]: 'The frozen title and citation imply a transfer-case recall/failure, but the complete recall and communication inventory contains no such campaign.',
    [IDS.turboOil]: 'The frozen title asserts oil-feed-line leakage and turbo failure, while SSP86 identifies a different turbine-shaft-seal/ventilation condition and no feed-line O-ring record exists.',
  };
  return map[id] || null;
}

function proposalFor(before, id) {
  const content = contentFor(id);
  return { ...clone(before), description: content.description, solution: content.solution, confidence: content.confidence,
    symptoms: clone(content.symptoms), affectedSystems: [], dtcCodes: [], estimatedCostLow: null,
    estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false,
    reportCount: content.reportCount, source: 'ai-researched', reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }

function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'Mazdaspeed6').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 13) throw new Error(`Expected 13 frozen Mazdaspeed6 rows, found ${frozenRows.length}`);
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id); const content = contentFor(row.id); const conflict = identityConflictFor(row.id);
    return { id: row.id, action: conflict ? 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy' : 'retain_indexed_identity_and_accuracy_cleanup', identityReviewRequired: Boolean(conflict), identityConflict: conflict, reason: content.summary, evidence: evidenceFor(row.id), commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Mazda', model: 'Mazdaspeed6', completionStatement: 'All 13 frozen Mazdaspeed6 pages are accounted for with indexed identities and vehicle metadata preserved pending review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Eleven frozen identities materially conflict with or exceed the primary evidence; even the two supported recall identities require independent review before any body-only catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 13 pages remain published with their exact frozen identity and vehicle metadata in this proposal packet.',
      'The three fabricated nonzero report counts are proposed as zero but cannot be applied without independent review and explicit approval.',
      'Unknown owner totals are never rendered or written as "0+ owners" social proof.',
      'A recall or service program is not expanded beyond its exact VIN, build, emissions, engine, component and symptom boundary.',
      'Every selected PDF page was rendered and visually inspected; exact file hashes and page counts are frozen.',
      'Every named replaceable item has an explicit dealer-only or no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'mazdaspeed6-two-identities-supported', severity: 'retain', recordIds: RETAIN_IDS, detail: 'Fuel-pump mounting-ring and driver/passenger Takata recall titles match exact primary records and can retain their indexed identities.' },
      { code: 'mazdaspeed6-eleven-identities-held', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Eleven titles combine, broaden or assert mechanisms not established by the complete primary-source inventory.' },
      { code: 'mazdaspeed6-fabricated-counts-proposed-zero', severity: 'accuracy-correction', recordIds: FABRICATED_REPORT_COUNT_IDS, detail: 'Frozen 120-, 150- and 100-owner totals have no reviewed source and are proposal-only zero corrections.' },
      { code: 'mazdaspeed6-takata-do-not-drive-current', severity: 'safety-correction', recordIds: [IDS.takata], detail: 'Current NHTSA guidance identifies unrepaired 2006-2007 Mazdaspeed6 Takata campaigns under an urgent Do Not Drive warning.' },
      { code: 'all-mazdaspeed6-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'No Mazdaspeed6 page is removed, merged, redirected or allowed to lose its indexed identity while this packet is reviewed.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_accuracy_cleanup: 2, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 11, fabricated_report_counts_proposed_zero: 3, total: 13 }, rows,
  };
}

if (require.main === module) { const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { ALL_IDS, BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, FABRICATED_REPORT_COUNT_IDS, IDENTITY_REVIEW_IDS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REQUIRED_COMMUNICATION_IDS, RETAIN_IDS, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, identityConflictFor, proposalFor };
