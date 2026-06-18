#!/usr/bin/env node
/**
 * Add the EU-bestseller nameplates from research-eu-bestsellers that were
 * missing from YMMT (Skoda/SEAT models were already added via the SEAT/Skoda
 * gate). EU year ranges. Run after the issues are persisted+promoted, then
 * commit public/data/ymmt.json + deploy.
 */
const fs = require('fs');
const path = require('path');
const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

const DATA = {
  Volkswagen: {
    Up: { 2011: { end: 2023, trims: ['Take Up', 'Move Up', 'High Up', 'GTI', 'e-up', '1.0 MPI', '1.0 TSI'] } },
    Caddy: {
      2004: { end: 2015, trims: ['Life', 'Maxi', 'Cargo', '1.6 TDI', '1.9 TDI', '2.0 TDI'] }, // 2K
      2015: { end: 2020, trims: ['Life', 'Maxi', 'Cargo', 'Alltrack', '1.0 TSI', '2.0 TDI'] }, // 2K facelift
      2020: { end: 2026, trims: ['Life', 'Maxi', 'Cargo', 'Style', '1.5 TSI', '2.0 TDI'] }, // SB (MQB)
    },
    Scirocco: { 2008: { end: 2017, trims: ['R', 'GT', 'R-Line', '1.4 TSI', '2.0 TSI', '2.0 TDI'] } },
  },
  Audi: {
    SQ2: { 2019: { end: 2026, trims: ['quattro', '2.0 TFSI', 'Black Edition', 'Vorsprung'] } },
  },
  Cupra: {
    Formentor: { 2020: { end: 2026, trims: ['VZ', 'VZ5', 'e-Hybrid', '1.5 TSI', '2.0 TSI', '2.0 TDI'] } },
  },
};

function add(year, make, model, trims) {
  const y = year.toString();
  if (!ymmt[y]) ymmt[y] = {};
  if (!ymmt[y][make]) ymmt[y][make] = {};
  if (!ymmt[y][make][model]) { ymmt[y][make][model] = trims; return true; }
  return false;
}

let added = 0; const stats = {};
for (const [make, models] of Object.entries(DATA)) {
  for (const [model, gens] of Object.entries(models)) {
    const k = `${make} ${model}`; stats[k] = 0;
    for (const [startStr, { end, trims }] of Object.entries(gens)) {
      for (let yr = parseInt(startStr, 10); yr <= end; yr++) if (add(yr, make, model, trims)) { added++; stats[k]++; }
    }
  }
}
for (const yr of Object.keys(ymmt)) {
  for (const mk of Object.keys(DATA)) if (ymmt[yr][mk]) {
    const s = {}; Object.keys(ymmt[yr][mk]).sort().forEach((m) => { s[m] = ymmt[yr][mk][m]; }); ymmt[yr][mk] = s;
  }
  const sm = {}; Object.keys(ymmt[yr]).sort().forEach((mk) => { sm[mk] = ymmt[yr][mk]; }); ymmt[yr] = sm;
}
fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log(`✓ Added ${added} year/make/model combos`);
for (const [k, n] of Object.entries(stats)) console.log(`  ${k.padEnd(20)} ${n} years`);
