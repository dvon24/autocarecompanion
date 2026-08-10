/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  brakeRotor: 'nissan-armada-brake-rotor-warp-2017',
  exhaustManifold: 'nissan-armada-exhaust-manifold-crack-2004',
  bodyMount: 'nissan-armada-hydraulic-body-mount-2017',
  airSuspension: 'nissan-armada-rear-air-suspension-failure-2004',
  vvel: 'nissan-armada-vvel-solenoid-2017',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.brakeRotor, ids.bodyMount, ids.vvel].sort());
const relevantDocumentIds = Object.freeze([
  '10007548', '10015838', '10015990', '10034904', '10042754', '10109159',
  '10109254', '10119236', '10152523', '10168932', '10173567', '10177598',
  '10177599', '10186838', '10192216', '10192217', '10192542', '10200013',
]);
const campaigns = Object.freeze([
  '07E046000', '07V449000', '08V187000', '08V284000', '10E019000', '10V072000',
  '10V074000', '10V208000', '10V349000', '10V371000', '10V517000', '12V143000',
  '13V451000', '14V803000', '15V501000', '19V654000', '20V188000', '21V373000',
  '23V067000', '25V821000', '26V455000',
]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'] }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    conflict,
    summary,
    citations,
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.brakeRotor]: held({
    description: `Nissan NTB18-079 applies only to 2017-2019 Armada vehicles and corrects the Electronic Service Manual's front-rotor minimum wear thickness to 28.5 mm. It does not identify warped or undersized rotors, a towing-related design defect, 15,000-25,000-mile failures or a 2020-2024 population. Separate 2004-2005 brake-judder communications do not prove the frozen second-generation identity. The frozen 520-owner total is unsupported.`,
    solution: `For vibration or pedal pulsation, measure lateral runout and disc-thickness variation, inspect hub cleanliness and torque practice, and compare rotor thickness with the correct generation-specific service limit. Diagnose pads, calipers, bearings, tires and suspension separately before replacing parts. Do not buy rotors, pads, calipers or a drilled/slotted brake kit from this page; measured condition, axle configuration and exact fitment must be established first.`,
    symptoms: ['brake vibration and pedal pulsation reproduced and measured', 'rotor thickness, variation and runout checked', 'hub, pad, caliper, tire and suspension paths separated'],
    systems: ['front disc brake rotors and hubs', 'pads and calipers', 'wheel, tire and front suspension'],
    evidence: ['NTB18-079 is a one-value service-manual correction for 2017-2019 vehicles.', 'The exact corpus has 2004-2005 brake-judder records but no source proving the frozen 2017-2024 defect identity.', 'No exact source supports 520 reports or a 15,000-25,000-mile failure range.'],
    conflict: 'The indexed page turns a wear-thickness specification correction and older-generation judder records into an eight-year premature-warping design defect.',
    summary: 'Held the overbroad rotor-warp identity and removed the fabricated 520-owner total.',
    citations: ['rotorServiceInformation', 'datasets'],
  }),
  [ids.exhaustManifold]: held({
    description: `The frozen page cites NHTSA campaign 20V123000 as a Nissan exhaust-manifold recall, but the official API identifies Lion Electric school buses, steering-box fasteners and potential steering loss. Armada manufacturer communications 10177598 and 10177599 concern unsold aftermarket exhaust-manifold/catalyst assemblies that lost CARB certification and explicitly state that parts already on vehicles are not affected. They do not establish first-generation manifold cracking, both-bank recurrence, catalyst damage or P0420/P0430.`,
    solution: `For a cold-start tick or exhaust odor, inspect the complete exhaust path for soot, leaks, loose heat shields, damaged gaskets or fasteners and catalyst faults, then confirm the leaking component before repair. Preserve emissions codes and freeze-frame data. Do not buy a manifold, header, catalyst, oxygen sensor, gasket or stud kit from this page; bank, leak location, emissions legality and exact VIN fitment must be proven first.`,
    symptoms: ['cold and warm exhaust noise compared', 'soot and leak location confirmed', 'manifold, gasket, fastener, heat-shield and catalyst paths separated'],
    systems: ['exhaust manifolds and gaskets', 'catalysts and oxygen sensors', 'exhaust fasteners, shields and emissions controls'],
    evidence: ['NHTSA 20V123000 belongs to Lion school buses and concerns steering, not Nissan exhaust components.', 'The only exact exhaust-manifold communications state that affected aftermarket inventory could not be sold but installed vehicle parts were not affected.', 'No exact source proves both-bank cracking across every 2004-2015 Armada.'],
    conflict: 'The indexed page relies on a recall from another manufacturer and converts a CARB parts-inventory notice into a twelve-year Nissan manifold-cracking identity.',
    summary: 'Held the unsupported exhaust-manifold identity and removed a false NHTSA recall citation.',
    citations: ['unrelatedRecall20V123', 'datasets'],
  }),
  [ids.bodyMount]: held({
    description: `The frozen page says Nissan NTB19-028 covers Armada hydraulic body-mount clunk and an updated mount. The official bulletin is Exterior Cleaning Information for all Nissan vehicles; it discusses cleaner pH and surface damage and contains no body-mount diagnosis, redesign or replacement. The exact Armada corpus does not establish a 2017-2024 hydraulic-mount failure population. The frozen 350-owner total is unsupported.`,
    solution: `For a clunk or loose-body sensation, reproduce the noise and inspect body-to-frame mounts, fastener torque, stabilizer bushings, shocks, suspension joints, exhaust contact and cargo/interior sources. Confirm leakage or movement at a specific mount before replacement. Do not buy body mounts, polyurethane bushings, shocks or an alignment kit from this page; the noise source, mount position and fitment must be proven first.`,
    symptoms: ['noise reproduced by road condition and load', 'body-to-frame mounts inspected for leakage and movement', 'mount, stabilizer, shock, joint, exhaust and interior paths separated'],
    systems: ['body-to-frame mounts and fasteners', 'stabilizer bars, shocks and suspension joints', 'exhaust and body/interior contact points'],
    evidence: ['NTB19-028 is an exterior-cleaning bulletin, not a body-mount bulletin.', 'The exact manufacturer corpus contains no record proving the frozen eight-year hydraulic-mount identity.', 'No exact source supports 350 owner reports or an updated mount under NTB19-028.'],
    conflict: 'The indexed page attributes an eight-year body-mount defect and redesign to a bulletin about exterior-cleaning chemicals.',
    summary: 'Held the false-citation body-mount identity and removed the fabricated 350-owner total.',
    citations: ['exteriorCleaningBulletin', 'datasets'],
  }),
  [ids.airSuspension]: held({
    description: `The exact 406-row Armada manufacturer-communication corpus contains no record supporting the cited NTB07-012 rear-air-suspension claim or a 2004-2015 population of compressor, air-spring and line failures. The frozen identity also includes the VK56VD engine even though the indexed years end in 2015, and it presents a coil-conversion kit and bypass module as a universal repair without trim or equipment fitment.`,
    solution: `If rear ride height changes, confirm that the vehicle is equipped with the relevant load-leveling system, record warning indicators and measure ride height after a controlled leak-down period. Test compressor command, power, current, pressure, lines, fittings, height sensor and load before replacing anything. Do not buy an air spring, compressor, line, sensor or coil-conversion kit from this page; original equipment, failed component, warning-light behavior and VIN fitment must be established first.`,
    symptoms: ['original suspension equipment confirmed by VIN', 'ride height and leak-down measured', 'compressor, electrical supply, line, spring and height-sensor paths separated'],
    systems: ['rear load-leveling suspension', 'compressor, relay and electrical supply', 'air lines, springs and height sensor'],
    evidence: ['No exact Armada communication supports the cited NTB07-012 suspension identity.', 'No exact primary record establishes compressor and air-spring recurrence across every 2004-2015 vehicle.', 'The frozen conversion-kit and bypass-module advice lacks trim and warning-system fitment.'],
    conflict: 'The indexed page uses an unsupported bulletin identity and universal conversion advice for an equipment-dependent twelve-year population.',
    summary: 'Held the unsupported rear-air-suspension identity and required equipment-specific diagnosis.',
  }),
  [ids.vvel]: held({
    description: `Nissan campaign P0A05 applies to certain 2019 Armadas and reprograms the ECM because Variable Valve Timing solenoid diagnosis may continue drawing current with the engine off and reduce battery life. It does not establish VVEL solenoid or actuator failure, rough idle, misfires, intake-manifold removal, both-bank replacement or a 2017-2024 defect population. Other exact solenoid communications describe external oil leakage or exclude Armada in their stated application. The frozen 480-owner total is unsupported.`,
    solution: `Preserve DTCs and freeze-frame data, verify oil level and condition, and diagnose the exact valve-timing, ignition, fuel, air and mechanical path for the reported symptom. Check VIN eligibility for P0A05 separately when battery-life reduction is the concern. Do not buy part 23796-1LA0C, a VVEL/VVT solenoid, actuator, intake gasket or manifold from this page; failed component, bank, code path and VIN fitment must be proven first.`,
    symptoms: ['DTCs and freeze-frame data preserved', 'oil, timing, ignition, fuel, air and mechanical paths separated', 'P0A05 battery-current condition kept separate from drivability complaints'],
    systems: ['ECM and variable-valve-timing diagnosis', 'VVEL/VVT actuators and oil control', 'ignition, fuel, intake and mechanical engine systems'],
    evidence: ['P0A05 is limited to certain 2019 vehicles and an ECM diagnostic-current condition.', 'The campaign remedy is ECM reprogramming, not replacement of VVEL solenoids on both banks.', 'No exact source supports 480 reports, a universal 2017-2024 failure or the frozen repair instructions.'],
    conflict: 'The indexed page converts one bounded ECM/current-draw campaign and unrelated oil-leak records into an eight-year VVEL hardware-failure identity.',
    summary: 'Held the overbroad VVEL identity and removed the fabricated 480-owner total.',
    citations: ['vvtEcmCampaign', 'datasets'],
  }),
});

