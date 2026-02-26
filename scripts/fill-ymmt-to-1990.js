const fs = require('fs');
const path = require('path');

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

let added = 0;

// Helper: ensure year/make/model exists with trims
function addEntry(year, make, model, trims) {
  var y = String(year);
  if (!ymmt[y]) ymmt[y] = {};
  if (!ymmt[y][make]) ymmt[y][make] = {};
  if (!ymmt[y][make][model]) {
    ymmt[y][make][model] = trims || ['Base'];
    added++;
  }
}

// Helper: add range of years for a model
function addRange(make, model, startYear, endYear, trims) {
  for (var y = startYear; y <= endYear; y++) {
    addEntry(y, make, model, trims);
  }
}

// ============================================================
// AUDI - extend existing + add 90s models
// ============================================================
// A4: US market from 1996 (B5), currently 2009+
addRange('Audi', 'A4', 1996, 2008, ['Base', '1.8T', '2.8', '3.0']);
// A6: US market from 1995 (C4), currently 2005+
addRange('Audi', 'A6', 1995, 2004, ['Base', '2.8', '4.2']);
// A8: US market from 1997 (D2), currently 2011+
addRange('Audi', 'A8', 1997, 2010, ['Base', '4.2', 'L']);
// TT: US market from 2000 (Mk1), currently 2008+
addRange('Audi', 'TT', 2000, 2007, ['Base', '1.8T', '3.2']);
// A3: US market from 2006, currently 2010+
addRange('Audi', 'A3', 2006, 2009, ['Base', '2.0T', '3.2']);
// 90s Audi models
addRange('Audi', '90', 1990, 1995, ['Base', 'CS', 'Sport']);
addRange('Audi', '100', 1990, 1994, ['Base', 'CS', 'S']);
addRange('Audi', 'Cabriolet', 1994, 1998, ['Base']);
addRange('Audi', 'S4', 2000, 2008, ['Base']);
addRange('Audi', 'S6', 2002, 2004, ['Base']);
addRange('Audi', 'A4 Avant', 1998, 2008, ['Base', '1.8T', '2.8']);

// ============================================================
// BMW - extend existing + add 90s models
// ============================================================
// 3 Series: E30 ended 1991, E36 1992-1998, E46 1999+
addRange('BMW', '3 Series', 1990, 2005, ['318i', '325i', '328i', '330i']);
// 5 Series: E34 1990-1996, E39 1997-2003
addRange('BMW', '5 Series', 1990, 2003, ['525i', '530i', '540i']);
// 7 Series: E32 1990-1994, E38 1995-2001
addRange('BMW', '7 Series', 1990, 2001, ['740i', '740iL', '750iL']);
// M3: E36 M3 1995-1999, E46 M3 2001+
addRange('BMW', 'M3', 1995, 2000, ['Base']);
// M5: E34 M5 1990-1993, E39 M5 2000-2003
addRange('BMW', 'M5', 1990, 1993, ['Base']);
addRange('BMW', 'M5', 2000, 2005, ['Base']);
// Z3: 1996-2002
addRange('BMW', 'Z3', 1996, 2002, ['2.3', '2.5i', '2.8', '3.0i', 'M']);
// Z4: currently 2003+, that's fine
// X5: currently 2000+, that's fine
// 8 Series original: 1991-1997
addRange('BMW', '8 Series', 1991, 1997, ['840Ci', '850Ci', '850CSi']);
// 1 Series extend back
addRange('BMW', '1 Series', 2004, 2007, ['128i', '135i']);

// ============================================================
// CADILLAC - extend to 1990
// ============================================================
addRange('Cadillac', 'DeVille', 1990, 1993, ['Base', 'Concours']);
addRange('Cadillac', 'Eldorado', 1990, 1992, ['Base', 'Touring']);
addRange('Cadillac', 'Seville', 1990, 1997, ['SLS', 'STS']);
addRange('Cadillac', 'Fleetwood', 1990, 1996, ['Base', 'Brougham']);
addRange('Cadillac', 'Allante', 1990, 1993, ['Base']);
addRange('Cadillac', 'Catera', 1997, 2001, ['Base', 'Sport']);

