#!/usr/bin/env node
/**
 * Batch 4b: Add trim-based maintenance schedules for remaining
 * Subaru, Hyundai, Kia, Mazda, and MINI models.
 *
 * Merges into existing maintenance-overrides.json without overwriting
 * existing trims (Subaru WRX, Hyundai Elantra already covered).
 *
 * Brand rules:
 * - Subaru: ALL AWD, boxer engines (horizontal plug access), CVT (Subaru fluid ONLY), 0W-20
 * - Hyundai/Kia: shared platforms, Theta II 2.0T, Smartstream 2.5T, IVT/CVT/DCT
 * - Mazda: SkyActiv engines, 0W-20, timing chain, CX-90 3.3T I6
 * - MINI: BMW engines (B38/B48), BMW LL-01 oil, lug bolts, higher costs
 */

const fs = require('fs');
const path = require('path');

const overridesPath = path.join(__dirname, '..', 'src', 'data', 'maintenance-overrides.json');

const range = (s, e) => Array.from({length: e - s + 1}, (_, i) => s + i);

// ─── SUBARU MODELS ──────────────────────────────────────────────────────────

const subaruModels = {
  "Outback": {
    trims: {
      "Base/Premium/Limited 2.5": {
        engine: "2.5L Boxer H4 FB25 (182 hp)",
        years: range(2015, 2025),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 55, note: "5.1 quarts 0W-20, AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 240, note: "Boxer H4, horizontal access" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "CVT Lineartronic, Subaru CVT fluid ONLY" }
      },
      "XT/Onyx XT/Limited XT 2.4T": {
        engine: "2.4L Turbo Boxer H4 FA24F (260 hp)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 60, note: "5.4 quarts 0W-20, turbo AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250, note: "Boxer H4, horizontal access, turbo" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 155, note: "CVT Lineartronic, Subaru CVT fluid ONLY" }
      },
      "2.5i/3.6R (Gen 4)": {
        engine: "2.5L/3.6L Boxer H4/H6 (175-256 hp)",
        years: range(2010, 2014),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 55, note: "5.1 quarts 0W-20 (H4) or 6.9 quarts 5W-30 (H6)" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250, note: "H6 rear plugs require intake removal" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "CVT or 5-speed auto, Subaru fluid ONLY" }
      }
    }
  },
  "Forester": {
    trims: {
      "Base/Premium/Limited/Touring 2.5": {
        engine: "2.5L Boxer H4 FB25 (182 hp)",
        years: range(2014, 2025),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 55, note: "5.1 quarts 0W-20, AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 240, note: "Boxer H4, horizontal access" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "CVT Lineartronic, Subaru CVT fluid ONLY" }
      },
      "XT 2.0T": {
        engine: "2.0L Turbo Boxer H4 FA20DIT (250 hp)",
        years: range(2014, 2018),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 60, note: "5.4 quarts 5W-30, turbo AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250, note: "Boxer H4, horizontal access, turbo" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 155, note: "CVT Lineartronic high-torque, Subaru CVT fluid ONLY" }
      }
    }
  },
  "Crosstrek": {
    trims: {
      "Base/Premium/Limited/Sport 2.0": {
        engine: "2.0L Boxer H4 FB20 (152 hp)",
        years: range(2016, 2023),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 50, note: "4.4 quarts 0W-20, AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "Boxer H4, horizontal access" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "CVT Lineartronic, Subaru CVT fluid ONLY" }
      },
      "Sport/Limited 2.5": {
        engine: "2.5L Boxer H4 FB25 (182 hp)",
        years: range(2024, 2025),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 55, note: "5.1 quarts 0W-20, AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 240, note: "Boxer H4, horizontal access" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "CVT Lineartronic, Subaru CVT fluid ONLY" }
      }
    }
  },
  "Impreza": {
    trims: {
      "Base/Premium/Sport/Limited 2.0": {
        engine: "2.0L Boxer H4 FB20 (152 hp)",
        years: range(2017, 2024),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 50, note: "4.4 quarts 0W-20, AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "Boxer H4, horizontal access" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "CVT or 5-speed manual, Subaru fluid ONLY" }
      },
      "RS/Sport 2.5 (Gen 5)": {
        engine: "2.5L Boxer H4 FB25 (182 hp)",
        years: range(2024, 2025),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 55, note: "5.1 quarts 0W-20, AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 240, note: "Boxer H4, horizontal access" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "CVT Lineartronic, Subaru CVT fluid ONLY" }
      }
    }
  },
  "Ascent": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 110 }
    },
    trims: {
      "Base/Premium/Limited/Touring 2.4T": {
        engine: "2.4L Turbo Boxer H4 FA24F (260 hp)",
        years: range(2019, 2025),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 60, note: "5.4 quarts 0W-20, turbo AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250, note: "Boxer H4, horizontal access, turbo" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 155, note: "CVT Lineartronic high-torque, Subaru CVT fluid ONLY" }
      }
    }
  },
  "Legacy": {
    trims: {
      "Base/Premium/Limited 2.5": {
        engine: "2.5L Boxer H4 FB25 (182 hp)",
        years: range(2015, 2024),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 55, note: "5.1 quarts 0W-20, AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 240, note: "Boxer H4, horizontal access" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "CVT Lineartronic, Subaru CVT fluid ONLY" }
      },
      "XT/Sport XT 2.4T": {
        engine: "2.4L Turbo Boxer H4 FA24F (260 hp)",
        years: range(2020, 2024),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 60, note: "5.4 quarts 0W-20, turbo AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250, note: "Boxer H4, horizontal access, turbo" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 155, note: "CVT Lineartronic high-torque, Subaru CVT fluid ONLY" }
      },
      "3.6R (Gen 6)": {
        engine: "3.6L Boxer H6 EZ36 (256 hp)",
        years: range(2015, 2019),
        oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 65, note: "6.9 quarts 5W-30, H6 AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 280, note: "H6 rear plugs require intake removal" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 155, note: "CVT high-torque, Subaru CVT fluid ONLY" }
      }
    }
  },
  "BRZ": {
    trims: {
      "Premium/Limited (Gen 1)": {
        engine: "2.0L Boxer H4 FA20 (205 hp)",
        years: range(2013, 2020),
        oil_change: { intervalMiles: 7500, intervalMonths: 6, cost: 50, note: "5.4 quarts 0W-20, RWD only Subaru" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140, note: "Boxer H4, horizontal access" },
        transmission_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 140, note: "6-speed manual or 6-speed auto" }
      },
      "Premium/Limited/tS (Gen 2)": {
        engine: "2.4L Boxer H4 FA24 (228 hp)",
        years: range(2022, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 6, cost: 55, note: "5.7 quarts 0W-20, RWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150, note: "Boxer H4, horizontal access" },
        transmission_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 145, note: "6-speed manual or 6-speed auto" }
      }
    }
  },
  "Solterra": {
    trims: {
      "Premium/Limited/Touring": {
        engine: "Dual-motor EV (215 hp)",
        years: range(2023, 2025),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { notApplicable: true }
      }
    }
  }
};

