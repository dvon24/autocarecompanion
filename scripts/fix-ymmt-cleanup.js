const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let fixed = 0;

// Fix "Ram" -> "RAM" casing inconsistency
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Ram) {
    if (!ymmt[year].RAM) ymmt[year].RAM = {};
    Object.keys(ymmt[year].Ram).forEach(function(model) {
      if (!ymmt[year].RAM[model]) {
        ymmt[year].RAM[model] = ymmt[year].Ram[model];
        fixed++;
        console.log('Moved Ram -> RAM: ' + year + ' ' + model);
      }
    });
    delete ymmt[year].Ram;
  }
});

// Remove orphaned Tesla entries (no issues in DB)
Object.keys(ymmt).forEach(function(year) {
  if (ymmt[year].Tesla) {
    console.log('Removing orphaned Tesla YMMT: ' + year + ' - ' + Object.keys(ymmt[year].Tesla).join(', '));
    delete ymmt[year].Tesla;
    fixed++;
  }
});

fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
console.log('\nFixed ' + fixed + ' YMMT entries');
