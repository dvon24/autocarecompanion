const fs = require('fs');
const path = require('path');

// ============================================================
// FIX 1: Model name mismatches in known-issues.json
// ============================================================
const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));

const modelRenames = {
  'S5': 'A5',       // S5 is a trim of A5 in YMMT
  'S7': 'A7',       // S7 is a trim of A7 in YMMT
  '335i': '3 Series', // 335i is a trim of 3 Series in YMMT
  '328i': '3 Series', // 328i is a trim of 3 Series in YMMT
  'Silverado': 'Silverado 1500'  // YMMT uses "Silverado 1500"
};

let renamedCount = 0;
data.issues.forEach(issue => {
  // Legacy format
  if (issue.vehicleMatch && modelRenames[issue.vehicleMatch.model]) {
    const oldModel = issue.vehicleMatch.model;
    issue.vehicleMatch.model = modelRenames[oldModel];
    console.log('Renamed issue model: ' + issue.id + ' (' + oldModel + ' -> ' + modelRenames[oldModel] + ')');
    renamedCount++;
  }
  // New format
  if (issue.make && modelRenames[issue.model]) {
    const oldModel = issue.model;
    issue.model = modelRenames[oldModel];
    console.log('Renamed issue model: ' + issue.id + ' (' + oldModel + ' -> ' + modelRenames[oldModel] + ')');
    renamedCount++;
  }
});

fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));
console.log('\nRenamed ' + renamedCount + ' issue model names to match YMMT\n');

// ============================================================
// FIX 2: YMMT year gaps
// ============================================================
const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let addedCount = 0;

function addEntry(year, make, model, trims) {
  const yearStr = year.toString();
  if (!ymmt[yearStr]) ymmt[yearStr] = {};
  if (!ymmt[yearStr][make]) ymmt[yearStr][make] = {};
  if (!ymmt[yearStr][make][model]) {
    ymmt[yearStr][make][model] = trims;
    addedCount++;
    return true;
  }
  return false;
}

// --- AUDI ---
console.log('=== AUDI FIXES ===');

// A4 missing 2020
if (addEntry(2020, 'Audi', 'A4', ['Premium', 'Premium Plus', 'Prestige', 'S4'])) {
  console.log('  Added 2020 Audi A4');
}

// RS6 missing 2020 (first US model year for C8 RS6 Avant)
if (addEntry(2020, 'Audi', 'RS6', ['Avant'])) {
  console.log('  Added 2020 Audi RS6');
}

// --- BMW ---
console.log('\n=== BMW FIXES ===');

// M5 missing 2017
if (addEntry(2017, 'BMW', 'M5', ['DCT'])) {
  console.log('  Added 2017 BMW M5');
}

// X5 M missing 2014, 2019
if (addEntry(2014, 'BMW', 'X5 M', ['S63 4.4L V8'])) {
  console.log('  Added 2014 BMW X5 M');
}
if (addEntry(2019, 'BMW', 'X5 M', ['S63 4.4L V8'])) {
  console.log('  Added 2019 BMW X5 M');
}

// 6 Series missing 2011
if (addEntry(2011, 'BMW', '6 Series', ['640i', '650i'])) {
  console.log('  Added 2011 BMW 6 Series');
}

// X6 missing 2024
if (addEntry(2024, 'BMW', 'X6', ['xDrive40i', 'M50i'])) {
  console.log('  Added 2024 BMW X6');
}

// X7 missing 2024-2025
for (let year = 2024; year <= 2025; year++) {
  if (addEntry(year, 'BMW', 'X7', ['xDrive40i', 'xDrive50i', 'M60i'])) {
    console.log('  Added ' + year + ' BMW X7');
  }
}

// --- CHEVROLET ---
console.log('\n=== CHEVROLET FIXES ===');

// Camaro: missing 2010-2023 (5th gen 2010-2015, 6th gen 2016-2023)
// 5th gen trims
for (let year = 2010; year <= 2015; year++) {
  if (addEntry(year, 'Chevrolet', 'Camaro', ['LS', 'LT', 'SS', 'ZL1', 'Z/28'])) {
    console.log('  Added ' + year + ' Chevrolet Camaro');
  }
}
// 6th gen trims
for (let year = 2016; year <= 2023; year++) {
  if (addEntry(year, 'Chevrolet', 'Camaro', ['1LS', '1LT', '2LT', '3LT', '1SS', '2SS', 'ZL1'])) {
    console.log('  Added ' + year + ' Chevrolet Camaro');
  }
}

