/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const snapshot = require('../data/_ram-deeplink-snapshot-2026-08-10.json');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const rows = snapshot.records.filter((row) => row.make === 'RAM' && row.model === 'ProMaster City').sort((left, right) => left.id.localeCompare(right.id));
const allIds = Object.freeze(rows.map((row) => row.id));
const reportCountCleanupIds = Object.freeze(rows.filter((row) => Number(row.reportCount) > 0).map((row) => row.id));
const ids = Object.freeze({
  transmissionA: 'ram-promaster-city-9speed-trans-2015',
  electrical: 'ram-promaster-city-electrical-issues-2015',
  rearDoor: 'ram-promaster-city-rear-door-hinge-2015',
  transmissionB: 'ram-promaster-city-transmission-9speed-2015',
});
const duplicateGroups = Object.freeze([{ code: 'nine-speed-transmission-identity-collision', recordIds: [ids.transmissionA, ids.transmissionB] }]);

const diagnosticByCategory = Object.freeze({
  body: 'support the door and inspect each hinge, pin, bushing, fastener, latch, striker, seal and body mounting point separately',
  electrical: 'capture a full-vehicle scan and event conditions, then load-test battery, charging, grounds, power feeds and networks before condemning a module',
  transmission: 'preserve TCM faults, software level, adaptation data, fluid identity and a repeatable road-test trace before separating calibration, hydraulic, converter, clutch and internal paths',
});

function genericIssue(row) {
  const diagnostic = diagnosticByCategory[row.category] || 'record and reproduce the exact condition, preserve fault data and isolate the failed system before replacement';
  return {
    description: `The complete RAM ProMaster City source pass (383 exact manufacturer-communication rows, 46 downloaded recall rows and 10 current live-API campaigns for frozen years) did not establish the full indexed identity "${row.title}" across every 2015-2022 year. Available records describe bounded builds, software levels, option content and symptom-specific procedures rather than one universal mechanism, owner-frequency claim or repair. This page remains published as an identity hold; its title, routing and vehicle metadata are unchanged.`,
    solution: `Start with the exact build, powertrain, duty cycle and symptom instead of assuming the title mechanism: ${diagnostic}. Check the VIN for open campaigns and preserve measurements and pre-repair data. Stop driving for propulsion loss, stalling in traffic, braking/steering loss, severe door instability, smoke or fire risk. Do not buy a repair part from this page; the failed path, software level, current part number, programming requirements and VIN fitment must be established first.`,
    symptoms: ['exact build, duty cycle and operating condition recorded', 'complete module and pre-repair data preserved', 'campaign, software, hydraulic, electrical and mechanical paths separated', 'failed component and VIN applicability established before parts'],
    affectedSystems: [`${row.category} system`, 'vehicle power, network and control paths where applicable', 'build-, option- and VIN-specific hardware'],
    evidence: ['Every exact local RAM ProMaster City communication and downloaded recall row was included.', 'The live NHTSA vehicle-year API was reconciled for every frozen 2015-2022 year.', 'No communication or campaign is converted into an owner total, recurrence rate or all-year mechanism.'],
    conflict: 'The frozen title and year scope exceed one exact manufacturer or regulator source; identity, years and routing require separate policy review.',
    summary: 'Held the overbroad or unresolved RAM ProMaster City identity, removed unsupported social proof and commerce, and restored diagnosis without changing indexed identity.',
    citations: ['datasets'],
    commerceDecision: 'failure path, software level, current component and part number, programming requirements and VIN fitment remain unresolved; no universal retail part',
  };
}

