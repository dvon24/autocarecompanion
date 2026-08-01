import assert from 'node:assert/strict';
import test from 'node:test';
import type { TIssue } from './i18n';
import type { KnownIssue } from '@/schemas/knownIssue.schema';
import { reconcileLocalizedBMWIssues } from './localized-known-issues-audit';

const staleM4Translation: TIssue = {
  id: 'bmw-m4-dct-clutch-2015',
  title: 'Stale translated DCT claim',
  description: 'Archived claim',
  solution: 'Archived remedy',
  symptoms: [],
  severity: 'high',
  category: 'transmission',
  costLow: null,
  costHigh: null,
  dtcCodes: [],
  reportCount: 10,
};

const currentX7Issue = {
  id: 'bmw-x7-seat-belt-recall-2023',
  vehicleMatch: { years: [2023], make: 'BMW', model: 'X7' },
  title: 'Current evidence-bounded X7 issue',
  description: 'Current canonical description.',
  solution: 'Confirm VIN eligibility with BMW.',
  symptoms: ['Warning message'],
  severity: 'high',
  confidence: 'high',
  category: 'safety',
  estimatedCost: { low: 0, high: 0 },
  citations: [],
  humanApproved: true,
  lastReportedByOwners: '',
  reviewedOn: '2026-07-31',
  dtcCodes: [],
  reportCount: 0,
  status: 'published',
} satisfies KnownIssue;

test('localized audited-empty BMW route cannot render an archived translated claim', () => {
  const view = reconcileLocalizedBMWIssues(
    'pt-br',
    'bmw-m4',
    'BMW M4',
    [staleM4Translation],
    [],
  );
  assert.deepEqual(view.issues, []);
  assert.equal(view.auditedOn, '2026-07-31');
  assert.match(view.intro ?? '', /não manteve nenhum cartão/);
  assert.doesNotMatch(view.intro ?? '', /DCT/);
});

test('localized audited-positive BMW route renders the current canonical issue copy', () => {
  const view = reconcileLocalizedBMWIssues(
    'es',
    'bmw-x7',
    'BMW X7',
    [staleM4Translation],
    [currentX7Issue],
  );
  assert.equal(view.issues.length, 1);
  assert.equal(view.issues[0].id, currentX7Issue.id);
  assert.equal(view.issues[0].title, currentX7Issue.title);
  assert.equal(view.usesCurrentEnglishIssueCopy, true);
});

test('localized audited-positive BMW route fails closed on an unexpected zero-row result', () => {
  assert.throws(
    () => reconcileLocalizedBMWIssues(
      'es',
      'bmw-x7',
      'BMW X7',
      [staleM4Translation],
      [],
    ),
    /expected published issue cards but the localized route received none/,
  );
});

test('non-BMW translated routes retain their existing localized issue data', () => {
  const view = reconcileLocalizedBMWIssues(
    'es',
    'audi-a3',
    'Audi A3',
    [staleM4Translation],
    [],
  );
  assert.deepEqual(view.issues, [staleM4Translation]);
  assert.equal(view.intro, null);
  assert.equal(view.auditedOn, null);
});
