import assert from 'node:assert/strict';
import test from 'node:test';
import { externalHttpUrl } from './external-http-url';

test('accepts absolute web citations', () => {
  assert.equal(externalHttpUrl('https://static.nhtsa.gov/example.pdf'), 'https://static.nhtsa.gov/example.pdf');
  assert.equal(externalHttpUrl('http://example.com/source'), 'http://example.com/source');
});

test('rejects sentinel, relative and non-web citation targets', () => {
  for (const value of ['undefined', 'null', '/undefined', '/relative', 'javascript:alert(1)', 'mailto:test@example.com']) {
    assert.equal(externalHttpUrl(value), null, value);
  }
});
