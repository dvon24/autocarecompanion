/**
 * Generate comprehensive trim-based maintenance schedules
 * sourced from owner's manual data for the top models.
 *
 * Structure:
 *   Make → models → Model → {
 *     _defaults: { type: override },      // model-level fallback
 *     trims: {
 *       "TrimA/AliasB": {
 *         engine: "description",
 *         years: [2016,...,2024],
 *         type: override
 *       }
 *     }
 *   }
 *
 * Sources: OEM owner manuals, maintenance guides published by manufacturers.
 * All intervals use the "normal" schedule unless noted; severe schedule noted where relevant.
 */

const fs = require('fs');
const path = require('path');

const overridesPath = path.join(__dirname, '..', 'src', 'data', 'maintenance-overrides.json');
const data = JSON.parse(fs.readFileSync(overridesPath, 'utf-8'));

// Helper: generate year arrays
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

// ─────────────────────────────────────────────────────────────
// CHEVROLET
// ─────────────────────────────────────────────────────────────

data.makes.Chevrolet.models.Camaro = {
  _defaults: {
    oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 65 },
    spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
    transmission_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 180 },
    coolant_flush: { intervalMiles: 50000, intervalMonths: 60, cost: 130 },
    cabin_filter: { intervalMiles: 22500, intervalMonths: 24, cost: 30 },
    air_filter: { intervalMiles: 45000, intervalMonths: 36, cost: 30 },
    brake_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 80 },
  },
  trims: {
    "LT/1LT/2LT/3LT": {
      engine: "2.0L Turbo I4 (LTG)",
      years: range(2016, 2024),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "5 quarts 0W-20 (2019+) or 5W-30 (2016-2018)" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 160 },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 48, cost: 160, note: "8-speed auto or 6-speed manual" },
    },
    "LT/RS V6": {
      engine: "3.6L V6 (LGX)",
      years: range(2016, 2024),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 65, note: "6 quarts 5W-30" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "V6 rear bank access tight" },
    },
    "SS/1SS/2SS": {
      engine: "6.2L V8 LT1 (455 hp)",
      years: range(2016, 2024),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 90, note: "10 quarts 5W-30 Dexos1" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250 },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 200, note: "10-speed auto or 6-speed manual" },
      differential_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 120 },
    },
    "ZL1": {
      engine: "6.2L Supercharged V8 LT4 (650 hp)",
      years: range(2017, 2024),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 100, note: "10 quarts 5W-30 Dexos1, supercharger intercooler fluid check" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 280, note: "Colder plugs recommended for track use" },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 220, note: "10-speed auto or 6-speed manual" },
      differential_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 130, note: "Electronic limited-slip differential" },
      serpentine_belt: { intervalMiles: 50000, intervalMonths: 48, cost: 180, note: "Supercharger belt separate from accessory" },
    },
  },
};

data.makes.Chevrolet.models["Silverado 1500"] = {
  _defaults: {
    transfer_case_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 110 },
    differential_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 120 },
  },
  trims: {
    "WT/Custom/LT/RST 4-cyl": {
      engine: "2.7L Turbo I4 (L3B)",
      years: range(2019, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 60, note: "6 quarts 0W-20 Dexos1" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 160 },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 48, cost: 170, note: "8-speed auto" },
    },
    "LT/RST/LTZ/High Country V8": {
      engine: "5.3L V8 (L84/L82 EcoTec3)",
      years: range(2019, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 70, note: "8 quarts 0W-20 Dexos1, AFM/DFM system" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 240 },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 48, cost: 190, note: "10-speed auto" },
    },
    "LTZ/High Country 6.2": {
      engine: "6.2L V8 (L87 EcoTec3)",
      years: range(2019, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 80, note: "8 quarts 0W-20 Dexos1" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 260 },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 48, cost: 200, note: "10-speed auto" },
    },
    "LT/RST/LTZ Diesel/Duramax": {
      engine: "3.0L Duramax Turbo-Diesel I6 (LM2)",
      years: range(2019, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 85, note: "8 quarts 0W-20 Dexos2" },
      spark_plugs: { notApplicable: true },
      fuel_filter: { intervalMiles: 22500, intervalMonths: 24, cost: 80, note: "Dual fuel filter system" },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 48, cost: 190, note: "10-speed auto" },
    },
    "ZR2": {
      engine: "6.2L V8 (L87) or 3.0L Diesel (LZ0)",
      years: range(2022, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 85, note: "8 quarts, severe duty if off-road" },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 150, note: "Multimatic DSSV shocks, front/rear e-lockers" },
      transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 120 },
    },
    "WT/LS/LT 5.3 V8": {
      engine: "5.3L V8 (L83/LV3 EcoTec3)",
      years: range(2014, 2018),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 65, note: "8 quarts 5W-30 Dexos1" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220 },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 48, cost: 180, note: "6-speed auto" },
    },
    "LTZ/High Country 6.2 K2": {
      engine: "6.2L V8 (L86 EcoTec3)",
      years: range(2014, 2018),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 75, note: "8 quarts 5W-30 Dexos1" },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 48, cost: 190, note: "8-speed auto" },
    },
  },
};

