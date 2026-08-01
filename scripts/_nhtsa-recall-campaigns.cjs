const fs = require('node:fs');
const path = require('node:path');

function vehicleFromPacket(packet) {
  if (!Array.isArray(packet.records) || packet.records.length === 0) {
    throw new Error('Packet has no records.');
  }
  return {
    make: packet.records[0].make,
    model: packet.records[0].model,
    years: [...new Set(packet.records.flatMap((record) => record.years))]
      .sort((a, b) => a - b),
  };
}

async function fetchRecallCampaigns(packet, fetchImpl = fetch) {
  const { make, model, years } = vehicleFromPacket(packet);
  const recalls = new Map();
  for (const year of years) {
    const url = new URL('https://api.nhtsa.gov/recalls/recallsByVehicle');
    url.searchParams.set('make', make);
    url.searchParams.set('model', model);
    url.searchParams.set('modelYear', String(year));
    const response = await fetchImpl(url);
    const body = await response.json();
    if (!response.ok) {
      throw new Error(`NHTSA recall request failed: ${response.status} ${url}`);
    }
    if (!body || !Array.isArray(body.results)) {
      throw new Error(`NHTSA recall response was malformed: ${response.status} ${url}`);
    }
    for (const recall of body.results) {
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
  return { make, model, years, campaigns: [...recalls.values()] };
}

async function main(args = process.argv.slice(2)) {
  const prefix = '--packet=';
  const value = args.find((item) => item.startsWith(prefix));
  if (!value) throw new Error('Pass --packet=<packet-json>.');
  const packetPath = path.resolve(process.cwd(), value.slice(prefix.length));
  const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
  const result = await fetchRecallCampaigns(packet);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { fetchRecallCampaigns, vehicleFromPacket };
