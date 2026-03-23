const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let landRoverCount = 0;
let jaguarCount = 0;

// ── Land Rover ──────────────────────────────────────────────────────────────

const landRoverModels = {
  'Range Rover': {
    years: [2000, 2026],
    trims: {
      '2000-2002': ['HSE', '4.6'],
      '2003-2012': ['HSE', 'Supercharged', 'Autobiography'],
      '2013-2022': ['HSE', 'Supercharged', 'Autobiography', 'SVAutobiography', 'LWB'],
      '2023-2026': ['SE', 'HSE', 'Autobiography', 'SV', 'LWB'],
    }
  },
  'Range Rover Sport': {
    years: [2006, 2026],
    trims: {
      '2006-2013': ['HSE', 'Supercharged'],
      '2014-2022': ['HSE', 'Supercharged', 'SVR', 'Autobiography'],
      '2023-2026': ['SE', 'Dynamic SE', 'Autobiography', 'SVR'],
    }
  },
  'Range Rover Evoque': {
    years: [2012, 2026],
    trims: {
      '2012-2019': ['Pure', 'Prestige', 'Dynamic', 'Autobiography'],
      '2020-2026': ['Base', 'S', 'SE', 'R-Dynamic'],
    }
  },
  'Range Rover Velar': {
    years: [2018, 2026],
    trims: {
      '2018-2026': ['S', 'SE', 'R-Dynamic SE', 'R-Dynamic HSE'],
    }
  },
  'Discovery': {
    years: [2005, 2026],
    trims: {
      '2005-2009': ['SE', 'HSE'],          // LR3
      '2010-2016': ['SE', 'HSE', 'HSE Luxury'], // LR4
      '2017-2026': ['SE', 'HSE', 'HSE Luxury'], // Discovery 5
    }
  },
  'Discovery Sport': {
    years: [2015, 2026],
    trims: {
      '2015-2019': ['SE', 'HSE', 'HSE Luxury'],
      '2020-2026': ['Base', 'S', 'SE', 'R-Dynamic'],
    }
  },
  'Freelander': {
    years: [2002, 2015],
    trims: {
      '2002-2005': ['SE', 'HSE'],
      '2006-2015': ['SE', 'HSE'],
    }
  },
  'Defender': {
    years: [2020, 2026],  // new gen only (classic had production gap)
    trims: {
      '2020-2026': ['90', '110', '130', 'V8'],
    }
  },
};

// Also add classic Defender for 2000-2016 (limited production/import years)
// They were sold in US primarily 1993-1997 and briefly imported. Skip for US market accuracy.
// The new Defender 2020+ is the relevant one.

// ── Jaguar ──────────────────────────────────────────────────────────────────

const jaguarModels = {
  'S-TYPE': {
    years: [2000, 2008],
    trims: {
      '2000-2002': ['3.0', '4.0'],
      '2003-2008': ['3.0', '4.2', 'R'],
    }
  },
  'X-TYPE': {
    years: [2002, 2008],
    trims: {
      '2002-2008': ['2.5', '3.0'],
    }
  },
  'XJ': {
    years: [2000, 2019],
    trims: {
      '2000-2003': ['XJ8', 'XJR', 'Vanden Plas'],
      '2004-2009': ['XJ8', 'XJR', 'Super V8', 'Vanden Plas'],
      '2010-2019': ['XJ', 'XJL', 'XJR', 'Supercharged', 'Portfolio'],
    }
  },
  'XK': {
    years: [2000, 2015],
    trims: {
      '2000-2006': ['XK8', 'XKR'],
      '2007-2015': ['XK', 'XKR', 'XKR-S'],
    }
  },
  'XF': {
    years: [2009, 2026],
    trims: {
      '2009-2015': ['Base', 'Supercharged', 'XFR', 'XFR-S'],
      '2016-2026': ['25t', '30t', 'S', 'R-Sport'],
    }
  },
  'XE': {
    years: [2017, 2022],
    trims: {
      '2017-2022': ['25t', '30t', 'S', 'R-Dynamic'],
    }
  },
  'F-TYPE': {
    years: [2014, 2026],
    trims: {
      '2014-2019': ['Base', 'S', 'R', 'SVR'],
      '2020-2026': ['P300', 'P380', 'R', 'SVR'],
    }
  },
  'F-PACE': {
    years: [2017, 2026],
    trims: {
      '2017-2020': ['Base', '25t', '35t', 'S', 'SVR'],
      '2021-2026': ['P250', 'P340', 'P400', 'S', 'SVR'],
    }
  },
  'E-PACE': {
    years: [2018, 2026],
    trims: {
      '2018-2026': ['Base', 'S', 'SE', 'R-Dynamic'],
    }
  },
  'I-PACE': {
    years: [2019, 2026],
    trims: {
      '2019-2026': ['Base', 'S', 'SE', 'HSE'],
    }
  },
};

function getTrimsForYear(model, year) {
  for (const [range, trims] of Object.entries(model.trims)) {
    const [start, end] = range.split('-').map(Number);
    if (year >= start && year <= end) {
      return trims;
    }
  }
  return null;
}

function addMake(makeName, models) {
  let count = 0;
  for (const [modelName, config] of Object.entries(models)) {
    for (let year = config.years[0]; year <= config.years[1]; year++) {
      const yearStr = String(year);
      if (!ymmt[yearStr]) ymmt[yearStr] = {};
      if (!ymmt[yearStr][makeName]) ymmt[yearStr][makeName] = {};

      const trims = getTrimsForYear(config, year);
      if (trims) {
        ymmt[yearStr][makeName][modelName] = trims;
        count++;
      }
    }
  }
  return count;
}

landRoverCount = addMake('Land Rover', landRoverModels);
jaguarCount = addMake('Jaguar', jaguarModels);

// Sort keys: years numerically, makes alphabetically within each year
const sortedYmmt = {};
const sortedYears = Object.keys(ymmt).sort((a, b) => Number(a) - Number(b));
for (const year of sortedYears) {
  sortedYmmt[year] = {};
  const sortedMakes = Object.keys(ymmt[year]).sort();
  for (const make of sortedMakes) {
    sortedYmmt[year][make] = {};
    const sortedModels = Object.keys(ymmt[year][make]).sort();
    for (const model of sortedModels) {
      sortedYmmt[year][make][model] = ymmt[year][make][model];
    }
  }
}

fs.writeFileSync(ymmtPath, JSON.stringify(sortedYmmt, null, 2) + '\n', 'utf8');

console.log(`Land Rover: ${landRoverCount} year/model entries added`);
console.log(`Jaguar: ${jaguarCount} year/model entries added`);
console.log(`Total new entries: ${landRoverCount + jaguarCount}`);

// Count total makes now
const allMakes = new Set();
for (const year of Object.keys(sortedYmmt)) {
  for (const make of Object.keys(sortedYmmt[year])) {
    allMakes.add(make);
  }
}
console.log(`Total makes in YMMT: ${allMakes.size}`);
console.log('Makes:', [...allMakes].sort().join(', '));
