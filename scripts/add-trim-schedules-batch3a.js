#!/usr/bin/env node
/**
 * add-trim-schedules-batch3a.js
 * Adds trim-based maintenance schedules for BMW (remaining), Mercedes-Benz, and Volvo models.
 * BMW 3 Series and 5 Series already have trims — those are preserved.
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'data', 'maintenance-overrides.json');
const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);

// EV template — reusable for all EV trims
const evItems = {
  oil_change: { notApplicable: true },
  spark_plugs: { notApplicable: true },
  serpentine_belt: { notApplicable: true },
  air_filter: { notApplicable: true },
  fuel_filter: { notApplicable: true },
  transmission_fluid: { notApplicable: true },
  ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 }
};

// ─── BMW TRIMS ──────────────────────────────────────────────────────────────────
const bmwTrims = {
  '7 Series': {
    _defaults: {
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 160 },
      brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 140 }
    },
    trims: {
      '740i/740i xDrive': {
        engine: '3.0L Turbo I6 B58 (375 hp)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 140, note: '6.9 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 300 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 360, note: 'ZF 8-speed auto, service at 60k' }
      },
      '760i xDrive': {
        engine: '4.4L Twin-Turbo V8 N63 (536 hp)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 170, note: '8.5 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 420 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 380, note: 'ZF 8-speed auto' }
      },
      'i7 xDrive60/i7 M70': {
        engine: 'Electric (536-650 hp)',
        years: range(2023, 2025),
        ...evItems
      }
    }
  },
  'X5': {
    _defaults: {
      brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 130 }
    },
    trims: {
      'xDrive40i': {
        engine: '3.0L Turbo I6 B58 (335-375 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 140, note: '6.9 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 300 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 350, note: 'ZF 8-speed auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 }
      },
      'M50i/xDrive50e': {
        engine: '4.4L Twin-Turbo V8 N63 (523 hp) / PHEV',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 165, note: '8.5 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 400 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 }
      },
      'X5 M/X5 M Competition': {
        engine: '4.4L Twin-Turbo V8 S68 (600-617 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 170, note: '8.5 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 450 },
        differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 220 },
        transfer_case_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 200 }
      }
    }
  },
  'X3': {
    _defaults: {
      brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 120 }
    },
    trims: {
      '30 xDrive/xDrive30i': {
        engine: '2.0L Turbo I4 B48 (248 hp)',
        years: range(2018, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 110, note: '5.3 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 250 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 320, note: 'ZF 8-speed auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 }
      },
      'M40i': {
        engine: '3.0L Turbo I6 B58 (382 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 130, note: '6.9 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 }
      },
      'X3 M/X3 M Competition': {
        engine: '3.0L Twin-Turbo I6 S58 (473-503 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 150, note: '7.9 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 350 },
        differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 200 },
        transfer_case_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 180 }
      }
    }
  },
  '4 Series': {
    _defaults: {
      brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 120 }
    },
    trims: {
      '430i/430i xDrive': {
        engine: '2.0L Turbo I4 B48 (255 hp)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 110, note: '5.3 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 250 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 320, note: 'ZF 8-speed auto' }
      },
      'M440i/M440i xDrive': {
        engine: '3.0L Turbo I6 B58 (382 hp)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 130, note: '6.9 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300 }
      },
      'i4 eDrive40/i4 M50': {
        engine: 'Electric (335-536 hp)',
        years: range(2022, 2025),
        ...evItems
      }
    }
  },
  '2 Series': {
    trims: {
      '230i/230i xDrive Coupe': {
        engine: '2.0L Turbo I4 B48 (255 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 110, note: '5.3 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 240 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 310, note: 'ZF 8-speed auto' }
      },
      'M240i xDrive': {
        engine: '3.0L Turbo I6 B58 (382 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 130, note: '6.9 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300 }
      },
      'M2': {
        engine: '3.0L Twin-Turbo I6 S58 (453 hp)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 150, note: '7.9 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 340 },
        differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 200 }
      }
    }
  },
  'M4': {
    trims: {
      'M4/M4 Competition': {
        engine: '3.0L Twin-Turbo I6 S58 (473-503 hp)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 150, note: '7.9 quarts 0W-30 LL-01 FE' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 350 },
        transmission_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 380, note: '6-speed manual or ZF 8-speed auto' },
        differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 200 }
      },
      'M4 CSL': {
        engine: '3.0L Twin-Turbo I6 S58 (543 hp)',
        years: [2023, 2024],
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 170, note: '7.9 quarts 0W-30 LL-01 FE, track use shortens interval' },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 36, cost: 380 }
      }
    }
  },
  'X1': {
    trims: {
      'xDrive28i': {
        engine: '2.0L Turbo I4 B48 (241 hp)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 110, note: '5.3 quarts 0W-20 LL-01' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 240 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 300, note: 'Aisin 7-speed DCT' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160 }
      },
      'M35i xDrive': {
        engine: '2.0L Turbo I4 B48 (312 hp)',
        years: range(2024, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 120, note: '5.3 quarts 0W-20 LL-01' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 260 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160 }
      },
      'iX1 xDrive30': {
        engine: 'Electric (308 hp)',
        years: range(2024, 2025),
        ...evItems
      }
    }
  },
  'X7': {
    _defaults: {
      brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 140 }
    },
    trims: {
      'xDrive40i': {
        engine: '3.0L Turbo I6 B58 (375 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 145, note: '6.9 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 320 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 370, note: 'ZF 8-speed auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 }
      },
      'M60i xDrive': {
        engine: '4.4L Twin-Turbo V8 S68 (523 hp)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 170, note: '8.5 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 420 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 }
      }
    }
  },
  'Z4': {
    trims: {
      'sDrive30i': {
        engine: '2.0L Turbo I4 B48 (255 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 110, note: '5.3 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 250 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 320, note: 'ZF 8-speed auto' }
      },
      'M40i': {
        engine: '3.0L Turbo I6 B58 (382 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 130, note: '6.9 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300 }
      }
    }
  },
  'iX': {
    trims: {
      'xDrive50/M60': {
        engine: 'Electric (516-610 hp)',
        years: range(2022, 2025),
        ...evItems
      }
    }
  },
  'X6': {
    trims: {
      'xDrive40i': {
        engine: '3.0L Turbo I6 B58 (335-375 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 140, note: '6.9 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 300 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 350, note: 'ZF 8-speed auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 }
      },
      'M50i/X6 M Competition': {
        engine: '4.4L Twin-Turbo V8 S68 (523-617 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 170, note: '8.5 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 450 },
        differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 220 },
        transfer_case_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 200 }
      }
    }
  },
  'M2': {
    trims: {
      'M2': {
        engine: '3.0L Twin-Turbo I6 S58 (453 hp)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 150, note: '7.9 quarts 0W-30 LL-01' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 340 },
        transmission_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 360, note: '6-speed manual or ZF 8-speed auto' },
        differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 200 }
      }
    }
  }
};

// ─── MERCEDES-BENZ TRIMS ────────────────────────────────────────────────────────
const mercedesTrims = {
  'C-Class': {
    _defaults: {
      brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 130 }
    },
    trims: {
      'C300/C300 4MATIC': {
        engine: '2.0L Turbo I4 M254 (255 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 130, note: '6.0 quarts 0W-20 MB 229.52' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 280 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 380, note: '9G-Tronic 9-speed auto' }
      },
      'AMG C43 4MATIC': {
        engine: '2.0L Turbo I4 M139 + e-turbo (402 hp)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 150, note: '6.5 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 320 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 }
      },
      'AMG C63 S': {
        engine: '2.0L Turbo I4 M139 + electric (671 hp PHEV)',
        years: range(2024, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 160, note: '6.5 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 360 },
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 }
      }
    }
  },
  'E-Class': {
    _defaults: {
      brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 130 }
    },
    trims: {
      'E300/E350 4MATIC': {
        engine: '2.0L Turbo I4 M254 (255 hp)',
        years: range(2024, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 140, note: '6.0 quarts 0W-20 MB 229.52' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 290 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 400, note: '9G-Tronic 9-speed auto' }
      },
      'AMG E53 4MATIC+': {
        engine: '3.0L Turbo I6 M256 + EQ Boost (429 hp)',
        years: range(2024, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 155, note: '8.0 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 340 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 }
      },
      'AMG E63 S 4MATIC+ (W213)': {
        engine: '4.0L Twin-Turbo V8 M177 (603 hp)',
        years: range(2018, 2023),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 180, note: '9.0 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 420 },
        differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 220 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 }
      }
    }
  },
  'S-Class': {
    _defaults: {
      brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 150 }
    },
    trims: {
      'S500 4MATIC': {
        engine: '3.0L Turbo I6 M256 + EQ Boost (429 hp)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 160, note: '8.0 quarts 0W-20 MB 229.52' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 350 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 450, note: '9G-Tronic 9-speed auto' }
      },
      'S580 4MATIC': {
        engine: '4.0L Twin-Turbo V8 M176 (496 hp)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 180, note: '8.5 quarts 0W-20 MB 229.52' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 420 }
      },
      'AMG S63 E Performance': {
        engine: '4.0L Twin-Turbo V8 M177 + electric (791 hp PHEV)',
        years: range(2024, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 200, note: '8.5 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 480 },
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 }
      }
    }
  },
  'GLE': {
    _defaults: {
      brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 140 }
    },
    trims: {
      'GLE 350/GLE 350 4MATIC': {
        engine: '2.0L Turbo I4 M254 (255 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 140, note: '6.0 quarts 0W-20 MB 229.52' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 290 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 400, note: '9G-Tronic' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 }
      },
      'GLE 450/GLE 580': {
        engine: '3.0L Turbo I6 M256 (375 hp) / 4.0L V8 (510 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 165, note: '8.0-8.5 quarts 0W-20 MB 229.52' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 360 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 }
      },
      'AMG GLE 63 S 4MATIC+': {
        engine: '4.0L Twin-Turbo V8 M177 (603 hp)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 185, note: '9.0 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 440 },
        differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 220 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 }
      }
    }
  },
  'GLC': {
    _defaults: {
      brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 130 }
    },
    trims: {
      'GLC 300 4MATIC': {
        engine: '2.0L Turbo I4 M254 (258 hp)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 130, note: '6.0 quarts 0W-20 MB 229.52' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 270 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 380, note: '9G-Tronic 9-speed auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 }
      },
      'AMG GLC 43/AMG GLC 63 S': {
        engine: '2.0L Turbo I4 M139 + e-turbo (416-671 hp)',
        years: range(2024, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 155, note: '6.5 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 340 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 }
      }
    }
  },
  'GLA': {
    trims: {
      'GLA 250/GLA 250 4MATIC': {
        engine: '2.0L Turbo I4 M282 (221 hp)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 120, note: '5.5 quarts 0W-20 MB 229.52' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 260 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 360, note: '8G-DCT dual-clutch' }
      },
      'AMG GLA 35 4MATIC': {
        engine: '2.0L Turbo I4 M260 (302 hp)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 135, note: '5.5 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160 }
      }
    }
  },
  'GLB': {
    trims: {
      'GLB 250/GLB 250 4MATIC': {
        engine: '2.0L Turbo I4 M282 (221 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 120, note: '5.5 quarts 0W-20 MB 229.52' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 260 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 360, note: '8G-DCT dual-clutch' }
      },
      'AMG GLB 35 4MATIC': {
        engine: '2.0L Turbo I4 M260 (302 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 135, note: '5.5 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160 }
      }
    }
  },
  'CLA': {
    trims: {
      'CLA 250/CLA 250 4MATIC': {
        engine: '2.0L Turbo I4 M282 (221 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 120, note: '5.5 quarts 0W-20 MB 229.52' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 260 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 360, note: '7G-DCT dual-clutch' }
      },
      'AMG CLA 35/AMG CLA 45': {
        engine: '2.0L Turbo I4 M260/M139 (302-382 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 145, note: '5.5 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 310 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160 }
      }
    }
  },
  'AMG GT': {
    trims: {
      'AMG GT 43/AMG GT 55': {
        engine: '3.0L Turbo I6 M256 (362-469 hp)',
        years: range(2024, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 160, note: '8.0 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 360 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 420, note: 'AMG Speedshift MCT 9-speed' }
      },
      'AMG GT 63 S E Performance': {
        engine: '4.0L Twin-Turbo V8 M177 + electric (831 hp)',
        years: range(2024, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 200, note: '9.0 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 36, cost: 480 },
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 230 }
      }
    }
  },
  'G-Class': {
    trims: {
      'G 550': {
        engine: '4.0L Twin-Turbo V8 M176 (416 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 180, note: '8.5 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 400 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 450, note: '9G-Tronic' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 220 },
        differential_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 250, note: '3 differentials (front, center, rear)' }
      },
      'AMG G 63': {
        engine: '4.0L Twin-Turbo V8 M177 (577 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 200, note: '9.0 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 460 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 220 },
        differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 260, note: '3 differentials' }
      }
    }
  },
  'EQS': {
    trims: {
      'EQS 450+/EQS 580 4MATIC': {
        engine: 'Electric (329-516 hp)',
        years: range(2022, 2025),
        ...evItems
      }
    }
  },
  'EQE': {
    trims: {
      'EQE 350+/EQE 500 4MATIC': {
        engine: 'Electric (288-402 hp)',
        years: range(2023, 2025),
        ...evItems
      }
    }
  },
  'A-Class': {
    trims: {
      'A 220/A 220 4MATIC': {
        engine: '2.0L Turbo I4 M282 (221 hp)',
        years: range(2019, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 120, note: '5.5 quarts 0W-20 MB 229.52' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 250 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 350, note: '7G-DCT dual-clutch' }
      },
      'AMG A 35 4MATIC': {
        engine: '2.0L Turbo I4 M260 (302 hp)',
        years: range(2020, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 135, note: '5.5 quarts 0W-40 MB 229.5' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 290 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160 }
      }
    }
  }
};

// ─── VOLVO TRIMS ─────────────────────────────────────────────────────────────────
const volvoDefaults = {
  _defaults: {
    oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100 },
    timing_belt: { notApplicable: true },
    transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 300 },
    spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 240 },
    coolant_flush: { intervalMiles: 60000, intervalMonths: 48, cost: 170 },
    brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 110 },
    cabin_filter: { intervalMiles: 20000, intervalMonths: 18, cost: 45 },
    air_filter: { intervalMiles: 30000, intervalMonths: 24, cost: 35 },
    serpentine_belt: { intervalMiles: 50000, intervalMonths: 48, cost: 180 }
  },
  models: {}
};

const volvoTrims = {
  'S60': {
    trims: {
      'B5 AWD': {
        engine: '2.0L Turbo I4 B4204T23 (247 hp mild hybrid)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 95, note: '5.9 quarts 0W-20 VCC RBS0-2AE' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 220 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 280, note: 'Aisin 8-speed auto' }
      },
      'T8 Recharge/Polestar Engineered': {
        engine: '2.0L Turbo+Supercharged I4 + electric (400-455 hp PHEV)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: '5.9 quarts 0W-20 VCC' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 250 },
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 }
      }
    }
  },
  'XC90': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 }
    },
    trims: {
      'B5/B6 AWD': {
        engine: '2.0L Turbo I4 (247 hp) / Turbo+Supercharged (295 hp) mild hybrid',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: '5.9 quarts 0W-20 VCC RBS0-2AE' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 240 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 300, note: 'Aisin 8-speed auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 }
      },
      'T8 Recharge': {
        engine: '2.0L Turbo+Supercharged I4 + electric (400-455 hp PHEV)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 105, note: '5.9 quarts 0W-20 VCC' },
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 }
      }
    }
  },
  'XC60': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170 }
    },
    trims: {
      'B5/B6 AWD': {
        engine: '2.0L Turbo I4 (247 hp) / Turbo+Supercharged (295 hp) mild hybrid',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 95, note: '5.9 quarts 0W-20 VCC RBS0-2AE' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 230 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 290, note: 'Aisin 8-speed auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170 }
      },
      'T8 Recharge': {
        engine: '2.0L Turbo+Supercharged I4 + electric (400-455 hp PHEV)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: '5.9 quarts 0W-20 VCC' },
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170 }
      }
    }
  },
  'V60': {
    trims: {
      'B5 AWD': {
        engine: '2.0L Turbo I4 B4204T23 (247 hp mild hybrid)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 95, note: '5.9 quarts 0W-20 VCC RBS0-2AE' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 220 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 280, note: 'Aisin 8-speed auto' }
      },
      'T8 Recharge/Polestar Engineered': {
        engine: '2.0L Turbo+Supercharged I4 + electric (400-455 hp PHEV)',
        years: range(2020, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: '5.9 quarts 0W-20 VCC' },
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 }
      }
    }
  },
  'XC40': {
    trims: {
      'B4/B5 AWD': {
        engine: '2.0L Turbo I4 (197-247 hp mild hybrid)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 90, note: '5.4 quarts 0W-20 VCC RBS0-2AE' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 210 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 270, note: 'Aisin 8-speed auto' }
      },
      'Recharge Pure Electric': {
        engine: 'Electric Twin Motor (402 hp)',
        years: range(2021, 2024),
        ...evItems
      }
    }
  },
  'S90': {
    trims: {
      'B6 AWD': {
        engine: '2.0L Turbo+Supercharged I4 (295 hp mild hybrid)',
        years: range(2021, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: '5.9 quarts 0W-20 VCC RBS0-2AE' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 240 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 300, note: 'Aisin 8-speed auto' }
      },
      'T8 Recharge': {
        engine: '2.0L Turbo+Supercharged I4 + electric (400-455 hp PHEV)',
        years: range(2021, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 105, note: '5.9 quarts 0W-20 VCC' },
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 }
      }
    }
  },
  'XC70': {
    trims: {
      '3.2/T6 AWD': {
        engine: '3.2L I6 (240 hp) / 3.0L Turbo I6 (300 hp)',
        years: range(2008, 2016),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 90, note: '6.8 quarts 5W-30 VCC' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 220 },
        transmission_fluid: { intervalMiles: 52500, intervalMonths: 48, cost: 260, note: 'Aisin 6-speed auto' },
        transfer_case_fluid: { intervalMiles: 52500, intervalMonths: 48, cost: 150 }
      }
    }
  },
  'S80': {
    trims: {
      '3.2/T6 AWD': {
        engine: '3.2L I6 (240 hp) / 3.0L Turbo I6 (300 hp)',
        years: range(2007, 2016),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 85, note: '6.8 quarts 5W-30 VCC' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 220 },
        transmission_fluid: { intervalMiles: 52500, intervalMonths: 48, cost: 260, note: 'Aisin 6-speed auto' }
      }
    }
  },
  'V70': {
    trims: {
      '3.2/T6 AWD': {
        engine: '3.2L I6 (240 hp) / 3.0L Turbo I6 (300 hp)',
        years: range(2008, 2010),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 85, note: '6.8 quarts 5W-30 VCC' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 210 },
        transmission_fluid: { intervalMiles: 52500, intervalMonths: 48, cost: 250, note: 'Aisin 6-speed auto' }
      }
    }
  },
  'EX30': {
    trims: {
      'Single Motor/Twin Motor': {
        engine: 'Electric (272-422 hp)',
        years: range(2024, 2025),
        ...evItems
      }
    }
  },
  'C40 Recharge': {
    trims: {
      'Recharge Pure Electric': {
        engine: 'Electric Twin Motor (402 hp)',
        years: range(2022, 2025),
        ...evItems
      }
    }
  },
  'V90': {
    trims: {
      'B6 AWD/V90 Cross Country': {
        engine: '2.0L Turbo+Supercharged I4 (295 hp mild hybrid)',
        years: range(2021, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: '5.9 quarts 0W-20 VCC RBS0-2AE' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 240 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 300, note: 'Aisin 8-speed auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170 }
      },
      'T8 Recharge': {
        engine: '2.0L Turbo+Supercharged I4 + electric (400 hp PHEV)',
        years: range(2021, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 105, note: '5.9 quarts 0W-20 VCC' },
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170 }
      }
    }
  }
};

// ─── MAIN ────────────────────────────────────────────────────────────────────────
function main() {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  let bmwCount = 0, mbCount = 0, volvoCount = 0;

  // ── BMW ──
  const bmw = data.makes['BMW'];
  if (!bmw.models) bmw.models = {};

  // Also update evModels list for BMW
  if (!data.evModels['BMW']) data.evModels['BMW'] = [];
  const bmwEVs = data.evModels['BMW'];

  for (const [model, modelData] of Object.entries(bmwTrims)) {
    if (!bmw.models[model]) {
      bmw.models[model] = {};
    }
    const existing = bmw.models[model];

    // Don't overwrite existing trims (3 Series, 5 Series)
    if (existing.trims) {
      console.log(`  BMW ${model}: already has trims, skipping`);
      continue;
    }

    // Merge _defaults if present
    if (modelData._defaults) {
      if (!existing._defaults) existing._defaults = {};
      Object.assign(existing._defaults, modelData._defaults);
    }

    // Add trims
    existing.trims = modelData.trims;

    const trimCount = Object.keys(modelData.trims).length;
    bmwCount += trimCount;
    console.log(`  BMW ${model}: added ${trimCount} trims`);

    // Track EVs
    for (const [trimName, trimData] of Object.entries(modelData.trims)) {
      if (trimData.oil_change && trimData.oil_change.notApplicable) {
        if (!bmwEVs.includes(model)) bmwEVs.push(model);
      }
    }
  }

  // ── MERCEDES-BENZ ──
  const mb = data.makes['Mercedes-Benz'];
  if (!mb.models) mb.models = {};

  for (const [model, modelData] of Object.entries(mercedesTrims)) {
    if (!mb.models[model]) {
      mb.models[model] = {};
    }
    const existing = mb.models[model];

    if (existing.trims) {
      console.log(`  Mercedes-Benz ${model}: already has trims, skipping`);
      continue;
    }

    if (modelData._defaults) {
      if (!existing._defaults) existing._defaults = {};
      Object.assign(existing._defaults, modelData._defaults);
    }

    existing.trims = modelData.trims;

    const trimCount = Object.keys(modelData.trims).length;
    mbCount += trimCount;
    console.log(`  Mercedes-Benz ${model}: added ${trimCount} trims`);
  }

  // ── VOLVO (new make) ──
  if (!data.makes['Volvo']) {
    data.makes['Volvo'] = volvoDefaults;
    console.log('  Volvo: created make with defaults');
  }
  const volvo = data.makes['Volvo'];
  if (!volvo.models) volvo.models = {};

  // Add Volvo EVs to evModels
  if (!data.evModels['Volvo']) data.evModels['Volvo'] = [];
  const volvoEVs = data.evModels['Volvo'];

  for (const [model, modelData] of Object.entries(volvoTrims)) {
    if (!volvo.models[model]) {
      volvo.models[model] = {};
    }
    const existing = volvo.models[model];

    if (existing.trims) {
      console.log(`  Volvo ${model}: already has trims, skipping`);
      continue;
    }

    if (modelData._defaults) {
      if (!existing._defaults) existing._defaults = {};
      Object.assign(existing._defaults, modelData._defaults);
    }

    existing.trims = modelData.trims;

    const trimCount = Object.keys(modelData.trims).length;
    volvoCount += trimCount;
    console.log(`  Volvo ${model}: added ${trimCount} trims`);

    for (const [trimName, trimData] of Object.entries(modelData.trims)) {
      if (trimData.oil_change && trimData.oil_change.notApplicable) {
        if (!volvoEVs.includes(model)) volvoEVs.push(model);
      }
    }
  }

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');

  console.log('\n── Summary ──');
  console.log(`BMW:           ${bmwCount} trims across ${Object.keys(bmwTrims).length} models`);
  console.log(`Mercedes-Benz: ${mbCount} trims across ${Object.keys(mercedesTrims).length} models`);
  console.log(`Volvo:         ${volvoCount} trims across ${Object.keys(volvoTrims).length} models`);
  console.log(`Total:         ${bmwCount + mbCount + volvoCount} trims added`);
  console.log('\nDone! maintenance-overrides.json updated.');
}

main();
