import assert from 'node:assert/strict';
import test from 'node:test';
import { externalHttpUrl, isPublicWebHostname } from './external-http-url';

test('accepts absolute web citations', () => {
  assert.equal(externalHttpUrl('https://static.nhtsa.gov/example.pdf'), 'https://static.nhtsa.gov/example.pdf');
  assert.equal(externalHttpUrl('http://example.com/source'), 'http://example.com/source');
});

test('public-host validation handles trailing-dot and local suffix boundaries', () => {
  assert.equal(isPublicWebHostname('static.nhtsa.gov.'), true);
  assert.equal(isPublicWebHostname('router.lan.'), false);
  assert.equal(isPublicWebHostname('router.lan..'), false);
  assert.equal(isPublicWebHostname('localhost..'), false);
  assert.equal(isPublicWebHostname('shop.home'), false);
});

test('rejects sentinel, relative and non-web citation targets', () => {
  for (const value of [
    'undefined', 'null', '/undefined', '/relative', 'javascript:alert(1)', 'mailto:test@example.com',
    'http://127.0.0.1:3000/admin', 'https://192.168.1.10/source', 'http://router.local/source',
    'http://intranet/source', 'http://[::1]/source',
  ]) {
    assert.equal(externalHttpUrl(value), null, value);
  }
});
