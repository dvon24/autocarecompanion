#!/usr/bin/env node
/**
 * Batch 3b: Add trim-based maintenance schedules for remaining Audi and Volkswagen models.
 * Preserves existing trims (Audi A4, VW GTI, VW Golf R).
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'data', 'maintenance-overrides.json');
const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);

// ── EV template (reuse for all pure EVs) ──
const evIceNA = {
  oil_change: { notApplicable: true },
  spark_plugs: { notApplicable: true },
  serpentine_belt: { notApplicable: true },
  air_filter: { notApplicable: true },
  fuel_filter: { notApplicable: true },
  transmission_fluid: { notApplicable: true },
};

// ═══════════════════════════════════════════
//  AUDI TRIM DATA
// ═══════════════════════════════════════════
const audiTrims = {
  A3: {
    trims: {
      'Premium/Premium Plus 2.0T': {
        engine: '2.0L TFSI Turbo I4 (184-201 hp)',
        years: range(2015, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 95, note: '5.5 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 300, note: '7-speed S tronic DSG' },
      },
      'S3': {
        engine: '2.0L TFSI Turbo I4 (288-306 hp)',
        years: range(2015, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 110, note: '5.7 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 240 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 320, note: '7-speed S tronic DSG' },
        differential_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 160, note: 'Haldex AWD rear diff' },
      },
      'RS 3': {
        engine: '2.5L TFSI Turbo I5 (394-401 hp)',
        years: range(2017, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 140, note: '6.9 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 320 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 350, note: '7-speed S tronic DSG' },
        differential_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 170 },
      },
    },
  },
  A5: {
    trims: {
      'Premium/Prestige 2.0T': {
        engine: '2.0L TFSI Turbo I4 (201-261 hp)',
        years: range(2018, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: '5.7 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 220 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 320, note: '7-speed S tronic DSG' },
      },
      'S5': {
        engine: '3.0L TFSI Turbo V6 (349-354 hp)',
        years: range(2018, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 130, note: '6.8 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 350, note: '8-speed ZF torque converter' },
      },
      'RS 5': {
        engine: '2.9L Twin-Turbo V6 (444 hp)',
        years: range(2018, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 150, note: '8.5 quarts 0W-20' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 350 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 380, note: '8-speed ZF torque converter' },
      },
    },
  },
  A6: {
    trims: {
      'Premium/Prestige 2.0T': {
        engine: '2.0L TFSI Turbo I4 (248-261 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 105, note: '5.7 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 230 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 330, note: '7-speed S tronic DSG' },
      },
      'S6': {
        engine: '2.9L Twin-Turbo V6 (444 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 140, note: '8.0 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 320 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 380, note: '8-speed ZF torque converter' },
      },
    },
  },
  A7: {
    trims: {
      'Premium/Prestige 2.0T/3.0T': {
        engine: '2.0L/3.0L TFSI Turbo (248-335 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 110, note: '5.7-7.0 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 260 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 340, note: '7-speed S tronic DSG' },
      },
      'S7/RS 7': {
        engine: '2.9L/4.0L Twin-Turbo V6/V8 (444-621 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 155, note: '8.5 quarts 0W-20' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 380 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 400, note: '8-speed ZF torque converter' },
      },
    },
  },
  A8: {
    trims: {
      '55 TFSI 3.0T': {
        engine: '3.0L TFSI Turbo V6 (335-453 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 140, note: '7.0 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 300 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 400, note: '8-speed ZF torque converter' },
      },
      'S8': {
        engine: '4.0L Twin-Turbo V8 (563-591 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 180, note: '9.0 quarts 0W-20' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 420 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 420, note: '8-speed ZF torque converter' },
      },
    },
  },
  TT: {
    trims: {
      '2.0T/45 TFSI': {
        engine: '2.0L TFSI Turbo I4 (220-228 hp)',
        years: range(2016, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 90, note: '5.4 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 300, note: '6-speed S tronic DSG' },
      },
      'TTS': {
        engine: '2.0L TFSI Turbo I4 (288-306 hp)',
        years: range(2016, 2023),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 100, note: '5.7 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 240 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 320, note: '6-speed S tronic DSG' },
      },
      'TT RS': {
        engine: '2.5L TFSI Turbo I5 (394-401 hp)',
        years: range(2018, 2022),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 130, note: '6.5 quarts 0W-20' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 300 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 350, note: '7-speed S tronic DSG' },
      },
    },
  },
  'e-tron': {
    trims: {
      'Premium/Prestige': {
        engine: 'Dual electric motors (355-402 hp), 95 kWh battery',
        years: range(2019, 2025),
        ...evIceNA,
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 130 },
      },
      'S/e-tron S': {
        engine: 'Tri electric motors (496 hp), 95 kWh battery',
        years: range(2022, 2025),
        ...evIceNA,
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 130 },
      },
    },
  },
  'e-tron GT': {
    trims: {
      'Premium Plus/Prestige': {
        engine: 'Dual electric motors (469 hp), 93.4 kWh battery',
        years: range(2022, 2025),
        ...evIceNA,
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 140 },
      },
      'RS e-tron GT': {
        engine: 'Dual electric motors (637 hp), 93.4 kWh battery',
        years: range(2022, 2025),
        ...evIceNA,
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 140 },
      },
    },
  },
  'Q4 e-tron': {
    trims: {
      'Premium/Prestige': {
        engine: 'Single/dual electric motors (201-295 hp), 77 kWh battery',
        years: range(2022, 2025),
        ...evIceNA,
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 120 },
      },
    },
  },
  Q3: {
    trims: {
      'Premium/Premium Plus 2.0T': {
        engine: '2.0L TFSI Turbo I4 (184-228 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 95, note: '5.5 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 300, note: '8-speed conventional auto' },
      },
      'RS Q3': {
        engine: '2.5L TFSI Turbo I5 (394 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 130, note: '6.5 quarts 0W-20' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 300 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 340, note: '7-speed S tronic DSG' },
      },
    },
  },
  Q5: {
    trims: {
      'Premium/Prestige 2.0T': {
        engine: '2.0L TFSI Turbo I4 (248-261 hp)',
        years: range(2018, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: '5.9 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 220 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 320, note: '7-speed S tronic DSG' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
      },
      'SQ5': {
        engine: '3.0L TFSI Turbo V6 (349-354 hp)',
        years: range(2018, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 130, note: '6.8 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 360, note: '8-speed ZF torque converter' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
      },
    },
  },
  Q7: {
    trims: {
      '55 TFSI 3.0T': {
        engine: '3.0L TFSI Turbo V6 (335 hp)',
        years: range(2017, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 120, note: '6.9 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 280 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 380, note: '8-speed ZF torque converter' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
      },
      'SQ7': {
        engine: '4.0L Twin-Turbo V8 (500 hp)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 160, note: '8.5 quarts 0W-20' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 380 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 420, note: '8-speed ZF torque converter' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
      },
    },
  },
  Q8: {
    trims: {
      '55 TFSI 3.0T': {
        engine: '3.0L TFSI Turbo V6 (335 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 125, note: '6.9 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 280 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 380, note: '8-speed ZF torque converter' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
      },
      'RS Q8': {
        engine: '4.0L Twin-Turbo V8 (591 hp)',
        years: range(2020, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 170, note: '9.0 quarts 0W-20' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 400 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 430, note: '8-speed ZF torque converter' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 200 },
      },
    },
  },
  R8: {
    trims: {
      'V10/V10 Performance': {
        engine: '5.2L NA V10 (562-602 hp)',
        years: range(2017, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 250, note: '10.6 quarts 5W-40 dry sump' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 500 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 450, note: '7-speed S tronic DSG' },
        differential_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 200 },
      },
    },
  },
  RS3: {
    trims: {
      '2.5T': {
        engine: '2.5L TFSI Turbo I5 (394-401 hp)',
        years: range(2017, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 140, note: '6.9 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 320 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 350, note: '7-speed S tronic DSG' },
        differential_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 170 },
      },
    },
  },
  RS7: {
    trims: {
      '4.0T': {
        engine: '4.0L Twin-Turbo V8 (591-621 hp)',
        years: range(2021, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 180, note: '9.0 quarts 0W-20' },
        spark_plugs: { intervalMiles: 36000, intervalMonths: 36, cost: 420 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 420, note: '8-speed ZF torque converter' },
      },
    },
  },
  SQ5: {
    trims: {
      '3.0T': {
        engine: '3.0L TFSI Turbo V6 (349-354 hp)',
        years: range(2018, 2025),
        oil_change: { intervalMiles: 7500, intervalMonths: 12, cost: 130, note: '6.8 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 45000, intervalMonths: 48, cost: 300 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 360, note: '8-speed ZF torque converter' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
      },
    },
  },
};

// ═══════════════════════════════════════════
//  VOLKSWAGEN TRIM DATA
// ═══════════════════════════════════════════
const vwTrims = {
  Golf: {
    trims: {
      'S/SE/SEL 1.4T/2.0T': {
        engine: '1.4L/2.0L TSI Turbo I4 (147-228 hp)',
        years: range(2015, 2021),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: '5.7 quarts, 5W-40 VW 502.00 (pre-2019) or 0W-20 VW 508.00 (2019+)' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 160 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 240, note: '6-speed auto or 6-speed manual' },
      },
    },
  },
  Jetta: {
    trims: {
      'S/SE/SEL 1.4T/1.5T': {
        engine: '1.4L/1.5L TSI Turbo I4 (147-158 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: '5.5 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 150 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 220, note: '8-speed conventional auto' },
      },
      'GLI': {
        engine: '2.0L TSI Turbo I4 (228 hp)',
        years: range(2019, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 75, note: '5.7 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 260, note: '7-speed DSG' },
      },
    },
  },
  Passat: {
    trims: {
      'S/SE/SEL 2.0T': {
        engine: '2.0L TSI Turbo I4 (174 hp)',
        years: range(2016, 2022),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: '5.7 quarts, 5W-40 VW 502.00 (pre-2019) or 0W-20 VW 508.00 (2019+)' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 170 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 240, note: '6-speed conventional auto' },
      },
    },
  },
  Tiguan: {
    trims: {
      'S/SE/SEL 2.0T': {
        engine: '2.0L TSI Turbo I4 (184-228 hp)',
        years: range(2018, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 75, note: '5.7 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 260, note: '8-speed conventional auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150 },
      },
    },
  },
  Atlas: {
    trims: {
      '2.0T SE/SEL': {
        engine: '2.0L TSI Turbo I4 (235 hp)',
        years: range(2018, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: '5.9 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 260, note: '8-speed conventional auto' },
      },
      '3.6L V6 SE/SEL': {
        engine: '3.6L VR6 (276 hp)',
        years: range(2018, 2023),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 90, note: '6.3 quarts 0W-20' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 240 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 280, note: '8-speed conventional auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 150 },
      },
    },
  },
  Beetle: {
    trims: {
      '2.0T/S/SE/SEL': {
        engine: '2.0L TSI Turbo I4 (174-210 hp)',
        years: range(2012, 2019),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 65, note: '5.7 quarts 5W-40 VW 502.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 160 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 240, note: '6-speed DSG' },
      },
    },
  },
  'ID.4': {
    trims: {
      'Standard/Pro/Pro S': {
        engine: 'Single/dual electric motors (201-295 hp), 62-82 kWh battery',
        years: range(2021, 2025),
        ...evIceNA,
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 100 },
      },
    },
  },
  'ID. Buzz': {
    trims: {
      'Pro S/1st Edition': {
        engine: 'Single/dual electric motors (201-295 hp), 91 kWh battery',
        years: range(2024, 2026),
        ...evIceNA,
        ev_battery_check: { intervalMiles: 20000, intervalMonths: 24, cost: 0 },
        brake_fluid: { intervalMiles: 20000, intervalMonths: 24, cost: 110 },
      },
    },
  },
  Taos: {
    trims: {
      'S/SE/SEL 1.5T': {
        engine: '1.5L TSI Turbo I4 (158 hp)',
        years: range(2022, 2025),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: '5.5 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 150 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 240, note: '8-speed auto (FWD) or 7-speed DSG (AWD)' },
      },
    },
  },
  CC: {
    trims: {
      'Sport/Luxury/R-Line 2.0T': {
        engine: '2.0L TSI Turbo I4 (200 hp)',
        years: range(2013, 2018),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 70, note: '5.7 quarts 5W-40 VW 502.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 180 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 260, note: '6-speed DSG' },
      },
      'VR6 4Motion': {
        engine: '3.6L VR6 (280 hp)',
        years: range(2013, 2017),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 85, note: '6.3 quarts 5W-40 VW 502.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 220 },
        transmission_fluid: { intervalMiles: 40000, intervalMonths: 36, cost: 280, note: '6-speed DSG' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 140, note: 'Haldex AWD' },
      },
    },
  },
  Touareg: {
    trims: {
      'VR6 Lux/Executive': {
        engine: '3.6L VR6 (280 hp)',
        years: range(2011, 2017),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 100, note: '7.4 quarts 5W-40 VW 502.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 260 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 320, note: '8-speed conventional auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160 },
      },
      'TDI': {
        engine: '3.0L TDI Turbo Diesel V6 (225-240 hp)',
        years: range(2011, 2016),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 110, note: '8.0 quarts 5W-40 VW 507.00 diesel' },
        spark_plugs: { notApplicable: true },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 320, note: '8-speed conventional auto' },
        transfer_case_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 160 },
      },
    },
  },
  Arteon: {
    trims: {
      'SE/SEL/SEL Premium 2.0T': {
        engine: '2.0L TSI Turbo I4 (268-300 hp)',
        years: range(2019, 2024),
        oil_change: { intervalMiles: 10000, intervalMonths: 12, cost: 80, note: '5.7 quarts 0W-20 VW 508.00' },
        spark_plugs: { intervalMiles: 60000, intervalMonths: 48, cost: 190 },
        transmission_fluid: { intervalMiles: 60000, intervalMonths: 48, cost: 270, note: '8-speed conventional auto' },
      },
    },
  },
};

// ═══════════════════════════════════════════
//  MERGE LOGIC
// ═══════════════════════════════════════════
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

let audiAdded = 0;
let audiSkipped = 0;
let vwAdded = 0;
let vwSkipped = 0;

function mergeTrims(makeObj, modelName, newModelData) {
  if (!makeObj.models) makeObj.models = {};
  if (!makeObj.models[modelName]) makeObj.models[modelName] = {};

  const modelObj = makeObj.models[modelName];

  // If model already has trims, merge without overwriting existing trim keys
  if (modelObj.trims) {
    const existingTrims = Object.keys(modelObj.trims);
    for (const [trimName, trimData] of Object.entries(newModelData.trims)) {
      if (modelObj.trims[trimName]) {
        return { added: 0, skipped: 1 };
      }
      modelObj.trims[trimName] = trimData;
    }
    return { added: Object.keys(newModelData.trims).length, skipped: 0 };
  }

  // No existing trims — add them all
  modelObj.trims = newModelData.trims;
  return { added: Object.keys(newModelData.trims).length, skipped: 0 };
}

// Merge Audi
const audiMake = data.makes['Audi'];
if (!audiMake) {
  console.error('ERROR: Audi make not found in maintenance-overrides.json');
  process.exit(1);
}

for (const [model, modelData] of Object.entries(audiTrims)) {
  const result = mergeTrims(audiMake, model, modelData);
  audiAdded += result.added;
  audiSkipped += result.skipped;
}

// Merge VW
const vwMake = data.makes['Volkswagen'];
if (!vwMake) {
  console.error('ERROR: Volkswagen make not found in maintenance-overrides.json');
  process.exit(1);
}

for (const [model, modelData] of Object.entries(vwTrims)) {
  const result = mergeTrims(vwMake, model, modelData);
  vwAdded += result.added;
  vwSkipped += result.skipped;
}

// Write back
fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');

// Summary
const audiModels = Object.keys(audiTrims).length;
const vwModels = Object.keys(vwTrims).length;
const totalTrims = audiAdded + vwAdded;

console.log('=== Batch 3b: Audi + Volkswagen Trim Schedules ===');
console.log(`Audi:       ${audiModels} models, ${audiAdded} trims added, ${audiSkipped} skipped (existing)`);
console.log(`Volkswagen: ${vwModels} models, ${vwAdded} trims added, ${vwSkipped} skipped (existing)`);
console.log(`Total:      ${audiModels + vwModels} models, ${totalTrims} trims added`);
console.log('File written:', FILE);
