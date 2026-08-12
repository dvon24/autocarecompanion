import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { resolveReviewedVehicleContext } from './reviewed-vehicle-context';
import { resolvePartForVehicle } from './known-issue-part-fitment';

test('preserves authoritative selected engine, drivetrain, and transmission', () => {
  assert.deepEqual(resolveReviewedVehicleContext({
    year: 2015,
    make: 'Dodge',
    model: 'Challenger',
    trim: 'R/T',
    engine: ' 5.7L V8 HEMI ',
    drivetrain: ' RWD ',
    transmission: ' 6-speed manual ',
  }), {
    year: 2015,
    make: 'Dodge',
    model: 'Challenger',
    trim: 'R/T',
    engine: '5.7L V8 HEMI',
    drivetrain: 'RWD',
    transmission: '6-speed manual',
    engineSource: 'selected',
  });
});

test('derives the 1990 Legend engine only from the pinned reviewed exact mapping', () => {
  const resolved = resolveReviewedVehicleContext({
    year: 1990,
    make: 'Acura',
    model: 'Legend',
    trim: 'LS',
  });

  assert.equal(resolved.engine, '2.7L V6 C27A');
  assert.equal(resolved.engineSource, 'reviewed-exact-ymmt');
  assert.match(resolved.engineProvenance?.artifact || '', /03-showmetheparts-evidence\.json$/);
  assert.equal(resolved.engineProvenance?.artifactSha256.length, 64);
  assert.equal(resolved.engineProvenance?.ymmtArtifact, 'public/data/ymmt.json');

  const provenance = resolved.engineProvenance!;
  for (const [artifact, expected] of [
    [provenance.artifact, provenance.artifactSha256],
    [provenance.ymmtArtifact, provenance.ymmtArtifactSha256],
  ] as const) {
    const actual = createHash('sha256').update(readFileSync(artifact)).digest('hex');
    assert.equal(actual, expected, artifact);
  }
});

test('does not infer an Integra engine from issue scope, year, or trim name', () => {
  for (const trim of ['RS', 'LS', 'GS', 'GS-R']) {
    const resolved = resolveReviewedVehicleContext({
      year: 1992,
      make: 'Acura',
      model: 'Integra',
      trim,
    });
    assert.equal(resolved.engine, null, trim);
    assert.equal(resolved.engineSource, null, trim);
  }
});

test('does not use a near match or incomplete YMMT tuple', () => {
  assert.equal(resolveReviewedVehicleContext({
    year: 1990, make: 'Acura', model: 'Legend', trim: 'Coupe LS',
  }).engine, null);
  assert.equal(resolveReviewedVehicleContext({
    year: 1990, make: 'Acura', model: 'Legend', trim: null,
  }).engine, null);
  assert.equal(resolveReviewedVehicleContext({
    year: 1991, make: 'Acura', model: 'Legend', trim: 'LS',
  }).engine, null);
});

test('approved Acura links resolve only where the committed evidence proves context', () => {
  const buyLink = {
    vendor: 'eBay',
    url: 'https://www.ebay.com/itm/401988622225',
    linkType: 'product',
    verified: true,
  };
  const distributor = {
    component: 'Distributor',
    fitment: { years: [1992, 1993], engines: ['1.7L B17A1'] },
    buyLinks: [buyLink],
  };
  const integra = resolveReviewedVehicleContext({
    year: 1992, make: 'Acura', model: 'Integra', trim: 'GS-R',
  });
  assert.equal(resolvePartForVehicle(distributor, integra, {
    make: 'Acura', model: 'Integra',
  }), null);

  const timingKit = {
    component: 'Engine Timing Belt Kit',
    fitment: { years: [1990], engines: ['2.7L V6 C27A'] },
    buyLinks: [{ ...buyLink, url: 'https://www.ebay.com/itm/257484035894' }],
  };
  const legend = resolveReviewedVehicleContext({
    year: 1990, make: 'Acura', model: 'Legend', trim: 'L',
  });
  assert.equal(resolvePartForVehicle(timingKit, legend, {
    make: 'Acura', model: 'Legend',
  })?.component, 'Engine Timing Belt Kit');
});
