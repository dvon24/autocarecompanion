/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_genesis-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-genesis-adjudication-2026-08-05.json');
const DECISIONS_DIR = path.join(PROJECT_ROOT, 'data', 'known-issues-catalog-deeplink-decisions');

const FULL_RECORD_FIELDS = [
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'description', 'solution',
  'severity', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow',
  'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations',
  'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'status',
  'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary', 'relatedIssueIds',
];

const PROTECTED_FIELDS = [
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status',
  'relatedIssueIds',
];

const REWRITE_IDS = new Set([
  'genesis-g70-abs-module-electrical-short-causing-engine-bay-fire-risk',
  'genesis-g70-headlight-condensation-moisture-causing-lighting-failure',
  'genesis-g70-high-pressure-fuel-pump-failure-causing-power-loss',
  'genesis-g70-parasitic-battery-drain-dead-12v-battery',
  'genesis-g70-sunroof-headliner-rattle-creaking-noise',
  'genesis-g70-torque-converter-internal-rivet-damage-scratching-noise-low',
  'genesis-g70-turbo-oil-line-leak',
  'genesis-g80-infotainment-glitches',
  'genesis-g90-8-speed-automatic-harsh-jerky-upshifts-low-speed-lurch',
  'genesis-g90-blank-instrument-cluster-startup-due-to-lg-software-logic-er',
  'genesis-g90-coolant-leaks-from-water-pump-thermostat-housing',
  'genesis-g90-fuel-crossover-pipe-leaks-engine-rail-fire-risk',
  'genesis-g90-left-turbocharger-oil-feed-pipe-cracks-leaks-oil-onto-exhaus',
  'genesis-g90-low-pressure-fuel-pump-impeller-deforms-heat-causing-stallin',
  'genesis-g90-repeated-12v-battery-drain-dead-battery-from-head-unit-modul',
  'genesis-g90-savile-silver-paint-reflects-corner-radar-triggering-phantom',
  'genesis-g90-seat-belt-pretensioner-over-pressurization-can-rupture-eject',
  'genesis-g90-water-intrusion-into-starter-solenoid-causes-electrical-shor',
  'genesis-gv60-12v-battery-drain',
  'genesis-gv70-12v-auxiliary-battery-drain-dead-battery-bricking',
  'genesis-gv70-c-not-cooling-weak-cooling-one-side',
  'genesis-gv70-fuel-pipe-to-rail-connection-leak-fire-risk',
  'genesis-gv70-headlight-assembly-moisture-condensation-buildup',
  'genesis-gv70-iccu-failure-causing-loss-drive-power',
  'genesis-gv70-instrument-cluster-blank-flickering-startup',
  'genesis-gv70-low-pressure-fuel-pump-impeller-failure-causing-stalling',
  'genesis-gv70-panoramic-sunroof-headliner-rattle-wind-noise',
  'genesis-gv70-rear-differential-elsd-whine-repeat-carrier-failure',
  'genesis-gv70-sunroof-drain-clog-causing-water-leak-into-cabin',
  'genesis-gv70-transmission-harness-water-leak-causing-park-to-neutral-roll',
  'genesis-gv80-2-5l-t-gdi-cold-start-misfire-p0300-p0304',
  'genesis-gv80-front-seat-belt-pretensioner-can-explode-project-metal-fragm',
  'genesis-gv80-infotainment-issues',
  'genesis-gv80-instrument-cluster-goes-blank-startup-software-logic-error',
  'genesis-gv80-low-pressure-fuel-pump-impeller-deformation-causes-stalling',
  'genesis-gv80-rear-differential-hum-whine-noise-from-improperly-torqued-pi',
]);

const DUPLICATES = new Map([
  ['genesis-g80-electrified-software', 'genesis-g80-infotainment-glitches'],
]);

