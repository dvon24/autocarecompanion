/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs'); const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jaguar-adjudication-utils');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jaguar-x-type-adjudication-2026-08-06.json');
const IDS = { alternator: 'jaguar-x-type-alternator-failure-2002', thermostat: 'jaguar-x-type-thermostat-housing-leak-2002', transfer: 'jaguar-x-type-transfer-case-viscous-coupling-2002', window: 'jaguar-x-type-window-regulator-2002' };
const SOURCES = {
  thermostat: 'https://www.xtype.uk/docs/tsb/XT303-S939.pdf',
  windowSwitch: 'https://www.xtype.uk/docs/tsb/XT501-11.pdf',
  windowAdjustment: 'https://workshop-manuals.com/jaguar/x-type_%28x400%29/v6-2.5l/body_and_frame/doors_hood_and_trunk/doors/front_door/front_door_window_regulator/system_information/technical_service_bulletins/customer_interest_for_front_door_window_regulator/jtb000573/feb/10/body_front_door_window_complaints/',
  awdPressPack: 'https://www.jag-lovers.org/brochures/x-type/xtypepacktext2001.html',
  awdTrainingIndex: 'https://manualzz.com/doc/28319745/jaguar-5hp24--w5a580--5r55n--jf506e--6hp26-automatic-tran...',
};
const PDF_SOURCES = { thermostat: SOURCES.thermostat, windowSwitch: SOURCES.windowSwitch };
const PDF_SHA256 = { thermostat: 'e4d870fc3818a067844def0bb8283f63bf0df8735c959e7ae75cdb8e687f4c4a', windowSwitch: '75d41a3128c63e3eace5657dd0135f3149fa60d17d06875f9fb64a0b313d8e7a' };
const VISUALLY_INSPECTED_PAGES = { thermostat: [1], windowSwitch: [1] };
const WEB_SOURCE_MARKERS = {
  awdPressPack: ['viscous coupling', 'epicyclic centre differential', 'Traction 4'],
  windowAdjustment: ['JTB00057', 'Loose glass', 'regulator fixings', 'adjust the positioning'],
};
const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 8 }, (_, index) => 2002 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=X-TYPE&modelYear=${year}`]));
const EXPECTED_RECALLS = {
  2002: { status: 200, campaigns: ['03V011000', '04V487000'] }, 2003: { status: 200, campaigns: ['03V011000', '04V487000'] }, 2004: { status: 200, campaigns: ['04V460000'] },
  2005: { status: 400, campaigns: [] }, 2006: { status: 400, campaigns: [] }, 2007: { status: 400, campaigns: [] }, 2008: { status: 400, campaigns: [] }, 2009: { status: 400, campaigns: [] },
};
const KEEP_REASONS = {
  [IDS.alternator]: 'No exact Jaguar primary source was located that establishes a common 2002-2009 X-TYPE voltage-regulator/diode-pack defect, a 60,000-100,000-mile failure interval, the frozen three-engine scope or the Ford-pattern aftermarket claim. The official recall inventory contains distinct campaign identities and is not negative proof, so the indexed row remains byte-for-byte unchanged pending an exact source.',
  [IDS.thermostat]: 'Jaguar service action XT303-S939 covers limited 2002-2003 VINs where a spring-band hose clamp can walk on the hose joint at the thermostat-housing inlet and prescribes repositioning it plus adding a worm-drive clamp. It is not a cracked plastic thermostat housing, does not establish glass-filled nylon embrittlement across 2002-2009, and does not prescribe an aluminum aftermarket housing. The broader frozen row therefore remains unchanged.',
  [IDS.transfer]: 'Jaguar describes the original Traction4 system as an epicyclic center differential with a viscous coupling, not a Haldex system. Jaguar technical-training indexed material also records the 2004 MY deletion of the viscous coupling as a running change, so the frozen 2002-2009 scope and all-engine applicability cannot be supported. No exact primary source clears the asserted common failure mode, silicone-fluid service, coupling replacement or defining-issue frequency, so the row remains unchanged.',
  [IDS.window]: 'Jaguar bulletin XT501-11 covers a limited 2004 rear-window switchpack/isolator concern and replaces the driver window-control switch, not a cable-driven regulator failure. JTB00057 covers front-glass alignment, loose regulator fixings and slow/judder/bind symptoms with an adjustment procedure, not snapped cables across all four windows or the frozen Ford Mondeo interchange claim. The indexed row remains byte-for-byte unchanged.',
};
function evidenceFor(id) { return {
  [IDS.alternator]: [{ kind: 'official-registry-boundary-not-negative-proof', url: RECALL_QUERIES[2002], verifiedOn: '2026-08-06', observation: 'The official inventory supplies a campaign boundary but no exact alternator defect identity.' }],
  [IDS.thermostat]: [{ kind: 'jaguar-component-cause-remedy-year-vin-mismatch', url: SOURCES.thermostat, verifiedOn: '2026-08-06', observation: 'XT303-S939 concerns a walking hose clamp on limited 2002-2003 VINs, not housing cracking or an aluminum replacement.' }],
  [IDS.transfer]: [{ kind: 'jaguar-awd-architecture-mismatch', url: SOURCES.awdPressPack, verifiedOn: '2026-08-06', observation: 'Jaguar calls the launch system Traction4 with an epicyclic center differential and viscous coupling, not Haldex.' }, { kind: 'jaguar-running-change-index-boundary', url: SOURCES.awdTrainingIndex, verifiedOn: '2026-08-06', observation: 'Indexed Jaguar training text records deletion of the viscous coupling for the 2004 MY running change; the PDF mirror was not accepted as byte-verifiable evidence for a rewrite.' }],
  [IDS.window]: [{ kind: 'jaguar-window-switch-cause-remedy-vin-mismatch', url: SOURCES.windowSwitch, verifiedOn: '2026-08-06', observation: 'XT501-11 covers a specific 2004 switchpack/isolator fault, not regulator cables.' }, { kind: 'jaguar-window-adjustment-outcome-mismatch', url: SOURCES.windowAdjustment, verifiedOn: '2026-08-06', observation: 'JTB00057 addresses glass alignment, loose fixings and movement with adjustment, not a general cable-snap identity.' }],
}[id]; }
function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'X-TYPE');
  if (modelRows.length !== 4) throw new Error(`expected 4 Jaguar X-TYPE rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => { if (!KEEP_REASONS[current.id] || !evidenceFor(current.id)) throw new Error(`missing X-TYPE decision: ${current.id}`); const before = fullRecord(current); return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content, scope or publication-state changes; partial, indexed-only or mismatched evidence cannot be expanded into the frozen identity.', commerceDecision: 'unchanged-no-commerce-present', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before }; });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Jaguar', model: 'X-TYPE',
    completionStatement: 'This packet reconciles all four frozen Jaguar X-TYPE rows. Two Jaguar PDFs and two relevant pages were visually reviewed; corroborating web sources and year-by-year NHTSA inventories were checked. All four rows remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All four X-TYPE rows remain published and byte-for-byte unchanged.', 'A component, model, year, VIN, cause, architecture or remedy mismatch cannot authorize a broader rewrite.', 'A recall-registry result is not negative proof that a non-recall issue does not exist.', 'Indexed-only technical-training text is a review boundary, not rewrite authorization.', 'The four frozen citation objects contain titles but no URLs and therefore are not treated as verified source evidence.', 'Distinct issue identities remain deferred until the post-audit new-known-issues phase.'],
    source: { snapshotFile: 'data/_jaguar-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 4 },
    observations: [
      { code: 'x-type-alternator-primary-source-gap', severity: 'source-gap', recordIds: [IDS.alternator], detail: 'No exact primary source cleared the broad alternator aggregation.' },
      { code: 'x-type-thermostat-component-remedy-scope', severity: 'high', recordIds: [IDS.thermostat], detail: 'The exact action is for a hose clamp on limited VINs, not housing cracking or an aluminum replacement.' },
      { code: 'x-type-transfer-architecture-year-scope', severity: 'high', recordIds: [IDS.transfer], detail: 'The architecture is not Haldex and the viscous-coupling scope does not extend through the frozen years.' },
      { code: 'x-type-window-cause-remedy-scope', severity: 'high', recordIds: [IDS.window], detail: 'Located bulletins concern switchpack and glass alignment/fixings, not a universal cable-snap identity.' },
      { code: 'x-type-existing-citations-missing-urls', severity: 'source-gap', recordIds: Object.values(IDS), detail: 'Every frozen citation has a title but no URL, so none can independently clear a rewrite.' },
      { code: 'all-x-type-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed X-TYPE record remains published with identical ID, title, years, category, content, citations and commerce.' },
    ],
    reviewSources: SOURCES, pdfSources: PDF_SOURCES, sourceArtifactSha256: PDF_SHA256, visuallyInspectedPages: VISUALLY_INSPECTED_PAGES, webSourceMarkers: WEB_SOURCE_MARKERS, mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS }, summary: { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SHA256, PDF_SOURCES, RECALL_QUERIES, SOURCES, VISUALLY_INSPECTED_PAGES, WEB_SOURCE_MARKERS, evidenceFor };
