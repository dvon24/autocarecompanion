import assert from 'node:assert/strict';
import test from 'node:test';
import { hasAuthSessionCookie } from '../src/lib/session-marker';

test('recognizes current and legacy Auth.js session cookies', () => {
  assert.equal(hasAuthSessionCookie(['authjs.session-token']), true);
  assert.equal(hasAuthSessionCookie(['__Secure-authjs.session-token']), true);
  assert.equal(hasAuthSessionCookie(['next-auth.session-token']), true);
});

test('recognizes chunked session cookies', () => {
  assert.equal(hasAuthSessionCookie(['__Secure-authjs.session-token.0']), true);
  assert.equal(hasAuthSessionCookie(['authjs.session-token.1']), true);
});

test('does not accept lookalike cookie names', () => {
  assert.equal(hasAuthSessionCookie(['authjs.session-token-attacker']), false);
  assert.equal(hasAuthSessionCookie(['au7o.sess']), false);
});
