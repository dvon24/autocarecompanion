#!/usr/bin/env node
/**
 * Batch 2: Add trim-based maintenance schedules for remaining
 * Ford, Dodge, RAM, Chrysler, and Jeep models.
 *
 * Merges into existing maintenance-overrides.json without overwriting batch1 trims.
 */

const fs = require('fs');
const path = require('path');

const overridesPath = path.join(__dirname, '..', 'src', 'data', 'maintenance-overrides.json');

function range(start, end) {
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

// ─── FORD MODELS ────────────────────────────────────────────────────────────

const fordModels = {
  "Escape": {
    _defaults: {
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
    },
    trims: {
      "S/SE/SEL/Titanium 1.5 EB": {
        engine: "1.5L EcoBoost I4 (180 hp)",
        years: range(2017, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "4.3 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "6-speed auto" }
      },
      "SE/SEL/Titanium 2.0 EB": {
        engine: "2.0L EcoBoost I4 (250 hp)",
        years: range(2017, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.7 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "8-speed auto (2020+) or 6-speed auto" }
      },
      "SE/SEL Hybrid 2.5": {
        engine: "2.5L I4 Hybrid (200 hp combined)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4.4 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 130 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "eCVT" },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 50 }
      },
      "SE/SEL PHEV 2.5": {
        engine: "2.5L I4 Plug-In Hybrid (221 hp combined)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4.4 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 130 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "eCVT" },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 50 }
      },
      "XLS/XLT/Limited 2.0/2.3 (Gen 3)": {
        engine: "2.0L/2.3L Duratec I4 (153-200 hp)",
        years: range(2008, 2012),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 130 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "6-speed auto or 5-speed manual" }
      },
      "XLS/XLT/Limited 3.0 V6 (Gen 2)": {
        engine: "3.0L Duratec V6 (200 hp)",
        years: range(2001, 2007),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 170 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "4-speed auto (CD4E)" }
      }
    }
  },
  "Bronco": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 }
    },
    trims: {
      "Base/Big Bend/Outer Banks 2.3 EB": {
        engine: "2.3L EcoBoost I4 (300 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "5.7 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "10-speed auto or 7-speed manual" }
      },
      "Badlands/Wildtrak/Raptor 2.7 EB": {
        engine: "2.7L EcoBoost V6 (330 hp, 418 hp Raptor)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "6 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 190, note: "10-speed auto" }
      }
    }
  },
  "Expedition": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 130 }
    },
    trims: {
      "XLT/Limited/King Ranch/Platinum 3.5 EB": {
        engine: "3.5L EcoBoost V6 (375-440 hp)",
        years: range(2015, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: "6 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250, note: "EcoBoost spark plug removal requires anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 200, note: "10-speed auto" }
      },
      "XLT/Eddie Bauer/Limited 5.4 V8": {
        engine: "5.4L Triton V8 (300 hp)",
        years: range(2003, 2014),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 65, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 350, note: "3-valve 5.4L notorious for broken spark plugs — use OEM plugs and anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "6-speed auto (6R80)" }
      }
    }
  },
  "F-250": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140 }
    },
    trims: {
      "XL/XLT/Lariat 6.2 V8": {
        engine: "6.2L Boss V8 (385 hp)",
        years: range(2011, 2019),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 75, note: "7 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 200, note: "6-speed auto (6R140)" }
      },
      "XL/XLT/Lariat 7.3 V8": {
        engine: "7.3L Godzilla V8 (430 hp)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: "8 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 240 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 210, note: "10-speed auto (10R140)" }
      },
      "XL/XLT/Lariat/King Ranch 6.7 Diesel": {
        engine: "6.7L Power Stroke V8 Turbo Diesel (475 hp)",
        years: range(2011, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 120, note: "15 quarts 15W-40 or 10W-30 (2020+)" },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 220, note: "6-speed auto (pre-2020) or 10-speed auto (2020+)" },
        fuel_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 80, note: "Dual fuel filters — replace both" }
      },
      "XL/XLT 6.8 V10": {
        engine: "6.8L Triton V10 (362 hp)",
        years: range(1999, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 70, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 280, note: "10 spark plugs — 3-valve prone to ejection" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "5-speed auto (5R110W)" }
      }
    }
  },
  "F-350": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150 }
    },
    trims: {
      "XL/XLT/Lariat 6.2 V8": {
        engine: "6.2L Boss V8 (385 hp)",
        years: range(2011, 2019),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 75, note: "7 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 200, note: "6-speed auto (6R140)" }
      },
      "XL/XLT/Lariat 7.3 V8": {
        engine: "7.3L Godzilla V8 (430 hp)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: "8 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 240 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 210, note: "10-speed auto (10R140)" }
      },
      "XL/XLT/Lariat/Platinum 6.7 Diesel": {
        engine: "6.7L Power Stroke V8 Turbo Diesel (475 hp)",
        years: range(2011, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 120, note: "15 quarts 15W-40 or 10W-30 (2020+)" },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 220, note: "6-speed auto (pre-2020) or 10-speed auto (2020+)" },
        fuel_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 80, note: "Dual fuel filters — replace both" }
      },
      "XL/XLT 7.3 Diesel (OBS/old)": {
        engine: "7.3L Power Stroke V8 Turbo Diesel (275 hp)",
        years: range(1999, 2003),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 80, note: "15 quarts 15W-40" },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "4-speed auto (4R100)" },
        fuel_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 50, note: "Single fuel filter" }
      }
    }
  },
  "Fusion": {
    trims: {
      "S/SE/SEL 1.5 EB": {
        engine: "1.5L EcoBoost I4 (181 hp)",
        years: range(2014, 2020),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4.2 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 130 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "6-speed auto" }
      },
      "SE/SEL/Titanium 2.0 EB": {
        engine: "2.0L EcoBoost I4 (240 hp)",
        years: range(2013, 2020),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.7 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "6-speed auto" }
      },
      "Sport 2.7 EB": {
        engine: "2.7L EcoBoost V6 (325 hp)",
        years: range(2017, 2020),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "6 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 190, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "6-speed auto" }
      },
      "S/SE 2.5 I4": {
        engine: "2.5L Duratec I4 (175 hp)",
        years: range(2013, 2020),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "6-speed auto" }
      },
      "Hybrid/Energi 2.0": {
        engine: "2.0L Atkinson I4 Hybrid (188 hp combined)",
        years: range(2013, 2020),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "eCVT" },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 50 }
      },
      "SE/SEL/V6 (Gen 1)": {
        engine: "2.3L/3.0L I4/V6 (160-221 hp)",
        years: range(2006, 2012),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "6-speed auto or 5-speed manual" }
      }
    }
  },
  "Edge": {
    _defaults: {
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
    },
    trims: {
      "SE/SEL/Titanium 2.0 EB": {
        engine: "2.0L EcoBoost I4 (250 hp)",
        years: range(2015, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.7 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "8-speed auto (2019+) or 6-speed auto" }
      },
      "Sport/ST 2.7 EB": {
        engine: "2.7L EcoBoost V6 (315-335 hp)",
        years: range(2015, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "6 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 190, note: "8-speed auto (2019+) or 6-speed auto" }
      },
      "SE/SEL/Limited 3.5 V6 (Gen 1)": {
        engine: "3.5L Duratec V6 (265 hp)",
        years: range(2007, 2014),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "5.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "6-speed auto" }
      }
    }
  },
  "Ranger": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 }
    },
    trims: {
      "XL/XLT/Lariat 2.3 EB": {
        engine: "2.3L EcoBoost I4 (270 hp)",
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.7 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "10-speed auto" }
      },
      "XL/XLT 4.0 V6": {
        engine: "4.0L SOHC V6 (207 hp)",
        years: range(1998, 2011),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 160 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "5-speed auto (5R55E)" }
      },
      "XL/XLT 2.3/2.5 I4": {
        engine: "2.3L/2.5L Duratec I4 (143-171 hp)",
        years: range(2001, 2011),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140, note: "5-speed auto or 5-speed manual" }
      }
    }
  },
  "Focus": {
    trims: {
      "S/SE/SEL/Titanium 2.0 I4": {
        engine: "2.0L Ti-VCT I4 (160 hp)",
        years: range(2012, 2018),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "6-speed PowerShift DCT or 5-speed manual" }
      },
      "ST 2.0 EB": {
        engine: "2.0L EcoBoost I4 (252 hp)",
        years: range(2013, 2018),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "4.5 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "6-speed manual" }
      },
      "RS 2.3 EB": {
        engine: "2.3L EcoBoost I4 (350 hp)",
        years: range(2016, 2018),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 60, note: "5.7 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "6-speed manual" }
      },
      "SE/SES/SEL 2.0 (Gen 2)": {
        engine: "2.0L Duratec I4 (140 hp)",
        years: range(2008, 2011),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 40, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140, note: "4-speed auto or 5-speed manual" }
      },
      "Electric": {
        engine: "Electric motor (143 hp)",
        years: range(2012, 2018),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { notApplicable: true },
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 50 }
      }
    }
  },
  "Bronco Sport": {
    _defaults: {
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
    },
    trims: {
      "Base/Big Bend/Outer Banks 1.5 EB": {
        engine: "1.5L EcoBoost I3 (181 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4.3 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "8-speed auto" }
      },
      "Badlands/First Edition 2.0 EB": {
        engine: "2.0L EcoBoost I4 (250 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.7 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "8-speed auto" }
      }
    }
  },
  "Taurus": {
    trims: {
      "SE/SEL/Limited 3.5 V6": {
        engine: "3.5L Duratec V6 (263-288 hp)",
        years: range(2010, 2019),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "6-speed auto (6F55)" }
      },
      "SHO 3.5 EB": {
        engine: "3.5L EcoBoost V6 (365 hp)",
        years: range(2010, 2019),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "5.5 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250, note: "EcoBoost spark plug removal requires anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 190, note: "6-speed auto (6F55)" }
      },
      "SE/SEL/SES 3.0 V6 (Gen 4)": {
        engine: "3.0L Duratec V6 (153-200 hp)",
        years: range(2000, 2007),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 170 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "4-speed auto (AX4S)" }
      }
    }
  },
  "Transit": {
    trims: {
      "Cargo/Passenger 3.5 V6": {
        engine: "3.5L Ti-VCT V6 (275 hp)",
        years: range(2015, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "6 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "6-speed auto" }
      },
      "Cargo/Passenger 3.5 EB": {
        engine: "3.5L EcoBoost V6 (310 hp)",
        years: range(2015, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "6 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250, note: "EcoBoost spark plug removal requires anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 190, note: "10-speed auto" }
      }
    }
  },
  "Transit Connect": {
    trims: {
      "XL/XLT 2.0/2.5 I4": {
        engine: "2.0L/2.5L Duratec I4 (160-169 hp)",
        years: range(2014, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "8-speed auto (2019+) or 6-speed auto" }
      },
      "XL/XLT 1.6 EB": {
        engine: "1.6L EcoBoost I4 (178 hp)",
        years: range(2014, 2016),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4.3 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 130 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "6-speed auto" }
      }
    }
  },
  "EcoSport": {
    trims: {
      "S/SE/SES/Titanium 1.0 EB": {
        engine: "1.0L EcoBoost I3 (123 hp)",
        years: range(2018, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "4.3 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 90 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "6-speed auto" }
      },
      "SE/SES/Titanium 2.0 I4": {
        engine: "2.0L Ti-VCT I4 (166 hp)",
        years: range(2018, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "5.7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "6-speed auto" }
      }
    }
  },
  "Maverick": {
    trims: {
      "XL/XLT/Lariat 2.0 EB": {
        engine: "2.0L EcoBoost I4 (250 hp)",
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.7 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "8-speed auto" }
      },
      "XL/XLT Hybrid 2.5": {
        engine: "2.5L Atkinson I4 Hybrid (191 hp combined)",
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4.4 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "eCVT" },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 50 }
      }
    }
  },
  "Flex": {
    trims: {
      "SE/SEL/Limited 3.5 V6": {
        engine: "3.5L Duratec V6 (262 hp)",
        years: range(2009, 2019),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "6-speed auto (6F55)" }
      },
      "Limited/Titanium 3.5 EB": {
        engine: "3.5L EcoBoost V6 (365 hp)",
        years: range(2010, 2019),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "5.5 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250, note: "EcoBoost spark plug removal requires anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 190, note: "6-speed auto (6F55)" }
      }
    }
  },
  "Fiesta": {
    trims: {
      "S/SE/Titanium 1.6 I4": {
        engine: "1.6L Ti-VCT I4 (120 hp)",
        years: range(2011, 2019),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 40, note: "4.3 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 90 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140, note: "6-speed PowerShift DCT or 5-speed manual" }
      },
      "ST 1.6 EB": {
        engine: "1.6L EcoBoost I4 (197 hp)",
        years: range(2014, 2019),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.3 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 110, note: "EcoBoost spark plug removal may require anti-seize" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140, note: "6-speed manual" }
      }
    }
  },
  "Crown Victoria": {
    trims: {
      "Base/LX/Police Interceptor 4.6 V8": {
        engine: "4.6L Modular V8 (224-239 hp)",
        years: range(1998, 2011),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: "6 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "4-speed auto (4R70W/4R75E)" }
      }
    }
  },
  "Explorer Sport Trac": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
    },
    trims: {
      "XLT/Limited 4.0 V6": {
        engine: "4.0L SOHC V6 (210 hp)",
        years: range(2007, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 170 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "5-speed auto" }
      },
      "Adrenalin 4.6 V8": {
        engine: "4.6L SOHC V8 (292 hp)",
        years: range(2007, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: "6 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "6-speed auto" }
      }
    }
  },
  "Five Hundred": {
    trims: {
      "SE/SEL/Limited 3.0 V6": {
        engine: "3.0L Duratec V6 (203 hp)",
        years: range(2005, 2007),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 170 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "CVT or 6-speed auto" }
      }
    }
  },
  "Mustang Mach-E": {
    trims: {
      "Select/Premium/California Route 1 Standard Range": {
        engine: "Electric RWD (266 hp)",
        years: range(2021, 2025),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { notApplicable: true },
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 50 }
      },
      "Premium/GT Extended Range AWD": {
        engine: "Electric AWD (346-480 hp)",
        years: range(2021, 2025),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { notApplicable: true },
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 50 }
      }
    }
  },
  "F-150 Lightning": {
    trims: {
      "Pro/XLT/Lariat Standard Range": {
        engine: "Electric AWD (452 hp)",
        years: range(2022, 2025),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { notApplicable: true },
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 50 }
      },
      "Lariat/Platinum Extended Range": {
        engine: "Electric AWD (580 hp)",
        years: range(2022, 2025),
        oil_change: { notApplicable: true },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { notApplicable: true },
        ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 50 }
      }
    }
  }
};

