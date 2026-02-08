import { z } from 'zod';

/**
 * Vehicle Schema - Zod schemas for vehicle data validation
 *
 * Follows Architecture patterns:
 * - Schema-first architecture with Zod
 * - TypeScript types derived via z.infer<>
 * - Used for localStorage persistence and form validation
 */

// Current year for validation bounds
const currentYear = new Date().getFullYear();

/**
 * Vehicle Schema
 * Represents a complete vehicle selection (Year/Make/Model/Trim)
 */
export const VehicleSchema = z.object({
  year: z.number().min(1990).max(currentYear + 1),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().min(1),
});

export type Vehicle = z.infer<typeof VehicleSchema>;

/**
 * YMMT Data Schema
 * Validates the structure of the ymmt.json data file
 * Structure: { [year]: { [make]: { [model]: [trims] } } }
 */
export const YMMTDataSchema = z.record(
  z.string(), // year (as string key)
  z.record(
    z.string(), // make
    z.record(
      z.string(), // model
      z.array(z.string()) // trims
    )
  )
);

export type YMMTData = z.infer<typeof YMMTDataSchema>;

/**
 * Partial Vehicle Schema for selection state
 * Allows null values during cascading selection process
 */
export const PartialVehicleSchema = z.object({
  year: z.number().nullable(),
  make: z.string().nullable(),
  model: z.string().nullable(),
  trim: z.string().nullable(),
});

export type PartialVehicle = z.infer<typeof PartialVehicleSchema>;

/**
 * Vehicle Display Helper
 * Formats vehicle for compact display (e.g., "2023 Honda Civic EX")
 */
export function formatVehicleDisplay(vehicle: Vehicle): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`;
}

/**
 * Vehicle Short Display Helper
 * Formats vehicle without trim (e.g., "2023 Honda Civic")
 */
export function formatVehicleShort(vehicle: Vehicle): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

/**
 * VIN Schema
 * Validates a 17-character Vehicle Identification Number
 * VINs contain only alphanumeric characters (excluding I, O, Q)
 */
export const VINSchema = z
  .string()
  .length(17, 'VIN must be exactly 17 characters')
  .regex(
    /^[A-HJ-NPR-Z0-9]{17}$/i,
    'VIN can only contain letters (except I, O, Q) and numbers'
  )
  .transform((val) => val.toUpperCase());

export type VIN = z.infer<typeof VINSchema>;

/**
 * NHTSA VIN Decode Response Schema
 * Validates the decoded vehicle data from NHTSA API
 */
export const VINDecodeResultSchema = z.object({
  year: z.number().min(1990).max(currentYear + 1),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().nullable(), // Trim may not always be available from VIN
  possibleTrims: z.array(z.string()).optional(), // When trim is ambiguous
});

export type VINDecodeResult = z.infer<typeof VINDecodeResultSchema>;
