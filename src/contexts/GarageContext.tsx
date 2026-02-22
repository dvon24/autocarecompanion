'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useDemoGarage, DemoVehicle, DemoMaintenanceRecord, DemoModification } from '@/hooks/useDemoGarage';

// Re-export types
export type { DemoVehicle as Vehicle, DemoMaintenanceRecord as MaintenanceRecord, DemoModification as Modification };

interface GarageContextType {
  vehicles: DemoVehicle[];
  loading: boolean;
  isDemo: boolean;
  error: string | null;
  addVehicle: (data: Omit<DemoVehicle, 'id' | 'maintenanceRecords' | 'modifications' | 'mileageHistory'>) => Promise<DemoVehicle>;
  getVehicle: (id: string) => DemoVehicle | undefined;
  updateVehicle: (id: string, updates: Partial<DemoVehicle>) => Promise<DemoVehicle | null>;
  deleteVehicle: (id: string) => Promise<boolean>;
  updateMileage: (vehicleId: string, mileage: number) => Promise<boolean>;
  addMaintenanceRecord: (vehicleId: string, record: Omit<DemoMaintenanceRecord, 'id'>) => Promise<DemoMaintenanceRecord | null>;
  addModification: (vehicleId: string, mod: Omit<DemoModification, 'id'>) => Promise<DemoModification | null>;
  refreshVehicles: () => Promise<void>;
}

const GarageContext = createContext<GarageContextType | undefined>(undefined);

interface GarageProviderProps {
  children: ReactNode;
}

export function GarageProvider({ children }: GarageProviderProps) {
  const [useDemoMode, setUseDemoMode] = useState<boolean | null>(null);
  const [apiVehicles, setApiVehicles] = useState<DemoVehicle[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const demoGarage = useDemoGarage();

  // Check if API is available on mount
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        const res = await fetch('/api/vehicles', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          setApiVehicles(data.vehicles || []);
          setUseDemoMode(false);
        } else if (res.status === 401) {
          // Unauthorized - user not logged in, use demo mode
          setUseDemoMode(true);
        } else {
          // API error - use demo mode
          setUseDemoMode(true);
        }
      } catch {
        // Network error or no API - use demo mode
        setUseDemoMode(true);
      } finally {
        setApiLoading(false);
      }
    };

    checkApiAvailability();
  }, []);

  // Refresh vehicles from API
  const refreshVehicles = useCallback(async () => {
    if (useDemoMode) return;

    setApiLoading(true);
    try {
      const res = await fetch('/api/vehicles');
      if (res.ok) {
        const data = await res.json();
        setApiVehicles(data.vehicles || []);
        setApiError(null);
      }
    } catch (error) {
      setApiError('Failed to fetch vehicles');
      console.error('Failed to refresh vehicles:', error);
    } finally {
      setApiLoading(false);
    }
  }, [useDemoMode]);

  // API-based add vehicle - throws on error
  const addVehicleApi = useCallback(async (
    data: Omit<DemoVehicle, 'id' | 'maintenanceRecords' | 'modifications' | 'mileageHistory'>
  ): Promise<DemoVehicle> => {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add vehicle');
    }

    const { vehicle } = await res.json();
    await refreshVehicles();
    return vehicle;
  }, [refreshVehicles]);

  // Demo-based add vehicle
  const addVehicleDemo = useCallback(async (
    data: Omit<DemoVehicle, 'id' | 'maintenanceRecords' | 'modifications' | 'mileageHistory'>
  ): Promise<DemoVehicle> => {
    const newVehicle = demoGarage.addVehicle(data);
    return newVehicle;
  }, [demoGarage]);

  // API-based update vehicle
  const updateVehicleApi = useCallback(async (
    id: string,
    updates: Partial<DemoVehicle>
  ): Promise<DemoVehicle | null> => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const { vehicle } = await res.json();
        await refreshVehicles();
        return vehicle;
      }
      return null;
    } catch {
      return null;
    }
  }, [refreshVehicles]);

  // API-based delete vehicle
  const deleteVehicleApi = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshVehicles();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [refreshVehicles]);

  // API-based update mileage
  const updateMileageApi = useCallback(async (vehicleId: string, mileage: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/mileage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mileage }),
      });

      if (res.ok) {
        await refreshVehicles();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [refreshVehicles]);

  // API-based add maintenance record
  const addMaintenanceRecordApi = useCallback(async (
    vehicleId: string,
    record: Omit<DemoMaintenanceRecord, 'id'>
  ): Promise<DemoMaintenanceRecord | null> => {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, ...record }),
      });

      if (res.ok) {
        const { record: newRecord } = await res.json();
        await refreshVehicles();
        return newRecord;
      }
      return null;
    } catch {
      return null;
    }
  }, [refreshVehicles]);

  // API-based add modification
  const addModificationApi = useCallback(async (
    vehicleId: string,
    mod: Omit<DemoModification, 'id'>
  ): Promise<DemoModification | null> => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/modifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mod),
      });

      if (res.ok) {
        const { modification } = await res.json();
        await refreshVehicles();
        return modification;
      }
      return null;
    } catch {
      return null;
    }
  }, [refreshVehicles]);

  // Determine which mode to use and build context value
  const isDemo = useDemoMode ?? true;
  const vehicles = isDemo ? demoGarage.vehicles : apiVehicles;
  const loading = useDemoMode === null || (isDemo ? demoGarage.loading : apiLoading);

  const value: GarageContextType = {
    vehicles,
    loading,
    isDemo,
    error: apiError,
    addVehicle: isDemo ? addVehicleDemo : addVehicleApi,
    getVehicle: isDemo
      ? demoGarage.getVehicle
      : (id) => apiVehicles.find(v => v.id === id),
    updateVehicle: isDemo
      ? async (id, updates) => demoGarage.updateVehicle(id, updates) || null
      : updateVehicleApi,
    deleteVehicle: isDemo
      ? async (id) => demoGarage.deleteVehicle(id)
      : deleteVehicleApi,
    updateMileage: isDemo
      ? async (vehicleId, mileage) => demoGarage.updateMileage(vehicleId, mileage)
      : updateMileageApi,
    addMaintenanceRecord: isDemo
      ? async (vehicleId, record) => demoGarage.addMaintenanceRecord(vehicleId, record) || null
      : addMaintenanceRecordApi,
    addModification: isDemo
      ? async (vehicleId, mod) => demoGarage.addModification(vehicleId, mod) || null
      : addModificationApi,
    refreshVehicles: isDemo
      ? async () => { /* Demo mode doesn't need refresh */ }
      : refreshVehicles,
  };

  return (
    <GarageContext.Provider value={value}>
      {children}
    </GarageContext.Provider>
  );
}

export function useGarage() {
  const context = useContext(GarageContext);
  if (context === undefined) {
    throw new Error('useGarage must be used within a GarageProvider');
  }
  return context;
}

export default GarageContext;
