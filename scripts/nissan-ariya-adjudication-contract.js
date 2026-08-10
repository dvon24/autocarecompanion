/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  dcFastCharge: 'nissan-ariya-dc-fast-charging-2023',
  hvacRange: 'nissan-ariya-hvac-range-impact-2023',
  coldRange: 'nissan-ariya-range-cold-weather-2023',
  software: 'nissan-ariya-software-bugs-2023',
  ota: 'nissan-ariya-software-update-bricking-2023',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const reportCountCleanupIds = Object.freeze([ids.dcFastCharge, ids.hvacRange].sort());
const relevantDocumentIds = Object.freeze([
  '10231525', '10234081', '10239060', '10240542', '10242150', '10251539',
  '11001651', '11006461', '11006469', '11006968', '11012274', '11012275',
  '11012277', '11013272', '11024391', '11031697', '11031724',
]);
const campaigns = Object.freeze(['23V657000', '24V391000', '24V560000']);

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
  [ids.dcFastCharge]: held({
    description: `Nissan NTB24-040 applies to 2023-2025 Ariya vehicles that will not charge from a Level 3 charger and have one or two missing terminal caps at the high-voltage charge port. It does not establish a charging-speed defect, CCS-station incompatibility, session termination, cold-battery effects, a 130 kW performance shortfall or a 2026 population. The frozen 120-owner total is unsupported.`,
    solution: `Record charger operator, station ID, connector, displayed power, battery state/temperature, warnings and DTCs before moving stations. Apply NTB24-040 only when the two bottom charge-port terminals are missing caps; otherwise follow high-voltage charging diagnosis and check network/station behavior separately. Do not buy charge-port caps, a charge inlet, cable, adapter, software service or battery-conditioning product from this page; exact condition, high-voltage safety and fitment must be proven first.`,
    symptoms: ['charger, station and session details recorded', 'warnings and DTCs preserved', 'terminal-cap, station, thermal and vehicle-control paths separated'],
    systems: ['Level 3 high-voltage charge port', 'charge-control electronics and software', 'traction-battery temperature and external charging station'],
    evidence: ['NTB24-040 is limited to 2023-2025 Ariya vehicles with missing terminal caps.', 'The bulletin addresses failure to charge, not reduced charging speed.', 'No exact source supports a 2026 population or 120 owner reports.'],
    conflict: 'The indexed page merges one physical charge-port condition with station compatibility, charging speed and thermal behavior across four years.',
    summary: 'Held the overbroad DC-fast-charge identity and removed the fabricated 120-owner total.',
    citations: ['dcChargeBulletin', 'datasets'],
  }),
  [ids.hvacRange]: held({
    description: `The exact Ariya corpus contains a 2023-2025 bulletin for insufficient cabin cooling around 40 C that reprograms the A/C auto amplifier and heat-pump control unit when applicable. It does not establish cold-weather heat-pump inefficiency, supplemental-heater activation, 40-50 percent range loss, a 2023-2026 defect population or a software update that improves winter efficiency. The frozen 110-owner total is unsupported.`,
    solution: `Separate expected energy use from a cabin-heating fault by recording ambient temperature, route, state of charge, climate settings, preconditioning and delivered cabin temperature. Preserve HVAC/EV codes and compare heat-pump, PTC-heater and battery-conditioning operation to the service manual. Do not buy a heat pump, PTC heater, control unit, software service or range accessory from this page; measured thermal performance and exact bulletin applicability must be proven first.`,
    symptoms: ['ambient, route and climate settings recorded', 'delivered cabin temperature and energy use measured', 'heat pump, PTC heater, battery conditioning and normal cold-weather demand separated'],
    systems: ['heat-pump HVAC and A/C auto amplifier', 'PTC supplemental heater', 'traction battery, thermal management and range estimation'],
    evidence: ['11031697 addresses hot-weather insufficient cooling, not cold-weather range loss.', 'No exact source proves a 40-50 percent cold-range defect or 2026 scope.', 'The 110-owner total and winter-efficiency software claim are unsupported.'],
    conflict: 'The indexed page converts expected cold-weather energy demand and an unrelated hot-weather bulletin into a four-year heat-pump defect.',
    summary: 'Held the unsupported HVAC-range identity and removed the fabricated 110-owner total.',
  }),
  [ids.coldRange]: held({
    description: `Cold ambient temperature, cabin heating, speed, wind, tires, route and battery conditioning can reduce EV range, but the exact corpus does not establish a 25-40 percent Ariya defect, a 150-180-mile winter population or the frozen equipment claim that a heat pump is standard only on Platinum. The cited Reddit and YouTube URLs are fabricated placeholders and cannot support the percentages.`,
    solution: `Use the vehicle's trip-energy and climate data to compare the same route, speed, temperature, tire pressure and state of charge. Precondition while connected when supported and plan charging from measured consumption and available chargers, not a fixed 40 percent rule. Do not buy a charger, heater, battery product, tire product or range accessory from this page; actual energy use, battery condition and route requirements must be measured first.`,
    symptoms: ['ambient, route, speed and tire conditions recorded', 'trip and climate energy use compared', 'normal temperature effect, HVAC load and battery fault separated'],
    systems: ['traction battery and thermal management', 'cabin HVAC and preconditioning', 'range estimation, tires, route and charging plan'],
    evidence: ['No exact manufacturer record supports the frozen percentage or mileage claims.', 'The current social/video citations are fabricated placeholders.', 'Cold-weather range is an operating result, not proof of one failed component.'],
    conflict: 'The indexed page labels a variable operating result as a model defect using fabricated citations and fixed percentages.',
    summary: 'Held the unsupported cold-range identity and removed fabricated percentage, mileage and source claims.',
  }),
  [ids.software]: held({
    description: `The exact corpus contains distinct, bounded software conditions: wireless-phone charging, 12-volt charging logic, inverter fail-safe recalls, IVI/CAN-gateway campaigns and specific warning/DTC procedures. It does not establish one 2023-2026 first-generation software defect spanning infotainment, navigation, EV charging, mobile app, range estimation and OTA installation. The frozen techinfo and Reddit URLs are not valid exact records.`,
    solution: `Record VIN, option, module/software versions, warning messages, DTCs, network state and the exact sequence for one symptom at a time. Check Service COMM for open campaigns and apply only the matching service procedure; preserve data before resets or reprogramming. Do not buy an infotainment unit, telematics module, 12-volt battery, charger, gateway, inverter or software service from this page; the affected module, campaign and failure sequence must be proven first.`,
    symptoms: ['module/software versions and exact sequence recorded', 'warnings, DTCs and network state preserved', 'IVI, app, charging, gateway, inverter and 12-volt paths separated'],
    systems: ['IVI and navigation', 'CAN gateway, telematics and mobile services', 'charging controls, inverter and 12-volt support'],
    evidence: ['Manufacturer records are condition- and module-specific.', 'No exact source supports a universal 2023-2026 software-bug identity.', 'The frozen citations are invalid or placeholder URLs.'],
    conflict: 'The indexed page merges unrelated software domains and campaigns into one four-year defect.',
    summary: 'Held the overbroad software-bugs identity and required module-specific evidence.',
  }),
  [ids.ota]: held({
    description: `Campaigns P4A30 and P4A31 cover certain 2023-2024 Ariyas. A failed navigation OTA can leave ignition-on inhibit active because the IVI does not send completion to the CAN gateway, causing a no-start; dealers update IVI software and, when needed, gateway software. The campaign does not support 2025 vehicles, climate-control failure, a generally non-drivable state, Wi-Fi/battery-precondition rules, a do-not-retry instruction or a guaranteed warranty/tow outcome.`,
    solution: `Check VIN status for P4A30/P4A31. If the vehicle will not enter READY after an OTA attempt, preserve messages and do not perform unsupported resets; contact Nissan/dealer assistance for the campaign-controlled IVI/gateway procedure. Diagnose infotainment-only or climate symptoms separately. Do not buy an IVI unit, CAN gateway, 12-volt battery, charger, software reload or tow service from this page; campaign eligibility and failed update state must be proven first.`,
    symptoms: ['VIN checked for P4A30/P4A31', 'OTA sequence, messages and READY/no-start state recorded', 'IVI, gateway, 12-volt and unrelated climate paths separated'],
    systems: ['navigation/IVI OTA process', 'CAN gateway and ignition-on inhibit', '12-volt support, READY state and dealer programming'],
    evidence: ['P4A30/P4A31 are limited to certain 2023-2024 Ariyas.', 'The exact effect is a no-start after a failed navigation OTA.', 'The frozen 2025 scope, climate failures and user-update instructions are unsupported.'],
    conflict: 'The indexed identity expands one bounded no-start campaign into three years of broad OTA bricking and unsupported owner instructions.',
    summary: 'Held the overbroad OTA identity and preserved exact P4A30/P4A31 no-start scope.',
    citations: ['otaCampaign', 'datasets'],
  }),
});

