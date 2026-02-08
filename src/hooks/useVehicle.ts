'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { type YMMTData, type Vehicle, YMMTDataSchema } from '@/schemas/vehicle.schema';
import { useVehicleContext } from '@/contexts/AppContext';

/**
 * useVehicle Hook - YMMT Selection State Management
 *
 * Manages the cascading dropdown state for Year/Make/Model/Trim selection.
 * Loads YMMT data from static JSON and provides filtered options based on
 * current selections.
 *
 * Follows Architecture patterns:
 * - Async function naming: fetchYMMTData (async)
 * - Sync function naming: getAvailable* (sync filters)
 */

type UseVehicleReturn = {
  // Current selections (null until selected)
  selectedYear: number | null;
  selectedMake: string | null;
  selectedModel: string | null;
  selectedTrim: string | null;

  // Available options based on current selections
  availableYears: number[];
  availableMakes: string[];
  availableModels: string[];
  availableTrims: string[];

  // Selection actions
  setYear: (year: number | null) => void;
  setMake: (make: string | null) => void;
  setModel: (model: string | null) => void;
  setTrim: (trim: string | null) => void;

  // Completion state
  isComplete: boolean;
  confirmVehicle: () => void;

  // Loading state
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

/**
 * Fetch YMMT data from static JSON file
 */
async function fetchYMMTData(): Promise<YMMTData> {
  const response = await fetch('/data/ymmt.json');

  if (!response.ok) {
    throw new Error(`Failed to load YMMT data: ${response.statusText}`);
  }

  const data = await response.json();

  // Validate with Zod schema
  return YMMTDataSchema.parse(data);
}

/**
 * Get years from YMMT data (sorted descending - newest first)
 * Only shows years that have vehicle data available
 */
function getAvailableYears(ymmtData: YMMTData): number[] {
  return Object.keys(ymmtData)
    .map((year) => parseInt(year, 10))
    .sort((a, b) => b - a);
}

/**
 * Get makes for a specific year
 */
function getAvailableMakes(ymmtData: YMMTData, year: number | null): string[] {
  if (!year) return [];

  const yearData = ymmtData[year.toString()];
  if (!yearData) return [];

  return Object.keys(yearData).sort();
}

/**
 * Get models for a specific year and make
 */
function getAvailableModels(
  ymmtData: YMMTData,
  year: number | null,
  make: string | null
): string[] {
  if (!year || !make) return [];

  const yearData = ymmtData[year.toString()];
  if (!yearData) return [];

  const makeData = yearData[make];
  if (!makeData) return [];

  return Object.keys(makeData).sort();
}

/**
 * Get trims for a specific year, make, and model
 */
function getAvailableTrims(
  ymmtData: YMMTData,
  year: number | null,
  make: string | null,
  model: string | null
): string[] {
  if (!year || !make || !model) return [];

  const yearData = ymmtData[year.toString()];
  if (!yearData) return [];

  const makeData = yearData[make];
  if (!makeData) return [];

  const trims = makeData[model];
  if (!trims) return [];

  return [...trims]; // Return copy to prevent mutation
}

export function useVehicle(): UseVehicleReturn {
  // YMMT data state
  const [ymmtData, setYmmtData] = useState<YMMTData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTrim, setSelectedTrim] = useState<string | null>(null);

  // Get vehicle context for persistence
  const { setVehicle } = useVehicleContext();

  // Load YMMT data function (can be called for retry)
  const loadYMMTData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchYMMTData();
      setYmmtData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicle data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load YMMT data on mount
  useEffect(() => {
    loadYMMTData();
  }, [loadYMMTData]);

  // Compute available options based on current selections
  // Years are derived from YMMT data (only shows years with vehicle data)
  const availableYears = useMemo(() => {
    if (!ymmtData) return [];
    return getAvailableYears(ymmtData);
  }, [ymmtData]);

  const availableMakes = useMemo(() => {
    if (!ymmtData) return [];
    return getAvailableMakes(ymmtData, selectedYear);
  }, [ymmtData, selectedYear]);

  const availableModels = useMemo(() => {
    if (!ymmtData) return [];
    return getAvailableModels(ymmtData, selectedYear, selectedMake);
  }, [ymmtData, selectedYear, selectedMake]);

  const availableTrims = useMemo(() => {
    if (!ymmtData) return [];
    return getAvailableTrims(ymmtData, selectedYear, selectedMake, selectedModel);
  }, [ymmtData, selectedYear, selectedMake, selectedModel]);

  // Selection handlers with cascading reset
  const setYear = useCallback((year: number | null) => {
    setSelectedYear(year);
    // Reset downstream selections
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedTrim(null);
  }, []);

  const setMake = useCallback((make: string | null) => {
    setSelectedMake(make);
    // Reset downstream selections
    setSelectedModel(null);
    setSelectedTrim(null);
  }, []);

  const setModel = useCallback((model: string | null) => {
    setSelectedModel(model);
    // Reset downstream selections
    setSelectedTrim(null);
  }, []);

  const setTrim = useCallback((trim: string | null) => {
    setSelectedTrim(trim);
  }, []);

  // Check if selection is complete
  const isComplete = Boolean(
    selectedYear && selectedMake && selectedModel && selectedTrim
  );

  // Confirm vehicle and persist to AppContext
  const confirmVehicle = useCallback(() => {
    if (!isComplete) return;

    const vehicle: Vehicle = {
      year: selectedYear!,
      make: selectedMake!,
      model: selectedModel!,
      trim: selectedTrim!,
    };

    setVehicle(vehicle);
  }, [isComplete, selectedYear, selectedMake, selectedModel, selectedTrim, setVehicle]);

  return {
    // Selections
    selectedYear,
    selectedMake,
    selectedModel,
    selectedTrim,

    // Available options
    availableYears,
    availableMakes,
    availableModels,
    availableTrims,

    // Actions
    setYear,
    setMake,
    setModel,
    setTrim,

    // State
    isComplete,
    confirmVehicle,
    isLoading,
    error,
    retry: loadYMMTData,
  };
}
