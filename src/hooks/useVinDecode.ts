'use client';

import { useState, useCallback } from 'react';
import { VINSchema, type VINDecodeResult } from '@/schemas/vehicle.schema';
import { useVehicleContext } from '@/contexts/AppContext';

/**
 * useVinDecode Hook - VIN Decode State Management
 *
 * Manages VIN input, validation, and API decode flow.
 * Follows Architecture patterns:
 * - Async function naming: decodeVin (async API call)
 * - Sync function naming: validateVin (sync validation)
 */

type DecodeStatus = 'idle' | 'validating' | 'decoding' | 'success' | 'error';

type UseVinDecodeReturn = {
  // Input state
  vin: string;
  setVin: (vin: string) => void;

  // Validation
  validationError: string | null;
  isValidVin: boolean;

  // Decode state
  status: DecodeStatus;
  decodedVehicle: VINDecodeResult | null;
  decodeError: string | null;

  // Actions
  decodeVin: () => Promise<void>;
  confirmVehicle: () => void;
  reset: () => void;

  // Trim selection (when ambiguous)
  needsTrimSelection: boolean;
  selectTrim: (trim: string) => void;
};

/**
 * Validate VIN format client-side
 */
function validateVin(vin: string): { valid: boolean; error: string | null } {
  if (vin.length === 0) {
    return { valid: false, error: null };
  }

  if (vin.length < 17) {
    return { valid: false, error: `VIN must be 17 characters (${vin.length}/17)` };
  }

  if (vin.length > 17) {
    return { valid: false, error: 'VIN must be exactly 17 characters' };
  }

  const result = VINSchema.safeParse(vin);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message || 'Invalid VIN format',
    };
  }

  return { valid: true, error: null };
}

export function useVinDecode(): UseVinDecodeReturn {
  // Input state
  const [vin, setVinInternal] = useState('');

  // Validation state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidVin, setIsValidVin] = useState(false);

  // Decode state
  const [status, setStatus] = useState<DecodeStatus>('idle');
  const [decodedVehicle, setDecodedVehicle] = useState<VINDecodeResult | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // Trim selection state (when VIN decode returns ambiguous trim)
  const [selectedTrim, setSelectedTrim] = useState<string | null>(null);

  // Get vehicle context for persistence
  const { setVehicle } = useVehicleContext();

  // Handle VIN input with validation
  const setVin = useCallback((value: string) => {
    // Filter to alphanumeric only and uppercase
    const filtered = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setVinInternal(filtered);

    // Validate
    const { valid, error } = validateVin(filtered);
    setIsValidVin(valid);
    setValidationError(error);

    // Reset decode state on input change
    if (status !== 'idle') {
      setStatus('idle');
      setDecodedVehicle(null);
      setDecodeError(null);
      setSelectedTrim(null);
    }
  }, [status]);

  // Decode VIN via API
  const decodeVin = useCallback(async () => {
    if (!isValidVin) return;

    setStatus('decoding');
    setDecodeError(null);
    setDecodedVehicle(null);
    setSelectedTrim(null);

    try {
      const response = await fetch('/api/vin/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setDecodeError(data.error || 'Failed to decode VIN');
        return;
      }

      if (data.success && data.vehicle) {
        setDecodedVehicle(data.vehicle);
        setStatus('success');

        // If trim is already known, auto-select it
        if (data.vehicle.trim) {
          setSelectedTrim(data.vehicle.trim);
        }
      } else {
        setStatus('error');
        setDecodeError('No vehicle data returned');
      }
    } catch (error) {
      setStatus('error');
      setDecodeError(
        error instanceof Error ? error.message : 'Network error. Please try again.'
      );
    }
  }, [vin, isValidVin]);

  // Select trim when multiple options exist
  const selectTrim = useCallback((trim: string) => {
    setSelectedTrim(trim);
  }, []);

  // Confirm vehicle and persist to AppContext
  const confirmVehicle = useCallback(() => {
    if (!decodedVehicle) return;

    const trimToUse = selectedTrim || decodedVehicle.trim;
    if (!trimToUse) return; // Need trim to confirm

    setVehicle({
      year: decodedVehicle.year,
      make: decodedVehicle.make,
      model: decodedVehicle.model,
      trim: trimToUse,
    });
  }, [decodedVehicle, selectedTrim, setVehicle]);

  // Reset all state
  const reset = useCallback(() => {
    setVinInternal('');
    setValidationError(null);
    setIsValidVin(false);
    setStatus('idle');
    setDecodedVehicle(null);
    setDecodeError(null);
    setSelectedTrim(null);
  }, []);

  // Check if trim selection is needed
  const needsTrimSelection =
    status === 'success' &&
    decodedVehicle !== null &&
    !decodedVehicle.trim &&
    !selectedTrim;

  return {
    // Input
    vin,
    setVin,

    // Validation
    validationError,
    isValidVin,

    // Decode
    status,
    decodedVehicle,
    decodeError,

    // Actions
    decodeVin,
    confirmVehicle,
    reset,

    // Trim selection
    needsTrimSelection,
    selectTrim,
  };
}
