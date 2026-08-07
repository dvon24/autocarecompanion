/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./international-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_international-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-international-scout-adjudication-2026-08-06.json');
const IDS = {
  steering: 'international-scout-frame-fatigue-cracking-steering-box-mount',
  rust: 'international-scout-frame-rocker-floor-rust-scout-s-defining-weak-point',
  hotStart: 'international-scout-heat-soaked-starter-solenoid-no-hot-restart',
  goldBox: 'international-scout-holley-gold-box-electronic-ignition-high-failure-rate',
  cooling: 'international-scout-marginal-cooling-system-frozen-heat-riser-overheating',
  fuelTank: 'international-scout-rusted-pinholed-steel-fuel-tank-failing-sending-unit',
  charging: 'international-scout-weak-stock-charging-system',
};
const SOURCES = {
  steeringBrace: 'https://www.ihpartsamerica.com/store/sii-strsteer.html',
  steeringPlate: 'https://scoutparts.com/Scout_II_Power_Steering_Box_Reinforcement_Plate/p13728',
  rustBuyerGuide: 'https://www.corsetticruisers.com/post/buyer-s-guide-international-scout-ii-top-5-things-to-look-out-for',
  rustRestomod: 'https://robbreport.com/motors/cars/first-drive-bulletproof-restorations-international-scout-restomod-1234688869/',
  bodyPanels: 'https://anythingscout.com/collections/steel-body-parts',
  floorPanEarly: 'https://anythingscout.com/products/3522-right-floor-pan-800',
  starterRelay: 'https://scoutparts.com/Starter_Relay_Kit_With_12V_Harness_Send_More_Power_To_Your_Solenoid__Scout_II_Scout_80_Scout_800/p16071',
  hotStartForum: 'https://forums.ihpartsamerica.com/threads/80-scout-ii-wont-start-when-hot.8426/',
  goldBoxForum: 'https://forums.ihpartsamerica.com/threads/scout-ii-ignition-issues.6661/',
  summitSearch: 'https://www.summitracing.com/search/brand/pertronix/part-type/electronic-distributor-conversion-kits/make/international/model/scout-ii',
  pertronixGoldBox: 'https://pertronixbrands.com/products/pertronix-9ho-181-ignitor-ii-adaptive-dwell-control-holley-8-cyl',
  heatRiser: 'https://scoutparts.com/IH_V8_Heat_Riser_Valve_NEW_heat_regulator/p13783',
  coolingForum: 'https://forums.ihpartsamerica.com/threads/improved-cooling-345.2366/page-2',
  fuelTank: 'https://raybuck.com/product/1972-1980-international-scout-ii-19-gallon-rear-tank-with-ems-fittings/',
  fuelSendersCategory: 'https://www.gastankdepot.com/international-gas-tank-sending-units.html',
  fuelSenderEarly: 'https://scoutparts.com/Fuel_Sending_Unit_Fuel_Sender_Scout_80_800_860097R91_860097R91_Scout_80_Scout_800/p10177',
  fuelSenderLate: 'https://scoutparts.com/products/?product_id=10178&view=product',
  alternator: 'https://anythingscout.com/products/3478-160-amp-alternator',
  alternatorForum: 'https://forums.ihpartsamerica.com/threads/alternator-upgrade.3100/',
};
const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 20 }, (_, index) => 1961 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=International&model=Scout&modelYear=${year}`]));
const KEEP_REASONS = {
  [IDS.steering]: 'The two live parts pages establish 1971-1980 Scout II/Terra/Traveler steering-box bracing and frame reinforcement, and one says the brace reduces wandering by stiffening the frame area. They do not establish the frozen row’s fatigue/cracking mechanism, oversized-tire causation, catastrophic-highway consequence, prevalence, severity or repair sequence, so the indexed row remains byte-for-byte unchanged pending an exact technical source.',
  [IDS.rust]: 'The live restoration pages establish that replacement floors, rockers, mounts and related panels exist for multiple Scout generations. They do not establish the frozen 1961-1980 all-generation factory-coating claim, every listed structural danger zone, the “body literally rusts off” prevalence narrative or one universal body-off remedy, so this broad identity remains byte-for-byte unchanged.',
  [IDS.hotStart]: 'The live ScoutParts relay page covers 1961-1980 Scouts and attributes intermittent click/no-crank behavior to ignition-switch or harness voltage drop through loose, worn or oxidized connections. It does not establish a starter-solenoid heat-soak defect beside the exhaust, the ten-minute hot-soak condition, slow-crank outcome or the full combined mechanism in the indexed title. Because voltage drop is not interchangeable with heat soak, the row remains byte-for-byte unchanged.',
  [IDS.goldBox]: 'PerTronix’s direct Gold Box application page supports a Holley Hot Gold Box conversion only for a 1976-1977 Scout II with the 304 V8 and original Holley distributor. It does not support the frozen 1973-1980 range, the 345 V8 or AMC inline-six engines, a high failure rate, potting-compound diagnosis, or the claim that replacement boxes fail the same way. The live forum thread is case-specific rather than scope evidence, so the row remains unchanged.',
  [IDS.cooling]: 'The live heat-riser product page supports the IH V8 valve’s function and warns that a frozen-closed valve can cause overheating, a lean mixture and possible fire. It also says a missing or frozen-open valve causes poor warm-up, fuel economy, carburetor icing and fuel puddling, conflicting with the indexed advice to delete or lock it open. The cooling discussion distinguishes factory standard, increased and improved-cooling configurations rather than proving every Scout II system marginal. This mixed identity and potentially unsafe remedy remain frozen pending an exact rewrite approval.',
  [IDS.fuelTank]: 'The live Raybuck polyethylene tank page is limited to 1972-1980 Scout II, while direct ScoutParts sender pages split 1961-1971 Scout 80/800 from 1971-1980 Scout II. Those pages establish replacement fitment and gauge-service possibilities, not one 1961-1980 original-steel-tank rust/pinhole defect, common prevalence or a universal 19-gallon replacement procedure. The row remains byte-for-byte unchanged rather than applying the late tank to early Scouts.',
  [IDS.charging]: 'The live Anything Scout page supports a plug-in 140/160-amp alternator upgrade and says stock alternators produce 50-60 amps, but it does not establish the frozen 1961-1980 generator/alternator scope, undercharging prevalence, reverse/tail-light failures, CS130 universality or charge-wire prescription across every listed engine and Scout generation. The forum is discussion evidence only, so the broad row remains unchanged.',
};

function evidenceFor(id) {
  const mapping = {
    [IDS.steering]: [
      { kind: 'authorized-dealer-product-partial-scope', url: SOURCES.steeringBrace, verifiedOn: '2026-08-06', observation: 'Fits 1971-1980 Scout II/Terra/Traveler and says the brace reduces wandering by stiffening the frame at the steering box; does not state frame fatigue/cracking or catastrophic failure.' },
      { kind: 'authorized-dealer-product-partial-scope', url: SOURCES.steeringPlate, verifiedOn: '2026-08-06', observation: 'Live steering-box reinforcement-plate page; product existence and fitment do not establish the full defect narrative.' },
    ],
    [IDS.rust]: [
      { kind: 'authorized-dealer-product-partial-scope', url: SOURCES.floorPanEarly, verifiedOn: '2026-08-06', observation: 'The early Scout 80/800 floor-pan page presents a repair for rusty floors; it does not establish every frozen location, cause, prevalence or all-year remedy.' },
      { kind: 'authorized-dealer-catalog-not-defect-proof', url: SOURCES.bodyPanels, verifiedOn: '2026-08-06', observation: 'Lists replacement body panels for multiple Scout generations; parts availability is not proof of prevalence, factory coating or one universal remediation path.' },
    ],
    [IDS.hotStart]: [
      { kind: 'authorized-dealer-mechanism-mismatch', url: SOURCES.starterRelay, verifiedOn: '2026-08-06', observation: 'Attributes intermittent click/no-crank to ignition-switch and harness voltage drop; it does not identify starter-solenoid heat soak or a ten-minute hot restart condition.' },
      { kind: 'forum-case-not-scope-proof', url: SOURCES.hotStartForum, verifiedOn: '2026-08-06', observation: 'A live owner discussion cannot establish the all-year combined heat-soak and wiring mechanism.' },
    ],
    [IDS.goldBox]: [
      { kind: 'manufacturer-fitment-scope-mismatch', url: SOURCES.pertronixGoldBox, verifiedOn: '2026-08-06', observation: 'PerTronix 9HO-181 lists 1976-1977 Scout II, 304 V8, factory electronic Holley Hot Gold Box and original Holley distributor only.' },
      { kind: 'forum-case-not-prevalence-proof', url: SOURCES.goldBoxForum, verifiedOn: '2026-08-06', observation: 'The live diagnostic thread does not substantiate the frozen high-failure-rate or full engine/year claims.' },
    ],
    [IDS.cooling]: [
      { kind: 'authorized-dealer-remedy-conflict', url: SOURCES.heatRiser, verifiedOn: '2026-08-06', observation: 'Supports frozen-closed overheating but warns a missing or frozen-open valve has its own adverse consequences, conflicting with delete/lock-open guidance.' },
      { kind: 'technical-discussion-scope-conflict', url: SOURCES.coolingForum, verifiedOn: '2026-08-06', observation: 'Distinguishes standard, increased and improved cooling configurations; it does not establish one universally marginal Scout II system.' },
    ],
    [IDS.fuelTank]: [
      { kind: 'manufacturer-product-year-mismatch', url: SOURCES.fuelTank, verifiedOn: '2026-08-06', observation: 'The polyethylene rear tank is specifically a 1972-1980 Scout II product, not a 1961-1980 universal tank.' },
      { kind: 'authorized-dealer-split-fitment', url: SOURCES.fuelSenderEarly, verifiedOn: '2026-08-06', observation: 'The early sender is listed for 1961-1971 Scout 80/800.' },
      { kind: 'authorized-dealer-split-fitment', url: SOURCES.fuelSenderLate, verifiedOn: '2026-08-06', observation: 'The later sender is listed for the Scout II/Terra/Traveler 19-gallon tank through 1980.' },
    ],
    [IDS.charging]: [
      { kind: 'authorized-dealer-product-partial-scope', url: SOURCES.alternator, verifiedOn: '2026-08-06', observation: 'Supports a 140/160-amp plug-in alternator upgrade and states stock alternators make 50-60 amps; it does not establish early-generator or all-generation failure claims.' },
      { kind: 'forum-discussion-not-scope-proof', url: SOURCES.alternatorForum, verifiedOn: '2026-08-06', observation: 'The live discussion does not establish the full 1961-1980 indexed identity.' },
    ],
  };
  return mapping[id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'International' && row.model === 'Scout');
  if (modelRows.length !== 7) throw new Error(`expected 7 International Scout rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id] || !evidenceFor(current.id)) throw new Error(`missing Scout decision: ${current.id}`);
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule: 'No content, scope or publication-state changes; a compatible restoration part or owner discussion cannot establish the full indexed defect identity.',
      commerceDecision: 'unchanged-no-commerce-present',
      changedFields: [],
      evidence: evidenceFor(current.id),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(before),
      before,
      proposal: before,
    };
  });
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'International',
    model: 'Scout',
    completionStatement: 'This packet reconciles all seven frozen International Scout rows. All current citations are live, but no row has exact full-identity evidence strong enough for a safe rewrite; all seven remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All seven Scout rows remain published and byte-for-byte unchanged.',
      'A restoration part page may establish product fitment but cannot by itself establish defect prevalence, mechanism, severity or a universal repair.',
      'Partial year, engine or generation evidence cannot be expanded to the frozen 1961-1980 or 1971-1980 scopes.',
      'Potentially unsafe or conflicting remedy language is flagged for independent review rather than silently rewritten.',
      'Distinct recall identities remain deferred until the post-audit new-known-issues phase.',
    ],
    source: {
      snapshotFile: 'data/_international-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      scoutRecordCount: 7,
    },
    observations: [
      { code: 'all-existing-citations-live', severity: 'link-integrity', recordIds: Object.values(IDS), detail: 'All 15 citation URLs currently stored across the seven Scout rows returned HTTP 200 during live verification.' },
      { code: 'product-pages-not-defect-proof', severity: 'high', recordIds: Object.values(IDS), detail: 'Authorized-dealer and manufacturer pages establish selected product fitment, not the broad prevalence, mechanism and outcome claims in the indexed records.' },
      { code: 'cooling-remedy-conflict-frozen', severity: 'safety-review-required', recordIds: [IDS.cooling], detail: 'The source warns against a missing or frozen-open heat-riser, while the indexed solution suggests deleting or locking it open.' },
      { code: 'split-generation-fitment-frozen', severity: 'high', recordIds: [IDS.fuelTank, IDS.goldBox, IDS.charging], detail: 'Direct product sources split by generation, year, engine or installed distributor and do not support the frozen universal scopes.' },
      { code: 'nhtsa-vintage-model-api-unavailable', severity: 'source-limit', recordIds: Object.values(IDS), detail: 'All 1961-1980 International Scout model-year queries returned HTTP 400, so the API cannot be treated as affirmative or negative defect evidence.' },
      { code: 'all-scout-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed Scout record remains published with identical ID, title, years, category, content, citations and commerce.' },
    ],
    reviewSources: SOURCES,
    mismatchSources: { recallQueries: RECALL_QUERIES, expectedHttpStatus: 400 },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 7, total: 7 },
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { IDS, KEEP_REASONS, RECALL_QUERIES, SOURCES, evidenceFor };
