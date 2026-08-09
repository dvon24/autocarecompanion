/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { ALL_IDS, BLOCKER_IDS, IDS, OUTPUT, RETAIN_IDS, SNAPSHOT, buildPacket } = require('./build-mercedes-s-class-adjudication');
const { validatePacket } = require('./validate-mercedes-s-class-adjudication');
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function packet() { return buildPacket(snapshot); }
test('packet validates deterministically', () => assert.deepEqual(validatePacket(packet(), snapshot), []));
test('all seven frozen identities are covered once', () => assert.deepEqual(packet().rows.map((row) => row.id).sort(), ALL_IDS));
test('two identities retain and five remain held', () => { const p = packet(); assert.equal(p.rows.filter((row) => RETAIN_IDS.includes(row.id)).length, 2); assert.deepEqual(p.applicationGate.blockerRecordIds, BLOCKER_IDS); });
test('vehicle metadata and indexed identity are immutable', () => { for (const row of packet().rows) for (const field of ['make','model','years','trims','engines','category','title','severity','status','lastReportedByOwners','relatedIssueIds']) assert.deepEqual(row.proposal[field], row.before[field], `${row.id}:${field}`); });
test('all unsupported owner totals are proposal-only zero', () => { for (const row of packet().rows) { assert.ok(row.before.reportCount > 0); assert.equal(row.proposal.reportCount, 0); assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /0\+ owners|owners have reported/i); } });
test('packet introduces no commerce or community recommendation', () => { for (const row of packet().rows) { assert.deepEqual(row.proposal.fixParts, []); assert.deepEqual(row.proposal.communityRecommendations, []); assert.match(row.proposal.solution, /do not buy/i); assert.match(row.commerceDecision, /no universal retail part/i); } });
test('48V evidence prevents premature battery replacement', () => { const row = packet().rows.find((value) => value.id === IDS.battery48v); assert.match(row.proposal.description, /11012782/); assert.match(row.proposal.description, /not to replace parts/i); });
test('ABC evidence remains component-specific', () => { const row = packet().rows.find((value) => value.id === IDS.abc); assert.match(row.proposal.description, /10009985/); assert.match(row.proposal.description, /twelve-cylinder/i); });
test('AIRMATIC evidence separates wiring and leakage', () => assert.match(packet().rows.find((row) => row.id === IDS.airmatic).proposal.description, /drain-valve wiring/i));
test('COMAND evidence rejects unsupported degradation mechanism', () => assert.match(packet().rows.find((row) => row.id === IDS.comand).proposal.description, /hard-drive and capacitor/i));
test('Magic Body Control evidence separates normal pump noise', () => assert.match(packet().rows.find((row) => row.id === IDS.magicBody).proposal.description, /normal road-surface-scan hydraulic-pump noise/i));
test('steering evidence separates line and pump paths', () => assert.match(packet().rows.find((row) => row.id === IDS.steering).proposal.description, /hydraulic-line-fitting leakage/i));
test('seat evidence separates software and pneumatic paths', () => assert.match(packet().rows.find((row) => row.id === IDS.seat).proposal.description, /software installation or coding/i));
test('committed packet matches deterministic build', () => { if (!fs.existsSync(OUTPUT)) return; assert.deepEqual(JSON.parse(fs.readFileSync(OUTPUT, 'utf8')), packet()); });
test('no PDF is selected and the dataset citation is direct', () => { const p = packet(); assert.deepEqual(p.pdfSources, {}); for (const row of p.rows) { assert.equal(row.proposal.citations.length, 1); assert.equal(row.proposal.citations[0].url, 'https://www.nhtsa.gov/nhtsa-datasets-and-apis'); } });
