/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict'); const fs = require('node:fs'); const test = require('node:test');
const { clone } = require('./mazda-adjudication-utils'); const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-mazdaspeed6-adjudication'); const { validatePacket } = require('./validate-mazda-mazdaspeed6-adjudication');
const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function errorsAfter(mutator) { const value = clone(packet); mutator(value); return validatePacket(value, snapshot); }
test('frozen Mazdaspeed6 packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('rejects indexed title change', () => assert.match(errorsAfter((v) => { v.rows[0].proposal.title = 'Changed'; }).join('\n'), /deterministic|immutable title/));
test('rejects indexed year change', () => assert.match(errorsAfter((v) => { v.rows[0].proposal.years = [2006]; }).join('\n'), /deterministic|immutable years/));
test('rejects archive', () => assert.match(errorsAfter((v) => { v.rows[0].proposal.status = 'archived'; }).join('\n'), /published status|immutable status/));
test('rejects owner social proof', () => assert.match(errorsAfter((v) => { v.rows[0].proposal.description += ' 0+ owners have reported this.'; }).join('\n'), /owner social proof/));
test('rejects commerce', () => assert.match(errorsAfter((v) => { v.rows[0].proposal.fixParts = [{ url: 'https://example.com' }]; }).join('\n'), /commerce-free/));
test('rejects search citation', () => assert.match(errorsAfter((v) => { v.rows[0].proposal.citations[0].url = 'https://example.com/search?q=part'; }).join('\n'), /citation/));
test('rejects retained identity converted to hold', () => assert.match(errorsAfter((v) => { v.rows.find((r) => r.id === IDS.fuelRing).action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; }).join('\n'), /retained action/));
test('rejects hold converted to retain', () => assert.match(errorsAfter((v) => { v.rows.find((r) => r.id === IDS.hpfp).action = 'retain_indexed_identity_and_accuracy_cleanup'; }).join('\n'), /hold action/));
test('rejects blocker removal', () => assert.match(errorsAfter((v) => { v.applicationGate.blockerRecordIds.pop(); }).join('\n'), /blocker IDs/));
test('rejects fabricated rod count', () => assert.match(errorsAfter((v) => { v.rows.find((r) => r.id === IDS.rod).proposal.reportCount = 120; }).join('\n'), /fabricated report count/));
test('rejects fabricated transfer count', () => assert.match(errorsAfter((v) => { v.rows.find((r) => r.id === IDS.transfer).proposal.reportCount = 150; }).join('\n'), /fabricated report count/));
test('rejects fabricated turbo count', () => assert.match(errorsAfter((v) => { v.rows.find((r) => r.id === IDS.turboOil).proposal.reportCount = 100; }).join('\n'), /fabricated report count/));
test('rejects incomplete visual review', () => assert.match(errorsAfter((v) => { v.pdfSources.driverTakata.visualPages.pop(); }).join('\n'), /PDF evidence|30 PDF pages/));
test('rejects human approval', () => assert.match(errorsAfter((v) => { v.rows[0].proposal.humanApproved = true; }).join('\n'), /unapproved/));
test('rejects related-link mutation', () => assert.match(errorsAfter((v) => { v.rows[0].proposal.relatedIssueIds.push('new'); }).join('\n'), /immutable relatedIssueIds/));
