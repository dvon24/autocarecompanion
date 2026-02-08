/**
 * OBD-II Code Database
 *
 * Common OBD-II diagnostic trouble codes with descriptions.
 * This is a subset of the most frequently encountered codes.
 * For unknown codes, we return a generic description based on the code system.
 */

// Common powertrain codes (P0XXX)
const POWERTRAIN_CODES: Record<string, string> = {
  // Fuel and Air Metering
  P0100: 'Mass Air Flow (MAF) Circuit Malfunction',
  P0101: 'Mass Air Flow (MAF) Circuit Range/Performance',
  P0102: 'Mass Air Flow (MAF) Circuit Low Input',
  P0103: 'Mass Air Flow (MAF) Circuit High Input',
  P0106: 'Manifold Absolute Pressure (MAP) Circuit Range/Performance',
  P0107: 'Manifold Absolute Pressure (MAP) Circuit Low Input',
  P0108: 'Manifold Absolute Pressure (MAP) Circuit High Input',
  P0110: 'Intake Air Temperature (IAT) Circuit Malfunction',
  P0111: 'Intake Air Temperature (IAT) Circuit Range/Performance',
  P0112: 'Intake Air Temperature (IAT) Circuit Low Input',
  P0113: 'Intake Air Temperature (IAT) Circuit High Input',
  P0115: 'Engine Coolant Temperature (ECT) Circuit Malfunction',
  P0116: 'Engine Coolant Temperature (ECT) Circuit Range/Performance',
  P0117: 'Engine Coolant Temperature (ECT) Circuit Low Input',
  P0118: 'Engine Coolant Temperature (ECT) Circuit High Input',
  P0120: 'Throttle Position Sensor (TPS) Circuit Malfunction',
  P0121: 'Throttle Position Sensor (TPS) Circuit Range/Performance',
  P0122: 'Throttle Position Sensor (TPS) Circuit Low Input',
  P0123: 'Throttle Position Sensor (TPS) Circuit High Input',
  P0125: 'Insufficient Coolant Temperature for Closed Loop',
  P0128: 'Coolant Thermostat - Below Regulating Temperature',
  P0130: 'O2 Sensor Circuit Malfunction (Bank 1, Sensor 1)',
  P0131: 'O2 Sensor Circuit Low Voltage (Bank 1, Sensor 1)',
  P0132: 'O2 Sensor Circuit High Voltage (Bank 1, Sensor 1)',
  P0133: 'O2 Sensor Circuit Slow Response (Bank 1, Sensor 1)',
  P0134: 'O2 Sensor Circuit No Activity Detected (Bank 1, Sensor 1)',
  P0135: 'O2 Sensor Heater Circuit Malfunction (Bank 1, Sensor 1)',
  P0136: 'O2 Sensor Circuit Malfunction (Bank 1, Sensor 2)',
  P0137: 'O2 Sensor Circuit Low Voltage (Bank 1, Sensor 2)',
  P0138: 'O2 Sensor Circuit High Voltage (Bank 1, Sensor 2)',
  P0139: 'O2 Sensor Circuit Slow Response (Bank 1, Sensor 2)',
  P0140: 'O2 Sensor Circuit No Activity Detected (Bank 1, Sensor 2)',
  P0141: 'O2 Sensor Heater Circuit Malfunction (Bank 1, Sensor 2)',
  P0150: 'O2 Sensor Circuit Malfunction (Bank 2, Sensor 1)',
  P0151: 'O2 Sensor Circuit Low Voltage (Bank 2, Sensor 1)',
  P0152: 'O2 Sensor Circuit High Voltage (Bank 2, Sensor 1)',
  P0153: 'O2 Sensor Circuit Slow Response (Bank 2, Sensor 1)',
  P0154: 'O2 Sensor Circuit No Activity Detected (Bank 2, Sensor 1)',
  P0155: 'O2 Sensor Heater Circuit Malfunction (Bank 2, Sensor 1)',
  P0156: 'O2 Sensor Circuit Malfunction (Bank 2, Sensor 2)',
  P0157: 'O2 Sensor Circuit Low Voltage (Bank 2, Sensor 2)',
  P0158: 'O2 Sensor Circuit High Voltage (Bank 2, Sensor 2)',
  P0171: 'System Too Lean (Bank 1)',
  P0172: 'System Too Rich (Bank 1)',
  P0174: 'System Too Lean (Bank 2)',
  P0175: 'System Too Rich (Bank 2)',

  // Ignition System
  P0300: 'Random/Multiple Cylinder Misfire Detected',
  P0301: 'Cylinder 1 Misfire Detected',
  P0302: 'Cylinder 2 Misfire Detected',
  P0303: 'Cylinder 3 Misfire Detected',
  P0304: 'Cylinder 4 Misfire Detected',
  P0305: 'Cylinder 5 Misfire Detected',
  P0306: 'Cylinder 6 Misfire Detected',
  P0307: 'Cylinder 7 Misfire Detected',
  P0308: 'Cylinder 8 Misfire Detected',
  P0325: 'Knock Sensor 1 Circuit Malfunction (Bank 1)',
  P0326: 'Knock Sensor 1 Circuit Range/Performance (Bank 1)',
  P0327: 'Knock Sensor 1 Circuit Low Input (Bank 1)',
  P0328: 'Knock Sensor 1 Circuit High Input (Bank 1)',
  P0335: 'Crankshaft Position Sensor A Circuit Malfunction',
  P0336: 'Crankshaft Position Sensor A Circuit Range/Performance',
  P0340: 'Camshaft Position Sensor Circuit Malfunction',
  P0341: 'Camshaft Position Sensor Circuit Range/Performance',

  // Emissions
  P0400: 'Exhaust Gas Recirculation (EGR) Flow Malfunction',
  P0401: 'EGR Flow Insufficient Detected',
  P0402: 'EGR Flow Excessive Detected',
  P0403: 'EGR Control Circuit Malfunction',
  P0420: 'Catalyst System Efficiency Below Threshold (Bank 1)',
  P0421: 'Warm Up Catalyst Efficiency Below Threshold (Bank 1)',
  P0430: 'Catalyst System Efficiency Below Threshold (Bank 2)',
  P0440: 'Evaporative Emission System Malfunction',
  P0441: 'EVAP System Incorrect Purge Flow',
  P0442: 'EVAP System Leak Detected (Small Leak)',
  P0443: 'EVAP Purge Control Valve Circuit Malfunction',
  P0446: 'EVAP Vent Control Circuit Malfunction',
  P0449: 'EVAP Vent Valve/Solenoid Circuit Malfunction',
  P0455: 'EVAP System Leak Detected (Large Leak)',
  P0456: 'EVAP System Leak Detected (Very Small Leak)',

  // Transmission
  P0500: 'Vehicle Speed Sensor Malfunction',
  P0505: 'Idle Control System Malfunction',
  P0506: 'Idle Control System RPM Lower Than Expected',
  P0507: 'Idle Control System RPM Higher Than Expected',
  P0562: 'System Voltage Low',
  P0563: 'System Voltage High',

  // Transmission Codes
  P0700: 'Transmission Control System Malfunction',
  P0705: 'Transmission Range Sensor Circuit Malfunction',
  P0715: 'Input/Turbine Speed Sensor Circuit Malfunction',
  P0720: 'Output Speed Sensor Circuit Malfunction',
  P0730: 'Incorrect Gear Ratio',
  P0731: 'Gear 1 Incorrect Ratio',
  P0732: 'Gear 2 Incorrect Ratio',
  P0733: 'Gear 3 Incorrect Ratio',
  P0734: 'Gear 4 Incorrect Ratio',
  P0740: 'Torque Converter Clutch Circuit Malfunction',
  P0741: 'Torque Converter Clutch Circuit Performance or Stuck Off',
  P0750: 'Shift Solenoid A Malfunction',
  P0755: 'Shift Solenoid B Malfunction',
  P0760: 'Shift Solenoid C Malfunction',
};

