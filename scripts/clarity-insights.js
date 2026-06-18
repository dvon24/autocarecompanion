#!/usr/bin/env node
/**
 * Pull live insights from the Microsoft Clarity Data Export API.
 *
 * Setup (one-time):
 *   1. Clarity dashboard → Settings → Data Export → "Generate new API token"
 *   2. Add to .env.local:  CLARITY_API_TOKEN=<the JWT it gives you>
 *
 * Usage:
 *   node scripts/clarity-insights.js               # last 1 day, by URL + Device
 *   node scripts/clarity-insights.js 3             # last 3 days (API max)
 *   node scripts/clarity-insights.js 1 Browser OS  # custom dimensions (max 3)
 *
 * NOTE: Clarity caps this API at 10 requests per project per DAY — don't
 * loop it. Valid dimensions: Browser, Device, Country/Region, OS, Source,
 * Medium, Campaign, Channel, URL.
 */
require('dotenv').config({ path: '.env.local' });

const TOKEN = process.env.CLARITY_API_TOKEN;
if (!TOKEN) {
  console.error('CLARITY_API_TOKEN missing. Generate one in Clarity → Settings → Data Export, then add it to .env.local');
  process.exit(1);
}

const numOfDays = process.argv[2] || '1';
const dims = process.argv.slice(3);
const dimensions = (dims.length ? dims : ['URL', 'Device']).slice(0, 3);

async function main() {
  const params = new URLSearchParams({ numOfDays });
  dimensions.forEach((d, i) => params.set(`dimension${i + 1}`, d));
  const url = `https://www.clarity.ms/export-data/api/v1/project-live-insights?${params}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`Clarity API ${res.status}: ${body.slice(0, 500)}`);
    if (res.status === 401) console.error('Token invalid/expired — regenerate in Clarity → Settings → Data Export.');
    if (res.status === 429) console.error('Daily limit hit (10 requests/project/day). Try again tomorrow.');
    process.exit(1);
  }

  const data = await res.json();
  // The API returns an array of metric blocks: Traffic, EngagementTime,
  // ScrollDepth, DeadClickCount, RageClickCount, QuickbackClick,
  // ScriptErrorCount, ErrorClickCount, PopularPages, Browser/Device/OS/...
  for (const block of data) {
    console.log(`\n=== ${block.metricName} ===`);
    for (const row of (block.information || []).slice(0, 15)) {
      console.log(JSON.stringify(row));
    }
  }
}

main().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