// ─── HYUNDAI MODELS ─────────────────────────────────────────────────────────

const hyundaiModels = {
  "Tucson": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 100 }
    },
    trims: {
      "SE/SEL/Limited 2.5": {
        engine: "2.5L Smartstream I4 (187 hp)",
        years: range(2022, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "5.1 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 140 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "8-speed auto" }
      },
      "N Line/XRT 2.5T": {
        engine: "2.5L Turbo Smartstream I4 (281 hp)",
        years: range(2022, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "5.1 quarts 0W-20, turbo" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 160 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: "8-speed DCT" }
      },
      "SE/Sport/Limited 2.0T (Gen 3)": {
        engine: "2.0L Theta II Turbo I4 (175 hp)",
        years: range(2016, 2021),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "5.1 quarts 5W-30, Theta II" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 150, note: "Theta II, check for oil consumption" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "7-speed DCT or 6-speed auto" }
      }
    }
  },
  "Sonata": {
    trims: {
      "SE/SEL/Limited 2.5": {
        engine: "2.5L Smartstream I4 (191 hp)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "5.1 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 130 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 155, note: "8-speed auto" }
      },
      "N Line/SEL Plus 1.6T": {
        engine: "1.6L Turbo Smartstream I4 (180 hp)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.7 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 140 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "7-speed DCT (N Line) or 8-speed auto" }
      },
      "2.0T/Sport (Gen 7)": {
        engine: "2.0L Theta II Turbo I4 (245 hp)",
        years: range(2015, 2019),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "5.1 quarts 5W-30, Theta II" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 150, note: "Theta II, monitor oil consumption" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "6-speed auto" }
      }
    }
  },
  "Santa Fe": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 100 }
    },
    trims: {
      "SE/SEL/Limited 2.5": {
        engine: "2.5L Smartstream I4 (191 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "5.1 quarts 0W-20, AWD available" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 140 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "8-speed auto" }
      },
      "XRT/Calligraphy 2.5T": {
        engine: "2.5L Turbo Smartstream I4 (281 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "5.1 quarts 0W-20, turbo" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 160 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: "8-speed DCT" }
      }
    }
  },
  "Kona": {
    trims: {
      "SE/SEL/Limited/N Line 2.0": {
        engine: "2.0L Smartstream I4 (147 hp)",
        years: range(2018, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "4.2 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: "IVT (CVT)" }
      },
      "N 2.0T": {
        engine: "2.0L Turbo I4 (276 hp)",
        years: range(2022, 2025),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: "5.1 quarts 0W-30, performance turbo" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 160 },
        transmission_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 170, note: "8-speed DCT" }
      }
    }
  },
  "Palisade": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 110 }
    },
    trims: {
      "SE/SEL/Limited/Calligraphy 3.8": {
        engine: "3.8L Lambda II V6 (291 hp)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 60, note: "6.3 quarts 5W-30, AWD available" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 200, note: "V6, rear bank harder to access" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: "8-speed auto" }
      }
    }
  },
  "Ioniq 5": {
    trims: {
      "SE/SEL/Limited RWD/AWD": {
        engine: "Single/Dual-motor EV (225-320 hp, 800V)",
        years: range(2022, 2025),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { notApplicable: true }
      }
    }
  },
  "Ioniq 6": {
    trims: {
      "SE/SEL/Limited RWD/AWD": {
        engine: "Single/Dual-motor EV (225-320 hp, 800V)",
        years: range(2023, 2025),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { notApplicable: true }
      }
    }
  },
  "Santa Cruz": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 100 }
    },
    trims: {
      "SE/SEL 2.5": {
        engine: "2.5L Smartstream I4 (191 hp)",
        years: range(2022, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "5.1 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 140 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "8-speed auto" }
      },
      "Limited/Night 2.5T": {
        engine: "2.5L Turbo Smartstream I4 (281 hp)",
        years: range(2022, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "5.1 quarts 0W-20, turbo" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 160 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: "8-speed DCT" }
      }
    }
  },
  "Veloster": {
    trims: {
      "2.0/Premium 2.0": {
        engine: "2.0L I4 (147 hp)",
        years: range(2019, 2021),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 40, note: "4.2 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: "6-speed manual or 6-speed auto" }
      },
      "Turbo/N 2.0T": {
        engine: "2.0L Turbo I4 (275 hp N / 201 hp Turbo)",
        years: range(2019, 2022),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: "5.1 quarts 0W-30 (N) or 0W-20 (Turbo)" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 150 },
        transmission_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 170, note: "6-speed manual, 7-speed DCT, or 8-speed DCT (N)" }
      }
    }
  },
  "Accent": {
    trims: {
      "SE/SEL/Limited 1.6": {
        engine: "1.6L I4 (120 hp)",
        years: range(2018, 2022),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 35, note: "3.7 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 100 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 140, note: "6-speed auto or IVT" }
      }
    }
  },
  "Venue": {
    trims: {
      "SE/SEL/Limited 1.6": {
        engine: "1.6L I4 (121 hp)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 40, note: "3.7 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 110 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 140, note: "IVT (CVT)" }
      }
    }
  },
  "Nexo": {
    trims: {
      "Blue/Limited FCEV": {
        engine: "Hydrogen Fuel Cell EV (161 hp)",
        years: range(2019, 2025),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { notApplicable: true }
      }
    }
  }
};

