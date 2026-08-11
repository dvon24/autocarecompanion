/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  brakes: 'renault-twizy-brake-seizure-and-uneven-pad-wear',
  battery12v: 'renault-twizy-12v-battery-discharge-and-no-start',
  doorWater: 'renault-twizy-door-window-and-latch-water-ingress-problems',
  charger: 'renault-twizy-on-board-charger-failure-or-charge-interruption',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, commerceDecision }) {
  return Object.freeze({
    description,
    solution,
    symptoms,
    affectedSystems: systems,
    evidence,
    conflict,
    summary,
    citations: ['datasets', 'renaultRecallCheck'],
    commerceDecision: commerceDecision || 'failure path, component, market and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.brakes]: held({
    description: 'The frozen page has no citations and applies caliper seizure, slide-pin seizure, dragging and uneven pad wear to every 2012-2020 Twizy, attributing the pattern to light weight, regenerative braking, short trips, storage and wet weather. Those are operating hypotheses rather than an exact manufacturer-defined defect, and the page supplies unsupported dollar repair ranges.',
    solution: 'Treat pulling, reduced braking, grinding, overheating or a wheel that will not rotate freely as safety-critical. Measure brake force and temperature side-to-side, inspect pad/disc thickness and condition, caliper piston/slider movement, hydraulic hoses and parking-brake linkage on all wheels under Twizy-specific procedures. Do not buy pads, discs, pins or calipers from this page; failed corner, brake package and VIN fitment must be established first.',
    symptoms: ['brake force and temperature compared side-to-side', 'pad, disc, piston and slider condition measured', 'parking-brake and hydraulic paths inspected separately'],
    systems: ['friction brakes and calipers', 'pads, discs and slide hardware', 'hydraulic and parking-brake linkage'],
    evidence: ['The frozen row contains no citations.', 'The complete NHTSA corpus contains zero Renault Twizy rows.', 'No exact Renault source supports the nine-year population, causes or dollar costs.'],
    conflict: 'The indexed identity converts plausible low-use corrosion paths into an all-year defect without evidence.',
    summary: 'Held the brake-seizure identity and replaced cause/cost assumptions with measured brake safety diagnosis.',
  }),
  [ids.battery12v]: held({
    description: 'The frozen page has no citations and calls auxiliary-battery discharge a very common 2012-2020 Twizy fault, assigning AGM aging, parasitic drain and storage as causes plus voltage thresholds and dollar costs. A no-wake or no-drive complaint can also involve terminals, grounds, fuses, DC-DC output, charger state, contactor control, immobilization or high-voltage faults.',
    solution: 'Follow EV safety procedures, record warnings and scan data, measure the 12 V battery open-circuit and loaded voltage with an appropriate test, and verify terminals, grounds, fuses and DC-DC charging before replacement. Do not bridge or probe high-voltage circuits and do not assume a maintainer cures repeated discharge. Do not buy a 12 V battery, DC-DC converter or charger from this page; battery specification, drain/charge path and VIN fitment must be established first.',
    symptoms: ['12 V voltage and load response measured', 'terminals, grounds, fuses and DC-DC output checked', 'low-voltage and high-voltage/contact-control faults separated'],
    systems: ['12 V auxiliary battery', 'DC-DC converter and low-voltage distribution', 'traction-battery contactor and control wake-up'],
    evidence: ['The frozen row contains no citations.', 'The complete NHTSA corpus contains zero Renault Twizy rows.', 'No exact Renault source supports the prevalence, 12.4 V threshold, AGM identity or dollar costs.'],
    conflict: 'The indexed identity turns a multi-cause no-wake state into one common battery defect with universal thresholds.',
    summary: 'Held the 12 V/no-start identity and replaced prevalence, voltage and cost claims with low-voltage and EV-system diagnosis.',
  }),
  [ids.doorWater]: held({
    description: 'The frozen page has no citations and treats the Twizy’s open-sided/half-door configuration, optional side windows, water entry, rattles, latch wear, seal wear and wind noise as one 2012-2020 defect. Some exposure follows the vehicle’s design and accessory configuration rather than a failed part, while latch, hinge, window and seal conditions require separate inspection. Dollar costs are unsupported.',
    solution: 'Identify the installed door and window accessories, reproduce the water or latching concern, and inspect hinge play, fasteners, latch/striker alignment, window-panel mounting, seals and drainage separately. Do not modify safety latches or obstruct drainage; use the vehicle/accessory instructions for adjustment. Do not buy seals, latches, hinges or window panels from this page; configuration, failed component and VIN/accessory fitment must be established first.',
    symptoms: ['door and window accessory configuration identified', 'water path reproduced before sealing', 'hinge, latch, fastener, panel and drainage paths inspected separately'],
    systems: ['doors, hinges and latches', 'optional side-window panels and seals', 'body openings and drainage'],
    evidence: ['The frozen row contains no citations.', 'The complete NHTSA corpus contains zero Renault Twizy rows.', 'No source distinguishes expected open-body exposure from a nine-year defect population.'],
    conflict: 'The indexed identity combines design exposure, accessory fitment and multiple hardware conditions into one defect.',
    summary: 'Held the door/window water identity and separated expected configuration exposure from latch, hinge, panel and seal diagnosis.',
  }),
  [ids.charger]: held({
    description: 'The frozen page has no citations and applies charge refusal/interruption to every 2012-2020 Twizy, assigning the on-board charger, integrated cable/inlet, moisture or low 12 V voltage as common causes and supplying dollar repair ranges. Mains supply, plug/cable thermal damage, protective devices, low-voltage support, charger, battery-management and traction-battery conditions are separate high-energy diagnostic paths.',
    solution: 'Stop using any hot, damaged or wet plug/cable and isolate the supply safely. Confirm the approved mains circuit and protective device, inspect external plug/cable condition without opening high-voltage equipment, record warnings and scan Renault EV modules, and verify 12 V support before qualified charger/high-voltage diagnosis. Do not open or probe the charger or traction system without EV authorization. Do not buy a cable, inlet, charger or battery component from this page; failed path, market electrical specification and VIN fitment must be established first.',
    symptoms: ['mains supply and protective device verified', 'plug/cable heat or damage treated as stop-use', '12 V, charger, BMS and traction-battery paths separated by qualified diagnosis'],
    systems: ['mains plug and integrated charge cable', 'on-board charger and low-voltage support', 'battery management and high-voltage traction battery'],
    evidence: ['The frozen row contains no citations.', 'The complete NHTSA corpus contains zero Renault Twizy rows.', 'No exact Renault source supports the nine-year frequency, cause list or dollar costs.'],
    conflict: 'The indexed identity merges several mains, low-voltage and high-voltage charge paths into one common charger failure.',
    summary: 'Held the charge-interruption identity and added mains/high-voltage stop-use boundaries plus system-specific diagnosis.',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  renaultRecallCheck: { title: 'Renault Official Recall Campaign Checker', type: 'manufacturer', url: 'https://www.renault.co.uk/recall-campaigns.html', contains: 'Enter your vehicle identification number' },
});

module.exports = Object.freeze({
  make: 'Renault', model: 'Twizy', slug: 'twizy', reviewDate: '2026-08-11',
  snapshotFile: 'data/_renault-deeplink-snapshot-2026-08-11.json',
  outputFile: 'data/known-issue-renault-twizy-adjudication-2026-08-11.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  sourceMakes: ['RENAULT'], modelAliases: ['TWIZY'],
  searchTerms: ['brake', '12V battery', 'door', 'water ingress', 'charger', 'charging'], relevantDocumentIds: [], campaigns: [],
  pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 0 },
    totalRows: 0, relevantRowCount: 0, uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains zero RENAULT TWIZY rows; this disclosed U.S.-corpus limitation is not treated as disproof.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 0, post: 0 }, totalRows: 0, campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA flat recall corpus contains zero RENAULT TWIZY rows; owners must use Renault’s VIN recall checker for market-specific campaigns.',
  },
  content,
  requiredProse: [
    { id: ids.brakes, field: 'description', patterns: ['has no citations', 'operating hypotheses'] },
    { id: ids.doorWater, field: 'description', patterns: ['Some exposure follows the vehicle’s design', 'Dollar costs are unsupported'] },
    { id: ids.charger, field: 'solution', patterns: ['Stop using any hot, damaged or wet plug/cable', 'Do not open or probe the charger'] },
  ],
  observations: [
    { code: 'all-four-held', severity: 'identity-safety', recordIds: allIds, detail: 'All four Twizy pages remain published but have no frozen citations and exceed exact evidence.' },
    { code: 'zero-citation-baseline', severity: 'source-integrity', recordIds: allIds, detail: 'Every frozen Twizy row has zero citations; only primary source limitations are added.' },
    { code: 'high-voltage-mains-boundary', severity: 'safety-accuracy', recordIds: [ids.battery12v, ids.charger], detail: 'Mains and high-voltage work is explicitly isolated from owner-level diagnosis.' },
    { code: 'design-exposure-not-defect', severity: 'technical-accuracy', recordIds: [ids.doorWater], detail: 'Open-body/accessory exposure is separated from failed latch, hinge, panel or seal components.' },
    { code: 'non-us-source-gap-explicit', severity: 'source-integrity', recordIds: allIds, detail: 'NHTSA has zero RENAULT TWIZY rows; the geographic limitation is explicit.' },
    { code: 'no-commerce-or-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'No commerce or 0+ owner text is introduced; indexed identity and published status are preserved.' },
  ],
});
