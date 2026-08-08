/* eslint-disable @typescript-eslint/no-require-imports */

const test = require('node:test');
const assert = require('node:assert/strict');
const { YEARS, complaintUrl, inspect } = require('./inspect-lexus-ls400-complaints');

function complaint(odiNumber, components, summary) { return { odiNumber, components, summary }; }
function mockFetch(url) {
  const year = Number(new URL(url).searchParams.get('modelYear'));
  const results = year === 1990 ? [
    complaint(1, 'STEERING,ELECTRICAL SYSTEM', 'The power steering pump developed a leak and the fluid damaged the alternator.'),
    complaint(2, 'ENGINE', 'The engine stalled and the driver lost power steering.'),
    complaint(3, 'ELECTRICAL SYSTEM', 'The ECM programming was updated without any capacitor diagnosis.'),
    complaint(4, 'ELECTRICAL SYSTEM', 'A leaking capacitor damaged the ECU board.'),
    complaint(5, 'ENGINE', 'An engine oil leak was traced to the valve cover.'),
    complaint(6, 'SUSPENSION', 'The lower ball joint separated.'),
    complaint(7, 'ELECTRICAL SYSTEM', 'The starter failed.'),
    complaint(8, 'ENGINE', 'The timing belt broke after a water pump complaint.'),
  ] : [];
  return Promise.resolve({ ok: true, json: async () => ({ count: results.length, results }) });
}

test('LS400 complaint URLs bind the exact make, model and year', () => {
  const url = new URL(complaintUrl(1997));
  assert.equal(url.searchParams.get('make'), 'LEXUS');
  assert.equal(url.searchParams.get('model'), 'LS400');
  assert.equal(url.searchParams.get('modelYear'), '1997');
});

test('complaint inventory keeps owner reports bounded to exact phrases', async () => {
  const result = await inspect({ fetchImpl: mockFetch, includeSummaries: true });
  assert.deepEqual(result.years, YEARS);
  assert.equal(result.total, 8);
  assert.deepEqual(result.matches.powerSteering.map((row) => row.odiNumber), [1]);
  assert.deepEqual(result.matches.ecuCapacitor.map((row) => row.odiNumber), [4]);
  assert.deepEqual(result.matches.oilLeak.map((row) => row.odiNumber), [5]);
  assert.deepEqual(result.matches.ballJoint.map((row) => row.odiNumber), [6]);
  assert.deepEqual(result.matches.starter.map((row) => row.odiNumber), [7]);
  assert.deepEqual(result.matches.timingService.map((row) => row.odiNumber), [8]);
  assert.match(result.caveat, /do not prove a defect/i);
});

test('complaint inventory rejects malformed API responses', async () => {
  const malformed = async () => ({ ok: true, json: async () => ({ count: 2, results: [] }) });
  await assert.rejects(() => inspect({ fetchImpl: malformed }), /malformed NHTSA complaints response/);
});