const pdfSources = Object.freeze({
  rotorServiceInformation: {
    title: 'Nissan NTB18-079 - 2017-2019 Armada Front Disc Brake Rotor Service Information',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2108/MC-10152523-9999.pdf',
    sha256: '2c2ffa861165c3775c74ca8bdba1d12f160321a1b42aa4406e2e1605df3dfbe6',
    pageCount: 1,
    visuallyReviewedPages: [1],
  },
  exteriorCleaningBulletin: {
    title: 'Nissan NTB19-028 - Exterior Cleaning Information',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10160181-9999.pdf',
    sha256: '1ffc00ab505a9541e971953272b93678569751ac94c201af10e690a8e1ef7cf9',
    pageCount: 3,
    visuallyReviewedPages: [1, 3],
  },
  vvtEcmCampaign: {
    title: 'Nissan P0A05 - 2019 Armada ECM Reprogram Voluntary Service Campaign',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10173567-0001.pdf',
    sha256: '58a1b982e8515243aea7fdf76e88f266e3954666edb994f4ab00c5a51b87fe63',
    pageCount: 4,
    visuallyReviewedPages: [1, 4],
  },
});

const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  unrelatedRecall20V123: {
    title: 'NHTSA Recall 20V123000 - Lion School-Bus Steering Fasteners',
    type: 'nhtsa',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=20V123000',
    contains: 'Lion Electric Company',
  },
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Armada', slug: 'armada', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-armada-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['ARMADA'],
  searchTerms: ['brake rotor', 'brake judder', 'rotor', 'exhaust manifold', 'body mount', 'clunk', 'air suspension', 'auto level', 'compressor', 'air spring', 'VVEL', 'solenoid', 'actuator'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 22, '2005-2009': 43, '2010-2014': 31, '2015-2019': 153, '2020-2024': 146, '2025-2026': 11 },
    totalRows: 406,
    relevantRowCount: 18,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 8, post: 131 },
    totalRows: 139,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The 21 exact Armada recall campaigns do not prove any frozen rotor-warp, exhaust-manifold, hydraulic-body-mount, rear-air-suspension or VVEL-hardware identity. The frozen exhaust page instead cites 20V123000, a Lion school-bus steering recall outside this inventory.',
  },
  content,
  requiredProse: [
    { id: ids.brakeRotor, field: 'description', patterns: ['NTB18-079', '28.5 mm', 'does not identify warped or undersized rotors'] },
    { id: ids.exhaustManifold, field: 'description', patterns: ['Lion Electric school buses', 'parts already on vehicles are not affected'] },
    { id: ids.bodyMount, field: 'description', patterns: ['Exterior Cleaning Information', 'contains no body-mount diagnosis'] },
    { id: ids.airSuspension, field: 'description', patterns: ['no record supporting the cited NTB07-012', 'equipment fitment'] },
    { id: ids.vvel, field: 'description', patterns: ['certain 2019 Armadas', 'does not establish VVEL solenoid or actuator failure'] },
  ],
  observations: [
    { code: 'all-five-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'Every frozen Armada identity materially exceeds exact primary evidence and remains published pending identity policy.' },
    { code: 'two-false-citations-neutralized', severity: 'source-integrity', recordIds: [ids.exhaustManifold, ids.bodyMount], detail: 'Recall 20V123000 belongs to Lion school buses, while NTB19-028 is exterior-cleaning guidance; neither supports its frozen Armada page.' },
    { code: 'rotor-spec-not-expanded', severity: 'technical-accuracy', recordIds: [ids.brakeRotor], detail: 'NTB18-079 remains a 2017-2019 wear-thickness correction and is not expanded into a warping or design-defect claim.' },
    { code: 'vvt-campaign-not-expanded', severity: 'technical-accuracy', recordIds: [ids.vvel], detail: 'P0A05 remains a certain-2019 ECM/current-draw campaign and is not expanded into VVEL hardware failure.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Three unsupported owner totals totaling 1,350 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-armada-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Armada page is removed, archived, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
