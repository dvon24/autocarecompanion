import assert from 'node:assert/strict';
import test from 'node:test';
import { vehicleInfoForKnownIssueArticle } from './known-issue-article-vehicle';

const selected = { year: 2005, make: 'Acura', model: 'TL', trim: 'Type-S' };

test('generic article uses a matching selected vehicle for actions and fitment', () => {
  assert.deepEqual(vehicleInfoForKnownIssueArticle(selected, 'Acura', 'TL', null), selected);
});

test('year article preserves matching selected trim', () => {
  assert.deepEqual(vehicleInfoForKnownIssueArticle(selected, 'Acura', 'TL', 2005), selected);
});

test('year article does not borrow trim from another year', () => {
  assert.deepEqual(vehicleInfoForKnownIssueArticle(selected, 'Acura', 'TL', 2006), {
    year: 2006,
    make: 'Acura',
    model: 'TL',
  });
});

test('generic article does not borrow an unrelated selected vehicle', () => {
  assert.equal(vehicleInfoForKnownIssueArticle(selected, 'Acura', 'MDX', null), undefined);
});
