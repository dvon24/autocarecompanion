/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { clone } = require('./mazda-adjudication-utils');
const { OUTPUT, SNAPSHOT } = require('./build-mazda-mazda6-adjudication');
const { validatePacket } = require('./validate-mazda-mazda6-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function errorsAfter(mutator) { const value = clone(packet); mutator(value); return validatePacket(value, snapshot); }

test('frozen Mazda6 packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('rejects an indexed title change', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.title = 'Changed'; }).join('\n'), /packet does not exactly|immutable title/));
test('rejects a year change', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.years = [2003]; }).join('\n'), /packet does not exactly|immutable years/));
test('rejects an archive', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.status = 'archived'; }).join('\n'), /packet does not exactly|published status|immutable status/));
test('rejects fabricated owner social proof', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.description += ' 0+ owners have reported this.'; }).join('\n'), /owner social proof/));
test('rejects direct commerce', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.fixParts = [{ url: 'https://example.com/part' }]; }).join('\n'), /commerce-free/));
test('rejects a search-style citation', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.citations[0].url = 'https://example.com/search?q=alternator'; }).join('\n'), /citation/));
test('rejects a hold converted to retain', () => assert.match(errorsAfter((value) => { value.rows[0].action = 'retain_indexed_identity_and_accuracy_cleanup'; }).join('\n'), /hold action/));
test('rejects blocker removal', () => assert.match(errorsAfter((value) => { value.applicationGate.blockerRecordIds.pop(); }).join('\n'), /blocker IDs/));
test('rejects unsupported report count', () => assert.match(errorsAfter((value) => { const row = value.rows.find((item) => item.id.includes('clutch-judder')); row.proposal.reportCount = 950; }).join('\n'), /fabricated count/));
test('rejects incomplete visual review', () => assert.match(errorsAfter((value) => { value.pdfSources.manualShift.visualPages.pop(); }).join('\n'), /PDF evidence|59 PDF pages/));
test('rejects human approval', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.humanApproved = true; }).join('\n'), /unapproved/));