// ─── KIA MODELS ─────────────────────────────────────────────────────────────

const kiaModels = {
  "Sportage": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 100 }
    },
    trims: {
      "LX/EX/SX 2.5": {
        engine: "2.5L Smartstream I4 (187 hp)",
        years: range(2023, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "5.1 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 140 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "8-speed auto" }
      },
      "SX Prestige/X-Pro 2.5T": {
        engine: "2.5L Turbo Smartstream I4 (281 hp)",
        years: range(2023, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "5.1 quarts 0W-20, turbo" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 160 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: "8-speed DCT" }
      },
      "LX/EX/SX 2.4 (Gen 4)": {
        engine: "2.4L Theta II I4 (181 hp)",
        years: range(2017, 2022),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "4.8 quarts 0W-20, Theta II" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 130, note: "Theta II, monitor oil consumption" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 155, note: "6-speed auto" }
      }
    }
  },
  "Sorento": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 100 }
    },
    trims: {
      "LX/S/EX/SX 2.5": {
        engine: "2.5L Smartstream I4 (191 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "5.1 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 140 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "8-speed auto (FWD) or 8-speed DCT (AWD)" }
      },
      "SX Prestige 2.5T": {
        engine: "2.5L Turbo Smartstream I4 (281 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "5.1 quarts 0W-20, turbo" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 160 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: "8-speed DCT" }
      }
    }
  },
  "Forte": {
    trims: {
      "FE/LXS/GT-Line 2.0": {
        engine: "2.0L Smartstream I4 (147 hp)",
        years: range(2019, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 40, note: "4.2 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: "IVT (CVT)" }
      },
      "GT 1.6T": {
        engine: "1.6L Turbo I4 (201 hp)",
        years: range(2019, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.7 quarts 0W-20, turbo" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 140 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "7-speed DCT" }
      }
    }
  },
  "Soul": {
    trims: {
      "LX/S/EX/GT-Line 2.0": {
        engine: "2.0L I4 (147 hp)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 40, note: "4.2 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: "IVT (CVT)" }
      },
      "Turbo/GT-Line Turbo 1.6T": {
        engine: "1.6L Turbo I4 (201 hp)",
        years: range(2020, 2023),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.7 quarts 0W-20, turbo" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 140 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "7-speed DCT" }
      }
    }
  },
  "Telluride": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 110 }
    },
    trims: {
      "LX/S/EX/SX 3.8 V6": {
        engine: "3.8L Lambda II V6 (291 hp)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 60, note: "6.3 quarts 5W-30, AWD available" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 200, note: "V6, rear bank harder to access" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: "8-speed auto" }
      }
    }
  },
  "Niro": {
    trims: {
      "LX/EX/SX Hybrid 1.6": {
        engine: "1.6L GDI I4 Hybrid (139 hp combined)",
        years: range(2017, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "3.8 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "6-speed DCT" }
      },
      "PHEV 1.6": {
        engine: "1.6L GDI I4 PHEV (180 hp combined)",
        years: range(2018, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "3.8 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "6-speed DCT" }
      }
    }
  },
  "Seltos": {
    trims: {
      "LX/S/EX 2.0": {
        engine: "2.0L Smartstream I4 (146 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "4.2 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: "IVT (CVT)" }
      },
      "SX Turbo 1.6T": {
        engine: "1.6L Turbo I4 (195 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.7 quarts 0W-20, turbo" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 140 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "7-speed DCT" }
      }
    }
  },
  "K5": {
    trims: {
      "LXS/GT-Line/EX 2.5": {
        engine: "2.5L Smartstream I4 (191 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "5.1 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 130 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 155, note: "8-speed auto" }
      },
      "GT 2.5T": {
        engine: "2.5L Turbo Smartstream I4 (290 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "5.1 quarts 0W-20, turbo" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 160 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: "8-speed DCT" }
      }
    }
  },
  "Stinger": {
    trims: {
      "GT-Line 2.5T": {
        engine: "2.5L Turbo Smartstream I4 (300 hp)",
        years: range(2022, 2023),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 60, note: "5.5 quarts 0W-20, turbo RWD/AWD" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 160 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: "8-speed auto" }
      },
      "GT 3.3T V6": {
        engine: "3.3L Twin-Turbo Lambda V6 (368 hp)",
        years: range(2018, 2022),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 70, note: "7.4 quarts 5W-30, twin-turbo V6" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 220, note: "V6 twin-turbo, rear bank access tight" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 190, note: "8-speed auto" }
      }
    }
  },
  "Rio": {
    trims: {
      "LX/S/EX 1.6": {
        engine: "1.6L I4 (120 hp)",
        years: range(2018, 2023),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 35, note: "3.7 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 100 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 140, note: "6-speed auto or IVT" }
      }
    }
  },
  "Carnival": {
    trims: {
      "LX/EX/SX/SX Prestige 3.5 V6": {
        engine: "3.5L Lambda II V6 (290 hp)",
        years: range(2022, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "6.3 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 190, note: "V6, rear bank access limited" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 175, note: "8-speed auto" }
      }
    }
  },
  "EV6": {
    trims: {
      "Light/Wind/GT-Line/GT RWD/AWD": {
        engine: "Single/Dual-motor EV (167-576 hp, 800V)",
        years: range(2022, 2025),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { notApplicable: true }
      }
    }
  },
  "EV9": {
    trims: {
      "Light/Wind/GT-Line/GT-Line AWD": {
        engine: "Single/Dual-motor EV (215-379 hp, 800V)",
        years: range(2024, 2025),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { notApplicable: true }
      }
    }
  }
};

