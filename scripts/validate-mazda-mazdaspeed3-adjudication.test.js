/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { clone } = require('./mazda-adjudication-utils');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-mazdaspeed3-adjudication');
const { validatePacket } = require('./validate-mazda-mazdaspeed3-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function errorsAfter(mutator) { const value = clone(packet); mutator(value); return validatePacket(value, snapshot); }

test('frozen Mazdaspeed3 packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('rejects an indexed title change', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.title = 'Changed'; }).join('\n'), /deterministic|immutable title/));
test('rejects a year change', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.years = [2007]; }).join('\n'), /deterministic|immutable years/));
test('rejects an archive', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.status = 'archived'; }).join('\n'), /deterministic|published status|immutable status/));
test('rejects fabricated owner social proof', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.description += ' 0+ owners have reported this.'; }).join('\n'), /owner social proof/));
test('rejects direct commerce', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.fixParts = [{ url: 'https://example.com/part' }]; }).join('\n'), /commerce-free/));
test('rejects a search-style citation', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.citations[0].url = 'https://example.com/search?q=mount'; }).join('\n'), /citation/));
test('rejects a hold converted to retain', () => assert.match(errorsAfter((value) => { value.rows[0].action = 'retain_indexed_identity_and_accuracy_cleanup'; }).join('\n'), /identity hold/));
test('rejects blocker removal', () => assert.match(errorsAfter((value) => { value.applicationGate.blockerRecordIds.pop(); }).join('\n'), /blocker IDs/));
test('rejects unsupported turbo owner count', () => assert.match(errorsAfter((value) => { value.rows.find((row) => row.id === IDS.turboBroad).proposal.reportCount = 200; }).join('\n'), /fabricated report count/));
test('rejects unsupported VVT owner count', () => assert.match(errorsAfter((value) => { value.rows.find((row) => row.id === IDS.vvt).proposal.reportCount = 320; }).join('\n'), /fabricated report count/));
test('rejects incomplete visual review', () => assert.match(errorsAfter((value) => { value.pdfSources.ssp87.visualPages.pop(); }).join('\n'), /PDF evidence|20 PDF pages/));
test('rejects human approval', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.humanApproved = true; }).join('\n'), /unapproved/));
test('rejects added related links', () => assert.match(errorsAfter((value) => { value.rows[0].proposal.relatedIssueIds.push('new-related'); }).join('\n'), /immutable relatedIssueIds/));
