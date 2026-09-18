import assert from 'node:assert/strict';
import test from 'node:test';
import { isAllowedSubscriptionRegion } from './region';

test('only exact US country on Vercel is eligible, with no founder or hosting bypass', (t) => {
  const original = process.env.VERCEL;
  t.after(() => { if (original === undefined) delete process.env.VERCEL; else process.env.VERCEL = original; });
  for (const hosting of [undefined, '', '0', 'true', '1']) {
    if (hosting === undefined) delete process.env.VERCEL; else process.env.VERCEL = hosting;
    for (const country of [undefined, null, '', 'US', 'us', ' US', 'USA', 'DE', 'CA', 'GB', 'US,DE']) {
      for (const email of [undefined, 'devonsroberson24@yahoo.com', 'visitor@example.com']) {
        assert.equal(isAllowedSubscriptionRegion(country, email), hosting === '1' && country === 'US', `${hosting}/${country}/${email}`);
      }
    }
  }
});

test('production on other hosting rejects even owner requests carrying US', (t) => {
  const originalVercel = process.env.VERCEL;
  const originalNodeEnv = process.env.NODE_ENV;
  delete process.env.VERCEL;
  Object.assign(process.env, { NODE_ENV: 'production' });
  t.after(() => {
    if (originalVercel === undefined) delete process.env.VERCEL; else process.env.VERCEL = originalVercel;
    if (originalNodeEnv === undefined) Reflect.deleteProperty(process.env, 'NODE_ENV'); else Object.assign(process.env, { NODE_ENV: originalNodeEnv });
  });
  assert.equal(isAllowedSubscriptionRegion('US', 'devonsroberson24@yahoo.com'), false);
});
