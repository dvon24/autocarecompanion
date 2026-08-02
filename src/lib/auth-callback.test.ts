import assert from 'node:assert/strict';
import test from 'node:test';
import { safeInternalCallback, signinHref, signupHref } from './auth-callback';

test('keeps a same-origin vehicle callback', () => {
  const callback = '/vehicle/2015-dodge-challenger-srt-392';
  assert.equal(safeInternalCallback(callback), callback);
  assert.equal(
    signupHref(callback),
    '/auth/signup?callbackUrl=%2Fvehicle%2F2015-dodge-challenger-srt-392',
  );
  assert.equal(
    signinHref(callback),
    '/auth/signin?callbackUrl=%2Fvehicle%2F2015-dodge-challenger-srt-392',
  );
});

test('preserves Hub query state inside the encoded callback', () => {
  const callback = '/vehicle/2024-bmw-x5-xdrive40i?session=thread-123';
  assert.equal(safeInternalCallback(callback), callback);
  assert.equal(
    signupHref(callback),
    '/auth/signup?callbackUrl=%2Fvehicle%2F2024-bmw-x5-xdrive40i%3Fsession%3Dthread-123',
  );
});

test('rejects absolute and protocol-relative redirects', () => {
  assert.equal(safeInternalCallback('https://example.com'), '/');
  assert.equal(safeInternalCallback('//example.com'), '/');
  assert.equal(safeInternalCallback('/\\example.com'), '/');
  assert.equal(safeInternalCallback('/vehicle/example\r\nLocation: https://example.com'), '/');
  assert.equal(safeInternalCallback(null), '/');
});