// ============================================================
// CHEVROLET - extend to 1990
// ============================================================
addRange('Chevrolet', 'Corvette', 1990, 1996, ['Base', 'ZR-1']);
addRange('Chevrolet', 'Camaro', 1990, 2002, ['Base', 'RS', 'Z28', 'SS']);
addRange('Chevrolet', 'Suburban', 1992, 1999, ['1500', '2500']);
addRange('Chevrolet', 'Tahoe', 1995, 1999, ['Base', 'LS', 'LT']);
addRange('Chevrolet', 'S-10', 1990, 2004, ['Base', 'LS', 'ZR2']);
addRange('Chevrolet', 'Blazer S-10', 1990, 2005, ['Base', 'LS', 'LT', 'ZR2']);
addRange('Chevrolet', 'Silverado 1500', 1999, 2007, ['Base', 'LS', 'LT', 'Z71']);
addRange('Chevrolet', 'C/K 1500', 1990, 1998, ['Cheyenne', 'Silverado', 'WT']);
addRange('Chevrolet', 'C/K 2500', 1990, 2000, ['Cheyenne', 'Silverado', 'WT']);
addRange('Chevrolet', 'Impala', 1994, 1996, ['SS']);
addRange('Chevrolet', 'Impala', 2000, 2005, ['Base', 'LS', 'SS']);
addRange('Chevrolet', 'Malibu', 1997, 2015, ['Base', 'LS', 'LT']);
addRange('Chevrolet', 'Cavalier', 1990, 2005, ['Base', 'LS', 'Z24']);
addRange('Chevrolet', 'Lumina', 1990, 2001, ['Base', 'LS', 'LTZ']);
addRange('Chevrolet', 'Monte Carlo', 1995, 2007, ['LS', 'LT', 'SS']);
addRange('Chevrolet', 'Venture', 1997, 2005, ['Base', 'LS', 'LT']);
addRange('Chevrolet', 'Astro', 1990, 2005, ['Base', 'LS', 'LT']);
addRange('Chevrolet', 'Colorado', 2004, 2014, ['Base', 'LS', 'LT', 'Z71']);
addRange('Chevrolet', 'Equinox', 2005, 2007, ['LS', 'LT']);
addRange('Chevrolet', 'TrailBlazer', 2002, 2009, ['LS', 'LT', 'SS']);
addRange('Chevrolet', 'Cruze', 2011, 2011, ['LS', 'LT', 'LTZ']); // currently starts 2011, fine
addRange('Chevrolet', 'Traverse', 2009, 2009, ['LS', 'LT', 'LTZ']); // starts 2009, fine
addRange('Chevrolet', 'Spark', 2013, 2013, ['LS', 'LT']); // starts 2013, fine

// ============================================================
// CHRYSLER - extend to 1990
// ============================================================
addRange('Chrysler', 'Town & Country', 1990, 2000, ['Base', 'LX', 'LXi', 'Limited']);
addRange('Chrysler', 'Sebring', 1995, 1995, ['Base', 'LX', 'LXi']);
addRange('Chrysler', 'New Yorker', 1990, 1996, ['Base', 'Fifth Avenue']);
addRange('Chrysler', 'LHS', 1994, 2001, ['Base']);
addRange('Chrysler', 'Concorde', 1993, 2004, ['LX', 'LXi', 'Limited']);
addRange('Chrysler', 'Cirrus', 1995, 2000, ['LX', 'LXi']);
addRange('Chrysler', '300M', 1999, 2004, ['Base', 'Special']);
addRange('Chrysler', '300', 2004, 2004, ['Base', 'Touring', 'Limited', 'C']);

// ============================================================
// DODGE - extend to 1990
// ============================================================
addRange('Dodge', 'Dakota', 1990, 1996, ['Base', 'SLT', 'Sport']);
addRange('Dodge', 'Grand Caravan', 1990, 2000, ['Base', 'SE', 'SXT', 'Sport']);
addRange('Dodge', 'Neon', 1995, 1999, ['Base', 'Highline', 'Sport']);
addRange('Dodge', 'Intrepid', 1993, 2004, ['Base', 'ES', 'SE', 'SXT']);
addRange('Dodge', 'Stratus', 1995, 2006, ['Base', 'SE', 'SXT', 'R/T']);
addRange('Dodge', 'Avenger', 1995, 2000, ['Base', 'ES']);
addRange('Dodge', 'Ram Van', 1990, 2003, ['1500', '2500', '3500']);
addRange('Dodge', 'Ram 1500', 1990, 2008, ['Base', 'SLT', 'Laramie', 'Sport']);
addRange('Dodge', 'Ram 2500', 1994, 2009, ['Base', 'SLT', 'Laramie']);
addRange('Dodge', 'Ram 3500', 1994, 2009, ['Base', 'SLT', 'Laramie']);
addRange('Dodge', 'Durango', 1998, 1998, ['SLT', 'R/T']); // already 1998+
addRange('Dodge', 'Stealth', 1991, 1996, ['Base', 'ES', 'R/T']);
addRange('Dodge', 'Shadow', 1990, 1994, ['Base', 'ES']);
addRange('Dodge', 'Spirit', 1990, 1995, ['Base', 'ES', 'R/T']);

