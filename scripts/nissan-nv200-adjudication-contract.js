/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  catalystTheft: 'nissan-nv200-catalytic-converter-theft-2013',
  cvtFailure: 'nissan-nv200-cvt-failure-2013',
  tireWear: 'nissan-nv200-premature-tire-wear-2013',
  slidingDoor: 'nissan-nv200-sliding-door-2013',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze(allIds);
const relevantDocumentIds = Object.freeze([
  '10190200', '10192353', '10192421', '10192422', '10237563', '11001192',
]);
const campaigns = Object.freeze(['25V676000']);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.catalystTheft]: held({
    description: `The complete exact NV200 manufacturer-communication and recall corpus does not establish catalytic-converter theft vulnerability as a vehicle defect across 2013-2021, rank the NV200 among the most targeted vehicles, prove two converters are commonly stolen, or support the frozen two-minute and shop-frequency claims. Theft exposure varies by location, parking, exhaust configuration and criminal behavior rather than a manufacturer-defined failure population. The frozen 500-owner total is unsupported.`,
    solution: `If theft occurs, preserve the police and insurance evidence, inspect the complete exhaust and oxygen-sensor wiring, and confirm the emissions configuration and jurisdiction before repair. Security measures such as parking, marking, alarms, shields or cages require local risk and fitment review and must not create heat, clearance or service hazards. Do not buy a converter, shield, cage, alarm or replacement exhaust from this page; loss extent, emissions certification, security design and VIN fitment must be established first.`,
    symptoms: ['missing exhaust components and cut locations documented', 'oxygen-sensor wiring and remaining exhaust inspected', 'emissions configuration and jurisdiction confirmed'],
    systems: ['catalytic converters and exhaust piping', 'oxygen-sensor wiring and emissions controls', 'vehicle security and parking environment'],
    evidence: ['No exact primary communication or recall supports the frozen theft-frequency identity.', 'The frozen news story cannot define a 2013-2021 affected population.', 'No primary source substantiates the 500-owner total or universal deterrent.'],
    conflict: 'The indexed page converts a local theft report into a nine-year manufacturer-level vulnerability identity.',
    summary: 'Held the unsupported catalytic-theft identity and removed frequency, owner-total and universal-deterrent claims.',
    citations: ['datasets'],
  }),
  [ids.cvtFailure]: held({
    description: `Exact Nissan NV200 communications establish NS-3 fluid requirements for 2013-2015 vehicles and post-replacement calibration procedures after a CVT, valve body or TCM is replaced on 2015-2021 vehicles. They do not establish commercial-use CVT failure across 2013-2021, stop-and-go belt wear, valve-body degradation, a 60,000-100,000-mile failure window, a 25,000-mile fluid interval or an aftermarket-cooler remedy. The frozen 280-owner total is unsupported.`,
    solution: `Preserve every DTC and freeze-frame record, identify the exact engine and CVT, verify fluid level and specification with the service-manual procedure, and diagnose pressure, control, temperature and mechanical paths before replacement. When a CVT, valve body or TCM is replaced, follow the exact calibration-data procedure. Do not buy NS-3 fluid, a cooler, valve body, torque converter or CVT from this page; DTC branch, diagnosis, service schedule, calibration and VIN fitment must be established first.`,
    symptoms: ['jerking, shudder, delayed response and loss of drive documented separately', 'all DTCs, fluid level and specification preserved', 'control, hydraulic, temperature and mechanical paths separated'],
    systems: ['NV200 continuously variable transmission', 'TCM and valve body calibration', 'fluid, cooler and hydraulic circuits'],
    evidence: ['NTB14-077 establishes fluid type, not a failure pattern or shortened interval.', 'NTB12-103I is a post-replacement calibration procedure, not proof of why a component failed.', 'No exact source supports the frozen commercial-use mechanism or 280-owner total.'],
    conflict: 'The indexed page turns fluid and post-replacement instructions into a nine-year commercial-use CVT-failure identity.',
    summary: 'Held the unsupported CVT-failure identity and removed the fabricated 280-owner total and aftermarket-cooler advice.',
    citations: ['cvtFluidBulletin', 'cvtCalibrationBulletin', 'datasets'],
  }),
  [ids.tireWear]: held({
    description: `Nissan NTB14-014a applies only to 2013-2014 NV200 and says a perceived early shoulder-wear appearance on the original equipment tire may instead be normal wear related to tread styling. It directs technicians to judge wear by the owner-manual tread indicators while confirming alignment and inflation as needed. It does not establish rear cupping, inside-edge wear, suspension geometry, load-induced alignment drift or a 2013-2021 population. The frozen 150-owner total is unsupported.`,
    solution: `Measure tread depth at the specified points, inspect for exposed wear indicators, damage and age, verify cold inflation against the placard, and measure alignment and suspension condition before calling the wear abnormal. Confirm replacement load index and payload consequences. Do not buy tires, alignment parts, springs or suspension components from this page; measured tread, wear pattern, inflation, alignment, load rating and VIN fitment must be established first.`,
    symptoms: ['tread depth measured at Nissan-specified points', 'appearance separated from actual wear-indicator depth', 'inflation, alignment, load and suspension condition checked'],
    systems: ['original equipment tires and tread indicators', 'wheel alignment and suspension', 'placard pressure, load index and payload rating'],
    evidence: ['NTB14-014a is limited to 2013-2014 NV200.', 'It says perceived shoulder wear may be normal tread-pattern appearance.', 'No exact source supports the frozen geometry mechanism, nine-year span or 150-owner total.'],
    conflict: 'The indexed page reverses Nissan’s anti-overrepair guidance and expands a two-year appearance bulletin into a nine-year premature-wear defect.',
    summary: 'Held the overbroad tire-wear identity and preserved Nissan’s tread-measurement and normal-appearance boundary.',
    citations: ['tireWearBulletin', 'datasets'],
  }),
  [ids.slidingDoor]: held({
    description: `The complete exact NV200 manufacturer-communication and recall corpus does not establish sliding-door track contamination, roller wear and latch failure as one recurring 2013-2021 identity. It does not support monthly or three-month lubrication intervals, the asserted replacement prices or the claim that the entire latch assembly must be replaced. Sticking, sag, poor alignment, roller damage, latch faults, weatherstrip drag and body deformation require separate diagnosis. The frozen 120-owner total is unsupported.`,
    solution: `Reproduce the concern on level ground and inspect upper, center and lower guides, rollers, track damage and contamination, alignment, latch and striker operation, handles, cables, seals and body contact. Clean only with materials permitted by the service manual and repair the proven component. Do not buy rollers, a track, latch, striker, cable or lubricant from this page; failed location, door configuration, service procedure and VIN fitment must be established first.`,
    symptoms: ['sticking, sagging, latching and locking concerns separated', 'rollers, tracks, guides and alignment inspected', 'latch, striker, handle, cable and seal paths tested'],
    systems: ['sliding-door rollers, guides and tracks', 'latch, striker, handles and cables', 'weatherstrips, body opening and alignment'],
    evidence: ['No exact primary communication supports the frozen 2013-2021 identity.', 'No source establishes one contamination and latch mechanism.', 'The frozen intervals, costs and 120-owner total are unsupported.'],
    conflict: 'The indexed page combines several unrelated sliding-door causes into a nine-year failure identity without primary evidence.',
    summary: 'Held the unsupported sliding-door identity and removed the fabricated 120-owner total and universal replacement schedule.',
    citations: ['datasets'],
  }),
});

