'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { type Vehicle, VehicleSchema } from '@/schemas/vehicle.schema';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/localStorage';

/**
 * AppContext - Unified Application State
 *
 * Per Architecture document, this is the single context provider for:
 * - Vehicle selection state
 * - Guide execution state (future)
 * - Cache state (future)
 * - Cost tracking state (future)
 *
 * Follows patterns:
 * - Single provider wrapper (no nested provider hell)
 * - Custom hooks for clean component access
 * - localStorage persistence for vehicle state
 */

type AppContextValue = {
  // Vehicle state
  vehicle: {
    selectedVehicle: Vehicle | null;
    isVehicleSelected: boolean;
  };

  // Vehicle actions
  actions: {
    setVehicle: (vehicle: Vehicle) => void;
    clearVehicle: () => void;
  };
};

const AppContext = createContext<AppContextValue | null>(null);

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  // Vehicle state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load vehicle from localStorage on mount
  useEffect(() => {
    const storedVehicle = loadFromStorage(STORAGE_KEYS.CURRENT_VEHICLE, VehicleSchema);
    if (storedVehicle) {
      setSelectedVehicle(storedVehicle);
    }
    setIsInitialized(true);
  }, []);

  // Persist vehicle to localStorage when it changes
  useEffect(() => {
    if (!isInitialized) return;

    if (selectedVehicle) {
      saveToStorage(STORAGE_KEYS.CURRENT_VEHICLE, selectedVehicle);
    }
  }, [selectedVehicle, isInitialized]);

  // Actions
  const setVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

  const clearVehicle = useCallback(() => {
    setSelectedVehicle(null);
    // Clear from localStorage
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_VEHICLE);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const value: AppContextValue = {
    vehicle: {
      selectedVehicle,
      isVehicleSelected: selectedVehicle !== null,
    },
    actions: {
      setVehicle,
      clearVehicle,
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * useAppContext - Access the full context
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);

  if (context === null) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
}

/**
 * useVehicleContext - Access vehicle state only
 */
export function useVehicleContext() {
  const { vehicle, actions } = useAppContext();
  return {
    ...vehicle,
    setVehicle: actions.setVehicle,
    clearVehicle: actions.clearVehicle,
  };
}

/**
 * useAppActions - Access all actions
 */
export function useAppActions() {
  const { actions } = useAppContext();
  return actions;
}
