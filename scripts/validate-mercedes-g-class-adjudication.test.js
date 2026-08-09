/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-g-class-adjudication');
const { hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-g-class-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function row(packet, id) { return packet.rows.find((item) => item.id === id); }
function rehash(item) { item.proposalSha256 = hashValue(item.proposal); item.changedFields = Object.keys(item.proposal).filter((key) => hashValue(item.before[key]) !== hashValue(item.proposal[key])); }
function rejects(name, mutate, pattern) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }

test('frozen G-Class packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { const item = row(packet, IDS.corrosion); item.proposal.title += ' revised'; rehash(item); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { const item = row(packet, IDS.wiringRecall); item.proposal.years = [2019, 2020, 2021, 2022]; rehash(item); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { const item = row(packet, IDS.fuelRecall); item.proposal.trims = []; rehash(item); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { const item = row(packet, IDS.m157); item.proposal.engines = []; rehash(item); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { const item = row(packet, IDS.transferLeak); item.proposal.category = 'transmission'; rehash(item); }, /deterministic|immutable category/);
rejects('rejects severity change', (packet) => { const item = row(packet, IDS.axleSeal); item.proposal.severity = 'medium'; rehash(item); }, /deterministic|immutable severity/);
rejects('rejects archive', (packet) => { const item = row(packet, IDS.steeringDamper); item.proposal.status = 'archived'; rehash(item); }, /deterministic|immutable status/);
rejects('rejects related-link change', (packet) => { const item = row(packet, IDS.infotainment); item.proposal.relatedIssueIds = []; rehash(item); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects zero social proof', (packet) => { const item = row(packet, IDS.doorHinge); item.proposal.description += ' 0+ owners have reported this.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects old social proof', (packet) => { const item = row(packet, IDS.steeringDamper); item.proposal.description += ' 890+ owners have reported this.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects restored COMAND count', (packet) => { const item = row(packet, IDS.infotainment); item.proposal.reportCount = 450; rehash(item); }, /deterministic|zero-count/);
rejects('rejects restored axle count', (packet) => { const item = row(packet, IDS.axleSeal); item.proposal.reportCount = 620; rehash(item); }, /deterministic|zero-count/);
rejects('rejects invented recall count', (packet) => { const item = row(packet, IDS.fuelRecall); item.proposal.reportCount = 143551; rehash(item); }, /deterministic|zero-count/);
rejects('rejects commerce', (packet) => { const item = row(packet, IDS.transmission); item.proposal.fixParts.push({ partNumber: 'valve-body' }); rehash(item); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { const item = row(packet, IDS.wiringRecall); item.proposal.humanApproved = true; rehash(item); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { const item = row(packet, IDS.m177); item.proposal.citations[0].url = 'https://example.com/search?q=m177'; rehash(item); }, /deterministic|citation/);
rejects('rejects retained transmission converted to hold', (packet) => { const item = row(packet, IDS.transmission); item.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; item.identityReviewRequired = true; item.identityConflict = 'added'; }, /deterministic|retain verdict/);
rejects('rejects retained wiring recall converted to hold', (packet) => { const item = row(packet, IDS.wiringRecall); item.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; item.identityReviewRequired = true; item.identityConflict = 'added'; }, /deterministic|retain verdict/);
rejects('rejects corrosion hold converted to retain', (packet) => { const item = row(packet, IDS.corrosion); item.action = 'retain_indexed_identity_and_accuracy_cleanup'; item.identityReviewRequired = false; item.identityConflict = null; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds.pop(); }, /deterministic|blocker/);
rejects('rejects transmission wet-clutch transfer', (packet) => { const item = row(packet, IDS.transmission); item.proposal.description = 'All G-Class wet clutches drift and need a valve body.'; rehash(item); }, /deterministic|transmission evidence/);
rejects('rejects corrosion design claim', (packet) => { const item = row(packet, IDS.corrosion); item.proposal.description = '1970s metallurgy proves every G-Class frame rusts.'; rehash(item); }, /deterministic|corrosion evidence/);
rejects('rejects wiring recall scope drift', (packet) => { const item = row(packet, IDS.wiringRecall); item.proposal.description = 'Recall 23V097 covers every 2019-2022 G-Class trim.'; rehash(item); }, /deterministic|wiring recall/);
rejects('rejects fuel recall population transfer', (packet) => { const item = row(packet, IDS.fuelRecall); item.proposal.description = '143,551 G-Class owners reported fuel pump failure.'; rehash(item); }, /deterministic|fuel recall|owner social proof/);
rejects('rejects M157 scoring transfer', (packet) => { const item = row(packet, IDS.m157); item.proposal.description = '10206077 proves universal M157 cylinder scoring.'; rehash(item); }, /deterministic|M157 evidence/);
rejects('rejects M177 oil-rate transfer', (packet) => { const item = row(packet, IDS.m177); item.proposal.description = 'All M177s burn a quart every 1,000 miles.'; rehash(item); }, /deterministic|M177 evidence/);
rejects('rejects OM642 early-year transfer', (packet) => { const item = row(packet, IDS.om642Oil); item.proposal.description = 'Every 2000 G-Class had OM642 oil-cooler seals.'; rehash(item); }, /deterministic|OM642 oil evidence/);
rejects('rejects swirl-flap source invention', (packet) => { const item = row(packet, IDS.om642Swirl); item.proposal.description = 'Mercedes proves P2015 and a metal rod repair.'; rehash(item); }, /deterministic|OM642 swirl evidence/);
rejects('rejects COMAND MBUX merge', (packet) => { const item = row(packet, IDS.infotainment); item.proposal.description = 'One defect causes all 2013-2025 COMAND and MBUX systems to reboot.'; rehash(item); }, /deterministic|infotainment evidence/);
rejects('rejects hinge-sag transfer', (packet) => { const item = row(packet, IDS.doorHinge); item.proposal.description = '11029045 proves worn hinges on every door.'; rehash(item); }, /deterministic|door-hinge evidence/);
rejects('rejects axle-seal universality', (packet) => { const item = row(packet, IDS.axleSeal); item.proposal.description = 'Every front axle leaks onto its brakes.'; rehash(item); }, /deterministic|axle-seal evidence/);
rejects('rejects steering-damper universality', (packet) => { const item = row(packet, IDS.steeringDamper); item.proposal.description = 'Every G-Class needs a Bilstein damper.'; rehash(item); }, /deterministic|steering-damper evidence/);
rejects('rejects transfer-case leak transfer', (packet) => { const item = row(packet, IDS.transferLeak); item.proposal.description = '11025100 proves the output seal leaks.'; rehash(item); }, /deterministic|transfer-case evidence/);
rejects('rejects wiring PDF page omission', (packet) => { packet.pdfSources.wiringRecall.visualPages = [1, 2, 4]; }, /deterministic|PDF evidence/);
rejects('rejects fuel PDF page omission', (packet) => { packet.pdfSources.fuelRecall.visualPages = [2, 5, 10, 11, 14]; }, /deterministic|PDF evidence/);
rejects('rejects local PDF path disclosure', (packet) => { packet.pdfSources.fuelRecall.localPath = 'C:/tmp/source.pdf'; }, /deterministic|PDF evidence/);