data.makes.Chevrolet.models.Corvette = {
  _defaults: {
    oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 100 },
    brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 100 },
  },
  trims: {
    "Stingray/1LT/2LT/3LT C8": {
      engine: "6.2L V8 LT2 (490 hp)",
      years: range(2020, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 100, note: "9.5 quarts 5W-30 Dexos1, dry sump" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 300, note: "Mid-engine access" },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 250, note: "8-speed DCT Tremec" },
    },
    "Z06 C8": {
      engine: "5.5L Flat-Plane Crank V8 LT6 (670 hp)",
      years: range(2023, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 120, note: "10.5 quarts 0W-40, dry sump" },
      spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 350 },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 280, note: "8-speed DCT" },
    },
    "E-Ray C8": {
      engine: "6.2L V8 LT2 + eAWD electric motor (655 hp)",
      years: range(2024, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 110, note: "9.5 quarts 5W-30 + hybrid system check" },
      ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
    },
    "Stingray/Z51 C7": {
      engine: "6.2L V8 LT1 (455-460 hp)",
      years: range(2014, 2019),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 90, note: "8.5 quarts 5W-30, dry sump" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250 },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 200, note: "7-speed manual or 8-speed auto" },
    },
    "Z06 C7": {
      engine: "6.2L Supercharged V8 LT4 (650 hp)",
      years: range(2015, 2019),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 110, note: "10 quarts 5W-30, dry sump, supercharger fluid check" },
    },
  },
};

data.makes.Chevrolet.models.Equinox = {
  _defaults: {
    oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55 },
    spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
  },
  trims: {
    "LS/LT/RS/Premier 1.5T": {
      engine: "1.5L Turbo I4 (LYX/L3A)",
      years: range(2018, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.2 quarts 0W-20 Dexos1" },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 48, cost: 150, note: "9-speed auto" },
    },
    "Premier 2.0T": {
      engine: "2.0L Turbo I4 (LTG)",
      years: range(2018, 2021),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "5 quarts 5W-30" },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 48, cost: 160, note: "9-speed auto" },
    },
    "EV": {
      engine: "Electric (Ultium)",
      years: range(2024, 2025),
      oil_change: { notApplicable: true },
      spark_plugs: { notApplicable: true },
      serpentine_belt: { notApplicable: true },
      air_filter: { notApplicable: true },
      fuel_filter: { notApplicable: true },
      transmission_fluid: { notApplicable: true },
      ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// FORD
// ─────────────────────────────────────────────────────────────

data.makes.Ford.models["F-150"] = {
  _defaults: {
    transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 },
    differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 },
  },
  trims: {
    "XL/XLT/Lariat 2.7 EB": {
      engine: "2.7L EcoBoost V6 (325-400 hp)",
      years: range(2015, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "6 quarts 5W-30" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 180, note: "10-speed auto (2017+)" },
    },
    "XLT/Lariat/King Ranch 3.5 EB": {
      engine: "3.5L EcoBoost V6 (375-400 hp)",
      years: range(2011, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: "6 quarts 5W-30" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250, note: "EcoBoost spark plug removal requires anti-seize" },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 190, note: "10-speed auto (2017+) or 6-speed auto" },
    },
    "XL/XLT 3.3 V6": {
      engine: "3.3L Ti-VCT V6 (290 hp)",
      years: range(2018, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
    },
    "XL/XLT 5.0 V8": {
      engine: "5.0L Coyote V8 (395-400 hp)",
      years: range(2011, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: "8.8 quarts 5W-20 (2011-2017) or 5W-30 (2018+)" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250 },
    },
    "Raptor": {
      engine: "3.5L High-Output EcoBoost V6 (450 hp) / 5.2L SC V8 (700 hp Raptor R)",
      years: range(2017, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 80, note: "6 quarts 5W-30 (EB) or 10 quarts 5W-50 (Raptor R)" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 280 },
      differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 160, note: "Severe duty off-road, front/rear" },
      transfer_case_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 130 },
    },
    "XL/XLT/Lariat 3.5 EB PowerBoost": {
      engine: "3.5L PowerBoost Hybrid V6 (430 hp)",
      years: range(2021, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 75, note: "6 quarts 5W-30" },
      ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
    },
    "Lightning": {
      engine: "Electric (dual motor, 452-580 hp)",
      years: range(2022, 2025),
      oil_change: { notApplicable: true },
      spark_plugs: { notApplicable: true },
      serpentine_belt: { notApplicable: true },
      air_filter: { notApplicable: true },
      fuel_filter: { notApplicable: true },
      transmission_fluid: { notApplicable: true },
      ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
    },
    "XL/XLT/Lariat 5.0 V8 12th gen": {
      engine: "5.0L Coyote V8 (300-360 hp)",
      years: range(2009, 2014),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 60, note: "7.7 quarts 5W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "6-speed auto" },
    },
  },
};