// ─── DODGE MODELS ───────────────────────────────────────────────────────────

const dodgeModels = {
  "Durango": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 }
    },
    trims: {
      "SXT/GT/Citadel 3.6 V6": {
        engine: "3.6L Pentastar V6 (295 hp)",
        years: range(2011, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "8-speed auto (ZF 8HP)" }
      },
      "R/T/Citadel 5.7 HEMI": {
        engine: "5.7L HEMI V8 (360 hp)",
        years: range(2011, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 300, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 210, note: "8-speed auto (ZF 8HP)" }
      },
      "SRT/SRT 392/Hellcat 6.4 HEMI": {
        engine: "6.4L HEMI V8 (475 hp) / 6.2L SC HEMI V8 (710 hp Hellcat)",
        years: range(2018, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 80, note: "7 quarts 0W-40" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 350, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "8-speed auto (ZF 8HP70)" }
      },
      "SXT/SLT 4.7 V8 (Gen 2)": {
        engine: "4.7L PowerTech V8 (235-303 hp)",
        years: range(2004, 2009),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: "6 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "5-speed auto (545RFE)" }
      },
      "SLT/Limited 5.7 HEMI (Gen 2)": {
        engine: "5.7L HEMI V8 (340 hp)",
        years: range(2004, 2009),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 60, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 280, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "5-speed auto (545RFE)" }
      }
    }
  },
  "Grand Caravan": {
    trims: {
      "SE/SXT/GT 3.6 V6": {
        engine: "3.6L Pentastar V6 (283 hp)",
        years: range(2011, 2020),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 190, note: "6-speed auto (62TE)" }
      },
      "SE/SXT 3.3/3.8 V6": {
        engine: "3.3L/3.8L OHV V6 (175-197 hp)",
        years: range(2001, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 130 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "4-speed auto (41TE/42LE)" }
      }
    }
  },
  "Dakota": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 90 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
    },
    trims: {
      "SXT/SLT 3.7 V6": {
        engine: "3.7L PowerTech V6 (210 hp)",
        years: range(2005, 2011),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 150 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "4-speed auto (42RLE)" }
      },
      "SLT/Laramie 4.7 V8": {
        engine: "4.7L PowerTech V8 (230-303 hp)",
        years: range(2000, 2011),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: "6 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "5-speed auto (545RFE)" }
      }
    }
  },
  "Viper": {
    trims: {
      "SRT/GTS/ACR 8.4 V10": {
        engine: "8.4L V10 (640-645 hp)",
        years: range(2013, 2017),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 120, note: "12 quarts 0W-40" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 350 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 250, note: "6-speed manual (Tremec TR6060)" }
      },
      "SRT-10 8.3 V10": {
        engine: "8.3L V10 (500-510 hp)",
        years: range(2003, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 110, note: "12 quarts 10W-40" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 320 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 240, note: "6-speed manual (Tremec T56)" }
      }
    }
  },
  "Avenger": {
    trims: {
      "SE/SXT/R/T 2.4 I4": {
        engine: "2.4L DOHC I4 (173 hp)",
        years: range(2008, 2014),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "4-speed auto (41TE)" }
      },
      "SXT/R/T 3.6 V6": {
        engine: "3.6L Pentastar V6 (283 hp)",
        years: range(2011, 2014),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 180, note: "6-speed auto (62TE)" }
      }
    }
  },
  "Journey": {
    trims: {
      "SE/SXT/Crossroad 2.4 I4": {
        engine: "2.4L DOHC I4 (173 hp)",
        years: range(2009, 2020),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "4-speed auto (41TE)" }
      },
      "SXT/R/T/GT 3.6 V6": {
        engine: "3.6L Pentastar V6 (283 hp)",
        years: range(2011, 2020),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 190, note: "6-speed auto (62TE)" }
      }
    }
  },
  "Dart": {
    trims: {
      "SE/SXT/Aero 2.0 I4": {
        engine: "2.0L Tigershark I4 (160 hp)",
        years: range(2013, 2016),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 40, note: "4.5 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 100 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 160, note: "6-speed manual or 6-speed DDCT" }
      },
      "SXT/GT/Limited 2.4 I4": {
        engine: "2.4L Tigershark I4 (184 hp)",
        years: range(2013, 2016),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "5.5 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 110 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 170, note: "6-speed auto or 6-speed manual" }
      },
      "SXT 1.4T": {
        engine: "1.4L MultiAir Turbo I4 (160 hp)",
        years: range(2013, 2016),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "4 quarts 5W-40" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 90 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 160, note: "6-speed DDCT" }
      }
    }
  },
  "Nitro": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 90 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
    },
    trims: {
      "SE/SXT/Heat 3.7 V6": {
        engine: "3.7L PowerTech V6 (210 hp)",
        years: range(2007, 2011),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 150 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "4-speed auto (42RLE)" }
      },
      "R/T 4.0 V6": {
        engine: "4.0L SOHC V6 (255 hp)",
        years: range(2007, 2011),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 170 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "5-speed auto" }
      }
    }
  },
  "Hornet": {
    _defaults: {
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
    },
    trims: {
      "GT 2.0T": {
        engine: "2.0L Turbo I4 (268 hp)",
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5 quarts 0W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 180, note: "9-speed auto" }
      },
      "R/T PHEV 1.3T": {
        engine: "1.3L Turbo I4 PHEV (288 hp combined)",
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4 quarts 5W-40" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 90 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "6-speed auto" },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 50 }
      }
    }
  },
  "Magnum": {
    trims: {
      "SE/SXT 2.7 V6": {
        engine: "2.7L DOHC V6 (190 hp)",
        years: range(2005, 2008),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 150 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "4-speed auto (42RLE)" }
      },
      "SXT/R/T 3.5 V6": {
        engine: "3.5L HO V6 (250 hp)",
        years: range(2005, 2008),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 160 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "5-speed auto" }
      },
      "R/T 5.7 HEMI": {
        engine: "5.7L HEMI V8 (340 hp)",
        years: range(2005, 2008),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 60, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 280, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "5-speed auto (NAG1)" }
      },
      "SRT8 6.1 HEMI": {
        engine: "6.1L HEMI V8 (425 hp)",
        years: range(2006, 2008),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 70, note: "7 quarts 0W-40" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 320, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "5-speed auto (NAG1)" }
      }
    }
  }
};