// Equinox missing 2022
if (addEntry(2022, 'Chevrolet', 'Equinox', ['LS', 'LT', 'Premier', 'RS'])) {
  console.log('  Added 2022 Chevrolet Equinox');
}

// Colorado missing 2020-2022
for (let year = 2020; year <= 2022; year++) {
  if (addEntry(year, 'Chevrolet', 'Colorado', ['Base', 'LT', 'Z71', 'ZR2'])) {
    console.log('  Added ' + year + ' Chevrolet Colorado');
  }
}

// Malibu missing many years (2016-2019, 2021-2024)
for (let year = 2016; year <= 2019; year++) {
  if (addEntry(year, 'Chevrolet', 'Malibu', ['L', 'LS', 'LT', 'Premier', 'Hybrid'])) {
    console.log('  Added ' + year + ' Chevrolet Malibu');
  }
}
for (let year = 2021; year <= 2024; year++) {
  if (addEntry(year, 'Chevrolet', 'Malibu', ['LS', 'RS', 'LT', 'Premier'])) {
    console.log('  Added ' + year + ' Chevrolet Malibu');
  }
}

// Traverse missing 2009-2023, 2025
for (let year = 2009; year <= 2017; year++) {
  if (addEntry(year, 'Chevrolet', 'Traverse', ['LS', 'LT', 'LTZ'])) {
    console.log('  Added ' + year + ' Chevrolet Traverse');
  }
}
for (let year = 2018; year <= 2023; year++) {
  if (addEntry(year, 'Chevrolet', 'Traverse', ['L', 'LS', 'LT', 'RS', 'Premier', 'High Country'])) {
    console.log('  Added ' + year + ' Chevrolet Traverse');
  }
}
if (addEntry(2025, 'Chevrolet', 'Traverse', ['LS', 'LT', 'RS', 'Premier', 'High Country'])) {
  console.log('  Added 2025 Chevrolet Traverse');
}

// --- CHRYSLER ---
console.log('\n=== CHRYSLER FIXES ===');

// Sebring missing 1996-2000
for (let year = 1996; year <= 2000; year++) {
  if (addEntry(year, 'Chrysler', 'Sebring', ['LX', 'LXi', 'JX', 'JXi', 'Convertible'])) {
    console.log('  Added ' + year + ' Chrysler Sebring');
  }
}

// --- DODGE ---
console.log('\n=== DODGE FIXES ===');

// Challenger, Charger, Durango all missing 2020
if (addEntry(2020, 'Dodge', 'Challenger', ['SXT', 'GT', 'R/T', 'Scat Pack', 'SRT Hellcat'])) {
  console.log('  Added 2020 Dodge Challenger');
}
if (addEntry(2020, 'Dodge', 'Charger', ['SXT', 'GT', 'R/T', 'Scat Pack', 'SRT Hellcat'])) {
  console.log('  Added 2020 Dodge Charger');
}
if (addEntry(2020, 'Dodge', 'Durango', ['SXT', 'GT', 'R/T', 'Citadel', 'SRT'])) {
  console.log('  Added 2020 Dodge Durango');
}

// ============================================================
// FIX 3: 2025 model year coverage for all completed makes
// ============================================================
console.log('\n=== 2025 MODEL YEAR ADDITIONS ===');

// --- Audi 2025 ---
// Note: Audi renamed A4->A5, A5->A5 Sportback for 2025. Keep legacy names for consistency with issues DB.
const audi2025Models = {
  'A3': ['Premium', 'Premium Plus', 'Prestige', 'S3'],
  'A4': ['Premium', 'Premium Plus', 'Prestige', 'S4'],
  'A5': ['Premium', 'Premium Plus', 'Prestige', 'S5'],
  'A6': ['Premium', 'Premium Plus', 'Prestige', 'S6'],
  'A7': ['Premium Plus', 'Prestige', 'S7'],
  'A8': ['L', 'L S8'],
  'Q3': ['Premium', 'Premium Plus', 'Prestige'],
  'Q5': ['Premium', 'Premium Plus', 'Prestige', 'SQ5'],
  'Q7': ['Premium', 'Premium Plus', 'Prestige', 'SQ7'],
  'Q8': ['Premium', 'Premium Plus', 'Prestige', 'SQ8'],
  'RS3': ['Sedan'],
  'RS5': ['Sportback'],
  'RS6': ['Avant'],
  'RS7': ['Sportback'],
  'RS Q8': ['Base'],
  'TT': ['Coupe', 'Roadster']
};
Object.entries(audi2025Models).forEach(([model, trims]) => {
  if (addEntry(2025, 'Audi', model, trims)) {
    console.log('  Added 2025 Audi ' + model);
  }
});