const ARCHIVE_REASONS = {
  'genesis-g70-3-3t-oil-consumption-smoke-fouled-plugs': 'The only attached primary citation is the unrelated 24V107 starter-solenoid recall; it does not support oil-consumption, turbo-seal, plug-fouling, carbon-cleaning, or five-year population claims.',
  'genesis-g70-electronic-parking-brake-actuator-failure-won-t-release-enga': 'The only attached primary citation is the unrelated 20V569 fuel-pump jet-nozzle recall; no Genesis bulletin in the frozen evidence defines this six-year EPB actuator population or remedy.',
  'genesis-g70-front-brake-rotor-warping-pulsation': 'The only attached primary citation is the unrelated 22V196 trunk-latch recall. ShowMeTheParts also returns multiple front/rear, engine, trim, and brake-package configurations, so no universal rotor or pad link is defensible.',
  'genesis-g70-gdi-intake-valve-carbon-buildup': 'The attached bulletin is for an inoperative horn, not intake-valve deposits. Rough idle and misfire do not establish carbon buildup or a universal cleaning remedy.',
  'genesis-g70-infotainment-lag': 'A 2026 navigation-update bulletin does not establish the frozen 2019-2022 lag/crash population, boot-time claim, or head-unit replacement path.',
  'genesis-g70-lsd-noise': 'A generic NHTSA dataset landing page is not issue evidence and does not establish a 2019-2026 LSD chatter population, fluid cause, or universal friction-modifier remedy.',
  'genesis-g70-power-folding-mirror-failure': 'A generic NHTSA dataset landing page is not issue evidence and does not establish a mirror motor, gear, or module failure population or replacement procedure.',
  'genesis-g70-soft-clear-coat-easy-chipping-peeling-swirl-marks': 'A generic NHTSA dataset landing page is not issue evidence and does not establish a universal soft-clear-coat defect or warranty outcome across eight model years.',
  'genesis-g70-transmission-shift-quality': 'A generic NHTSA dataset landing page is not issue evidence and the card combines upshift, downshift, adaptation, fluid, solenoid, valve-body, clutch, and transmission claims without a defined DTC/build population.',
  'genesis-g90-5-0l-tau-v8-gdi-intake-valve-carbon-buildup-some-oil-consump': 'The attached 18V305 glass-bond recall is unrelated to carbon buildup and oil consumption and cannot support the frozen repair or scope.',
  'genesis-g90-air-suspension-failures-leaking-air-struts-bags-compressor-b': 'The frozen 2017-2022 population does not have the claimed factory air-suspension system; first-generation G90 uses electronically controlled damping.',
  'genesis-g90-infotainment-navigation-screen-freezes-goes-blank-requiring': 'A 2026 navigation-update bulletin does not establish the frozen 2017-2020 freeze/blank-screen population or hardware-replacement remedy.',
  'genesis-g90-intermittent-dashboard-warning-cascade-electronic-parking-br': 'The attached 26V218 seat-belt-anchor recall is unrelated to a 2023 dashboard-warning cascade or EPB lockout.',
  'genesis-g90-power-trunk-fails-to-close-latch-release-often-due-to-lid-mi': 'A generic NHTSA dataset landing page is not issue evidence and does not establish a power-trunk motor, latch, alignment, or module failure pattern across six model years.',
  'genesis-g90-panoramic-sunroof-creaking-rattling-wind-noise': 'The attached bulletin applies to the 2015-2016 Hyundai Genesis (DH), not the Genesis G90. No G90 primary source in the frozen evidence supports the stated sunroof-noise population or repair.',
  'genesis-gv60-ota-software-issues': 'The attached 25V474 instrument-display recall does not establish interrupted OTA installs, charging-management errors, or the frozen four-year remedy path.',
  'genesis-gv60-range-inconsistency': 'The attached 23V300 rear-driveshaft recall is unrelated to range estimation; the remaining claims describe expected EV temperature/speed effects rather than a defined Genesis defect.',
  'genesis-gv70-8-speed-automatic-jerky-downshift-syndrome-throttle-response': 'The attached E-module diagnostic bulletin is DTC-gated and does not establish the owner-created Jerky Downshift Syndrome, throttle-response claim, or all-vehicle calibration remedy.',
  'genesis-gv70-brake-noise': 'The attached campaign applies only to specified non-retailed 2026 dealer-stock vehicles and requires completion before retail delivery. It does not support the frozen 2022-2026 owner brake-squeal and dust population.',
  'genesis-gv70-electrified-range': 'The attached P1ABD00 charging-stop bulletin is not evidence of range-estimate inconsistency or the frozen learning-period and percentage claims.',
  'genesis-gv70-forward-collision-avoidance-assist-phantom-unwanted-automati': 'The attached radar bulletin covers a warning/DTC and explicitly says ADAS functions are not affected; it does not support the frozen unwanted-braking scenarios.',
  'genesis-gv70-infotainment-freeze': 'The attached bulletin covers recovery from an incomplete AVN update, not a five-year population of spontaneous freezes and reboots.',
  'genesis-gv70-paint-color-mismatch-between-plastic-trim-metal-body-panels': 'The attached bulletin covers temporary paint clouding under delivery protection film, not Uyuni White color mismatch between plastic and metal panels.',
  'genesis-gv80-coupe-harsh-ride-impact-harshness-22-inch-wheels': 'The attached bulletin covers ignition-off battery drain and CCU software, not ride harshness or a suspension/tire defect.',
  'genesis-gv80-diesel-nox': 'A generic NHTSA U.S. dataset page cannot support an international-market diesel SCR/NOx population, DTC set, or repair path.',
  'genesis-gv80-head-up-display-fades-eclipse-effect-before-total-failure': 'A generic NHTSA dataset page is not issue evidence and does not establish the asserted HUD overheating, progression, replacement, or price claims.',
};

