/**
 * Batch 4a: Add trim-based maintenance schedules for remaining Chevrolet, GMC, and Cadillac models
 *
 * Chevrolet: Tahoe, Suburban, Malibu, Colorado, Traverse, Cruze, Trax, Blazer, Trailblazer,
 *            Silverado 2500HD, Silverado 3500HD, Bolt EV, Bolt EUV, Volt, Impala
 * GMC: Sierra 1500, Canyon, Sierra 2500HD, Yukon, Yukon XL, Acadia, Terrain, Hummer EV
 * Cadillac: Escalade, CT5, CT4, CTS, XT5, XT4, XT6, CT6, Lyriq, CTS-V
 *
 * Does NOT overwrite existing trim data (Camaro, Silverado 1500, Corvette, Equinox already done).
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'data', 'maintenance-overrides.json');
const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);

// ─── CHEVROLET MODELS ─────────────────────────────────────────────────────────

const chevroletModels = {
  "Tahoe": {
    "_defaults": {
      "transfer_case_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 110 },
      "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 130 }
    },
    "trims": {
      "LS/LT/Premier 5.3 V8": {
        "engine": "5.3L V8 EcoTec3 (L84, 355 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 75, "note": "8 quarts 0W-20 Dexos1, DFM" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 240 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "10-speed auto" }
      },
      "RST/High Country 6.2 V8": {
        "engine": "6.2L V8 EcoTec3 (L87, 420 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 80, "note": "8 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 260 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 210, "note": "10-speed auto" }
      },
      "LT/Z71/Premier Diesel/Duramax": {
        "engine": "3.0L Duramax Turbo-Diesel I6 (LM2, 277 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 90, "note": "8 quarts 0W-20 Dexos2" },
        "spark_plugs": { "notApplicable": true },
        "fuel_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 80, "note": "Dual fuel filter system" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "10-speed auto" }
      },
      "LS/LT/LTZ 5.3 V8 4th Gen": {
        "engine": "5.3L V8 EcoTec3 (L83, 355 hp)",
        "years": range(2015, 2020),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 70, "note": "8 quarts 5W-30 Dexos1, AFM" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 230 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 190, "note": "6-speed auto" }
      }
    }
  },

  "Suburban": {
    "_defaults": {
      "transfer_case_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 110 },
      "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 130 }
    },
    "trims": {
      "LS/LT/Premier 5.3 V8": {
        "engine": "5.3L V8 EcoTec3 (L84, 355 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 75, "note": "8 quarts 0W-20 Dexos1, DFM" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 240 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "10-speed auto" }
      },
      "RST/High Country 6.2 V8": {
        "engine": "6.2L V8 EcoTec3 (L87, 420 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 80, "note": "8 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 260 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 210, "note": "10-speed auto" }
      },
      "Diesel/Duramax": {
        "engine": "3.0L Duramax Turbo-Diesel I6 (LM2, 277 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 90, "note": "8 quarts 0W-20 Dexos2" },
        "spark_plugs": { "notApplicable": true },
        "fuel_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 80, "note": "Dual fuel filter system" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "10-speed auto" }
      }
    }
  },

  "Malibu": {
    "trims": {
      "LS/RS/LT/Premier 1.5T": {
        "engine": "1.5L Turbo I4 (LFV, 160 hp)",
        "years": range(2016, 2024),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 45, "note": "4.2 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 140 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 150, "note": "CVT (2019+) or 6-speed auto" }
      },
      "Premier 2.0T": {
        "engine": "2.0L Turbo I4 (LTG, 250 hp)",
        "years": range(2016, 2020),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 55, "note": "5 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 160 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 160, "note": "9-speed auto" }
      }
    }
  },

  "Colorado": {
    "_defaults": {
      "transfer_case_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 100 },
      "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 110 }
    },
    "trims": {
      "WT/LT/Z71 2.7T": {
        "engine": "2.7L Turbo I4 (L3B, 310 hp)",
        "years": range(2023, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 60, "note": "6 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 160 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 170, "note": "8-speed auto" }
      },
      "ZR2/ZR2 Bison 2.7T": {
        "engine": "2.7L Turbo I4 (L3B, 310 hp)",
        "years": range(2023, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 65, "note": "6 quarts 0W-20 Dexos1, severe duty if off-road" },
        "differential_fluid": { "intervalMiles": 30000, "intervalMonths": 24, "cost": 130, "note": "Front/rear e-lockers" },
        "transfer_case_fluid": { "intervalMiles": 30000, "intervalMonths": 24, "cost": 110 }
      },
      "WT/LT/Z71 V6 2nd Gen": {
        "engine": "3.6L V6 (LGZ, 308 hp)",
        "years": range(2015, 2022),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 55, "note": "6 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 200 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 170, "note": "8-speed auto" }
      },
      "ZR2/LT Diesel/Duramax 2nd Gen": {
        "engine": "2.8L Duramax Turbo-Diesel I4 (LWN, 181 hp)",
        "years": range(2016, 2022),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 70, "note": "6 quarts 5W-30 Dexos2" },
        "spark_plugs": { "notApplicable": true },
        "fuel_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 70 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 170, "note": "6-speed auto" }
      }
    }
  },

  "Traverse": {
    "trims": {
      "LS/LT/RS/Premier/High Country": {
        "engine": "2.5L Turbo I4 (LLY, 328 hp)",
        "years": range(2024, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 60, "note": "5.5 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 160 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 180, "note": "8-speed auto" }
      },
      "LS/LT/RS/Premier/High Country V6": {
        "engine": "3.6L V6 (LFY, 310 hp)",
        "years": range(2018, 2023),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 60, "note": "6 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 220, "note": "V6 rear bank tight access" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 180, "note": "9-speed auto" }
      }
    }
  },

  "Cruze": {
    "trims": {
      "L/LS/LT/Premier 1.4T": {
        "engine": "1.4L Turbo I4 (LE2, 153 hp)",
        "years": range(2016, 2019),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 45, "note": "4.2 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 130 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 140, "note": "6-speed auto" }
      },
      "LT/Premier Diesel": {
        "engine": "1.6L Turbo-Diesel I4 (LH7, 137 hp)",
        "years": range(2017, 2019),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 55, "note": "4.5 quarts 0W-30 Dexos2" },
        "spark_plugs": { "notApplicable": true },
        "fuel_filter": { "intervalMiles": 30000, "intervalMonths": 24, "cost": 60 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 150, "note": "9-speed auto" }
      }
    }
  },

  "Trax": {
    "trims": {
      "LS/LT/Activ 1.2T": {
        "engine": "1.2L Turbo I3 (LIH, 137 hp)",
        "years": range(2024, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 40, "note": "4 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 110 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 140, "note": "CVT" }
      },
      "LS/LT/Premier 1.4T 1st Gen": {
        "engine": "1.4L Turbo I4 (LE2, 138 hp)",
        "years": range(2015, 2022),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 42, "note": "4 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 120 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 140, "note": "6-speed auto" }
      }
    }
  },

  "Blazer": {
    "trims": {
      "LT/RS/Premier 2.0T": {
        "engine": "2.0L Turbo I4 (LSY, 228 hp)",
        "years": range(2019, 2023),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 55, "note": "5 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 160 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 170, "note": "9-speed auto" }
      },
      "RS/Premier V6": {
        "engine": "3.6L V6 (LGX, 308 hp)",
        "years": range(2019, 2023),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 60, "note": "6 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 210 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 180, "note": "9-speed auto" }
      },
      "EV": {
        "engine": "Electric (Ultium, up to 557 hp)",
        "years": range(2024, 2025),
        "oil_change": { "notApplicable": true },
        "spark_plugs": { "notApplicable": true },
        "serpentine_belt": { "notApplicable": true },
        "air_filter": { "notApplicable": true },
        "fuel_filter": { "notApplicable": true },
        "transmission_fluid": { "notApplicable": true },
        "ev_battery_check": { "intervalMiles": 15000, "intervalMonths": 12, "cost": 0 }
      }
    }
  },

  "Trailblazer": {
    "trims": {
      "LS/LT 1.2T": {
        "engine": "1.2L Turbo I3 (LIH, 137 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 42, "note": "4.2 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 110 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 140, "note": "CVT" }
      },
      "RS/Activ 1.3T": {
        "engine": "1.3L Turbo I3 (L3T, 155 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 45, "note": "4.2 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 120 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 150, "note": "9-speed auto or CVT" }
      }
    }
  },

  "Silverado 2500HD": {
    "_defaults": {
      "transfer_case_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 110 },
      "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 130 }
    },
    "trims": {
      "WT/Custom/LT/LTZ 6.6 Gas V8": {
        "engine": "6.6L V8 (L8T, 401 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 80, "note": "8 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 240 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "6-speed Allison auto" }
      },
      "LT/LTZ/High Country Diesel/Duramax": {
        "engine": "6.6L Duramax Turbo-Diesel V8 (L5P, 445 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 110, "note": "10 quarts 15W-40 or 5W-40 CK-4" },
        "spark_plugs": { "notApplicable": true },
        "fuel_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 90, "note": "Dual fuel filter system" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 220, "note": "10-speed Allison auto" }
      }
    }
  },

  "Silverado 3500HD": {
    "_defaults": {
      "transfer_case_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 110 },
      "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 140 }
    },
    "trims": {
      "WT/LT/LTZ 6.6 Gas V8": {
        "engine": "6.6L V8 (L8T, 401 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 80, "note": "8 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 240 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "6-speed Allison auto" }
      },
      "LTZ/High Country Diesel/Duramax": {
        "engine": "6.6L Duramax Turbo-Diesel V8 (L5P, 445 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 110, "note": "10 quarts 15W-40 or 5W-40 CK-4" },
        "spark_plugs": { "notApplicable": true },
        "fuel_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 90, "note": "Dual fuel filter system" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 220, "note": "10-speed Allison auto" }
      }
    }
  },

  "Bolt EV": {
    "trims": {
      "1LT/2LT/Premier": {
        "engine": "Electric (200 hp, 66 kWh battery)",
        "years": range(2017, 2023),
        "oil_change": { "notApplicable": true },
        "spark_plugs": { "notApplicable": true },
        "serpentine_belt": { "notApplicable": true },
        "air_filter": { "notApplicable": true },
        "fuel_filter": { "notApplicable": true },
        "transmission_fluid": { "notApplicable": true },
        "ev_battery_check": { "intervalMiles": 30000, "intervalMonths": 24, "cost": 0 },
        "cabin_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 25 },
        "brake_fluid": { "intervalMiles": 45000, "intervalMonths": 60, "cost": 80, "note": "Regen braking extends brake life" }
      }
    }
  },

  "Bolt EUV": {
    "trims": {
      "LT/Premier": {
        "engine": "Electric (200 hp, 65 kWh battery)",
        "years": range(2022, 2023),
        "oil_change": { "notApplicable": true },
        "spark_plugs": { "notApplicable": true },
        "serpentine_belt": { "notApplicable": true },
        "air_filter": { "notApplicable": true },
        "fuel_filter": { "notApplicable": true },
        "transmission_fluid": { "notApplicable": true },
        "ev_battery_check": { "intervalMiles": 30000, "intervalMonths": 24, "cost": 0 },
        "cabin_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 25 },
        "brake_fluid": { "intervalMiles": 45000, "intervalMonths": 60, "cost": 80, "note": "Regen braking extends brake life" }
      }
    }
  },

  "Volt": {
    "trims": {
      "LT/Premier 1st Gen": {
        "engine": "1.4L I4 Range Extender + Electric (149 hp combined)",
        "years": range(2011, 2015),
        "oil_change": { "intervalMiles": 24000, "intervalMonths": 24, "cost": 50, "note": "3.5 quarts 5W-30 Dexos1, engine runs infrequently" },
        "spark_plugs": { "intervalMiles": 100000, "intervalMonths": 120, "cost": 130 },
        "transmission_fluid": { "notApplicable": true, "note": "No traditional transmission" },
        "ev_battery_check": { "intervalMiles": 30000, "intervalMonths": 24, "cost": 0 }
      },
      "LT/Premier 2nd Gen": {
        "engine": "1.5L I4 Range Extender + Electric (149 hp combined)",
        "years": range(2016, 2019),
        "oil_change": { "intervalMiles": 24000, "intervalMonths": 24, "cost": 50, "note": "4 quarts 0W-20 Dexos1, engine runs infrequently" },
        "spark_plugs": { "intervalMiles": 100000, "intervalMonths": 120, "cost": 130 },
        "transmission_fluid": { "notApplicable": true, "note": "No traditional transmission" },
        "ev_battery_check": { "intervalMiles": 30000, "intervalMonths": 24, "cost": 0 }
      }
    }
  },

  "Impala": {
    "trims": {
      "LS/LT 2.5 I4": {
        "engine": "2.5L I4 (LCV/LKW, 196 hp)",
        "years": range(2014, 2020),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 50, "note": "5 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 140 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 160, "note": "6-speed auto" }
      },
      "LT/Premier V6": {
        "engine": "3.6L V6 (LFX/LGX, 305 hp)",
        "years": range(2014, 2020),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 60, "note": "6 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 210 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 170, "note": "6-speed auto" }
      }
    }
  }
};

// ─── GMC MODELS ───────────────────────────────────────────────────────────────

const gmcModels = {
  "Sierra 1500": {
    "_defaults": {
      "transfer_case_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 110 },
      "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 130 }
    },
    "trims": {
      "Pro/SLE/Elevation 2.7T": {
        "engine": "2.7L Turbo I4 (L3B, 310 hp)",
        "years": range(2019, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 60, "note": "6 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 160 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 180, "note": "8-speed auto" }
      },
      "SLE/SLT/AT4/Denali 5.3 V8": {
        "engine": "5.3L V8 EcoTec3 (L84, 355 hp)",
        "years": range(2019, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 75, "note": "8 quarts 0W-20 Dexos1, DFM" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 240 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "10-speed auto" }
      },
      "AT4/Denali/Denali Ultimate 6.2 V8": {
        "engine": "6.2L V8 EcoTec3 (L87, 420 hp)",
        "years": range(2019, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 80, "note": "8 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 260 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 210, "note": "10-speed auto" }
      },
      "AT4/Denali Diesel/Duramax": {
        "engine": "3.0L Duramax Turbo-Diesel I6 (LM2, 277 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 90, "note": "8 quarts 0W-20 Dexos2" },
        "spark_plugs": { "notApplicable": true },
        "fuel_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 80, "note": "Dual fuel filter system" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "10-speed auto" }
      }
    }
  },

  "Canyon": {
    "_defaults": {
      "transfer_case_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 100 },
      "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 110 }
    },
    "trims": {
      "Elevation/SLE/SLT/AT4 2.7T": {
        "engine": "2.7L Turbo I4 (L3B, 310 hp)",
        "years": range(2023, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 60, "note": "6 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 160 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 170, "note": "8-speed auto" }
      },
      "AT4X/Denali 2.7T": {
        "engine": "2.7L Turbo I4 (L3B, 310 hp)",
        "years": range(2023, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 65, "note": "6 quarts 0W-20 Dexos1, severe duty if off-road" },
        "differential_fluid": { "intervalMiles": 30000, "intervalMonths": 24, "cost": 130, "note": "Front/rear e-lockers" },
        "transfer_case_fluid": { "intervalMiles": 30000, "intervalMonths": 24, "cost": 110 }
      },
      "SLE/SLT/All Terrain V6 2nd Gen": {
        "engine": "3.6L V6 (LGZ, 308 hp)",
        "years": range(2015, 2022),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 55, "note": "6 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 200 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 170, "note": "8-speed auto" }
      }
    }
  },

  "Sierra 2500HD": {
    "_defaults": {
      "transfer_case_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 110 },
      "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 140 }
    },
    "trims": {
      "Pro/SLE/SLT/AT4 6.6 Gas V8": {
        "engine": "6.6L V8 (L8T, 401 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 80, "note": "8 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 240 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "6-speed Allison auto" }
      },
      "AT4/Denali Diesel/Duramax": {
        "engine": "6.6L Duramax Turbo-Diesel V8 (L5P, 445 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 110, "note": "10 quarts 15W-40 or 5W-40 CK-4" },
        "spark_plugs": { "notApplicable": true },
        "fuel_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 90, "note": "Dual fuel filter system" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 220, "note": "10-speed Allison auto" }
      }
    }
  },

  "Yukon": {
    "_defaults": {
      "transfer_case_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 110 },
      "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 130 }
    },
    "trims": {
      "SLE/SLT/AT4 5.3 V8": {
        "engine": "5.3L V8 EcoTec3 (L84, 355 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 75, "note": "8 quarts 0W-20 Dexos1, DFM" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 240 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "10-speed auto" }
      },
      "Denali/Denali Ultimate 6.2 V8": {
        "engine": "6.2L V8 EcoTec3 (L87, 420 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 80, "note": "8 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 260 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 210, "note": "10-speed auto" }
      },
      "AT4/Denali Diesel/Duramax": {
        "engine": "3.0L Duramax Turbo-Diesel I6 (LM2, 277 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 90, "note": "8 quarts 0W-20 Dexos2" },
        "spark_plugs": { "notApplicable": true },
        "fuel_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 80, "note": "Dual fuel filter system" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "10-speed auto" }
      }
    }
  },

  "Yukon XL": {
    "_defaults": {
      "transfer_case_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 110 },
      "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 130 }
    },
    "trims": {
      "SLE/SLT/AT4 5.3 V8": {
        "engine": "5.3L V8 EcoTec3 (L84, 355 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 75, "note": "8 quarts 0W-20 Dexos1, DFM" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 240 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 200, "note": "10-speed auto" }
      },
      "Denali/Denali Ultimate 6.2 V8": {
        "engine": "6.2L V8 EcoTec3 (L87, 420 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 80, "note": "8 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 260 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 210, "note": "10-speed auto" }
      }
    }
  },

  "Acadia": {
    "trims": {
      "SLE/SLT/AT4/Denali 2.5T": {
        "engine": "2.5L Turbo I4 (LLY, 328 hp)",
        "years": range(2024, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 60, "note": "5.5 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 160 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 180, "note": "8-speed auto" }
      },
      "SLE/SLT/AT4/Denali 3.6 V6": {
        "engine": "3.6L V6 (LGX, 310 hp)",
        "years": range(2017, 2023),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 60, "note": "6 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 210 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 180, "note": "9-speed auto" }
      },
      "SLE/SLT 2.5 I4": {
        "engine": "2.5L I4 (LCV, 193 hp)",
        "years": range(2017, 2020),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 50, "note": "5 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 140 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 160, "note": "6-speed auto" }
      }
    }
  },

  "Terrain": {
    "trims": {
      "SLE/SLT/AT4/Denali 1.5T": {
        "engine": "1.5L Turbo I4 (LYX, 175 hp)",
        "years": range(2018, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 50, "note": "4.2 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 140 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 150, "note": "9-speed auto" }
      },
      "Denali 2.0T": {
        "engine": "2.0L Turbo I4 (LTG, 252 hp)",
        "years": range(2018, 2022),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 55, "note": "5 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 160 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 170, "note": "9-speed auto" }
      }
    }
  },

  "Hummer EV": {
    "trims": {
      "EV2/EV2X/EV3X/Edition 1 Pickup": {
        "engine": "Electric Ultium (up to 1000 hp tri-motor)",
        "years": range(2022, 2025),
        "oil_change": { "notApplicable": true },
        "spark_plugs": { "notApplicable": true },
        "serpentine_belt": { "notApplicable": true },
        "air_filter": { "notApplicable": true },
        "fuel_filter": { "notApplicable": true },
        "transmission_fluid": { "notApplicable": true },
        "ev_battery_check": { "intervalMiles": 15000, "intervalMonths": 12, "cost": 0 },
        "cabin_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 35 },
        "brake_fluid": { "intervalMiles": 45000, "intervalMonths": 60, "cost": 90, "note": "Regen braking extends brake life" }
      },
      "EV2/EV2X/EV3X SUV": {
        "engine": "Electric Ultium (up to 830 hp tri-motor)",
        "years": range(2024, 2025),
        "oil_change": { "notApplicable": true },
        "spark_plugs": { "notApplicable": true },
        "serpentine_belt": { "notApplicable": true },
        "air_filter": { "notApplicable": true },
        "fuel_filter": { "notApplicable": true },
        "transmission_fluid": { "notApplicable": true },
        "ev_battery_check": { "intervalMiles": 15000, "intervalMonths": 12, "cost": 0 },
        "cabin_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 35 }
      }
    }
  }
};

// ─── CADILLAC MODELS ──────────────────────────────────────────────────────────

const cadillacModels = {
  "Escalade": {
    "_defaults": {
      "transfer_case_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 120 },
      "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 140 }
    },
    "trims": {
      "Luxury/Premium Luxury/Sport 6.2 V8": {
        "engine": "6.2L V8 EcoTec3 (L87, 420 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 90, "note": "8 quarts 0W-20 Dexos1, DFM" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 280 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 240, "note": "10-speed auto" }
      },
      "Premium Luxury/Sport Diesel/Duramax": {
        "engine": "3.0L Duramax Turbo-Diesel I6 (LM2, 277 hp)",
        "years": range(2021, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 100, "note": "8 quarts 0W-20 Dexos2" },
        "spark_plugs": { "notApplicable": true },
        "fuel_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 85, "note": "Dual fuel filter system" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 240, "note": "10-speed auto" }
      },
      "Luxury/Premium Luxury 6.2 V8 4th Gen": {
        "engine": "6.2L V8 (L86, 420 hp)",
        "years": range(2015, 2020),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 85, "note": "8 quarts 5W-30 Dexos1, AFM" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 270 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 230, "note": "8-speed or 10-speed auto" }
      }
    }
  },

  "CT5": {
    "trims": {
      "Luxury/Premium Luxury/Sport 2.0T": {
        "engine": "2.0L Turbo I4 (LSY, 237 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 70, "note": "5 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 180 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 220, "note": "10-speed auto" }
      },
      "Premium Luxury/Sport 3.0T V6": {
        "engine": "3.0L Twin-Turbo V6 (LGY, 335 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 85, "note": "6.5 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 250, "note": "Twin-turbo V6, rear bank tight" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 230, "note": "10-speed auto" }
      },
      "CT5-V Blackwing": {
        "engine": "6.2L Supercharged V8 (LT4, 668 hp)",
        "years": range(2022, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 110, "note": "10 quarts 5W-30 Dexos1, supercharger fluid check" },
        "spark_plugs": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 300 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 250, "note": "6-speed manual or 10-speed auto" },
        "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 140, "note": "Electronic LSD" }
      }
    }
  },

  "CT4": {
    "trims": {
      "Luxury/Premium Luxury/Sport 2.0T": {
        "engine": "2.0L Turbo I4 (LSY, 237 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 65, "note": "5 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 170 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 210, "note": "8-speed auto" }
      },
      "CT4-V 2.7T": {
        "engine": "2.7L Turbo I4 (L3B, 325 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 70, "note": "6 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 180 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 220, "note": "10-speed auto" }
      },
      "CT4-V Blackwing": {
        "engine": "3.6L Twin-Turbo V6 (LF4, 472 hp)",
        "years": range(2022, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 85, "note": "6 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 260, "note": "Twin-turbo V6" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 240, "note": "6-speed manual or 10-speed auto" },
        "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 130, "note": "Electronic LSD" }
      }
    }
  },

  "CTS": {
    "trims": {
      "Luxury/Premium Luxury 2.0T": {
        "engine": "2.0L Turbo I4 (LTG, 268 hp)",
        "years": range(2014, 2019),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 65, "note": "5 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 170 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 210, "note": "8-speed auto" }
      },
      "Premium Luxury/V-Sport 3.6 V6": {
        "engine": "3.6L V6 (LGX, 335 hp)",
        "years": range(2014, 2019),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 75, "note": "6 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 230 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 220, "note": "8-speed auto" }
      }
    }
  },

  "CTS-V": {
    "trims": {
      "CTS-V 3rd Gen": {
        "engine": "6.2L Supercharged V8 (LT4, 640 hp)",
        "years": range(2016, 2019),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 100, "note": "10 quarts 5W-30 Dexos1, supercharger fluid check" },
        "spark_plugs": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 280 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 240, "note": "8-speed auto" },
        "differential_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 130, "note": "Electronic LSD" }
      },
      "CTS-V 2nd Gen": {
        "engine": "6.2L Supercharged V8 (LSA, 556 hp)",
        "years": range(2009, 2015),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 90, "note": "8 quarts 5W-30, supercharger fluid check" },
        "spark_plugs": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 260 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 220, "note": "6-speed manual or 6-speed auto" }
      }
    }
  },

  "XT5": {
    "trims": {
      "Luxury/Premium Luxury/Sport 2.0T": {
        "engine": "2.0L Turbo I4 (LSY, 237 hp)",
        "years": range(2020, 2024),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 70, "note": "5 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 180 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 220, "note": "9-speed auto" }
      },
      "Luxury/Premium Luxury/Sport 3.6 V6": {
        "engine": "3.6L V6 (LGX, 310 hp)",
        "years": range(2017, 2024),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 80, "note": "6 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 240 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 230, "note": "9-speed auto" }
      }
    }
  },

  "XT4": {
    "trims": {
      "Luxury/Premium Luxury/Sport 2.0T": {
        "engine": "2.0L Turbo I4 (LSY, 235 hp)",
        "years": range(2019, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 65, "note": "5 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 170 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 210, "note": "9-speed auto" }
      }
    }
  },

  "XT6": {
    "trims": {
      "Luxury/Premium Luxury 2.0T": {
        "engine": "2.0L Turbo I4 (LSY, 237 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 70, "note": "5 quarts 0W-20 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 180 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 220, "note": "9-speed auto" }
      },
      "Sport 3.6 V6": {
        "engine": "3.6L V6 (LGX, 310 hp)",
        "years": range(2020, 2025),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 80, "note": "6 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 240 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 230, "note": "9-speed auto" }
      }
    }
  },

  "CT6": {
    "trims": {
      "Luxury/Premium Luxury 2.0T": {
        "engine": "2.0L Turbo I4 (LSY/LTG, 237 hp)",
        "years": range(2016, 2020),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 70, "note": "5 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 180 },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 230, "note": "10-speed auto" }
      },
      "Premium Luxury/Sport/Platinum 3.0T V6": {
        "engine": "3.0L Twin-Turbo V6 (LGW, 404 hp)",
        "years": range(2016, 2020),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 90, "note": "6.5 quarts 5W-30 Dexos1" },
        "spark_plugs": { "intervalMiles": 60000, "intervalMonths": 60, "cost": 260, "note": "Twin-turbo V6" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 240, "note": "10-speed auto" }
      },
      "CT6-V Blackwing": {
        "engine": "4.2L Twin-Turbo V8 (LTA Blackwing, 550 hp)",
        "years": range(2019, 2020),
        "oil_change": { "intervalMiles": 7500, "intervalMonths": 12, "cost": 110, "note": "8 quarts 0W-40" },
        "spark_plugs": { "intervalMiles": 45000, "intervalMonths": 48, "cost": 320, "note": "DOHC V8, hot-V layout" },
        "transmission_fluid": { "intervalMiles": 45000, "intervalMonths": 36, "cost": 260, "note": "10-speed auto" }
      }
    }
  },

  "LYRIQ": {
    "trims": {
      "Tech/Luxury/Sport": {
        "engine": "Electric Ultium (340-500 hp, single or dual motor)",
        "years": range(2023, 2025),
        "oil_change": { "notApplicable": true },
        "spark_plugs": { "notApplicable": true },
        "serpentine_belt": { "notApplicable": true },
        "air_filter": { "notApplicable": true },
        "fuel_filter": { "notApplicable": true },
        "transmission_fluid": { "notApplicable": true },
        "ev_battery_check": { "intervalMiles": 15000, "intervalMonths": 12, "cost": 0 },
        "cabin_filter": { "intervalMiles": 22500, "intervalMonths": 24, "cost": 35 },
        "brake_fluid": { "intervalMiles": 45000, "intervalMonths": 60, "cost": 90, "note": "Regen braking extends brake life" }
      }
    }
  }
};

// ─── MERGE LOGIC ──────────────────────────────────────────────────────────────

function main() {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

  let added = { Chevrolet: 0, GMC: 0, Cadillac: 0 };
  let skipped = { Chevrolet: [], GMC: [], Cadillac: [] };

  function mergeModels(makeName, newModels) {
    if (!data.makes[makeName]) {
      console.error(`Make "${makeName}" not found in maintenance-overrides.json!`);
      return;
    }
    if (!data.makes[makeName].models) {
      data.makes[makeName].models = {};
    }

    for (const [modelName, modelData] of Object.entries(newModels)) {
      const existing = data.makes[makeName].models[modelName];

      // If model already has trims, skip it entirely
      if (existing && existing.trims) {
        skipped[makeName].push(modelName);
        continue;
      }

      // Model exists but has no trims — merge, keeping existing top-level overrides
      if (existing) {
        // Preserve existing _defaults and top-level overrides, add trims and new _defaults
        if (modelData._defaults) {
          existing._defaults = { ...(existing._defaults || {}), ...modelData._defaults };
        }
        existing.trims = modelData.trims;
      } else {
        // Model doesn't exist at all — add it
        data.makes[makeName].models[modelName] = modelData;
      }

      const trimCount = Object.keys(modelData.trims).length;
      added[makeName] += trimCount;
      console.log(`  + ${makeName} ${modelName}: ${trimCount} trims`);
    }
  }

  console.log('\n=== Batch 4a: Chevrolet, GMC, Cadillac trim schedules ===\n');

  console.log('Chevrolet:');
  mergeModels('Chevrolet', chevroletModels);

  console.log('\nGMC:');
  mergeModels('GMC', gmcModels);

  console.log('\nCadillac:');
  mergeModels('Cadillac', cadillacModels);

  // Write back
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');

  console.log('\n=== Summary ===');
  console.log(`Chevrolet: ${added.Chevrolet} trims added`);
  console.log(`GMC: ${added.GMC} trims added`);
  console.log(`Cadillac: ${added.Cadillac} trims added`);
  console.log(`Total: ${added.Chevrolet + added.GMC + added.Cadillac} trims added`);

  if (skipped.Chevrolet.length || skipped.GMC.length || skipped.Cadillac.length) {
    console.log('\nSkipped (already have trims):');
    for (const make of ['Chevrolet', 'GMC', 'Cadillac']) {
      if (skipped[make].length) {
        console.log(`  ${make}: ${skipped[make].join(', ')}`);
      }
    }
  }

  console.log('\nDone! File written:', FILE);
}

main();