data.makes.Ford.models.Mustang = {
  _defaults: {
    oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65 },
  },
  trims: {
    "EcoBoost/EcoBoost Premium": {
      engine: "2.3L EcoBoost I4 (310-330 hp)",
      years: range(2015, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.7 quarts 5W-30" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 160 },
    },
    "GT/GT Premium": {
      engine: "5.0L Coyote V8 (460-486 hp)",
      years: range(2015, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: "10 quarts 5W-20 (S550) or 5W-30 (S650)" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250 },
    },
    "Shelby GT350/GT350R": {
      engine: "5.2L Voodoo Flat-Plane Crank V8 (526 hp)",
      years: range(2016, 2020),
      oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 90, note: "10 quarts 5W-50 REQUIRED, dry sump" },
      spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300 },
    },
    "Shelby GT500": {
      engine: "5.2L Supercharged V8 Predator (760 hp)",
      years: range(2020, 2022),
      oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 100, note: "10 quarts 5W-50, supercharger snout oil check" },
      spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 320 },
      serpentine_belt: { intervalMiles: 40000, intervalMonths: 36, cost: 200, note: "Supercharger belt separate" },
    },
    "Dark Horse": {
      engine: "5.0L Coyote V8 (500 hp, S650)",
      years: range(2024, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: "10 quarts 5W-30, dry sump" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 280 },
    },
    "Mach-E": {
      engine: "Electric (266-480 hp)",
      years: range(2021, 2025),
      oil_change: { notApplicable: true },
      spark_plugs: { notApplicable: true },
      serpentine_belt: { notApplicable: true },
      air_filter: { notApplicable: true },
      fuel_filter: { notApplicable: true },
      transmission_fluid: { notApplicable: true },
      ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
      brake_fluid: { intervalMiles: 36000, intervalMonths: 36, cost: 80 },
    },
  },
};

data.makes.Ford.models.Explorer = {
  _defaults: {
    transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
  },
  trims: {
    "Base/XLT/Limited 2.3 EB": {
      engine: "2.3L EcoBoost I4 (300 hp)",
      years: range(2020, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "5.7 quarts 5W-30" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 170, note: "10-speed auto" },
    },
    "ST/Platinum 3.0 EB": {
      engine: "3.0L EcoBoost V6 (400 hp ST, 365 hp Platinum)",
      years: range(2020, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: "6 quarts 5W-30" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220 },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// DODGE / STELLANTIS
// ─────────────────────────────────────────────────────────────

data.makes.Dodge.models.Challenger = {
  _defaults: {
    oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70 },
    transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
  },
  trims: {
    "SXT/GT": {
      engine: "3.6L Pentastar V6 (303 hp)",
      years: range(2015, 2023),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 170 },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "8-speed auto" },
    },
    "R/T": {
      engine: "5.7L HEMI V8 (375 hp)",
      years: range(2015, 2023),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: "7 quarts 5W-20, MDS system" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "16 spark plugs (dual-plug HEMI)" },
    },
    "R/T Scat Pack/392": {
      engine: "6.4L HEMI V8 (485 hp)",
      years: range(2015, 2023),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: "7 quarts 0W-40" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 240, note: "16 spark plugs (dual-plug HEMI)" },
    },
    "SRT Hellcat/Redeye/Jailbreak": {
      engine: "6.2L Supercharged HEMI V8 (717-807 hp)",
      years: range(2015, 2023),
      oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 90, note: "7 quarts 0W-40, supercharger oil check" },
      spark_plugs: { intervalMiles: 48000, intervalMonths: 48, cost: 260, note: "16 spark plugs (dual-plug HEMI)" },
      serpentine_belt: { intervalMiles: 40000, intervalMonths: 36, cost: 200, note: "Supercharger belt separate from accessory" },
    },
    "SRT Demon/Demon 170": {
      engine: "6.2L Supercharged HEMI V8 (840-1025 hp)",
      years: [2018, 2023],
      oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 100, note: "7 quarts 0W-40, track use interval" },
      spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 280 },
    },
  },
};

