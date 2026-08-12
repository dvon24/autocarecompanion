/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  candidateFromPart,
  exactNamed,
  filterPartCandidates,
  findCandidates,
  matchesAllTokens,
  parseItems,
} = require('./showmetheparts-known-issue-candidates');

test('catalog projection preserves every restriction channel', () => {
  const candidate = candidateFromPart({
    supplier: 'Example', part_no: 'ABC123', part_type: 'Disc Brake Caliper',
    application: 'Hybrid SE/SEL', comment: 'Without sport package', location: 'FRONT LEFT',
  }, { year: 2024 });
  assert.equal(candidate.application, 'Hybrid SE/SEL');
  assert.equal(candidate.comment, 'Without sport package');
  assert.equal(candidate.location, 'FRONT LEFT');
});

test('XML parsing preserves catalog IDs and decodes values', () => {
  const xml = '<root><model><id>0042</id><data>A6 &amp; Avant</data></model><model><id>0043</id><data>A6 QUATTRO</data></model></root>';
  assert.deepEqual(parseItems(xml, 'model'), [
    { id: '0042', data: 'A6 & Avant' },
    { id: '0043', data: 'A6 QUATTRO' },
  ]);
  assert.equal(exactNamed(parseItems(xml, 'model'), 'a6 quattro', 'Model').id, '0043');
});

test('token matching is order-insensitive but rejects partial repair-role matches', () => {
  assert.equal(matchesAllTokens('Belts, Hoses, Tensioners', 'tensioners belts'), true);
  assert.equal(matchesAllTokens('Accessory Drive Belt Tensioner', 'timing chain'), false);
  assert.equal(filterPartCandidates([
    { part_type: 'Accessory Drive Belt Tensioner Assembly' },
    { part_type: 'Engine Timing Chain Tensioner' },
  ], 'timing chain').length, 1);
});

test('a mocked lookup returns sanitized candidate-only fitment without the account ID', async () => {
  const responses = [
    '<root err_num="0"><make><id>0004</id><data>AUDI</data></make></root>',
    '<root err_num="0"><model><id>0042</id><data>A6</data></model></root>',
    '<root err_num="0"><product><id>0008</id><data>BELTS, HOSES, TENSIONERS</data></product></root>',
    '<root err_num="0"><engine><id>V6~3.2L~~3123</id><data>V6 3.2L 3123cc</data></engine></root>',
    '<root err_num="0"><partsdata><supplier>Example</supplier><part_no>T123</part_no><part_key>0001</part_key><part_type>Engine Timing Chain Tensioner</part_type><qty>1</qty></partsdata><partsdata><supplier>Wrong</supplier><part_no>A1</part_no><part_key>0002</part_key><part_type>Accessory Drive Belt Tensioner</part_type></partsdata></root>',
  ];
  const seen = [];
  const fetchImpl = async (url) => {
    seen.push(url);
    return { ok: true, status: 200, text: async () => responses.shift() };
  };
  const result = await findCandidates({
    year: 2008,
    make: 'Audi',
    models: ['A6'],
    productMatch: 'belts tensioners',
    engineMatch: '3.2L',
    partTypeMatch: 'timing chain',
  }, { accountId: 'SECRET-ID', fetchImpl, signal: {} });
  assert.equal(result.candidateOnly, true);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].partNumber, 'T123');
  assert.equal(JSON.stringify(result).includes('SECRET-ID'), false);
  assert.equal(seen.every((url) => url.searchParams.get('id') === 'SECRET-ID'), true);
});

test('list-products resolves exact category names without requesting engines or parts', async () => {
  const responses = [
    '<root err_num="0"><make><id>0004</id><data>BMW</data></make></root>',
    '<root err_num="0"><model><id>0042</id><data>335I</data></model></root>',
    '<root err_num="0"><product><id>0058</id><data>DRIVE SHAFT</data></product><product><id>0020</id><data>ENGINE COMPONENTS</data></product></root>',
  ];
  const seen = [];
  const fetchImpl = async (url) => {
    seen.push(url);
    return { ok: true, status: 200, text: async () => responses.shift() };
  };
  const result = await findCandidates({
    year: 2011,
    make: 'BMW',
    models: ['335i'],
    listProducts: true,
  }, { accountId: 'SECRET-ID', fetchImpl, signal: {} });
  assert.deepEqual(result.resolved.products.map((product) => product.name), [
    'DRIVE SHAFT',
    'ENGINE COMPONENTS',
  ]);
  assert.deepEqual(result.resolved.engines, []);
  assert.deepEqual(result.candidates, []);
  assert.equal(seen.length, 3);
  assert.equal(seen.some((url) => url.searchParams.get('lookup') === 'engine'), false);
  assert.equal(seen.some((url) => url.searchParams.get('lookup') === 'parts'), false);
});