// --- BMW 2025 ---
const bmw2025Models = {
  '2 Series': ['228i', '230i', 'M235i', 'M240i'],
  '3 Series': ['330i', '330i xDrive', 'M340i', 'M340i xDrive'],
  '4 Series': ['430i', '430i xDrive', 'M440i', 'M440i xDrive'],
  '5 Series': ['530i', '530i xDrive', '540i', '540i xDrive'],
  '7 Series': ['740i', '760i xDrive'],
  '8 Series': ['840i', 'M850i xDrive'],
  'X1': ['xDrive28i', 'M35i'],
  'X2': ['xDrive28i', 'M35i'],
  'X3': ['xDrive30i', 'M50'],
  'X5': ['xDrive40i', 'xDrive50e', 'M60i'],
  'X6': ['xDrive40i', 'M50i'],
  'M2': ['Base'],
  'M3': ['Base', 'Competition', 'CS'],
  'M4': ['Base', 'Competition', 'CSL'],
  'M5': ['Base'],
  'M8': ['Competition Coupe', 'Competition Gran Coupe'],
  'X3 M': ['Competition'],
  'X5 M': ['Competition'],
  'X6 M': ['Competition'],
  'i4': ['eDrive35', 'eDrive40', 'xDrive40', 'M50'],
  'i5': ['eDrive40', 'xDrive40', 'M60'],
  'i7': ['xDrive60', 'M70'],
  'iX': ['xDrive50', 'M60']
};
Object.entries(bmw2025Models).forEach(([model, trims]) => {
  if (addEntry(2025, 'BMW', model, trims)) {
    console.log('  Added 2025 BMW ' + model);
  }
});

// --- Cadillac 2025 (most already added, fill gaps) ---
// Already has CT4, CT5, Escalade, Lyriq, XT4, XT5, XT6

// --- Chevrolet 2025 (fill gaps) ---
// Already has Blazer, Corvette, Equinox, Malibu, Silverado 1500, Suburban, Tahoe, Trailblazer, Trax
// Add Colorado (returned for 2023+)
if (addEntry(2025, 'Chevrolet', 'Colorado', ['WT', 'LT', 'Z71', 'Trail Boss', 'ZR2'])) {
  console.log('  Added 2025 Chevrolet Colorado');
}

// --- Chrysler 2025 (already has Pacifica) ---
// 300 discontinued after 2023

// --- Dodge 2025 (already has Charger, Durango, Hornet) ---

// ============================================================
// FIX 4: 2026 model year coverage (current model year)
// ============================================================
console.log('\n=== 2026 MODEL YEAR ADDITIONS ===');

// --- Audi 2026 ---
const audi2026Models = {
  'A3': ['Premium', 'Premium Plus', 'Prestige', 'S3'],
  'A5': ['Premium', 'Premium Plus', 'Prestige', 'S5'],
  'A6': ['Premium', 'Premium Plus', 'Prestige', 'S6'],
  'A7': ['Premium Plus', 'Prestige', 'S7'],
  'Q3': ['Premium', 'Premium Plus', 'Prestige'],
  'Q5': ['Premium', 'Premium Plus', 'Prestige', 'SQ5'],
  'Q7': ['Premium', 'Premium Plus', 'Prestige', 'SQ7'],
  'Q8': ['Premium', 'Premium Plus', 'Prestige', 'SQ8'],
  'RS5': ['Sportback'],
  'RS6': ['Avant'],
  'RS7': ['Sportback'],
  'RS Q8': ['Base']
};
Object.entries(audi2026Models).forEach(([model, trims]) => {
  if (addEntry(2026, 'Audi', model, trims)) {
    console.log('  Added 2026 Audi ' + model);
  }
});

