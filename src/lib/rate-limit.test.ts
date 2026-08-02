import assert from 'node:assert/strict';
import test from 'node:test';
import { RateLimiter } from './rate-limit';

test('a failed request can release its reserved rate-limit slot', () => {
  const limiter = new RateLimiter(60_000, 2);

  assert.equal(limiter.check('visitor').success, true);
  assert.equal(limiter.check('visitor').success, true);
  assert.equal(limiter.check('visitor').success, false);

  assert.equal(limiter.refund('visitor'), true);
  assert.equal(limiter.check('visitor').success, true);
  assert.equal(limiter.refund('missing'), false);
});
