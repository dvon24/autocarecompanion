import assert from 'node:assert/strict';
import test from 'node:test';
import {
  partFitsVehicle,
  partIsEligibleForVehicle,
  resolvePartNumber,
  formatYearRange,
  describeFitment,
  isNarrowerThanArticle,
  partCanBeShownForVehicle,
} from './known-issue-part-fitment';

test('an unscoped part stays unscoped — never a silent "fits"', () => {
  assert.equal(partFitsVehicle(undefined, { year: 2015 }), 'unscoped');
  assert.equal(partFitsVehicle({}, { year: 2015 }), 'unscoped');
});

test('public commerce hides scoped parts when a required vehicle dimension is unknown', () => {
  assert.equal(partCanBeShownForVehicle({ years: [2020], engines: ['2.0L'] }, { year: 2020 }), false);
  assert.equal(partCanBeShownForVehicle({ years: [2020], engines: ['2.0L'] }, { year: 2020, engine: '2.0L I4' }), true);
  assert.equal(partCanBeShownForVehicle(undefined, { year: 2020 }), true);
});

test('a declared year scope excludes vehicles outside it', () => {
  const fitment = { years: [2009, 2010, 2011, 2012, 2013] };
  assert.equal(partFitsVehicle(fitment, { year: 2011 }), 'fits');
  assert.equal(partFitsVehicle(fitment, { year: 2015 }), 'excluded');
});

test('an unknown vehicle year cannot be excluded', () => {
  assert.equal(partFitsVehicle({ years: [2009] }, { year: null }), 'unscoped');
});

test('right year but wrong engine is still the wrong part', () => {
  const fitment = { years: [2009, 2010], engines: ['3.6L V6'] };
  assert.equal(partFitsVehicle(fitment, { year: 2009, engine: '3.6L V6' }), 'fits');
  assert.equal(partFitsVehicle(fitment, { year: 2009, engine: '3.0L V6' }), 'excluded');
});

test('a matching year cannot prove fitment when a declared engine is unknown', () => {
  const fitment = { years: [2009], engines: ['3.6L V6'] };
  assert.equal(partFitsVehicle(fitment, { year: 2009, engine: null }), 'unscoped');
  assert.equal(partIsEligibleForVehicle(fitment, { year: 2009, engine: null }), false);
});

test('legacy unscoped parts remain eligible while scoped exclusions stay hidden', () => {
  assert.equal(partIsEligibleForVehicle(undefined, { year: 2015 }), true);
  assert.equal(partIsEligibleForVehicle({}, { year: 2015 }), true);
  assert.equal(partIsEligibleForVehicle({ years: [2014] }, { year: 2015 }), false);
  assert.equal(partIsEligibleForVehicle({ years: [2015] }, { year: 2015 }), true);
});

// The Genesis G90 case: 5.0 V8 pump listed on a page that never qualifies the
// engine, so half the readers get the wrong pump.
test('engine matching accepts a shorter declared value as a whole token run', () => {
  assert.equal(partFitsVehicle({ engines: ['5.0L'] }, { engine: '5.0L V8' }), 'fits');
  assert.equal(partFitsVehicle({ engines: ['3.3T'] }, { engine: '5.0L V8' }), 'excluded');
});

// Guards the substring bug called out in the trim filter: "SE" must not match
// "SEL", or a trim selection silently sells the wrong part.
test('trim matching does not let SE match SEL', () => {
  assert.equal(partFitsVehicle({ trims: ['SE'] }, { trim: 'SEL' }), 'excluded');
  assert.equal(partFitsVehicle({ trims: ['SE'] }, { trim: 'SE' }), 'fits');
  assert.equal(partFitsVehicle({ trims: ['Limited'] }, { trim: 'Limited Platinum' }), 'fits');
});

// The CR-V VTC actuator: one article spans two different actuators.
test('resolvePartNumber picks the variant that claims the vehicle', () => {
  const part = {
    oemPartNumber: '14310-RZA-003',
    variants: [
      { oemPartNumber: '14310-RZA-003', scope: '2007-2009', fitment: { years: [2007, 2008, 2009] } },
      { oemPartNumber: '14310-R40-A02', scope: '2010-2011', fitment: { years: [2010, 2011] } },
    ],
  };
  assert.deepEqual(resolvePartNumber(part, { year: 2010 }), {
    partNumber: '14310-R40-A02', scope: '2010-2011', matched: true,
  });
  assert.equal(resolvePartNumber(part, { year: 2008 }).partNumber, '14310-RZA-003');
});

test('resolvePartNumber refuses the base number when scoped variants exclude the vehicle', () => {
  const part = {
    oemPartNumber: '14310-RZA-003',
    variants: [{ oemPartNumber: '14310-R40-A02', scope: '2010-2011', fitment: { years: [2010, 2011] } }],
  };
  assert.deepEqual(resolvePartNumber(part, { year: 2005 }), {
    partNumber: null, scope: null, matched: false,
  });
});

test('resolvePartNumber keeps the legacy base fallback when variants are unscoped', () => {
  const part = {
    oemPartNumber: '14310-RZA-003',
    variants: [{ oemPartNumber: '14310-R40-A02', scope: 'confirm by VIN' }],
  };
  assert.deepEqual(resolvePartNumber(part, { year: 2005 }), {
    partNumber: '14310-RZA-003', scope: null, matched: false,
  });
});

test('unscoped parts resolve exactly as they do today', () => {
  assert.deepEqual(resolvePartNumber({ oemPartNumber: '68029736AA' }, { year: 2020 }), {
    partNumber: '68029736AA', scope: null, matched: false,
  });
});

test('formatYearRange collapses contiguous runs and keeps gaps', () => {
  assert.equal(formatYearRange([2009, 2010, 2011, 2012, 2013]), '2009-2013');
  assert.equal(formatYearRange([2009, 2010, 2015]), '2009-2010, 2015');
  assert.equal(formatYearRange([2011]), '2011');
  assert.equal(formatYearRange([]), '');
  assert.equal(formatYearRange([2013, 2009, 2011, 2010]), '2009-2011, 2013');
});

test('describeFitment renders a short label, empty when nothing is declared', () => {
  assert.equal(describeFitment({ years: [2009, 2010], engines: ['3.6L V6'] }), '2009-2010 · 3.6L V6');
  assert.equal(describeFitment(undefined), '');
  assert.equal(describeFitment({}), '');
});

test('isNarrowerThanArticle flags the case the reader needs to see', () => {
  const article = [2007, 2008, 2009, 2010, 2011];
  assert.equal(isNarrowerThanArticle({ years: [2009, 2010] }, article), true);
  assert.equal(isNarrowerThanArticle({ years: article }, article), false);
  assert.equal(isNarrowerThanArticle(undefined, article), false);
  assert.equal(isNarrowerThanArticle({ engines: ['3.6L V6'] }, article), true);
  assert.equal(isNarrowerThanArticle({ trims: ['Sport'] }, article), true);
});