const content = Object.fromEntries(rows.map((row) => [row.id, genericIssue(row)]));
const transmissionDescription = 'The two frozen ProMaster City transmission pages cover the same 2015-2022 vehicle, nine-speed gearbox and harsh-shift/hesitation symptom family, so they form an indexed identity collision pending redirect policy. Exact communications confirm the 948TE/9HP48 application and bounded TCM or service conditions, but not either page as a universal all-year failure identity. The complete pass did not locate TSB 21-008-18 REV.C as described, and no primary source supports the frozen 1,950-owner total or universal valve-body/transmission replacement narrative.';
const transmissionSolution = 'Capture a repeatable road-test trace with TCM faults, software level, adaptation values, commanded/actual gear, temperature and fluid identity. Apply only VIN-applicable software or learn procedures, then separate calibration, wiring, solenoid, valve-body, converter, clutch and internal faults. Do not flush or substitute fluid by assumption. Do not buy fluid, a valve body, converter or transmission from this page; gearbox identity, failure path, current part number, programming requirements and VIN fitment must be established first.';
for (const id of [ids.transmissionA, ids.transmissionB]) content[id] = {
  ...genericIssue(rows.find((row) => row.id === id)),
  description: transmissionDescription,
  solution: transmissionSolution,
  evidence: ['Exact communications confirm the 948TE/9HP48 application and bounded TCM/service conditions.', 'The complete pass does not establish TSB 21-008-18 REV.C as described for this frozen identity.', 'The two frozen pages overlap the same vehicle, years, gearbox and symptom family and require identity policy before consolidation.'],
  conflict: 'Two indexed pages duplicate the same nine-speed harsh-shift/hesitation family, and neither full frozen title/year identity is supported by one exact source.',
  summary: 'Held the colliding nine-speed transmission identity, removed unsupported prevalence and commerce, and restored software-and-data-first diagnosis.',
  citations: ['datasets'],
  commerceDecision: 'duplicate identity policy, gearbox and fluid identity, failure path, current part number, programming requirements and VIN fitment remain unresolved; no universal retail part',
};

content[ids.electrical] = {
  ...genericIssue(rows.find((row) => row.id === ids.electrical)),
  description: 'The exact source inventory contains bounded electrical conditions, including 2018-2019 BCM software for a false running-light warning and low battery state, plus specific post-flash/proxy no-start cases. Those records do not establish the frozen combined 2015-2022 identity of random stalling, no-start, cluster blackout, warning lights, BCM/PCM failure, alternator failure and battery drain. The complete pass did not locate TSB 08-048-19 as described, so the page remains published as an identity hold and its 1,650-owner total becomes unknown.',
  solution: 'Capture a full-vehicle scan before clearing anything and record whether the event is crank/no-start, no-crank, stall, cluster reset, low-voltage or network loss. Load-test the battery and charging system; voltage-drop test primary powers and grounds; verify network integrity, ignition status and proxy/configuration state. Apply only VIN-applicable software after preserving data. Do not buy a battery, alternator, BCM, PCM or cluster from this page; the exact failed circuit/module, software level, programming requirements, current part number and VIN fitment must be established first.',
  evidence: ['Exact 2018-2019 BCM communications cover a false running-light warning and low battery state, not universal stalling.', 'Other exact records describe specific post-flash or proxy-configuration no-start identities.', 'No exact source in the complete pass proves TSB 08-048-19 or the frozen combined mechanism as described.'],
  conflict: 'The frozen page bundles several distinct power, network, configuration, cluster and propulsion identities into one all-year BCM/PCM narrative.',
  summary: 'Held the combined electrical/stalling identity, removed invented prevalence and restored event-specific power/network/configuration diagnosis.',
  citations: ['datasets'],
  commerceDecision: 'event identity, power/network/configuration fault, software level, current module part number, programming requirements and VIN fitment remain unresolved; no universal retail part',
};

content[ids.rearDoor] = {
  ...genericIssue(rows.find((row) => row.id === ids.rearDoor)),
  description: 'The complete exact-source pass did not establish the frozen 2015-2022 identity of upper driver-side rear cargo-door hinge-pin and bushing wear from commercial use, door sag, body scraping and water intrusion. The frozen video citation is not a usable primary source, and pin/bushing serviceability cannot be assumed without hinge and body inspection. The page remains published as an identity hold.',
  solution: 'Support each door safely and measure sag and latch/striker alignment before disassembly. Inspect every hinge leaf, pin, bushing, fastener, mounting surface, check strap, seal and door aperture for play, cracking, elongation or collision damage. Follow the body repair procedure when the mounting structure is damaged. Do not buy pins, bushings, hinges, reinforcement plates or seals from this page; door side, hinge design, structural condition, current part number and VIN fitment must be established first.',
  evidence: ['No exact communication or campaign in the complete pass proves the frozen all-year hinge-wear identity.', 'The frozen video URL is not accepted as primary evidence.', 'Door sag can arise from hinge, fastener, mounting-structure, striker or prior-damage paths.'],
  conflict: 'The frozen page asserts a recurring wear mechanism and repair-kit path without exact model-wide source or confirmed serviceability.',
  summary: 'Held the rear-door hinge identity and restored measured hinge/body/striker diagnosis without inventing a repair kit.',
  citations: ['datasets'],
  commerceDecision: 'door side, hinge design, pin/bushing serviceability, structural condition, current part number and VIN fitment remain unresolved; no universal retail part',
};

