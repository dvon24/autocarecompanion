import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluateSearchExperiment,
  productMatchesExpectedComponent,
} from './evaluate-known-issue-part-search-experiment';

test('matches the prescribed component conservatively', () => {
  assert.equal(productMatchesExpectedComponent(
    'motor mounts',
    '1994-2001 Acura Integra Engine Mount',
    'https://www.partsgeek.com/abc-acura-integra-engine-mount.html',
  ), true);
  assert.equal(productMatchesExpectedComponent(
    'motor mounts',
    '1994-2001 Acura Integra Transmission Filter',
    'https://www.partsgeek.com/abc-acura-integra-transmission-filter.html',
  ), false);
  assert.equal(productMatchesExpectedComponent(
    'remanufactured rear axle',
    'Centric Rear Drive Axle Shaft Bearing',
    'https://www.ebay.com/itm/123456789012',
  ), false);
  assert.equal(productMatchesExpectedComponent(
    'dashboard assembly',
    '2004-08 Acura TL Dash Cover Cap Dashboard ABS',
    'https://www.ebay.com/itm/123456789012',
  ), false);
  assert.equal(productMatchesExpectedComponent(
    'timing belt kit',
    'Genuine Timing Belt Guide Plate',
    'https://www.ebay.com/itm/123456789012',
  ), false);
  assert.equal(productMatchesExpectedComponent(
    'SH-AWD electromagnetic actuators',
    'Acura Door Actuator Assembly',
    'https://www.ebay.com/itm/123456789012',
  ), false);
  assert.throws(
    () => productMatchesExpectedComponent('unknown parser phrase', 'Product', 'https://example.com/product/ABC123'),
    /No strict component profile/,
  );
  assert.equal(productMatchesExpectedComponent(
    'AC compressor clutch',
    '2002-2006 Acura RSX A/C Compressor',
    'https://example.com/product/ac-compressor-1234',
  ), false);
  assert.equal(productMatchesExpectedComponent(
    'remanufactured rear axle',
    '1996-1999 Acura SLX Axle Assembly - Front Left',
    'https://www.partsgeek.com/abc-acura-slx-front-axle.html',
  ), false);
});

test('compares both templates without promoting search results', () => {
  const evaluation = {
    make: 'Acura',
    snapshotHash: 'a'.repeat(64),
    productionApplied: false as const,
    experimentQueryCount: 2,
    experimentQueries: [
      { issueId: 'one', workItemId: 'work', expectedComponent: 'main relay', searchEligibility: 'eligible' as const, template: 'devon' as const, query: 'devon' },
      { issueId: 'one', workItemId: 'work', expectedComponent: 'main relay', searchEligibility: 'eligible' as const, template: 'precision' as const, query: 'precision' },
    ],
  };
  const raw = {
    schemaVersion: 1 as const,
    artifactKind: 'known-issue-part-search-codex-raw' as const,
    source: 'codex-built-in-web-search' as const,
    evaluationSha256: 'b'.repeat(64),
    queryCount: 2,
    results: [
      { queryIndex: 0, sources: [{ title: 'Main Relay RY-168', url: 'https://www.ebay.com/itm/123456789012' }] },
      { queryIndex: 1, sources: [{ title: 'Relay diagram', url: 'https://example.com/search?q=relay' }] },
    ],
  };
  const result = evaluateSearchExperiment(evaluation, raw);
  assert.equal(result.productionApplied, false);
  assert.equal(result.recommendedTemplate, 'devon');
  assert.equal(result.templateResults[0]?.strictComponentRecall, 1);
  assert.equal(result.templateResults[1]?.strictComponentRecall, 0);
  assert.equal(Object.hasOwn(result.queryResults[0] || {}, 'buyLinks'), false);
  assert.throws(
    () => evaluateSearchExperiment(evaluation, { ...raw, results: raw.results.slice(0, 1) }),
    /query-index set mismatch/,
  );
  assert.throws(
    () => evaluateSearchExperiment({
      ...evaluation,
      experimentQueries: [evaluation.experimentQueries[0]!, { ...evaluation.experimentQueries[0]!, template: 'devon' }],
    }, raw),
    /exactly one paired query per template/,
  );
});