// Common body codes (B0XXX)
const BODY_CODES: Record<string, string> = {
  B0001: 'Driver Frontal Stage 1 Deployment Control',
  B0002: 'Driver Frontal Stage 2 Deployment Control',
  B0100: 'Electronic Frontal Sensor 1',
  B1000: 'ECU Malfunction',
  B1200: 'Climate Control Push Button Circuit',
  B1318: 'Battery Voltage Low',
  B1342: 'ECU Internal Failure',
  B1600: 'PATS Transceiver Fault',
  B1601: 'PATS Received Invalid Format',
  B1602: 'PATS Received Invalid Key Code',
  B2799: 'Engine Immobilizer System Malfunction',
};

// Common chassis codes (C0XXX)
const CHASSIS_CODES: Record<string, string> = {
  C0035: 'Left Front Wheel Speed Sensor Circuit',
  C0040: 'Right Front Wheel Speed Sensor Circuit',
  C0045: 'Left Rear Wheel Speed Sensor Circuit',
  C0050: 'Right Rear Wheel Speed Sensor Circuit',
  C0060: 'Left Front ABS Solenoid Circuit',
  C0065: 'Right Front ABS Solenoid Circuit',
  C0070: 'Left Rear ABS Solenoid Circuit',
  C0075: 'Right Rear ABS Solenoid Circuit',
  C0110: 'Pump Motor Circuit',
  C0161: 'ABS/TCS Brake Switch Circuit',
  C0265: 'EBCM Motor Relay Circuit',
  C0550: 'ECU Performance',
  C1095: 'ABS Hydraulic Pump Motor Circuit Low',
  C1096: 'ABS Hydraulic Pump Motor Circuit Open',
  C1201: 'Engine Control System Malfunction',
  C1223: 'ABS Control System Malfunction',
  C1234: 'Wheel Speed Sensor Signal Missing',
  C1241: 'Low Battery Positive Voltage',
};