const DIRECT_RECALL_URLS = {
  '21V161': 'https://static.nhtsa.gov/odi/rcl/2021/RMISC-21V161-7687.pdf',
  '23V094': 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V094-8676.PDF',
  '23V210': 'https://static.nhtsa.gov/odi/rcl/2023/RCONL-23V210-0567.pdf',
  '24V107': 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V107-7565.PDF',
  '24V191': 'https://static.nhtsa.gov/odi/rcl/2024/RCAK-24V191-1657.pdf',
  '24V205': 'https://static.nhtsa.gov/odi/rcl/2024/RCMN-24V205-5045.pdf',
  '24V282': 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V282-3386.PDF',
  '24V528': 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V528-3962.PDF',
  '24V868': 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V868-6699.PDF',
  '25V105': 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V105-8787.PDF',
  '25V474': 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V474-6532.pdf',
  '25V833': 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V833-5047.pdf',
  '26V019': 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V019-3487.pdf',
  '26V229': 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V229-0144.pdf',
};

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function hashValue(value) {
  return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex');
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function cleanText(value) {
  if (typeof value === 'string') {
    return value
      .replaceAll('â€™', "'")
      .replaceAll('â€”', '—')
      .replaceAll('â€“', '–')
      .replaceAll('â€œ', '“')
      .replaceAll('â€', '”');
  }
  if (Array.isArray(value)) return value.map(cleanText);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cleanText(item)]));
  }
  return value;
}

function fullRecord(row) {
  return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, cleanText(row[field])]));
}

function loadLegacyCards() {
  const cards = new Map();
  const files = fs.readdirSync(DECISIONS_DIR)
    .filter((name) => /^_config-genesis-.*-full-record\.cjs$/.test(name));
  for (const file of files) {
    const source = fs.readFileSync(path.join(DECISIONS_DIR, file), 'utf8');
    const sandbox = {
      module: { exports: {} },
      exports: {},
      require: (request) => {
        if (request.includes('_config-buick-remaining-factory')) return { buildConfig: (value) => value };
        return require(request);
      },
    };
    vm.runInNewContext(source, sandbox, { filename: file });
    for (const [id, decision] of Object.entries(sandbox.module.exports.published || {})) {
      cards.set(id, cleanText(decision));
    }
  }
  return cards;
}

function directCitation(citation) {
  const campaign = `${citation.title || ''} ${citation.url || ''}`.match(/\b(\d{2}V\d{3})\b/i)?.[1]?.toUpperCase();
  return {
    ...citation,
    url: campaign && DIRECT_RECALL_URLS[campaign] ? DIRECT_RECALL_URLS[campaign] : citation.url,
  };
}

function safeTrims(trims) {
  if (!Array.isArray(trims)) return [];
  return trims.filter((trim) => !/\b(?:20\d{2}|vehicle|covered|equipped|applicable|production|campaign|bulletin|vin)\b/i.test(trim));
}

