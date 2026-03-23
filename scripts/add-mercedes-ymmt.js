const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let totalEntries = 0;

function addModel(year, model, trims) {
  const y = String(year);
  if (!ymmt[y]) ymmt[y] = {};
  if (!ymmt[y]['Mercedes-Benz']) ymmt[y]['Mercedes-Benz'] = {};
  ymmt[y]['Mercedes-Benz'][model] = trims;
  totalEntries++;
}

// C-Class
// W203 (2001-2007)
for (let y = 2001; y <= 2004; y++) addModel(y, 'C-Class', ['C 230', 'C 240', 'C 320', 'C 32 AMG']);
for (let y = 2005; y <= 2007; y++) addModel(y, 'C-Class', ['C 230', 'C 280', 'C 350', 'C 55 AMG']);
// W204 (2008-2014)
for (let y = 2008; y <= 2011; y++) addModel(y, 'C-Class', ['C 300', 'C 300 4MATIC', 'C 350', 'C 63 AMG']);
for (let y = 2012; y <= 2014; y++) addModel(y, 'C-Class', ['C 250', 'C 300', 'C 300 4MATIC', 'C 350', 'C 63 AMG']);
// W205 (2015-2021)
for (let y = 2015; y <= 2018; y++) addModel(y, 'C-Class', ['C 300', 'C 300 4MATIC', 'C 400', 'AMG C 43', 'AMG C 63', 'AMG C 63 S']);
for (let y = 2019; y <= 2021; y++) addModel(y, 'C-Class', ['C 300', 'C 300 4MATIC', 'AMG C 43', 'AMG C 63', 'AMG C 63 S']);
// W206 (2022+)
for (let y = 2022; y <= 2026; y++) addModel(y, 'C-Class', ['C 300', 'C 300 4MATIC', 'AMG C 43', 'AMG C 63 S E Performance']);

// E-Class
// W210 (2000-2002)
for (let y = 2000; y <= 2002; y++) addModel(y, 'E-Class', ['E 320', 'E 430', 'E 55 AMG']);
// W211 (2003-2009)
for (let y = 2003; y <= 2006; y++) addModel(y, 'E-Class', ['E 320', 'E 500', 'E 55 AMG']);
for (let y = 2007; y <= 2009; y++) addModel(y, 'E-Class', ['E 320', 'E 350', 'E 550', 'E 63 AMG']);
// W212 (2010-2016)
for (let y = 2010; y <= 2013; y++) addModel(y, 'E-Class', ['E 350', 'E 550', 'E 63 AMG']);
for (let y = 2014; y <= 2016; y++) addModel(y, 'E-Class', ['E 250', 'E 350', 'E 400', 'E 550', 'E 63 AMG S']);
// W213 (2017-2023)
for (let y = 2017; y <= 2020; y++) addModel(y, 'E-Class', ['E 300', 'E 400', 'E 450', 'AMG E 53', 'AMG E 63 S']);
for (let y = 2021; y <= 2023; y++) addModel(y, 'E-Class', ['E 350', 'E 450', 'AMG E 53', 'AMG E 63 S']);
// W214 (2024+)
for (let y = 2024; y <= 2026; y++) addModel(y, 'E-Class', ['E 350', 'E 450 4MATIC', 'AMG E 53']);

// S-Class
// W220 (2000-2006)
for (let y = 2000; y <= 2002; y++) addModel(y, 'S-Class', ['S 430', 'S 500', 'S 55 AMG', 'S 600']);
for (let y = 2003; y <= 2006; y++) addModel(y, 'S-Class', ['S 430', 'S 500', 'S 55 AMG', 'S 600', 'S 65 AMG']);
// W221 (2007-2013)
for (let y = 2007; y <= 2009; y++) addModel(y, 'S-Class', ['S 550', 'S 600', 'S 63 AMG', 'S 65 AMG']);
for (let y = 2010; y <= 2013; y++) addModel(y, 'S-Class', ['S 400 Hybrid', 'S 550', 'S 600', 'S 63 AMG', 'S 65 AMG']);
// W222 (2014-2020)
for (let y = 2014; y <= 2017; y++) addModel(y, 'S-Class', ['S 550', 'S 550e', 'S 600', 'S 63 AMG', 'S 65 AMG']);
for (let y = 2018; y <= 2020; y++) addModel(y, 'S-Class', ['S 450', 'S 560', 'S 63 AMG', 'S 65 AMG']);
// W223 (2021+)
for (let y = 2021; y <= 2026; y++) addModel(y, 'S-Class', ['S 500', 'S 580', 'S 580 4MATIC', 'AMG S 63 E Performance']);

