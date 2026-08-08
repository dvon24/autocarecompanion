/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { inspect } = require('./inspect-lexus-source-inventory');

test('recall parser keeps defect, consequence, remedy and notes in their official columns', async () => {
  const result = await inspect({ aliases: ['LS'] });
  const lamp = result.recallRows.find((row) => row.campaign === '09E012000' && row.year === '2001');
  assert.ok(lamp);
  assert.match(lamp.summary, /SABERSPORT IS RECALLING 16,270 COMBINATION CORNER AND BUMPER LAMP ASSEMBLIES/);
  assert.match(lamp.consequence, /DECREASED LIGHTING VISIBILITY MAY RESULT IN A VEHICLE CRASH/);
  assert.match(lamp.remedy, /OFFER A FULL REFUND/);
  assert.match(lamp.notes, /AFTERMARKET REPLACEMENT EQUIPMENT/);

  const airbag = result.recallRows.find((row) => row.campaign === '06V096000' && row.year === '2004');
  assert.ok(airbag);
  assert.match(airbag.summary, /INSUFFICIENT AMOUNT OF THE HEATING AGENTS/);
  assert.match(airbag.consequence, /INCREASE THE RISK OF INJURY/);
  assert.match(airbag.remedy, /REPLACE THE SPECIFIC SRS AIR BAG/);
  assert.match(airbag.notes, /LEXUS RECALL NO\. 6LB/);
});
