const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Audi RS Models
const rsModels = {
  'RS3': {
    '2015-2023': ['Premium Plus', 'Prestige']
  },
  'RS4': {
    '2018-2023': ['Avant']
  },
  'RS5': {
    '2018-2023': ['Coupe', 'Sportback']
  },
  'RS6': {
    '2021-2023': ['Avant']
  },
  'RS7': {
    '2014-2023': ['Prestige', 'Performance']
  },
  'RS Q8': {
    '2020-2023': ['Prestige']
  }
};

function addModelToYear(year, model, trims) {
  if (!ymmt[year]) {
    ymmt[year] = {};
  }
  if (!ymmt[year].Audi) {
    ymmt[year].Audi = {};
  }
  if (!ymmt[year].Audi[model]) {
    ymmt[year].Audi[model] = trims;
    return true;
  }
  return false;
}

let addedCount = 0;

// Add all RS models
Object.entries(rsModels).forEach(([model, yearRanges]) => {
  console.log(`\nAdding Audi ${model}...`);
  Object.entries(yearRanges).forEach(([range, trims]) => {
    const [startYear, endYear] = range.split('-').map(Number);
    for (let year = startYear; year <= endYear; year++) {
      if (addModelToYear(year.toString(), model, trims)) {
        console.log(`  Added ${year} ${model}`);
        addedCount++;
      }
    }
  });
});

// Sort Audi models alphabetically for each year
Object.keys(ymmt).forEach(year => {
  if (ymmt[year].Audi) {
    const sortedAudi = {};
    Object.keys(ymmt[year].Audi).sort().forEach(model => {
      sortedAudi[model] = ymmt[year].Audi[model];
    });
    ymmt[year].Audi = sortedAudi;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

console.log(`\n✓ Successfully added ${addedCount} Audi RS model year/model combinations`);
