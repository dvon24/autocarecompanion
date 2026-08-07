/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jeep-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jeep-grand-cherokee-adjudication-2026-08-06.json');

const frozenSnapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const ALL_IDS = frozenSnapshot.records
  .filter((row) => row.make === 'Jeep' && row.model === 'Grand Cherokee')
  .map((row) => row.id)
  .sort();
const OFFICIAL_PDF_URLS = [...new Set(
  frozenSnapshot.records
    .filter((row) => row.make === 'Jeep' && row.model === 'Grand Cherokee')
    .flatMap((row) => (row.citations || []).map((item) => typeof item === 'string' ? item : (item.url || '')))
    .filter((url) => /static\.nhtsa\.gov/i.test(url)),
)].sort();

const IDS = {
  hpfp: 'jeep-grand-cherokee-3-0l-ecodiesel-bosch-cp4-high-pressure-fuel-pump-failure-sen',
  egr: 'jeep-grand-cherokee-3-0l-ecodiesel-egr-cooler-internal-crack-allowing-coolant-in',
  oilHousingDiagnostic: 'jeep-grand-cherokee-3-6l-pentastar-oil-filter-housing-oil-cooler-assembly-leak',
  oilHousingCrack: 'jeep-grand-cherokee-3-6l-pentastar-plastic-oil-filter-housing-oil-cooler-assembl',
  cylinderHeadDiagnostic: 'jeep-grand-cherokee-early-3-6l-pentastar-left-cylinder-head-failure-overheated-v',
  cylinderHeadWear: 'jeep-grand-cherokee-early-3-6l-pentastar-left-cylinder-head-valve-seat-guide-wea',
  engineSand: 'jeep-grand-cherokee-4xe-2-0l-turbo-engine-sand-casting-debris-causing-catastroph',
  batteryFire: 'jeep-grand-cherokee-4xe-high-voltage-battery-cell-separator-defect-causing-fire',
  hemiDiagnostic: 'jeep-grand-cherokee-5-7l-hemi-mds-lifter-collapse-camshaft-lobe-wear',
  hemiGeneric: 'jeep-grand-cherokee-hemi-tick-2011',
  alternatorFocused: 'jeep-grand-cherokee-alternator-2011',
  alternatorBroad: 'jeep-grand-cherokee-sudden-alternator-failure-causing-stall-fire-risk',
  steeringCombined: 'jeep-grand-cherokee-loss-steering-control-upper-control-arm-pinch-bolt-intermedi',
  ignition: 'jeep-grand-cherokee-ignition-switch-lock-cylinder-wear-causing-key-stuck-unexpec',
  rollaway: 'jeep-grand-cherokee-monostable-electronic-shifter-rollaway',
  evapBulletin: 'jeep-grand-cherokee-evap-leak-detection-pump-failure-triggers-p0455-p0456-often',
  evapGeneric: 'jeep-grand-cherokee-p0442-small-evap-leak-from-failed-esim-degraded-gas-cap-seal',
  fuelTank: 'jeep-grand-cherokee-rear-mounted-fuel-tank-rupture-fire-risk-rear-impacts',
  rearCamera: 'jeep-grand-cherokee-rearview-backup-camera-image-fails-to-display-reverse',
  headRestraint: 'jeep-grand-cherokee-second-row-head-restraints-may-not-lock-upright',
  lossOfDrive: 'jeep-grandcherokee-loss-of-drive-power-2022',
  rearCoil: 'jeep-grandcherokee-rear-coil-spring-separationcollapse-2022',
  secondRowAirbag: 'jeep-grandcherokee-second-row-seat-side-airbag-2022',
};