// ============================================================
// FORD - extend to 1990 (biggest gap)
// ============================================================
addRange('Ford', 'F-150', 1990, 2007, ['XL', 'XLT', 'Lariat', 'King Ranch']);
addRange('Ford', 'F-250 Super Duty', 1999, 2010, ['XL', 'XLT', 'Lariat', 'King Ranch']);
addRange('Ford', 'F-250', 1990, 1998, ['XL', 'XLT']);
addRange('Ford', 'F-350', 1990, 1998, ['XL', 'XLT']);
addRange('Ford', 'Explorer', 1991, 2007, ['XL', 'XLT', 'Eddie Bauer', 'Limited']);
addRange('Ford', 'Mustang', 1990, 2007, ['Base', 'GT', 'Cobra', 'Mach 1']);
addRange('Ford', 'Taurus', 1990, 2019, ['SE', 'SEL', 'SHO', 'Limited']);
addRange('Ford', 'Ranger', 1990, 2011, ['XL', 'XLT', 'Sport', 'FX4']);
addRange('Ford', 'Escape', 2001, 2012, ['XLS', 'XLT', 'Limited']);
addRange('Ford', 'Expedition', 1997, 2002, ['XLT', 'Eddie Bauer', 'King Ranch']);
addRange('Ford', 'Focus', 2000, 2011, ['S', 'SE', 'SEL', 'Titanium']);
addRange('Ford', 'Fusion', 2006, 2012, ['S', 'SE', 'SEL', 'Sport']);
addRange('Ford', 'Crown Victoria', 1992, 2011, ['Base', 'LX', 'Police Interceptor']);
addRange('Ford', 'Windstar', 1995, 2003, ['Base', 'LX', 'SE', 'SEL']);
addRange('Ford', 'Freestar', 2004, 2007, ['S', 'SE', 'SEL', 'Limited']);
addRange('Ford', 'Escort', 1990, 2003, ['Base', 'LX', 'ZX2']);
addRange('Ford', 'Contour', 1995, 2000, ['GL', 'LX', 'SE', 'SVT']);
addRange('Ford', 'Thunderbird', 1990, 1997, ['Base', 'LX', 'Super Coupe']);
addRange('Ford', 'Thunderbird', 2002, 2005, ['Base', 'Deluxe']);
addRange('Ford', 'Excursion', 2000, 2005, ['XLT', 'Eddie Bauer', 'Limited']);
addRange('Ford', 'Edge', 2007, 2007, ['SE', 'SEL', 'Limited']); // already 2007+
addRange('Ford', 'Bronco', 1990, 1996, ['XL', 'XLT', 'Eddie Bauer']);
addRange('Ford', 'Probe', 1990, 1997, ['GL', 'LX', 'GT']);
addRange('Ford', 'Explorer Sport Trac', 2001, 2010, ['XLS', 'XLT', 'Limited']);

