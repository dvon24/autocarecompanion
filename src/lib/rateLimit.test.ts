import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkAnonymousLimit,
  incrementAnonymousCount,
  refundAnonymousCount,
  setAnonymousRemaining,
} from './rateLimit';
import { ANONYMOUS_HUB_MESSAGE_LIMIT } from './hub-message-limits';

class LocalStorageMock {
  private values = new Map<string, string>();

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const localStorageMock = new LocalStorageMock();
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: globalThis,
});
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageMock,
});

test('anonymous Hub visitors receive five messages before the gate', () => {
  localStorageMock.clear();
  assert.equal(ANONYMOUS_HUB_MESSAGE_LIMIT, 5);
  assert.equal(checkAnonymousLimit().remaining, 5);

  for (let used = 1; used <= ANONYMOUS_HUB_MESSAGE_LIMIT; used += 1) {
    assert.deepEqual(incrementAnonymousCount(), {
      success: true,
      remaining: ANONYMOUS_HUB_MESSAGE_LIMIT - used,
    });
  }

  assert.deepEqual(incrementAnonymousCount(), {
    success: false,
    remaining: 0,
  });
});

test('failed replies restore the local reservation', () => {
  localStorageMock.clear();
  assert.equal(incrementAnonymousCount().remaining, 4);
  assert.deepEqual(refundAnonymousCount(), { remaining: 5 });
  assert.equal(checkAnonymousLimit().remaining, 5);
});

test('server reconciliation persists across later local refreshes', () => {
  localStorageMock.clear();
  assert.equal(setAnonymousRemaining(2), 2);
  assert.equal(checkAnonymousLimit().remaining, 2);
  assert.equal(setAnonymousRemaining(99), 5);
  assert.equal(checkAnonymousLimit().remaining, 5);
});
