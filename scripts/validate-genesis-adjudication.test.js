/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { safeTrims } = require('./build-genesis-adjudication');
const { expectedAction } = require('./validate-genesis-adjudication');

test('safeTrims keeps trim names and removes applicability prose', () => {
  assert.deepEqual(
    safeTrims(['Sport Prestige', 'Vehicles covered by campaign T27G', '3.3T Sport']),
    ['Sport Prestige', '3.3T Sport'],
  );
});

test('the action map distinguishes rewrite, duplicate, and unsupported rows', () => {
  assert.equal(expectedAction('genesis-g70-turbo-oil-line-leak'), 'rewrite_then_publish');
  assert.equal(expectedAction('genesis-g80-electrified-software'), 'archive_as_duplicate');
  assert.equal(expectedAction('genesis-gv60-range-inconsistency'), 'archive_unsupported');
  assert.equal(expectedAction('not-in-scope'), null);
});

test('high-risk Genesis source corrections stay narrowed to the primary documents', () => {
  const packet = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '..', 'data', 'known-issue-genesis-adjudication-2026-08-05.json'),
    'utf8',
  ));
  const byId = new Map(packet.rows.map((row) => [row.id, row]));

  assert.equal(byId.get('genesis-g90-panoramic-sunroof-creaking-rattling-wind-noise').action, 'archive_unsupported');
  assert.equal(byId.get('genesis-gv70-brake-noise').action, 'archive_unsupported');

  const g70Sunroof = byId.get('genesis-g70-sunroof-headliner-rattle-creaking-noise').proposal;
  assert.deepEqual(g70Sunroof.years, [2019, 2020, 2021]);
  assert.equal(g70Sunroof.citations[0].url, 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10217309-0001.pdf');

  const g70TorqueConverter = byId.get('genesis-g70-torque-converter-internal-rivet-damage-scratching-noise-low').proposal;
  assert.deepEqual(g70TorqueConverter.engines, ['2.0L turbocharged gasoline engine']);

  const gv70Drain = byId.get('genesis-gv70-sunroof-drain-clog-causing-water-leak-into-cabin').proposal;
  assert.deepEqual(gv70Drain.years, [2022, 2023]);
  assert.equal(gv70Drain.citations[0].url, 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011760-0001.pdf');
});