data.makes.Dodge.models.Charger = {
  _defaults: {
    oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70 },
    transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
  },
  trims: {
    "SXT/SE": {
      engine: "3.6L Pentastar V6 (292-300 hp)",
      years: range(2015, 2023),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 170 },
    },
    "R/T": {
      engine: "5.7L HEMI V8 (370 hp)",
      years: range(2015, 2023),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: "7 quarts 5W-20, MDS system" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "16 spark plugs" },
    },
    "Scat Pack/392": {
      engine: "6.4L HEMI V8 (485 hp)",
      years: range(2015, 2023),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: "7 quarts 0W-40" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 240, note: "16 spark plugs" },
    },
    "SRT Hellcat/Redeye": {
      engine: "6.2L Supercharged HEMI V8 (707-797 hp)",
      years: range(2015, 2023),
      oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 90, note: "7 quarts 0W-40, supercharger oil check" },
      spark_plugs: { intervalMiles: 48000, intervalMonths: 48, cost: 260, note: "16 spark plugs" },
      serpentine_belt: { intervalMiles: 40000, intervalMonths: 36, cost: 200 },
    },
    "Sixpack/Daytona EV": {
      engine: "Electric (dual motor, 496-670 hp)",
      years: range(2024, 2025),
      oil_change: { notApplicable: true },
      spark_plugs: { notApplicable: true },
      serpentine_belt: { notApplicable: true },
      air_filter: { notApplicable: true },
      fuel_filter: { notApplicable: true },
      transmission_fluid: { notApplicable: true },
      ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// TOYOTA
// ─────────────────────────────────────────────────────────────

data.makes.Toyota.models.Camry = {
  _defaults: {
    oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55 },
  },
  trims: {
    "LE/SE/XLE/XSE 2.5": {
      engine: "2.5L Dynamic Force I4 (203 hp)",
      years: range(2018, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "5.8 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "Direct Shift 8-speed auto" },
    },
    "TRD V6": {
      engine: "3.5L V6 (301 hp)",
      years: range(2020, 2023),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "6.4 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
    },
    "Hybrid LE/SE/XLE/XSE": {
      engine: "2.5L Hybrid I4 (208-225 hp)",
      years: range(2018, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4.8 quarts 0W-16" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
      ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
      serpentine_belt: { notApplicable: true, note: "Hybrid uses electric motor, no accessory belt" },
    },
  },
};

data.makes.Toyota.models["RAV4"] = {
  _defaults: {
    oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55 },
  },
  trims: {
    "LE/XLE/XLE Premium/Adventure/TRD": {
      engine: "2.5L Dynamic Force I4 (203 hp)",
      years: range(2019, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4.8 quarts 0W-16" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: "Direct Shift-CVT" },
    },
    "Hybrid/XSE Hybrid": {
      engine: "2.5L Hybrid I4 (219 hp combined)",
      years: range(2019, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4.8 quarts 0W-16" },
      ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
      serpentine_belt: { notApplicable: true },
    },
    "Prime/Prime XSE": {
      engine: "2.5L PHEV I4 (302 hp combined)",
      years: range(2021, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "4.8 quarts 0W-16" },
      ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
      serpentine_belt: { notApplicable: true },
    },
  },
};

data.makes.Toyota.models.Tacoma = {
  _defaults: {
    transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
    differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 },
  },
  trims: {
    "SR/SR5/TRD Sport 2.7": {
      engine: "2.7L I4 (159 hp)",
      years: range(2016, 2023),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 50, note: "5.5 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
    },
    "SR5/TRD Sport/TRD Off-Road/Limited 3.5 V6": {
      engine: "3.5L V6 (278 hp)",
      years: range(2016, 2023),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6.2 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180, note: "V6 rear bank tight clearance" },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: "6-speed auto or 6-speed manual" },
    },
    "TRD Pro 3.5 V6": {
      engine: "3.5L V6 (278 hp)",
      years: range(2016, 2023),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "6.2 quarts 0W-20" },
      differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 130, note: "Off-road severe duty, locking rear diff" },
      transfer_case_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 110 },
    },
    "SR/SR5/TRD Sport 2.4T 4th gen": {
      engine: "2.4L Turbo I4 (228-278 hp)",
      years: range(2024, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.3 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: "8-speed auto" },
    },
    "Trailhunter/TRD Pro i-FORCE MAX": {
      engine: "2.4L Turbo Hybrid I4 (326 hp)",
      years: range(2024, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "5.3 quarts 0W-20" },
      ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
    },
  },
};

data.makes.Toyota.models["4Runner"] = {
  _defaults: {
    transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 100 },
    differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 },
  },
  trims: {
    "SR5/TRD Sport/TRD Off-Road/Limited 4.0 V6": {
      engine: "4.0L V6 (270 hp)",
      years: range(2010, 2024),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "6.8 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "V6, coil-on-plug" },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: "5-speed auto" },
      timing_belt: { notApplicable: true, note: "4.0L V6 uses timing chain" },
    },
    "TRD Pro": {
      engine: "4.0L V6 (270 hp)",
      years: range(2015, 2024),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "6.8 quarts 0W-20" },
      differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 130, note: "Severe duty off-road, locking rear diff" },
      transfer_case_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 110 },
    },
    "SR5/TRD Sport/Limited 2.4T 6th gen": {
      engine: "2.4L Turbo I4 (278 hp)",
      years: range(2025, 2026),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.3 quarts 0W-20" },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: "8-speed auto" },
    },
    "TRD Pro/Trailhunter i-FORCE MAX 6th gen": {
      engine: "2.4L Turbo Hybrid I4 (326 hp)",
      years: range(2025, 2026),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "5.3 quarts 0W-20" },
      ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// HONDA
