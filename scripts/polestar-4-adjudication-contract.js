/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  battery: 'polestar-polestar-4-86-kwh-battery-thermal-runaway-risk-china-recall-charge-limi',
  software: 'polestar-polestar-4-gps-off-by-100-200-m-infotainment-lag-driver-assist-settings',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.battery]);
const reportCountCleanupIds = Object.freeze([]);

const content = Object.freeze({
  [ids.battery]: Object.freeze({
    description: 'China\'s State Administration for Market Regulation lists recall S2026M0045V for 1,473 domestically produced 2023-2024 Polestar 4 vehicles equipped with an 86 kWh high-voltage battery and built from November 16, 2023 through May 24, 2024. The regulator says manufacturing consistency in battery components can cause internal resistance to rise abnormally after prolonged use, reduce battery performance and, in extreme cases, cause thermal runaway. The filing does not identify a battery supplier or prove that the condition is shared with Zeekr, Volvo or other Geely-group vehicles.',
    solution: 'Owners of a China-market 86 kWh Polestar 4 should verify recall eligibility through Polestar or the SAMR recall system. Until the affected battery modules are replaced, follow the regulator\'s temporary instruction not to charge the high-voltage battery above 70%. The recall remedy is free replacement of all affected battery modules. If the battery warning lamp and audible warning activate, pull over immediately when safe, call Polestar China support at 400-6171-017 and wait for rescue as the filing directs. Do not open, test or repair the high-voltage pack. Do not buy a battery module, cell, charger or thermal-management part from this page; campaign eligibility and the authorized remedy are VIN-specific.',
    symptoms: ['SAMR campaign eligibility verified', 'battery warning lamp and audible warning treated as stop conditions', 'temporary 70% charge ceiling followed until remedy'],
    affectedSystems: ['86 kWh high-voltage battery modules', 'battery monitoring and warning system', 'high-voltage charging and thermal safety'],
    evidence: ['SAMR recall S2026M0045V identifies 1,473 domestic 2023-2024 Polestar 4 vehicles with 86 kWh batteries and the exact production window.', 'SAMR identifies abnormal internal-resistance growth, possible performance decline and extreme-case thermal runaway.', 'SAMR directs free replacement of affected battery modules and recommends no charging above 70% before replacement.', 'The primary filing does not identify Sunwoda or establish the frozen cross-brand quality narrative.'],
    conflict: null,
    summary: 'Retained the primary-source China battery-recall identity while removing supplier, cross-brand and market-absence speculation and adding exact emergency guidance.',
    citations: ['samrBatteryRecall'],
    commerceDecision: 'campaign eligibility and authorized high-voltage battery-module remedy are VIN-specific; no universal retail part',
  }),
  [ids.software]: Object.freeze({
    description: 'Polestar\'s official Polestar 4 release notes document successive center-display, digital-key, driver-profile, charge-limit, driver-assistance and settings-persistence improvements. They support that separate software defects have existed, but they do not establish the frozen title\'s 100-200 m GPS offset, two-hour duration, 20-60 second unlock delay or a single P4.x mechanism. The frozen page also converts forum and media anecdotes into a claim that more than 600 owners echoed the same problem; no primary source or catalog report data supports that social proof.',
    solution: 'Check the installed version under Settings, System, Software updates and read the release notes for that exact version, market, model year and equipment. Record the warning, unavailable function, app, location behavior, driver profile, connectivity state and time of occurrence before restarting infotainment or installing an available update. If a driver-assistance or stability function is unavailable, drive without relying on it, increase following distance and stop if the vehicle cannot be operated safely; persistent installation or function failures belong with Polestar support or an authorized workshop. A lock-and-leave cycle, Apple CarPlay or a future release is not presented as a universal cure. Do not buy a display, GPS antenna, VGM, connectivity module, camera or control module from this page; software, profile, network, sensor and hardware causes plus VIN fitment remain unresolved.',
    symptoms: ['software version and exact unavailable function recorded', 'profile, connectivity and location symptoms separated', 'driver-assistance unavailability treated as a safety limitation'],
    affectedSystems: ['Polestar OS, center display and applications', 'navigation, connectivity and digital key', 'driver profiles, assistance settings and sensors'],
    evidence: ['Official Polestar release notes document multiple bounded software and settings fixes across successive versions.', 'The release notes do not establish the frozen numeric GPS offset, duration, phone-key delay or one shared mechanism.', 'The complete NHTSA communications corpus contains 29 exact Polestar 4 rows, but none proves the frozen title as a single defect population.', 'No primary source or catalog data supports the frozen more-than-600-owner claim.'],
    conflict: 'The indexed title asserts precise GPS, settings and software-version failure facts that official release notes do not establish as one population, while the body adds unsupported owner social proof.',
    summary: 'Held the over-specific software identity, removed fabricated social proof and separated version, profile, connectivity, navigation and safety-assistance diagnosis.',
    citations: ['softwareUpdates', 'otaManual', 'malfunctionManual', 'datasets'],
    commerceDecision: 'software version, profile, network, GPS, digital-key, display, sensor, camera, module and VIN fitment paths remain unresolved; no universal retail part',
  }),
});

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({
  samrBatteryRecall: { title: 'SAMR Recall S2026M0045V - 86 kWh Polestar 4 Battery Modules', type: 'government', url: 'https://www.samr.gov.cn/zw/zh/art/2026/art_8e238c06207b4f13a57245aa849ae8b5.html' },
  softwareUpdates: { title: 'Polestar 4 Software Update Release Notes', type: 'manufacturer', url: 'https://www.polestar.com/us/manual/polestar-4/2025/software-updates/' },
  otaManual: { title: 'Polestar 4 Over-the-Air Updates', type: 'manufacturer', url: 'https://www.polestar.com/us/manual/polestar-4/2025/article/47d2c97fd33effd3c0a8cc3718c999b7-4086f4b55541cb54c0a8b097110c7c13-8664b2fa77a7e089c0a8296870d1a409' },
  malfunctionManual: { title: 'Polestar 4 Malfunction Guidance', type: 'manufacturer', url: 'https://www.polestar.com/us/manual/polestar-4/2025/article/f558786dce01385ec0a8b04a5cd4f99b-e72f40e7d3b4148ec0a8cc3738920216-35332039595c9067c0a8b0977f415d8e' },
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL },
});

