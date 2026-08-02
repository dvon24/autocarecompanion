const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  brakePipes: {
    type: 'recall',
    title: 'NHTSA Recall 67V005 - Incorrect Brake-Pipe Routing',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=67V005000',
  },
  wheels: {
    type: 'recall',
    title: 'NHTSA Recall 70V094 - Cracking One-Piece Wheels',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=70V094000',
  },
  throttle: {
    type: 'recall',
    title: 'NHTSA Recall 70V125 - Carburetor Throttle-Lever Interference',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=70V125000',
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
  label: 'Chevrolet C10',
  make: 'Chevrolet',
  model: 'C10',
  slug: 'chevrolet-c10',
  batchId: 'chevrolet-c10-full-record-cohort-10-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    '1af6c3c40f3ab694b7f35659d261e3ae29a62d0de99745550398df03721c8c6f',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-c10/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletc10_blind:self-no-blocker',
    edge: 'chevroletc10_edge:self-no-blocker',
  },
  published: {
    'chevrolet-c10-four-wheel-drum-brakes-fade-pull': replace(
      sources.brakePipes,
      'Replace a restoration-forum drum-brake upgrade recommendation that overstates a design characteristic as a defect with the exact 1967 brake-pipe routing recall.',
      {
        years: [1967],
        trims: [],
        engines: [],
        category: 'brakes',
        title: 'Incorrect Brake-Pipe Routing Can Reduce Backup Braking (Recall 67V005)',
        description:
          'NHTSA Recall 67V005 covers certain 1967 Chevrolet C10 trucks. Incorrect brake-pipe routing can reduce the effectiveness of the remaining partial braking system if the rear brake circuit stops functioning.',
        solution:
          'Check the VIN and historical service records for campaign completion. The recall calls for inspection and rerouting of the brake pipes as necessary.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable warning before a rear-circuit failure', 'Reduced partial braking effectiveness after rear brake-system failure'],
        affectedSystems: ['hydraulic brake pipes and dual brake system routing'],
        dtcCodes: [],
        summary:
          'Replaced a non-defect brake-upgrade card with the exact 1967 brake-pipe routing recall.',
      },
    ),
    'chevrolet-c10-drop-center-frame-rust-through-body-mounts': replace(
      sources.wheels,
      'Replace a vendor/forum frame-rust restoration narrative with the exact 1970 one-piece wheel cracking recall.',
      {
        years: [1970],
        trims: [],
        engines: [],
        category: 'suspension',
        title: 'One-Piece 15 x 5.5 Wheels Can Crack and Separate (Recall 70V094)',
        description:
          'NHTSA Recall 70V094 covers certain 1970 Chevrolet C10 trucks with one-piece 15 x 5.5 wheels. The wheels can crack, causing severe vibration and potentially total wheel separation with loss of vehicle control.',
        solution:
          'Check the VIN and historical service records for campaign completion. The recall replaces affected wheels where necessary.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Severe wheel vibration', 'Visible cracking in an affected wheel', 'Risk of wheel separation and loss of control'],
        affectedSystems: ['one-piece 15 x 5.5 wheels and wheel mounting'],
        dtcCodes: [],
        summary:
          'Replaced a secondary-source frame-rust card with the exact 1970 wheel-cracking recall.',
      },
    ),
    'chevrolet-c10-external-regulator-generator-alternator-charging-points-igni': replace(
      sources.throttle,
      'Replace a forum-based modernization recommendation that labels original charging and ignition designs unreliable with the exact 1971 stuck-throttle recall.',
      {
        years: [1971],
        trims: [],
        engines: ['carbureted engines'],
        category: 'fuel',
        title: 'Carburetor Throttle Lever Can Catch and Hold the Throttle Open (Recall 70V125)',
        description:
          'NHTSA Recall 70V125 covers certain 1971 Chevrolet C10 trucks. The carburetor throttle lever can catch under the throttle-linkage bracket and hold the throttle partly open, preventing the vehicle from slowing normally when the accelerator is released.',
        solution:
          'Check the VIN and historical service records for campaign completion. The recall modifies the carburetor throttle bracket.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Throttle remains partly open', 'Engine speed does not fall when the accelerator is released', 'Vehicle is difficult to slow or control'],
        affectedSystems: ['carburetor throttle lever and throttle-linkage bracket'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported charging-system modernization card with the exact 1971 throttle-interference recall.',
      },
    ),
  },
  reasons: {
    'chevrolet-c10-cab-corners-floor-pans-rocker-panels-rust-out-cab-mounts':
      'Archive this restoration-vendor rust narrative because it is not tied to an authoritative C10 defect campaign, verified population or bounded failure rate; the repair advice is invasive and cannot be represented as a model-wide known issue from the cited evidence.',
    'chevrolet-c10-worn-rear-trailing-arm-front-control-arm-bushings-cause-floa':
      'Archive this normal-wear suspension maintenance card because the cited retailer and upgrade article do not establish a model-specific defect, affected production scope or authoritative remedy.',
    'chevrolet-c10-worn-steering-box-front-end-linkage-cause-vague-wandering-st':
      'Archive this normal-wear steering maintenance card because two forum threads do not substantiate a model-specific defect or a bounded affected population, and the upgrade recommendation is not an original-equipment repair campaign.',
  },
  proposalCampaigns: [],
});