// Common network codes (U0XXX)
const NETWORK_CODES: Record<string, string> = {
  U0001: 'High Speed CAN Communication Bus',
  U0002: 'High Speed CAN Communication Bus Performance',
  U0100: 'Lost Communication With ECM/PCM A',
  U0101: 'Lost Communication With TCM',
  U0102: 'Lost Communication With Transfer Case Control Module',
  U0103: 'Lost Communication With Gear Shift Module',
  U0121: 'Lost Communication With ABS Control Module',
  U0122: 'Lost Communication With Vehicle Dynamics Control Module',
  U0126: 'Lost Communication With Steering Angle Sensor Module',
  U0140: 'Lost Communication With Body Control Module',
  U0151: 'Lost Communication With Restraints Control Module',
  U0155: 'Lost Communication With Instrument Panel Cluster',
  U0164: 'Lost Communication With HVAC Control Module',
  U0184: 'Lost Communication With Radio',
  U0300: 'Internal Control Module Software Incompatibility',
  U0401: 'Invalid Data Received From ECM/PCM A',
  U1000: 'Class 2 Communication Malfunction',
};

/**
 * Look up an OBD code and return its description
 */
export function lookupOBDCode(code: string): string | null {
  const normalizedCode = code.toUpperCase();
  const prefix = normalizedCode.charAt(0);

  switch (prefix) {
    case 'P':
      return POWERTRAIN_CODES[normalizedCode] || null;
    case 'B':
      return BODY_CODES[normalizedCode] || null;
    case 'C':
      return CHASSIS_CODES[normalizedCode] || null;
    case 'U':
      return NETWORK_CODES[normalizedCode] || null;
    default:
      return null;
  }
}

/**
 * Get a description for an OBD code, with fallback for unknown codes
 */
export function getOBDCodeDescription(code: string): string {
  const known = lookupOBDCode(code);
  if (known) {
    return known;
  }

  // Generate a fallback description for unknown codes
  const prefix = code.charAt(0).toUpperCase();
  const systemNames: Record<string, string> = {
    P: 'Powertrain',
    B: 'Body',
    C: 'Chassis',
    U: 'Network Communication',
  };

  const system = systemNames[prefix] || 'Unknown System';
  const firstDigit = code.charAt(1);
  const type = firstDigit === '0' ? 'Generic (SAE)' : 'Manufacturer-Specific';

  return `${system} Code - ${type}. Consult vehicle documentation for details.`;
}

/**
 * Search for codes matching a partial input
 */
export function searchOBDCodes(query: string): Array<{ code: string; description: string }> {
  const normalizedQuery = query.toUpperCase();
  const results: Array<{ code: string; description: string }> = [];

  const allCodes = {
    ...POWERTRAIN_CODES,
    ...BODY_CODES,
    ...CHASSIS_CODES,
    ...NETWORK_CODES,
  };

  for (const [code, description] of Object.entries(allCodes)) {
    if (
      code.includes(normalizedQuery) ||
      description.toLowerCase().includes(query.toLowerCase())
    ) {
      results.push({ code, description });
    }
  }

  return results.slice(0, 10); // Limit results
}
