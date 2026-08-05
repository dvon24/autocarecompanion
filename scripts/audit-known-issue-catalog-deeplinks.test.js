/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { liveScope } = require('./audit-known-issue-catalog-deeplinks');

test('liveScope keeps exports published-only and parameterizes make/model filters', () => {
  assert.deepEqual(liveScope(), { sql: "status = 'published'", values: [] });
  assert.deepEqual(liveScope({ make: 'Genesis', model: 'G80' }), {
    sql: "status = 'published' AND lower(\"make\") = lower($1) AND lower(\"model\") = lower($2)",
    values: ['Genesis', 'G80'],
  });
  assert.deepEqual(liveScope({ make: 'Genesis' }, 'k'), {
    sql: "k.status = 'published' AND lower(k.\"make\") = lower($1)",
    values: ['Genesis'],
  });
});