// ─── RAM MODELS ─────────────────────────────────────────────────────────────

const ramModels = {
  "2500": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140 }
    },
    trims: {
      "Tradesman/Big Horn/Laramie 6.4 HEMI": {
        engine: "6.4L HEMI V8 (410 hp)",
        years: range(2014, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 75, note: "7 quarts 0W-40" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 350, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "8-speed auto (ZF 8HP75)" }
      },
      "Tradesman/Big Horn/Laramie 5.7 HEMI": {
        engine: "5.7L HEMI V8 (383 hp)",
        years: range(2009, 2013),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 300, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "6-speed auto (66RFE)" }
      },
      "Tradesman/Big Horn/Laramie/Longhorn 6.7 Cummins": {
        engine: "6.7L Cummins Turbo Diesel I6 (370-420 hp)",
        years: range(2007, 2025),
        oil_change: { intervalMiles: 15000, intervalMonths: 12, cost: 130, note: "12 quarts 15W-40 or 5W-40" },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 240, note: "6-speed auto (68RFE) or Aisin AS69RC" },
        fuel_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 60, note: "Single fuel filter under hood" }
      }
    }
  },
  "3500": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150 }
    },
    trims: {
      "Tradesman/Big Horn/Laramie 6.4 HEMI": {
        engine: "6.4L HEMI V8 (410 hp)",
        years: range(2014, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 75, note: "7 quarts 0W-40" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 350, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "8-speed auto (ZF 8HP75)" }
      },
      "Tradesman/Big Horn/Laramie/Longhorn/Limited 6.7 Cummins": {
        engine: "6.7L Cummins Turbo Diesel I6 (370-420 hp)",
        years: range(2007, 2025),
        oil_change: { intervalMiles: 15000, intervalMonths: 12, cost: 130, note: "12 quarts 15W-40 or 5W-40" },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 240, note: "6-speed auto (68RFE) or Aisin AS69RC" },
        fuel_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 60, note: "Single fuel filter under hood" }
      },
      "Tradesman 6.7 Cummins HO": {
        engine: "6.7L Cummins High Output Turbo Diesel I6 (420 hp / 1,075 lb-ft)",
        years: range(2019, 2025),
        oil_change: { intervalMiles: 15000, intervalMonths: 12, cost: 140, note: "12 quarts 5W-40" },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 260, note: "Aisin AS69RC" },
        fuel_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 60, note: "Single fuel filter under hood" }
      }
    }
  },
  "ProMaster": {
    trims: {
      "1500/2500/3500 3.6 V6": {
        engine: "3.6L Pentastar V6 (280 hp)",
        years: range(2014, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "6-speed auto (62TE)" }
      },
      "3.0 Diesel": {
        engine: "3.0L EcoDiesel V6 (174 hp)",
        years: range(2014, 2018),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: "7.5 quarts 5W-30" },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "6-speed auto" },
        fuel_filter: { intervalMiles: 20000, intervalMonths: 18, cost: 50 }
      }
    }
  },
  "1500 Classic": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 }
    },
    trims: {
      "Tradesman/Express/SLT 3.6 V6": {
        engine: "3.6L Pentastar V6 (305 hp)",
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 190, note: "8-speed auto (ZF 8HP)" }
      },
      "Tradesman/Big Horn/SLT 5.7 HEMI": {
        engine: "5.7L HEMI V8 (395 hp)",
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 300, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 210, note: "8-speed auto (ZF 8HP70)" }
      }
    }
  },
  "ProMaster City": {
    trims: {
      "Tradesman/SLT 2.4 I4": {
        engine: "2.4L Tigershark I4 (178 hp)",
        years: range(2015, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "5.5 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 110 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 170, note: "9-speed auto (948TE)" }
      }
    }
  }
};