// --- BMW 2026 ---
const bmw2026Models = {
  '2 Series': ['230i', 'M240i'],
  '3 Series': ['330i', '330i xDrive', 'M340i', 'M340i xDrive'],
  '4 Series': ['430i', 'M440i'],
  '5 Series': ['530i', '530i xDrive', '540i'],
  '7 Series': ['740i', '760i xDrive'],
  'X1': ['xDrive28i', 'M35i'],
  'X2': ['xDrive28i', 'M35i'],
  'X3': ['xDrive30i', 'M50'],
  'X5': ['xDrive40i', 'xDrive50e', 'M60i'],
  'X6': ['xDrive40i', 'M50i'],
  'X7': ['xDrive40i', 'M60i'],
  'M2': ['Base'],
  'M3': ['Base', 'Competition'],
  'M4': ['Base', 'Competition'],
  'M5': ['Base'],
  'i4': ['eDrive35', 'eDrive40', 'M50'],
  'i5': ['eDrive40', 'M60'],
  'i7': ['xDrive60', 'M70'],
  'iX': ['xDrive50', 'M60'],
  'Z4': ['sDrive30i', 'M40i']
};
Object.entries(bmw2026Models).forEach(([model, trims]) => {
  if (addEntry(2026, 'BMW', model, trims)) {
    console.log('  Added 2026 BMW ' + model);
  }
});

// --- Cadillac 2026 ---
const cadillac2026Models = {
  'CT4': ['Luxury', 'Sport', 'Premium Luxury', 'V-Series', 'V-Series Blackwing'],
  'CT5': ['Luxury', 'Sport', 'Premium Luxury', 'V-Series', 'V-Series Blackwing'],
  'Escalade': ['Luxury', 'Premium Luxury', 'Sport', 'V-Series'],
  'XT4': ['Luxury', 'Sport', 'Premium Luxury'],
  'XT5': ['Luxury', 'Sport', 'Premium Luxury'],
  'XT6': ['Luxury', 'Sport', 'Premium Luxury'],
  'Lyriq': ['Tech', 'Luxury']
};
Object.entries(cadillac2026Models).forEach(([model, trims]) => {
  if (addEntry(2026, 'Cadillac', model, trims)) {
    console.log('  Added 2026 Cadillac ' + model);
  }
});

// --- Chevrolet 2026 ---
const chevy2026Models = {
  'Silverado 1500': ['WT', 'Custom', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'High Country'],
  'Colorado': ['WT', 'LT', 'Z71', 'Trail Boss', 'ZR2'],
  'Equinox': ['LT', 'RS', 'Activ'],
  'Tahoe': ['LS', 'LT', 'RST', 'Z71', 'Premier', 'High Country'],
  'Suburban': ['LS', 'LT', 'RST', 'Z71', 'Premier', 'High Country'],
  'Corvette': ['1LT', '2LT', '3LT', '1LZ', '2LZ', '3LZ'],
  'Blazer': ['LT', 'RS', 'Premier'],
  'Trailblazer': ['LS', 'LT', 'Activ', 'RS'],
  'Trax': ['LS', 'LT', 'Activ', 'RS'],
  'Traverse': ['LS', 'LT', 'RS', 'Premier', 'High Country']
};
Object.entries(chevy2026Models).forEach(([model, trims]) => {
  if (addEntry(2026, 'Chevrolet', model, trims)) {
    console.log('  Added 2026 Chevrolet ' + model);
  }
});

// --- Chrysler 2026 ---
if (addEntry(2026, 'Chrysler', 'Pacifica', ['Touring', 'Touring L', 'Limited', 'Pinnacle', 'Hybrid'])) {
  console.log('  Added 2026 Chrysler Pacifica');
}

// --- Dodge 2026 ---
const dodge2026Models = {
  'Charger': ['Daytona R/T', 'Daytona Scat Pack', 'SIXPACK'],
  'Durango': ['SXT', 'GT', 'R/T', 'Citadel', 'SRT Hellcat'],
  'Hornet': ['GT', 'GT Plus', 'R/T', 'R/T Plus']
};
Object.entries(dodge2026Models).forEach(([model, trims]) => {
  if (addEntry(2026, 'Dodge', model, trims)) {
    console.log('  Added 2026 Dodge ' + model);
  }
});

// Sort models alphabetically within each make for each year
Object.keys(ymmt).forEach(year => {
  ['Audi', 'BMW', 'Chevrolet', 'Chrysler', 'Dodge'].forEach(make => {
    if (ymmt[year][make]) {
      const sorted = {};
      Object.keys(ymmt[year][make]).sort().forEach(model => {
        sorted[model] = ymmt[year][make][model];
      });
      ymmt[year][make] = sorted;
    }
  });
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nAdded ' + addedCount + ' YMMT entries across all makes');
console.log('\n=== SUMMARY ===');
console.log('Model renames in issues: ' + renamedCount);
console.log('YMMT entries added: ' + addedCount);