const pdfSources = Object.freeze({
  dcChargeBulletin: {
    title: 'Nissan NTB24-040 - 2023-2025 Ariya Missing Level 3 Charge-Port Terminal Caps',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11013272-0001.pdf',
    sha256: '62c2c2d02cf2b02733d24df2f6d94d9145b1fbfce9bc275a82338085692dca80',
    pageCount: 5,
    visuallyReviewedPages: [1, 5],
  },
  otaCampaign: {
    title: 'Nissan P4A30/P4A31 - 2023-2024 Ariya IVI and CAN Gateway Reprogram',
    type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012274-0001.pdf',
    sha256: '82ef1d900e290b0eb8b33916099529ca9cd5cca32bbcb29e645b69a6694b863c',
    pageCount: 3,
    visuallyReviewedPages: [1, 3],
  },
});
function recallApi(campaign, title) {
  return Object.freeze({ title, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`, contains: campaign });
}
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  inverterRecall2023: recallApi('23V657000', 'NHTSA Recall 23V657000 - 2023 Ariya Inverter Software'),
  motorRecall: recallApi('24V391000', 'NHTSA Recall 24V391000 - 2023 Ariya Front Traction Motor O-Rings'),
  inverterRecall2024: recallApi('24V560000', 'NHTSA Recall 24V560000 - 2023 Ariya Inverter Software'),
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Ariya', slug: 'ariya', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-ariya-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['ARIYA'],
  searchTerms: ['charging', 'charger', 'quick charge', 'HVAC', 'heat pump', 'range', 'cold', 'software', 'infotainment', 'OTA', 'over-the-air', 'update'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 0, '2020-2024': 45, '2025-2026': 16 },
    totalRows: 61,
    relevantRowCount: 17,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 7 },
    totalRows: 7,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'All three safety-recall identities concern bounded 2023 inverter or traction-motor conditions. None proves the five frozen charging, cold-range, HVAC or broad software identities.',
  },
  content,
  requiredProse: [
    { id: ids.dcFastCharge, field: 'description', patterns: ['2023-2025', 'missing terminal caps', 'does not establish a charging-speed defect'] },
    { id: ids.hvacRange, field: 'description', patterns: ['40 C', 'does not establish cold-weather', '110-owner'] },
    { id: ids.coldRange, field: 'description', patterns: ['fabricated placeholders', 'does not establish a 25-40 percent'] },
    { id: ids.ota, field: 'description', patterns: ['2023-2024', 'ignition-on inhibit', 'does not support 2025'] },
  ],
  observations: [
    { code: 'all-five-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'Every frozen Ariya identity exceeds exact primary evidence and remains published pending identity policy.' },
    { code: 'valid-charging-bulletin-not-expanded', severity: 'technical-accuracy', recordIds: [ids.dcFastCharge], detail: 'NTB24-040 remains limited to missing Level 3 terminal caps on 2023-2025 vehicles and is not used as proof of speed or compatibility defects.' },
    { code: 'valid-ota-campaign-not-expanded', severity: 'technical-accuracy', recordIds: [ids.ota, ids.software], detail: 'P4A30/P4A31 remains limited to a navigation-OTA no-start on certain 2023-2024 VINs.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Two unsupported owner totals totaling 230 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-ariya-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Ariya page is removed, archived, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