// M-Class / ML (2000-2015)
for (let y = 2000; y <= 2001; y++) addModel(y, 'M-Class', ['ML 320', 'ML 430', 'ML 55 AMG']);
for (let y = 2002; y <= 2005; y++) addModel(y, 'M-Class', ['ML 320', 'ML 350', 'ML 500', 'ML 55 AMG']);
for (let y = 2006; y <= 2008; y++) addModel(y, 'M-Class', ['ML 350', 'ML 500', 'ML 63 AMG']);
for (let y = 2009; y <= 2011; y++) addModel(y, 'M-Class', ['ML 350', 'ML 550', 'ML 63 AMG']);
for (let y = 2012; y <= 2015; y++) addModel(y, 'M-Class', ['ML 350', 'ML 400', 'ML 550', 'ML 63 AMG']);

// GLE (2016+, replaced M-Class)
for (let y = 2016; y <= 2019; y++) addModel(y, 'GLE', ['GLE 350', 'GLE 400', 'GLE 550e', 'AMG GLE 43', 'AMG GLE 63', 'AMG GLE 63 S']);
for (let y = 2020; y <= 2023; y++) addModel(y, 'GLE', ['GLE 350', 'GLE 450', 'GLE 580', 'AMG GLE 53', 'AMG GLE 63 S']);
for (let y = 2024; y <= 2026; y++) addModel(y, 'GLE', ['GLE 350', 'GLE 450 4MATIC', 'GLE 580', 'AMG GLE 53', 'AMG GLE 63 S']);