// ─────────────────────────────────────────────────────────────

data.makes.Honda.models.Civic = {
  _defaults: {
    oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50 },
  },
  trims: {
    "LX/EX/Sport/Touring 2.0": {
      engine: "2.0L I4 (158 hp)",
      years: range(2016, 2021),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "3.7 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 130, note: "CVT" },
    },
    "EX/EX-L/Sport/Touring 1.5T": {
      engine: "1.5L Turbo I4 (174-180 hp)",
      years: range(2016, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "3.7 quarts 0W-20, check oil dilution" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140, note: "CVT, Honda HCF-2 fluid" },
    },
    "Si": {
      engine: "1.5L Turbo I4 (200-205 hp)",
      years: range(2017, 2025),
      oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: "3.7 quarts 0W-20, turbo requires shorter interval" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 120, note: "6-speed manual" },
    },
    "Type R": {
      engine: "2.0L Turbo I4 (306-315 hp)",
      years: range(2017, 2025),
      oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: "5.7 quarts 0W-20" },
      spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 180 },
      transmission_fluid: { intervalMiles: 25000, intervalMonths: 24, cost: 130, note: "6-speed manual, Honda MTF" },
      differential_fluid: { intervalMiles: 25000, intervalMonths: 24, cost: 100, note: "Helical LSD" },
    },
  },
};

data.makes.Honda.models.Accord = {
  _defaults: {
    oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55 },
  },
  trims: {
    "LX/EX/EX-L 1.5T": {
      engine: "1.5L Turbo I4 (192 hp)",
      years: range(2018, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "3.4 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140, note: "CVT" },
    },
    "Sport/Touring 2.0T": {
      engine: "2.0L Turbo I4 (252 hp)",
      years: range(2018, 2022),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 55, note: "3.7 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 160 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 160, note: "10-speed auto" },
    },
    "Hybrid/Sport Hybrid": {
      engine: "2.0L Hybrid I4 (204 hp combined)",
      years: range(2018, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "3.7 quarts 0W-20" },
      ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
      serpentine_belt: { notApplicable: true },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: "eCVT" },
    },
  },
};

data.makes.Honda.models["CR-V"] = {
  _defaults: {
    oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50 },
  },
  trims: {
    "LX/EX/EX-L/Touring 1.5T": {
      engine: "1.5L Turbo I4 (190 hp)",
      years: range(2017, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "3.7 quarts 0W-20, check for oil dilution in cold climates" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 140 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 140, note: "CVT, Honda HCF-2" },
    },
    "Hybrid/Sport-L Hybrid": {
      engine: "2.0L Hybrid I4 (204 hp combined)",
      years: range(2020, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "3.7 quarts 0W-20" },
      ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
      serpentine_belt: { notApplicable: true },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// BMW
// ─────────────────────────────────────────────────────────────

data.makes.BMW.models["3 Series"] = {
  _defaults: {
    oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 130 },
    brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 120 },
  },
  trims: {
    "330i/330i xDrive": {
      engine: "2.0L Turbo I4 B48 (255 hp)",
      years: range(2019, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 110, note: "5.3 quarts 0W-30 LL-01" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 250 },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 320, note: "ZF 8-speed, BMW claims lifetime but service at 60k recommended" },
    },
    "M340i/M340i xDrive": {
      engine: "3.0L Turbo I6 B58 (382 hp)",
      years: range(2020, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 130, note: "6.9 quarts 0W-30 LL-01" },
      spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300, note: "High-output turbo, shorter interval" },
    },
    "M3/M3 Competition": {
      engine: "3.0L Twin-Turbo I6 S58 (473-503 hp)",
      years: range(2021, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 150, note: "7.9 quarts 0W-30 LL-01 FE" },
      spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 350 },
      transmission_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 380, note: "6-speed manual or ZF 8-speed auto" },
      differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 200 },
    },
    "330e": {
      engine: "2.0L Turbo I4 B48 + electric (288 hp PHEV)",
      years: range(2020, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 110, note: "5.3 quarts 0W-30" },
      ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
    },
  },
};