// ─── MAZDA MODELS ───────────────────────────────────────────────────────────

const mazdaModels = {
  "Mazda3": {
    trims: {
      "Base/Select/Preferred 2.0": {
        engine: "2.0L SkyActiv-G I4 (155 hp)",
        years: range(2019, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.2 quarts 0W-20, SkyActiv" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 130, note: "Timing chain, no belt service" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 140, note: "6-speed auto or 6-speed manual" }
      },
      "Premium/Turbo 2.5T": {
        engine: "2.5L SkyActiv-G Turbo I4 (250 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "4.8 quarts 0W-20, turbo SkyActiv" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 145, note: "6-speed auto" }
      }
    }
  },
  "MX-5 Miata": {
    trims: {
      "Sport/Club/Grand Touring (ND)": {
        engine: "2.0L SkyActiv-G I4 (181 hp)",
        years: range(2016, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "4.2 quarts 0W-20, SkyActiv" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 110 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 130, note: "6-speed manual or 6-speed auto" }
      },
      "Sport/Club/Grand Touring (NC)": {
        engine: "2.0L MZR I4 (167 hp)",
        years: range(2006, 2015),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 40, note: "4.0 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 120, note: "5-speed/6-speed manual or 6-speed auto" }
      }
    }
  },
  "Mazda6": {
    trims: {
      "Sport/Touring/Grand Touring 2.5": {
        engine: "2.5L SkyActiv-G I4 (187 hp)",
        years: range(2014, 2021),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.4 quarts 0W-20, SkyActiv" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 130, note: "Timing chain, no belt service" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 140, note: "6-speed auto" }
      },
      "Grand Touring Reserve/Signature 2.5T": {
        engine: "2.5L SkyActiv-G Turbo I4 (250 hp)",
        years: range(2018, 2021),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "4.8 quarts 0W-20, turbo SkyActiv" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 145, note: "6-speed auto" }
      }
    }
  },
  "CX-5": {
    trims: {
      "S/Select/Preferred/Premium 2.5": {
        engine: "2.5L SkyActiv-G I4 (187 hp)",
        years: range(2017, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.5 quarts 0W-20, SkyActiv" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140, note: "Timing chain, no belt service" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 145, note: "6-speed auto" }
      },
      "Turbo/Signature 2.5T": {
        engine: "2.5L SkyActiv-G Turbo I4 (256 hp)",
        years: range(2019, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "4.8 quarts 0W-20, turbo SkyActiv" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 155 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "6-speed auto" }
      }
    }
  },
  "CX-50": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
    },
    trims: {
      "S/Select/Preferred 2.5": {
        engine: "2.5L SkyActiv-G I4 (187 hp)",
        years: range(2023, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.5 quarts 0W-20, AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 145, note: "6-speed auto" }
      },
      "Premium/Premium Plus/Turbo 2.5T": {
        engine: "2.5L SkyActiv-G Turbo I4 (256 hp)",
        years: range(2023, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "4.8 quarts 0W-20, turbo AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 155 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "6-speed auto" }
      }
    }
  },
  "CX-30": {
    trims: {
      "Base/Select/Preferred 2.5": {
        engine: "2.5L SkyActiv-G I4 (191 hp)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.2 quarts 0W-20, SkyActiv" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 130 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 140, note: "6-speed auto" }
      },
      "Turbo/Premium Plus 2.5T": {
        engine: "2.5L SkyActiv-G Turbo I4 (250 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "4.8 quarts 0W-20, turbo" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 145, note: "6-speed auto" }
      }
    }
  },
  "CX-90": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
    },
    trims: {
      "S/Preferred/Premium 3.3T I6": {
        engine: "3.3L SkyActiv-G Turbo I6 (340 hp)",
        years: range(2024, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 65, note: "6.7 quarts 0W-20, turbo I6 AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "Inline-6, timing chain" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 170, note: "8-speed auto" }
      },
      "PHEV 2.5": {
        engine: "2.5L SkyActiv I4 PHEV (323 hp combined)",
        years: range(2024, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "4.8 quarts 0W-20, PHEV" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 165, note: "8-speed auto hybrid" }
      }
    }
  },
  "CX-9": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
    },
    trims: {
      "Sport/Touring/Grand Touring/Signature 2.5T": {
        engine: "2.5L SkyActiv-G Turbo I4 (250 hp)",
        years: range(2016, 2023),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "4.8 quarts 0W-20, turbo AWD" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 155 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "6-speed auto" }
      }
    }
  },
  "CX-3": {
    trims: {
      "Sport/Touring/Grand Touring 2.0": {
        engine: "2.0L SkyActiv-G I4 (148 hp)",
        years: range(2016, 2021),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "4.2 quarts 0W-20, SkyActiv" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 135, note: "6-speed auto" }
      }
    }
  },
  "RX-8": {
    trims: {
      "Sport/Grand Touring/R3 1.3 Rotary": {
        engine: "1.3L Renesis Rotary (232 hp)",
        years: range(2004, 2011),
        oil_change: { intervalMiles: 3000, intervalMonths: 3, cost: 45, note: "3.7 quarts 5W-20, rotary burns oil by design — check weekly" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 24, cost: 100, note: "4 plugs (2 leading, 2 trailing), unique rotary ignition" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 130, note: "6-speed manual or 6-speed auto" }
      }
    }
  }
};

