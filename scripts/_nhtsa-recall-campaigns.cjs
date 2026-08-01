const fs = require('node:fs');
const path = require('node:path');

const prefix = '--packet=';
const value = process.argv.find((item) => item.startsWith(prefix));
if (!value) throw new Error('Pass --packet=<packet-json>.');
const packetPath = path.resolve(process.cwd(), value.slice(prefix.length));
const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
if (!Array.isArray(packet.records) || packet.records.length === 0) {
  throw new Error('Packet has no records.');
}
const make = packet.records[0].make;
const model = packet.records[0].model;
const years = [...new Set(packet.records.flatMap((record) => record.years))]
  .sort((a, b) => a - b);

(async () => {
  const recalls = new Map();
  for (const year of years) {
    const url = new URL('https://api.nhtsa.gov/recalls/recallsByVehicle');
    url.searchParams.set('make', make);
    url.searchParams.set('model', model);
    url.searchParams.set('modelYear', String(year));
    const response = await fetch(url);
    const body = await response.json();
    if (!response.ok && !Array.isArray(body.results)) {
      throw new Error(`${response.status} ${url}`);
    }
    for (const recall of body.results || []) {
      const campaign = String(recall.NHTSACampaignNumber || '').trim();
      if (!campaign) continue;
      const current = recalls.get(campaign) || {
        campaign,
        years: [],
        component: recall.Component,
        summary: recall.Summary,
        remedy: recall.Remedy,
      };
      current.years.push(year);
      recalls.set(campaign, current);
    }
  }
  process.stdout.write(`${JSON.stringify({ make, model, years, campaigns: [...recalls.values()] }, null, 2)}\n`);
})().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
