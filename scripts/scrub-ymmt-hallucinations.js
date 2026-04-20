#!/usr/bin/env node
/**
 * Remove known YMMT hallucinations — skip years between US generations
 * that GPT incorrectly marked as sold during the gap-fill audit.
 *
 * Each entry is a (year, make, model) that was NOT sold in the US that year.
 */

const fs = require('fs');
const path = require('path');

const YMMT_PATH = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');

const HALLUCINATIONS = [
  // BMW — skip years between generations
  [1994, 'BMW', 'M5'],
  [1995, 'BMW', 'M5'],
  [1998, 'BMW', 'M5'],
  [1999, 'BMW', 'M5'],
  [2011, 'BMW', 'M5'],
  [2014, 'BMW', 'M3'],
  [2011, 'BMW', 'M6'],
  [2012, 'BMW', 'M6'],
  [2022, 'BMW', 'M2'],
  // Dodge Viper skip years
  [2007, 'Dodge', 'Viper'],
  [2011, 'Dodge', 'Viper'],
  [2012, 'Dodge', 'Viper'],
  // Ford Ranger skip (2012-2018 all discontinued)
  [2012, 'Ford', 'Ranger'],
  // Mazda MX-5 Miata NA->NB skip
  [1998, 'Mazda', 'MX-5 Miata'],
  // Honda Passport Gen1 ended 2002; Gen2 started 2019
  [2003, 'Honda', 'Passport'],
  [2004, 'Honda', 'Passport'],
  // Honda Insight Gen1 ended 2006; Gen2 started 2010 MY
  [2009, 'Honda', 'Insight'],
  // Honda Ridgeline Gen1 ended 2014; Gen2 started 2017
  [2015, 'Honda', 'Ridgeline'],
  [2016, 'Honda', 'Ridgeline'],
  // Hyundai Veloster Gen1 ended 2017; Gen2 started 2019
  [2018, 'Hyundai', 'Veloster'],
  // Jeep Cherokee XJ ended 2001; KL started 2014
  [2002, 'Jeep', 'Cherokee'],
  // GMC Canyon Gen1 ended 2012; Gen2 started 2015
  [2013, 'GMC', 'Canyon'],
  [2014, 'GMC', 'Canyon'],
  // Nissan skip years
  [2015, 'Nissan', 'Maxima'],
  [2021, 'Nissan', 'Pathfinder'],
  [2010, 'Nissan', 'Quest'],
  [2008, 'Nissan', 'Murano'],
  [2016, 'Nissan', 'Armada'],
  // Chevy Trax old ended 2022; new came 2024
  [2023, 'Chevrolet', 'Trax'],
  // Subaru BRZ Gen1 ended 2020; Gen2 came 2022
  [2021, 'Subaru', 'BRZ'],
  // Kia Sorento Gen1 ended 2009; Gen2 came 2011
  [2010, 'Kia', 'Sorento'],
  // Toyota Land Cruiser 200 ended 2021; 250 came 2024
  [2022, 'Toyota', 'Land Cruiser'],
  // Toyota Supra A90 launched as 2020 MY
  [2019, 'Toyota', 'Supra'],
  // Toyota Venza Gen1 ended 2015; Gen2 came 2021
  [2020, 'Toyota', 'Venza'],
  // Mercedes-Benz AMG GT C190 ended 2021; C192 came 2024
  [2022, 'Mercedes-Benz', 'AMG GT'],
];

const ymmt = JSON.parse(fs.readFileSync(YMMT_PATH, 'utf8'));

let removed = 0;
let notFound = 0;

for (const [year, make, model] of HALLUCINATIONS) {
  const yStr = String(year);
  if (ymmt[yStr]?.[make]?.[model]) {
    delete ymmt[yStr][make][model];
    // Clean up empty make blocks
    if (Object.keys(ymmt[yStr][make]).length === 0) delete ymmt[yStr][make];
    // Clean up empty year blocks
    if (Object.keys(ymmt[yStr]).length === 0) delete ymmt[yStr];
    console.log(`  - Removed ${year} ${make} ${model}`);
    removed++;
  } else {
    console.log(`  ~ Not found: ${year} ${make} ${model}`);
    notFound++;
  }
}

fs.writeFileSync(YMMT_PATH, JSON.stringify(ymmt, null, 2));
console.log(`\nRemoved ${removed} hallucinations (${notFound} were not present)`);