// ─── MINI MODELS ────────────────────────────────────────────────────────────

const miniModels = {
  "Cooper": {
    trims: {
      "Cooper/Classic B38 3-cyl": {
        engine: "1.5L Turbo I3 B38 (134-150 hp)",
        years: range(2014, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 90, note: "4.2 quarts 0W-30 BMW LL-01, lug bolts" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 260, note: "6-speed manual or Aisin 6-speed auto" }
      },
      "Cooper S B48 4-cyl": {
        engine: "2.0L Turbo I4 B48 (189 hp)",
        years: range(2014, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: "5.3 quarts 0W-30 BMW LL-01, lug bolts" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 270, note: "6-speed manual or Aisin 8-speed auto" }
      },
      "JCW B48 Tuned": {
        engine: "2.0L Turbo I4 B48 JCW (228-301 hp)",
        years: range(2015, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 110, note: "5.3 quarts 0W-30 BMW LL-01, high-output turbo" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 220, note: "Higher heat range for JCW tune" },
        transmission_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 280, note: "6-speed manual or 8-speed sport auto" }
      }
    }
  },
  "Clubman": {
    trims: {
      "Cooper/Classic B48": {
        engine: "2.0L Turbo I4 B48 (189 hp)",
        years: range(2016, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: "5.3 quarts 0W-30 BMW LL-01, lug bolts" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 270, note: "8-speed auto, ALL4 AWD available" }
      },
      "JCW B48 Tuned": {
        engine: "2.0L Turbo I4 B48 JCW (301 hp)",
        years: range(2017, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 110, note: "5.3 quarts 0W-30 BMW LL-01, high-output" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 220 },
        transmission_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 280, note: "8-speed sport auto, ALL4 AWD" }
      }
    }
  },
  "Countryman": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160 }
    },
    trims: {
      "Cooper B38/B48": {
        engine: "1.5L Turbo I3 B38 (134 hp) / 2.0L Turbo I4 B48 (189 hp)",
        years: range(2017, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: "4.2-5.3 quarts 0W-30 BMW LL-01, lug bolts" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 270, note: "8-speed auto, ALL4 AWD available" }
      },
      "JCW B48 Tuned": {
        engine: "2.0L Turbo I4 B48 JCW (301 hp)",
        years: range(2018, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 110, note: "5.3 quarts 0W-30 BMW LL-01, high-output" },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 220 },
        transmission_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 280, note: "8-speed sport auto, ALL4 AWD" }
      }
    }
  },
  "Convertible": {
    trims: {
      "Cooper B38 3-cyl": {
        engine: "1.5L Turbo I3 B38 (134 hp)",
        years: range(2016, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 90, note: "4.2 quarts 0W-30 BMW LL-01, lug bolts" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 260, note: "6-speed manual or 7-speed DCT" }
      },
      "Cooper S B48": {
        engine: "2.0L Turbo I4 B48 (189 hp)",
        years: range(2016, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: "5.3 quarts 0W-30 BMW LL-01, lug bolts" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 270, note: "6-speed manual or 8-speed auto" }
      }
    }
  },
  "Hardtop 4 Door": {
    trims: {
      "Cooper B38 3-cyl": {
        engine: "1.5L Turbo I3 B38 (134-150 hp)",
        years: range(2015, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 90, note: "4.2 quarts 0W-30 BMW LL-01, lug bolts" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 260, note: "6-speed manual or 7-speed DCT" }
      },
      "Cooper S B48": {
        engine: "2.0L Turbo I4 B48 (189 hp)",
        years: range(2015, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: "5.3 quarts 0W-30 BMW LL-01, lug bolts" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 270, note: "6-speed manual or 8-speed auto" }
      }
    }
  }
};