// ============================================================
// GMC - extend to 1990
// ============================================================
addRange('GMC', 'Sierra 1500', 1999, 2006, ['Base', 'SLE', 'SLT', 'Denali']);
addRange('GMC', 'C/K 1500', 1990, 1998, ['Base', 'SLE', 'SLT']);
addRange('GMC', 'C/K 2500', 1990, 2000, ['Base', 'SLE', 'SLT']);
addRange('GMC', 'Sierra 2500HD', 2001, 2010, ['SLE', 'SLT', 'Denali']);
addRange('GMC', 'Sierra 3500HD', 2001, 2010, ['SLE', 'SLT', 'Denali']);
addRange('GMC', 'Yukon', 1992, 2006, ['Base', 'SLE', 'SLT', 'Denali']);
addRange('GMC', 'Yukon XL', 2000, 2006, ['SLE', 'SLT', 'Denali']);
addRange('GMC', 'Suburban', 1992, 1999, ['1500', '2500']);
addRange('GMC', 'Jimmy', 1992, 2001, ['Base', 'SL', 'SLE', 'SLT']);
addRange('GMC', 'Sonoma', 1991, 2004, ['Base', 'SL', 'SLE', 'SLS']);
addRange('GMC', 'Safari', 1990, 2005, ['Base', 'SLE', 'SLT']);
addRange('GMC', 'Envoy', 1998, 2001, ['Base', 'SLE', 'SLT']);
addRange('GMC', 'Acadia', 2007, 2007, ['SLE', 'SLT']); // already starts 2007
addRange('GMC', 'Terrain', 2010, 2010, ['SLE', 'SLT']); // already starts 2010
addRange('GMC', 'Canyon', 2004, 2012, ['SL', 'SLE', 'SLT']);
addRange('GMC', 'Savana', 1996, 2002, ['1500', '2500', '3500']);

// ============================================================
// HONDA - extend to 1990
// ============================================================
addRange('Honda', 'Civic', 1990, 1995, ['CX', 'DX', 'EX', 'LX', 'Si']);
addRange('Honda', 'Accord', 1990, 1997, ['DX', 'EX', 'LX', 'SE']);
addRange('Honda', 'Odyssey', 1995, 1998, ['LX', 'EX']);
addRange('Honda', 'Prelude', 1990, 2001, ['S', 'Si', 'VTEC', 'Type SH']);
addRange('Honda', 'Del Sol', 1993, 1997, ['S', 'Si', 'VTEC']);
addRange('Honda', 'Passport', 1994, 2002, ['DX', 'LX', 'EX']);
addRange('Honda', 'CR-V', 1997, 1997, ['LX', 'EX']); // already starts 1997

// ============================================================
// HYUNDAI - extend to 1990
// ============================================================
addRange('Hyundai', 'Sonata', 1990, 2005, ['Base', 'GL', 'GLS', 'LX']);
addRange('Hyundai', 'Elantra', 1992, 2006, ['Base', 'GL', 'GLS']);
addRange('Hyundai', 'Accent', 1995, 2005, ['L', 'GL', 'GLS', 'GT']);
addRange('Hyundai', 'Tiburon', 1997, 2008, ['Base', 'FX', 'GS', 'GT']);
addRange('Hyundai', 'Tucson', 2005, 2005, ['GL', 'GLS', 'Limited']); // already 2005
addRange('Hyundai', 'Santa Fe', 2001, 2001, ['GLS', 'LX']); // already 2001
addRange('Hyundai', 'XG350', 2001, 2005, ['Base', 'L']);
addRange('Hyundai', 'Azera', 2006, 2011, ['GLS', 'Limited', 'SE']);
addRange('Hyundai', 'Excel', 1990, 1994, ['Base', 'GL', 'GLS']);
addRange('Hyundai', 'Scoupe', 1991, 1995, ['Base', 'LS', 'Turbo']);

// ============================================================
// JEEP - extend to 1990
// ============================================================
addRange('Jeep', 'Cherokee', 1990, 1996, ['SE', 'Sport', 'Country', 'Limited']);
addRange('Jeep', 'Grand Cherokee', 1993, 1998, ['Laredo', 'Limited', 'TSi']);
addRange('Jeep', 'Wrangler', 1990, 1996, ['S', 'SE', 'Sport', 'Sahara']);
addRange('Jeep', 'Comanche', 1990, 1992, ['Base', 'Pioneer', 'Eliminator']);

// ============================================================
// KIA - entered US 1993
// ============================================================
addRange('Kia', 'Sephia', 1994, 2001, ['Base', 'LS', 'GS']);
addRange('Kia', 'Sportage', 1995, 2004, ['Base', 'EX']);
addRange('Kia', 'Spectra', 2000, 2009, ['Base', 'EX', 'LX', 'SX']);
addRange('Kia', 'Rio', 2001, 2005, ['Base', 'Cinco']);
addRange('Kia', 'Amanti', 2004, 2009, ['Base']);
addRange('Kia', 'Sedona', 2002, 2002, ['LX', 'EX']); // already 2002

