/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-mazda5-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-mazda5-adjudication');
const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(value, id) { return value.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function errorsFor(mutator) { const value = copy(packet); mutator(value); return validatePacket(value, snapshot); }

test('baseline Mazda5 proposal packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('indexed title mutation is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.latch); row.proposal.title = 'Sliding Door Latch Recall'; rehash(row); }); assert.ok(errors.some((error) => error.includes('immutable title changed'))); });
test('indexed year mutation is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.latch); row.proposal.years = [2006]; rehash(row); }); assert.ok(errors.some((error) => error.includes('immutable years changed'))); });
test('0+ owners language is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.cable); row.proposal.description += ' 0+ owners have reported this.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('owner social proof is forbidden'))); });
test('search-style citation is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.egr); row.proposal.citations[0].url = 'https://example.com/search?q=egr'; rehash(row); }); assert.ok(errors.some((error) => error.includes('not an exact approved primary source'))); });
test('commerce insertion is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.mount); row.proposal.fixParts.push({ name: 'Mount', url: 'https://shop.example/mount' }); rehash(row); }); assert.ok(errors.some((error) => error.includes('commerce-free'))); });
test('identity hold cannot be released', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.evaporator); row.identityReviewRequired = false; row.action = 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source'; }); assert.ok(errors.some((error) => error.includes('identity hold drifted'))); });
test('missing page is rejected', () => { const errors = errorsFor((value) => { value.rows.pop(); }); assert.ok(errors.some((error) => error.includes('coverage must be 5/5'))); });
test('fabricated report count cannot survive', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.cable); row.proposal.reportCount = row.before.reportCount; rehash(row); }); assert.ok(errors.some((error) => error.includes('fabricated report count'))); });
test('evaporator odor cannot be rewritten as proof of a leak', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.evaporator); row.proposal.solution += ' Replace the evaporator.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('evaporator odor/leak boundary drifted'))); });
test('generic EGR cleaning prescription is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.egr); row.proposal.solution += ' Use carb cleaner ($0 DIY) and a wire brush.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('EGR source/diagnosis boundary drifted'))); });
test('unverified cable replacement is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.cable); row.proposal.solution = 'Replace sliding door cable assembly. ' + row.proposal.solution; rehash(row); }); assert.ok(errors.some((error) => error.includes('sliding-door cable evidence boundary drifted'))); });
test('latch recall cannot lose do-not-drive warning', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.latch); row.proposal.solution = row.proposal.solution.replace('do not drive the vehicle', 'continue driving carefully'); rehash(row); }); assert.ok(errors.some((error) => error.includes('sliding-door latch recall boundary drifted'))); });
test('latch recall cannot lose free remedy boundary', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.latch); row.proposal.solution = row.proposal.solution.replace('free recall remedy', 'paid repair'); rehash(row); }); assert.ok(errors.some((error) => error.includes('sliding-door latch recall boundary drifted'))); });
test('all-mount-set prescription is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.mount); row.proposal.solution += ' Replace all mounts as a set.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('mount identity/diagnosis boundary drifted'))); });
test('application gate cannot open', () => { const errors = errorsFor((value) => { value.applicationGate.status = 'approved'; }); assert.ok(errors.some((error) => error.includes('blocked proposal-only'))); });
test('PDF visual page drift is rejected', () => { const errors = errorsFor((value) => { value.pdfSources.odor.visualPages.pop(); }); assert.ok(errors.some((error) => error.includes('odor: PDF evidence metadata drifted'))); });
test('community recommendation cannot survive', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.evaporator); row.proposal.communityRecommendations.push({ type: 'part', content: 'Evaporator' }); rehash(row); }); assert.ok(errors.some((error) => error.includes('commerce-free'))); });
