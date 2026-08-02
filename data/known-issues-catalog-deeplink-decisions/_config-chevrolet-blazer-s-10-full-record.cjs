const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  glassPrimer: {
    type: 'recall',
    title: 'NHTSA Recall 90V107 - Windshield and Side-Window Primer',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=90V107000',
  },
  rearBelts: {
    type: 'recall',
    title: 'NHTSA Recall 93V105 - Outboard Rear Seat Belts',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=93V105000',
  },
  frontBelts: {
    type: 'recall',
    title: 'NHTSA Recall 97V096 - Front Seat-Belt Webbing Protection',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=97V096001',
  },
  buckleButtons: {
    type: 'recall',
    title: 'NHTSA Recall 96V142 - Rear Seat-Belt Buckles',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=96V142000',
  },
  trailerHitch: {
    type: 'recall',
    title: 'NHTSA Recall 94V114 - Trailer-Hitch Bolt Torque',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=94V114000',
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
  label: 'Chevrolet Blazer S-10',
  make: 'Chevrolet',
  model: 'Blazer S-10',
  slug: 'chevrolet-blazer-s-10',
  batchId: 'chevrolet-blazer-s-10-full-record-cohort-6-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    '6dde8e85d29af40453e1fedca57b5b40a066814d54495bca041802bc75661fe1',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-blazer-s-10/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletblazers10_blind:self-no-blocker',
    edge: 'chevroletblazers10_edge:self-no-blocker',
  },
  published: {
    'chevrolet-blazer-s10-43l-intake-gasket-1996': replace(
      sources.glassPrimer,
      'Replace the empty-link TSB/complaint intake-gasket card and two search links with the exact 1991 glass-retention recall whose vehicle description explicitly includes utility trucks.',
      {
        years: [1991],
        trims: [],
        engines: [],
        category: 'body',
        title: 'Improper Primer Can Reduce Windshield and Side-Glass Retention (Recall 90V107)',
        description:
          'NHTSA Recall 90V107 includes certain 1991 Chevrolet S-series utility vehicles. Improper primer on the metal around the windshield and side-window openings can reduce glass adhesion below the safety-standard requirement, increasing occupant-ejection risk in a crash.',
        solution:
          'Check the VIN for recall completion. The campaign removes and reinstalls the affected glass using the proper primer.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable owner-visible warning', 'Improper glass-opening primer found during recall inspection'],
        affectedSystems: ['windshield and side-window bonding surfaces'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported intake-gasket card with the exact 1991 utility-vehicle glass-retention recall and removed two search links.',
      },
    ),
    'chevrolet-blazer-s10-4wd-actuator-1998': replace(
      sources.rearBelts,
      'Replace the empty-link TSB/complaint 4WD actuator card and two search links with the exact 1993 compact-utility rear seat-belt recall.',
      {
        years: [1993],
        trims: [],
        engines: [],
        category: 'safety',
        title: 'Outboard Rear Seat Belts Can Remain Fully Retracted (Recall 93V105)',
        description:
          'NHTSA Recall 93V105 covers certain 1993 two-door Chevrolet compact utility vehicles with folding rear seats. An outboard rear belt may not release webbing from the retracted position, making the restraint unusable and increasing injury risk in a crash.',
        solution:
          'Check the VIN for recall completion. The campaign replaces any affected rear belt that does not extend freely from the retractor.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Outboard rear seat-belt webbing will not extend from the retractor'],
        affectedSystems: ['outboard rear seat-belt assemblies and retractors'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported 4WD actuator card with the exact 1993 compact-utility rear-belt recall and removed two search links.',
      },
    ),
    'chevrolet-blazer-s10-dashboard-cracking-1998': replace(
      sources.frontBelts,
      'Replace the complaint-page dashboard card and two search links with the exact 1994-1997 front seat-belt webbing recall that explicitly includes two-door utility vehicles.',
      {
        years: [1994, 1995, 1996, 1997],
        trims: [],
        engines: [],
        category: 'safety',
        title: 'Front Seat-Belt Webbing Can Separate in a Frontal Impact (Recall 97V096)',
        description:
          'NHTSA Recall 97V096 includes certain 1994-1997 Chevrolet two-door utility vehicles with manual-locking recliner bucket seats. Driver or passenger belt webbing can separate in a frontal impact, leaving the occupant unrestrained during a secondary crash or rollover.',
        solution:
          'Check the VIN and seat equipment for recall completion. A Chevrolet dealer installs a protective cover over the recliner mechanism.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable warning before belt separation', 'Seat-belt webbing contacts the seat recliner mechanism'],
        affectedSystems: ['front outboard seat-belt webbing and recliner mechanisms'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported dashboard card with the exact 1994-1997 two-door utility seat-belt recall and removed two search links.',
      },
    ),
    'chevy-blazer-s10-cpi-leak-1992': replace(
      sources.buckleButtons,
      'Replace the empty-link TSB/complaint CPI leak card and two search links with the exact rear seat-belt buckle recall for multipurpose passenger vehicles.',
      {
        years: [1991],
        trims: [],
        engines: [],
        category: 'safety',
        title: 'Rear Seat-Belt Buckle Buttons Can Stick Unlatched (Recall 96V142)',
        description:
          'NHTSA Recall 96V142 includes certain 1991 Chevrolet Blazer multipurpose passenger vehicles. Movement inside the buckle cover can hold a rear buckle release button down, preventing the belt from latching and restraining an occupant.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer replaces the three rear-seat belt buckles with a revised assembly.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Rear buckle release button remains down', 'Rear seat belt will not latch'],
        affectedSystems: ['rear seat-belt buckle assembly and cover'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported CPI leak card with the exact rear-buckle recall and removed two search links.',
      },
    ),
    'chevy-blazer-s10-transfer-case-1990': replace(
      sources.trailerHitch,
      'Replace the complaint-page/video transfer-case actuator card and two search links with the exact 1994 four-door utility VR4 trailer-hitch recall.',
      {
        years: [1994],
        trims: [],
        engines: [],
        category: 'body',
        title: 'Under-Torqued Trailer-Hitch Bolts Can Loosen and Break (Recall 94V114)',
        description:
          'NHTSA Recall 94V114 covers certain 1994 Chevrolet four-door multipurpose vehicles equipped with the VR4 weight-distribution trailer hitch. Under-torqued bolts can loosen and break, allowing the hitch and trailer to separate while towing.',
        solution:
          'Check the VIN and VR4 equipment for recall completion. A Chevrolet dealer tightens all eight trailer-hitch bolts to the specified torque.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Loose or broken trailer-hitch bolts', 'Hitch and trailer separate from the vehicle'],
        affectedSystems: ['VR4 trailer hitch and eight attaching bolts'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported transfer-case actuator card with the exact 1994 four-door utility trailer-hitch recall and removed two search links.',
      },
    ),
  },
  proposalCampaigns: [],
});
