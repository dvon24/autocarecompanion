/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-eqs-adjudication');
const { hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-eqs-adjudication');

const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function row(packet, id) { return packet.rows.find((item) => item.id === id); }
function rehash(item) {
  item.proposalSha256 = hashValue(item.proposal);
  item.changedFields = Object.keys(item.proposal).filter((key) => hashValue(item.before[key]) !== hashValue(item.proposal[key]));
}
function rejects(name, mutate, pattern) {
  test(name, () => {
    const packet = clone(frozen);
    mutate(packet);
    assert.match(validatePacket(packet, snapshot).join('\n'), pattern);
  });
}

test('frozen EQS packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { const item = row(packet, IDS.airmatic); item.proposal.title += ' revised'; rehash(item); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { const item = row(packet, IDS.bms); item.proposal.years = [2024]; rehash(item); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { const item = row(packet, IDS.drivetrain); item.proposal.trims = []; rehash(item); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { const item = row(packet, IDS.mbux); item.proposal.engines = ['electric']; rehash(item); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { const item = row(packet, IDS.coldRange); item.proposal.category = 'engine'; rehash(item); }, /deterministic|immutable category/);
rejects('rejects archive', (packet) => { const item = row(packet, IDS.rearSteering); item.proposal.status = 'archived'; rehash(item); }, /deterministic|immutable status/);
rejects('rejects related-link mutation', (packet) => { const item = row(packet, IDS.doorHandles); item.proposal.relatedIssueIds = ['unauthorized']; rehash(item); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects social proof', (packet) => { const item = row(packet, IDS.battery12v); item.proposal.description += ' 750+ owners have reported it.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects social proof with zero', (packet) => { const item = row(packet, IDS.mbux); item.proposal.description += ' 0+ owners have reported it.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects restored 12V count', (packet) => { const item = row(packet, IDS.battery12v); item.proposal.reportCount = 750; rehash(item); }, /deterministic|zero-count/);
rejects('rejects restored cold-range count', (packet) => { const item = row(packet, IDS.coldRange); item.proposal.reportCount = 1200; rehash(item); }, /deterministic|zero-count/);
rejects('rejects invented count on zero-count row', (packet) => { const item = row(packet, IDS.bms); item.proposal.reportCount = 1; rehash(item); }, /deterministic|zero-count/);
rejects('rejects commerce', (packet) => { const item = row(packet, IDS.drivetrain); item.proposal.fixParts.push({ partNumber: 'control-unit' }); rehash(item); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { const item = row(packet, IDS.bms); item.proposal.humanApproved = true; rehash(item); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { const item = row(packet, IDS.doorHandles); item.proposal.citations[0].url = 'https://example.com/search?q=handle'; rehash(item); }, /deterministic|citation/);
rejects('rejects retained recall converted to hold', (packet) => { const item = row(packet, IDS.drivetrain); item.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; item.identityReviewRequired = true; item.identityConflict = 'added'; }, /deterministic|retain verdict/);
rejects('rejects BMS hold converted to retain', (packet) => { const item = row(packet, IDS.bms); item.action = 'retain_indexed_identity_and_accuracy_cleanup'; item.identityReviewRequired = false; item.identityConflict = null; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds.pop(); }, /deterministic|blocker/);
rejects('rejects BMS year overreach', (packet) => { const item = row(packet, IDS.bms); item.proposal.description = 'Recall 24V372 covers all 2022-2025 EQS vehicles.'; rehash(item); }, /deterministic|BMS recall scope/);
rejects('rejects drivetrain mechanism drift', (packet) => { const item = row(packet, IDS.drivetrain); item.proposal.description = 'A battery defect causes every EQS to stall.'; rehash(item); }, /deterministic|drivetrain recall/);
rejects('rejects AIRMATIC transfer', (packet) => { const item = row(packet, IDS.airmatic); item.proposal.description = 'The EQS SUV bulletin proves premature EQS sedan rear shocks.'; rehash(item); }, /deterministic|AIRMATIC transfer/);
rejects('rejects door-handle lockout transfer', (packet) => { const item = row(packet, IDS.doorHandles); item.proposal.description = 'All handles freeze and lock out owners.'; rehash(item); }, /deterministic|door-handle scope/);
rejects('rejects MBUX blackout transfer', (packet) => { const item = row(packet, IDS.mbux); item.proposal.description = 'The bulletin proves the Hyperscreen always goes black.'; rehash(item); }, /deterministic|MBUX evidence/);
rejects('rejects battery-warning path merge', (packet) => { const item = row(packet, IDS.batteryWarning); item.proposal.description = 'The PTC heater always causes the towing warning.'; rehash(item); }, /deterministic|battery-warning evidence/);
rejects('rejects 12V timing claim', (packet) => { const item = row(packet, IDS.battery12v); item.proposal.description = 'The car always drains in 7-10 days.'; rehash(item); }, /deterministic|12V evidence/);
rejects('rejects cold-range percentage claim', (packet) => { const item = row(packet, IDS.coldRange); item.proposal.description = 'The heat pump defect causes 40% loss.'; rehash(item); }, /deterministic|cold-range evidence/);
rejects('rejects rear-steering actuator transfer', (packet) => { const item = row(packet, IDS.rearSteering); item.proposal.description = 'Calibration drift proves actuator failure.'; rehash(item); }, /deterministic|rear-steering evidence/);
rejects('rejects drivetrain PDF page omission', (packet) => { packet.pdfSources.drivetrainRecall.visualPages = [1, 2, 3]; }, /deterministic|PDF evidence/);
rejects('rejects BMS PDF page omission', (packet) => { packet.pdfSources.bmsRecall.visualPages = [1, 3, 4, 5]; }, /deterministic|PDF evidence/);
rejects('rejects local PDF path disclosure', (packet) => { packet.pdfSources.bmsRecall.localPath = 'C:/tmp/source.pdf'; }, /deterministic|PDF evidence/);