data.makes.BMW.models["5 Series"] = {
  _defaults: {
    oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 140 },
    brake_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 130 },
  },
  trims: {
    "530i/530i xDrive": {
      engine: "2.0L Turbo I4 B48 (248-255 hp)",
      years: range(2017, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 120, note: "5.3 quarts 0W-30 LL-01" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 260 },
    },
    "540i/540i xDrive": {
      engine: "3.0L Turbo I6 B58 (335 hp)",
      years: range(2017, 2024),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 140, note: "6.9 quarts 0W-30 LL-01" },
    },
    "M550i xDrive": {
      engine: "4.4L Twin-Turbo V8 N63 (523 hp)",
      years: range(2018, 2024),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 160, note: "8.5 quarts 0W-30 LL-01" },
      spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 400 },
    },
    "M5/M5 Competition": {
      engine: "4.4L Twin-Turbo V8 S63 (600-617 hp)",
      years: range(2018, 2024),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 170, note: "8.5 quarts 0W-30 LL-01" },
      spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 450 },
      differential_fluid: { intervalMiles: 50000, intervalMonths: 48, cost: 220 },
    },
    "i5 eDrive40/i5 M60 xDrive": {
      engine: "Electric (335-593 hp)",
      years: range(2024, 2025),
      oil_change: { notApplicable: true },
      spark_plugs: { notApplicable: true },
      serpentine_belt: { notApplicable: true },
      air_filter: { notApplicable: true },
      fuel_filter: { notApplicable: true },
      transmission_fluid: { notApplicable: true },
      ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// RAM
// ─────────────────────────────────────────────────────────────

data.makes.RAM.models["1500"] = {
  _defaults: {
    transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 120 },
    differential_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 120 },
  },
  trims: {
    "Tradesman/Big Horn/Laramie 3.6 V6": {
      engine: "3.6L Pentastar V6 eTorque (305 hp)",
      years: range(2019, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 170 },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: "8-speed auto (850RE)" },
    },
    "Big Horn/Laramie/Rebel/Limited 5.7 HEMI": {
      engine: "5.7L HEMI V8 eTorque (395 hp)",
      years: range(2019, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: "7 quarts 5W-20, MDS system" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "16 spark plugs (dual-plug HEMI)" },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 190, note: "8-speed auto (8HP75)" },
    },
    "Rebel/TRX 6.2 SC": {
      engine: "6.2L Supercharged HEMI V8 (702 hp)",
      years: range(2021, 2024),
      oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 100, note: "7 quarts 0W-40, supercharger oil check" },
      spark_plugs: { intervalMiles: 48000, intervalMonths: 48, cost: 260 },
      differential_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 150 },
      serpentine_belt: { intervalMiles: 40000, intervalMonths: 36, cost: 200 },
    },
    "EcoDiesel": {
      engine: "3.0L EcoDiesel V6 (260 hp)",
      years: range(2014, 2022),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: "10.3 quarts 5W-40" },
      spark_plugs: { notApplicable: true },
      fuel_filter: { intervalMiles: 20000, intervalMonths: 24, cost: 80, note: "Diesel fuel/water separator" },
    },
    "Limited/Longhorn 5.7 HEMI 4th gen": {
      engine: "5.7L HEMI V8 (395 hp)",
      years: range(2009, 2018),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: "7 quarts 5W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 200, note: "16 spark plugs" },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: "8-speed auto (8HP70) or 6-speed" },
    },
    "REV": {
      engine: "Electric (dual motor, 654 hp)",
      years: range(2025, 2026),
      oil_change: { notApplicable: true },
      spark_plugs: { notApplicable: true },
      serpentine_belt: { notApplicable: true },
      air_filter: { notApplicable: true },
      fuel_filter: { notApplicable: true },
      transmission_fluid: { notApplicable: true },
      ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// JEEP
// ─────────────────────────────────────────────────────────────

data.makes.Jeep.models.Wrangler = {
  _defaults: {
    differential_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 150, note: "Dana axles, more frequent if off-road" },
    transfer_case_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 120 },
  },
  trims: {
    "Sport/Sport S/Sahara 3.6 V6": {
      engine: "3.6L Pentastar V6 (285 hp)",
      years: range(2018, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "5 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 170, note: "8-speed auto or 6-speed manual" },
    },
    "Rubicon 3.6 V6": {
      engine: "3.6L Pentastar V6 (285 hp)",
      years: range(2018, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "5 quarts 0W-20" },
      differential_fluid: { intervalMiles: 15000, intervalMonths: 18, cost: 170, note: "Dana 44 heavy duty, lockers, severe duty if wheeling" },
      transfer_case_fluid: { intervalMiles: 15000, intervalMonths: 18, cost: 130, note: "NV241 Rock-Trac, full-time 4WD" },
    },
    "Sport/Sahara 2.0T": {
      engine: "2.0L Turbo I4 eTorque (270 hp)",
      years: range(2018, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 55, note: "5.1 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 150 },
    },
    "EcoDiesel": {
      engine: "3.0L EcoDiesel V6 (260 hp)",
      years: range(2020, 2023),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 75, note: "8 quarts 5W-40" },
      spark_plugs: { notApplicable: true },
      fuel_filter: { intervalMiles: 20000, intervalMonths: 24, cost: 80 },
    },
    "4xe": {
      engine: "2.0L Turbo I4 PHEV (375 hp combined)",
      years: range(2021, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "5.1 quarts 0W-20" },
      ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
    },
    "Rubicon 392": {
      engine: "6.4L HEMI V8 (470 hp)",
      years: range(2021, 2024),
      oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 80, note: "7 quarts 0W-40" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 240, note: "16 spark plugs" },
      differential_fluid: { intervalMiles: 15000, intervalMonths: 18, cost: 180, note: "Dana 44 HD, severe off-road duty" },
    },
  },
};

