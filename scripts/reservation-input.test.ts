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