// ─── MERGE LOGIC ────────────────────────────────────────────────────────────

const data = JSON.parse(fs.readFileSync(overridesPath, 'utf-8'));

function ensureMake(makeName) {
  if (data.makes[makeName] === undefined) {
    data.makes[makeName] = { _defaults: {}, models: {} };
  }
  if (data.makes[makeName].models === undefined) {
    data.makes[makeName].models = {};
  }
}

function mergeModels(makeName, models) {
  ensureMake(makeName);
  let added = 0;
  let skipped = 0;

  for (const [modelName, modelData] of Object.entries(models)) {
    const existing = data.makes[makeName].models[modelName];

    // If model already has trims, skip it entirely
    if (existing && existing.trims) {
      console.log(`  SKIP ${makeName} ${modelName} — already has ${Object.keys(existing.trims).length} trims`);
      skipped++;
      continue;
    }

    // Merge: keep existing _defaults and model-level overrides, add new data
    const merged = { ...(existing || {}) };
    if (modelData._defaults) {
      merged._defaults = { ...(merged._defaults || {}), ...modelData._defaults };
    }
    merged.trims = modelData.trims;

    data.makes[makeName].models[modelName] = merged;
    const trimCount = Object.keys(modelData.trims).length;
    console.log(`  ADD  ${makeName} ${modelName} — ${trimCount} trims`);
    added++;
  }

  return { added, skipped };
}

