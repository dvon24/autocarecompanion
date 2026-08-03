const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function source(type, title, url) {
  return { type, title, url };
}

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const crossmemberSource = source(
  'nhtsa',
  'NHTSA Engineering Analysis EA06-018 and GM Special Coverage 06186 - Front Crossmember Corrosion',
  'https://static.nhtsa.gov/odi/inv/2006/INCR-EA06018-27317P.pdf',
);

const crossmember = {
  years: [1999, 2000, 2001, 2002, 2003, 2004],
  trims: ['Vehicles sold or registered in the salt-belt regions defined by Special Coverage 06186'],
  category: 'suspension',
  title: 'Front Crossmember Corrosion Can Weaken a Lower-Control-Arm Mount (EA06-018)',
  description: 'NHTSA Engineering Analysis EA06-018 and attached GM Special Coverage 06186 identify 1999-2004 Chevrolet Tracker vehicles in specified salt-belt regions. Inadequate corrosion protection on the inside of the front suspension crossmember can allow crevice corrosion and perforation near a lower-control-arm attachment bracket. Progressive weakening can cause tire wobble, loose steering, pull, front-end noise, shaking or steering-wheel rotation during a reverse-to-drive direction change, and the bracket can partially or completely separate. This is a specific front-crossmember condition, not a blanket claim that every body or frame area on every 1990-2004 Tracker rusts through.',
  solution: 'Have a qualified technician inspect the front crossmember, particularly the front lower-control-arm attachment areas, using the GM procedure. Special Coverage 06186 directed replacement when the metal perforated or significantly dented during its integrity test. The original coverage was limited to 10 years or 150,000 miles and has expired by time for these vehicles, so do not promise a free repair; treat advanced corrosion or control-arm-mount movement as a safety concern and avoid driving until evaluated.',
  severity: 'high',
  symptoms: [
    'Heavy corrosion or perforation at a front lower-control-arm attachment',
    'Front tire wobble, steering looseness or pull',
    'Front-end clunk, bang, rattle or shaking',
    'Steering-wheel rotation when shifting between reverse and drive',
  ],
  affectedSystems: ['front suspension crossmember', 'lower-control-arm attachment brackets', 'steering-box mounting structure'],
  sources: [crossmemberSource],
  summary: 'Replaced the 1990-2004 body/frame rust aggregation with EA06-018 and Special Coverage 06186\'s exact 1999-2004 salt-belt front-crossmember defect, inspection boundary and expired-coverage caveat.',
};

const published = {
  'chevy-tracker-rust-frame-1990': replacement(
    crossmember,
    'Retain only EA06-018 and Special Coverage 06186\'s exact 1999-2004 salt-belt front-crossmember corrosion condition; remove the unsupported 1990-1998 body/frame aggregation and owner-video diagnosis.',
  ),
};

const reasons = {
  'chevrolet-tracker-timing-chain': 'The only citation is an owner-forum failure report. It does not establish that every 1999-2004 Tracker engine shares one tensioner defect, nor does it provide a manufacturer diagnostic or remedy. The primary GM PIP5652 found during research applies to a 2019 Cadillac XT4, not the Tracker.',
  'chevrolet-tracker-4wd-actuator': 'The frozen card has no citations and converts generic failure-to-engage symptoms into a six-year actuator diagnosis without a primary-source population, electrical test or remedy.',
  'chevrolet-tracker-rear-diff-seal': 'The frozen card has no citations. A pinion-area leak can have multiple causes, and current GM/NHTSA primary research did not establish a 1999-2004 defect population or universal seal replacement.',
  'chevy-tracker-timing-chain-1999': 'This duplicates the other timing-chain record and relies on an owner forum and video. Current GM/NHTSA primary research did not establish its claimed 2.5L V6 population, mileage range or universal timing-set replacement.',
};

module.exports = buildConfig({
  label: 'Chevrolet Tracker',
  make: 'Chevrolet',
  model: 'Tracker',
  slug: 'chevrolet-tracker',
  batchId: 'chevrolet-tracker-full-record-cohort-41-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'd289d539a9d9c383377d630ec798246ffc96930789ebb6ce96f14667bb057f07',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-tracker/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevrolettracker_blind:manual-primary-source-gate',
    edge: 'chevrolettracker_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
