const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes || [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: card.source || 'manual',
      summary: card.summary,
    },
  };
}

const coolantIntrusion = {
  years: [2015, 2016, 2017, 2018],
  trims: [],
  engines: ['2.0L EcoBoost engine'],
  category: 'engine',
  title: '2.0L EcoBoost Coolant Intrusion Into a Cylinder',
  description:
    'Ford TSB 19-2346 covers some 2015-2018 Edge vehicles with the 2.0L EcoBoost engine that exhibit low coolant, white exhaust smoke, or rough running, with or without the malfunction indicator lamp. Ford identifies coolant intrusion into a cylinder as the cause.',
  solution:
    'Have a Ford dealer or qualified engine technician follow the bulletin\'s pressure-test and cylinder-inspection procedure. If coolant intrusion is confirmed, Ford directs replacement of the long-block engine assembly. The bulletin does not call the cause an open-deck block failure, include the 2019 Edge, or establish every frozen symptom and trim.',
  severity: 'high',
  symptoms: ['Low engine-coolant level', 'White exhaust smoke', 'Rough-running engine', 'Malfunction indicator lamp may illuminate'],
  affectedSystems: ['2.0L EcoBoost long-block engine', 'engine cylinders', 'engine cooling system'],
  dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0316', 'P0217', 'P1285', 'P1299'],
  sources: [{ type: 'tsb', title: 'Ford TSB 19-2346 - 2.0L EcoBoost Coolant Intrusion', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10169807-0001.pdf' }],
  source: 'manual',
  summary:
    'Rebuilt the card from Ford TSB 19-2346, correcting the Edge scope to 2015-2018 and preserving only the documented symptoms, DTCs, coolant-in-cylinder diagnosis, and long-block remedy.',
};

const apimProgram = {
  years: [2011, 2012, 2013, 2014],
  trims: ['Vehicles equipped with SYNC with MyFord Touch and included in Customer Satisfaction Program 12M02'],
  engines: [],
  category: 'electrical',
  title: 'SYNC With MyFord Touch APIM Software or Hardware Coverage (Program 12M02)',
  description:
    'Ford Customer Satisfaction Program 12M02 covered certain 2011-2014 vehicles equipped with SYNC with MyFord Touch. Ford extended Accessory Protocol Interface Module software and hardware coverage to five years from the warranty start date, regardless of mileage, for conditions a dealer determined could be corrected by an APIM software update or APIM replacement.',
  solution:
    'Ask a Ford dealer to check the VIN\'s program and repair history and diagnose the present SYNC symptom. The five-year 12M02 term has expired for these model years, so the program should not be represented as current free coverage. The program does not establish every frozen touchscreen, navigation, camera, audio, Bluetooth, preset, reboot, or black-screen symptom as an APIM hardware failure.',
  severity: 'low',
  symptoms: ['SYNC with MyFord Touch condition requiring dealer APIM software assistance', 'SYNC condition a dealer determines requires APIM software or hardware repair'],
  affectedSystems: ['Accessory Protocol Interface Module', 'SYNC with MyFord Touch software'],
  dtcCodes: [],
  sources: [
    { type: 'nhtsa', title: 'NHTSA-Hosted Ford OASIS Record Identifying Program 12M02', url: 'https://static.nhtsa.gov/complaints/10948016/10948016-AF0DEE51D2E202CAE05375E8789808C8.pdf' },
    { type: 'manual', title: 'Ford Program 12M02 Dealer Bulletin Reproduction', url: 'https://ford.oemdtc.com/1745/12m02-warranty-extension-covering-accessory-protocol-interface-module-apim-software-and-hardware-2011-2014-ford-lincoln' },
  ],
  source: 'manual',
  summary:
    'Reframed the broad APIM-failure card as Ford\'s exact expired 12M02 software/hardware warranty extension and removed the unsupported assumption that every infotainment or camera symptom proves module failure.',
};

const ptuSealLeak = {
  years: [2015, 2016, 2017, 2018],
  trims: ['All-wheel-drive vehicles equipped with a 2.0L or 2.7L EcoBoost engine'],
  engines: ['2.0L EcoBoost', '2.7L EcoBoost'],
  category: 'drivetrain',
  title: 'PTU Intermediate-Shaft Seal Can Leak Dark Fluid on AWD Models',
  description:
    'Ford TSB 18-2250 covers some 2015-2018 Edge all-wheel-drive vehicles with a 2.0L or 2.7L EcoBoost engine that exhibit a dark black fluid leak from the right side of the power transfer unit at the intermediate-shaft seal.',
  solution:
    'Have a Ford dealer or qualified driveline technician identify the leak source and follow the bulletin procedure for the PTU intermediate-shaft seal. The service information does not support extending this exact seal condition to every 2007-2018 Edge or diagnosing internal PTU failure from generic noise, vibration, AWD warnings, odor, low fluid, or clunks.',
  severity: 'medium',
  symptoms: ['Dark black fluid leaking from the right side of the PTU intermediate-shaft seal'],
  affectedSystems: ['power transfer unit', 'right intermediate-shaft seal'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB 18-2250 - PTU Intermediate-Shaft Seal Leak', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10144919-9999.pdf' }],
  source: 'manual',
  summary:
    'Narrowed the 12-year PTU aggregation to Ford TSB 18-2250\'s exact 2015-2018 EcoBoost AWD intermediate-shaft seal leak and removed unrelated internal-failure symptoms and engines.',
};

const published = {
  'ford-edge-20-ecoboost-coolant-intrusion-2015': replacement(coolantIntrusion, 'Retain Ford\'s documented 2.0L coolant intrusion while correcting the Edge population, cause wording, symptoms, DTCs, and long-block remedy to TSB 19-2346.'),
  'ford-edge-apim-myfordtouch-2011': replacement(apimProgram, 'Retain only the exact 2011-2014 Customer Satisfaction Program 12M02 APIM coverage and remove the blanket hardware-failure diagnosis.'),
  'ford-edge-ptu-fluid-leak-2007': replacement(ptuSealLeak, 'Retain the primary-source PTU leak issue only within Ford TSB 18-2250\'s 2015-2018 EcoBoost AWD intermediate-shaft seal scope.'),
};

const reasons = {
  'ford-edge-35-v6-timing-chain-2007':
    'The frozen card relies on a parts-maker technical article to apply timing-chain stretch, VCT phaser rattle, multiple correlation DTCs, roughness, economy loss, power loss, and hesitation to every 2007-2014 3.5L Edge. No Ford bulletin, investigation, or recall reviewed defines that eight-year defect and remedy.',
  'ford-edge-6f35-harsh-shift-2011':
    'The frozen card has no citations and applies ten years of hard shifts, shudder, delayed engagement, slipping, and unspecified transmission codes without an exact Ford bulletin, transmission/build population, cause, or repair. Ford publishes narrower Edge transmission conditions, but none substantiates this combined 2011-2020 card.',
  'ford-edge-rear-shock-failure-2015':
    'The frozen card relies on a placeholder YouTube URL and applies premature rear-shock leakage, float, sway, body roll, and clunking to every 2015-2024 Edge without a Ford bulletin, investigation, or recall defining that ten-year population.',
  'ford-edge-sunroof-crack-2015':
    'The frozen card relies on a placeholder YouTube URL and applies spontaneous panoramic-roof shattering, cabin glass, wind noise, and stress cracks to every 2015-2024 Edge without a Ford bulletin, investigation, or recall defining the condition.',
  'ford-edge-water-pump-failure-2015':
    'The frozen card has no citations, assigns an internal-coolant-in-oil symptom pattern to the 2.0L EcoBoost water pump, and applies it across 2015-2024. The Ford primary-source review does not define this ten-year 2.0L condition; the separate 2015-2018 coolant-in-cylinder bulletin is retained precisely.',
};

module.exports = buildConfig({
  label: 'Ford Edge',
  make: 'Ford',
  model: 'Edge',
  slug: 'ford-edge',
  batchId: 'ford-edge-full-record-cohort-106-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'd2ddeb8aa4a94fae746076fd35b0bc9a2050b516c92fcba424baa9a32adc54f2',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-edge/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordedge_blind:manual-primary-source-gate',
    edge: 'fordedge_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