data.makes.Jeep.models["Grand Cherokee"] = {
  _defaults: {
    transfer_case_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 110 },
    differential_fluid: { intervalMiles: 30000, intervalMonths: 36, cost: 120 },
  },
  trims: {
    "Laredo/Limited/Overland 3.6 V6": {
      engine: "3.6L Pentastar V6 (293 hp)",
      years: range(2011, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "6 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 180 },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180, note: "8-speed auto (850RE)" },
    },
    "Overland/Summit 5.7 HEMI": {
      engine: "5.7L HEMI V8 (357-360 hp)",
      years: range(2011, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: "7 quarts 5W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 220, note: "16 spark plugs" },
    },
    "SRT/Trackhawk 6.4/6.2SC": {
      engine: "6.4L HEMI V8 (475 hp) or 6.2L SC HEMI (707 hp)",
      years: range(2014, 2022),
      oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 85, note: "7 quarts 0W-40" },
      spark_plugs: { intervalMiles: 48000, intervalMonths: 48, cost: 260 },
    },
    "4xe": {
      engine: "2.0L Turbo I4 PHEV (375 hp combined)",
      years: range(2022, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 60, note: "5.1 quarts 0W-20" },
      ev_battery_check: { intervalMiles: 15000, intervalMonths: 12, cost: 0 },
    },
    "EcoDiesel": {
      engine: "3.0L EcoDiesel V6 (240-260 hp)",
      years: range(2014, 2022),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: "10.3 quarts 5W-40" },
      spark_plugs: { notApplicable: true },
      fuel_filter: { intervalMiles: 20000, intervalMonths: 24, cost: 80 },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// NISSAN
// ─────────────────────────────────────────────────────────────

data.makes.Nissan.models.Altima = {
  _defaults: {
    oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50 },
  },
  trims: {
    "S/SV/SL/SR 2.5": {
      engine: "2.5L I4 (188 hp)",
      years: range(2019, 2025),
      oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: "5 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 130 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 180, note: "CVT, Nissan NS-3 required" },
    },
    "SR/Platinum 2.0T VC-Turbo": {
      engine: "2.0L VC-Turbo I4 (248 hp)",
      years: range(2019, 2025),
      oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: "5.4 quarts 0W-20, variable compression turbo" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 160 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 190, note: "CVT, Nissan NS-3" },
    },
  },
};

data.makes.Nissan.models.Rogue = {
  _defaults: {
    oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50 },
  },
  trims: {
    "S/SV/SL/Platinum 2.5": {
      engine: "2.5L I4 (181 hp)",
      years: range(2014, 2020),
      oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 45, note: "4.9 quarts 0W-20" },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 180, note: "CVT, Nissan NS-3" },
    },
    "S/SV/SL/Platinum 1.5T": {
      engine: "1.5L VC-Turbo I3 (201 hp)",
      years: range(2021, 2025),
      oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 50, note: "4.4 quarts 0W-20, variable compression" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 120 },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 24, cost: 190, note: "CVT, Nissan NS-3" },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// HYUNDAI
// ─────────────────────────────────────────────────────────────

data.makes.Hyundai.models.Elantra = {
  _defaults: {
    oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45 },
  },
  trims: {
    "SE/SEL/Limited 2.0": {
      engine: "2.0L I4 (147 hp)",
      years: range(2017, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 40, note: "4.2 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 120 },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150, note: "IVT (CVT)" },
    },
    "N Line 1.6T": {
      engine: "1.6L Turbo I4 (201 hp)",
      years: range(2021, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 50, note: "4.7 quarts 0W-20" },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160, note: "7-speed DCT" },
    },
    "N": {
      engine: "2.0L Turbo I4 (276 hp)",
      years: range(2022, 2025),
      oil_change: { intervalMiles: 5000, intervalMonths: 6, cost: 55, note: "5.1 quarts 0W-30" },
      spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 160 },
      transmission_fluid: { intervalMiles: 45000, intervalMonths: 36, cost: 170, note: "6-speed manual or 8-speed DCT" },
    },
    "Hybrid": {
      engine: "1.6L Hybrid I4 (139 hp combined)",
      years: range(2021, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 45, note: "3.8 quarts 0W-20" },
      ev_battery_check: { intervalMiles: 30000, intervalMonths: 24, cost: 0 },
      serpentine_belt: { notApplicable: true },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// SUBARU
// ─────────────────────────────────────────────────────────────

data.makes.Subaru.models.WRX = {
  _defaults: {
    oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 60 },
    differential_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 120 },
  },
  trims: {
    "Base/Premium/Limited": {
      engine: "2.4L Turbo Boxer H4 (271 hp)",
      years: range(2022, 2025),
      oil_change: { intervalMiles: 6000, intervalMonths: 6, cost: 60, note: "5.4 quarts 0W-20" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 60, cost: 250, note: "Boxer H4, horizontal access" },
      transmission_fluid: { intervalMiles: 30000, intervalMonths: 30, cost: 150, note: "6-speed manual, Subaru Extra MT" },
    },
    "STI": {
      engine: "2.5L Turbo Boxer H4 EJ257 (310 hp)",
      years: range(2015, 2021),
      oil_change: { intervalMiles: 3000, intervalMonths: 3, cost: 65, note: "5.4 quarts 5W-30, turbo requires frequent changes" },
      spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 260, note: "Boxer H4, horizontal access, colder plugs for track" },
      transmission_fluid: { intervalMiles: 25000, intervalMonths: 24, cost: 160, note: "6-speed manual STI, Subaru Extra MT" },
      differential_fluid: { intervalMiles: 25000, intervalMonths: 24, cost: 140, note: "Front, center (DCCD), and rear differentials" },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// AUDI
// ─────────────────────────────────────────────────────────────

data.makes.Audi.models.A4 = {
  _defaults: {
    oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 110 },
    brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 120 },
  },
  trims: {
    "Premium/Premium Plus/Prestige 2.0T": {
      engine: "2.0L TFSI Turbo I4 (201-261 hp)",
      years: range(2017, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: "5.7 quarts 0W-20 VW 508.00" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 220 },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 320, note: "7-speed S tronic DCT" },
    },
    "S4": {
      engine: "3.0L TFSI Turbo V6 (349-354 hp)",
      years: range(2018, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 130, note: "6.8 quarts 0W-20 VW 508.00" },
      spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300 },
      transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
    },
    "RS 4 Avant": {
      engine: "2.9L Twin-Turbo V6 (444 hp)",
      years: range(2020, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 150, note: "8.5 quarts 0W-20" },
      spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 350 },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// VOLKSWAGEN
