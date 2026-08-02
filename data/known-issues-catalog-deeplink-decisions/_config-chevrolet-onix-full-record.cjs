const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const chevroletRecallCatalog = {
  type: 'recall',
  title: 'Chevrolet Brasil Official Recall Catalogue',
  url: 'https://www.chevrolet.com.br/servicos/recalls',
};

const chevroletManuals = {
  type: 'manual',
  title: 'Chevrolet Brasil Owner Manuals',
  url: 'https://www.chevrolet.com.br/servicos/manuais-veiculos/anos-anteriores',
};

const chevroletBeltAcademy = {
  type: 'manual',
  title: 'Chevrolet Academy - Oil-Bathed Timing Belt Guidance',
  url: 'https://www.chevrolet.com.br/chevrolet-academy',
};

function citations(sources) {
  return sources.map((source) => ({
    type: source.type,
    title: source.title,
    url: source.url,
  }));
}

function evidence(sources) {
  return sources.map((source) => ({
    type: source.type,
    label: source.title,
    url: source.url,
  }));
}

function replacement(decision, after) {
  const sources = [chevroletRecallCatalog];
  return {
    disposition: 'replace',
    decision,
    evidence: evidence(sources),
    after: {
      ...after,
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      dtcCodes: [],
      citations: citations(sources),
      source: 'manual',
    },
  };
}

function archive(record, reason, sources, guidance) {
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${record.title}" aggregation. ${reason} The packet contains no commerce claims, so no product link is carried forward.`,
    evidence: evidence(sources),
    after: {
      years: record.years,
      trims: [],
      engines: [],
      category: record.category,
      title: `Archived - ${record.title}`,
      description: `The former Chevrolet Onix card asserted "${record.title}" across the listed population. ${reason}`,
      solution: guidance,
      severity: 'low',
      confidence: 'low',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: citations(sources),
      source: 'manual',
      summary: `Archived the unsupported Onix "${record.title}" aggregation after reviewing Chevrolet's official recall and owner-information sources; retained zero commerce claims.`,
    },
  };
}

const packet = require('../known-issues-catalog-deeplink-work/chevrolet-onix/422f4bceb371/all-0001.json');
const byId = Object.fromEntries(packet.records.map((record) => [record.id, record]));

