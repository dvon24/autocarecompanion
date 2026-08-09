/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-mazda3-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-mazda3-adjudication');
const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(value, id) { return value.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function errorsFor(mutator) { const value = copy(packet); mutator(value); return validatePacket(value, snapshot); }

test('baseline Mazda3 proposal packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('indexed title mutation is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.torsionBeam); row.proposal.title = 'Rear Suspension Bushing'; rehash(row); }); assert.ok(errors.some((error) => error.includes('immutable title changed'))); });
test('0+ owners language is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.windshield); row.proposal.description += ' 0+ owners have reported this.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('owner social proof is forbidden'))); });
test('search-style citation is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.purge); row.proposal.citations[0].url = 'https://example.com/search?q=purge'; rehash(row); }); assert.ok(errors.some((error) => error.includes('not an exact approved primary source'))); });
test('commerce insertion is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.dashboard); row.proposal.fixParts.push({ name: 'Dashboard', url: 'https://shop.example/dashboard' }); rehash(row); }); assert.ok(errors.some((error) => error.includes('commerce-free'))); });
test('identity hold cannot be released', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.rearShock); row.identityReviewRequired = false; row.action = 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source'; }); assert.ok(errors.some((error) => error.includes('action/identity hold drifted'))); });
test('missing page is rejected', () => { const errors = errorsFor((value) => { value.rows.pop(); }); assert.ok(errors.some((error) => error.includes('coverage must be 9/9'))); });
test('carbon oil and filter step cannot disappear', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.carbon); row.proposal.solution = row.proposal.solution.replace('then replace the engine oil and filter', 'then return the vehicle'); rehash(row); }); assert.ok(errors.some((error) => error.includes('carbon procedure/oil boundary drifted'))); });
test('friction clutch cannot replace internal transaxle diagnosis', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.manualShift); row.proposal.solution += ' Replace the clutch disc, pressure plate and flywheel.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('manual-transaxle identity boundary drifted'))); });
test('dashboard cannot promise a free repair', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.dashboard); row.proposal.solution = row.proposal.solution.replace('do not promise a free repair', 'the repair remains free'); rehash(row); }); assert.ok(errors.some((error) => error.includes('dashboard scope/coverage boundary drifted'))); });
test('incorrect infotainment bulletin number is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.infotainment); row.proposal.description = row.proposal.description.replace('16-008/23', '16-001/23'); rehash(row); }); assert.ok(errors.some((error) => error.includes('infotainment bulletin/hardware boundary drifted'))); });
test('code-only purge replacement is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.purge); row.proposal.solution += ' Replace the purge valve from the code.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('EVAP test-first boundary drifted'))); });
test('parking recall scope cannot lose free remedy', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.parkingBrake); row.proposal.solution = row.proposal.solution.replace('free remedy', 'paid repair'); rehash(row); }); assert.ok(errors.some((error) => error.includes('parking-brake recall boundary drifted'))); });
test('rear shocks cannot be prescribed as a set', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.rearShock); row.proposal.solution += ' Replace both rear shocks as a set.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('rear-shock identity hold drifted'))); });
test('torsion-beam bushing press remedy is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.torsionBeam); row.proposal.solution += ' Press out the torsion beam bushing.'; rehash(row); }); assert.ok(errors.some((error) => error.includes('torsion-beam architecture hold drifted'))); });
test('windshield insurance promise is rejected', () => { const errors = errorsFor((value) => { const row = rowFor(value, IDS.windshield); row.proposal.solution = row.proposal.solution.replace('do not assume insurance or goodwill coverage', 'insurance will cover the replacement'); rehash(row); }); assert.ok(errors.some((error) => error.includes('windshield evidence/coverage hold drifted'))); });
test('application gate cannot open', () => { const errors = errorsFor((value) => { value.applicationGate.status = 'approved'; }); assert.ok(errors.some((error) => error.includes('blocked proposal-only'))); });
test('PDF visual page drift is rejected', () => { const errors = errorsFor((value) => { value.pdfSources.spec2014.visualPages.pop(); }); assert.ok(errors.some((error) => error.includes('spec2014: PDF evidence metadata drifted'))); });
