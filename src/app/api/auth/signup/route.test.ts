import assert from 'node:assert/strict';
import test from 'node:test';
import { POST } from './route';

test('public signup is closed before parsing or persistence', async () => {
  const response = await POST();
  assert.equal(response.status, 410);
  assert.deepEqual(await response.json(), {
    error: 'Account creation is currently unavailable.',
  });
});