const campaign = (number, years, markers) => ({
  campaign: number,
  url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${number}`,
  grandCherokeeYears: years.map(String),
  markers,
});

const CAMPAIGNS = {
  hpfp: campaign('22V406000', [2014, 2015, 2016, 2017, 2018, 2019, 2020], ['3.0L diesel engines', 'high pressure fuel pump', 'fuel starvation', 'replace the HPFP']),
  egr: campaign('20V699000', [2014, 2015, 2016, 2017, 2018, 2019], ['3.0L EcoDiesel', 'EGR cooler may crack', 'combust inside the intake manifold', 'replace the EGR cooler']),
  engineSand: campaign('25V766000', [2023, 2024, 2025], ['Grand Cherokee 4XE', 'Debris inside the engine', 'loss of drive power', 'replace the block or engine']),
  batteryFire: campaign('25V741000', [2022, 2023, 2024, 2025, 2026], ['Grand Cherokee 4Xe', 'high voltage battery may fail internally', 'park outside', 'not to charge']),
  alternatorT36: campaign('17V435000', [2012, 2013, 2014], ['2012-2014 Jeep Grand Cherokee', 'alternator may suddenly fail', 'replace the alternator']),
  alternatorP60: campaign('14V634000', [2012, 2013, 2014], ['2012-2014 Jeep Grand Cherokee', '3.6L engine', '160 amp alternator', 'replace the alternator']),
  ignitionP41: campaign('14V438000', [2005, 2006, 2007], ['2005-2007 Jeep Grand Cherokee', 'knocking the key out of the run position', 'replace the ignition switch']),
  steering58A: campaign('23V352000', [2021, 2022, 2023], ['incorrectly assembled steering column intermediate shaft', 'loss of steering control', 'replace the intermediate shaft']),
  steering07B: campaign('24V131000', [2024], ['improperly machined steering knuckle', 'wheel to fall outward', 'replace the steering knuckle']),
  rollawayS27: campaign('16V240000', [2014, 2015], ['2014-2015 Jeep Grand Cherokee', 'monostable gear selector', 'vehicle rollaway', 'update the vehicle software']),
  fuelTankN45: campaign('13V252000', [1993, 1994, 1995, 1996, 1997, 1998], ['1993-1998 Jeep Grand Cherokee', 'fuel tanks', 'rear impacts', 'free inspection']),
  camera56A: campaign('23V577000', [2021, 2022, 2023], ['rearview image from displaying', 'Central Vision Park Assist Module software', 'update the Central Vision Park Assist Module software']),
  headRestraint20C: campaign('25V472000', [2023, 2024], ['second-row seat head restraints', 'may not lock in the upright position', 'replace both second-row seat head restraints']),
  rearCoil64A: campaign('23V413000', [2021, 2022, 2023], ['rear coil springs', 'detach from the vehicle', 'replaced by NHTSA recall 26V051']),
  rearCoil20D: campaign('26V051000', [2021, 2022, 2023], ['rear coil springs', 'detach from the vehicle', 'replaces NHTSA recall number 23V413']),
  sideAirbagB3B: campaign('24V897000', [2021, 2022, 2023, 2024], ['front seat side air bags', 'improperly secured connector', 'prevent the air bags from deploying']),
};

const CAMPAIGN_EVIDENCE = {
  [IDS.hpfp]: ['hpfp'],
  [IDS.egr]: ['egr'],
  [IDS.engineSand]: ['engineSand'],
  [IDS.batteryFire]: ['batteryFire'],
  [IDS.alternatorFocused]: ['alternatorT36', 'alternatorP60'],
  [IDS.alternatorBroad]: ['alternatorT36', 'alternatorP60'],
  [IDS.ignition]: ['ignitionP41'],
  [IDS.steeringCombined]: ['steering58A', 'steering07B'],
  [IDS.rollaway]: ['rollawayS27'],
  [IDS.fuelTank]: ['fuelTankN45'],
  [IDS.rearCamera]: ['camera56A'],
  [IDS.headRestraint]: ['headRestraint20C'],
  [IDS.lossOfDrive]: ['steering58A'],
  [IDS.rearCoil]: ['rearCoil64A', 'rearCoil20D'],
  [IDS.secondRowAirbag]: ['sideAirbagB3B'],
};

const CRITICAL_REASONS = {
  [IDS.hpfp]: 'Campaign 22V406 matches the frozen 2014-2020 Grand Cherokee 3.0L diesel HPFP identity and the row already carries direct NHTSA files. No identity, status, commerce or prose change is needed; the indexed page remains byte-for-byte unchanged pending independent field-level approval.',
  [IDS.egr]: 'Campaign 20V699 matches the frozen 2014-2019 Grand Cherokee EcoDiesel EGR-cooler identity and its core fire-risk outcome. The row already has direct NHTSA files, so it remains byte-for-byte unchanged rather than being rewritten unnecessarily.',
  [IDS.engineSand]: 'Campaign 25V766 matches the frozen 2023-2025 Grand Cherokee 4xe engine-debris identity. Because the direct NHTSA recall links and indexed identity already align, the row remains byte-for-byte unchanged pending independent approval.',
  [IDS.batteryFire]: 'Campaign 25V741 matches the frozen 2022-2026 Grand Cherokee 4xe traction-battery fire-risk identity and park-outside guidance. The row remains byte-for-byte unchanged; its outdated Wrangler-specific press-release link is recorded as a link-quality gap but cannot justify altering the indexed page.',
  [IDS.alternatorFocused]: 'Campaigns 14V634 and 17V435 support 2012-2014 Grand Cherokee alternator-diode failures. This page has the exact 2012-2014 scope, but it overlaps a second indexed alternator page; both remain published and unchanged until independent duplicate adjudication.',
  [IDS.alternatorBroad]: 'Campaigns 14V634 and 17V435 cover 2012-2014 Grand Cherokee, not this page\'s 2011-2014 span. It also overlaps the exact-scope alternator page. The 2011 overreach and duplicate identity require a byte-for-byte hold.',
  [IDS.steeringCombined]: 'Campaign 23V352 concerns an incorrectly assembled steering-column intermediate shaft for 2021-2023 Grand Cherokee variants, while 24V131 concerns a 2024 steering knuckle. Combining two components and scopes in one indexed title prevents a safe automatic rewrite, so the row remains byte-for-byte unchanged.',
  [IDS.ignition]: 'Campaign 14V438 supports the frozen 2005-2007 Grand Cherokee ignition-switch shutoff identity and free switch replacement. The row remains byte-for-byte unchanged rather than altering a correctly scoped indexed page.',
  [IDS.rollaway]: 'Campaign 16V240 supports 2014-2015 Grand Cherokee vehicles with the monostable selector and a software rollaway remedy. The indexed page remains byte-for-byte unchanged because its core identity already aligns.',
  [IDS.fuelTank]: 'Campaign 13V252 covers 1993-1998 Grand Cherokee fuel tanks, not this page\'s 1994-2004 span. The 1999-2004 WJ years are outside the official Grand Cherokee recall scope, so the broad indexed page remains byte-for-byte unchanged.',
  [IDS.rearCamera]: 'Campaign 23V577 supports the frozen 2021-2023 Grand Cherokee-family rearview-image identity and CVPAM software remedy. The page remains byte-for-byte unchanged because its core identity and years already align.',
  [IDS.headRestraint]: 'Campaign 25V472 supports the frozen 2023-2024 second-row head-restraint identity. The existing citations are secondary articles rather than the direct official campaign, so this is recorded as a deep-link gap while the indexed row remains byte-for-byte unchanged.',
  [IDS.lossOfDrive]: 'Campaign 23V352 describes an intermediate steering shaft that may disconnect and cause loss of steering control, not loss of drive power as the frozen title states. Correcting that would change the indexed identity and title, so the row remains byte-for-byte unchanged and is blocked from automatic repair.',
  [IDS.rearCoil]: 'Current campaign 26V051 replaces 23V413 and covers 2022-2023 Grand Cherokee plus 2021-2023 Grand Cherokee L. It does not cover this page\'s 2024 year, and it describes incorrectly installed springs detaching rather than a generic separation or collapse identity. The row remains byte-for-byte unchanged.',
  [IDS.secondRowAirbag]: 'Campaign 24V897 concerns an improperly secured connector for the front seat side airbags, not the frozen title\'s second-row seat side airbag identity. That component and seating-position mismatch requires a byte-for-byte hold.',
};

function citationUrls(row) {
  return (row.citations || []).map((item) => typeof item === 'string' ? item : (item.url || '')).filter(Boolean);
}

function sourceClassFor(row) {
  const urls = citationUrls(row);
  if (!urls.length) return 'no-citations';
  const hasNhtsaPdf = urls.some((url) => /static\.nhtsa\.gov/i.test(url));
  const hasGenericNhtsa = urls.some((url) => /nhtsa\.gov\/recalls\/?$/i.test(url));
  const hasCharm = urls.some((url) => /charm\.li/i.test(url));
  if (hasNhtsaPdf && urls.every((url) => /static\.nhtsa\.gov/i.test(url))) return 'nhtsa-pdf-only';
  if (hasGenericNhtsa && !hasNhtsaPdf) return 'generic-nhtsa-landing-page';
  if (hasCharm && urls.every((url) => /charm\.li/i.test(url))) return 'service-manual-mirror-only';
  if (hasNhtsaPdf || hasCharm) return 'mixed-primary-or-manual-and-secondary';
  return 'secondary-only';
}

function defaultReason(row) {
  const range = `${row.years[0]}-${row.years[row.years.length - 1]}`;
  const sourceClass = sourceClassFor(row);
  if (sourceClass === 'no-citations') return `No citation is pinned for the frozen ${range} ${row.title} identity, its causes, diagnostic details, remedies or commerce. The row remains byte-for-byte unchanged.`;
  if (sourceClass === 'generic-nhtsa-landing-page') return `A generic NHTSA recall-search landing page is not a deep link and does not establish the frozen ${range} ${row.title} identity or its detailed claims. The row remains byte-for-byte unchanged.`;
  if (sourceClass === 'service-manual-mirror-only') return `A mirrored service-manual chapter may support a diagnostic procedure for one configuration, but it does not establish the full ${range} indexed ${row.title} population, prevalence, outcomes or commerce. The row remains byte-for-byte unchanged.`;
  if (sourceClass === 'secondary-only') return `Owner discussions, vendor pages or secondary articles do not establish the full ${range} indexed ${row.title} identity, year scope, cause, remedy and fitment. The row remains byte-for-byte unchanged.`;
  if (sourceClass === 'nhtsa-pdf-only') return `The row has direct NHTSA-hosted files, but no automatic rewrite is justified until every frozen ${range} ${row.title} field, year, remedy and commerce claim is independently reconciled to the exact pages. The indexed row remains byte-for-byte unchanged.`;
  return `The mixed official, mirrored and secondary citations do not independently clear every frozen ${range} ${row.title} field, year, outcome and fitment claim. The indexed row remains byte-for-byte unchanged.`;
}

function reasonFor(row) {
  return CRITICAL_REASONS[row.id] || defaultReason(row);
}

function evidenceFor(row) {
  const keys = CAMPAIGN_EVIDENCE[row.id] || [];
  if (keys.length) return keys.map((key) => ({
    kind: 'official-campaign-identity-and-scope-check',
    url: CAMPAIGNS[key].url,
    verifiedOn: '2026-08-06',
    observation: `Campaign ${CAMPAIGNS[key].campaign} was checked against the frozen model, year and component identity.`,
  }));
  const urls = citationUrls(row);
  return [{
    kind: `source-classification-${sourceClassFor(row)}`,
    url: urls[0] || null,
    supportingUrls: urls.slice(1),
    verifiedOn: '2026-08-06',
    observation: 'This evidence records the frozen source class only; it does not authorize a content or commerce change.',
  }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Grand Cherokee');
  if (modelRows.length !== 77) throw new Error(`expected 77 Jeep Grand Cherokee rows, found ${modelRows.length}`);
  if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(ALL_IDS)) throw new Error('Grand Cherokee IDs do not match frozen inventory');

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: reasonFor(current),
      identityRule: 'No title, slug, category, year, status, redirect or archive change; an exact source must match the complete indexed identity before a later separately approved rewrite.',
      commerceDecision: 'unchanged-commerce-pending-exact-source-and-fitment',
      sourceClass: sourceClassFor(current),
      changedFields: [],
      evidence: evidenceFor(current),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(before),
      before,
      proposal: before,
    };
  });

  const sourceQuality = rows.reduce((counts, row) => {
    counts[row.sourceClass] = (counts[row.sourceClass] || 0) + 1;
    return counts;
  }, {});

  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Jeep',
    model: 'Grand Cherokee',
    completionStatement: 'All 77 frozen Grand Cherokee records are reconciled as byte-for-byte holds. Exact official campaigns, critical scope and component mismatches, weak-source rows and overlapping indexed identities are recorded without changing any public page.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All 77 Grand Cherokee rows remain published and byte-for-byte unchanged.',
      'A recall may not be expanded beyond its exact model years, component or outcome.',
      'A duplicate or overlapping identity may not be retired until a separately approved redirect and page-preservation plan exists.',
      'Generic recall landing pages, owner discussions, mirrored manuals and product pages cannot authorize a rewrite.',
      'New issue identities remain deferred until the remaining-make audit is complete.',
    ],
    source: {
      snapshotFile: 'data/_jeep-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: 77,
    },
    sourceQuality,
    observations: [
      { code: 'grand-cherokee-fuel-tank-recall-scope-overreach', severity: 'critical', recordIds: [IDS.fuelTank], detail: '13V252 covers 1993-1998 Grand Cherokee, not the page\'s 1994-2004 range.' },
      { code: 'grand-cherokee-loss-of-drive-title-is-steering-recall', severity: 'critical', recordIds: [IDS.lossOfDrive], detail: '23V352 is loss of steering control, not loss of drive power.' },
      { code: 'grand-cherokee-rear-coil-current-recall-scope-mismatch', severity: 'critical', recordIds: [IDS.rearCoil], detail: '26V051 replaces 23V413 and covers 2022-2023 Grand Cherokee, not 2024.' },
      { code: 'grand-cherokee-second-row-airbag-source-is-front-seat', severity: 'critical', recordIds: [IDS.secondRowAirbag], detail: '24V897 concerns a front-seat side-airbag connector, not a second-row connector.' },
      { code: 'grand-cherokee-duplicate-alternator-pages', severity: 'high', recordIds: [IDS.alternatorFocused, IDS.alternatorBroad], detail: 'Two indexed pages overlap the same P60/T36 alternator identity; the broader page also includes an unsupported 2011 Grand Cherokee year.' },
      { code: 'grand-cherokee-overlapping-oil-filter-housing-pages', severity: 'high', recordIds: [IDS.oilHousingDiagnostic, IDS.oilHousingCrack], detail: 'Two indexed pages overlap the Pentastar oil-filter adapter and oil-cooler housing identity.' },
      { code: 'grand-cherokee-overlapping-cylinder-head-pages', severity: 'high', recordIds: [IDS.cylinderHeadDiagnostic, IDS.cylinderHeadWear], detail: 'Two indexed pages overlap the early Pentastar left-cylinder-head identity.' },
      { code: 'grand-cherokee-overlapping-hemi-tick-pages', severity: 'high', recordIds: [IDS.hemiDiagnostic, IDS.hemiGeneric], detail: 'Two indexed pages overlap the HEMI tick and valvetrain-wear identity.' },
      { code: 'grand-cherokee-overlapping-evap-pages', severity: 'high', recordIds: [IDS.evapBulletin, IDS.evapGeneric], detail: 'Two indexed pages overlap the EVAP leak-detection and small-leak identity.' },
      { code: 'grand-cherokee-generic-recall-links-are-not-deep-links', severity: 'high', recordIds: rows.filter((row) => row.sourceClass === 'generic-nhtsa-landing-page').map((row) => row.id), detail: 'Generic recall landing pages do not identify a campaign or support the page claims.' },
      { code: 'all-grand-cherokee-pages-preserved', severity: 'seo-safety', recordIds: ALL_IDS, detail: 'Every frozen Grand Cherokee record remains published and byte-for-byte unchanged.' },
    ],
    campaignSources: CAMPAIGNS,
    officialPdfLinks: OFFICIAL_PDF_URLS,
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 77, total: 77 },
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, sourceQuality }, null, 2));
}

if (require.main === module) main();
module.exports = { ALL_IDS, CAMPAIGNS, IDS, OFFICIAL_PDF_URLS, reasonFor, evidenceFor, sourceClassFor };