const published = {
  'chevrolet-onix-air-conditioning-stops-cooling-expansion-valve-jamming': archive(
    byId['chevrolet-onix-air-conditioning-stops-cooling-expansion-valve-jamming'],
    'The cited workshop articles and owner-report pages do not establish a GM campaign, a bounded production population, one confirmed expansion-valve mechanism or a universal valve replacement. Chevrolet\'s official recall catalogue and owner-manual index do not substantiate the frozen 2020-2024 model-wide assertion.',
    [chevroletRecallCatalog, chevroletManuals],
    'Do not replace the compressor or expansion valve from this archived card alone. Confirm the exact model year and equipment, inspect for leaks, verify refrigerant charge and pressures under operating conditions, scan the HVAC controls where supported, and follow the applicable Chevrolet service information before ordering parts.',
  ),
  'chevrolet-onix-engine-fire-risk-from-ecm-calibration-defect-1-0-turbo': replacement(
    'Retain the safety issue but narrow it to Chevrolet\'s exact Onix Plus model-year, chassis and production-date population. Remove secondary fire counts, engine replacement promises, loaner-car claims and post-update performance reports that are not part of the official recall notice.',
    {
      years: [2020],
      trims: ['Onix Plus'],
      engines: [],
      category: 'engine',
      title: 'Engine-Control Calibration Can Damage the Engine and Cause a Fire (Brazil Recall)',
      description: 'Chevrolet Brasil recalls 2020 Onix Plus vehicles with chassis LG100091 through LG139164, manufactured from April 29 through November 6, 2019. A defect in the engine-control-module calibration can increase pressure and temperature in the combustion chamber, damage a piston and break the engine block. Escaping oil contacting hot components can cause a fire.',
      solution: 'Check the chassis against Chevrolet Brasil\'s official recall catalogue and contact an authorized Chevrolet dealer. The free remedy is an update to the engine-control-module calibration; Chevrolet lists an estimated service time of up to 90 minutes.',
      severity: 'high',
      confidence: 'high',
      symptoms: [
        'The recall can apply without a reliable advance warning',
        'Engine damage or a broken engine block',
        'Oil leaking into the engine compartment',
        'Smoke or fire if oil contacts hot components',
      ],
      affectedSystems: [
        'engine-control-module calibration',
        'combustion chamber, pistons and engine block',
        'engine-compartment fire protection',
      ],
      summary: 'Narrowed the frozen fire-risk card to Chevrolet Brasil\'s exact 2020 Onix Plus recall population and official ECM-calibration remedy.',
    },
  ),
  'chevrolet-onix-fuel-pump-retaining-nut-leak-fire-risk-recall': replacement(
    'Retain the official recall and replace the secondary summary with Chevrolet Brasil\'s exact Onix population, chassis range, production dates, risk and dealer remedy.',
    {
      years: [2013, 2014],
      trims: [],
      engines: [],
      category: 'fuel',
      title: 'Fuel-Pump Retaining Nut Can Leak Fuel (Brazil Recall)',
      description: 'Chevrolet Brasil recalls 2013-2014 Onix vehicles with chassis DG100001 through EG276280, manufactured from February 27, 2012 through December 3, 2013. The retaining nut that secures the fuel pump at the top of the tank may not seal correctly. In an atypical condition such as a rollover, fuel can leak continuously and ignite if it reaches an external flame.',
      solution: 'Check the chassis against Chevrolet Brasil\'s official recall catalogue and arrange the free dealer repair. The remedy replaces the fuel-pump retaining nut and, where necessary, the fuel tank. Chevrolet advises owners who notice fuel odor or leakage to contact its dealer network.',
      severity: 'high',
      confidence: 'high',
      symptoms: [
        'Fuel odor near the vehicle or tank',
        'Visible fuel leakage from the top of the tank',
        'Continuous leakage may occur in a rollover',
        'Fire risk if leaked fuel contacts an external flame',
      ],
      affectedSystems: [
        'fuel-pump retaining nut and seal',
        'fuel tank',
      ],
      summary: 'Replaced the secondary fuel-leak summary with Chevrolet Brasil\'s exact 2013-2014 Onix recall scope and retaining-nut or fuel-tank remedy.',
    },
  ),
  'chevrolet-onix-mylink-infotainment-freezing-black-screen-wireless-android-a': archive(
    byId['chevrolet-onix-mylink-infotainment-freezing-black-screen-wireless-android-a'],
    'The cited owner-forum and complaint pages describe individual symptoms but do not establish one MyLink defect across 2020-2023 Onix vehicles, a defined software population, a published GM calibration identifier or a universal USB-update remedy. Chevrolet\'s official recall catalogue and owner-manual index do not substantiate that frozen scope.',
    [chevroletRecallCatalog, chevroletManuals],
    'Do not install unofficial firmware or replace the head unit from this archived card. Record the exact software version and symptoms, test the phone and cable separately, check vehicle voltage and relevant fuses, and have Chevrolet identify any VIN- and software-specific update or hardware diagnosis.',
  ),
  'chevrolet-onix-premature-failure-oil-bathed-timing-belt': archive(
    byId['chevrolet-onix-premature-failure-oil-bathed-timing-belt'],
    'The secondary articles do not establish the frozen 2020-2024 model-wide premature-failure rate, a 50,000-100,000 km affected population, an official 60,000-70,000 km replacement interval or a recall. Chevrolet\'s current manufacturer guidance instead specifies a 240,000 km replacement design target when the service plan and correct synthetic 0W-20 Dexos oil are used, and recommends dealer inspection when maintenance history is uncertain.',
    [chevroletBeltAcademy, chevroletRecallCatalog],
    'Follow the exact maintenance schedule and lubricant specification for the vehicle\'s model year and engine; do not substitute the archived card\'s shortened interval. If maintenance history is uncertain, warning signs are present or the oil specification cannot be verified, arrange inspection through a Chevrolet dealer before making a repair decision.',
  ),
  'chevrolet-onix-underhood-fuse-box-water-ingress-unintended-starter-activati': replacement(
    'Retain the official safety campaign, but separate the line-installed 2017-2019 Onix population from Chevrolet\'s later replacement-part campaign. Publish the exact chassis range, production dates, hazard and insulation remedy from Chevrolet Brasil.',
    {
      years: [2017, 2018, 2019],
      trims: [],
      engines: [],
      category: 'electrical',
      title: 'Fuse-Box Relay Water Ingress Can Activate the Starter and Cause a Fire (Brazil Recall)',
      description: 'Chevrolet Brasil recalls 2017-2019 Onix vehicles with chassis HB100028 through KG110336, manufactured from January 15, 2016 through May 24, 2018. Water can enter and accumulate around relay terminals in the underhood fuse box, causing a short circuit and involuntary continuous starter operation. The starter can overheat and cause an engine-compartment fire; a manual-transmission vehicle left in gear can also move unexpectedly.',
      solution: 'Check the chassis against Chevrolet Brasil\'s official recall catalogue and arrange the free dealer repair. The campaign adds insulating material to the fuse-box relay terminals; Chevrolet lists an estimated service time of 20 minutes. A separate Chevrolet campaign covers certain genuine replacement fuse boxes sold or installed during 2018, so owners with a replacement box should also verify its part history.',
      severity: 'high',
      confidence: 'high',
      symptoms: [
        'Starter activates or continues running without driver input',
        'Electrical short or abnormal relay activity after water exposure',
        'Starter overheating or burning odor',
        'Unexpected movement of a manual-transmission vehicle left in gear',
      ],
      affectedSystems: [
        'underhood fuse box and relay terminals',
        'starter motor and starter circuit',
        'manual-transmission vehicle movement while parked in gear',
      ],
      summary: 'Replaced the secondary fuse-box card with Chevrolet Brasil\'s exact 2017-2019 Onix recall population, risk and relay-terminal insulation remedy.',
    },
  ),
};

module.exports = buildConfig({
  label: 'Chevrolet Onix',
  make: 'Chevrolet',
  model: 'Onix',
  slug: 'chevrolet-onix',
  batchId: 'chevrolet-onix-full-record-cohort-28-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'a01ad7bd38fe0db73240abf22bd7b73ef0c13b53d2ec7eb350e901dda75084bf',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-onix/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletonix_blind:self-no-blocker',
    edge: 'chevroletonix_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