// ─── CHRYSLER MODELS ────────────────────────────────────────────────────────

const chryslerModels = {
  "Town & Country": {
    trims: {
      "Touring/Limited 3.6 V6": {
        engine: "3.6L Pentastar V6 (283 hp)",
        years: range(2011, 2016),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 190, note: "6-speed auto (62TE)" }
      },
      "Touring/Limited 3.3/3.8 V6": {
        engine: "3.3L/3.8L OHV V6 (175-197 hp)",
        years: range(2001, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 130 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "4-speed auto (41TE/42LE)" }
      }
    }
  },
  "Sebring": {
    trims: {
      "LX/Touring/Limited 2.4 I4": {
        engine: "2.4L DOHC I4 (173 hp)",
        years: range(2007, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "4-speed auto (41TE)" }
      },
      "Touring/Limited 2.7 V6": {
        engine: "2.7L DOHC V6 (189 hp)",
        years: range(2007, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 150 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "4-speed auto" }
      },
      "Limited 3.5 V6": {
        engine: "3.5L HO V6 (235 hp)",
        years: range(2007, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: "5.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 170 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "6-speed auto" }
      },
      "LX/LXi/GTC 2.4/2.7 (Gen 1)": {
        engine: "2.4L/2.7L I4/V6 (150-200 hp)",
        years: range(2001, 2006),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "5 quarts 5W-30" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 120 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140, note: "4-speed auto (41TE)" }
      }
    }
  },
  "300": {
    trims: {
      "Touring/S/Limited 3.6 V6": {
        engine: "3.6L Pentastar V6 (292 hp)",
        years: range(2011, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "8-speed auto (ZF 8HP)" }
      },
      "S/C 5.7 HEMI": {
        engine: "5.7L HEMI V8 (363 hp)",
        years: range(2011, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 300, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 210, note: "8-speed auto (ZF 8HP)" }
      },
      "SRT8 6.4 HEMI": {
        engine: "6.4L HEMI V8 (470 hp)",
        years: range(2012, 2014),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 80, note: "7 quarts 0W-40" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 350, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "5-speed auto (NAG1)" }
      },
      "Touring/Limited 2.7/3.5 V6 (Gen 1)": {
        engine: "2.7L/3.5L V6 (190-250 hp)",
        years: range(2005, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 150 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "5-speed auto (NAG1)" }
      },
      "C/SRT8 5.7/6.1 HEMI (Gen 1)": {
        engine: "5.7L HEMI V8 (340-425 hp)",
        years: range(2005, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 60, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 280, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "5-speed auto (NAG1)" }
      }
    }
  },
  "Pacifica": {
    trims: {
      "Touring/Touring L/Limited 3.6 V6": {
        engine: "3.6L Pentastar V6 (287 hp)",
        years: range(2017, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "9-speed auto (948TE)" }
      },
      "Hybrid/Pinnacle PHEV 3.6 V6": {
        engine: "3.6L Pentastar V6 PHEV (260 hp combined)",
        years: range(2017, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "eFlite SI-EVT" },
        ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 50 }
      }
    }
  },
  "200": {
    trims: {
      "LX/Limited 2.4 I4": {
        engine: "2.4L Tigershark I4 (184 hp)",
        years: range(2015, 2017),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "5.5 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 110 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 170, note: "9-speed auto (948TE)" }
      },
      "S/C 3.6 V6": {
        engine: "3.6L Pentastar V6 (295 hp)",
        years: range(2015, 2017),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 190, note: "9-speed auto (948TE)" }
      },
      "LX/Touring/Limited 2.4 I4 (Gen 1)": {
        engine: "2.4L DOHC I4 (173 hp)",
        years: range(2011, 2014),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "6-speed auto (62TE)" }
      },
      "S/Limited 3.6 V6 (Gen 1)": {
        engine: "3.6L Pentastar V6 (283 hp)",
        years: range(2011, 2014),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 180, note: "6-speed auto (62TE)" }
      }
    }
  },
  "PT Cruiser": {
    trims: {
      "Base/Touring/Limited 2.4 I4": {
        engine: "2.4L DOHC I4 (150 hp)",
        years: range(2001, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140, note: "4-speed auto (41TE)" }
      },
      "GT Turbo 2.4T": {
        engine: "2.4L Turbo DOHC I4 (220-230 hp)",
        years: range(2003, 2009),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5 quarts 5W-30" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 120 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "4-speed auto (41TE) or 5-speed manual" }
      }
    }
  },
  "Voyager": {
    trims: {
      "LX/LXi 3.6 V6": {
        engine: "3.6L Pentastar V6 (287 hp)",
        years: range(2020, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "9-speed auto (948TE)" }
      }
    }
  }
};

