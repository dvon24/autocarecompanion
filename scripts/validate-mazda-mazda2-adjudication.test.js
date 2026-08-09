/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-mazda2-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-mazda2-adjudication');
const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(value, id) { return value.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function errorsFor(mutator) { const value = copy(packet); mutator(value); return validatePacket(value, snapshot); }

test('baseline Mazda2 proposal packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('indexed title mutation is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.condenser); row.proposal.title = 'Condenser Leak'; rehash(row); }); assert.ok(errors.some((error) => error.includes('immutable title changed'))); });
test('fabricated brake count cannot return', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.rearBrake); row.proposal.reportCount = 150; rehash(row); }); assert.ok(errors.some((error) => error.includes('fabricated report count must remain proposal-only zero'))); });
test('fabricated mount count cannot return', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.mounts); row.proposal.reportCount = 140; rehash(row); }); assert.ok(errors.some((error) => error.includes('fabricated report count must remain proposal-only zero'))); });
test('0+ owners language is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.rearBrake); row.proposal.description += ' 0+ owners have reported this.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('owner social proof is forbidden'))); });
test('search-style citation is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.tcm); row.proposal.citations[0].url = 'https://example.com/search?q=Mazda2'; rehash(row); }); assert.ok(errors.some((error) => error.includes('not an exact approved primary source'))); });
test('commerce insertion is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.mounts); row.proposal.fixParts.push({ name: 'Mount', url: 'https://shop.example/mount' }); rehash(row); }); assert.ok(errors.some((error) => error.includes('commerce-free'))); });
test('identity hold cannot be released', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.tcm); row.identityReviewRequired = false; row.action = 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source'; }); assert.ok(errors.some((error) => error.includes('identity hold drifted'))); });
test('missing page is rejected', () => { const errors = errorsFor((value) => { value.rows.pop(); }); assert.ok(errors.some((error) => error.includes('coverage must be 5/5'))); });
test('later condenser bulletin cannot be expanded backward', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.condenser); row.proposal.description = row.proposal.description.replace('2016-2019 Mexico-spec', '2011-2019 U.S.'); rehash(row); }); assert.ok(errors.some((error) => error.includes('condenser later-generation boundary drifted'))); });
test('grille mesh remedy is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.condenser); row.proposal.solution += ' Install a mesh screen.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('condenser later-generation boundary drifted'))); });
test('brake lubricant safety removal is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.rearBrake); row.proposal.solution = row.proposal.solution.replace('keep all lubricant off friction surfaces', 'lubricate all brake surfaces'); rehash(row); }); assert.ok(errors.some((error) => error.includes('rear-brake evidence/safety boundary drifted'))); });
test('shock structural mechanism cannot be asserted', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.rearShock); row.proposal.solution += ' Weld reinforcement plates over the crack.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('rear-shock exact-mechanism boundary drifted'))); });
test('TCM update cannot be invented', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.tcm); row.proposal.solution += ' Perform a TCM reprogram.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('TCM/ATF boundary drifted'))); });
test('application gate cannot open', () => { const errors = errorsFor((value) => { value.applicationGate.status = 'approved'; }); assert.ok(errors.some((error) => error.includes('blocked proposal-only'))); });
test('PDF visual page drift is rejected', () => { const errors = errorsFor((value) => { value.pdfSources.rearShockNoise.visualPages.pop(); }); assert.ok(errors.some((error) => error.includes('rearShockNoise: PDF evidence metadata drifted'))); });
