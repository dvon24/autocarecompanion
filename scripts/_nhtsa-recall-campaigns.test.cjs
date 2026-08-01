const assert = require('node:assert/strict');
const test = require('node:test');
const { fetchRecallCampaigns } = require('./_nhtsa-recall-campaigns.cjs');

const packet = {
  records: [{ make: 'BMW', model: 'M4', years: [2015] }],
};

test('NHTSA recall helper rejects a non-2xx response even when it contains results', async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 503,
    json: async () => ({ results: [{ NHTSACampaignNumber: 'TEST' }] }),
  });
  await assert.rejects(
    () => fetchRecallCampaigns(packet, fetchImpl),
    /request failed: 503/,
  );
});

test('NHTSA recall helper rejects a successful response with malformed results', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ results: null }),
  });
  await assert.rejects(
    () => fetchRecallCampaigns(packet, fetchImpl),
    /response was malformed: 200/,
  );
});

test('NHTSA recall helper merges the same campaign across model years', async () => {
  const multiYearPacket = {
    records: [{ make: 'BMW', model: 'X7', years: [2023, 2024] }],
  };
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      results: [{
        NHTSACampaignNumber: '24V-001',
        Component: 'SEAT BELTS',
        Summary: 'Summary',
        Remedy: 'Remedy',
      }],
    }),
  });
  const result = await fetchRecallCampaigns(multiYearPacket, fetchImpl);
  assert.deepEqual(result.campaigns, [{
    campaign: '24V-001',
    years: [2023, 2024],
    component: 'SEAT BELTS',
    summary: 'Summary',
    remedy: 'Remedy',
  }]);
});
