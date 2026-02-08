'use client';

import { useState, useCallback } from 'react';
import type { OBDCodeEntry } from '@/schemas/obd.schema';

/**
 * useOBDCodes - Hook for managing OBD-II codes
 *
 * Manages a list of OBD codes with add, remove, and clear operations.
 */

type UseOBDCodesReturn = {
  codes: OBDCodeEntry[];
  addCode: (code: OBDCodeEntry) => void;
  removeCode: (code: string) => void;
  clearCodes: () => void;
  hasOBDCodes: boolean;
  getCodesFormatted: () => string;
};

export function useOBDCodes(): UseOBDCodesReturn {
  const [codes, setCodes] = useState<OBDCodeEntry[]>([]);

  const addCode = useCallback((code: OBDCodeEntry) => {
    setCodes((prev) => {
      // Prevent duplicates
      if (prev.some((c) => c.code === code.code)) {
        return prev;
      }
      return [...prev, code];
    });
  }, []);

  const removeCode = useCallback((code: string) => {
    setCodes((prev) => prev.filter((c) => c.code !== code));
  }, []);

  const clearCodes = useCallback(() => {
    setCodes([]);
  }, []);

  const hasOBDCodes = codes.length > 0;

  // Format codes for AI prompt inclusion
  const getCodesFormatted = useCallback(() => {
    if (codes.length === 0) return '';

    return codes
      .map((c) => `${c.code}: ${c.description}`)
      .join('\n');
  }, [codes]);

  return {
    codes,
    addCode,
    removeCode,
    clearCodes,
    hasOBDCodes,
    getCodesFormatted,
  };
}
