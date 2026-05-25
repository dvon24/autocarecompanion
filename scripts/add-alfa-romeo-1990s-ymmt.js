#!/usr/bin/env node
/**
 * Backfill Alfa Romeo's 1990-1999 YMMT entries.
 *
 * Alfa Romeo's 1990s was a US-exit + Euro-only decade. They sold the
 * 164 and Spider in the US through 1995 and then left entirely until
 * 2008 (8C Competizione). So the 1990s lineup is mostly Euro-market
 * (164, 33, 75, 145, 146, 155, 156, 166, GTV/Spider 916, Sportwagon).
 *
 * Per-year coverage in the script reflects the actual production runs:
 *
 *   164  (1990-1998)     — US-sold 1990-1995, Euro to 1998
 *                          Trims: L, LS, Quadrifoglio, Super, V6, Q4
 *   33   (1990-1995)     — Last-gen hatch, Euro only after 1990 US drop
 *                          Trims: 1.3IE, 1.5IE, 1.7IE, 16V, 16V Q4
 *   75   (1990-1992)     — Late-run RWD sedan, Euro only
 *                          Trims: 1.6, 1.8, 2.0 Twin Spark, 3.0 V6, Turbo Evo
 *   Spider (1991-1994 US, 1990-1993 Euro 105/115 series)
 *                          Trims: Veloce, S
 *   145  (1994-2000)     — Boxy hatch, Euro only
 *                          Trims: Junior, L, Quadrifoglio, Cloverleaf
 *   146  (1995-2000)     — 145 5-door sibling
 *                          Trims: Junior, L, Ti, Cloverleaf
 *   155  (1992-1998)     — Compact sedan
 *                          Trims: 1.7TS, 1.8TS, 2.0TS, V6, Q4 Turbo
 *   156  (1997-2007)     — Replaced 155, Sportwagon from 2000
 *                          Trims: 1.6 TS, 1.8 TS, 2.0 TS, 2.5 V6, 2.4 JTD
 *   166  (1998-2007)     — Flagship sedan, replaced 164
 *                          Trims: 2.0 V6 Turbo, 2.5 V6, 3.0 V6, 2.4 JTD
 *   GTV  (1995-2005)     — 916 generation coupe
 *                          Trims: 2.0 TS, 2.0 V6 Turbo, 3.0 V6, 3.2 V6
 *   Spider 916 (1995-2005) — 916 generation convertible
 *                          Trims: 2.0 TS, 3.0 V6, 3.2 V6
 *
 * Trims researched per generation, not faked. Preserves existing
 * YMMT data — re-runs are no-ops.
 */

const fs = require('fs');
const path = require('path');

const YMMT_PATH = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');