const pdfSources = Object.freeze({});
const otherSources = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL } });

module.exports = Object.freeze({
  make: 'RAM', frozenMakeValues: ['RAM'], model: 'ProMaster City', slug: 'promaster-city', reviewDate: '2026-08-11',
  snapshotFile: 'data/_ram-deeplink-snapshot-2026-08-10.json', snapshotFileSha256: 'e47326640702306eb85ee0cfc33418e55908fd72b4094ecff71186a2e0610623', snapshotHash: 'bdb5e4ec822f7c28c21a5f6f1143e49a0d89b1005428bf1ea93ba5059a7b9057',
  liveRecallFile: 'data/_ram-promaster-city-live-recalls-2026-08-11.json', outputFile: 'data/known-issue-ram-promaster-city-adjudication-2026-08-11.json',
  ids, allIds, retainedIds: [], reportCountCleanupIds, duplicateGroups, sourceMakes: ['RAM'], modelAliases: ['PROMASTER CITY'],
  searchTerms: ['9HP', '948TE', 'transmission', 'harsh shift', 'hesitation', 'stall', 'electrical', 'BCM', 'cluster', 'rear door', 'hinge'], relevantDocumentIds: ['10162512', '10170386', '10170390', '10190737', '10194037'], campaigns: [], pdfSources, otherSources,
  bulletinInventory: { source: DATASET_URL, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 241, '2020-2024': 132, '2025-2026': 10 }, totalRows: 383, broadTermMatchedRows: 66, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'All 383 exact RAM ProMaster City communications were searched. Exact records narrow nine-speed and BCM/no-start conditions; none proves a frozen identity at full title and year scope.' },
  recallInventory: { source: DATASET_URL, periodCounts: { pre: 0, post: 46 }, totalRows: 46, downloadedCampaignCount: 10, liveModernCampaignCount: 10, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })), scopeFinding: 'All 46 downloaded exact-model recall rows were reconciled with 10 current campaigns returned by the live ProMaster City API for 2015-2022. No recall establishes a frozen identity at full scope.' },
  content,
  requiredProse: [
    ...allIds.map((id) => ({ id, field: 'solution', patterns: ['Do not buy', 'VIN fitment'] })),
    { id: ids.transmissionA, field: 'description', patterns: ['identity collision', '21-008-18'] },
    { id: ids.transmissionB, field: 'description', patterns: ['identity collision', '21-008-18'] },
    { id: ids.electrical, field: 'description', patterns: ['08-048-19', 'false running-light warning'] },
    { id: ids.rearDoor, field: 'description', patterns: ['video citation', 'pin/bushing serviceability'] },
  ],
  observations: [
    { code: 'coverage-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All four frozen RAM ProMaster City rows are represented exactly once.' },
    { code: 'all-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All pages remain published holds; none is archived, redirected or relabeled.' },
    { code: 'transmission-identity-collision', severity: 'identity-safety', recordIds: duplicateGroups[0].recordIds, detail: 'Two indexed pages cover the same 2015-2022 nine-speed harsh-shift/hesitation family.' },
    { code: 'electrical-identity-bundled', severity: 'technical-accuracy', recordIds: [ids.electrical], detail: 'Bounded BCM and post-flash/proxy conditions do not prove one all-year stalling identity.' },
    { code: 'unsupported-named-bulletins', severity: 'source-integrity', recordIds: [ids.transmissionA, ids.transmissionB, ids.electrical], detail: 'The exact pass did not locate 21-008-18 REV.C or 08-048-19 as described.' },
    { code: 'invented-owner-counts-zeroed', severity: 'consumer-accuracy', recordIds: reportCountCleanupIds, detail: 'Two unsupported owner totals are proposed unknown and never rendered as 0+ owners.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'The frozen fluid fixPart and all other commerce are removed; no buy link or recommendation is introduced.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Titles, make, model, years, trims, engines, categories, severities, statuses and routing remain frozen.' },
  ],
});
