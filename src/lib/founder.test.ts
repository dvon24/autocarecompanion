import assert from 'node:assert/strict';
import test from 'node:test';
import { isAccountAccessEmail } from './founder';

test('account access accepts exactly the two canonical owner identities', () => {
  assert.equal(isAccountAccessEmail('devonsroberson24@yahoo.com'), true);
  assert.equal(isAccountAccessEmail(' DVONINVESTLLC@YAHOO.COM '), true);
  assert.equal(isAccountAccessEmail('ops@example.com'), false);
  assert.equal(isAccountAccessEmail('nitenitedolly@icloud.com'), false);
  assert.equal(isAccountAccessEmail(null), false);
});

test('subscription bypass configuration cannot expand account access', () => {
  process.env.SUBSCRIPTION_REGION_BYPASS_EMAILS = 'ops@example.com';
  assert.equal(isAccountAccessEmail('ops@example.com'), false);
});