function g80Canonical() {
  return {
    years: [2023, 2024, 2025, 2026],
    trims: [],
    engines: [],
    category: 'electrical',
    title: 'Instrument-Panel and AVN Display Software Recalls',
    description: 'NHTSA campaign 25V105 covers certain 2023-2024 Genesis G80 vehicles whose instrument-panel display can fail or flicker at startup because of software logic. Campaign 26V019 separately covers certain 2025-2026 G80 and 2026 Electrified G80 vehicles whose instrument-panel and audio/video/navigation displays can temporarily reboot during driving because of an HD Radio memory error.',
    solution: 'Check the VIN and model year with Genesis. The applicable remedy is a free software inspection and update by a Genesis retailer; campaign 26V019 may also be delivered over the air to eligible enrolled vehicles. Genesis advises owners covered by 26V019 to disable HD Radio while driving until the remedy is installed.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Instrument-panel display may fail or flicker at startup', 'Instrument-panel and AVN displays may temporarily reboot while driving'],
    affectedSystems: ['instrument-panel display', 'audio/video/navigation head unit', 'display software', 'HD Radio memory logic'],
    dtcCodes: [],
    citations: [
      { type: 'recall', title: 'NHTSA Campaign 25V105 - G80 Instrument-Panel Display', url: DIRECT_RECALL_URLS['25V105'] },
      { type: 'recall', title: 'NHTSA Campaign 26V019 - G80 and Electrified G80 Display Reboot', url: DIRECT_RECALL_URLS['26V019'] },
    ],
    summary: 'Narrowed the unsupported ten-year infotainment aggregation to two VIN-scoped display-software recalls and consolidated the duplicate Electrified G80 software row.',
  };
}

function proposedPublished(current, legacy) {
  let card = current.id === 'genesis-g80-infotainment-glitches' ? g80Canonical() : legacy.after;
  if (!card) throw new Error(`${current.id}: missing source-grounded legacy card`);
  if (current.id === 'genesis-g70-sunroof-headliner-rattle-creaking-noise') {
    card = {
      ...card,
      years: [2019, 2020, 2021],
      trims: [],
      engines: [],
      title: 'Wide-Sunroof Creak and Rattle Repair Bulletin',
      description: 'Genesis bulletin 22-BD-007G covers certain 2019-2021 G70 vehicles produced before October 4, 2021 that may exhibit abnormal creaking or rattling from the wide-sunroof assembly while driving on uneven roads.',
      solution: 'Confirm that the noise originates from the wide-sunroof assembly, then follow the bulletin inspection and repair procedure. The bulletin defines the production cutoff and repair steps; it does not support extending the condition to later model years.',
      citations: [{
        type: 'service-bulletin',
        title: 'Genesis Bulletin 22-BD-007G - G70 Wide-Sunroof Noise',
        url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10217309-0001.pdf',
      }],
      summary: 'Corrected the model-year and production scope to Genesis bulletin 22-BD-007G and replaced the later unsupported citation.',
    };
  }
  if (current.id === 'genesis-gv70-sunroof-drain-clog-causing-water-leak-into-cabin') {
    card = {
      ...card,
      years: [2022, 2023],
      trims: [],
      engines: [],
      title: 'Sunroof Drain Plug Water Leak and Gurgling',
      description: 'Genesis bulletin 24-BD-015G-1 covers certain 2022-2023 GV70 vehicles produced from March 10, 2021 through June 30, 2022 whose sunroof drain-hose plugs can clog with foreign material, causing a cabin water leak or a gurgling sound while driving in rain.',
      solution: 'Confirm the VIN and symptom with a Genesis retailer. The bulletin directs replacement of the front drain-hose plugs and, when necessary, modification of the rear plugs; it does not establish coverage outside the stated production range.',
      citations: [{
        type: 'service-bulletin',
        title: 'Genesis Bulletin 24-BD-015G-1 - GV70 Sunroof Drain Plug Service',
        url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011760-0001.pdf',
      }],
      summary: 'Replaced the later citation with the superseding bulletin and preserved its exact model-year and production scope.',
    };
  }
  const proposal = {
    ...fullRecord(current),
    ...cleanText(card),
    make: current.make,
    model: current.model,
    trims: safeTrims(card.trims),
    citations: (card.citations || []).map(directCitation),
    communityRecommendations: [],
    fixParts: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    status: 'published',
    lastReportedByOwners: '',
    reviewedOn: '2026-08-05',
    contentUpdatedOn: '2026-08-05',
    contentUpdateSummary: card.summary || 'Narrowed the card to the cited Genesis/NHTSA primary-source condition.',
    relatedIssueIds: [],
  };
  if (current.id === 'genesis-g70-high-pressure-fuel-pump-failure-causing-power-loss') {
    proposal.engines = ['2.0L turbocharged gasoline engine'];
    proposal.affectedSystems = ['high-pressure fuel pump', 'fuel-control-valve plunger', 'engine-control-module software'];
  }
  if (current.id === 'genesis-g70-torque-converter-internal-rivet-damage-scratching-noise-low') {
    proposal.engines = ['2.0L turbocharged gasoline engine'];
  }
  return fullRecord(proposal);
}

