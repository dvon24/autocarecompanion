import assert from 'node:assert/strict';
import test from 'node:test';
import { fullyCoveredYears } from './part-proposal-coverage';

test('requires a PN across every resolved model alias and engine application', () => {
  const years = fullyCoveredYears({
    partYears: [2020, 2021],
    candidateModelsByYear: {
      2020: ['C300'],
      2021: ['C300', 'C63 AMG'],
    },
    candidateApplicationsByYear: {
      2020: ['C300|2.0L'],
      2021: ['C300|2.0L', 'C63 AMG|4.0L'],
    },
    requiredModelsByYear: {
      2020: ['C300', 'C63 AMG'],
      2021: ['C300', 'C63 AMG'],
    },
    requiredApplicationsByYear: {
      2020: ['C300|2.0L', 'C63 AMG|4.0L'],
      2021: ['C300|2.0L', 'C63 AMG|4.0L'],
    },
  });
  assert.deepEqual(years, [2021]);
});

test('missing required coverage evidence fails closed', () => {
  assert.deepEqual(fullyCoveredYears({
    partYears: [2020],
    candidateModelsByYear: { 2020: ['C300'] },
    candidateApplicationsByYear: { 2020: ['C300|2.0L'] },
    requiredModelsByYear: {},
    requiredApplicationsByYear: {},
  }), []);
});