// ============================================================
// NISSAN - extend to 1990
// ============================================================
addRange('Nissan', 'Sentra', 1990, 1999, ['Base', 'XE', 'GXE', 'SE-R']);
addRange('Nissan', 'Maxima', 1990, 2003, ['GXE', 'SE', 'GLE']);
addRange('Nissan', 'Altima', 1993, 2001, ['XE', 'GXE', 'GLE', 'SE']);
addRange('Nissan', 'Pathfinder', 1990, 2004, ['XE', 'SE', 'LE']);
addRange('Nissan', 'Frontier', 1998, 2004, ['XE', 'SE', 'SC']);
addRange('Nissan', 'Hardbody', 1990, 1997, ['Base', 'XE', 'SE']);
addRange('Nissan', '240SX', 1990, 1998, ['Base', 'SE', 'LE']);
addRange('Nissan', '300ZX', 1990, 1996, ['Base', '2+2', 'Turbo']);
addRange('Nissan', '350Z', 2003, 2003, ['Base', 'Touring', 'Track']); // already 2003
addRange('Nissan', 'Quest', 1993, 2003, ['XE', 'GXE', 'GLE']);
addRange('Nissan', 'Xterra', 2000, 2000, ['XE', 'SE']); // already 2000
addRange('Nissan', 'Murano', 2003, 2003, ['SL', 'SE']); // already 2003
addRange('Nissan', 'Armada', 2004, 2004, ['SE', 'LE']); // already 2004
addRange('Nissan', 'Stanza', 1990, 1992, ['XE', 'GXE']);

// ============================================================
// SUBARU - extend to 1990
// ============================================================
addRange('Subaru', 'Legacy', 1990, 1999, ['Base', 'L', 'LS', 'GT']);
addRange('Subaru', 'Impreza', 1993, 2001, ['Base', 'L', 'RS', 'Outback Sport']);
addRange('Subaru', 'Outback', 1995, 2004, ['Base', 'Limited', 'H6']);
addRange('Subaru', 'Forester', 1998, 1998, ['L', 'S']); // already starts 1998
addRange('Subaru', 'SVX', 1992, 1997, ['L', 'LSi']);
addRange('Subaru', 'Loyale', 1990, 1994, ['Base', 'DL']);
addRange('Subaru', 'WRX', 2002, 2002, ['Base']); // already 2002

// ============================================================
// TOYOTA - extend to 1990
// ============================================================
addRange('Toyota', 'Camry', 1990, 2001, ['DX', 'LE', 'SE', 'XLE']);
addRange('Toyota', 'Corolla', 1990, 2002, ['Base', 'DX', 'LE', 'S']);
addRange('Toyota', '4Runner', 1990, 2002, ['SR5', 'Limited']);
addRange('Toyota', 'Tacoma', 1995, 2004, ['Base', 'SR5', 'PreRunner', 'Limited']);
addRange('Toyota', 'Land Cruiser', 1990, 1997, ['Base']);
addRange('Toyota', 'Celica', 1990, 2005, ['ST', 'GT', 'GT-S']);
addRange('Toyota', 'Supra', 1990, 1998, ['Base', 'Turbo']);
addRange('Toyota', 'MR2', 1990, 2005, ['Base', 'Turbo', 'Spyder']);
addRange('Toyota', 'Tercel', 1990, 1999, ['Base', 'DX']);
addRange('Toyota', 'Avalon', 1995, 1999, ['XL', 'XLS']);
addRange('Toyota', 'Sienna', 1998, 2003, ['CE', 'LE', 'XLE']);
addRange('Toyota', 'RAV4', 1996, 2005, ['Base', 'L']);
addRange('Toyota', 'Previa', 1991, 1997, ['DX', 'LE', 'All-Trac']);
addRange('Toyota', 'Pickup', 1990, 1995, ['Base', 'DX', 'SR5']);
addRange('Toyota', 'Tundra', 2000, 2000, ['SR5', 'Limited']); // already 2000
addRange('Toyota', 'Highlander', 2001, 2001, ['Base', 'Limited']); // already 2001
addRange('Toyota', 'Prius', 2001, 2001, ['Base']); // already 2001
addRange('Toyota', 'T100', 1993, 1998, ['Base', 'SR5', 'DX']);
addRange('Toyota', 'Paseo', 1992, 1997, ['Base']);
addRange('Toyota', 'Matrix', 2003, 2003, ['Base', 'XR', 'XRS']); // already 2003

