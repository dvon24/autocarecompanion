#!/usr/bin/env node
/**
 * Backfill Acura's 1990-1999 YMMT entries.
 *
 * Acura exists in our YMMT data from 2000-2026 only, despite Acura
 * launching in the US in 1986 and having a full 1990s lineup (Integra,
 * Legend, NSX, Vigor, CL, TL, RL, SLX). This script adds those entries
 * so the 1990s issue-research agents have YMMT targets to attach
 * known-issue rows to.
 *
 * Trim coverage is researched per generation, not faked — these are
 * the actual trims Acura sold by model year in the US market:
 *
 *   Integra DA (1990-1993)      → RS, LS, GS, GS-R (GS-R from 1992)
 *   Integra DC (1994-1999)      → RS, LS, GS, GS-R, Type R (1997-99)
 *   Legend KA7/KA8 (1990-1995)  → L, LS, GS, Coupe L, Coupe LS
 *   NSX NA1 (1991-1999)         → Base, T (Targa, 1995+), Zanardi (1999)
 *   Vigor (1992-1994)           → LS, GS
 *   CL 1st gen (1997-1999)      → 2.2CL/2.3CL, 3.0CL
 *   TL 1st gen (1996-1998)      → 2.5TL, 3.2TL
 *   TL 2nd gen (1999)           → 3.2TL
 *   RL 1st gen (1996-1999)      → Base
 *   SLX (1996-1999)             → Base, Premium (Premium from 1998)
 *
 * Preserves all existing YMMT data — reads, merges, writes.
 * Re-running is a no-op if the entries are already present.
 */

const fs = require('fs');
const path = require('path');

const YMMT_PATH = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');

const ACURA_1990S = {
  1990: {
    Integra: ['RS', 'LS', 'GS'],
    Legend: ['L', 'LS'],
  },
  1991: {
    Integra: ['RS', 'LS', 'GS', 'Special Edition'],
    Legend: ['L', 'LS', 'Coupe L', 'Coupe LS'],
    NSX: ['Base'],
  },
  1992: {
    Integra: ['RS', 'LS', 'GS', 'GS-R'],
    Legend: ['L', 'LS', 'GS', 'Coupe L', 'Coupe LS'],
    NSX: ['Base'],
    Vigor: ['LS', 'GS'],
  },
  1993: {
    Integra: ['RS', 'LS', 'GS', 'GS-R'],
    Legend: ['L', 'LS', 'GS', 'Coupe L', 'Coupe LS'],
    NSX: ['Base'],
    Vigor: ['LS', 'GS'],
  },
  1994: {
    Integra: ['RS', 'LS', 'GS', 'GS-R'],
    Legend: ['L', 'LS', 'GS', 'Coupe L', 'Coupe LS'],
    NSX: ['Base'],
    Vigor: ['LS', 'GS'],
  },
  1995: {
    Integra: ['RS', 'LS', 'GS', 'GS-R', 'Special Edition'],
    Legend: ['L', 'LS', 'GS', 'Coupe L', 'Coupe LS'],
    NSX: ['Base', 'T'],
  },
  1996: {
    Integra: ['RS', 'LS', 'GS', 'GS-R'],
    NSX: ['Base', 'T'],
    TL: ['2.5TL', '3.2TL'],
    RL: ['Base'],
    SLX: ['Base'],
  },
  1997: {
    Integra: ['RS', 'LS', 'GS', 'GS-R', 'Type R'],
    NSX: ['Base', 'T'],
    CL: ['2.2CL', '3.0CL'],
    TL: ['2.5TL', '3.2TL'],
    RL: ['Base'],
    SLX: ['Base'],
  },
  1998: {
    Integra: ['RS', 'LS', 'GS', 'GS-R', 'Type R'],
    NSX: ['Base', 'T'],
    CL: ['2.3CL', '3.0CL'],
    TL: ['2.5TL', '3.2TL'],
    RL: ['Base'],
    SLX: ['Base', 'Premium'],
  },
  1999: {
    Integra: ['RS', 'LS', 'GS', 'GS-R', 'Type R'],
    NSX: ['Base', 'T', 'Zanardi Edition'],
    CL: ['2.3CL', '3.0CL'],
    TL: ['3.2TL'],
    RL: ['Base'],
    SLX: ['Base', 'Premium'],
  },
};

function main() {
  const ymmt = JSON.parse(fs.readFileSync(YMMT_PATH, 'utf8'));

  let added = 0;
  let skipped = 0;
  let modelsAdded = 0;
  let trimsAdded = 0;

  for (const [year, models] of Object.entries(ACURA_1990S)) {
    if (!ymmt[year]) ymmt[year] = {};
    if (!ymmt[year].Acura) {
      ymmt[year].Acura = {};
      added++;
    } else {
      skipped++;
    }
    for (const [model, trims] of Object.entries(models)) {
      if (!ymmt[year].Acura[model]) {
        ymmt[year].Acura[model] = trims;
        modelsAdded++;
        trimsAdded += trims.length;
      } else {
        // Merge missing trims into existing model entry
        const existing = new Set(ymmt[year].Acura[model]);
        let newTrims = 0;
        for (const t of trims) {
          if (!existing.has(t)) {
            ymmt[year].Acura[model].push(t);
            newTrims++;
            trimsAdded++;
          }
        }
        if (newTrims > 0) {
          console.log(`  ~ ${year} Acura ${model}: added ${newTrims} new trims, kept existing`);
        }
      }
    }
  }

  // Write back with 2-space indent to match existing file format.
  fs.writeFileSync(YMMT_PATH, JSON.stringify(ymmt, null, 2) + '\n', 'utf8');

  console.log('\n=== Acura 1990s YMMT backfill complete ===');
  console.log(`Years touched:         ${Object.keys(ACURA_1990S).length}`);
  console.log(`Acura make blocks new: ${added} (skipped ${skipped} that already existed)`);
  console.log(`Models added:          ${modelsAdded}`);
  console.log(`Trims added:           ${trimsAdded}`);
  console.log(`\nVerify with: node scripts/_audi-1990s-gap.js (or equivalent for Acura)`);
}

main();