function proposedArchived(current, action, reason, canonicalId) {
  const proposal = {
    ...fullRecord(current),
    citations: [],
    communityRecommendations: [],
    fixParts: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    status: 'archived',
    lastReportedByOwners: '',
    reviewedOn: '2026-08-05',
    contentUpdatedOn: '2026-08-05',
    contentUpdateSummary: action === 'archive_as_duplicate'
      ? `Proposal to archive as a duplicate of ${canonicalId}; title identity is preserved and no unrelated condition replaces it.`
      : `Proposal to archive because the attached evidence does not support this issue identity or scope: ${reason}`,
    relatedIssueIds: canonicalId ? [canonicalId] : [],
  };
  return fullRecord(proposal);
}

function buildPacket(
  snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')),
  snapshotSha256 = sha256File(SNAPSHOT),
) {
  const legacyCards = loadLegacyCards();
  const rows = snapshot.records.map((current) => {
    let action;
    let reason;
    let canonicalId = null;
    let proposal;
    if (REWRITE_IDS.has(current.id)) {
      action = 'rewrite_then_publish';
      const legacy = legacyCards.get(current.id);
      reason = cleanText(legacy?.decision || 'The current card requires a primary-source scope and remedy correction.');
      proposal = proposedPublished(current, legacy || {});
    } else if (DUPLICATES.has(current.id)) {
      action = 'archive_as_duplicate';
      canonicalId = DUPLICATES.get(current.id);
      reason = 'The exact 2026 Electrified G80 display-software condition is included in the canonical G80 display-recall proposal, avoiding two cards for the same campaign and symptom.';
      proposal = proposedArchived(current, action, reason, canonicalId);
    } else {
      action = 'archive_unsupported';
      reason = ARCHIVE_REASONS[current.id];
      if (!reason) throw new Error(`${current.id}: missing archive rationale`);
      proposal = proposedArchived(current, action, reason, null);
    }
    const before = fullRecord(current);
    const reviewedAction = action;
    const reviewedProposal = proposal;
    const protectedDrift = PROTECTED_FIELDS.filter(
      (field) => hashValue(before[field]) !== hashValue(reviewedProposal[field]),
    );
    action = 'hold_indexed_identity_byte_identical';
    proposal = before;
    return {
      id: current.id,
      model: current.model,
      action,
      reviewedAction,
      reason,
      canonicalId,
      protectedDrift,
      reviewedProposalSha256: hashValue(reviewedProposal),
      identityRule: reviewedAction === 'rewrite_then_publish'
        ? 'The evidence-backed correction changes protected indexed identity or scope, so the live row remains byte-identical pending an approved redirect or identity policy.'
        : 'The reviewed archive would remove an indexed page, so the live row remains byte-identical pending an approved redirect or retirement policy.',
      commerceDecision: 'preserve-frozen-record',
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });

  const actions = ['hold_indexed_identity_byte_identical'];
  const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length]));
  summary.total = rows.length;
  const byModel = {};
  for (const model of [...new Set(rows.map((row) => row.model))].sort()) {
    const scoped = rows.filter((row) => row.model === model);
    byModel[model] = Object.fromEntries(actions.map((action) => [action, scoped.filter((row) => row.action === action).length]));
    byModel[model].total = scoped.length;
  }

  return {
    schemaVersion: 1,
    status: 'proposal-only',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-05',
    make: 'Genesis',
    safetyContract: [
      'No production database write, cache purge, deployment, or public-page change is authorized by this packet.',
      'All 63 published rows remain byte-identical; this packet authorizes zero catalog writes.',
      'An unrelated official campaign may never replace the issue named by an existing ID.',
      'No indexed page may be archived without a separately approved redirect or retirement policy.',
      'Trim values may contain trim names only, never applicability prose.',
    ],
    source: {
      snapshotFile: 'data/_genesis-deeplink-snapshot-2026-08-05.json',
      snapshotSha256,
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      productionRecordCount: snapshot.records.length,
    },
    summary,
    byModel,
    rows,
  };
}

function main() {
  const packet = buildPacket();
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: sha256File(OUTPUT), summary: packet.summary, byModel: packet.byModel }, null, 2));
}

if (require.main === module) main();

module.exports = {
  ARCHIVE_REASONS,
  DIRECT_RECALL_URLS,
  DUPLICATES,
  FULL_RECORD_FIELDS,
  REWRITE_IDS,
  PROTECTED_FIELDS,
  buildPacket,
  fullRecord,
  hashValue,
  safeTrims,
};