module.exports = Object.freeze({
  make: 'Polestar',
  model: 'Polestar 4',
  slug: 'polestar-4',
  reviewDate: '2026-08-10',
  snapshotFile: 'data/_polestar-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-polestar-4-adjudication-2026-08-10.json',
  ids,
  allIds,
  retainedIds,
  reportCountCleanupIds,
  sourceMakes: ['POLESTAR'],
  modelAliases: ['POLESTAR 4', 'PS4'],
  searchTerms: ['86 kWh', 'battery', 'thermal runaway', 'GPS', 'infotainment', 'digital key', 'driver profile', 'software'],
  relevantDocumentIds: [],
  campaigns: [],
  pdfSources,
  otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 0, '2025-2026': 29 },
    totalRows: 29,
    relevantRowCount: 0,
    uniqueRelevantCommunications: 0,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete NHTSA communications corpus contains 29 exact POLESTAR 4 rows, all in the 2025-2026 source file. None proves the frozen GPS/settings/software title as one defect population.',
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 0 },
    totalRows: 0,
    campaignCount: 0,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The U.S. NHTSA flat recall corpus contains no exact Polestar 4 rows. The retained battery campaign is a China-market SAMR recall and is not represented as a U.S. campaign.',
  },
  content,
  requiredProse: [
    { id: ids.battery, field: 'description', patterns: ['S2026M0045V', '1,473', 'does not identify a battery supplier'] },
    { id: ids.battery, field: 'solution', patterns: ['not to charge the high-voltage battery above 70%', 'pull over immediately', 'Do not buy a battery module'] },
    { id: ids.software, field: 'description', patterns: ['do not establish the frozen title', 'No primary source or catalog report data supports'] },
    { id: ids.software, field: 'solution', patterns: ['drive without relying on it', 'not presented as a universal cure', 'Do not buy a display'] },
  ],
  observations: [
    { code: 'battery-identity-retained', severity: 'source-integrity', recordIds: [ids.battery], detail: 'SAMR primary evidence supports the China 86 kWh battery-recall identity and frozen 2024 subset.' },
    { code: 'battery-campaign-exact', severity: 'source-integrity', recordIds: [ids.battery], detail: 'Campaign S2026M0045V covers 1,473 domestic MY2023-2024 vehicles built November 16, 2023 through May 24, 2024.' },
    { code: 'thermal-risk-exact', severity: 'safety-accuracy', recordIds: [ids.battery], detail: 'SAMR identifies abnormal internal-resistance growth, performance decline and extreme-case thermal runaway.' },
    { code: 'charge-limit-exact', severity: 'safety-accuracy', recordIds: [ids.battery], detail: 'The temporary no-charge-above-70% instruction is retained exactly until module replacement.' },
    { code: 'battery-emergency-guidance-exact', severity: 'safety-accuracy', recordIds: [ids.battery], detail: 'Warning lamp and sound route the driver to pull over, call Polestar China and wait for rescue.' },
    { code: 'battery-supplier-not-inferred', severity: 'source-integrity', recordIds: [ids.battery], detail: 'The primary filing does not identify Sunwoda, so supplier attribution is removed.' },
    { code: 'cross-brand-link-not-inferred', severity: 'source-integrity', recordIds: [ids.battery], detail: 'Zeekr, Volvo and other Geely-group actions are not used as proof for this Polestar campaign.' },
    { code: 'market-absence-not-asserted', severity: 'source-integrity', recordIds: [ids.battery], detail: 'The proposal does not convert an absent reviewed U.S. row into proof that no other-market action exists.' },
    { code: 'software-identity-held', severity: 'identity-safety', recordIds: [ids.software], detail: 'The over-specific GPS/settings/software title remains published and held.' },
    { code: 'software-release-notes-bounded', severity: 'technical-accuracy', recordIds: [ids.software], detail: 'Official version notes prove only their listed fixes, not one shared P4.x failure mechanism.' },
    { code: 'gps-magnitude-unverified', severity: 'source-integrity', recordIds: [ids.software], detail: 'The frozen 100-200 m offset and two-hour duration are not established by primary evidence.' },
    { code: 'phone-key-delay-unverified', severity: 'source-integrity', recordIds: [ids.software], detail: 'The frozen 20-60 second unlock-delay range is not retained as fact.' },
    { code: 'owner-social-proof-removed', severity: 'source-integrity', recordIds: [ids.software], detail: 'The unsupported more-than-600-owner statement is removed from proposed prose.' },
    { code: 'communications-inventory-complete', severity: 'source-integrity', recordIds: [ids.software], detail: 'All 29 exact Polestar 4 NHTSA communication rows were searched.' },
    { code: 'us-recall-inventory-complete', severity: 'source-integrity', recordIds: allIds, detail: 'The flat NHTSA recall corpus contains zero exact Polestar 4 rows; the China recall is not mislabeled as U.S.' },
    { code: 'driver-assistance-boundary', severity: 'safety-accuracy', recordIds: [ids.software], detail: 'Unavailable assistance requires manual driving without reliance and stopping if safe operation is not possible.' },
    { code: 'no-universal-software-workaround', severity: 'technical-accuracy', recordIds: [ids.software], detail: 'Lock-and-leave, Apple CarPlay and future releases are not presented as universal cures.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No battery, display, GPS, VGM, camera, sensor or module commerce is introduced.' },
    { code: 'no-zero-owner-text', severity: 'seo-safety', recordIds: allIds, detail: 'Both unknown counts remain zero and never render as 0+ owners.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Title, slug routing, model, years, trims, engines, category, severity, status and related links remain frozen.' },
    { code: 'software-production-write-blocked', severity: 'release-safety', recordIds: [ids.software], detail: 'No body-only production write is authorized for the held software identity.' },
  ],
});
