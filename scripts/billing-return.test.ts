import assert from 'node:assert/strict';
import test from 'node:test';
import { billingReturnState } from '../src/lib/billing-return';
const account = { email: 'fixture@example.invalid', emailVerified: new Date(), subscriptionId: 'sub_fixture', subscriptionTier: 'hub', subscriptionStatus: 'active' };
const vehicle = { id: 'owned-vehicle', year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' };
test('confirmed Hub opens exact owner vehicle, never a new purchase', () => {
  assert.deepEqual(billingReturnState(account, 'hub', vehicle), { ready: true, destination: '/vehicle/2015-dodge-challenger-srt-392?vehicleId=owned-vehicle' });
});
test('Visual cannot unlock Hub and pending/unverified accounts cannot use return URL as a grant', () => {
  for (const candidate of [null, { ...account, emailVerified: null }, { ...account, subscriptionStatus: 'incomplete' }, { ...account, subscriptionTier: 'visual' }]) {
    assert.deepEqual(billingReturnState(candidate, 'hub', vehicle), { ready: false, destination: null });
  }
});
test('Visual goes to library; missing owned target goes to account, not arbitrary car', () => {
  assert.deepEqual(billingReturnState({ ...account, subscriptionTier: 'visual' }, 'visual', null), { ready: true, destination: '/visual' });
  assert.deepEqual(billingReturnState(account, 'hub', null), { ready: true, destination: '/account' });
  assert.equal(billingReturnState({ ...account, subscriptionStatus: 'trialing' }, 'hub', vehicle).ready, true);
});