// ─────────────────────────────────────────────────────────────

data.makes.Volkswagen.models.GTI = {
  _defaults: {
    oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80 },
    brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 100 },
  },
  trims: {
    "S/SE/Autobahn 2.0T": {
      engine: "2.0L TSI Turbo I4 (228-241 hp)",
      years: range(2015, 2025),
      oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 75, note: "5.7 quarts 0W-20 VW 508.00 (2019+) or 5W-40 VW 502.00 (2015-2018)" },
      spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
      transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 260, note: "7-speed DSG, VW recommends 40k for DSG" },
    },
  },
};

data.makes.Volkswagen.models["Golf R"] = {
  trims: {
    "Golf R 2.0T": {
      engine: "2.0L TSI Turbo I4 (315 hp)",
      years: range(2022, 2025),
      oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 85, note: "5.7 quarts 0W-20 VW 508.00" },
      spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 200 },
      transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 280, note: "7-speed DSG" },
      differential_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 150, note: "Haldex AWD rear diff" },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Update EV/Hybrid lists with new entries
// ─────────────────────────────────────────────────────────────

// Add new EVs
if (!data.evModels.Chevrolet.includes("Equinox EV")) data.evModels.Chevrolet.push("Equinox EV");
if (!data.evModels.Dodge) data.evModels.Dodge = [];
if (!data.evModels.Dodge.includes("Charger Daytona")) data.evModels.Dodge.push("Charger Daytona");
if (!data.evModels.RAM) data.evModels.RAM = [];
if (!data.evModels.RAM.includes("REV")) data.evModels.RAM.push("REV");

// Add new hybrids
if (!data.hybridModels.Toyota.includes("Tacoma i-FORCE MAX")) data.hybridModels.Toyota.push("Tacoma i-FORCE MAX");
if (!data.hybridModels.Toyota.includes("4Runner i-FORCE MAX")) data.hybridModels.Toyota.push("4Runner i-FORCE MAX");
if (!data.hybridModels.Ford) data.hybridModels.Ford = ["Escape Hybrid", "Maverick Hybrid", "Explorer Hybrid"];
if (!data.hybridModels.Ford.includes("F-150 PowerBoost")) data.hybridModels.Ford.push("F-150 PowerBoost");

// ─────────────────────────────────────────────────────────────
// Write out
// ─────────────────────────────────────────────────────────────

fs.writeFileSync(overridesPath, JSON.stringify(data, null, 2) + '\n');

// Count entries
let totalTrims = 0;
let totalModelsWithTrims = 0;
for (const [make, makeData] of Object.entries(data.makes)) {
  if (!makeData.models) continue;
  for (const [model, modelData] of Object.entries(makeData.models)) {
    if (modelData.trims) {
      totalModelsWithTrims++;
      totalTrims += Object.keys(modelData.trims).length;
    }
  }
}

console.log(`Updated maintenance-overrides.json`);
console.log(`Models with trim schedules: ${totalModelsWithTrims}`);
console.log(`Total trim entries: ${totalTrims}`);
console.log(`Makes with trim data: Chevrolet, Ford, Dodge, Toyota, Honda, BMW, RAM, Jeep, Nissan, Hyundai, Subaru, Audi, Volkswagen`);