const pdfSources = Object.freeze({
  tireWearBulletin: { title: 'Nissan NTB14-014a - 2013-2014 NV200 Tire Wear Appearance', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10192353-9999.pdf', sha256: '6dbb7d0918645e3f1acfb41b55e7d73503a0fea4d79ba9f0d8dffb93ed37ef79', pageCount: 2, visuallyReviewedPages: [1, 2] },
  cvtFluidBulletin: { title: 'Nissan NTB14-077 - 2013-2015 NV200 NS-3 CVT Fluid', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10192422-9999.pdf', sha256: '3fbcb3b9de57127832f2b3e9bb15f5a0611c120babadf52c391a009c401c4652', pageCount: 1, visuallyReviewedPages: [1] },
  cvtCalibrationBulletin: { title: 'Nissan NTB12-103I - 2015-2021 NV200 CVT/TCM Calibration Data', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11001192-0001.pdf', sha256: 'ac11876e38082977e5f361933705b05e1cd59eacaccd124db100bb2179adbfd5', pageCount: 24, visuallyReviewedPages: [1, 24] },
});
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'NV200', slug: 'nv200', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-nv200-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['NV200'],
  searchTerms: ['catalytic converter', 'theft', 'CVT', 'P0868', 'P0746', 'P0744', 'tire wear', 'alignment', 'sliding door', 'door latch', 'door roller', 'door track'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 54, '2020-2024': 86, '2025-2026': 2 },
    totalRows: 142,
    relevantRowCount: 6,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 9 },
    totalRows: 9,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The exact NV200 recall corpus contains one later campaign and does not establish any of the four frozen 2013-2021 identities. The applicable tire and CVT boundaries come from manufacturer communications, not Part 573 recall populations.',
  },
  content,
  requiredProse: [
    { id: ids.catalystTheft, field: 'description', patterns: ['does not establish catalytic-converter theft vulnerability', '500-owner total'] },
    { id: ids.cvtFailure, field: 'description', patterns: ['NS-3 fluid requirements', 'post-replacement calibration', '280-owner total'] },
    { id: ids.tireWear, field: 'description', patterns: ['NTB14-014a', 'may instead be normal wear related to tread styling', '150-owner total'] },
    { id: ids.slidingDoor, field: 'description', patterns: ['does not establish sliding-door', '120-owner total'] },
  ],
  observations: [
    { code: 'four-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All four frozen NV200 identities exceed exact manufacturer evidence and remain indexed but blocked pending identity policy.' },
    { code: 'tire-anti-overrepair-boundary', severity: 'technical-accuracy', recordIds: [ids.tireWear], detail: 'NTB14-014a says the 2013-2014 original tire shoulder appearance may be normal tread styling and requires measurement; it does not support a nine-year suspension-geometry defect.' },
    { code: 'cvt-sources-not-failure-proof', severity: 'technical-accuracy', recordIds: [ids.cvtFailure], detail: 'The exact sources govern NS-3 fluid and calibration after parts replacement; neither proves commercial-use failure, a shortened interval or an aftermarket cooler.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Four unsupported owner totals totaling 1,050 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-nv200-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No NV200 page is removed, archived, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
