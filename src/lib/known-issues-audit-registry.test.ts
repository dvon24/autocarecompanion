import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BMW_AUDITED_MODELS,
  getBMWAuditedEmptyModel,
  getBMWAuditedEmptyModels,
  getBMWAuditedModel,
} from './known-issues-audit-registry';

test('BMW audit registry contains one exact identity for every audited model', () => {
  assert.equal(BMW_AUDITED_MODELS.length, 41);
  assert.equal(new Set(BMW_AUDITED_MODELS.map((entry) => entry.slug)).size, 41);
  assert.deepEqual(getBMWAuditedModel('bmw-x7'), {
    slug: 'bmw-x7',
    make: 'BMW',
    model: 'X7',
    expectedPublishedCount: 1,
    auditedOn: '2026-07-31',
  });
});

test('audited-empty fallback is limited to exact zero-published after-states', () => {
  assert.deepEqual(
    getBMWAuditedEmptyModels().map((entry) => entry.slug),
    [
      'bmw-m3-cs',
      'bmw-m4',
      'bmw-m4-cs',
      'bmw-m5',
      'bmw-m6',
      'bmw-m8',
      'bmw-x4-m',
      'bmw-x5-m',
      'bmw-x6-m',
      'bmw-z3',
      'bmw-z8',
    ],
  );
  assert.equal(getBMWAuditedEmptyModel('bmw-m4')?.auditedOn, '2026-07-31');
  assert.equal(getBMWAuditedEmptyModel('bmw-x7'), null);
  assert.equal(getBMWAuditedEmptyModel('bmw-unknown'), null);
});
