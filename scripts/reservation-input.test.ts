import assert from 'node:assert/strict';
import test from 'node:test';
import { parseReservationInput } from '../src/lib/reservation';

const valid = {
  email: ' Driver@Example.com ',
  vehicle: ' 2015 Dodge Challenger SRT 392 ',
  country: 'United States',
  source: 'hero',
  path: '/?campaign=twin',
};

test('normalizes a valid reservation', () => {
  assert.deepEqual(parseReservationInput(valid), {
    email: 'driver@example.com',
    vehicle: '2015 Dodge Challenger SRT 392',
    country: 'United States',
    source: 'hero',
    path: '/?campaign=twin',
    note: null,
    transmission: null,
    claimed: {
      year: null,
      make: null,
      model: null,
      trim: null,
    },
  });
});

test('accepts only the two supported transmission choices', () => {
  assert.equal(parseReservationInput({ ...valid, transmission: 'automatic' })?.transmission, 'automatic');
  assert.equal(parseReservationInput({ ...valid, transmission: 'manual' })?.transmission, 'manual');
  assert.equal(parseReservationInput({ ...valid, transmission: 'cvt' })?.transmission, null);
});

test('keeps structured vehicle fields as untrusted claims for server verification', () => {
  assert.deepEqual(parseReservationInput({
    ...valid,
    year: '2019',
    make: ' chevrolet ',
    model: ' camaro ',
    trim: ' ZL1 ',
  })?.claimed, {
    year: 2019,
    make: 'chevrolet',
    model: 'camaro',
    trim: 'ZL1',
  });
});

test('requires vehicle, email, country, and a trusted source', () => {
  for (const key of ['vehicle', 'email', 'country', 'source'] as const) {
    assert.equal(parseReservationInput({ ...valid, [key]: '' }), null);
  }
  assert.equal(parseReservationInput({ ...valid, country: 'Atlantis' }), null);
  assert.equal(parseReservationInput({ ...valid, source: 'inflated-bot-source' }), null);
  assert.equal(parseReservationInput({ ...valid, email: 'not-an-email' }), null);
});

test('drops external attribution URLs', () => {
  assert.equal(parseReservationInput({ ...valid, path: 'https://evil.example' })?.path, null);
  assert.equal(parseReservationInput({ ...valid, path: '//evil.example' })?.path, null);
});
