const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  manual: {
    type: 'recall',
    title: 'NHTSA Recall 90V065 - Rear Center Seat-Belt Instructions',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=90V065000',
  },
  steeringWheel: {
    type: 'recall',
    title: 'NHTSA Recall 91V083 - Steering-Wheel Retaining Nut',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=91V083000',
  },
  stopLamp: {
    type: 'recall',
    title: 'NHTSA Recall 92V185 - Stop-Lamp Switch',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=92V185000',
  },
  rocker: {
    type: 'recall',
    title: 'NHTSA Recall 94V176 - Right Rocker Reinforcement Panel',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=94V176000',
  },
  interiorLamps: {
    type: 'recall',
    title: 'NHTSA Recall 98V027 - Interior Lamp Control Module',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=98V027000',
  },
};

function replace(source, decision, after) {
  return {
    disposition: 'replace',
    decision,
    evidence: [{ type: source.type, label: source.title, url: source.url }],
    after: {
      ...after,
      citations: [{ type: source.type, title: source.title, url: source.url }],
    },
  };
}

module.exports = buildConfig({
  label: 'Chevrolet Beretta',
  make: 'Chevrolet',
  model: 'Beretta',
  slug: 'chevrolet-beretta',
  batchId: 'chevrolet-beretta-full-record-cohort-3-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    '928e3a9bd842d7481a31fbd80b3330d90561da8a937f32a18ad15517121fb8b2',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-beretta/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletberetta_blind:self-no-blocker',
    edge: 'chevroletberetta_edge:self-no-blocker',
  },
  published: {
    'chevrolet-beretta-head-gasket': replace(
      sources.manual,
      'Replace the forum/media-derived multi-engine head-gasket aggregation and two search links with the exact 1990 owner-manual seat-belt information recall.',
      {
        years: [1990],
        trims: [],
        engines: [],
        category: 'safety',
        title: 'Owner Manual Omits Rear Center Seat-Belt Information (Recall 90V065)',
        description:
          'NHTSA Recall 90V065 covers certain 1990 Chevrolet Beretta vehicles whose owner manuals omitted required information about the rear center seat belt, creating a Federal Motor Vehicle Safety Standard 209 noncompliance.',
        solution:
          'Check the VIN for recall completion. The recall remedy inserts the missing rear center seat-belt information into the owner manual.',
        severity: 'medium',
        confidence: 'high',
        symptoms: ['Owner manual lacks rear center seat-belt instructions'],
        affectedSystems: ['owner manual and rear center seat-belt instructions'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported multi-engine head-gasket card with the exact 1990 seat-belt-information recall and removed two search links.',
      },
    ),
    'chevrolet-beretta-ignition-module': replace(
      sources.steeringWheel,
      'Replace the uncited seven-year ignition-module aggregation and four unrelated search links with the exact 1991 steering-wheel retaining-nut recall.',
      {
        years: [1991],
        trims: [],
        engines: [],
        category: 'suspension',
        title: 'Steering-Wheel Retaining Nut May Be Under-Torqued (Recall 91V083)',
        description:
          'NHTSA Recall 91V083 covers certain 1991 Chevrolet Beretta vehicles whose steering-wheel retaining nut may not have been tightened properly. The steering wheel can separate from the column without warning, causing loss of control and a crash.',
        solution:
          'Check the VIN for recall completion. The recall remedy tightens the steering-wheel retaining nut to the proper torque as necessary.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Loose steering wheel', 'Steering wheel separates from the steering column without warning'],
        affectedSystems: ['steering wheel, retaining nut and steering column'],
        dtcCodes: [],
        summary:
          'Replaced an uncited ignition-module card with the exact 1991 steering-wheel recall and removed four unrelated search links.',
      },
    ),
    'chevrolet-beretta-pass-lock': replace(
      sources.stopLamp,
      'Replace the uncited PASS-Key no-start aggregation and five unrelated search links with the exact 1992 stop-lamp switch recall.',
      {
        years: [1992],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Stop-Lamp Switch Can Become Inoperative (Recall 92V185)',
        description:
          'NHTSA Recall 92V185 covers certain 1992 Chevrolet Beretta vehicles. An inoperative service-brake stop-lamp switch prevents the stop lamps from illuminating when the brake pedal is pressed, so other drivers may not be warned that the vehicle is slowing or stopping.',
        solution:
          'Check the VIN for recall completion. The remedy replaces the stop-lamp switch and corrects the wiring in its harness connector.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Stop lamps do not illuminate when the brake pedal is pressed', 'ABS warning lamp may illuminate after repeated brake applications'],
        affectedSystems: ['stop-lamp switch, connector wiring and stop lamps'],
        dtcCodes: [],
        summary:
          'Replaced an uncited PASS-Key card with the exact 1992 stop-lamp recall and removed five unrelated search links.',
      },
    ),
    'chevy-beretta-brake-proportioning-1990': replace(
      sources.rocker,
      'Replace the complaint-page/video brake proportioning aggregation and two unrelated search links with the exact 1994-1995 right-rocker reinforcement recall.',
      {
        years: [1994, 1995],
        trims: [],
        engines: [],
        category: 'body',
        title: 'Right Rocker May Lack a Crash Reinforcement Panel (Recall 94V176)',
        description:
          'NHTSA Recall 94V176 covers certain 1994-1995 Chevrolet Beretta vehicles that may be missing the right-side rocker reinforcement panel. The omission reduces occupant protection in a side-impact collision and violates the applicable crash-protection standard.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer inspects for the right-side rocker reinforcement panel and follows the campaign instructions if the panel is absent.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable owner-visible warning', 'Right-side rocker reinforcement panel absent on inspection'],
        affectedSystems: ['right-side rocker assembly and reinforcement panel'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported brake-proportioning card with the exact 1994-1995 rocker-reinforcement recall and removed two search links.',
      },
    ),
    'chevy-beretta-dist-gear-1990': replace(
      sources.interiorLamps,
      'Replace the complaint-page/video distributor-gear aggregation and two unrelated search links with the exact 1996 interior-lamp control recall.',
      {
        years: [1996],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Interior Lamps Can Switch On Unexpectedly While Driving (Recall 98V027)',
        description:
          'NHTSA Recall 98V027 covers certain 1996 Chevrolet Beretta vehicles whose interior lamps can come on unexpectedly while the vehicle is moving. The sudden illumination can startle the driver and cause a momentary loss of control.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer runs a diagnostic test on the lamp-control module and replaces it if necessary.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Interior lamps illuminate unexpectedly while driving'],
        affectedSystems: ['interior lamps and lamp-control module'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported distributor-gear card with the exact 1996 interior-lamp recall and removed two search links.',
      },
    ),
  },
  proposalCampaigns: [],
});