// GLC (2016+)
for (let y = 2016; y <= 2019; y++) addModel(y, 'GLC', ['GLC 300', 'GLC 300 4MATIC', 'GLC 350e', 'AMG GLC 43', 'AMG GLC 63', 'AMG GLC 63 S']);
for (let y = 2020; y <= 2022; y++) addModel(y, 'GLC', ['GLC 300', 'GLC 300 4MATIC', 'GLC 350e', 'AMG GLC 43', 'AMG GLC 63', 'AMG GLC 63 S']);
// X254 (2023+)
for (let y = 2023; y <= 2026; y++) addModel(y, 'GLC', ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43', 'AMG GLC 63 S E Performance']);

// GLA (2015+)
for (let y = 2015; y <= 2019; y++) addModel(y, 'GLA', ['GLA 250', 'GLA 250 4MATIC', 'AMG GLA 45']);
for (let y = 2020; y <= 2026; y++) addModel(y, 'GLA', ['GLA 250', 'GLA 250 4MATIC', 'AMG GLA 35', 'AMG GLA 45']);

// GLB (2020+)
for (let y = 2020; y <= 2026; y++) addModel(y, 'GLB', ['GLB 250', 'GLB 250 4MATIC', 'AMG GLB 35']);

// A-Class (2019-2022 US)
for (let y = 2019; y <= 2022; y++) addModel(y, 'A-Class', ['A 220', 'A 220 4MATIC', 'AMG A 35']);

// CLA (2014+)
for (let y = 2014; y <= 2019; y++) addModel(y, 'CLA', ['CLA 250', 'CLA 250 4MATIC', 'AMG CLA 45']);
for (let y = 2020; y <= 2026; y++) addModel(y, 'CLA', ['CLA 250', 'CLA 250 4MATIC', 'AMG CLA 35', 'AMG CLA 45']);

// GL (2007-2016) / GLS (2017+)
for (let y = 2007; y <= 2012; y++) addModel(y, 'GL-Class', ['GL 320 CDI', 'GL 450', 'GL 550']);
for (let y = 2013; y <= 2016; y++) addModel(y, 'GL-Class', ['GL 350', 'GL 450', 'GL 550', 'GL 63 AMG']);
for (let y = 2017; y <= 2019; y++) addModel(y, 'GLS', ['GLS 450', 'GLS 550', 'AMG GLS 63']);
for (let y = 2020; y <= 2026; y++) addModel(y, 'GLS', ['GLS 450', 'GLS 580', 'AMG GLS 63']);

// G-Class (2000+)
for (let y = 2000; y <= 2001; y++) addModel(y, 'G-Class', ['G 500']);
for (let y = 2002; y <= 2008; y++) addModel(y, 'G-Class', ['G 500', 'G 55 AMG']);
for (let y = 2009; y <= 2012; y++) addModel(y, 'G-Class', ['G 550', 'G 55 AMG']);
for (let y = 2013; y <= 2015; y++) addModel(y, 'G-Class', ['G 550', 'G 63 AMG']);
for (let y = 2016; y <= 2018; y++) addModel(y, 'G-Class', ['G 550', 'AMG G 63', 'AMG G 65']);
for (let y = 2019; y <= 2026; y++) addModel(y, 'G-Class', ['G 550', 'AMG G 63']);

// SL (2000+)
for (let y = 2000; y <= 2002; y++) addModel(y, 'SL-Class', ['SL 500', 'SL 600']);
for (let y = 2003; y <= 2006; y++) addModel(y, 'SL-Class', ['SL 500', 'SL 55 AMG', 'SL 600', 'SL 65 AMG']);
for (let y = 2007; y <= 2008; y++) addModel(y, 'SL-Class', ['SL 550', 'SL 55 AMG', 'SL 600', 'SL 65 AMG']);
for (let y = 2009; y <= 2012; y++) addModel(y, 'SL-Class', ['SL 550', 'SL 63 AMG', 'SL 600', 'SL 65 AMG']);
for (let y = 2013; y <= 2020; y++) addModel(y, 'SL-Class', ['SL 450', 'SL 550', 'AMG SL 63', 'AMG SL 65']);
for (let y = 2022; y <= 2026; y++) addModel(y, 'SL-Class', ['AMG SL 43', 'AMG SL 55', 'AMG SL 63']);
// No 2021 SL (gap year between R231 and R232)

// CLS (2006+)
for (let y = 2006; y <= 2010; y++) addModel(y, 'CLS-Class', ['CLS 500', 'CLS 550', 'CLS 55 AMG', 'CLS 63 AMG']);
for (let y = 2011; y <= 2014; y++) addModel(y, 'CLS-Class', ['CLS 550', 'CLS 63 AMG']);
for (let y = 2015; y <= 2018; y++) addModel(y, 'CLS-Class', ['CLS 400', 'CLS 550', 'AMG CLS 63 S']);
for (let y = 2019; y <= 2024; y++) addModel(y, 'CLS-Class', ['CLS 450', 'CLS 450 4MATIC', 'AMG CLS 53']);

// SLK (2000-2016) / SLC (2017-2020)
for (let y = 2000; y <= 2004; y++) addModel(y, 'SLK-Class', ['SLK 230', 'SLK 320', 'SLK 32 AMG']);
for (let y = 2005; y <= 2008; y++) addModel(y, 'SLK-Class', ['SLK 280', 'SLK 350', 'SLK 55 AMG']);
for (let y = 2009; y <= 2011; y++) addModel(y, 'SLK-Class', ['SLK 300', 'SLK 350', 'SLK 55 AMG']);
for (let y = 2012; y <= 2016; y++) addModel(y, 'SLK-Class', ['SLK 250', 'SLK 350', 'AMG SLK 55']);
for (let y = 2017; y <= 2020; y++) addModel(y, 'SLC', ['SLC 300', 'AMG SLC 43']);

// GLK (2010-2015)
for (let y = 2010; y <= 2015; y++) addModel(y, 'GLK-Class', ['GLK 250', 'GLK 350']);

// EQS (2022+)
for (let y = 2022; y <= 2026; y++) addModel(y, 'EQS', ['EQS 450+', 'EQS 450 4MATIC', 'EQS 580 4MATIC', 'AMG EQS']);

// EQE (2023+)
for (let y = 2023; y <= 2026; y++) addModel(y, 'EQE', ['EQE 350+', 'EQE 350 4MATIC', 'EQE 500 4MATIC', 'AMG EQE']);

// EQB (2022+)
for (let y = 2022; y <= 2026; y++) addModel(y, 'EQB', ['EQB 250+', 'EQB 300 4MATIC', 'EQB 350 4MATIC']);

// AMG GT (2016+)
for (let y = 2016; y <= 2019; y++) addModel(y, 'AMG GT', ['AMG GT', 'AMG GT S', 'AMG GT C', 'AMG GT R']);
for (let y = 2019; y <= 2023; y++) addModel(y, 'AMG GT 4-Door', ['AMG GT 53', 'AMG GT 63', 'AMG GT 63 S']);
for (let y = 2020; y <= 2021; y++) addModel(y, 'AMG GT', ['AMG GT', 'AMG GT C', 'AMG GT R', 'AMG GT R Pro']);
// New R192 (2024+)
for (let y = 2024; y <= 2026; y++) addModel(y, 'AMG GT', ['AMG GT 43', 'AMG GT 55', 'AMG GT 63']);

// Maybach S-Class (2016+)
for (let y = 2016; y <= 2020; y++) addModel(y, 'Mercedes-Maybach S-Class', ['S 550', 'S 600', 'S 650']);
for (let y = 2021; y <= 2026; y++) addModel(y, 'Mercedes-Maybach S-Class', ['S 580', 'S 680']);

// Sprinter (2010+)
for (let y = 2010; y <= 2018; y++) addModel(y, 'Sprinter', ['2500', '3500']);
for (let y = 2019; y <= 2026; y++) addModel(y, 'Sprinter', ['1500', '2500', '3500', '4500']);

// Metris (2016-2023)
for (let y = 2016; y <= 2023; y++) addModel(y, 'Metris', ['Cargo', 'Passenger']);

// B-Class Electric (2014-2017 US)
for (let y = 2014; y <= 2017; y++) addModel(y, 'B-Class', ['B 250e']);

// EQS SUV (2023+)
for (let y = 2023; y <= 2026; y++) addModel(y, 'EQS SUV', ['EQS 450+', 'EQS 450 4MATIC', 'EQS 580 4MATIC']);

// EQE SUV (2024+)
for (let y = 2024; y <= 2026; y++) addModel(y, 'EQE SUV', ['EQE 350+', 'EQE 350 4MATIC', 'AMG EQE SUV']);

// Sort keys within each year for consistency
for (const year of Object.keys(ymmt)) {
  if (ymmt[year]['Mercedes-Benz']) {
    const sorted = {};
    for (const model of Object.keys(ymmt[year]['Mercedes-Benz']).sort()) {
      sorted[model] = ymmt[year]['Mercedes-Benz'][model];
    }
    ymmt[year]['Mercedes-Benz'] = sorted;
  }
}

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));

// Count stats
let modelYearCount = 0;
let modelNames = new Set();
for (const year of Object.keys(ymmt)) {
  if (ymmt[year]['Mercedes-Benz']) {
    for (const model of Object.keys(ymmt[year]['Mercedes-Benz'])) {
      modelYearCount++;
      modelNames.add(model);
    }
  }
}

console.log(`Mercedes-Benz YMMT data added successfully!`);
console.log(`Unique models: ${modelNames.size}`);
console.log(`Model-year entries: ${modelYearCount}`);
console.log(`Models: ${[...modelNames].sort().join(', ')}`);