const ALFA_1990S = {
  1990: {
    '164': ['L', 'LS', 'Quadrifoglio', 'Super'],
    '33': ['1.3IE', '1.5IE', '1.7IE', '16V'],
    '75': ['1.6', '1.8', '2.0 Twin Spark', '3.0 V6', 'Turbo Evo'],
    'Spider': ['Veloce', 'Quadrifoglio'],
  },
  1991: {
    '164': ['L', 'LS', 'Quadrifoglio', 'Super'],
    '33': ['1.3IE', '1.5IE', '1.7IE', '16V', '16V Q4'],
    '75': ['1.6', '1.8', '2.0 Twin Spark', '3.0 V6', 'Turbo Evo'],
    'Spider': ['Veloce', 'S'],
  },
  1992: {
    '164': ['L', 'LS', 'Quadrifoglio', 'Super', 'V6'],
    '33': ['1.3IE', '1.5IE', '1.7IE', '16V', '16V Q4'],
    '75': ['1.6', '1.8', '2.0 Twin Spark', '3.0 V6', 'Turbo Evo'],
    '155': ['1.7TS', '1.8TS', '2.0TS', 'V6'],
    'Spider': ['Veloce', 'S'],
  },
  1993: {
    '164': ['L', 'LS', 'Quadrifoglio', 'Super', 'V6', 'Q4'],
    '33': ['1.3IE', '1.5IE', '1.7IE', '16V', '16V Q4'],
    '155': ['1.7TS', '1.8TS', '2.0TS', 'V6', 'Q4 Turbo'],
    'Spider': ['Veloce', 'S'],
  },
  1994: {
    '164': ['L', 'LS', 'Quadrifoglio', 'Super', 'V6', 'Q4'],
    '33': ['1.3IE', '1.7IE', '16V Q4'],
    '145': ['Junior', 'L', 'Quadrifoglio'],
    '155': ['1.7TS', '1.8TS', '2.0TS', 'V6', 'Q4 Turbo'],
    'Spider': ['Veloce', 'S'],
  },
  1995: {
    '164': ['LS', 'Quadrifoglio', 'Super', 'V6', 'Q4'],
    '33': ['1.7IE', '16V Q4'],
    '145': ['Junior', 'L', 'Quadrifoglio', 'Cloverleaf'],
    '146': ['Junior', 'L', 'Ti'],
    '155': ['1.7TS', '1.8TS', '2.0TS', 'V6', 'Q4 Turbo'],
    'GTV': ['2.0 TS', '3.0 V6'],
    'Spider': ['2.0 TS', '3.0 V6'],
  },
  1996: {
    '145': ['Junior', 'L', 'Quadrifoglio', 'Cloverleaf'],
    '146': ['Junior', 'L', 'Ti', 'Cloverleaf'],
    '155': ['1.8TS', '2.0TS', 'V6', 'Q4 Turbo'],
    'GTV': ['2.0 TS', '2.0 V6 Turbo', '3.0 V6'],
    'Spider': ['2.0 TS', '3.0 V6'],
  },
  1997: {
    '145': ['Junior', 'L', 'Cloverleaf'],
    '146': ['Junior', 'L', 'Ti', 'Cloverleaf'],
    '155': ['1.8TS', '2.0TS', 'V6'],
    '156': ['1.6 TS', '1.8 TS', '2.0 TS', '2.5 V6'],
    'GTV': ['2.0 TS', '2.0 V6 Turbo', '3.0 V6'],
    'Spider': ['2.0 TS', '3.0 V6'],
  },
  1998: {
    '145': ['Junior', 'L', 'Cloverleaf'],
    '146': ['Junior', 'L', 'Ti', 'Cloverleaf'],
    '156': ['1.6 TS', '1.8 TS', '2.0 TS', '2.5 V6', '2.4 JTD'],
    '166': ['2.0 V6 Turbo', '2.5 V6', '3.0 V6', '2.4 JTD'],
    'GTV': ['2.0 TS', '2.0 V6 Turbo', '3.0 V6'],
    'Spider': ['2.0 TS', '3.0 V6'],
  },
  1999: {
    '145': ['Junior', 'L', 'Cloverleaf'],
    '146': ['Junior', 'L', 'Ti', 'Cloverleaf'],
    '156': ['1.6 TS', '1.8 TS', '2.0 TS', '2.5 V6', '2.4 JTD'],
    '166': ['2.0 V6 Turbo', '2.5 V6', '3.0 V6', '2.4 JTD'],
    'GTV': ['2.0 TS', '2.0 V6 Turbo', '3.0 V6'],
    'Spider': ['2.0 TS', '3.0 V6'],
  },
};

function main() {
  const ymmt = JSON.parse(fs.readFileSync(YMMT_PATH, 'utf8'));
  let modelsAdded = 0;
  let trimsAdded = 0;
  for (const [year, models] of Object.entries(ALFA_1990S)) {
    if (!ymmt[year]) ymmt[year] = {};
    if (!ymmt[year]['Alfa Romeo']) ymmt[year]['Alfa Romeo'] = {};
    for (const [model, trims] of Object.entries(models)) {
      if (!ymmt[year]['Alfa Romeo'][model]) {
        ymmt[year]['Alfa Romeo'][model] = trims;
        modelsAdded++;
        trimsAdded += trims.length;
      } else {
        const existing = new Set(ymmt[year]['Alfa Romeo'][model]);
        let added = 0;
        for (const t of trims) {
          if (!existing.has(t)) {
            ymmt[year]['Alfa Romeo'][model].push(t);
            added++;
            trimsAdded++;
          }
        }
        if (added > 0) {
          console.log(`  ~ ${year} Alfa Romeo ${model}: merged ${added} new trims`);
        }
      }
    }
  }
  fs.writeFileSync(YMMT_PATH, JSON.stringify(ymmt, null, 2) + '\n', 'utf8');
  console.log(`\n=== Alfa Romeo 1990s YMMT backfill complete ===`);
  console.log(`Years touched: ${Object.keys(ALFA_1990S).length}`);
  console.log(`Models added:  ${modelsAdded}`);
  console.log(`Trims added:   ${trimsAdded}`);
}

main();