// ─── JEEP MODELS ────────────────────────────────────────────────────────────

const jeepModels = {
  "Cherokee": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
    },
    trims: {
      "Latitude/Limited 2.4 I4": {
        engine: "2.4L Tigershark I4 (184 hp)",
        years: range(2014, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "5.5 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 110 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 180, note: "9-speed auto (948TE)" }
      },
      "Latitude/Trailhawk/Limited 3.2 V6": {
        engine: "3.2L Pentastar V6 (271 hp)",
        years: range(2014, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 190, note: "9-speed auto (948TE)" }
      },
      "Trailhawk 2.0T": {
        engine: "2.0L Turbo I4 (270 hp)",
        years: range(2019, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 190, note: "9-speed auto (948TE)" }
      },
      "Sport/Classic/Limited 4.0 I6 (XJ)": {
        engine: "4.0L AMC I6 (190 hp)",
        years: range(1997, 2001),
        oil_change: { intervalMiles: 3000, intervalMonths: 3, cost: 35, note: "6 quarts 10W-30" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 130, note: "4-speed auto (AW4) or 5-speed manual" }
      }
    }
  },
  "Renegade": {
    _defaults: {
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
    },
    trims: {
      "Sport/Latitude 2.4 I4": {
        engine: "2.4L Tigershark I4 (180 hp)",
        years: range(2015, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "5.5 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 110 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 170, note: "9-speed auto (948TE)" }
      },
      "Trailhawk 1.3T": {
        engine: "1.3L Turbo I4 (177 hp)",
        years: range(2019, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "4 quarts 5W-40" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 90 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 170, note: "9-speed auto" }
      }
    }
  },
  "Gladiator": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 }
    },
    trims: {
      "Sport/Overland/Rubicon 3.6 V6": {
        engine: "3.6L Pentastar V6 (285 hp)",
        years: range(2020, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "8-speed auto (850RE) or 6-speed manual" }
      },
      "Mojave/Rubicon 3.0 Diesel": {
        engine: "3.0L EcoDiesel V6 (260 hp)",
        years: range(2020, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: "8 quarts 5W-40" },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 210, note: "8-speed auto (850RE)" },
        fuel_filter: { intervalMiles: 20000, intervalMonths: 18, cost: 50 }
      }
    }
  },
  "Liberty": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 90 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
    },
    trims: {
      "Sport/Latitude/Limited 3.7 V6": {
        engine: "3.7L PowerTech V6 (210 hp)",
        years: range(2002, 2012),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 150 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "4-speed auto (42RLE)" }
      },
      "Sport/Limited 2.8 Diesel": {
        engine: "2.8L CRD Turbo Diesel I4 (163 hp)",
        years: range(2005, 2006),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: "7 quarts 5W-30" },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "5-speed auto (NAG1)" },
        fuel_filter: { intervalMiles: 15000, intervalMonths: 12, cost: 50 }
      }
    }
  },
  "Compass": {
    _defaults: {
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
    },
    trims: {
      "Sport/Latitude/Trailhawk 2.4 I4 (Gen 2)": {
        engine: "2.4L Tigershark I4 (180 hp)",
        years: range(2017, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 45, note: "5.5 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 110 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 170, note: "9-speed auto (948TE) or 6-speed auto" }
      },
      "Trailhawk 2.0T": {
        engine: "2.0L Turbo I4 (200 hp)",
        years: range(2023, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "5 quarts 5W-30" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 180, note: "8-speed auto" }
      },
      "Sport/Latitude/Limited 2.0/2.4 (Gen 1)": {
        engine: "2.0L/2.4L DOHC I4 (158-172 hp)",
        years: range(2007, 2016),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "CVT or 6-speed auto" }
      }
    }
  },
  "Grand Cherokee L": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 }
    },
    trims: {
      "Laredo/Limited/Overland 3.6 V6": {
        engine: "3.6L Pentastar V6 (290 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "8-speed auto (ZF 8HP)" }
      },
      "Summit/Overland 5.7 HEMI": {
        engine: "5.7L HEMI V8 (357 hp)",
        years: range(2021, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 300, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 210, note: "8-speed auto (ZF 8HP)" }
      }
    }
  },
  "Patriot": {
    _defaults: {
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 }
    },
    trims: {
      "Sport/Latitude/Limited 2.0/2.4 I4": {
        engine: "2.0L/2.4L DOHC I4 (158-172 hp)",
        years: range(2007, 2017),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 40, note: "4.5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 100 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 150, note: "CVT or 6-speed auto" }
      }
    }
  },
  "Grand Wagoneer": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140 }
    },
    trims: {
      "Series I/II/III 6.4 HEMI": {
        engine: "6.4L HEMI V8 (471 hp)",
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: "7 quarts 0W-40" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 350, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "8-speed auto (ZF 8HP75)" }
      },
      "Hurricane 3.0T": {
        engine: "3.0L Hurricane Twin-Turbo I6 (510 hp)",
        years: range(2024, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: "8 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "8-speed auto (ZF 8HP)" }
      }
    }
  },
  "Wagoneer": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 130 }
    },
    trims: {
      "Series I/II/III 5.7 HEMI": {
        engine: "5.7L HEMI V8 (392 hp)",
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 300, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 210, note: "8-speed auto (ZF 8HP75)" }
      },
      "Hurricane 3.0T": {
        engine: "3.0L Hurricane Twin-Turbo I6 (420 hp)",
        years: range(2024, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 75, note: "8 quarts 0W-20" },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 60, cost: 210, note: "8-speed auto (ZF 8HP)" }
      }
    }
  },
  "Commander": {
    _defaults: {
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 }
    },
    trims: {
      "Sport/Limited 3.7 V6": {
        engine: "3.7L PowerTech V6 (210 hp)",
        years: range(2006, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "5 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 150 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "5-speed auto (NAG1)" }
      },
      "Limited/Overland 4.7 V8": {
        engine: "4.7L PowerTech V8 (231-303 hp)",
        years: range(2006, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: "6 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 200 },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "5-speed auto (545RFE)" }
      },
      "Limited/Overland 5.7 HEMI": {
        engine: "5.7L HEMI V8 (330 hp)",
        years: range(2006, 2010),
        oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 60, note: "7 quarts 5W-20" },
        spark_plugs: { intervalMiles: 30000, intervalMonths: 30, cost: 280, note: "16 spark plugs (dual-plug HEMI)" },
        transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "5-speed auto (545RFE)" }
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

    // Merge: keep existing _defaults, add new data
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

console.log('=== Batch 2: Trim-Based Maintenance Schedules ===\n');

let totalAdded = 0;
let totalSkipped = 0;
let totalTrims = 0;

for (const [make, models] of [
  ['Ford', fordModels],
  ['Dodge', dodgeModels],
  ['RAM', ramModels],
  ['Chrysler', chryslerModels],
  ['Jeep', jeepModels]
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
