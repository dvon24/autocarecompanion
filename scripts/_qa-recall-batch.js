#!/usr/bin/env node
/**
 * QA a recall-propagation batch against the authoritative gap data. ZERO AI, ZERO writes.
 * Usage: node scripts/_qa-recall-batch.js data/research-recall-batchN-<date>.json
 */
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('usage: node scripts/_qa-recall-batch.js <file.json>'); process.exit(1); }
const { confirmed } = JSON.parse(fs.readFileSync(file, 'utf8')).result;
const { gaps } = JSON.parse(fs.readFileSync('data/_recall-propagation-gaps.json', 'utf8'));
const CATS = ['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','exhaust','steering','hvac','emissions','other'];
const gapYears = new Map(gaps.map((g) => [`${g.campaign}|${g.make}|${g.model}`, g.years]));

let badCat = 0, badSev = 0, noCite = 0, badUrl = 0;
const yearMismatch = [], campaignMismatch = [];
for (const c of confirmed) {
  if (!CATS.includes(c.category)) badCat++;
  if (!['high','medium','low'].includes(c.severity)) badSev++;
  const cites = c.citations || [];
  if (!cites.length) { noCite++; continue; }
  for (const ci of cites) {
    if (!/^https:\/\/www\.nhtsa\.gov\/recalls\?nhtsaId=\d{2}[VETRC]\d{6}$/.test(ci.url)) badUrl++;
    const m = String(ci.url).match(/nhtsaId=(\w+)/);
    if (m && c._campaign && m[1].toUpperCase() !== c._campaign.toUpperCase()) campaignMismatch.push(`${c.make} ${c.model}: cites ${m[1]} but campaign is ${c._campaign}`);
  }
  const expect = gapYears.get(`${c._campaign}|${c.make}|${c.model}`);
  if (expect) {
    const a = [...c.years].sort().join(','), b = [...expect].sort().join(',');
    if (a !== b) yearMismatch.push(`${c.make} ${c.model} ${c._campaign}: claimed [${a}] vs NHTSA [${b}]`);
  }
}
const sev = {}, cat = {};
confirmed.forEach((c) => { sev[c.severity] = (sev[c.severity]||0)+1; cat[c.category] = (cat[c.category]||0)+1; });
const conf = confirmed.map((c) => c._verdictConfidence).sort((a,b) => a-b);
const byModel = {};
confirmed.forEach((c) => { const k = `${c.make} ${c.model}`; (byModel[k] ||= []).push(c.title); });
const dupTitles = Object.entries(byModel).filter(([, t]) => new Set(t).size !== t.length);
// prose variation across the widest campaign
const perCamp = {};
confirmed.forEach((c) => { (perCamp[c._campaign] ||= []).push(c); });
const widest = Object.entries(perCamp).sort((a,b) => b[1].length - a[1].length)[0];

console.log(`${file}`);
console.log(`  issues: ${confirmed.length} across ${Object.keys(byModel).length} models, ${Object.keys(perCamp).length} campaigns`);
console.log(`  bad category ${badCat} | bad severity ${badSev} | no citations ${noCite} | malformed URL ${badUrl}`);
console.log(`  YEAR MISMATCH vs NHTSA per-model list: ${yearMismatch.length}`);
yearMismatch.slice(0,10).forEach((x) => console.log(`     ${x}`));
console.log(`  citation points at wrong campaign: ${campaignMismatch.length}`);
campaignMismatch.slice(0,5).forEach((x) => console.log(`     ${x}`));
console.log(`  duplicate titles within a model: ${dupTitles.length}`);
console.log(`  severity: ${JSON.stringify(sev)}`);
console.log(`  categories: ${Object.entries(cat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+'='+v).join(' ')}`);
console.log(`  confidence: min ${conf[0]} median ${conf[Math.floor(conf.length/2)]} max ${conf[conf.length-1]}`);
if (widest) console.log(`  prose variation (${widest[0]}, ${widest[1].length} models): ${new Set(widest[1].map(c=>c.title)).size} distinct titles, ${new Set(widest[1].map(c=>c.description.slice(0,40))).size} distinct openings`);
const fail = badCat+badSev+noCite+badUrl+yearMismatch.length+campaignMismatch.length+dupTitles.length;
console.log(`\n  ${fail === 0 ? 'PASS — no defects' : 'DEFECTS: ' + fail}`);