// ============================================================
// VOLKSWAGEN - extend to 1990
// ============================================================
addRange('Volkswagen', 'Golf', 1990, 1998, ['Base', 'GL', 'GTI', 'GTI VR6']);
addRange('Volkswagen', 'Jetta', 1990, 1999, ['Base', 'GL', 'GLS', 'GLX', 'TDI']);
addRange('Volkswagen', 'Passat', 1990, 2005, ['GL', 'GLS', 'GLX', 'TDI']);
addRange('Volkswagen', 'Corrado', 1990, 1995, ['G60', 'SLC', 'VR6']);
addRange('Volkswagen', 'Cabrio', 1995, 2002, ['Base', 'GLS', 'GLX']);
addRange('Volkswagen', 'Fox', 1990, 1993, ['Base', 'GL', 'Wolfsburg']);
addRange('Volkswagen', 'Eurovan', 1993, 2003, ['GLS', 'MV', 'Camper']);
addRange('Volkswagen', 'New Beetle', 1998, 2011, ['Base', 'GLS', 'GLX', 'Turbo S', 'TDI']);
addRange('Volkswagen', 'Touareg', 2004, 2004, ['V6', 'V8']); // already 2004
addRange('Volkswagen', 'Phaeton', 2004, 2006, ['V8', 'W12']);

// ============================================================
// VOLVO - extend to 1990
// ============================================================
addRange('Volvo', '240', 1990, 1993, ['Base', 'DL', 'GL']);
addRange('Volvo', '740', 1990, 1992, ['Base', 'GLE', 'Turbo']);
addRange('Volvo', '940', 1991, 1998, ['Base', 'Turbo']);
addRange('Volvo', '960', 1992, 1997, ['Base']);
addRange('Volvo', '850', 1993, 1997, ['Base', 'GLT', 'T-5', 'T-5R', 'R']);
addRange('Volvo', 'S70', 1998, 2000, ['Base', 'GLT', 'T5', 'AWD']);
addRange('Volvo', 'V70', 1998, 2010, ['Base', 'GLT', 'T5', 'XC', 'R']);
addRange('Volvo', 'C70', 1998, 2013, ['Base', 'T5']);
addRange('Volvo', 'S40', 2000, 2003, ['Base', '1.9T']);
addRange('Volvo', 'S60', 2001, 2001, ['2.4', 'T5', 'R']); // already 2001
addRange('Volvo', 'S80', 1999, 2006, ['2.9', 'T6', '2.5T']);
addRange('Volvo', 'XC70', 1998, 2000, ['Base', 'AWD']);
addRange('Volvo', 'XC90', 2003, 2003, ['2.5T', 'T6']); // already 2003
addRange('Volvo', 'V40', 2000, 2004, ['Base', '1.9T']);
addRange('Volvo', 'V50', 2005, 2005, ['2.4i', 'T5']); // already 2005

// Sort years in YMMT
var sorted = {};
Object.keys(ymmt).sort(function(a,b) { return parseInt(a) - parseInt(b); }).forEach(function(year) {
  sorted[year] = {};
  Object.keys(ymmt[year]).sort().forEach(function(make) {
    sorted[year][make] = {};
    Object.keys(ymmt[year][make]).sort().forEach(function(model) {
      sorted[year][make][model] = ymmt[year][make][model];
    });
  });
});

fs.writeFileSync(ymmtPath, JSON.stringify(sorted, null, 2));

console.log('YMMT Gap Fill Results:');
console.log('  Added ' + added + ' new year/make/model entries');

// Verify coverage
var makeYears = {};
Object.keys(sorted).forEach(function(year) {
  Object.keys(sorted[year]).forEach(function(make) {
    if (!makeYears[make]) makeYears[make] = { min: 9999, max: 0, count: 0 };
    var y = parseInt(year);
    if (y < makeYears[make].min) makeYears[make].min = y;
    if (y > makeYears[make].max) makeYears[make].max = y;
    makeYears[make].count += Object.keys(sorted[year][make]).length;
  });
});

console.log('\n=== Updated YMMT Coverage ===');
Object.keys(makeYears).sort().forEach(function(make) {
  var m = makeYears[make];
  var status = m.min <= 1990 ? 'OK' : (m.min <= 1993 ? 'OK (make started ' + m.min + ')' : 'CHECK');
  console.log('  ' + make + ': ' + m.min + '-' + m.max + ' (' + m.count + ' model-year entries) [' + status + ']');
});
