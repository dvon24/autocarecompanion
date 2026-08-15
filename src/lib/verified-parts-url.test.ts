import assert from 'node:assert/strict';
import test from 'node:test';
import { isRetailerProductUrl } from './verified-parts';

test('accepts exact Acura OEM and PartsGeek product pages in the web verifier', () => {
  assert.equal(
    isRetailerProductUrl(
      'https://www.acurapartswarehouse.com/oem/acura~belt~timing~125ru26~unitta~14400-p7j-004.html',
      '14400-P7J-004',
    ),
    true,
  );
  assert.equal(
    isRetailerProductUrl(
      'https://www.partsgeek.com/6rf5vft-acura-integra-wheel-hub-assembly.html',
      '5895-03725718',
    ),
    true,
  );
});

test('does not turn retailer categories or lookalike hosts into verified products', () => {
  assert.equal(isRetailerProductUrl('https://www.acurapartswarehouse.com/acura-parts/'), false);
  assert.equal(
    isRetailerProductUrl('https://www.acurapartswarehouse.com/oem/acura~integra~2000.html'),
    false,
  );
  assert.equal(
    isRetailerProductUrl('https://www.acurapartswarehouse.com/oem/acura~tlx~2021~parts.html'),
    false,
  );
  assert.equal(
    isRetailerProductUrl(
      'https://acurapartswarehouse.example.com/oem/acura~belt~timing~14400-p7j-004.html',
      '14400-P7J-004',
    ),
    false,
  );
});