console.log('=== Batch 4b: Trim-Based Maintenance Schedules ===');
console.log('    Subaru, Hyundai, Kia, Mazda, MINI\n');

let totalAdded = 0;
let totalSkipped = 0;
let totalTrims = 0;

for (const [make, models] of [
  ['Subaru', subaruModels],
  ['Hyundai', hyundaiModels],
  ['Kia', kiaModels],
  ['Mazda', mazdaModels],
  ['MINI', miniModels]
]) {
  console.log(`\n${make}:`);
  const { added, skipped } = mergeModels(make, models);
  totalAdded += added;
  totalSkipped += skipped;

  // Count trims for this make
  for (const modelData of Object.values(models)) {
    if (modelData.trims) {
      totalTrims += Object.keys(modelData.trims).length;
    }
  }
}

// Write back
fs.writeFileSync(overridesPath, JSON.stringify(data, null, 2) + '\n');

console.log('\n=== Summary ===');
console.log(`Models added:   ${totalAdded}`);
console.log(`Models skipped: ${totalSkipped} (already had trims)`);
console.log(`Total new trims: ${totalTrims}`);
console.log(`\nWrote ${overridesPath}`);

// Verify final counts
const final = JSON.parse(fs.readFileSync(overridesPath, 'utf-8'));
let finalTrimCount = 0;
let finalModelCount = 0;
for (const make of Object.values(final.makes)) {
  for (const model of Object.values(make.models || {})) {
    if (model.trims) {
      finalModelCount++;
      finalTrimCount += Object.keys(model.trims).length;
    }
  }
}
console.log(`\nFinal totals across ALL makes:`);
console.log(`  Models with trims: ${finalModelCount}`);
console.log(`  Total trim entries: ${finalTrimCount}`);
