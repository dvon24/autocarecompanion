export interface VisionVehicleInput {
  year?: number | string;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
  drivetrain?: string;
  transmission?: string;
}

/**
 * Serialize only context the caller actually owns. In particular, this helper
 * never selects an engine or transmission from a model-spec list.
 */
export function visionVehicleRequestContext(vehicle?: VisionVehicleInput) {
  if (!vehicle) return undefined;
  return {
    year: Number(vehicle.year) || undefined,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    engine: vehicle.engine,
    drivetrain: vehicle.drivetrain,
    transmission: vehicle.transmission,
  };
}
