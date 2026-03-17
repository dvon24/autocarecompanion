#!/usr/bin/env node
/**
 * add-trim-schedules-batch1.js
 * Adds trim-based maintenance schedules for ALL remaining Toyota, Honda, and Nissan models.
 * Preserves existing entries (Camry, RAV4, Tacoma, 4Runner, Civic, Accord, CR-V, Altima, Rogue).
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'data', 'maintenance-overrides.json');
const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);

// EV notApplicable template
const EV_NA = {
  oil_change: { notApplicable: true },
  spark_plugs: { notApplicable: true },
  serpentine_belt: { notApplicable: true },
  air_filter: { notApplicable: true },
  fuel_filter: { notApplicable: true },
  transmission_fluid: { notApplicable: true },
};

// Hybrid belt NA
const HYBRID_NO_BELT = { notApplicable: true, note: 'Hybrid uses electric motor, no accessory belt' };

// ─── TOYOTA MODELS ───────────────────────────────────────────────────────────

const toyotaModels = {
  'Corolla': {
    _defaults: {
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45 }
    },
    trims: {
      'L/LE/SE/XLE/XSE 1.8': {
        engine: '1.8L I4 (139 hp)',
        years: range(2014, 2019),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 40, note: '4.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: 'CVT' }
      },
      'LE/SE/XLE/XSE 2.0 12th gen': {
        engine: '2.0L Dynamic Force I4 (169 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: '4.6 quarts 0W-16' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: 'Direct Shift-CVT' }
      },
      'Hybrid LE/SE/XLE': {
        engine: '1.8L/2.0L Hybrid I4 (121-138 hp combined)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 40, note: '4.4 quarts 0W-16' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      }
    }
  },

  'Corolla Hatchback': {
    trims: {
      'SE/XSE 2.0': {
        engine: '2.0L Dynamic Force I4 (169 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: '4.6 quarts 0W-16' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: 'CVT or 6-speed manual' }
      }
    }
  },

  'Corolla Cross': {
    trims: {
      'L/LE/XLE/SE 2.0': {
        engine: '2.0L Dynamic Force I4 (169 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: '4.6 quarts 0W-16' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: 'Direct Shift-CVT' }
      },
      'Hybrid LE/XLE/SE': {
        engine: '2.0L Hybrid I4 (196 hp combined)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: '4.6 quarts 0W-16' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      }
    }
  },

  'GR Corolla': {
    trims: {
      'Core/Circuit/Premium/Morizo': {
        engine: '1.6L Turbo I3 (300 hp)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: '5.5 quarts 0W-20, turbo requires shorter interval' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 140, note: '3 spark plugs, iridium' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 130, note: '6-speed manual iMT, Toyota Gear Oil LF' },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 120, note: 'Torsen LSD front and rear' }
      }
    }
  },

  'Highlander': {
    _defaults: {
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55 }
    },
    trims: {
      'LE/XLE/SE/Limited/Platinum 3.5 V6': {
        engine: '3.5L V6 (295 hp)',
        years: range(2014, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: '6.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: 'V6, rear bank tight clearance' },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: '8-speed auto' }
      },
      'Hybrid LE/XLE/Limited/Platinum': {
        engine: '2.5L Hybrid I4 (243 hp combined)',
        years: range(2020, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: '4.8 quarts 0W-16' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      },
      'LE/XLE/Limited/Platinum 2.4T 4th gen': {
        engine: '2.4L Turbo I4 (265 hp)',
        years: range(2024, 2026),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: '5.3 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: '8-speed auto' }
      },
      'Hybrid MAX 2.4T': {
        engine: '2.4L Turbo Hybrid I4 (362 hp combined)',
        years: range(2024, 2026),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: '5.3 quarts 0W-20' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      }
    }
  },

  'Grand Highlander': {
    trims: {
      'LE/XLE/Limited/Platinum 2.4T': {
        engine: '2.4L Turbo I4 (265 hp)',
        years: range(2024, 2026),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: '5.3 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: '8-speed auto' }
      },
      'Hybrid MAX': {
        engine: '2.4L Turbo Hybrid I4 (362 hp combined)',
        years: range(2024, 2026),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: '5.3 quarts 0W-20' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      }
    }
  },

  'Prius': {
    trims: {
      'Two/Three/Four/Five 3rd gen': {
        engine: '1.8L Hybrid I4 (134 hp combined)',
        years: range(2010, 2015),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: '4.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 120000, intervalMonths: 96, cost: 150 },
        serpentine_belt: { notApplicable: true },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 }
      },
      'Two/Three/Four/Prime 4th gen': {
        engine: '1.8L Hybrid I4 (121 hp combined)',
        years: range(2016, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: '4.4 quarts 0W-16' },
        spark_plugs: { intervalMiles: 120000, intervalMonths: 96, cost: 150 },
        serpentine_belt: { notApplicable: true },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 }
      },
      'LE/XLE/Limited 5th gen': {
        engine: '2.0L Hybrid I4 (196 hp combined)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: '4.6 quarts 0W-16' },
        spark_plugs: { intervalMiles: 120000, intervalMonths: 96, cost: 150 },
        serpentine_belt: { notApplicable: true },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 }
      },
      'Prime SE/XSE 5th gen': {
        engine: '2.0L PHEV I4 (220 hp combined)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: '4.6 quarts 0W-16' },
        spark_plugs: { intervalMiles: 120000, intervalMonths: 96, cost: 150 },
        serpentine_belt: { notApplicable: true },
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 }
      }
    }
  },

  'Prius V': {
    trims: {
      'Two/Three/Four/Five': {
        engine: '1.8L Hybrid I4 (134 hp combined)',
        years: range(2012, 2017),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: '4.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 120000, intervalMonths: 96, cost: 150 },
        serpentine_belt: { notApplicable: true },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 }
      }
    }
  },

  'Prius C': {
    trims: {
      'One/Two/Three/Four': {
        engine: '1.5L Hybrid I4 (99 hp combined)',
        years: range(2012, 2019),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 40, note: '3.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 120000, intervalMonths: 96, cost: 120 },
        serpentine_belt: { notApplicable: true },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 }
      }
    }
  },

  'Avalon': {
    trims: {
      'XLE/XSE/Limited/Touring 3.5 V6': {
        engine: '3.5L V6 (301 hp)',
        years: range(2013, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: '6.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: 'V6, coil-on-plug' },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: '8-speed auto' }
      },
      'TRD': {
        engine: '3.5L V6 (301 hp)',
        years: range(2020, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: '6.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: '8-speed auto' }
      },
      'Hybrid XLE/XSE/Limited': {
        engine: '2.5L Hybrid I4 (215 hp combined)',
        years: range(2019, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: '4.8 quarts 0W-16' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      }
    }
  },

  'Sienna': {
    trims: {
      'LE/SE/XLE/Limited 3.5 V6': {
        engine: '3.5L V6 (296 hp)',
        years: range(2011, 2020),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: '6.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: 'V6, coil-on-plug' },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: '8-speed auto' }
      },
      'LE/XLE/XSE/Platinum/Woodland Hybrid': {
        engine: '2.5L Hybrid I4 (245 hp combined)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: '4.8 quarts 0W-16' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      }
    }
  },

  'Tundra': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 }
    },
    trims: {
      'SR/SR5/Limited/1794/Platinum 5.7 V8': {
        engine: '5.7L V8 (381 hp)',
        years: range(2007, 2021),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: '7.9 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: '8 spark plugs, coil-on-plug' },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: '6-speed auto' }
      },
      'SR/SR5 4.6 V8': {
        engine: '4.6L V8 (310 hp)',
        years: range(2007, 2021),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: '7.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: '8 spark plugs' },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: '6-speed auto' }
      },
      'SR/SR5/Limited/1794/Platinum/TRD Pro 3.5T i-FORCE': {
        engine: '3.5L Twin-Turbo V6 (389 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: '7.4 quarts 0W-16' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: 'V6 coil-on-plug' },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 190, note: '10-speed auto' }
      },
      'i-FORCE MAX Hybrid': {
        engine: '3.5L Twin-Turbo Hybrid V6 (437 hp combined)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: '7.4 quarts 0W-16' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 190, note: '10-speed auto' }
      },
      'TRD Pro i-FORCE/MAX': {
        engine: '3.5L Twin-Turbo V6 (389-437 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: '7.4 quarts 0W-16' },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 140, note: 'Off-road severe duty, locking rear diff' },
        transfer_case_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 110 }
      }
    }
  },

  'Sequoia': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 }
    },
    trims: {
      'SR5/Limited/Platinum 5.7 V8': {
        engine: '5.7L V8 (381 hp)',
        years: range(2008, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: '7.9 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: '8 spark plugs' },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 190, note: '6-speed auto' }
      },
      'SR5/Limited/Platinum/Capstone 3.5T i-FORCE MAX': {
        engine: '3.5L Twin-Turbo Hybrid V6 (437 hp combined)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: '7.4 quarts 0W-16' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: 'V6 coil-on-plug' },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 190, note: '10-speed auto' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 }
      }
    }
  },

  'Land Cruiser': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 130 }
    },
    trims: {
      'Base/Heritage 5.7 V8 200 Series': {
        engine: '5.7L V8 (381 hp)',
        years: range(2008, 2021),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: '7.9 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: '8 spark plugs' },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200, note: '8-speed auto' }
      },
      '1958/Land Cruiser 2.4T i-FORCE MAX': {
        engine: '2.4L Turbo Hybrid I4 (326 hp combined)',
        years: range(2024, 2026),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: '5.3 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: '8-speed auto' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 }
      }
    }
  },

  'Supra': {
    trims: {
      'GR Supra 2.0 (B48)': {
        engine: '2.0L Turbo I4 (255 hp)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: '5.3 quarts 0W-20, BMW B48 engine' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 160 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200, note: '8-speed ZF auto' }
      },
      'GR Supra 3.0 (B58)': {
        engine: '3.0L Turbo I6 (382-389 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 75, note: '6.9 quarts 0W-20, BMW B58 engine' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: '6 spark plugs' },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200, note: '8-speed ZF auto or 6-speed manual (2023+)' },
        differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
      }
    }
  },

  'C-HR': {
    trims: {
      'LE/XLE/Limited 2.0': {
        engine: '2.0L I4 (144 hp)',
        years: range(2018, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: '4.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: 'CVT' }
      }
    }
  },

  'Venza': {
    trims: {
      'LE/XLE/Limited Hybrid': {
        engine: '2.5L Hybrid I4 (219 hp combined)',
        years: range(2021, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: '4.8 quarts 0W-16' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      }
    }
  },

  'Crown': {
    trims: {
      'XLE/Limited/Platinum Hybrid': {
        engine: '2.5L Hybrid I4 (236 hp combined)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: '4.8 quarts 0W-16' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      },
      'Signia/Platinum Hybrid MAX': {
        engine: '2.4L Turbo Hybrid I4 (340 hp combined)',
        years: range(2025, 2026),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: '5.3 quarts 0W-20' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      }
    }
  },

  '86': {
    trims: {
      'Base/GT': {
        engine: '2.0L Boxer H4 (205 hp)',
        years: range(2017, 2020),
        oil_change: { intervalMiles: 7500, intervalMonths: 6, cost: 50, note: '5.4 quarts 0W-20, Subaru FA20 boxer' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140 },
        transmission_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 140, note: '6-speed manual or 6-speed auto' }
      }
    }
  },

  'GR86': {
    trims: {
      'Base/Premium/Special Edition': {
        engine: '2.4L Boxer H4 (228 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 6, cost: 50, note: '5.7 quarts 0W-20, Subaru FA24 boxer' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140 },
        transmission_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 140, note: '6-speed manual or 6-speed auto' }
      }
    }
  },

  'Solara': {
    trims: {
      'SE/SLE 2.4': {
        engine: '2.4L I4 (155-160 hp)',
        years: range(2004, 2008),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: '4.0 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 140, note: '5-speed auto' }
      },
      'SE/SLE 3.3 V6': {
        engine: '3.3L V6 (210-225 hp)',
        years: range(2004, 2008),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: '5.0 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: '5-speed auto' }
      }
    }
  },

  'Matrix': {
    trims: {
      'Base/S/XRS 1.8': {
        engine: '1.8L I4 (126-170 hp)',
        years: range(2003, 2013),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: '4.0 quarts 5W-30 (0W-20 for 2009+)' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 140, note: '4-speed/5-speed auto or 5-speed/6-speed manual' }
      },
      'S 2.4': {
        engine: '2.4L I4 (158 hp)',
        years: range(2009, 2013),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: '4.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 130 }
      }
    }
  },

  'Celica': {
    trims: {
      'GT 1.8': {
        engine: '1.8L I4 (140 hp)',
        years: range(2000, 2005),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 35, note: '4.0 quarts 5W-30' },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 100 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 120, note: '4-speed auto or 5-speed manual' }
      },
      'GTS 1.8': {
        engine: '1.8L I4 (180 hp, 2ZZ-GE)',
        years: range(2000, 2005),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: '4.4 quarts 5W-30' },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 110, note: 'High-rev VVTL-i engine' }
      }
    }
  },

  'MR2': {
    trims: {
      'Spyder Base/PreRunner': {
        engine: '1.8L I4 (138 hp, 1ZZ-FE)',
        years: range(2000, 2005),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: '3.7 quarts 5W-30, mid-engine access from top' },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 100 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 130, note: '5-speed manual or SMT' }
      }
    }
  },

  'Echo': {
    trims: {
      'Base/S': {
        engine: '1.5L I4 (108 hp, 1NZ-FE)',
        years: range(2000, 2005),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 30, note: '3.7 quarts 5W-30' },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 80 }
      }
    }
  },

  'Yaris': {
    trims: {
      'L/LE/SE 1.5': {
        engine: '1.5L I4 (106 hp)',
        years: range(2007, 2020),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 35, note: '3.4 quarts 0W-20 (5W-30 pre-2012)' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 120, note: '4-speed auto or 5-speed manual' }
      }
    }
  },

  'Mirai': {
    trims: {
      'XLE/Limited': {
        engine: 'Hydrogen Fuel Cell (182 hp)',
        years: range(2021, 2025),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        serpentine_belt: { notApplicable: true },
        air_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 60, note: 'Fuel cell air filter requires clean air' },
        fuel_filter: { notApplicable: true, note: 'Hydrogen fuel cell, no conventional fuel filter' },
        transmission_fluid: { notApplicable: true },
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 }
      }
    }
  },

  'FJ Cruiser': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
    },
    trims: {
      'Base/Trail Teams 4.0 V6': {
        engine: '4.0L V6 (260 hp)',
        years: range(2007, 2014),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: '5.5 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180, note: 'V6 tight engine bay' },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: '5-speed auto or 6-speed manual' }
      }
    }
  },

  'bZ4X': {
    trims: {
      'XLE/Limited': {
        engine: 'Dual Electric Motors (214 hp combined)',
        years: range(2023, 2025),
        ...EV_NA,
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
        cabin_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 30 },
        brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 80 }
      }
    }
  }
};


// ─── HONDA MODELS ────────────────────────────────────────────────────────────

const hondaModels = {
  'Pilot': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
    },
    trims: {
      'LX/EX/EX-L/Touring 3.5 V6 3rd gen': {
        engine: '3.5L V6 (280 hp)',
        years: range(2016, 2022),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: '5.7 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: 'V6, rear bank tight clearance, J35Y6' },
        timing_belt: { notApplicable: true, note: 'J35 uses timing chain from 2016+' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: '6-speed auto or 9-speed auto (2019+), Honda ATF DW-1' }
      },
      'LX/EX-L/Touring/TrailSport 3.5 V6 4th gen': {
        engine: '3.5L V6 (285 hp)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: '5.7 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: 'V6, J35Y7' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: '10-speed auto' }
      },
      'EX/EX-L/Touring 3.5 V6 2nd gen': {
        engine: '3.5L V6 (250 hp)',
        years: range(2009, 2015),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: '4.5 quarts 0W-20' },
        timing_belt: { intervalMiles: 105000, intervalMonths: 84, cost: 950, note: 'J35Z4 uses timing belt' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: '5-speed auto' }
      }
    }
  },

  'Ridgeline': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
    },
    trims: {
      'RT/RTS/RTL/RTL-E/RTL-T 3.5 V6 1st gen': {
        engine: '3.5L V6 (247 hp)',
        years: range(2006, 2014),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: '4.5 quarts 5W-20' },
        timing_belt: { intervalMiles: 105000, intervalMonths: 84, cost: 950, note: 'J35A9 uses timing belt' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: '5-speed auto' }
      },
      'RT/RTL/RTL-E/Black Edition 3.5 V6 2nd gen': {
        engine: '3.5L V6 (280 hp)',
        years: range(2017, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: '5.7 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: '6-speed auto/9-speed auto, Honda ATF DW-1' }
      },
      'TrailSport 3.5 V6': {
        engine: '3.5L V6 (280-285 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 60, note: '5.7 quarts 0W-20' },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 120, note: 'Off-road variant, i-VTM4 AWD' }
      }
    }
  },

  'Passport': {
    trims: {
      'Sport/EX-L/Touring/Elite 3.5 V6': {
        engine: '3.5L V6 (280 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: '5.7 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: 'V6, J35Y6' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: '9-speed auto' }
      },
      'TrailSport 3.5 V6': {
        engine: '3.5L V6 (280-285 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 60, note: '5.7 quarts 0W-20' },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 120, note: 'i-VTM4 AWD, TrailSport duty' },
        transfer_case_fluid: { intervalMiles: 25000, intervalMonths: 24, cost: 100 }
      }
    }
  },

  'Odyssey': {
    trims: {
      'LX/EX/EX-L/Touring/Elite 3.5 V6 5th gen': {
        engine: '3.5L V6 (280 hp)',
        years: range(2018, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: '5.7 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: 'V6, J35Y7' },
        timing_belt: { notApplicable: true, note: 'J35Y uses timing chain' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: '10-speed auto, Honda ATF DW-1' }
      },
      'LX/EX/EX-L/Touring/Elite 3.5 V6 4th gen': {
        engine: '3.5L V6 (248 hp)',
        years: range(2011, 2017),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: '4.5 quarts 0W-20' },
        timing_belt: { intervalMiles: 105000, intervalMonths: 84, cost: 900, note: 'J35A7/J35Z2 uses timing belt' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: '5-speed/6-speed auto' }
      }
    }
  },

  'Insight': {
    trims: {
      'LX/EX/Touring 3rd gen': {
        engine: '1.5L Hybrid I4 (151 hp combined)',
        years: range(2019, 2022),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: '3.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      }
    }
  },

  'Fit': {
    trims: {
      'LX/EX/EX-L/Sport 1.5': {
        engine: '1.5L I4 (130 hp)',
        years: range(2015, 2020),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 40, note: '3.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120, note: 'CVT or 6-speed manual' }
      },
      'Base/Sport 1.5 2nd gen': {
        engine: '1.5L I4 (117 hp)',
        years: range(2009, 2014),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 35, note: '3.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110, note: '5-speed auto or 5-speed manual' }
      }
    }
  },

  'HR-V': {
    trims: {
      'LX/EX/EX-L/Touring 1.8 2nd gen': {
        engine: '1.8L I4 (141 hp)',
        years: range(2016, 2022),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: '3.7 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 130, note: 'CVT' }
      },
      'LX/EX-L/Sport/EX-L 2.0 3rd gen': {
        engine: '2.0L I4 (158 hp)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: '4.2 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140, note: 'CVT' }
      }
    }
  },

  'Prelude': {
    trims: {
      'Base/Type SH 2.2 VTEC': {
        engine: '2.2L I4 (195-200 hp, H22A4)',
        years: range(1997, 2001),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: '4.5 quarts 5W-30' },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110, note: '4-speed auto or 5-speed manual' }
      },
      'Hybrid (2025+)': {
        engine: '2.0L Hybrid I4 (estimated 200+ hp)',
        years: range(2025, 2026),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: '3.7 quarts 0W-20' },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      }
    }
  },

  'Element': {
    trims: {
      'LX/EX/EX-P/SC 2.4': {
        engine: '2.4L I4 (166 hp, K24A)',
        years: range(2003, 2011),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: '4.4 quarts 5W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120, note: '4-speed auto or 5-speed manual' }
      }
    }
  },

  'Clarity': {
    trims: {
      'PHEV Touring': {
        engine: '1.5L Atkinson Hybrid I4 (212 hp combined)',
        years: range(2018, 2021),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: '3.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
        serpentine_belt: HYBRID_NO_BELT
      },
      'Fuel Cell': {
        engine: 'Hydrogen Fuel Cell (174 hp)',
        years: range(2017, 2020),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        serpentine_belt: { notApplicable: true },
        transmission_fluid: { notApplicable: true },
        fuel_filter: { notApplicable: true, note: 'Hydrogen fuel cell' },
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 }
      },
      'Electric': {
        engine: 'Electric Motor (161 hp)',
        years: range(2017, 2019),
        ...EV_NA,
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 }
      }
    }
  },

  'CR-Z': {
    trims: {
      'Base/EX': {
        engine: '1.5L Hybrid I4 (130 hp combined)',
        years: range(2011, 2016),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 40, note: '3.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110, note: 'CVT or 6-speed manual' }
      }
    }
  },

  'S2000': {
    trims: {
      'Base/CR (AP1/AP2)': {
        engine: '2.0-2.2L VTEC I4 (237-240 hp, F20C/F22C1)',
        years: range(2000, 2009),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: '5.1 quarts 10W-30, 9000 RPM redline' },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 110, note: 'High-rev engine, frequent changes' },
        transmission_fluid: { intervalMiles: 25000, intervalMonths: 24, cost: 100, note: '6-speed manual, Honda MTF' },
        differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 80 }
      }
    }
  },

  'Prologue': {
    trims: {
      'EX/Touring': {
        engine: 'Dual Electric Motors (288 hp combined)',
        years: range(2024, 2025),
        ...EV_NA,
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
        cabin_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 30 },
        brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 80 }
      }
    }
  }
};


// ─── NISSAN MODELS ───────────────────────────────────────────────────────────

const nissanModels = {
  'Sentra': {
    trims: {
      'S/SV/SR 1.8': {
        engine: '1.8L I4 (124-130 hp)',
        years: range(2013, 2019),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: '4.2 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 160, note: 'CVT, Nissan NS-3' }
      },
      'S/SV/SR 2.0 8th gen': {
        engine: '2.0L I4 (149 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: '4.8 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 110 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 170, note: 'CVT, Nissan NS-3' }
      },
      'NISMO 1.6T': {
        engine: '1.6L Turbo I4 (188 hp)',
        years: range(2017, 2019),
        oil_change: { intervalMiles: 3750, intervalMonths: 6, cost: 50, note: '4.2 quarts 5W-30, turbo requires shorter interval' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 130 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 170, note: 'CVT or 6-speed manual' }
      }
    }
  },

  'Maxima': {
    trims: {
      'S/SV/SL/SR/Platinum 3.5 V6': {
        engine: '3.5L V6 (300 hp, VQ35DE)',
        years: range(2016, 2023),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: '5.1 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: 'V6, rear bank difficult access' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 190, note: 'CVT, Nissan NS-3' }
      },
      'SE/SL/GLE 3.5 V6 6th/7th gen': {
        engine: '3.5L V6 (255-290 hp, VQ35DE)',
        years: range(2004, 2015),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: '4.9 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 180, note: 'CVT, Nissan NS-2/NS-3' }
      }
    }
  },

  'Quest': {
    trims: {
      'S/SV/SL/Platinum 3.5 V6': {
        engine: '3.5L V6 (260 hp, VQ35DE)',
        years: range(2011, 2017),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: '5.1 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 190, note: 'CVT, Nissan NS-3' }
      }
    }
  },

  'Pathfinder': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
    },
    trims: {
      'S/SV/SL/Platinum 3.5 V6 4th gen': {
        engine: '3.5L V6 (284 hp)',
        years: range(2013, 2020),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: '5.1 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 190, note: 'CVT, Nissan NS-3' }
      },
      'S/SV/SL/Platinum/Rock Creek 3.5 V6 5th gen': {
        engine: '3.5L V6 (284 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: '5.1 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 190, note: '9-speed auto ZF' }
      }
    }
  },

  'Frontier': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
    },
    trims: {
      'S/SV 2.5 I4': {
        engine: '2.5L I4 (152 hp, QR25DE)',
        years: range(2005, 2019),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: '4.9 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 110 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 160, note: '5-speed auto or 6-speed manual' }
      },
      'SV/SL/Pro-4X/PRO-X 4.0 V6': {
        engine: '4.0L V6 (261 hp, VQ40DE)',
        years: range(2005, 2021),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: '5.6 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180, note: 'V6, rear bank tight clearance' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 170, note: '5-speed auto or 6-speed manual' }
      },
      'S/SV 3.8 V6 3rd gen': {
        engine: '3.8L V6 (310 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: '6.3 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180, note: 'V6, direct injection' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 190, note: '9-speed auto' }
      },
      'PRO-4X/PRO-X/Desert Runner 3.8 V6': {
        engine: '3.8L V6 (310 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: '6.3 quarts 0W-20' },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 130, note: 'Off-road duty, locking rear diff' },
        transfer_case_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 110 }
      }
    }
  },

  'Xterra': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
    },
    trims: {
      'S/SV/X/Off-Road/SE 4.0 V6': {
        engine: '4.0L V6 (261 hp, VQ40DE)',
        years: range(2005, 2015),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: '5.6 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180, note: 'V6' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 170, note: '5-speed auto or 6-speed manual' }
      },
      'PRO-4X 4.0 V6': {
        engine: '4.0L V6 (261 hp)',
        years: range(2009, 2015),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: '5.6 quarts 5W-30' },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 130, note: 'Off-road severe duty' },
        transfer_case_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 110 }
      }
    }
  },

  '350Z': {
    trims: {
      'Base/Touring/Enthusiast 3.5': {
        engine: '3.5L V6 (287-306 hp, VQ35DE/HR)',
        years: range(2003, 2009),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: '4.6 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 140, note: '5-speed auto or 6-speed manual' },
        differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 90 }
      },
      'NISMO': {
        engine: '3.5L V6 (300-350 hp, VQ35HR)',
        years: range(2007, 2009),
        oil_change: { intervalMiles: 3750, intervalMonths: 6, cost: 55, note: '4.6 quarts 5W-30, performance duty' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 200 },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 100, note: 'Viscous LSD' }
      }
    }
  },

  '370Z': {
    trims: {
      'Base/Touring/Sport 3.7': {
        engine: '3.7L V6 (332 hp, VQ37VHR)',
        years: range(2009, 2020),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: '5.1 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 150, note: '7-speed auto or 6-speed manual' },
        differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 90 }
      },
      'NISMO': {
        engine: '3.7L V6 (350 hp, VQ37VHR)',
        years: range(2009, 2020),
        oil_change: { intervalMiles: 3750, intervalMonths: 6, cost: 60, note: '5.1 quarts 5W-30, performance duty' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 200 },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 100, note: 'Viscous LSD' }
      }
    }
  },

  'Z': {
    trims: {
      'Sport/Performance 3.0T': {
        engine: '3.0L Twin-Turbo V6 (400 hp, VR30DDTT)',
        years: range(2023, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 65, note: '5.4 quarts 0W-20' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 200, note: 'Twin-turbo, shorter interval' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 160, note: '9-speed auto or 6-speed manual' },
        differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
      },
      'NISMO': {
        engine: '3.0L Twin-Turbo V6 (420 hp, VR30DDTT)',
        years: range(2024, 2025),
        oil_change: { intervalMiles: 3750, intervalMonths: 6, cost: 70, note: '5.4 quarts 0W-20, performance duty' },
        spark_plugs: { intervalMiles: 40000, intervalMonths: 42, cost: 210 },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 110, note: 'Mechanical LSD' },
        transmission_fluid: { intervalMiles: 25000, intervalMonths: 24, cost: 130, note: '6-speed manual, rev-matching' }
      }
    }
  },

  'Murano': {
    trims: {
      'S/SV/SL/Platinum 3.5 V6': {
        engine: '3.5L V6 (260 hp, VQ35DE)',
        years: range(2009, 2024),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: '5.1 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: 'V6, rear bank tight' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 190, note: 'CVT, Nissan NS-3' }
      }
    }
  },

  'Titan': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 }
    },
    trims: {
      'S/SV/SL/Pro-4X/Platinum 5.6 V8': {
        engine: '5.6L V8 (390-400 hp, VK56VD)',
        years: range(2004, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 60, note: '6.9 quarts 0W-20 (5W-30 pre-2016)' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: '8 spark plugs, coil-on-plug' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 200, note: '7-speed auto or 9-speed auto' }
      },
      'XD S/SV/SL/Pro-4X/Platinum 5.0 Cummins Diesel': {
        engine: '5.0L Cummins Turbo Diesel V8 (310 hp)',
        years: range(2016, 2019),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 85, note: '12.0 quarts 5W-40 diesel, Cummins turbo diesel' },
        spark_plugs: { notApplicable: true },
        fuel_filter: { intervalMiles: 20000, intervalMonths: 24, cost: 80, note: 'Primary and secondary fuel filters' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 200, note: '6-speed Aisin auto' }
      },
      'PRO-4X 5.6 V8': {
        engine: '5.6L V8 (400 hp)',
        years: range(2017, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 65, note: '6.9 quarts 0W-20' },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 140, note: 'Off-road severe duty, locking rear diff' },
        transfer_case_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 120 }
      }
    }
  },

  'Armada': {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 }
    },
    trims: {
      'SV/SL/Platinum 5.6 V8': {
        engine: '5.6L V8 (390-400 hp, VK56VD)',
        years: range(2005, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 60, note: '6.9 quarts 0W-20 (5W-30 pre-2017)' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: '8 spark plugs, coil-on-plug' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 200, note: '7-speed auto' }
      }
    }
  },

  'Versa': {
    trims: {
      'S/SV/SR 1.6': {
        engine: '1.6L I4 (109-122 hp)',
        years: range(2012, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 35, note: '3.7 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 90 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 160, note: 'CVT, Nissan NS-3' }
      }
    }
  },

  'NV': {
    trims: {
      'NV1500/NV2500/NV3500 4.0 V6': {
        engine: '4.0L V6 (261 hp, VQ40DE)',
        years: range(2012, 2021),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: '5.6 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 170, note: '5-speed auto' }
      },
      'NV2500/NV3500 5.6 V8': {
        engine: '5.6L V8 (375 hp, VK56VD)',
        years: range(2012, 2021),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 60, note: '6.9 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: '8 spark plugs' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 200, note: '5-speed auto' }
      }
    }
  },

  'Juke': {
    trims: {
      'S/SV/SL 1.6T': {
        engine: '1.6L Turbo I4 (188 hp)',
        years: range(2011, 2017),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: '4.6 quarts 5W-30' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 170, note: 'CVT or 6-speed manual' }
      },
      'NISMO/NISMO RS 1.6T': {
        engine: '1.6L Turbo I4 (197-215 hp)',
        years: range(2013, 2017),
        oil_change: { intervalMiles: 3750, intervalMonths: 6, cost: 50, note: '4.6 quarts 5W-30, turbo performance duty' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 140 }
      }
    }
  },

  'Leaf': {
    trims: {
      'S/SV/SL/S Plus/SV Plus/SL Plus': {
        engine: 'Electric Motor (147-214 hp)',
        years: range(2011, 2024),
        ...EV_NA,
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
        cabin_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 25 },
        brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 80 }
      }
    }
  },

  'Ariya': {
    trims: {
      'Engage/Venture+/Evolve+/Empower+/Platinum+': {
        engine: 'Electric Motor(s) (238-389 hp)',
        years: range(2023, 2025),
        ...EV_NA,
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
        cabin_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 30 },
        brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 80 }
      }
    }
  },

  'Cube': {
    trims: {
      'Base/S/SL/Krom 1.8': {
        engine: '1.8L I4 (122 hp)',
        years: range(2009, 2014),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 35, note: '4.2 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 160, note: 'CVT, Nissan NS-2' }
      }
    }
  },

  'GT-R': {
    trims: {
      'Premium/Track Edition/Black Edition': {
        engine: '3.8L Twin-Turbo V6 (565 hp, VR38DETT)',
        years: range(2009, 2025),
        oil_change: { intervalMiles: 3750, intervalMonths: 6, cost: 100, note: '5.5 quarts 0W-40 Mobil 1, hand-built engine' },
        spark_plugs: { intervalMiles: 40000, intervalMonths: 42, cost: 250, note: '6 spark plugs, iridium, twin-turbo' },
        transmission_fluid: { intervalMiles: 20000, intervalMonths: 18, cost: 350, note: 'GR6 dual-clutch transaxle, Nissan R35 Special fluid' },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 18, cost: 200, note: 'Rear transaxle, limited slip' }
      },
      'NISMO': {
        engine: '3.8L Twin-Turbo V6 (600 hp, VR38DETT)',
        years: range(2014, 2025),
        oil_change: { intervalMiles: 3000, intervalMonths: 3, cost: 120, note: '5.5 quarts 0W-40, NISMO race-prepped engine' },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 280, note: '6 spark plugs, competition duty' },
        transmission_fluid: { intervalMiles: 15000, intervalMonths: 12, cost: 400, note: 'GR6 dual-clutch, competition duty' },
        differential_fluid: { intervalMiles: 15000, intervalMonths: 12, cost: 220, note: 'Race-spec LSD' }
      }
    }
  },

  '240SX': {
    trims: {
      'Base/SE/LE (S13/S14)': {
        engine: '2.4L I4 (155 hp, KA24DE)',
        years: range(1990, 1998),
        oil_change: { intervalMiles: 3750, intervalMonths: 6, cost: 30, note: '4.4 quarts 5W-30' },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 60 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100, note: '4-speed auto or 5-speed manual' },
        differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 70 }
      }
    }
  },

  '300ZX': {
    trims: {
      'Base 3.0 NA': {
        engine: '3.0L V6 (222 hp, VG30DE)',
        years: range(1990, 1996),
        oil_change: { intervalMiles: 3750, intervalMonths: 6, cost: 40, note: '4.4 quarts 5W-30' },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 120, note: 'V6, tight engine bay' },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120, note: '4-speed auto or 5-speed manual' },
        differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 80 },
        timing_belt: { intervalMiles: 60000, intervalMonths: 48, cost: 700, note: 'VG30DE uses timing belt' }
      },
      'Twin Turbo 3.0': {
        engine: '3.0L Twin-Turbo V6 (300 hp, VG30DETT)',
        years: range(1990, 1996),
        oil_change: { intervalMiles: 3000, intervalMonths: 3, cost: 50, note: '4.4 quarts 5W-30, twin-turbo requires shorter interval' },
        spark_plugs: { intervalMiles: 20000, intervalMonths: 24, cost: 150, note: 'V6 TT, extremely tight engine bay' },
        timing_belt: { intervalMiles: 60000, intervalMonths: 48, cost: 850, note: 'VG30DETT uses timing belt, complex job' },
        differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 90, note: 'Viscous LSD' }
      }
    }
  },

  'Rogue Sport': {
    trims: {
      'S/SV/SL 2.0': {
        engine: '2.0L I4 (141 hp)',
        years: range(2017, 2022),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: '4.6 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 110 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 170, note: 'CVT, Nissan NS-3' }
      }
    }
  },

  'Kicks': {
    trims: {
      'S/SV/SR 1.6': {
        engine: '1.6L I4 (122 hp)',
        years: range(2018, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: '3.7 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 160, note: 'CVT, Nissan NS-3' }
      }
    }
  }
};


// ─── MAIN SCRIPT ─────────────────────────────────────────────────────────────

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// Models that already have trims and should NOT be overwritten
const toyotaProtected = ['4Runner', 'Tacoma', 'Camry', 'RAV4'];
const hondaProtected = ['Civic', 'Accord', 'CR-V'];
const nissanProtected = ['Altima', 'Rogue'];

let modelsAdded = 0;
let trimsAdded = 0;

function mergeModelData(makeObj, modelName, modelData, protectedList) {
  if (protectedList.includes(modelName)) {
    console.log(`  SKIP (protected): ${modelName}`);
    return;
  }

  // Get or create the model entry
  if (!makeObj.models) makeObj.models = {};
  const existing = makeObj.models[modelName] || {};

  // Merge _defaults (keep existing, add new)
  if (modelData._defaults) {
    existing._defaults = { ...(existing._defaults || {}), ...modelData._defaults };
  }

  // Set trims (these models shouldn't already have trims since they're not protected)
  if (modelData.trims) {
    if (!existing.trims) {
      existing.trims = modelData.trims;
      const trimCount = Object.keys(modelData.trims).length;
      trimsAdded += trimCount;
      console.log(`  ADD: ${modelName} (${trimCount} trims)`);
    } else {
      // Merge individual trim entries
      let newCount = 0;
      for (const [trimKey, trimVal] of Object.entries(modelData.trims)) {
        if (!existing.trims[trimKey]) {
          existing.trims[trimKey] = trimVal;
          newCount++;
        }
      }
      trimsAdded += newCount;
      console.log(`  MERGE: ${modelName} (+${newCount} trims)`);
    }
    modelsAdded++;
  }

  makeObj.models[modelName] = existing;
}

// Process Toyota
console.log('\n=== TOYOTA ===');
for (const [model, mData] of Object.entries(toyotaModels)) {
  mergeModelData(data.makes.Toyota, model, mData, toyotaProtected);
}

// Process Honda
console.log('\n=== HONDA ===');
for (const [model, mData] of Object.entries(hondaModels)) {
  mergeModelData(data.makes.Honda, model, mData, hondaProtected);
}

// Process Nissan
console.log('\n=== NISSAN ===');
for (const [model, mData] of Object.entries(nissanModels)) {
  mergeModelData(data.makes.Nissan, model, mData, nissanProtected);
}

// ─── UPDATE EV & HYBRID MODEL LISTS ─────────────────────────────────────────

// Add new EVs
const newEvs = {
  Toyota: ['bZ4X', 'Mirai'],
  Honda: ['Prologue', 'Clarity'],
};
for (const [make, models] of Object.entries(newEvs)) {
  if (!data.evModels[make]) data.evModels[make] = [];
  for (const m of models) {
    if (!data.evModels[make].includes(m)) {
      data.evModels[make].push(m);
    }
  }
}

// Add new hybrids
const newHybrids = {
  Toyota: ['Corolla Hybrid', 'Crown', 'Grand Highlander Hybrid MAX', 'Avalon Hybrid', 'Sequoia i-FORCE MAX', 'Tundra i-FORCE MAX', 'Land Cruiser i-FORCE MAX', 'Corolla Cross Hybrid', 'Prius Prime', 'bZ4X'],
  Honda: ['Clarity PHEV', 'CR-Z', 'Prelude Hybrid'],
};
for (const [make, models] of Object.entries(newHybrids)) {
  if (!data.hybridModels[make]) data.hybridModels[make] = [];
  for (const m of models) {
    if (!data.hybridModels[make].includes(m)) {
      data.hybridModels[make].push(m);
    }
  }
}

// Write back
fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log(`\n=== SUMMARY ===`);
console.log(`Models added/updated: ${modelsAdded}`);
console.log(`Trims added: ${trimsAdded}`);
console.log(`File written: ${FILE}`);

// Count total trims across all makes
let totalTrims = 0;
let totalModelsWithTrims = 0;
for (const [makeName, makeData] of Object.entries(data.makes)) {
  if (makeData.models) {
    for (const [modelName, modelData] of Object.entries(makeData.models)) {
      if (modelData.trims) {
        totalModelsWithTrims++;
        totalTrims += Object.keys(modelData.trims).length;
      }
    }
  }
}
console.log(`\nTotal models with trims (all makes): ${totalModelsWithTrims}`);
console.log(`Total trim entries (all makes): ${totalTrims}`);
