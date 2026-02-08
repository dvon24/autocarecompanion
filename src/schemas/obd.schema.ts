import { z } from 'zod';

/**
 * OBD-II Code Schema
 *
 * Standard OBD-II codes follow format: XNNNN
 * X = System letter (P, B, C, U)
 * N = 4 digit number
 *
 * P = Powertrain (engine, transmission)
 * B = Body (AC, airbags, etc.)
 * C = Chassis (ABS, steering)
 * U = Network (communication)
 */

// OBD code format regex: P0000-P9999, B0000-B9999, C0000-C9999, U0000-U9999
const OBD_CODE_REGEX = /^[PBCU][0-9]{4}$/i;

export const obdCodeSchema = z.string()
  .min(5, 'OBD code must be 5 characters')
  .max(5, 'OBD code must be 5 characters')
  .regex(OBD_CODE_REGEX, 'Invalid OBD code format. Must be P, B, C, or U followed by 4 digits (e.g., P0300)')
  .transform((code) => code.toUpperCase());

export const obdCodeEntrySchema = z.object({
  code: obdCodeSchema,
  description: z.string().optional(),
  addedAt: z.string().datetime().optional(),
});

export const obdCodeListSchema = z.array(obdCodeEntrySchema);

export type OBDCode = z.infer<typeof obdCodeSchema>;
export type OBDCodeEntry = z.infer<typeof obdCodeEntrySchema>;
export type OBDCodeList = z.infer<typeof obdCodeListSchema>;

/**
 * Validate an OBD code string
 */
export function isValidOBDCode(code: string): boolean {
  return OBD_CODE_REGEX.test(code);
}

/**
 * Get the system name for an OBD code prefix
 */
export function getOBDCodeSystem(code: string): string {
  const prefix = code.charAt(0).toUpperCase();
  switch (prefix) {
    case 'P':
      return 'Powertrain';
    case 'B':
      return 'Body';
    case 'C':
      return 'Chassis';
    case 'U':
      return 'Network';
    default:
      return 'Unknown';
  }
}

/**
 * Get the code type (generic vs manufacturer-specific)
 */
export function getOBDCodeType(code: string): 'generic' | 'manufacturer' {
  const firstDigit = code.charAt(1);
  // 0 = SAE/ISO generic, 1+ = manufacturer-specific
  return firstDigit === '0' ? 'generic' : 'manufacturer';
}
